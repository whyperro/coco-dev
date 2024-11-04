import { useUpdateCreditProvider } from "@/actions/providers/actions"
import { useUpdateStatusTicket } from "@/actions/tickets/transactions/actions"
import { useCreateTransaction } from "@/actions/transactions/actions"
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
import { Ticket } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { CreditCard, HandCoins, Loader2, MoreHorizontal, TicketX } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa"
import { IoIosPhonePortrait } from "react-icons/io"
import { SiZelle } from 'react-icons/si'
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { UploadButton } from "@/lib/uploadthing"

const formSchema = z.object({
  payment_ref: z.string(),
  payment_method: z.string(),
  image_ref: z.string().optional(),// Change from File to string to store URL,
  void_description: z.string().optional(),
});

const PendingTicketsDropdownActions = ({ ticket }: { ticket: Ticket }) => {
  const { data: session } = useSession()
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [imgName, setImgName] = useState<string>();
  const [openVoid, setOpenVoid] = useState<boolean>(false);
  const [reason, setReason] = useState<"CancelledByClient" | "WrongSellerInput" | "WrongClientInfo">("CancelledByClient");
  const { createTransaction } = useCreateTransaction();
  const { updateCreditProvider } = useUpdateCreditProvider();
  const { updateStatusTicket } = useUpdateStatusTicket();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image_ref: "", // Set default value for image_ref,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Use the uploaded image URL directly from the form values
      const imageUrl = values.image_ref || ""; // Assuming the URL will be stored in image_ref

      const res = await createTransaction.mutateAsync({
        ...values,
        image_ref: imageUrl,
        ticketId: ticket.id,
        registered_by: session?.user.username || "",
        transaction_date: new Date()
    });

      if (res.status === 200) {
        await updateCreditProvider.mutateAsync({
          id: ticket.provider.id,
          credit: ticket.provider.credit + ticket.ticket_price,
        });
      }

      await updateStatusTicket.mutateAsync({
        id: ticket.id,
        status: "PAGADO",
        updated_by: `${session?.user.first_name} ${session?.user.last_name}` || ""
      });

      toast.success("¡Pagado!", {
        description: "¡El boleto ha sido pagado correctamente!",
      });

      setOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onVoidTicket = async () => {
    try {
      await updateStatusTicket.mutateAsync({
        id: ticket.id,
        status: "CANCELADO",
        void_description: reason ?? null,
        updated_by: session?.user.username || ""
      });
      toast.error("¡Cancelado!", {
        description: "¡El boleto ha sido cancelado correctamente!",
      });
    } catch (error) {
      console.log(error);
    }
    setOpenVoid(false);
  };
console.log(imgName)
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
          <DropdownMenuItem onClick={() => {
            setOpen(true);
            setIsDropdownMenuOpen(false);
          }}>
            <HandCoins className='size-5 text-green-500' />
          </DropdownMenuItem>
          {/* Void Option */}
          <DropdownMenuItem className="cursor-pointer" onClick={() => {
            setOpenVoid(true);
            setIsDropdownMenuOpen(false);
          }}>
            <TicketX className='size-5 text-rose-500' />
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
              <div className="grid gap-4 grid-cols-2">
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
                        <Input className="w-[200px] shadow-none border-b-1 border-r-0 border-t-0 border-l-0" placeholder="XK-456" {...field} />
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
                  name="image_ref"
                  render={({ field }) => (
                    <FormItem className="col-span-2 flex flex-col justify-start items-center mt-4 space-y-3">
                      <FormLabel className="font-bold">Imagen Comprobante de pago</FormLabel>
                      <FormControl>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          const fileUrl = res[0]?.url; // Asumiendo que la respuesta contiene la URL
                          setImgName(res[0].name);
                          form.setValue("image_ref", fileUrl);
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Error: ${error.message}`);
                        }}
                        content={{
                          button({ ready, isUploading }) {
                            if (isUploading) return <div>Subiendo...</div>;
                            if (imgName) return <div>{imgName}</div>; // Mostrar el nombre del archivo si existe
                            return <div>{ready ? "Cargar Imagen" : "Cargando..."}</div>; // Cambiar el texto dependiendo del estado
                          },
                          allowedContent({ ready }) {
                            if (!ready) return "Revisando que puedes subir...";
                            return `¿Qué puedes subir?: imágenes.`;
                          },
                        }}
                      />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="mt-12">
                <Button disabled={updateStatusTicket.isPending || createTransaction.isPending || createTransaction.isSuccess} type="submit" className="bg-green-500 hover:bg-green-600 text-white flex justify-center">
                  {
                   updateStatusTicket.isPending || createTransaction.isPending ? <Loader2 className="size-4 animate-spin" /> : "Registrar Transacción"
                  }
                </Button>
                <Button type="button" onClick={() => setOpen(false)}>Cancelar</Button>
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
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <Button onClick={() => setReason("CancelledByClient")}>Cancelado por el Cliente</Button>
            </div>
            <div>
              <Button onClick={() => setReason("WrongSellerInput")}>Error en el vendedor</Button>
            </div>
            <div>
              <Button onClick={() => setReason("WrongClientInfo")}>Error en la información del cliente</Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onVoidTicket} className="bg-red-500 hover:bg-red-600 text-white">Confirmar Cancelación</Button>
            <Button type="button" onClick={() => setOpenVoid(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PendingTicketsDropdownActions;
