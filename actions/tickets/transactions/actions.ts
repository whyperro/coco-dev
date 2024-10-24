import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useUpdateStatusTicket = () => {

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: {
      id: string,
      status: string,
      registered_by: string,
    }) => {
      await axios.patch(`/api/tickets/transaction/${values.id}`, {
        status: values.status,
        registered_by: values.registered_by
      });
    },
    onSuccess: async() => {
      // Invalidate the 'branches' query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["pending-tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["paid-tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
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
