"use client"

import { useGetClientReport } from '@/actions/reports/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import DateFilter from '@/components/misc/DateFilter'
import LoadingPage from '@/components/misc/LoadingPage'
import ClientReportPdf from '@/components/reports/pdf/ClientReportPdf'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Button } from '@/components/ui/button'
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"

const DailyReportPage = () => {

  const { data: clientReport, isLoading, isError } = useGetClientReport()
  if (isLoading) {
    return <LoadingPage />
  }
  return (
    <ContentLayout title='Reporte'>
      <ProtectedRoute roles={['SUPERADMIN', 'AUDITOR', "ADMINISTRADOR"]}>
        <div className="text-center mt-6">
          <h1 className='text-5xl font-bold'>Reporte de Cliente</h1>
          <h1 className='text-4xl font-bold italic'>{clientReport?.client}</h1>
          <p className="mt-2 text-muted-foreground italic text-sm">
            Aquí se generaran los reportes dado un cliente específico.
          </p>
        </div>
        <div className='flex flex-col gap-6'>
          <div className='flex justify-between items-center'>
            <DateFilter />
            {
              clientReport && <PDFDownloadLink fileName={`reporte_${clientReport.client}_${clientReport.date}`} document={<ClientReportPdf client={clientReport.client} passengers={clientReport.passengers} paidTickets={clientReport.paidTickets} pendingTickets={clientReport.pendingTickets} date={clientReport.date} />}>
                <Button disabled={isError}>Descargar PDF</Button>
              </PDFDownloadLink>
            }
          </div>
          <div>
            {
              clientReport && <PDFViewer style={{ width: '100%', height: '600px' }}>
                <ClientReportPdf client={clientReport.client} passengers={clientReport.passengers} paidTickets={clientReport.paidTickets} pendingTickets={clientReport.pendingTickets} date={clientReport.date} />
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
