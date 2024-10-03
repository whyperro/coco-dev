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

export const useGetAnalitics = (username: string | null) =>  {
  // Get the search parameters from the URL
  const params = useSearchParams();

  // Extract 'from' and 'to' query parameters, default to an empty string if not provided
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  // Set up the query with react-query's useQuery
  const analiticsQuery = useQuery({
    // Unique query key, using 'from' and 'to' ensures the query refetches if the parameters change
    queryKey: ["transactionsAnalitics", from, to],

    // Function that performs the API request
    queryFn: async () => {
      // Make a GET request to the /api/summary endpoint with from and to parameters
      const { data } = await axios.get(`/api/summary/${username}`, {
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

    // Optional: retry in case of failure, and cache the result for 5 minutes (staleTime)
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: 3, // Retry failed queries up to 3 times
    enabled: !!username
  });

  // Return the query data, loading status, and error state
  return {
    data: analiticsQuery.data,      // The fetched data, including totals and ticket counts
    loading: analiticsQuery.isLoading, // Loading state
    error: analiticsQuery.isError ? analiticsQuery.error : null, // Error handling
  };
};
