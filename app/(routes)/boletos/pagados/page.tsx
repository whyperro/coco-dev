"use client"

import { useGetPaidTickets } from '@/actions/tickets/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'

const PaidTicketsPage = () => {
  const { data: tickets, loading, error } = useGetPaidTickets()
  return (
    <ProtectedRoute roles={["SUPERADMIN", "AUDITOR", "ADMINISTRADOR"]}>
      <ContentLayout title='Boletos Pagados'>
        <div className="text-center mt-6">
          <h1 className='text-5xl font-bold mb-4'>Boletos Pagados
          </h1>
          <p className="text-muted-foreground italic text-sm">Aquí puede ver un registro de los boletos que se encuentran ya pagados.</p>
        </div>
        {
          loading && <div className='w-full flex justify-center'>
            <Loader2 className='size-12 animate-spin' />
          </div>
        }
        {
          tickets && <DataTable columns={columns} data={tickets} />
        }
        {
          error && <div className='w-full flex justify-center text-sm text-muted-foreground'>Hubo un error...</div>
        }
      </ContentLayout>
    </ProtectedRoute>
  )
}

export default PaidTicketsPage
