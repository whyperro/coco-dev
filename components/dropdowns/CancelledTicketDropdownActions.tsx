import { useDeleteTicket } from "@/actions/tickets/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"

const CancelledTicketDropdownActions = ({ id }: { id: string }) => {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);
  const [isDialogOpen1, setIsDialogOpen1] = useState<boolean>(false); // Delete dialog


  const { deleteTicket } = useDeleteTicket();

  const handleDelete = async (id: string) => {
    await deleteTicket.mutateAsync(id);
    setIsDialogOpen1(false);
  };

  return (
    <>
      {/* Dropdown Menu for Edit/Delete */}
      <DropdownMenu open={isDropdownMenuOpen} onOpenChange={setIsDropdownMenuOpen}>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex gap-2 justify-center">
          {/* Delete Option */}
          <DropdownMenuItem onClick={() => {
            setIsDialogOpen1(true);
            setIsDropdownMenuOpen(false);
          }}>
            <Trash2 className='size-5 text-red-500' />
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen1} onOpenChange={setIsDialogOpen1}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">¿Seguro que desea eliminar la cliente?</DialogTitle>
            <DialogDescription className="text-center p-2 mb-0 pb-0">
              Esta acción es irreversible y estaría eliminando por completo la cliente seleccionada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 md:gap-0">
            <Button className="bg-rose-400 hover:bg-white hover:text-black hover:border hover:border-black" onClick={() => setIsDialogOpen1(false)} type="button">
              Cancelar
            </Button>
            <Button
              disabled={deleteTicket.isPending} // Disable button while mutation is pending
              className="hover:bg-white hover:text-black hover:border hover:border-black transition-all"
              onClick={() => handleDelete(ticket_number)}
            >
              {deleteTicket.isPending ? <Loader2 className="animate-spin" /> : "Confirmar"} {/* Show loader */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default CancelledTicketDropdownActions;
