"use client"

import { useGetDailyReport } from '@/actions/reports/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoadingPage from '@/components/misc/LoadingPage'
import PdfFile from '@/components/pdf/PdfFile'
import DailyReportGenerator from '@/components/reports/DailyReportGenerator'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Button } from '@/components/ui/button'
import { convertAmountFromMiliunits, formatBolivares, formatCurrency } from '@/lib/utils'
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { subDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import * as XLSX from 'xlsx'

const DailyReportPage = () => {

  const { data: tickets, isLoading, isError } = useGetDailyReport()
  if (isLoading) {
    return <LoadingPage />
  }
  const handleExport = () => {
    if (!tickets) return;

    const rows = [];

    // Crear un array para almacenar los datos a exportar
    const ticketPaid = tickets.paidTickets.map((ticket) => ({
      "Número de Ticket": ticket.ticket_number,
      "Referencia de Reserva": ticket.booking_ref,
      "Precio": formatCurrency(convertAmountFromMiliunits(ticket.ticket_price)),
      "Tarifa": formatCurrency(convertAmountFromMiliunits(ticket.fee)),
      "Total": formatCurrency(convertAmountFromMiliunits(ticket.total)),
      "Tasa": formatCurrency(convertAmountFromMiliunits(ticket.rate)),
      "Total Bolivares": formatCurrency(convertAmountFromMiliunits(ticket.total_bs)),
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
      "Tasa": formatCurrency(convertAmountFromMiliunits(ticket.rate)),
      "Total Bolivares": formatCurrency(convertAmountFromMiliunits(ticket.total_bs)),
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
    // Añadir tabla de "Tickets Pagados"
    rows.push(["Tickets Pagados"]);
    rows.push([
      "Número de Ticket",
      "Referencia de Reserva",
      "Precio",
      "Tarifa",
      "Total",
      "Tasa",
      "Total Bolivares",
      "Método de Pago",
      "Pasajero",
      "Proveedor",
      "Ruta",
    ]);
    tickets.paidTickets.forEach(ticket => {
      rows.push([
        ticket.ticket_number,
        ticket.booking_ref,
        formatCurrency(convertAmountFromMiliunits(ticket.ticket_price)),
        formatCurrency(convertAmountFromMiliunits(ticket.fee)),
        formatCurrency(convertAmountFromMiliunits(ticket.total)),
        formatBolivares(convertAmountFromMiliunits(ticket.rate)),
        formatBolivares(convertAmountFromMiliunits(ticket.total_bs)),
        ticket.transaction?.payment_method === 'PAGO_MOVIL' ? "PM" : ticket.transaction?.payment_method,
        `${ticket.passanger.first_name} ${ticket.passanger.last_name}`,
        ticket.provider.name,
        ticket.routes.map(route => `${route.origin} - ${route.destiny}`).join("- "),
      ]);
    });

    rows.push([]); // Fila vacía para separación

    // Añadir tabla de "Tickets Pendientes"
    rows.push(["Tickets Pendientes"]);
    rows.push([
      "Número de Ticket",
      "Referencia de Reserva",
      "Precio",
      "Tarifa",
      "Total",
      "Tasa",
      "Total Bolivares",
      "Pasajero",
      "Proveedor",
      "Ruta",
    ]);
    tickets.pendingTickets.forEach(ticket => {
      rows.push([
        ticket.ticket_number,
        ticket.booking_ref,
        formatCurrency(convertAmountFromMiliunits(ticket.ticket_price)),
        formatCurrency(convertAmountFromMiliunits(ticket.fee)),
        formatCurrency(convertAmountFromMiliunits(ticket.total)),
        formatBolivares(convertAmountFromMiliunits(ticket.rate)),
        formatBolivares(convertAmountFromMiliunits(ticket.total_bs)),
        `${ticket.passanger.first_name} ${ticket.passanger.last_name}`,
        ticket.provider.name,
        ticket.routes.map(route => `${route.origin} - ${route.destiny}`).join("- "),
      ]);
    });

    rows.push([]); // Fila vacía para separación

    // Añadir tabla de "Resumen de Clientes"
    rows.push(["Resumen de Clientes"]);
    rows.push(["Nombre", "Pendientes", "Pagados", "Monto Pendiente", "Monto Pagado", "Total"]);
    tickets.clientsReport.forEach(client => {
      rows.push([
        client.name,
        client.pendingCount,
        client.paidCount,
        formatCurrency(convertAmountFromMiliunits(client.pendingAmount)),
        formatCurrency(convertAmountFromMiliunits(client.paidAmount)),
        formatCurrency(convertAmountFromMiliunits(client.totalAmount)),
      ]);
    });
    rows.push([]); // Espacio entre tablas
    // Resumen por proveedor
    rows.push(["Resumen por Proveedor"]);
    rows.push(["Proveedor", "Pagados", "Pendientes", "Monto Pagado", "Monto Pendiente"]);
    tickets.providersReport.forEach(provider => {
      rows.push([
        provider.provider,
        provider.paidCount,
        provider.pendingCount,
        formatCurrency(convertAmountFromMiliunits(provider.paidAmount)),
        formatCurrency(convertAmountFromMiliunits(provider.pendingAmount)),
      ]);
    });

    rows.push([]); // Espacio entre tablas

    // Resumen por sucursal
    rows.push(["Resumen por Sucursal"]);
    rows.push(["Sucursal", "Pagados", "Pendientes", "Total de Tickets", "Monto Total"]);
    tickets.branchReport.forEach(branch => {
      rows.push([
        branch.name,
        branch.paidCount,
        branch.pendingCount,
        branch.ticketCount,
        formatCurrency(convertAmountFromMiliunits(branch.totalAmount)),
      ]);
    });

    rows.push([]); // Espacio entre tablas

    // Resumen de ingresos por sucursal
    rows.push(["Resumen de Ingresos por Sucursal"]);
    rows.push(["Sucursal", "Método de Pago", "Total"]);
    tickets.transactionTypesReport.forEach(branchData => {
      branchData.payment_methods.forEach(method => {
        rows.push([
          branchData.branch,
          method.method,
          formatCurrency(convertAmountFromMiliunits(method.totalAmount)),
        ]);
      });
      rows.push(["", "Total Sucursal", formatCurrency(convertAmountFromMiliunits(branchData.branch_total))]);
    });

    // Crear hoja con todos los datos
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    const formattedDate = format(subDays(new Date(tickets.date), -1), 'yyyy-MM-dd'); // Formatea la fecha en el formato deseado
    XLSX.utils.book_append_sheet(wb, ws, `Reporte Diario ${formattedDate}`); 

    // Exportar archivo
    XLSX.writeFile(wb, `reporte_diario_${tickets.date}.xlsx`);

    

  };

  return (
    <ContentLayout title='Reporte'>
      <ProtectedRoute roles={['SUPERADMIN', 'AUDITOR', "ADMINISTRADOR"]}>
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
