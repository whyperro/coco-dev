"use client"

import { useGetProviders } from '@/actions/providers/actions'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Loader2 } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from './data-table'
import { useGetPassangers } from '@/actions/passangers/actions'


const ProviderPage = () => {
  const { data: passangers, loading, error } = useGetPassangers()
  return (
    <ContentLayout title='Pasajeros'>
      <div className="text-center mt-6">
        <h1 className='text-5xl font-bold'>Pasajeros</h1>
        <p className="mt-2 text-muted-foreground italic text-sm">Aquí puede llevar el control de los pasajeros que han sido registrados en el sistema.</p>
      </div>
      {
        loading && <div className='w-full flex justify-center'>
          <Loader2 className='size-12 animate-spin' />
        </div>
      }
      {
        passangers && <DataTable columns={columns} data={passangers} />
      }
      {
        error && <div className='w-full flex justify-center text-sm text-muted-foreground'>Hubo un error al cargar los pasajeros...</div>
      }
    </ContentLayout>
  )
}

export default ProviderPage
