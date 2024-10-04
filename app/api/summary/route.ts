import { NextResponse } from "next/server";
import { parse, subDays, eachDayOfInterval, format } from "date-fns";
import db from "@/lib/db";

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

    // Fetch all transactions within the date range
    const transactions = await db.transaction.findMany({
      where: {
        transaction_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        transaction_date: true,
        total: true,
        ticketId: true, // Include ticketId to link transactions to branches
      },
    });


    // Fetch related tickets to get the branchId and branchName
    const tickets = await db.ticket.findMany({
      where: {
        id: { in: transactions.map(t => t.ticketId) }
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
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const pendingCount = await db.ticket.count({
      where: {
        status: "PENDIENTE"
      }
    })

    // Step 1: Generate the full date range
    const dateRange = generateDateRange(startDate, endDate);

    // Step 2: Initialize an object to store transactions grouped by branch and date
    const branchTransactions: { [key: string]: { branchName: string, transactions: TransactionByBranch[] } } = {};

    // Step 3: Process transactions to calculate total amounts per branch and date
    transactions.forEach(transaction => {
      const ticket = tickets.find(t => t.id === transaction.ticketId); // Find the corresponding ticket to get the branchId
      const branchId = ticket ? ticket.branchId : 'unknown'; // Get the branch ID from the ticket
      const branchName = ticket?.branch?.location_name || 'Unknown Branch'; // Get the branch name

      const formattedDate = format(transaction.transaction_date, "yyyy-MM-dd");

      if (!branchTransactions[branchId]) {
        branchTransactions[branchId] = { branchName, transactions: [] };
      }

      const existingTransaction = branchTransactions[branchId].transactions.find(item => item.date === formattedDate);
      if (existingTransaction) {
        existingTransaction.amount += transaction.total || 0; // Add to existing amount
      } else {
        branchTransactions[branchId].transactions.push({
          date: formattedDate,
          amount: transaction.total || 0, // Use transaction total or 0
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
    const totalAmount = transactions.reduce((sum, t) => sum + (t.total || 0), 0);



    const branchData: { [key: string]: number } = {};
    transactions.forEach(transaction => {
      const ticket = tickets.find(t => t.id === transaction.ticketId);
      const branch = ticket ? ticket.branch.location_name : 'unknown';

      if (!branchData[branch]) {
        branchData[branch] = 0;
      }
      branchData[branch] += transaction.total || 0; // Accumulate amounts per branch
    });

    // Format data for the Pie chart
    const branches: BranchData[] = Object.keys(branchData).map(branch => ({
      name: branch,
      amount: branchData[branch],
    }));

    // Return the JSON response
    const response: SummaryResponse = {
      total_amount: totalAmount, // Total transaction amount
      transactionsByBranch: filledData, // Data for each branch
      ticketCount, // Number of tickets in the date range
      branches,
      pendingCount
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
