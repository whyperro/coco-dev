"use client"

import ProviderDropdownActions from "@/components/dropdowns/ProviderDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { cn, convertAmountFromMiliunits, formatCurrency } from "@/lib/utils"
import { Provider } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<Provider>[] = [
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
    accessorKey: "provider_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Codigo del proveedor ' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.provider_number}</div>
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.name}</div>
    },
  },
  {
    accessorKey: "provider_type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Tipo del proveedor' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.provider_type}</div>
    },
  },
  {
    accessorKey: "credit",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Credito' />
    ),
    cell: ({ row }) => {
      return <div className="flex justify-center">
        <Badge className={cn("text-sm text-center font-bold cursor-pointer", convertAmountFromMiliunits(row.original.credit) >= 0 ? "bg-green-500 hover:bg-green-700" : "bg-rose-500 hover:bg-rose-600")}>{formatCurrency(convertAmountFromMiliunits(row.original.credit))}</Badge>
      </div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      const provider_number = row.original.provider_number

      return (
        <ProviderDropdownActions id={id.toString()} provider_number={provider_number} />
      )
    },
  }
]
