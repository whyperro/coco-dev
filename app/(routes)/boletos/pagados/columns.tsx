"use client"

import PendingTicketsDropdownActions from "@/components/dropdowns/PendingTicketsDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { convertAmountFromMiliunits } from "@/lib/utils"
import { Ticket } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
    accessorKey: "route",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ruta' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.route.origin} - {row.original.route.destiny}</div>
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
      <DataTableColumnHeader column={column} title='Pasajere' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.passanger.first_name} {row.original.passanger.last_name}</div>
    },
  },
  {
    accessorKey: "transaction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Pagado' />
    ),
    cell: ({ row }) => {
      return <p className="text-center font-bold">${convertAmountFromMiliunits(row.original.transaction.total)}</p>
    },
  },

  {
    accessorKey: "transaction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de Pago' />
    ),
    cell: ({ row }) => {
      return <p className="text-center font-bold">{format(row.original.transaction.transaction_date, "PPP", {
        locale: es
      })}</p>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      return <div className="flex justify-center">
        <Badge className="text-center font-bold bg-green-500">{row.original.status}</Badge>
      </div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <PendingTicketsDropdownActions id={id.toString()} />
      )
    },
  }
]
