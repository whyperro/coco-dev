"use client"

import { useGetDailyReport } from '@/actions/reports/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoadingPage from '@/components/misc/LoadingPage'
import PdfFile from '@/components/pdf/PdfFile'
import DailyReportGenerator from '@/components/reports/DailyReportGenerator'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Button } from '@/components/ui/button'
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const DailyReportPage = () => {

  const { data: tickets, isLoading, isError } = useGetDailyReport()
  if (isLoading) {
    return <LoadingPage />
  }

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
