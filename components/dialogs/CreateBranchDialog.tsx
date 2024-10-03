'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useState } from "react"
import CreateBranchForm from "../forms/BranchForm"

export function CreateBranchDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Crear Sucursal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Creacion de sucursal</DialogTitle>
          <DialogDescription>
            Crea una sucursal
          </DialogDescription>
        </DialogHeader>
        <CreateBranchForm onClose={() => setOpen(false)} />
        <DialogFooter className="sm:justify-start">
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
