"use client"

import BranchDropdownActions from "@/components/dropdowns/BranchDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { Branch } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<Branch>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "location_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Sucursal' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.location_name}</div>
    },
  },
  {
    accessorKey: "fiscal_address",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Ubicacion Fiscal' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.fiscal_address ? row.original.fiscal_address : <p className="text-center font-medium">N/A</p>}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <BranchDropdownActions id={id.toString()} />
      )
    },
  },

]
