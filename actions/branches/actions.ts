import { Branch } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useGetBranches = () => {
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const {data} = await axios.get('/api/branches'); // Adjust the endpoint as needed
      return data as Branch[];
    }
  });
  return {
    data: branchesQuery.data,
    loading: branchesQuery.isLoading,
    error: branchesQuery.isError // Function to call the query
  };
};


export const useGetBranch = (id: string | null) => {
  const branchQuery = useQuery({
    queryKey: ["branch"],
    queryFn: async () => {
      const {data} = await axios.get(`/api/branches/${id}`); // Adjust the endpoint as needed
      return data as Branch;
    },
    enabled: !!id
  });
  return {
    data: branchQuery.data,
    loading: branchQuery.isLoading,
    error: branchQuery.isError // Function to call the query
  };
};


export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (values: {           // ID of the branch to be updated
      location_name: string;    // New location name
      fiscal_address: string | null; // New fiscal address
    }) => {
      await axios.post(`/api/branches`, {
          location_name: values.location_name,
          fiscal_address: values.fiscal_address ?? null
      });
    },
    onSuccess: () => {
      // Invalidate the 'branches' query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("¡Creado!", {
        description: "¡La sucursal ha sido creada correctamente!",
        dismissible: true,
      })
    },
    onError: (error: Error) => {
      toast.error("Oops!", {
        description: `¡Hubo un error al crear la sucursal!: ${error}`,
      });
    },
  });

  return {
    createBranch: createMutation, // Function to call the mutation
  };
};


export const useDeleteBranch = () => {

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/branches/${id}`); // Include ID in the URL
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("¡Eliminado!", {
        description: "¡La sucursal ha sido eliminada correctamente!"
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la sucursal!"
      });
    },
  });

  return {
    deleteBranch: deleteMutation,
  };
};



  export const useUpdateBranch = () => {

    const queryClient = useQueryClient();

    const updateMutation = useMutation({
      mutationFn: async (values: {
        id: string;               // ID of the branch to be updated
        location_name: string;    // New location name
        fiscal_address: string | null; // New fiscal address
      }) => {
        await await axios.patch(`/api/branches/${values.id}`, {
            id: values.id,
            location_name: values.location_name,
            fiscal_address: values.fiscal_address ?? null

        });
      },
      onSuccess: () => {
        // Invalidate the 'branches' query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["branches"] });
        toast.success("¡Actualizado!", {
          description: "¡La sucursal ha sido actualizada correctamente!",
        });
      },
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al actualizar la sucursal!: ${error}`,
        });
      },
    });

    return {
      updateBranch: updateMutation, // Function to call the mutation
    };
  };
