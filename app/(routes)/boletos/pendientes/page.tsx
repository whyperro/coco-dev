"use client"

import { useGetPendingTickets } from '@/actions/tickets/actions'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Ticket } from '@/types'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { columns } from './columns'
import { DataTable } from './data-table'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

const PendingTicketsPage = () => {

  const [filteredTickets, setFilteredTickets] = useState<Ticket[] | null>(null)
  const { data: tickets, loading, error } = useGetPendingTickets()
  const { data: session } = useSession()

  useEffect(() => {
    if (tickets && session) {
      const userRole = session?.user?.user_role;
      const userBranchId = session?.user?.branchId;

      if (userRole === 'ADMIN') {
        setFilteredTickets(tickets)
      } else if (userBranchId) {
        // Ensure branchId exists and filter tickets by the user's branchId
        setFilteredTickets(tickets.filter((ticket) => ticket.branchId === userBranchId))
      }
    }
  }, [tickets, session]) // Add session to the dependency array


  return (
    <ProtectedRoute roles={["ADMIN", "AUDITOR"]}>
      <ContentLayout title='Boletos Pendientes'>
        <div className="text-center mt-6">
          <h1 className='text-5xl font-bold mb-4'>Boletos Pendientes</h1>
          <p className="text-muted-foreground italic text-sm">
            Aquí puede ver un registro de los boletos que aún se encuentrar pendientes por pagar.
          </p>
        </div>
        {
          loading && (
            <div className='w-full flex justify-center'>
              <Loader2 className='size-12 animate-spin' />
            </div>
          )
        }
        {
          filteredTickets && (
            <DataTable columns={columns} data={filteredTickets} />
          )
        }
        {
          error && (
            <div className='w-full flex justify-center text-sm text-muted-foreground'>
              Hubo un error...
            </div>
          )
        }
      </ContentLayout>
    </ProtectedRoute>
  )
}

export default PendingTicketsPage
