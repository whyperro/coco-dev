import { Client } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useGetClients = () => {
  const branchesQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data} = await axios.get('/api/clients'); // Adjust the endpoint as needed
      return data as Client[];
    }
  });
  return {
    data: branchesQuery.data,
    loading: branchesQuery.isLoading,
    error: branchesQuery.isError // Function to call the query
  };
};

export const useGetClient = (id: string | null) => {
    const clientQuery = useQuery({
      queryKey: ["client"],
      queryFn: async () => {
        const {data} = await axios.get(`/api/clients/${id}`); // Adjust the endpoint as needed
        return data as Client;
      },
      enabled: !!id
    });
    return {
      data: clientQuery.data,
      loading: clientQuery.isLoading,
      error: clientQuery.isError // Function to call the query
    };
  };

export const useCreateClient = () => {
    const queryClient = useQueryClient();
    const createMutation = useMutation({
      mutationFn: async (values: {           // ID of the branch to be updated
        first_name: string;    // New location name
        last_name: string;    // New location name
        dni: string;    // New location name
        email: string | null;
        phone_number: string | null ;
      }) => {
        await axios.post(`/api/clients`, {
          ...values
        });
      },
      onSuccess: () => {
        // Invalidate the 'branches' query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        toast.success("¡Creado!", {
          description: "¡El Cliente ha sido creada correctamente!",
          dismissible: true,
        })
      },
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al crear el cliente!: ${error}`,
        });
      },
    });

    return {
      createClient: createMutation, // Function to call the mutation
    };
  };

  export const useUpdateClient = () => {

    const queryClient = useQueryClient();

    const updateMutation = useMutation({
      mutationFn: async (values: {
        id: string;
        first_name: string;    // New location name
        last_name: string;    // New location name
        dni: string;   // New fiscal address
        email: string | null;
        phone_number: string | null ;
        updated_by: string;
      }) => {
        await await axios.patch(`/api/clients/${values.id}`, {
            ...values
        });
      },
      onSuccess: () => {
        // Invalidate the 'branches' query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        toast.success("¡Actualizado!", {
          description: "¡El Cliente ha sido creada correctamente!",
        });
      },
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al actualizar el cliente!: ${error}`,
        });
      },
    });

    return {
      updateClient: updateMutation, // Function to call the mutation
    };
  };

  export const useDeleteClient = () => {

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        await axios.delete(`/api/clients/${id}`); // Include ID in the URL
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        toast.success("¡Eliminado!", {
          description: "¡La cliente ha sido eliminada correctamente!"
        });
      },
      onError: () => {
        toast.error("Oops!", {
          description: "¡Hubo un error al eliminar la cliente!"
        });
      },
    });

    return {
      deleteClient: deleteMutation,
    };
  };
