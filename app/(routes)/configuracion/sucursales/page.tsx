'use client'

import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useGetBranches } from '@/actions/branches/actions'

const BranchPage = () => {
  const { data } = useGetBranches()
  return (
    <ContentLayout title='Sucursales' >
      <div className="text-center mt-6">
        <h1 className='text-5xl font-bold'>Sucursales</h1>
        <p className="text-muted-foreground italic text-sm">Lorem ipsum dolor</p>
      </div>
      {
        data && <DataTable columns={columns} data={data} />
      }
    </ContentLayout>
  )
}

export default BranchPage
