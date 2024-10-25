import { Provider } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useGetProviders = () => {
    const providersQuery = useQuery({
      queryKey: ["providers"],
      queryFn: async () => {
        const {data} = await axios.get('/api/providers'); // Adjust the endpoint as needed
        return data as Provider[];
      }
    });
    return {
      data: providersQuery.data,
      loading: providersQuery.isLoading,
      error: providersQuery.isError // Function to call the query
    };
  };

  export const useGetProvider = (id: string | null) => {
    const providerQuery = useQuery({
      queryKey: ["provider"],
      queryFn: async () => {
        const {data} = await axios.get(`/api/providers/${id}`); // Adjust the endpoint as needed
        return data as Provider;
      },
      enabled: !!id
    });
    return {
      data: providerQuery.data,
      loading: providerQuery.isLoading,
      error: providerQuery.isError // Function to call the query
    };
  };

  export const useCreateProvider = () => {
    const queryClient = useQueryClient();
    const createMutation = useMutation({
      mutationFn: async (values: {           // ID of the branch to be updated
        provider_number: string,
        name:string,
        provider_type: string, // New location name
      }) => {
        await axios.post(`/api/providers`, {
          ...values
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["providers"] });
        toast.success("¡Creado!", {
          description: "¡El proveedor ha sido creado correctamente!",
          dismissible: true,
        })
      },
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al crear el proveedor!: ${error}`,
        });
      },
    });
  
    return {
      createProvider: createMutation, // Function to call the mutation
    };
  };

  export const useUpdateProvider = () => {

    const queryClient = useQueryClient();
  
    const updateMutation = useMutation({
      mutationFn: async (values: {
        id: string
        provider_number: string,
        name: string,
        provider_type: string,
      }) => {
        await axios.patch(`/api/providers/${values.id}`, {
          provider_number: values.provider_number,
          name: values.name,
          provider_type: values.provider_type,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["providers"] });
        toast.success("¡Actualizado!", {
          description: "¡El proveedor ha sido creada correctamente!",
        });
      },
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al actualizar el proveedor!: ${error}`,
        });
      },
    });
  
    return {
      updateProvider: updateMutation, // Function to call the mutation
    };
  };
  

  export const useDeleteProvider = () => {

    const queryClient = useQueryClient();
  
    const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        await axios.delete(`/api/providers/${id}`); // Include ID in the URL
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["providers"] });
        toast.success("¡Eliminado!", {
          description: "¡El proveedor ha sido eliminada correctamente!"
        });
      },
      onError: () => {
        toast.error("Oops!", {
          description: "¡Hubo un error al eliminar el proveedor!"
        });
      },
    });
  
    return {
      deleteProvider: deleteMutation,
    };
  };

  export const useUpdateCreditProvider = () => {

    const queryClient = useQueryClient();
  
    const updateMutation = useMutation({
      mutationFn: async (values: {
        id: string,
        credit: number,
      }) => {
        await axios.patch(`/api/providers/${values.id}`, {
          ...values
        });
      },
      onSuccess: async() => {
        // Invalidate the 'branches' query to refresh the data
        await queryClient.invalidateQueries({ queryKey: ["providers"] });
      
      },
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al pagar el boleto!: ${error}`,
        });
      },
    });
  
    return {
      updateCreditProvider: updateMutation, // Function to call the mutation
    };
  };
  