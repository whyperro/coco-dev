import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await db.ticket.findMany({
      where: {
        status: "PAGADO"
      },
      include: {
        route: true,
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
        transaction: true,
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
