import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const revalidate = 0

export async function GET(request: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  try {
    // Obtener información del usuario para determinar su rol
    const user = await db.user.findUnique({
      where: { username },
      select: { user_role: true, branchId: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // Determinar el filtro basado en el rol del usuario
    const where: Prisma.TicketWhereInput =
      user.user_role === "SUPERADMIN" || user.user_role === "ADMINISTRADOR" || user.user_role === "AUDITOR"
        ? { OR: [{ status: "PENDIENTE" }, { status: "POR_CONFIRMAR" }] }
        : { OR: [{ status: "PENDIENTE" }, { status: "POR_CONFIRMAR" }] , registered_by: username };

    const data = await db.ticket.findMany({
      where: where,
      include: {
        routes: true,
        passanger: {
          include: {
            client: true,
          },
        },
        provider: true,
        transaction: true,
      },
      orderBy: { createdAt: "desc" },
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
      { status: 500 }
    );
  }
}
