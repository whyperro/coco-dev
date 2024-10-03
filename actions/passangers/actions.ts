import { Passanger, Provider } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
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
      onError: (error: Error) => {
        toast.error("Oops!", {
          description: `¡Hubo un error al crear el pasajero!: ${error}`,
        });
      },
    });

    return {
      createPassenger: createMutation, // Function to call the mutation
    };
  };
