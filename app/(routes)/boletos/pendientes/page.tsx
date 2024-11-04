"use client"

import { useGetPendingTickets } from '@/actions/tickets/actions'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Ticket } from '@/types'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo } from 'react'
import { columns } from './columns'
import { DataTable } from './data-table'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

const PendingTicketsPage = () => {
  const { data: tickets, loading, error } = useGetPendingTickets()
  return (
    <ProtectedRoute roles={["ADMIN", "AUDITOR", "MANAGER"]}>
      <ContentLayout title="Boletos Pendientes">
        <div className="text-center mt-6">
          <h1 className="text-5xl font-bold mb-4">Boletos Pendientes</h1>
          <p className="text-muted-foreground italic text-sm">
            Aquí puede ver un registro de los boletos que aún se encuentran pendientes por pagar.
          </p>
        </div>
        {loading && (
          <div className="w-full flex justify-center">
            <Loader2 className="size-12 animate-spin" />
          </div>
        )}
        {tickets && <DataTable columns={columns} data={tickets} />}
        {error && (
          <div className="w-full flex justify-center text-sm text-muted-foreground">
            Hubo un error...
          </div>
        )}
      </ContentLayout>
    </ProtectedRoute>
  )
}

export default PendingTicketsPage
