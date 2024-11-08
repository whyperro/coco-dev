"use client"

import PassangerDropdownActions from "@/components/dropdowns/PassangerDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { Passanger } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Passanger>[] = [
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
    accessorKey: "dni_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nro. Documento' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{
        row.original.dni_type === "PARTIDA_NACIMIENTO" ? `P/N: ${row.original.dni_number}` : `${row.original.dni_type}-${row.original.dni_number}`
      }</div>
    },
  },
  {
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contacto' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{(row.original.phone_number === "" || !row.original.phone_number) ? "N/A" : row.original.phone_number}</div>
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Correo Electrónico' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{(row.original.email === "" || !row.original.email) ? "N/A" : row.original.phone_number}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <PassangerDropdownActions id={id.toString()} />
      )
    },
  }
]
