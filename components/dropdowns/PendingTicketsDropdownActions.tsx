import { useUpdateCreditProvider } from "@/actions/providers/actions"
import { useUpdateStatusTicket } from "@/actions/tickets/transactions/actions"
import { useCreateTransaction } from "@/actions/transactions/actions"
import { useDeleteTicket } from "@/actions/tickets/actions"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UploadButton } from "@/lib/uploadthing"
import { Ticket } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { CalendarIcon, CreditCard, FileCheck, HandCoins, Loader2, MessageCircle, MessageCircleWarning, MoreHorizontal, TicketX, Trash, TriangleAlert, Pencil, Dot } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa"
import { IoIosPhonePortrait } from "react-icons/io"
import { SiZelle } from 'react-icons/si'
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import Image from "next/image"
import { format, isToday } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { convertAmountFromMiliunits, formatBolivares, formatCurrency } from '@/lib/utils'
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"

const formSchema = z.object({
  payment_ref: z.string().optional(),
  payment_method: z.string(),
  image_ref: z.string().optional(),
  transaction_note: z.string().optional(),
  void_description: z.string().optional(),
  transaction_date: z.date(),
});

const PendingTicketsDropdownActions = ({ ticket }: { ticket: Ticket }) => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState<boolean>(false);
  const [addImage, setAddImage] = useState<boolean>(false);
  const [openImage, setOpenImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState('');
  const [openVoid, setOpenVoid] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [openTransactionDate, setOpenTransactionDate] = useState(false)
  const [reason, setReason] = useState<"CancelledByClient" | "WrongSellerInput" | "WrongClientInfo">("CancelledByClient");
  const { createTransaction } = useCreateTransaction();
  const { deleteTicket } = useDeleteTicket();
  const { updateCreditProvider } = useUpdateCreditProvider();
  const { updateStatusTicket } = useUpdateStatusTicket();
  const refUrls = ticket.transaction?.image_ref.split(", ");

  const [openEditPassenger, setOpenEditPassenger] = useState(false);
  const [openEditTicket, setOpenEditTicket] = useState(false);
  const [openEditInfo, setOpenEditInfo] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image_ref: "",
    },
  });

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {

      // Ejecuta las mutaciones de forma concurrente
      await createTransaction.mutateAsync({
        ...values,
        image_ref: values.image_ref || "",
        ticketId: ticket.id,
        transaction_note: values.transaction_note || "",
        registered_by: session?.user.username || "",
        updated_by: session?.user.username || "",
      });
      await updateStatusTicket.mutateAsync({
        id: ticket.id,
        status: "POR_CONFIRMAR",
        updated_by: session?.user.username || ""
      });
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["paid"] });
      await queryClient.invalidateQueries({ queryKey: ["pending"] });
      toast.success("¡Pagado!", {
        description: "¡El pago ha sido registrado correctamente!",
      });
    } catch (error) {
      console.log(error);
      toast.error("Oops!", {
        description: `¡Hubo un error al procesar el pago!: ${error}`,
      });
    }
  };

  const onPaymentConfirm = async () => {
    try {
      await updateStatusTicket.mutateAsync({
        id: ticket.id,
        status: "PAGADO",
        updated_by: session?.user.username || ""
      });
      toast.error("¡Pagado!", {
        description: "¡El boleto ha sido pagado correctamente!",
      });
      setOpenConfirm(false);
      await queryClient.invalidateQueries({ queryKey: ["paid"] });
      await queryClient.invalidateQueries({ queryKey: ["pending"] });
    } catch (error) {
      console.log(error);
    }
  };

  const onDeletePending = async () => {
    try {
      await updateCreditProvider.mutateAsync({
        id: ticket.provider.id,
        credit: ticket.provider.credit + ticket.ticket_price,
      });

      await deleteTicket.mutateAsync(ticket.id);

      await queryClient.invalidateQueries({ queryKey: ["paid"] });
      await queryClient.invalidateQueries({ queryKey: ["pending"] });
    } catch (error) {
      console.log(error);
    }
    setOpenDelete(false);
  };

  const onVoidTicket = async () => {
    try {
      await updateStatusTicket.mutateAsync({
        id: ticket.id,
        status: "CANCELADO",
        void_description: reason ?? null,
        updated_by: session?.user.username || ""
      });
      await queryClient.invalidateQueries({ queryKey: ["paid"] });
      await queryClient.invalidateQueries({ queryKey: ["pending"] });
      toast.error("¡Cancelado!", {
        description: "¡El boleto ha sido cancelado correctamente!",
      });
    } catch (error) {
      console.log(error);
    }
    setOpenVoid(false);
  };

  return (
    <>
      {/* Dropdown Menu for Payment */}
      <DropdownMenu open={isDropdownMenuOpen} onOpenChange={setIsDropdownMenuOpen}>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          {/* Pay Option */}
          {
            !(!!ticket.transaction) && (
              <DropdownMenuItem onClick={() => {
                setOpen(true);
                setIsDropdownMenuOpen(false);
              }}>
                <HandCoins className='size-5 text-green-500' />
              </DropdownMenuItem>
            )
          }
          {/* Confirm Payment Option */}
          {
            (session?.user.user_role === "ADMINISTRADOR" || session?.user.user_role === "SUPERADMIN" || session?.user.user_role === "AUDITOR") && !!ticket.transaction && (
              <DropdownMenuItem onClick={() => {
                setOpenConfirm(true);
                setIsDropdownMenuOpen(false);
              }}>
                <FileCheck className="size-5 text-green-500" />
              </DropdownMenuItem>
            )
          }
          {/* Void Option */}
          <DropdownMenuItem disabled={!isToday(ticket.createdAt)} className="cursor-pointer" onClick={() => {
            setOpenVoid(true);
            setIsDropdownMenuOpen(false);
          }}>
            <TicketX className='size-5 text-rose-500' />
          </DropdownMenuItem>

          {/* Edit Option */}
          {session?.user.user_role === "SELLER" || session?.user.user_role === "SUPERADMIN" && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Pencil className="size-5 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-300 rounded-md shadow-lg p-2 space-y-2">
                <DropdownMenuItem onClick={() => {
                    setOpenEditPassenger(true);
                    setIsDropdownMenuOpen(false);
                  }} className="flex items-center border border-gray-200 rounded-md p-2 hover:bg-gray-100 cursor-pointer">
                  <span className="mr-2"> <Dot className="w-3 h-3 text-gray-500" /> </span> Editar Pasajero
                </DropdownMenuItem>
                <DropdownMenuItem  onClick={() => {
                    setOpenEditTicket(true);
                    setIsDropdownMenuOpen(false);
                  }}  className="flex items-center border border-gray-200 rounded-md p-2 hover:bg-gray-100 cursor-pointer">
                  <span className="mr-2"> <Dot className="w-3 h-3 text-gray-500" /> </span> Editar Ticket
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                    setOpenEditInfo(true);
                    setIsDropdownMenuOpen(false);
                  }}  className="flex items-center border border-gray-200 rounded-md p-2 hover:bg-gray-100 cursor-pointer">
                  <span className="mr-2"> <Dot className="w-3 h-3 text-gray-500" /> </span> Editar Información
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* delete Option */}
          <DropdownMenuItem className="cursor-pointer" onClick={() => {
            setOpenDelete(true);
            setIsDropdownMenuOpen(false);
          }}>
            <Trash className='size-5 text-rose-500' />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Payment Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">Registrar Transacción</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0 italic">
              Rellene los datos y montos para registrar la transacción
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Tipo de Pago</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione el tipo de pago..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EFECTIVO">
                            <div className="flex gap-2 items-center">
                              Efectivo <FaMoneyBillWave className="text-lg" />
                            </div>
                          </SelectItem>
                          <SelectItem value="ZELLE">
                            <div className="flex gap-2 items-center">
                              Zelle <SiZelle className="text-lg" />
                            </div>
                          </SelectItem>
                          <SelectItem value="CREDITO">
                            <div className="flex gap-2 items-center">
                              Credito <FaCreditCard className="text-lg" />
                            </div>
                          </SelectItem>
                          <SelectItem value="DEBITO">
                            <div className="flex gap-2 items-center">
                              Debito <CreditCard className="text-lg" />
                            </div>
                          </SelectItem>
                          <SelectItem value="PAGO_MOVIL">
                            <div className="flex gap-2 items-center">
                              Pago Móvil <IoIosPhonePortrait className="text-lg" />
                            </div>
                          </SelectItem>
                          <SelectItem value="TRANSFERENCIA">
                            <div className="flex gap-2 items-center">
                              Transferencia <IoIosPhonePortrait className="text-lg" />
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_ref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Comprobante de pago</FormLabel>
                      <FormControl>
                        <Input className="shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="XK-456" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comprobante del pago realizado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transaction_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className="font-bold">Fecha del Pago</FormLabel>
                      <Popover open={openTransactionDate} onOpenChange={setOpenTransactionDate}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-auto pl-3 text-left font-normal shadow-none border-b-1 border-r-0 border-t-0 border-l-0 bg-transparent",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", {
                                  locale: es
                                })
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(e) => {
                              field.onChange(e)
                              setOpenTransactionDate(false)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Fecha de compra del boleto
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {
                  form.watch("payment_method") === 'EFECTIVO' ? (
                    <>
                      <div className="flex flex-col gap-2 ">
                        <Label className="font-bold">Agregar Imagen</Label>
                        <Switch onCheckedChange={() => setAddImage(!addImage)} />
                      </div>
                      <FormField
                        control={form.control}
                        name="transaction_note"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">Nota de Pago</FormLabel>
                            <FormControl>
                              <Textarea className="shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="Ingrese nota de efectivo..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Nota del pago realizado.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {
                        addImage && (
                          <FormField
                            control={form.control}
                            name="image_ref" // Change the name to represent multiple images
                            render={({ field }) => (
                              <FormItem className="col-span-2 flex flex-col justify-start items-center mt-4 space-y-3">
                                <FormLabel className="font-bold">Imágenes Comprobantes de pago</FormLabel>
                                <FormControl>
                                  <UploadButton
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                      // Extract URLs from the response and merge with existing URLs
                                      const uploadedImages = res.map((file) => file.url);
                                      const currentImages = field.value ? field.value.split(', ') : [];
                                      const newImageRefs = [...currentImages, ...uploadedImages];
                                      const concatenatedUrls = newImageRefs.join(', ');

                                      // Update the form value
                                      form.setValue("image_ref", concatenatedUrls);
                                    }}
                                    onUploadError={(error: Error) => {
                                      toast.error(`Error: ${error.message}`);
                                    }}
                                    content={{
                                      button({ ready, isUploading }) {
                                        if (isUploading) return <div>Subiendo...</div>;
                                        return <div>{ready ? "Cargar Imágenes" : "Cargando..."}</div>;
                                      },
                                      allowedContent({ ready }) {
                                        if (!ready) return "Revisando que puedes subir...";
                                        return `¿Qué puedes subir?: imágenes.`;
                                      },
                                    }}
                                  />
                                </FormControl>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {(field.value ? field.value.split(', ') : []).map((url, index) => (
                                    <div key={index} className="relative">
                                      <Image
                                        width={128}
                                        height={128}
                                        src={url}
                                        alt={`Imagen ${index + 1}`}
                                        className="w-32 h-32 object-cover rounded"
                                      />
                                    </div>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      }
                    </>
                  ) : (
                    <FormField
                      control={form.control}
                      name="image_ref" // Change the name to represent multiple images
                      render={({ field }) => (
                        <FormItem className="col-span-2 flex flex-col justify-start items-center mt-4 space-y-3">
                          <FormLabel className="font-bold">Imágenes Comprobantes de pago</FormLabel>
                          <FormControl>
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                // Extract URLs from the response and merge with existing URLs
                                const uploadedImages = res.map((file) => file.url);
                                const currentImages = field.value ? field.value.split(', ') : [];
                                const newImageRefs = [...currentImages, ...uploadedImages];
                                const concatenatedUrls = newImageRefs.join(', ');

                                // Update the form value
                                form.setValue("image_ref", concatenatedUrls);
                              }}
                              onUploadError={(error: Error) => {
                                toast.error(`Error: ${error.message}`);
                              }}
                              content={{
                                button({ ready, isUploading }) {
                                  if (isUploading) return <div>Subiendo...</div>;
                                  return <div>{ready ? "Cargar Imágenes" : "Cargando..."}</div>;
                                },
                                allowedContent({ ready }) {
                                  if (!ready) return "Revisando que puedes subir...";
                                  return `¿Qué puedes subir?: imágenes.`;
                                },
                              }}
                            />
                          </FormControl>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(field.value ? field.value.split(', ') : []).map((url, index) => (
                              <div key={index} className="relative">
                                <Image
                                  width={128}
                                  height={128}
                                  src={url}
                                  alt={`Imagen ${index + 1}`}
                                  className="w-32 h-32 object-cover rounded"
                                />
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                }
              </div>
              <DialogFooter className="mt-12 flex flex-col gap-2 md:flex-row">
                <Button type="button" variant={"destructive"} onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={createTransaction.isPending || updateStatusTicket.isPending} type="submit" className="bg-green-700 hover:bg-green-600 text-white flex justify-center">
                  {
                    createTransaction.isPending ? <Loader2 className="size-4 animate-spin" /> : "Registrar Transacción"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Void Ticket Confirmation Dialog */}
      <Dialog open={openVoid} onOpenChange={setOpenVoid}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">¿Cancelar Boleto?</DialogTitle>
            <DialogDescription className="text-center">
              Selecciona el motivo de la cancelación
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={(e: "CancelledByClient" | "WrongSellerInput" | "WrongClientInfo") => setReason(e)} defaultValue={"CancelledByClient"}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una razón..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CancelledByClient">Cancelado por usuario</SelectItem>
              <SelectItem value="WrongSellerInput">Ingreso erróneo de datos</SelectItem>
              <SelectItem value="WrongClientInfo">Información recibida errónea</SelectItem>
              <SelectItem value="ClientDidNotPay">Cliente no pago a tiempo</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="button" variant={"destructive"} onClick={() => setOpenVoid(false)}>Cancelar</Button>
            <Button onClick={onVoidTicket} disabled={updateStatusTicket.isPending} className="bg-primary text-white">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Confirm Payment Dialog*/}

      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">Confirmar Pago</DialogTitle>
            <DialogDescription className="text-center">
              Indique que se ha verificado el pago, y el boleto ha sido pagado.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center grid grid-cols-3 justify-between items-center mb-4 gap-4">
            <div className="flex flex-col items-center"><p className="font-medium underline">Total: </p><p>{formatCurrency(convertAmountFromMiliunits(ticket?.total)) || "N/A"}</p></div>
            <div className="flex flex-col items-center"><p className="font-medium underline">Tasa: </p><p>{formatBolivares(convertAmountFromMiliunits(ticket?.rate)) || "N/A"}</p></div>
            <div className="flex flex-col items-center"><p className="font-medium underline">Total en Bs.: </p><p>{formatBolivares(convertAmountFromMiliunits(ticket?.total_bs)) || "N/A"}</p></div>
            <div className="flex flex-col col-span-3 items-center"><p className="font-medium underline">Referencia: </p><p>{ticket?.transaction?.payment_ref || "N/A"}</p></div>

          </div>
          {
            !!ticket?.transaction?.image_ref ? (
              <>
                {
                  ticket.transaction.transaction_note && (
                    <div className="flex flex-col items-center"><p className="font-medium underline">Nota de Pago: </p><p>{ticket.transaction.transaction_note || "N/A"}</p></div>
                  )
                }
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
              </>
            ) : <>
              {
                ticket?.transaction?.transaction_note && (
                  <div className="flex flex-col items-center"><p className="font-medium underline">Nota de Pago: </p><p>{ticket.transaction.transaction_note || "N/A"}</p></div>
                )
              }
              <p className="text-sm text-muted-foreground italic text-center">No hay imagen de referencia...</p>
            </>
          }

          <DialogFooter>
            <Button variant={"outline"} type="button" onClick={() => setOpenVoid(false)}>Cancelar</Button>
            <Button onClick={onPaymentConfirm} disabled={updateStatusTicket.isPending}>
              {updateStatusTicket.isPending ? <Loader2 className="size-4 animate-spin" /> : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/*Confirm Delete Dialog*/}

      <Dialog open={openDelete} onOpenChange={setOpenDelete} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">Eliminar Boleto</DialogTitle>
            <DialogDescription className="text-center flex gap-2">
              <TriangleAlert /> ¿Seguro que desea eliminar el Boleto? Esto modificara el credito del proveedor. Hacerlo con conciencia. <TriangleAlert />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant={"outline"} type="button" onClick={() => setOpenDelete(false)}>Cancelar</Button>
            <Button variant={"destructive"} onClick={onDeletePending} disabled={updateStatusTicket.isPending || deleteTicket.isPending}>
              {(updateStatusTicket.isPending || deleteTicket.isPending) ? <Loader2 className="size-4 animate-spin" /> : "Eliminar Boleto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/*Show Image*/}

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
    </>
  )
}

export default PendingTicketsDropdownActions;
