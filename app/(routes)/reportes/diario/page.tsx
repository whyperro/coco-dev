"use client"

import { useGetDailyReport } from '@/actions/reports/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoadingPage from '@/components/misc/LoadingPage'
import PdfFile from '@/components/pdf/PdfFile'
import DailyReportGenerator from '@/components/reports/DailyReportGenerator'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Button } from '@/components/ui/button'
import { convertAmountFromMiliunits, formatCurrency } from '@/lib/utils'
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import * as XLSX from 'xlsx'

const DailyReportPage = () => {

  const { data: tickets, isLoading, isError } = useGetDailyReport()
  if (isLoading) {
    return <LoadingPage />
  }
  const handleExport = () => {
    if (!tickets) return;

    // Crear un array para almacenar los datos a exportar
    const ticketPaid = tickets.paidTickets.map((ticket) => ({
      "Número de Ticket": ticket.ticket_number,
      "Referencia de Reserva": ticket.booking_ref,
      "Precio": formatCurrency(convertAmountFromMiliunits(ticket.ticket_price)),
      "Tarifa": formatCurrency(convertAmountFromMiliunits(ticket.fee)),
      "Total": formatCurrency(convertAmountFromMiliunits(ticket.total)),
      "Método de Pago": ticket.transaction?.payment_method === 'PAGO_MOVIL' ? "PM" : ticket.transaction?.payment_method,
      "Pasajero": `${ticket.passanger.first_name} ${ticket.passanger.last_name}`,
      "Proveedor": ticket.provider.name,
      "Ruta": ticket.routes.map((route, index) => `${route.origin} - ${route.destiny}`).join("- "),
    }));

    const ticketPending = tickets.pendingTickets.map((ticket) => ({
      "Número de Ticket": ticket.ticket_number,
      "Referencia de Reserva": ticket.booking_ref,
      "Precio": formatCurrency(convertAmountFromMiliunits(ticket.ticket_price)),
      "Tarifa": formatCurrency(convertAmountFromMiliunits(ticket.fee)),
      "Total": formatCurrency(convertAmountFromMiliunits(ticket.total)),
      "Pasajero": `${ticket.passanger.first_name} ${ticket.passanger.last_name}`,
      "Proveedor": ticket.provider.name,
      "Ruta": ticket.routes.map((route, index) => `${route.origin} - ${route.destiny}`).join("- "),
    }));

    const clientTicket = tickets.clientsReport.map((client) => ({
      "Nombre": client.name,
      "Pendientes": client.pendingCount,
      "Pagados": client.paidCount,
      "Monto Pendiente": formatCurrency(convertAmountFromMiliunits(client.pendingAmount)),
      "Monto Pagado": formatCurrency(convertAmountFromMiliunits(client.paidAmount)),
      "Total": formatCurrency(convertAmountFromMiliunits(client.totalAmount)),
    }));
    const providerTicket = tickets.providersReport.map((provider) => ({
      "Nombre": provider.provider,
      "Pagados": provider.paidCount,
      "Pendientes": provider.pendingCount,
      "Monto Pagado": formatCurrency(convertAmountFromMiliunits(provider.paidAmount)),
      "Monto Pendiente": formatCurrency(convertAmountFromMiliunits(provider.pendingAmount)),
    }));

    const branchReport = tickets.branchReport.map((branch) => ({
      "Nombre": branch.name,
      "Pagados": branch.paidCount,
      "Pendientes": branch.pendingCount,
      "Total de Tickets": branch.ticketCount,
      "Monto Total": formatCurrency(convertAmountFromMiliunits(branch.totalAmount)),
    }));

    const methodPaid = tickets.transactionTypesReport.map(branchData => {
      const paymentMethods = branchData.payment_methods.map(method => ({
        "Método de Pago": method.method,
        "Total": formatCurrency(convertAmountFromMiliunits(method.totalAmount)),
      }));

      return {
        "Sucursal": branchData.branch,
        ...Object.fromEntries(paymentMethods.map(m => [m["Método de Pago"], m["Total"]])),
        "Total Sucursal": formatCurrency(convertAmountFromMiliunits(branchData.branch_total)),
      };
    });
    // Convierte los datos a una hoja de cálculo
    const tpaid = XLSX.utils.json_to_sheet(ticketPaid);
    const tpending = XLSX.utils.json_to_sheet(ticketPending);
    const tclient = XLSX.utils.json_to_sheet(clientTicket);
    const tprovider = XLSX.utils.json_to_sheet(providerTicket);
    const tbranch = XLSX.utils.json_to_sheet(branchReport);
    const methodPaidReport = XLSX.utils.json_to_sheet(methodPaid);
    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();

    // Agrega las hojas al libro con nombres únicos
    XLSX.utils.book_append_sheet(wb, tpaid, "Tickets Pagados");
    XLSX.utils.book_append_sheet(wb, tpending, "Tickets Pendientes");
    XLSX.utils.book_append_sheet(wb, tclient, "Resumen de clientes");
    XLSX.utils.book_append_sheet(wb, tprovider, "Resumen de proveedores");
    XLSX.utils.book_append_sheet(wb, tbranch, "Resumen de sucursales");
    XLSX.utils.book_append_sheet(wb, methodPaidReport, "Resumen de Ingreso por Sucursal");
    // Exporta el archivo
    XLSX.writeFile(wb, `reporte_diario_${tickets.date}.xlsx`);

  };

  return (
    <ContentLayout title='Reporte'>
      <ProtectedRoute roles={['SUPERADMIN', 'AUDITOR']}>
        <div className="text-center mt-6">
          <h1 className='text-5xl font-bold'>Reportes Diarios</h1>
          <p className="mt-2 text-muted-foreground italic text-sm">
            Aquí se generaran los reportes formatos PDF cada 24 horas.
          </p>
        </div>
        <div className='flex flex-col gap-12 pt-10'>
          <div className='flex justify-evenly items-center'>
            <DailyReportGenerator />
            {
              tickets && (
                <>
                  <PDFDownloadLink
                    fileName={`reporte_diario_${tickets.date}`}
                    document={
                      <PdfFile
                        transactionTypesReport={tickets.transactionTypesReport}
                        providersReport={tickets.providersReport}
                        paidTickets={tickets.paidTickets}
                        pendingTickets={tickets.pendingTickets}
                        clientsReport={tickets.clientsReport}
                        branchReport={tickets.branchReport}
                        date={format(new Date(), "PPP", { locale: es })}
                      />
                    }
                  >
                    <Button className='bg-red-700' disabled={isError}>Descargar PDF</Button>
                  </PDFDownloadLink>

                  <Button onClick={handleExport} disabled={isLoading || isError}>
                    Descargar Excel
                  </Button>
                </>
              )
            }
          </div>
          <div>
            {
              tickets && <PDFViewer style={{ width: '100%', height: '600px' }}>
                <PdfFile transactionTypesReport={tickets.transactionTypesReport} providersReport={tickets.providersReport} paidTickets={tickets?.paidTickets} pendingTickets={tickets?.pendingTickets} branchReport={tickets.branchReport} clientsReport={tickets.clientsReport} date={tickets.date} />
              </PDFViewer>
            }
            {
              isError && <p className='text-sm text-muted-foreground text-center'>Ha ocurrido un error al cargar el reporte diario...</p>
            }
          </div>
        </div>
      </ProtectedRoute>
    </ContentLayout>

  )
}

export default DailyReportPage
