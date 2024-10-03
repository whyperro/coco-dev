"use client"

import RegisterRouteForm from '@/components/forms/RegisterRouteForm'
import TicketForm from '@/components/forms/TicketForm'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Separator } from '@/components/ui/separator'


const ProviderPage = () => {
  return (
    <ContentLayout title='Boletos'>
        <div className="text-center mt-4">
            <h1 className='text-5xl font-bold mb-3'>Registro de Boletos</h1>
            <p className="text-muted-foreground italic text-sm">Rellene los diferentes datos para el registro de un boleto</p>
        </div>
        <TicketForm />
    </ContentLayout>
  )
}

export default ProviderPage
