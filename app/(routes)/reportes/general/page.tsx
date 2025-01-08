'use client'

import { useGetGeneralReport } from '@/actions/reports/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import DateFilter from '@/components/misc/DateFilter'
import LoadingPage from '@/components/misc/LoadingPage'
import PdfFile from '@/components/pdf/PdfFile'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Button } from '@/components/ui/button'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'

const GeneralReportPage = () => {

  const { data: generalReport, isLoading, isError } = useGetGeneralReport()

  if (isLoading) {
    return <LoadingPage />
  }
  return (
    <ContentLayout title='Reporte'>
      <ProtectedRoute roles={['SUPERADMIN', 'AUDITOR', "ADMINISTRADOR"]}>
        <div className="text-center mt-6">
          <h1 className='text-5xl font-bold'>Reporte General</h1>
          <h1 className='text-4xl font-bold italic'>{generalReport?.date}</h1>
          <p className="mt-2 text-muted-foreground italic text-sm">
            Aquí se generaran los reportes para un rango de fecha en específico.
          </p>
        </div>
        <div className='flex flex-col gap-6'>
          <div className='flex justify-between items-center'>
            <DateFilter />
            {
              generalReport && (
                <>
                  <PDFDownloadLink
                    fileName={`reporte_${generalReport.date}`}
                    document={
                      <PdfFile
                        transactionTypesReport={generalReport.transactionTypesReport}
                        providersReport={generalReport.providersReport}
                        paidTickets={generalReport.paidTickets}
                        pendingTickets={generalReport.pendingTickets}
                        clientsReport={generalReport.clientsReport}
                        branchReport={generalReport.branchReport}
                        date={generalReport.date}
                      />
                    }
                  >
                    <Button className='bg-red-700' disabled={isError}>Descargar PDF</Button>
                  </PDFDownloadLink>
                </>
              )
            }
          </div>
          <div>
            {
              generalReport && <PDFViewer style={{ width: '100%', height: '600px' }}>
                <PdfFile transactionTypesReport={generalReport.transactionTypesReport} providersReport={generalReport.providersReport} paidTickets={generalReport?.paidTickets} pendingTickets={generalReport?.pendingTickets} branchReport={generalReport.branchReport} clientsReport={generalReport.clientsReport} date={generalReport.date} />
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

export default GeneralReportPage
