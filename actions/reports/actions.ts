import { Ticket } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Define la interfaz para los datos del reporte diario
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
  }
}

export const useGetDailyReport = () => {
  return useQuery<DailyReport, Error>({
    queryKey: ["daily-report"],
    queryFn: async () => {
     const {data} = await axios.get('/api/reports/daily-report'); // Cambia la URL según tu configuración de API
     return data; // Devuelve los datos del reporte
   },
    staleTime: 1000 * 60 * 5, // Los datos son frescos durante 5 minutos
    refetchOnWindowFocus: false,
  });
};
