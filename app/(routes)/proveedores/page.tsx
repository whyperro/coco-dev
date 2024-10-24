"use client"

import { useGetProviders } from '@/actions/providers/actions'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'


const ProviderPage = () => {
  const {data: providers, loading, error} = useGetProviders()
  return (
    <ContentLayout title='Proveedores'>
        <div className="text-center mt-6">
            <h1 className='text-5xl font-bold'>Proveedores</h1>
            <p className="text-muted-foreground italic text-sm">Aquí puede llevar el control de los proveedores que han sido registrados en el sistema.</p>
        </div>
        {
          loading && <div className='w-full flex justify-center'>
            <Loader2 className='size-12 animate-spin'/>
          </div>
        }
        {
          providers && <DataTable columns={columns} data={providers}/>
        }
        {
          error && <div className='w-full flex justify-center text-sm text-muted-foreground'>Hubo un error...</div>
        }
    </ContentLayout>
  )
}

export default ProviderPage
