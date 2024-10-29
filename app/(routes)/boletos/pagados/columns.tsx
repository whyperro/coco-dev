"use client"

import PaidTicketsDropdownActions from "@/components/dropdowns/PaidTicketsDropdownActions"
import PendingTicketsDropdownActions from "@/components/dropdowns/PendingTicketsDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { convertAmountFromMiliunits } from "@/lib/utils"
import { Ticket } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Download } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<Ticket>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-full flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-full flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ticket_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Nro. de Ticket' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.ticket_number}</div>
    },
  },
  {
    accessorKey: "booking_ref",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Localizador' />
    ),
    cell: ({ row }) => {
      return <div className="text-center italic text-muted-foreground">{row.original.booking_ref}</div>
    },
  },
  {
    accessorKey: "passanger",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.passanger.client.first_name} {row.original.passanger.client.last_name}</div>
    },
  },
  {
    accessorKey: "passanger",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pasajero(s)' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.passanger.first_name} {row.original.passanger.last_name}</div>
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Pagado' />
    ),
    cell: ({ row }) => {
      return <p className="text-center font-bold">${convertAmountFromMiliunits(row.original.total)}</p>
    },
  },
  {
    accessorKey: "transaction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ref.' />
    ),
    cell: ({ row }) => {
      return <div className="flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
        {row.original.transaction?.image_ref ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <a href={row.original.transaction?.image_ref} download className="text-green-500">
                  <Download />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Descargar Imagen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="text-muted-foreground">{row.original.transaction?.payment_ref}</div>
        )}
      </div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <PaidTicketsDropdownActions ticket_number={row.original.ticket_number} />
      )
    },
  }
]
