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
import RegisterProviderForm from "../forms/RegisterProviderForm"

export function RegisterProviderDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-bold">Registrar Proveedor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar</DialogTitle>
          <DialogDescription>
            Rellene el formulario para registrar un proveedor.
          </DialogDescription>
        </DialogHeader>
        <RegisterProviderForm onClose={() => setOpen(false)} />
        <DialogFooter className="sm:justify-start">
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}