"use client"

import { useGetPaidTickets } from '@/actions/tickets/actions'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Ticket } from '@/types'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { columns } from './columns'
import { DataTable } from './data-table'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

const PaidTicketsPage = () => {
  const [filteredTickets, setFilteredTickets] = useState<Ticket[] | null>(null)
  const { data: tickets, loading, error } = useGetPaidTickets()
  const { data: session } = useSession()

  useEffect(() => {
    if (tickets && session) {
      if (session.user.user_role === 'ADMIN' || session.user.user_role === 'AUDITOR') {
        setFilteredTickets(tickets);
      } else {
        setFilteredTickets(tickets.filter(ticket => ticket.branchId === session.user.branchId));
      }
    }
  }, [tickets, session]);


  return (
    <ProtectedRoute roles={["ADMIN", "AUDITOR"]}>
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
          filteredTickets && <DataTable columns={columns} data={filteredTickets} />
        }
        {
          error && <div className='w-full flex justify-center text-sm text-muted-foreground'>Hubo un error...</div>
        }
      </ContentLayout>
    </ProtectedRoute>
  )
}

export default PaidTicketsPage
