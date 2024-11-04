import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { id } = params
    const existingTicket = await db.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' });
    }
    const updatedTicket = await db.ticket.update({
      where: { id },
      data: {
        ...data,
        statusUpdatedAt: existingTicket.status !== data.status ? new Date() : existingTicket.statusUpdatedAt,
      },
    });
    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Error al actualizar el estado del ticket:", error);
    return NextResponse.json(
      {
        message: "Error al actualizar el ticket.",
      },
      {
        status: 500,
      }
    );
  }
}
