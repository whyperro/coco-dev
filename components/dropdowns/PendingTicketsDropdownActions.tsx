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



const formSchema = z.object({
  isCanceled: z.boolean().default(false),
  payment_ref: z.string().optional(),
  payment_method: z.string().optional(),
  image_ref: z.instanceof(File).optional()
});


const PendingTicketsDropdownActions = ({ id }: { id: string }) => {
  const { data: session } = useSession()
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false); // Delete dialog
  const [openVoid, setOpenVoid] = useState<boolean>(false); // Delete dialog
  const { createTransaction } = useCreateTransaction();
  const { updateStatusTicket } = useUpdateStatusTicket();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {

    },
  });
  const { watch } = form
  const isCanceled = watch('isCanceled')
  console.log(isCanceled)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let imageUrl = '';

      // Handle the image upload
      const file = values.image_ref; // Get the file from the form input
      if (file) {
        // Create a FormData object to send the file in a multipart form request
        const formData = new FormData();
        formData.append('file', file); // Append the file
        formData.append('fileName', `referencia_${values.payment_ref}`); // Append a unique file name

        // Send the file to your API to store it
        const { data } = await axios.post('/api/upload', formData);

        const { fileUrl } = data; // Extract the file URL from the response
        imageUrl = fileUrl; // Store the uploaded image URL
      }

      // Now, save the transaction with the image URL in the database
      await createTransaction.mutateAsync({
        ...values,
        image_ref: imageUrl || "", // Store the image URL
        ticketId: id,
        payment_method: values.payment_method || "",
        payment_ref: values.payment_ref || "",
        registered_by: session?.user.username || "",
        transaction_date: new Date()
      });

      await updateStatusTicket.mutateAsync({
        id: id,
        status: "PAGADO",
        registered_by: session?.user.username || ""
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
        id: id,
        status: "CANCELADO",
        registered_by: session?.user.username || ""
      })
      toast.error("¡Cancelado!", {
        description: "¡El boleto ha sido cancelado correctamente!",
      });
    } catch (error) {
      console.log(error)
    }
  }

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
                    <FormItem className="col-span-2">
                      <FormLabel className="font-bold">Imagen Comprobante de pago</FormLabel>
                      <FormControl>
                        <Input type="file" onChange={(e) => field.onChange(e.target.files)} className="w-[400px]" />
                      </FormControl>
                      <FormDescription>
                        Añade una imagen del comprobante de pago referencia
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="flex flex-col gap-2 md:gap-0 col-span-2">
                  <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="button">
                    Cancelar
                  </Button>
                  <Button
                    disabled={createTransaction.isPending} // Disable button while mutation is pending
                    className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                  >
                    {updateStatusTicket.isPending ? <Loader2 className="animate-spin" /> : "Confirmar"} {/* Show loader */}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>

        </DialogContent>
      </Dialog>
      <Dialog open={openVoid} onOpenChange={setOpenVoid}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              Seleccione el campo para cancelar el boleto
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 grid-cols-2">
            <DialogFooter className="flex flex-col gap-2 md:gap-0">
              <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="button">
                Cancelar
              </Button>
              <Button
                name="is"
                disabled={updateStatusTicket.isPending} // Disable button while mutation is pending
                className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                onClick={() => onVoidTicket()}
              >
                {updateStatusTicket.isPending ? <Loader2 className="animate-spin" /> : "Confirmar"} {/* Show loader */}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingTicketsDropdownActions;
