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
import { PlaneTakeoff } from "lucide-react"
import { useState } from "react"
import RegisterRouteForm from "../forms/RegisterRouteForm"

export function RegisterRouteDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Registrar Ruta</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Registro de Ruta
            <PlaneTakeoff className="size-6" />
          </DialogTitle>
          <DialogDescription>
            Registra los datos de una ruta en especifíco.
          </DialogDescription>
        </DialogHeader>
        <RegisterRouteForm onClose={() => setOpen(false)} />
        <DialogFooter className="sm:justify-start">
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
