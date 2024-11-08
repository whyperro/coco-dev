import { NextResponse } from "next/server";
import { parse, subDays, eachDayOfInterval, format, differenceInDays } from "date-fns";
import db from "@/lib/db";
import { calculatePercentageChange } from "@/lib/utils";

export const dynamic = 'force-dynamic';


// Helper function to generate an array of dates
const generateDateRange = (start: Date, end: Date): string[] => {
  return eachDayOfInterval({ start, end }).map(date => format(date, "yyyy-MM-dd"));
};

// Define TypeScript types for the response
interface TransactionByBranch {
  date: string;
  amount: number;
}

interface BranchTransactions {
  branchId: string;
  branchName: string; // Added branchName
  data: TransactionByBranch[];
}

interface BranchData {
  name: string;
  amount: number;
}

interface SummaryResponse {
  total_amount: number;
  transactionsByBranch: BranchTransactions[];
  ticketCount: number
  branches: BranchData[],
  pendingCount: number,
  paidCount: number
  incomeChange: number,
  paidTicketChange: number,
  pendingTicketChange: number,
}

// Define your GET method handler
export async function GET(request: Request) {
  try {
    // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    // Set default date range (last 30 days if not provided)
    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;
    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;


    const periodLength = differenceInDays(endDate, startDate) + 1;

    const lastPeriodStart = subDays(startDate,periodLength);
    const lastPeriodEnd = subDays(endDate,periodLength);

    // Fetch all transactions within the date range
    const currentTransactions = await db.transaction.findMany({
      where: {
        transaction_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        transaction_date: true,
        ticketId: true, // Include ticketId to link transactions to branches
        ticket: {
          select: {
            total: true, // Select the total from the ticket
          },
        },
      },
    });

    const lastTransactions = await db.transaction.findMany({
      where: {
        transaction_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        transaction_date: true,
        ticketId: true, // Include ticketId to link transactions to branches
        ticket: {
          select: {
            total: true, // Select the total from the ticket
          },
        },
      },
    });


    // Fetch related tickets to get the branchId and branchName
    const tickets = await db.ticket.findMany({
      where: {
        id: { in: currentTransactions.map(t => t.ticketId) }
      },
      select: {
        id: true,
        branchId: true,
        branch: {
          select: {
            location_name: true // Select the branch name
          }
        }
      }
    });

    // Count the number of tickets
    const ticketCount = await db.ticket.count({
      where: {
        statusUpdatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const pendingCount = await db.ticket.count({
      where: {
        status: "PENDIENTE",
        statusUpdatedAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    })

    const paidCount = await db.ticket.count({
      where: {
        status: "PAGADO",
        statusUpdatedAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    })

    const lastTicketCount = await db.ticket.count({
      where: {
        statusUpdatedAt: {
          gte: lastPeriodStart,
          lte: lastPeriodEnd,
        },
      },
    });

    const lastPendingCount = await db.ticket.count({
      where: {
        status: "PENDIENTE",
        statusUpdatedAt: {
          gte: lastPeriodStart,
          lte: lastPeriodEnd,
        },
      }
    })

    const lastPaidCount = await db.ticket.count({
      where: {
        status: "PAGADO",
        statusUpdatedAt: {
          gte: lastPeriodStart,
          lte: lastPeriodEnd,
        },
      }
    })

    // Step 1: Generate the full date range
    const dateRange = generateDateRange(startDate, endDate);

    // Step 2: Initialize an object to store transactions grouped by branch and date
    const branchTransactions: { [key: string]: { branchName: string, transactions: TransactionByBranch[] } } = {};

    // Step 3: Process transactions to calculate total amounts per branch and date
    currentTransactions.forEach(transaction => {
      const ticket = tickets.find(t => t.id === transaction.ticketId); // Find the corresponding ticket to get the branchId
      const branchId = ticket ? ticket.branchId : 'unknown'; // Get the branch ID from the ticket
      const branchName = ticket?.branch?.location_name || 'Unknown Branch'; // Get the branch name

      const formattedDate = format(transaction.transaction_date, "yyyy-MM-dd");

      if (!branchTransactions[branchId]) {
        branchTransactions[branchId] = { branchName, transactions: [] };
      }

      const existingTransaction = branchTransactions[branchId].transactions.find(item => item.date === formattedDate);
      if (existingTransaction) {
        existingTransaction.amount += transaction.ticket.total || 0; // Add to existing amount
      } else {
        branchTransactions[branchId].transactions.push({
          date: formattedDate,
          amount: transaction.ticket.total || 0, // Use transaction total or 0
        });
      }
    });

    // Step 4: Fill in missing dates for each branch
    const filledData: BranchTransactions[] = Object.keys(branchTransactions).map(branchId => {
      const { branchName, transactions } = branchTransactions[branchId];

      const filledBranchData = dateRange.map(date => {
        const transaction = transactions.find(item => item.date === date);
        return {
          date,
          amount: transaction ? transaction.amount : 0, // Use transaction total or 0
        };
      });

      return {
        branchId,
        branchName, // Include branchName in the response
        data: filledBranchData,
      };
    });

    // Aggregate total amount across all transactions
    const totalCurrentAmount = currentTransactions.reduce((sum, t) => sum + (t.ticket.total || 0), 0);
    const totalLastAmount = lastTransactions.reduce((sum, t) => sum + (t.ticket.total || 0), 0);

    const incomeChange = calculatePercentageChange(totalCurrentAmount, totalLastAmount)
    const paidTicketChange = calculatePercentageChange(paidCount, lastPaidCount)
    const pendingTicketChange = calculatePercentageChange(pendingCount, lastPendingCount)

    const branchData: { [key: string]: number } = {};
    currentTransactions.forEach(transaction => {
      const ticket = tickets.find(t => t.id === transaction.ticketId);
      const branch = ticket ? ticket.branch.location_name : 'unknown';

      if (!branchData[branch]) {
        branchData[branch] = 0;
      }
      branchData[branch] += transaction.ticket.total || 0; // Accumulate amounts per branch
    });

    // Format data for the Pie chart
    const branches: BranchData[] = Object.keys(branchData).map(branch => ({
      name: branch,
      amount: branchData[branch],
    }));

    // Return the JSON response
    const response: SummaryResponse = {
      total_amount: totalCurrentAmount, // Total transaction amount
      incomeChange: incomeChange,
      paidTicketChange: paidTicketChange,
      pendingTicketChange: pendingTicketChange,
      transactionsByBranch: filledData, // Data for each branch
      ticketCount, // Number of tickets in the date range
      branches,
      pendingCount,
      paidCount
    };
    console.log(response)
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    return NextResponse.json(
      {
        message: "Error fetching transaction summary.",
      },
      { status: 500 }
    );
  }
}
