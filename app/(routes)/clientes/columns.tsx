"use client"

import ClientDropdownActions from "@/components/dropdowns/ClientDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { Client } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<Client>[] = [
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
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.first_name}</div>
    },
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Apellido' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.last_name}</div>
    },
  },
  {
    accessorKey: "dni",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Identificacion' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.dni}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      const dni = row.original.dni
      return (
        <ClientDropdownActions id={id.toString()} dni={dni} />
      )
    },
  }
]
