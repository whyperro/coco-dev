import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
      mutationFn: async (values: {
        ticket_price: number,
        fee: number,
        total: number,
        rate: number,
        total_bs : number,
        payment_ref: string,
        payment_method: string,
        ticketId: string,
        registered_by: string,
        transaction_date: Date
      }) => {
          const res = await axios.post(`/api/transactions`, {
              ...values
          });
          return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("¡Creado!", {
        description: "¡La transacción ha sido creada correctamente!",
        dismissible: true,
      })
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
