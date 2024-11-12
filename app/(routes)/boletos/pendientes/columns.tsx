"use client"

import PendingTicketsDropdownActions from "@/components/dropdowns/PendingTicketsDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Ticket } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { TicketMinus } from "lucide-react"

export const columns: ColumnDef<Ticket>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <div className="w-full flex justify-center">
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="w-full flex justify-center">
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "ticket_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Nro. de Ticket' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold flex gap-2 items-center justify-center"><TicketMinus className="size-4 text-yellow-600" /> {row.original.ticket_number}</div>
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
    accessorKey: "provider",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    cell: ({ row }) => {
      return <p className="text-center font-bold">{row.original.provider.name}</p>
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
            <p key={route.id} className="italic text-muted-foreground">{route.origin} {route.scale ? `- ${route.scale}` : ""}  - {route.destiny}</p>
          ))
        }
      </div>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Fecha de Emis.' />
    ),
    cell: ({ row }) => {
      return <div className="flex justify-center">
        <p className="text-center text-muted-foreground italic">{format(row.original.createdAt, 'yyyy-MM-dd')}</p>
      </div>
    },
  },
  {
    accessorKey: "registered_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Registrado por' />
    ),
    cell: ({ row }) => {
      return <div className="flex justify-center">
        <Badge className="text-center font-bold bg-blue-600">{row.original.registered_by}</Badge>
      </div>
    },
  },
  {
    accessorKey: "statusUpdatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const isPaid = !!row.original.transaction; // Verifica si existe la transacción
      const badgeColor = isPaid ? "bg-green-500" : "bg-yellow-600";
      const badgeText = isPaid ? "Por Confirmar" : "Por Pagar";

      return (
        <div className="flex justify-center">
          <Badge className={cn("text-center font-bold hover:cursor-pointer", badgeColor)}>
            {badgeText}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <PendingTicketsDropdownActions ticket={row.original} />
      )
    },
  }
]
