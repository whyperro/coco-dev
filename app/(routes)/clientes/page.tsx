"use client"

import { useGetClients } from '@/actions/clients/actions'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Loader2 } from 'lucide-react'
import { DataTable } from './data-table'
import { columns } from './columns'

const ClientPage = () => {
  const {data: clients, loading, error} = useGetClients()
  return (
    <ContentLayout title='Clientes'>
        <div className="text-center mt-6">
            <h1 className='text-5xl font-bold'>Clientes</h1>
            <p className="text-muted-foreground italic text-sm">Lorem ipsum dolor</p>
        </div>
        {
          loading && <div className='w-full flex justify-center'>
            <Loader2 className='size-12 animate-spin'/>
          </div>
        }
        {
          clients && <DataTable columns={columns} data={clients}/>
        }
        {
          error && <div className='w-full flex justify-center text-sm text-muted-foreground'>Hubo un error...</div>
        }
    </ContentLayout>
  )
}

export default ClientPage
