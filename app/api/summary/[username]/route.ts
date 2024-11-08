import { NextResponse } from "next/server";
import { parse, subDays, eachDayOfInterval, format, differenceInDays } from "date-fns";
import db from "@/lib/db";
import { calculatePercentageChange } from "@/lib/utils";

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

interface PieData {
  name: string;
  amount: number;
}

interface SummaryResponse {
  total_amount: number;
  transactionsByBranch: BranchTransactions[];
  ticketCount: number
  chartPie: PieData[],
  currentPendingCount: number,
  currentPaidCount: number,
  pendingTicketChange: number,
  paidTicketChange: number,
  incomeChange: number,
}

// Define your GET method handler
export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const { username } = params;
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
        ticket:{
          registered_by:username,
        }
        //
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
    const currentTickets = await db.ticket.findMany({
      where: {
        id: { in: currentTransactions.map(t => t.ticketId) },
        // issued_by: username
        registered_by:username,

      },
      select: {
        id: true,
        passanger: {
            select: {
                client: true
            }
        },
        branchId: true,
        branch: {
          select: {
            location_name: true // Select the branch name
          }
        }
      }
    });

    const lastTickets = await db.ticket.findMany({
      where: {
        id: { in: currentTransactions.map(t => t.ticketId) },
        // issued_by: username
        registered_by:username,
        statusUpdatedAt: {
          gte:lastPeriodStart,
          lte: lastPeriodEnd
        }
      },
      select: {
        id: true,
        passanger: {
            select: {
                client: true
            }
        },
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
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        registered_by: username
      },
    });

    const currentPendingCount = await db.ticket.count({
      where: {
        status: "PENDIENTE",
        registered_by:username,
        statusUpdatedAt: {
          gte: lastPeriodStart,
          lte: lastPeriodEnd
        }
      }
    })

    const currentPaidCount = await db.ticket.count({
      where: {
        status: "PAGADO",
        registered_by:username,
        statusUpdatedAt: {
          gte:lastPeriodStart,
          lte: lastPeriodEnd
        }
      }
    })

    const lastPendingCount = await db.ticket.count({
      where: {
        status: "PENDIENTE",
        registered_by:username,
        statusUpdatedAt: {
          gte:lastPeriodStart,
          lte: lastPeriodEnd
        }
      }
    })

    const lastPaidCount = await db.ticket.count({
      where: {
        status: "PAGADO",
        registered_by:username,
        statusUpdatedAt: {
          gte:lastPeriodStart,
          lte: lastPeriodEnd
        }
      }
    })



    // 1: Generate the full date range
    const dateRange = generateDateRange(startDate, endDate);

    // 2: Initialize an object to store transactions grouped by branch and date
    const branchTransactions: { [key: string]: { branchName: string, transactions: TransactionByBranch[] } } = {};

    // 3: Process transactions to calculate total amounts per branch and date
    currentTransactions.forEach(transaction => {
      const ticket = currentTickets.find(t => t.id === transaction.ticketId); // Find the corresponding ticket to get the branchId
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

    // 4: Fill in missing dates for each branch
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
    const currentTotalAmount = currentTransactions.reduce((sum, t) => sum + (t.ticket.total || 0), 0);
    const lastTotalAmount = currentTransactions.reduce((sum, t) => sum + (t.ticket.total || 0), 0);


    const incomeChange = calculatePercentageChange(currentTotalAmount, lastTotalAmount);
    const pendingTicketChange = calculatePercentageChange(currentPendingCount, lastPendingCount);
    const paidTicketChange = calculatePercentageChange(currentPaidCount, lastPaidCount);


    const pieData: { [key: string]: number } = {};
    currentTransactions.forEach(transaction => {
      const ticket = currentTickets.find(t => t.id === transaction.ticketId);
      const client = ticket ? `${ticket.passanger.client.first_name} ${ticket.passanger.client.last_name}` : 'unknown';

      if (!pieData[client]) {
        pieData[client] = 0;
      }
      pieData[client] += transaction.ticket.total || 0; // Accumulate amounts per branch
    });

    // Format data for the Pie chart
    const chartPie: PieData[] = Object.keys(pieData).map(client => ({
      name: client,
      amount: pieData[client],
    }));

    // Return the JSON response
    const response: SummaryResponse = {
      total_amount: currentTotalAmount, // Total transaction amount
      transactionsByBranch: filledData, // Data for each branch
      ticketCount, // Number of tickets in the date range
      chartPie,
      currentPendingCount,
      currentPaidCount,
      pendingTicketChange,
      paidTicketChange,
      incomeChange,
    };

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
