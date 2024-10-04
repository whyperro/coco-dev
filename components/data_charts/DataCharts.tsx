'use client'
import BranchPie from './BranchPie'
import Chart from './Chart'


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
  pieTitle: string,
  pieDescription: string,
}

const DataCharts = ({ transactions, branches, pieTitle, pieDescription }: DataChartsProps) => {

  return (
    <div className='grid grid-cols-1 lg:grid-cols-6 gap-8'>
      <div className='col-span-1 lg:col-span-3 xl:col-span-4'>
        <Chart data={transactions} />
      </div>
      <div className='col-span-1 lg:col-span-3 xl:col-span-2'>
        <BranchPie description={pieDescription} title={pieTitle} data={branches} />
      </div>
    </div>
  )
}

export default DataCharts
