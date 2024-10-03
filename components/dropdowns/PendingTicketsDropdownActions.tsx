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
import { CreditCard, HandCoins, Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useUpdateStatusTicket } from "@/actions/tickets/transactions/actions"
import { SiZelle } from 'react-icons/si'
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { useSession } from "next-auth/react"
import { AmountInput } from "../misc/AmountInput"
import { convertAmountToMiliunits } from "@/lib/utils"
import { Input } from "../ui/input"

const formSchema = z.object({
  ticket_price: z.string(),
  fee: z.string(),
  total: z.string(),
  rate: z.string(),
  total_bs: z.string(),
  payment_ref: z.string(),
  payment_method: z.string(),
});


const PendingTicketsDropdownActions = ({ id }: { id: string }) => {
  const { data: session } = useSession()
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false); // Delete dialog
  const { createTransaction } = useCreateTransaction();
  const { updateStatusTicket } = useUpdateStatusTicket();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {

    },
  });
  const {watch, setValue} = form 
  const ticket_price = watch('ticket_price')
  const fee = watch('fee')
  const rate = watch('rate')
  useEffect(() => {
    const total = (parseFloat(ticket_price || "0") + parseFloat(fee || "0")).toFixed(2);
    setValue('total', total);
    const total_bs = (parseFloat(total || "0") * parseFloat(rate || "0")).toFixed(2);
    setValue('total_bs', total_bs)
  }, [ticket_price, fee, rate, setValue]);



  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const ticketPriceInMiliunits = convertAmountToMiliunits(parseFloat(values.ticket_price))
    const feeInMiliunits = convertAmountToMiliunits(parseFloat(values.fee))
    const totalInMiliunits = convertAmountToMiliunits(parseFloat(values.total))
    const totalBsMiliunits = convertAmountToMiliunits(parseFloat(values.total_bs))
    const rateMiliunits = convertAmountToMiliunits(parseFloat(values.rate))
    try {
      const res = await createTransaction.mutateAsync({
        ...values,
        ticket_price: ticketPriceInMiliunits,
        fee: feeInMiliunits,
        total: totalInMiliunits,
        rate: rateMiliunits,
        total_bs: totalBsMiliunits,
        ticketId: id,
        registered_by: session?.user.username || "",
        transaction_date: new Date()
      });
      if (res.status === 200) {
        await updateStatusTicket.mutateAsync({
          id: id,
          status: "PAGADO",
          registered_by: session?.user.username || ""
        })
      }
      setOpen(false);
    } catch (error) {
      console.log(error)
    }
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
          <DropdownMenuItem onClick={() => {
            setOpen(true);
            setIsDropdownMenuOpen(false);
          }}>
            <HandCoins className='size-5 text-green-500' />
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
                  name="ticket_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Precio del Boleto</FormLabel>
                      <FormControl>
                        <AmountInput {...field} placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold"><span className="italic">Fee</span> de Emisión</FormLabel>
                      <FormControl>
                        <AmountInput {...field} placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Total a Cobrar</FormLabel>
                      <FormControl>
                        <AmountInput {...field} placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Tipo de Pago</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Tasa</FormLabel>
                      <FormControl>
                        <AmountInput {...field} prefix="Bs " placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total_bs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Total en Bolivares</FormLabel>
                      <FormControl>
                        <AmountInput {...field} prefix="Bs " placeholder="0.00" />
                      </FormControl>
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
                <DialogFooter className="flex flex-col gap-2 md:gap-0">
                  <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setOpen(false)} type="button">
                    Cancelar
                  </Button>
                  <Button
                    disabled={createTransaction.isPending} // Disable button while mutation is pending
                    className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
                  >
                    {createTransaction.isPending ? <Loader2 className="animate-spin" /> : "Confirmar"} {/* Show loader */}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>

        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingTicketsDropdownActions;
