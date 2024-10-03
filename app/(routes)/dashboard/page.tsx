"use client"

import { useGetSummary } from '@/actions/summary/actions'
import { BranchPieLoading } from '@/components/data_charts/BranchPie'
import DataCharts from '@/components/data_charts/DataCharts'
import { DataCardLoading } from '@/components/data_grid/DataCard'
import DataGrid from '@/components/data_grid/DataGrid'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import React from 'react'

const DashboardPage = () => {
  const { data, loading } = useGetSummary();
  
  if (loading) {
    return <div className='max-w-6xl mx-auto mt-12'>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 pb-2">
      <DataCardLoading />
      <DataCardLoading />
      <DataCardLoading />
      
    </div>
    <BranchPieLoading />
    </div>
  }
  return (
    <ContentLayout title='Estadisticas'>
      <DataGrid  total_amount={data.total_amount} ticketCount={data.ticketCount} pendingCount={data.pendingCount}  />
      <DataCharts transactions={data.transactionsByBranch} branches={data.branches} />
    </ContentLayout>
  )
}

export default DashboardPage
