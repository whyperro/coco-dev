import { Passanger } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const useGetPassanger = (id: string | null) => {
    const passangerQuery = useQuery({
      queryKey: ["passenger"],
      queryFn: async () => {
        const {data} = await axios.get(`/api/passangers/${id}`); // Adjust the endpoint as needed
        return data as Passanger;
      },
      enabled: !!id
    });
    return {
      data: passangerQuery.data,
      loading: passangerQuery.isLoading,
      error: passangerQuery.isError // Function to call the query
    };
  };


  export const useGetPassangerByDni = (dni: string | null) => {
    const passangerQuery = useQuery({
      queryKey: ["passanger"],
      queryFn: async () => {
        const {data} = await axios.get(`/api/passangers/dni_number/${dni}`); // Adjust the endpoint as needed
        return data as Passanger;
      },
      enabled: !!dni
    });
    return {
      data: passangerQuery.data,
      loading: passangerQuery.isLoading,
      error: passangerQuery.isError // Function to call the query
    };
  };

  export const useGetPassangers = () => {
    const passangersQuery = useQuery({
      queryKey: ["passangers"],
      queryFn: async () => {
        const {data} = await axios.get('/api/passangers'); // Adjust the endpoint as needed
        return data as Passanger[];
      }
    });
    return {
      data: passangersQuery.data,
      loading: passangersQuery.isLoading,
      error: passangersQuery.isError // Function to call the query
    };
  };

  export const useCreatePassenger = () => {
    const queryClient = useQueryClient();
    const createMutation = useMutation({
      mutationFn: async (values: {           // ID of the branch to be updated
        first_name: string;    // New location name
        last_name: string;    // New location name
        dni_type: string;
        dni_number: string;
        phone_number: string | null;
        email: string | null;
        clientId: string;    // New location name
      }) => {
        const res = await axios.post(`/api/passangers`, {
          ...values
        });

        return res
      },
      onSuccess: () => {
        // Invalidate the 'branches' query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["passangers"] });
        toast.success("¡Creado!", {
          description: "¡El pasajero ha sido creada correctamente!",
          dismissible: true,
        })
      },
      onError: (error: any) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al crear el pasajero! ${error.response.data.message}`,
        });
      },
    });

    return {
      createPassenger: createMutation, // Function to call the mutation
    };
  };

  export const useDeletePassanger = () => {

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
      mutationFn: async (id: string) => {
        await axios.delete(`/api/passangers/${id}`); // Include ID in the URL
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["passangers"] });
        toast.success("¡Eliminado!", {
          description: "¡El pasajero ha sido eliminado correctamente!"
        });
      },
      onError: () => {
        toast.error("Oops!", {
          description: "¡Hubo un error al eliminar el pasajero!"
        });
      },
    });

    return {
      deletePassanger: deleteMutation,
    };
  };


  export const useUpdatePassanger = () => {

    const queryClient = useQueryClient();

    const updateMutation = useMutation({
      mutationFn: async (values: {
        id: string,
        first_name:   string
        last_name :   string
        dni_type :      string
        dni_number :  string
        phone_number: string | null
        email:       string | null
      }) => {
        await await axios.patch(`/api/passangers/${values.id}`, {
            first_name: values.first_name,
            last_name: values.last_name,
            dni_type: values.dni_type,
            dni_number: values.dni_number,
            phone_number: values.phone_number ?? null,
            email: values.email ?? null,
        });
      },
      onSuccess: () => {
        // Invalidate the 'branches' query to refresh the data
        queryClient.invalidateQueries({ queryKey: ["passangers"] });
        toast.success("¡Actualizado!", {
          description: "¡El pasajero ha sido actualizada correctamente!",
        });
      },
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al actualizar el pasajero!: ${error}`,
        });
      },
    });

    return {
      updatePassanger: updateMutation, // Function to call the mutation
    };
  };
