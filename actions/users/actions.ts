import { User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useGetUsers = () => {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const {data} = await axios.get('/api/users'); // Adjust the endpoint as needed
      return data as User[];
    },
  });
  return {
    data: usersQuery.data,
    loading: usersQuery.isLoading,
    error: usersQuery.isError // Function to call the query
  };
};

export const useGetUser = (id: string | null) => {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {data} = await axios.get(`/api/user/${id}`); // Adjust the endpoint as needed
      return data as User;
    },
    enabled: !!id
  });
  return {
    data: userQuery.data,
    loading: userQuery.isLoading,
    error: userQuery.isError // Function to call the query
  };
};



export const useUpdateUser = () => {

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: {
      id:string,
      first_name: string,
      last_name: string
      username: string,
      password:string,
      user_role: string,
      updated_by:string
      branchId?: string
    }) => {
      await axios.patch(`/api/users/${values.id}`, {
        ...values,
        branchId: values.branchId ?? null,
      });
    },
    onSuccess: () => {
      // Invalidate the 'branches' query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("¡Actualizado!", {
        description: "¡El usuario ha sido creada correctamente!",
      });
    },
    onError: (error: Error) => {
      toast.error("Oops!", {
        description: `¡Hubo un error al actualizar el usuario!: ${error}`,
      });
    },
  });

  return {
    updateUser: updateMutation, // Function to call the mutation
  };
};

export const useDeleteUser = () => {

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/users/${id}`); // Include ID in the URL
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("¡Eliminado!", {
        description: "¡El usuario ha sido eliminado correctamente!"
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el usuario!"
      });
    },
  });

  return {
    deleteUser: deleteMutation,
  };
};
