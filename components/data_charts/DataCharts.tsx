'use client'
import { useGetSummary } from '@/actions/summary/actions'
import React from 'react'
import Chart from './Chart'
import BranchPie, { BranchPieLoading } from './BranchPie'
import { string } from 'zod'


interface DataChartsProps {
  transactions: {
    branchId: string;
    branchName: string;
    data: {
      date: string;
      amount: number;
    }[];
  }[]
  branches: {
    name: string,
    amount: number,
  }[]
}

const DataCharts = ({transactions, branches}: DataChartsProps) => {

  return (
    <div className='grid grid-cols-1 lg:grid-cols-6 gap-8'>
      <div className='col-span-1 lg:col-span-3 xl:col-span-4'>
        <Chart data={transactions} />
      </div>
      <div className='col-span-1 lg:col-span-3 xl:col-span-2'>
        <BranchPie data={branches} />
      </div>
    </div>
  )
}

export default DataCharts
