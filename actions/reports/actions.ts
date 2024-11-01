import { Ticket } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useSearchParams } from 'next/navigation';
interface Passenger {
  first_name: string;
  last_name: string;
  dni_type: string;
  dni_number: string;
  phone_number: string | null;
  email: string | null;
}
interface ClientTicket {
  ticket_number: string;
  booking_ref: string;
  purchase_date: string;
  flight_date: string;
  status: string;
  ticket_price: number;
  fee: number;
  total: number;
  provider: { name: string };
  transaction: { payment_ref: string | null; payment_method: string | null } | null;
  passanger: {first_name:string, last_name:string} | null;
  routes: { origin: string; destiny: string; route_type: string }[];
  branch: { location_name: string };
}
interface ClientReport {
  client: string;  // Client's full name
  passengers: Passenger[];  // Array of associated passengers
  paidTickets: ClientTicket[];  // Array of tickets with "PAGADO" status
  pendingTickets: ClientTicket[];  // Array of tickets with "PENDIENTE" status
  date: string,
}

interface ProviderReport {
  provider: string;  // Client's full name
  routeCounts: {
    id: string,
    origin: string,
    scale:string[],
    destiny: string,
    route_type:string,
    _count: {
      tickets: number,
    }
  }[];  // Array of associated passengers
  paidTickets: ClientTicket[];  // Array of tickets with "PAGADO" status
  pendingTickets: ClientTicket[];  // Array of tickets with "PENDIENTE" status
  date: string,
}
interface DailyReport {
  paidTickets: Ticket[];
  pendingTickets: Ticket[];
  clientsReport: {
    name: string,
    paidCount: number,
    pendingCount: number,
    paidAmount: number, // Amount for paid tickets
    pendingAmount: number, // Amount for pending tickets
    totalAmount: number, // Total amount generated
  }[],
  providersReport: {
    provider: string,
    paidCount: number,
    pendingCount: number,
    paidAmount: number, // Amount for paid tickets
    pendingAmount: number, // Amount for pending tickets
    totalAmount: number, // Total amount generated
  }[],
  branchReport: {
    name: string,
    totalAmount: number;
    ticketCount: number;
    paidCount: number;
    pendingCount: number;
  }[],
  date: string,
}

export const useGetDailyReport = () => {
  const params = useSearchParams();
  const date = params.get("date") || "";
  return useQuery<DailyReport, Error>({
    queryKey: ["daily-report", date],
    queryFn: async () => {
     const {data} = await axios.get('/api/reports/daily-report', {
      params: {
        date
      },
    }); // Cambia la URL según tu configuración de API
     return data; // Devuelve los datos del reporte
   },
    staleTime: 1000 * 60 * 5, // Los datos son frescos durante 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useGetClientReport = () => {
  const searchParams = useSearchParams();
  const params = useParams<{dni: string}>()
  const dni = params.dni;
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  return useQuery<ClientReport, Error>({
    queryKey: ["daily-report", from, to, dni],
    queryFn: async () => {
     const {data} = await axios.get(`/api/reports/client/${dni}`, {
      params: {
        from,
        to
      },
    }); // Cambia la URL según tu configuración de API
     return data; // Devuelve los datos del reporte
   },
    staleTime: 1000 * 60 * 5, // Los datos son frescos durante 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useGetProviderReport = () => {
  const searchParams = useSearchParams();
  const params = useParams<{provider_number: string}>()
  const provider_number = params.provider_number;
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  return useQuery<ProviderReport, Error>({
    queryKey: ["daily-report", from, to, provider_number],
    queryFn: async () => {
     const {data} = await axios.get(`/api/reports/provider/${provider_number}`, {
      params: {
        from,
        to
      },
    }); // Cambia la URL según tu configuración de API
     return data; // Devuelve los datos del reporte
   },
    staleTime: 1000 * 60 * 5, // Los datos son frescos durante 5 minutos
    refetchOnWindowFocus: false,
  });
};
