"use client"

import { useGetProviderReport } from '@/actions/reports/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import DateFilter from '@/components/misc/DateFilter'
import LoadingPage from '@/components/misc/LoadingPage'
import ProviderReportPdf from '@/components/reports/pdf/ProviderReportPdf'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Button } from '@/components/ui/button'
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"

const DailyReportPage = () => {

  const { data: providerReport, isLoading, isError } = useGetProviderReport()
  console.log(providerReport)
  if (isLoading) {
    return <LoadingPage />
  }
  return (
    <ContentLayout title='Reporte'>
      <ProtectedRoute roles={['SUPERADMIN', 'AUDITOR']}>
        <div className="text-center mt-6">
          <h1 className='text-5xl font-bold'>Reporte de Cliente</h1>
          <h1 className='text-4xl font-bold italic'>{providerReport?.provider}</h1>
          <p className="mt-2 text-muted-foreground italic text-sm">
            Aquí se generaran los reportes formatos PDF cada 24 horas.
          </p>
        </div>
        <div className='flex flex-col gap-6'>
          <div className='flex justify-between items-center'>
            <DateFilter />
            {
              providerReport && <PDFDownloadLink fileName={`reporte_${providerReport.provider}_${providerReport.date}`} document={<ProviderReportPdf provider={providerReport.provider} paidTickets={providerReport.paidTickets} pendingTickets={providerReport.pendingTickets} routeCounts={providerReport.routeCounts} date={providerReport.date} />}>
                <Button disabled={isError}>Descargar PDF</Button>
              </PDFDownloadLink>
            }
          </div>
          <div>
            {
              providerReport && <PDFViewer style={{ width: '100%', height: '600px' }}>
                <ProviderReportPdf provider={providerReport.provider} paidTickets={providerReport.paidTickets} pendingTickets={providerReport.pendingTickets} routeCounts={providerReport.routeCounts} date={providerReport.date} />
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
