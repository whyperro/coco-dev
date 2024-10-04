'use client'

import { useGetUsers } from '@/actions/users/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { columns } from './columns'
import { DataTable } from './data-table'

const UsersPage = () => {
  const { data } = useGetUsers()
  return (
    <ContentLayout title='Usuarios' >
      <ProtectedRoute roles={['ADMIN', 'AUDITOR']}>
        <div className="text-center mt-6">
          <h1 className='text-5xl font-bold'>Usuarios</h1>
          <p className="text-muted-foreground italic text-sm mt-2">Aquí puede llevar el control de los usuarios registrados en el sistema.</p>
        </div>
        {
          data && <DataTable columns={columns} data={data} />
        }
      </ProtectedRoute>
    </ContentLayout>
  )
}

export default UsersPage
