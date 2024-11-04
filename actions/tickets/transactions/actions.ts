import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useUpdateStatusTicket = () => {

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: {
      id: string,
      status: string,
      void_description?: "CancelledByClient" | "WrongSellerInput" | "WrongClientInfo",
      updated_by: string,
    }) => {
      await axios.patch(`/api/tickets/transaction/${values.id}`, {
        status: values.status,
        updated_by: values.updated_by,
        void_description: values.void_description ?? null,
      });
    },
    onSuccess: async() => {
      await queryClient.invalidateQueries({ queryKey: ["pending-tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["paid-tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      await queryClient.refetchQueries({ queryKey: ["pending-tickets"] })
    },
    onError: (error: Error) => {
      toast.error("Oops!", {
        description: `¡Hubo un error al pagar el boleto!: ${error}`,
      });
    },
  });

  return {
    updateStatusTicket: updateMutation, // Function to call the mutation
  };
};
