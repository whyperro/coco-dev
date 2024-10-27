"use client"

import { useGetDailyReport } from '@/actions/reports/actions'
import { useGetPaidTicketsReport } from '@/actions/tickets/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoadingPage from '@/components/misc/LoadingPage'
import PdfFile from '@/components/pdf/PdfFile'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Button } from '@/components/ui/button'
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const DailyReportPage = () => {

  const { data: tickets, isLoading, isError  } = useGetDailyReport()

  if(isLoading) {
    return <LoadingPage />
  }

  return (
    <ContentLayout title='Reporte'>
      <ProtectedRoute roles={['ADMIN', 'AUDITOR']}>
        <div className="text-center mt-6">
          <h1 className='text-5xl font-bold'>Reportes Diarios</h1>
          <p className="mt-2 text-muted-foreground italic text-sm">
            Aquí se generaran los reportes formatos PDF cada 24 horas.
          </p>

        </div>
        <div className='flex flex-col gap-6'>
          <div>
            {
              tickets && <PDFDownloadLink fileName='Reporte Diario' document={<PdfFile paidTickets={tickets?.paidTickets} pendingTickets={tickets?.pendingTickets} date={format(new Date(), "PPP", {locale: es})}/>}>
              <Button disabled={isError}>Descargar PDF</Button>
            </PDFDownloadLink>
            }
          </div>
          <div>
            {
              tickets && <PDFViewer style={{ width: '100%', height: '600px' }}>
              <PdfFile paidTickets={tickets?.paidTickets} pendingTickets={tickets?.pendingTickets} date={format(new Date(), "PPP", {locale: es})} />
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
