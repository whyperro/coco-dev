import { useUpdateStatusTicket } from "@/actions/tickets/transactions/actions"
import { useCreateTransaction } from "@/actions/transactions/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, HandCoins, MoreHorizontal } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import Link from "next/link"



const formSchema = z.object({
  isCanceled: z.boolean().default(false),
  payment_ref: z.string().optional(),
  payment_method: z.string().optional(),
});


const PaidTicketsDropdownActions = ({ ticket_number }: { ticket_number?: string }) => {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);
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
          <DropdownMenuItem>
            <Link href={`/boletos/${ticket_number}`}>
              <EyeIcon className="size-5  hover:scale-125 transition-all" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default PaidTicketsDropdownActions;
