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
import CreateClientForm from "../forms/ClientForm"

export function CreateClientDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-bold">Crear Cliente</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Creacion de Cliente</DialogTitle>
          <DialogDescription>
            Rellene el formulario para la creación de un cliente.
          </DialogDescription>
        </DialogHeader>
        <CreateClientForm  onClose={() => setOpen(false)} />
        <DialogFooter className="sm:justify-start">
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
