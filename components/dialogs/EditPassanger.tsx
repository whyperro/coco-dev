import { useUpdateCreditProvider } from "@/actions/providers/actions"
import { useUpdateStatusTicket } from "@/actions/tickets/transactions/actions"
import { useCreateTransaction } from "@/actions/transactions/actions"
import { useDeleteTicket, useUpdatePassenger } from "@/actions/tickets/actions"
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
  
    passanger_name: z.string(),
    passanger_lastname: z.string(),
    passanger_dni_type: z.enum(["V", "E", "J", "PARTIDA_NACIMIENTO", "PASAPORTE"]), // Ejemplo para un tipo de documento venezolano
    passanger_id: z.string(),
    passanger_phone: z.string().optional(),
    passanger_email: z.string().optional(),
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
  
    const { updatePassenger } = useUpdatePassenger();
  
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
  
    useEffect(() => {
      if (openEditPassenger && ticket?.passanger) {
        form.setValue("passanger_name", ticket.passanger.first_name);
        form.setValue("passanger_lastname", ticket.passanger.last_name);
        form.setValue("passanger_dni_type", ticket.passanger.dni_type);
        form.setValue("passanger_id", ticket.passanger.dni_number);
        form.setValue("passanger_phone", ticket.passanger.phone_number ?? 'N/A');
        form.setValue("passanger_email", ticket.passanger.email ?? 'N/A');
      }
    }, [openEditPassenger, ticket?.passanger]);
}