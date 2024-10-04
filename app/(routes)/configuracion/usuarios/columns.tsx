"use client"

import BranchDropdownActions from "@/components/dropdowns/BranchDropdownActions"
import UserDropdownActions from "@/components/dropdowns/UsersDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { Branch, User } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<User>[] = [
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
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Nombre de Usuario' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.username}</div>
    },
  },
  {
    accessorKey: "user_role",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title='Rol del Usuario' />
    ),
    cell: ({ row }) => {
      return <div className="text-center font-bold">{row.original.user_role}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <UserDropdownActions id={id.toString()} />
      )
    },
  },

]
