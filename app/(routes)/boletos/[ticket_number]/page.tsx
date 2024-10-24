"use client"

import { useGetTicket } from '@/actions/tickets/actions'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoadingPage from '@/components/misc/LoadingPage'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { IdCard, MailCheck, Phone, User } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'

const TicketPage = () => {
  const params = useParams<{ticket_number: string}>()
  const {data: ticket, loading} = useGetTicket(params.ticket_number)

  if(loading) {
    return <LoadingPage />
  }
  return (
    <ContentLayout title={`Ticket - ${params.ticket_number}`}>
        <h1 className='text-5xl italic font-bold text-center p-2'>Detalles de Boleto <br /> <span className='text-primary'>{params.ticket_number}</span></h1>
        <p className='text-sm text-muted-foreground italic text-center'>Emitido por: {ticket?.issued_by}</p>
        <div className='max-w-4xl mx-auto grid grid-cols-2 shadow-md border border-primary rounded-md shadow-primary/75 mt-4'>
            <div className='p-2'>
            <div className='flex flex-col items-center justify-center'>
                <h1 className='font-bold'>Pasajero</h1>
                <Separator className='w-[90px]' />
                </div>
                <div className='p-4 rounded-sm space-y-2 text-center flex justify-center flex-col items-center'>
                    <div className='flex gap-2 items-center text-center'>
                    <User />
                    <p className='font-medium italic'>{ticket?.passanger.first_name} {ticket?.passanger.last_name}</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                    <IdCard/>
                    <p><span className='font-bold'>{ticket?.passanger.dni_type}-</span>{ticket?.passanger.dni_number}</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                    <Phone />
                    <p>{ticket?.passanger.phone_number}</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <MailCheck />
                    <p>{ticket?.passanger.email}</p>
                    </div>
                </div>
            </div>
            <div className='p-2'>
                <div className='flex flex-col items-center justify-center'>
                <h1 className='font-bold'>Cliente</h1>
                <Separator className='w-[90px]' />
                </div>
                <div className='p-4 rounded-sm space-y-2 text-center flex justify-center flex-col items-center'>
                    <div className='flex gap-2 items-center text-center'>
                    <User />
                    <p className='font-medium italic'>{ticket?.passanger.client.first_name} {ticket?.passanger.client.last_name}</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                    <IdCard/>
                    <p>{ticket?.passanger.client.dni}</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                    <Phone />
                    <p>{ticket?.passanger.client.phone_number}</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <MailCheck />
                    <p>{ticket?.passanger.client.email}</p>
                    </div>
                </div>
            </div>
            <div className='col-span-2'>
            <div className='flex flex-col items-center justify-center'>
                <h1 className='font-bold'>Boleto</h1>
                <Separator className='w-[340px]' />
                </div>
                <div className='max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center mt-2 p-4'>
                    <p><span className='font-medium underline'>Proveedor:</span> <br /> {ticket?.provider.name}</p>
                    <p><span className='font-medium underline'>Fecha:</span> <br /> {format(ticket!.flight_date, "PPP", {locale:es})}</p>
                    <p><span className='font-medium underline'>Ruta:</span> <br /> {ticket?.route.origin} - {ticket?.route.destiny}</p>
                    <p><span className='font-medium underline'>Precio:</span> <br /> {formatCurrency(ticket!.ticket_price)}</p>
                    <p><span className='font-medium underline'>Fee:</span> <br /> {formatCurrency(ticket!.fee)}</p>
                    <p><span className='font-medium underline'>Total:</span> <br /> {formatCurrency(ticket!.total)}</p>
                    <p><span className='font-medium underline'>Metodo de Pago:</span> <br /> {ticket?.transaction?.payment_method}</p>
                    <p><span className='font-medium underline'>Ref:</span> <br /> {ticket?.transaction?.payment_ref}</p>
                    <p><span className='font-medium underline'>Fecha de Pago:</span> <br /> {ticket?.transaction?.transaction_date ? format(ticket?.transaction?.transaction_date, "PPP", {locale: es}) : "Aún por pagar."}</p>
                </div>
            </div>
        </div>
    </ContentLayout>
  )
}

export default TicketPage