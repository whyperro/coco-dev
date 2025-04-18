"use client"

import PaidTicketsDropdownActions from "@/components/dropdowns/PaidTicketsDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { convertAmountFromMiliunits } from "@/lib/utils"
import { Ticket } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { Download, TicketCheck } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticket_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Nro. de Ticket' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold flex gap-2 items-center justify-center"><TicketCheck className="size-4 text-green-700" /> {row.original.ticket_number ?? "N/A"}</div>
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
    accessorKey: "routes",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Ruta de Vuelo" />
    ),
    cell: ({ row }) => {
      const routes = row.original.routes;
      return (
        <div className="text-center flex flex-col gap-2 justify-center">
          {routes.map((route) => (
            <p key={route.id} className="italic text-muted-foreground">
              {route.origin} {route.scale ? `- ${route.scale}` : ""} - {route.destiny}
            </p>
          ))}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const routes = row.getValue(columnId);
      if (!Array.isArray(routes)) return false;

      return routes.some(route => {
        const routeString = `${route.origin} ${route.destiny}`.toLowerCase();
        return routeString.includes(filterValue.toLowerCase());
      });
    },
  },
  {
    accessorKey: "provider",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.provider.name}</div>
    },
  },
  {
    accessorKey: "client",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.passanger.first_name} {row.original.passanger.last_name}</div>
    },
  },
  {
    accessorKey: "passanger",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pasajero' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.passanger.first_name} {row.original.passanger.last_name}</div>
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Monto' />
    ),
    cell: ({ row }) => {
      return <div className="flex justify-center">
        <Badge className="text-center font-bold hover:cursor-default">${convertAmountFromMiliunits(row.original.total)}</Badge>
      </div>
    },
  },
  {
    accessorKey: "transaction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Registrado' />
    ),
    cell: ({ row }) => {
      return <div className="text-center italic text-muted-foreground">{row.original.transaction?.registered_by}</div>
    },
  },
  {
    accessorKey: "transaction",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ref.' />
    ),
    cell: ({ row }) => {
      const refUrls = row.original.transaction?.image_ref.split(", ")
      return (
        <div className="flex items-center justify-center">
          {row.original.transaction?.image_ref ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-col gap-2">
                  {
                    refUrls && refUrls.map((ref, index) => (
                      <div key={ref} className="cursor-pointer hover:scale-110 transition-all">
                        <a
                          className="flex gap-2 items-center"
                          href={ref}
                          download={`referencia_${row.original.ticket_number}_${row.original.transaction!.payment_ref}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download />
                          <p>{row.original.transaction!.payment_ref ? `${row.original.booking_ref} - ${index + 1}` : "Sin referencia..."}</p>
                        </a>
                      </div>
                    ))
                  }
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descargar Imagen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="text-muted-foreground flex justify-center">
              {row.original.transaction?.payment_ref ? row.original.transaction?.payment_ref : row.original.transaction?.transaction_note ? row.original.transaction?.transaction_note : "Sin referencia, ni nota..."}
            </div>
          )}
        </div>
      );

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
