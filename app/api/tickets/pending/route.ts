import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await db.ticket.findMany({
      where: {
        status: "PENDIENTE"
      },
      include: {
        route: true,
        passanger: {
          include: {
            client: true,
          }
        },
        provider: true,
      }
    });
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      {
        message: "Error al obtener las rutas.",
      },
      {
        status: 500,
      }
    );
  }
}
