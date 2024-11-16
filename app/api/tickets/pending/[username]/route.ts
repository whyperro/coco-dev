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
      status: "PENDIENTE", // Siempre filtramos por status "PAGADO"
    };
    if(user?.user_role){
      if (user?.user_role === "SELLER") {
        whereClause.registered_by = username;
      }
    }
    
    const data = await db.ticket.findMany({
      where: {
        status: whereClause,
      },
      include: {
        routes: true,
        passanger: {
          include: {
            client: true,
          }
        },
        provider: true,
        transaction: true,
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
