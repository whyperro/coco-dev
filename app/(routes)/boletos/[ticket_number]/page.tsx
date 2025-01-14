"use client"

import { useGetTicket } from '@/actions/tickets/actions'
import LoadingPage from '@/components/misc/LoadingPage'
import { ContentLayout } from '@/components/sidebar/ContentLayout'
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator'
import { convertAmountFromMiliunits, formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { IdCard, MailCheck, Phone, TicketCheck, User } from 'lucide-react'
import Image from "next/image"
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'



const TicketPage = () => {
    const params = useParams<{ ticket_number: string }>()
    const { data: ticket, loading } = useGetTicket(params.ticket_number)
    const [api, setApi] = useState<CarouselApi>()
    const refUrls = ticket?.transaction?.image_ref.split(", ");
    const [count, setCount] = useState(0)
    const [current, setCurrent] = useState(0)
    const [openImage, setOpenImage] = useState(false)
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    if (loading) {
        return <LoadingPage />
    }
    return (
        <ContentLayout title={`Ticket  #${params.ticket_number}`}>
            <h1 className='text-5xl italic font-bold text-center p-2'>Detalles de Boleto <br /> <span className='text-primary flex justify-center items-center gap-3'><TicketCheck className='size-12' /> #{params.ticket_number}</span></h1>
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
                            <IdCard />
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
                            <IdCard />
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
                        <p><span className='font-medium underline'>Fecha:</span> <br /> {format(ticket!.flight_date, "PPP", { locale: es })}</p>
                        <p><span className='font-medium underline'>Precio:</span> <br /> {formatCurrency(convertAmountFromMiliunits(ticket!.ticket_price))}</p>
                        <p><span className='font-medium underline'>Fee:</span> <br /> {formatCurrency(convertAmountFromMiliunits(ticket!.fee))}</p>
                        <p><span className='font-medium underline'>Total:</span> <br /> {formatCurrency(convertAmountFromMiliunits(ticket!.total))}</p>
                        <p><span className='font-medium underline'>Metodo de Pago:</span> <br /> {ticket?.transaction?.payment_method}</p>
                        <p><span className='font-medium underline'>Fecha de Pago:</span> <br /> {ticket?.transaction?.transaction_date ? format(ticket?.transaction?.transaction_date, "PPP", { locale: es }) : "Aún por pagar."}</p>
                        <p><span className='font-medium underline'>Ref:</span> <br /> {ticket?.transaction?.payment_ref}</p>


                    </div>

                    {
                        !!ticket?.transaction?.image_ref ? (
                            <div className="mx-auto max-w-xs mt-4">
                                <Carousel setApi={setApi} >
                                    <CarouselContent>
                                        {
                                            refUrls && refUrls.map((ref) => (
                                                <CarouselItem key={ref}>
                                                    <div onClick={() => { setOpenImage(true); setSelectedImage(ref) }

                                                    } className="flex justify-center cursor-pointer">
                                                        <Image src={ref} alt="Imagen de referencia" width={100} height={100} className="h-52 w-48" />
                                                    </div>
                                                </CarouselItem>
                                            ))
                                        }
                                    </CarouselContent>
                                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10" />
                                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10" />
                                </Carousel>
                                <div className="py-2 text-center text-sm text-muted-foreground">
                                    Referencia {current} de {count}
                                </div>
                            </div>
                        ) : <p className="text-sm text-muted-foreground italic text-center">No hay imagen de referencia...</p>
                    }

                </div>
            </div>
            <Dialog open={openImage} onOpenChange={setOpenImage}>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Imagen de referencia</DialogTitle>
                    </DialogHeader>
                    {selectedImage && (
                        <div className="flex justify-center">
                            <Image
                                src={selectedImage}
                                alt="Imagen seleccionada"
                                width={300}
                                height={300}
                                className=" w-[1000px] object-contain"
                            />
                        </div>
                    )}
                    <DialogFooter className="sm:justify-start">
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ContentLayout>
    )
}

export default TicketPage
