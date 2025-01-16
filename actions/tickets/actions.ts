import axiosNoCache from "@/lib/axios";
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
  });
  return {
    data: ticketQuery.data,
    loading: ticketQuery.isLoading,
    error: ticketQuery.isError ? ticketQuery.error : null, // Improved error handling
  };
};

export const useGetPendingTickets = (username:string | null) => {
  const pendingQuery = useQuery({
    queryKey: ["pending"],
    queryFn: async () => {
      const {data} = await axios.get(`/api/tickets/pending/${username}`); // `/api/tickets/${ticket_number}`
      return data as Ticket[];
    },
    enabled:!!username
  });
  return {
    data: pendingQuery.data,
    loading: pendingQuery.isLoading,
    error: pendingQuery.isError // Function to call the query
  };
};

export const useGetPaidTickets = (username:string | null) => {
  const paidQuery = useQuery({
    queryKey: ["paid"], // Updated to reflect flight type
    queryFn: async () => {
      const {data} = await axios.get(`/api/tickets/paid/${username}`);
      return data as Ticket[];
    },
    enabled:!!username
  });
  return {
    data: paidQuery.data,
    loading: paidQuery.isLoading,
    error: paidQuery.isError ? paidQuery.error : null, // Improved error handling
  };
};

export const useGetCancelledTickets = (username:string | null) => {
  const ticketsQuery = useQuery({
    queryKey: ["cancelled"], // Updated to reflect flight type
    queryFn: async () => {
      const {data} = await axios.get(`/api/tickets/cancelled/${username}`);
      return data as Ticket[];
    },
    enabled:!!username
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
          ticket_number?: string
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
          const res = await axios.post(`/api/tickets`, {
              ...values
          });

          return res
      },
      onSuccess: async () => {
        // Invalidate the 'branches' query to refresh the data
        await queryClient.invalidateQueries({ queryKey: ["pending"] });
        await queryClient.invalidateQueries({ queryKey: ["transactionsAnalitics"] });
        await queryClient.invalidateQueries({ queryKey: ["transactionsSummary"] });
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

  export const useDeleteTicket = () => {

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        await axios.delete(`/api/tickets/delete/${id}`); // Include ID in the URL
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cancelled"] });
        toast.success("¡Eliminado!", {
          description: "¡El boleto ha sido eliminada correctamente!"
        });
      },
      onError: () => {
        toast.error("Oops!", {
          description: "¡Hubo un error al eliminar el boleto!"
        });
      },
    });

    return {
      deleteTicket: deleteMutation,
    };
  };

  export const useUpdatePassenger = () => {
    const queryClient = useQueryClient();
  
    const updateMutation = useMutation({
      mutationFn: async (values: {
        passengerId: string; // ID del pasajero a actualizar
        first_name: string; // Nombre del pasajero
        last_name: string; // Apellido del pasajero
        dni_type: string; // Tipo de documento (e.g., "V", "E", etc.)
        dni_number: string; // Número de documento
        phone_number?: string; // Número de teléfono (opcional)
        email?: string; // Correo electrónico (opcional)
        updated_by: string; // Usuario que realiza la actualización
      }) => {
        // Realiza una solicitud PUT o PATCH para actualizar los datos del pasajero
        const res = await axios.put(`/api/passengers/${values.passengerId}`, {
          first_name: values.first_name,
          last_name: values.last_name,
          dni_type: values.dni_type,
          dni_number: values.dni_number,
          phone_number: values.phone_number,
          email: values.email,
          updated_by: values.updated_by, // Campo adicional que puedes usar en tu lógica
        });
  
        return res.data; // Retorna los datos de la respuesta
      },
      onSuccess: async () => {
        // Invalida consultas relacionadas con pasajeros para refrescar la cache
        await queryClient.invalidateQueries({ queryKey: ["passenger"] });
        toast.success("¡Actualizado!", {
          description: "¡La información del pasajero se actualizó correctamente!",
          dismissible: true,
        });
      },
      onError: (error: any) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al actualizar los datos del pasajero!: ${error?.response?.data?.message || error.message}`,
        });
      },
    });
  
    return {
      updatePassenger: updateMutation, // Retorna la mutación para ser utilizada
    };
  };