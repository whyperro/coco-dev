import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // Get ticket_number from URL parameters

    if (!id) {
      return NextResponse.json(
        {
          message: 'El id del ticket es requerido',
        },
        {
          status: 400,
        }
      );
    }

    // Delete the branch by its ID
    const deleteTicket = await db.ticket.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Boleto eliminada exitosamente',
      deleteTicket,
    });
  } catch (error) {
    console.error('Error al eliminar el boleto:', error);

    return NextResponse.json(
      {
        message: 'Ha ocurrido un error al eliminar el boleto.',
      },
      {
        status: 500,
      }
    );
  }
}
