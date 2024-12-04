import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useCreateTransaction = () => {
  const createMutation = useMutation({
      mutationFn: async (values: {
        payment_ref?: string,
        image_ref: string,
        payment_method: string,
        ticketId: string,
        registered_by: string,
        updated_by: string,
        transaction_date: Date
      }) => {
          const res = await axios.post(`/api/transactions`, {
            ...values
          });
          return res
    },
    onError: (error: Error) => {
      toast.error("Oops!", {
        description: `¡Hubo un error al crear la transacción!: ${error}`,
      });
    },
  });

  return {
    createTransaction: createMutation
  };
};
