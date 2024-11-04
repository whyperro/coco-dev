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
    staleTime: 3500,
    refetchInterval: 5000,
  });
  return {
    data: usersQuery.data,
    loading: usersQuery.isLoading,
    error: usersQuery.isError // Function to call the query
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
