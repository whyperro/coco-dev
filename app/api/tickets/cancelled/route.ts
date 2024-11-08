import db from "@/lib/db";
import { NextResponse } from "next/server";

export const revalidate = 0

export async function GET() {
  try {
    const data = await db.ticket.findMany({
      where: {
        status: "CANCELADO"
      },
      include: {
        routes: true,
        passanger: {
          select:{
            id: true,
            dni_type: true,
            dni_number: true,
            client:true,
            first_name:true,
            last_name:true
          }
        },
        // transaction: true,
        provider: true,
      },
      orderBy:{statusUpdatedAt:"desc"}
    });
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0", // Desactiva la caché
      },
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
