'use client';

import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export type BranchTransaction = {
  branchId: string;
  data: {
    date: string;
    amount: number;
  }[];
};

export const useGetSummary = () => {
  // Get the search parameters from the URL
  const params = useSearchParams();

  // Extract 'from' and 'to' query parameters, default to an empty string if not provided
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  // Set up the query with react-query's useQuery
  const summaryQuery = useQuery({
    // Unique query key, using 'from' and 'to' ensures the query refetches if the parameters change
    queryKey: ["transactionsSummary", from, to],

    // Function that performs the API request
    queryFn: async () => {
      // Make a GET request to the /api/summary endpoint with from and to parameters
      const { data } = await axios.get('/api/summary', {
        params: {
          from, // Send the 'from' date to the server
          to,   // Send the 'to' date to the server
        },
      });

      // Convert the total_amount and transaction totals from miliunits to the desired format
      return {
        ...data,
        total_amount: convertAmountFromMiliunits(data.total_amount), // Convert total amount
        transactionsByBranch: data.transactionsByBranch.map((branchData: BranchTransaction) => ({
          ...branchData,
          data: branchData.data.map((transaction) => ({
            ...transaction,
            amount: convertAmountFromMiliunits(transaction.amount) // Convert transaction total
          }))
        })),
      };
    },
    retry: 3, // Retry failed queries up to 3 times
  });

  // Return the query data, loading status, and error state
  return {
    data: summaryQuery.data,      // The fetched data, including totals and ticket counts
    loading: summaryQuery.isLoading, // Loading state
    error: summaryQuery.isError ? summaryQuery.error : null, // Error handling
  };
};
