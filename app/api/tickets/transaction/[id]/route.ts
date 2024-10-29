import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { id } = params
    const updatedTicket = await db.ticket.update({
      where: { id },
      data: {
        ...data,
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
