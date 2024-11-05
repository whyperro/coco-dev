import db from "@/lib/db";
import { NextResponse } from "next/server";

export const revalidate = 0

export async function GET() {
  try {
    const data = await db.ticket.findMany({
      where: {
        status: "PAGADO"
      },
      include: {
        routes: true,
        passanger: {
          include: {
            client: true,
          },
          select: {
            first_name: true,
            last_name: true,
            dni_number: true,
            dni_type: true,
            email: true,
            phone_number: true,
          }
        },
        transaction: true,
        provider: true,
      }
    });
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0", // Desactiva la caché
      },
    });
  } catch (error) {
    console.error("Error fetching pending tickets:", error);
    return NextResponse.json(
      {
        message: "Error al obtener los boletos pendientes.",
      },
      {
        status: 500,
      }
    );
  }
}
