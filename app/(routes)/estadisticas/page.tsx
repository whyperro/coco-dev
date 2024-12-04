"use client"

import { useGetAnalitics } from '@/actions/summary/analitics/actions'
import { BranchPieLoading } from '@/components/data_charts/BranchPie'
import DataCharts from '@/components/data_charts/DataCharts'
import { DataCardLoading } from '@/components/data_grid/DataCard'
import DataGrid from '@/components/data_grid/DataGrid'
import DateFilter from '@/components/misc/DateFilter'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { useSession } from 'next-auth/react'
import React from 'react'

const AnaliticsPage = () => {

  const { data: session } = useSession()
  const { data, loading } = useGetAnalitics(session?.user.username || null);


  return (
    <ContentLayout title='Estadisticas'>
      {loading && <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 pb-2">
          <DataCardLoading />
          <DataCardLoading />
          <DataCardLoading />

        </div>
        <BranchPieLoading />

      </>}
      {
        data && <>
          <div className='flex justify-center '><DateFilter /></div>
          <DataGrid incomeChange={data.incomeChange} pendingTicketChange={data.pendingTicketChange} paidTicketChange={data.paidTicketChange} total_amount={data.total_amount} ticketCount={data.ticketCount} pendingCount={data.currentPendingCount} paidCount={data.currentPaidCount} />
          <DataCharts pieTitle='Clientes' pieDescription="Ingresos según los clientes." transactions={data.transactionsByBranch} branches={data.chartPie} />
        </>
      }
    </ContentLayout>
  )
}

export default AnaliticsPage
