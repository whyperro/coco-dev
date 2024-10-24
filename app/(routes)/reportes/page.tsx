"use client"

import { useGetPaidTicketsReport } from '@/actions/tickets/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import PdfFile from '@/components/pdf/PdfFile'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Button } from '@/components/ui/button'
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"

const ProviderPage = () => {
 
  const { data: tickets, error  } = useGetPaidTicketsReport()
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
            <PDFDownloadLink fileName='Reporte Diario' document={<PdfFile tickets={tickets} error={error} />}>
              <Button>Descargar PDF</Button>
            </PDFDownloadLink>
          </div>
          <div>
            <PDFViewer style={{ width: '100%', height: '600px' }}>
              <PdfFile tickets={tickets} error={error} />
            </PDFViewer>
          </div>
        </div>
      </ProtectedRoute>
    </ContentLayout>
   
  )
}

export default ProviderPage