"use client"

import PendingTicketsDropdownActions from "@/components/dropdowns/PendingTicketsDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Ticket } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

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
    accessorKey: "flight_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de Vuelo' />
    ),
    cell: ({ row }) => {
      return <div className="text-center text-muted-foreground italic font-medium">{row.original.flight_date}</div>
    },
  },
  {
    accessorKey: "client",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      return <p className="text-center font-bold">{row.original.passanger.client.first_name} {row.original.passanger.client.last_name}</p>
    },
  },
  {
    accessorKey: "passanger",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pasajero(s)' />
    ),
    cell: ({ row }) => {
      return <p className="text-center font-bold">{row.original.passanger.first_name} {row.original.passanger.last_name}</p>
    },
  },
  {
    accessorKey: "routes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ruta de Vuelo' />
    ),
    cell: ({ row }) => {
      const routes = row.original.routes
      return <div className="text-center flex flex-col gap-2 justify-center">
        {
          routes.map((route) => (
            <p className="italic text-muted-foreground">{route.origin} - {route.scale ?? ""}  - {route.destiny}</p>
          ))
        }
      </div>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      return <div className="flex justify-center">
        <Badge className="text-center font-bold bg-yellow-500">{row.original.status}</Badge>
      </div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <PendingTicketsDropdownActions ticket={row.original} />
      )
    },
  }
]
