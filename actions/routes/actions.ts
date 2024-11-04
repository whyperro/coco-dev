import { Route } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";


export const useGetRoute = (id: string | null) => {
  const routesQuery = useQuery({
    queryKey: ["route"],
    queryFn: async () => {
      const {data} = await axios.get(`/api/routes/${id}`); // Adjust the endpoint as needed
      return data as Route;
    },
    enabled: !!id
  });
  return {
    data: routesQuery.data,
    loading: routesQuery.isLoading,
    error: routesQuery.isError // Function to call the query
  };
};


export const useGetRoutes = () => {
  const routesQuery = useQuery({
    queryKey: ["routes"], // Updated to reflect flight type
    queryFn: async () => {
      const {data} = await axios.get('/api/routes');
      return data as Route[];
    },
    // Optional: you can set retry and staleTime here
  });

  return {
    data: routesQuery.data,
    loading: routesQuery.isLoading,
    error: routesQuery.isError ? routesQuery.error : null, // Improved error handling
  };
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (values: {           // ID of the branch to be updated
      origin:string,
      destiny: string,
      route_type: string,
      scale?: string,  // New location name
    }) => {
      await axios.post(`/api/routes`, {
        origin: values.origin,
        destiny: values.destiny,
        route_type: values.route_type,
        scale: values.scale ?? null,
      });
    },
    onSuccess: () => {
      // Invalidate the 'branches' query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("¡Creado!", {
        description: "¡La ruta ha sido creado correctamente!",
        dismissible: true,
      })
    },
    onError: (error: Error) => {
      toast.error("Oops!", {
        description: `¡Hubo un error al crear la ruta!: ${error}`,
      });
    },
  });

  return {
    createRoute: createMutation, // Function to call the mutation
  };
};



export const useUpdateRoute = () => {

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: {
      id: string
      origin:string,
      destiny: string,
      route_type: string,
      scale?: string
    }) => {
      await axios.patch(`/api/routes/${values.id}`, {
        origin: values.origin,
        destiny: values.destiny,
        route_type: values.route_type,
        scale: values.scale ?? null,
      });
    },
    onSuccess: () => {
      // Invalidate the 'branches' query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("¡Actualizado!", {
        description: "¡La ruta ha sido creada correctamente!",
      });
    },
    onError: (error: Error) => {
      toast.error("Oops!", {
        description: `¡Hubo un error al actualizar la ruta!: ${error}`,
      });
    },
  });

  return {
    updateRoute: updateMutation, // Function to call the mutation
  };
};


export const useDeleteRoute = () => {

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/routes/${id}`); // Include ID in the URL
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("¡Eliminado!", {
        description: "¡La ruta ha sido eliminada correctamente!"
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la ruta!"
      });
    },
  });

  return {
    deleteRoute: deleteMutation,
  };
};
