"use client"
import RouteDropdownActions from "@/components/dropdowns/RouteDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { Route } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Route>[] = [
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
    accessorKey: "origin",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Origen' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.origin}</div>
    },
  },
  {
    accessorKey: "scale",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Escala' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.scale ?? 'N/A'}</div>
    },
  },
  {
    accessorKey: "destiny",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Destino' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.destiny}</div>
    },
  },
  {
    accessorKey: "tickets",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Boletos' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">todo: tickets dialog</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <RouteDropdownActions id={id.toString()} />
      )
    },
  }
]
