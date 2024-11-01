import db from "@/lib/db";
import { Ticket } from "@/types";
import { NextResponse } from "next/server";

export async function GET(request: Request,{ params }: { params: { ticket_number: string } }) {
    const { ticket_number } = params; // Get ID from URL parameters

    if (!ticket_number) {
      return NextResponse.json(
        {
          message: 'El numero del ticket es requerido',
        },
        {
          status: 400,
        }
      );
    }

    try {
        const ticket = await db.ticket.findUnique({
          where: {
            ticket_number
          },
          include: {
            passanger: {
                include: {
                    client: true,
                }
            },
            transaction: true,
            provider: true,
            routes: true,
          }
        });

        if (!ticket) {
          return NextResponse.json(
            {
              message: "No se encontró el ticket.",
            },
            {
              status: 404,
            }
          );
        }

        return NextResponse.json(ticket, {
          status: 200,
        });
      } catch (error) {
        console.error("Error fetching ticket:", error);
        return NextResponse.json(
          {
            message: "Error al obtener el ticket.",
          },
          {
            status: 500,
          }
        );
      }
}

export async function DELETE(request: Request, { params }: { params: { ticket_number: string } }) {
  try {
    const { ticket_number } = params; // Get ticket_number from URL parameters

    if (!ticket_number) {
      return NextResponse.json(
        {
          message: 'El numero del ticket es requerido',
        },
        {
          status: 400,
        }
      );
    }

    // Delete the branch by its ID
    const deleteTicket = await db.ticket.delete({
      where: { ticket_number },
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