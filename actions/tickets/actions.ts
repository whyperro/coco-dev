import { Ticket } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useGetTicket = (ticket_number: string) => {
  const ticketQuery = useQuery({
    queryKey: ["ticket"], // Updated to reflect flight type
    queryFn: async () => {
      const {data} = await axios.get(`/api/tickets/${ticket_number}`);
      return data as Ticket;
    },
    // Optional: you can set retry and staleTime here
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  return {
    data: ticketQuery.data,
    loading: ticketQuery.isLoading,
    error: ticketQuery.isError ? ticketQuery.error : null, // Improved error handling
  };
};

export const useGetPendingTickets = () => {
  const ticketsQuery = useQuery({
    queryKey: ["pending-tickets"], // Updated to reflect flight type
    queryFn: async () => {
      const {data} = await axios.get('/api/tickets/pending');
      return data as Ticket[];
    },
    // Optional: you can set retry and staleTime here
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    data: ticketsQuery.data,
    loading: ticketsQuery.isLoading,
    error: ticketsQuery.isError ? ticketsQuery.error : null, // Improved error handling
  };
};

export const useGetPaidTickets = () => {
  const ticketsQuery = useQuery({
    queryKey: ["paid-tickets"], // Updated to reflect flight type
    queryFn: async () => {
      const {data} = await axios.get('/api/tickets/paid');
      return data as Ticket[];
    },
    // Optional: you can set retry and staleTime here
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    data: ticketsQuery.data,
    loading: ticketsQuery.isLoading,
    error: ticketsQuery.isError ? ticketsQuery.error : null, // Improved error handling
  };
};

export const useGetCancelledTickets = () => {
  const ticketsQuery = useQuery({
    queryKey: ["cancelled-tickets"], // Updated to reflect flight type
    queryFn: async () => {
      const {data} = await axios.get('/api/tickets/cancelled');
      return data as Ticket[];
    },
    // Optional: you can set retry and staleTime here
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    data: ticketsQuery.data,
    loading: ticketsQuery.isLoading,
    error: ticketsQuery.isError ? ticketsQuery.error : null, // Improved error handling
  };
};

export const useGetPaidTicketsReport = () => {

  const ticketsQuery = useQuery({
    queryKey: ["paid-tickets"], // Updated to reflect flight type
    queryFn: async () => {
      const {data} = await axios.get('/api/tickets/paid');
      return data as Ticket[];
    },
    // Optional: you can set retry and staleTime here
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    data: ticketsQuery.data,
    error: ticketsQuery.isError ? ticketsQuery.error : null, // Improved error handling

  };
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (values: {           // ID of the branch to be updated
          ticket_number: string
          purchase_date: string,
          flight_date: string,
          booking_ref: string,
          status: "PENDIENTE" | "PAGADO"
          ticket_type: string,
          doc_order : boolean,
          description: string,
          registered_by: string,
          issued_by:string,
          served_by :string,

          ticket_price: number
          fee: number
          total: number
          rate: number
          total_bs: number

          passangerId: string,
          branchId:string,
          providerId: string,
          routes:string[]
        }) => {
          await axios.post(`/api/tickets`, {
              ...values
          });
      },
      onSuccess: async() => {
        // Invalidate the 'branches' query to refresh the data
        await queryClient.invalidateQueries({ queryKey: ["pending-tickets"] });
        await queryClient.invalidateQueries({ queryKey: ["tickets"] });
        await queryClient.invalidateQueries({ queryKey: ["paid-tickets"] });
        toast.success("¡Creado!", {
          description: "¡El ticket ha sido creada correctamente!",
          dismissible: true,
        })
      },
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al crear el ticket!: ${error}`,
        });
      },
    });

    return {
      createTicket: createMutation, // Function to call the mutation
    };
  };
