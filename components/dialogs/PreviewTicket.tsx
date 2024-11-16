import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { IdCard, MailCheck, Phone, User } from 'lucide-react';
import { TicketDataType } from '../forms/TicketForm';

interface PreviewTicketProps {
    open: boolean;
    onClose: () => void;
    ticketData: TicketDataType | null;
    selectedRoutesNames: string[];
    selectedClientName: string | null;
    selectedClientDni: string | null;
    selectedProvidersNames: string | null;
    selectedClientPhone: string | null;
    selectedClientEmail: string | null;
    onConfirm: (data: TicketDataType) => void;
}
const PreviewTicket = ({ open, onClose, ticketData, selectedRoutesNames, selectedClientName, selectedClientDni, selectedProvidersNames, selectedClientPhone, selectedClientEmail, onConfirm, }: PreviewTicketProps) => {
  
  if (!ticketData) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Verifique que la información esté correcta antes de presionar en Confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 max-w-4xl mx-auto grid grid-cols-2 shadow-md border border-primary rounded-md shadow-primary/75 mt-4">
          {/* Información del pasajero */}
          <div className="p-2">
            <div className="flex flex-col items-center justify-center">
              <h1 className="font-bold">Pasajero</h1>
              <Separator className="w-[90px]" />
            </div>
          <div className="p-4 rounded-sm space-y-2 text-center flex justify-center flex-col items-center">
            <div className="flex gap-2 items-center text-center">
              <User />
              <p className="font-medium italic">
              {`${ticketData?.first_name || ""} ${ticketData?.last_name || ""}`.trim() || "N/A"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <IdCard />
              <p>
                <span className="font-bold">DNI-</span>
                {ticketData?.dni_number || "N/A"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Phone />
              <p>
                <span className="font-bold">Número de Teléfono-</span>
                {ticketData?.phone_number || "N/A"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <MailCheck />
              <p>
                <span className="font-bold">Correo Electrónico-</span>
                {ticketData?.email || "N/A"}
              </p>
            </div>
          </div>
        </div>

          {/* Información del cliente */}
          <div className="p-2">
           <div className="flex flex-col items-center justify-center">
              <h1 className="font-bold">Cliente</h1>
              <Separator className="w-[90px]" />
            </div>
            <div className="p-4 rounded-sm space-y-2 text-center flex justify-center flex-col items-center">
              <div className="flex gap-2 items-center text-center">
                <User />
                <p className="font-medium italic">
                 {(selectedClientName || "").trim() || "N/A"}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <IdCard />
              <p>
                <span className="font-bold">DNI-</span> 
                {selectedClientDni || "N/A"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Phone />
              <p>
                <span className="font-bold">Número de Teléfono-</span> 
                {selectedClientPhone || "N/A"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <MailCheck />
              <p>
                <span className="font-bold">Correo Electrónico-</span> 
                {selectedClientEmail || "N/A"}
              </p>
            </div>
          </div>
        </div>

          {/* Información del boleto */}
          <div className="col-span-2">
            <div className="flex flex-col items-center justify-center">
              <h1 className="font-bold">Boleto</h1>
              <Separator className="w-[340px]" />
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center mt-2 p-4">
              <p><span className="font-medium underline">Nro. de Boleto:</span> <br /> {ticketData?.ticket_number || "N/A"}</p>
              <p><span className="font-medium underline">Localizador:</span> <br /> {ticketData?.booking_ref || "N/A"}</p>
              <p><span className="font-medium underline">Proveedor(es):</span> <br /> {selectedProvidersNames || "N/A"}</p>
              <p><span className="font-medium underline">Fecha de Compra:</span> <br /> {ticketData?.purchase_date ? ticketData.purchase_date.toLocaleDateString("es-ES") : "Fecha no disponible"}</p>
              <p><span className="font-medium underline">Fecha de Vuelo:</span> <br /> {ticketData?.flight_date ? ticketData.flight_date.toLocaleDateString("es-ES") : "Fecha no disponible"}</p>
              <p><span className="font-medium underline">Ruta(s):</span> <br /> {selectedRoutesNames.length > 0 ? selectedRoutesNames.join(', ') : "N/A"}</p>
              <p><span className="font-medium underline">Tipo de Boleto:</span> <br />{ticketData?.ticket_type === "B" ? "BOLETO" : ticketData?.ticket_type === "X" ? "EXCHANGE" : "N/A"}</p>
              <p><span className="font-medium underline">Atendido por:</span> <br /> {ticketData?.served_by || "N/A"}</p>
            </div>
          </div>

          {/* Información de transacción */}
        <div className="col-span-2">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-bold">Información de Transacción</h1>
            <Separator className="w-[340px]" />
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center mt-2 p-4">
            <p><span className="font-medium underline">Precio del Boleto:</span> <br /> ${ticketData?.ticket_price || "0.00"}</p>
            <p><span className="font-medium underline">Fee de Emisión:</span> <br /> ${ticketData?.fee || "0.00"}</p>
            <p><span className="font-medium underline">Tasa:</span> <br /> ${ticketData?.rate || "0.00"}</p>
            <p><span className="font-medium underline">Total a Cobrar:</span> <br /> ${ticketData?.total || "0.00"}</p>
            <p><span className="font-medium underline">Total en Bsd:</span> <br /> ${ticketData?.total_bs || "0.00"}</p>
          </div>
        </div>
      </div>

        <DialogFooter>
        <div className="flex justify-between mt-4 space-x-6">
          <Button variant="secondary" onClick={onClose}>
             Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(ticketData)}
            className="bg-green-500 text-white font-semibold hover:bg-green-600"
          >
            Confirmar
          </Button>
        </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

export default PreviewTicket;
