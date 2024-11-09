import db from "@/lib/db";
import { NextResponse } from "next/server";

export const revalidate = 0

export async function GET(request: Request, { params }: { params: { username: string } }) {
  const { username } = params; 
  try {
    const user = await db.user.findUnique({
      where:{username},
      select:{user_role:true, branchId:true}
    })
    const whereClause: any = {
      status: "CANCELADO", // Siempre filtramos por status "PAGADO"
    };
    if(user?.user_role){
      if (user?.user_role === "SELLER") {
        whereClause.registered_by = username;
      }
    }

    const data = await db.ticket.findMany({
      where: whereClause,
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
      }
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
