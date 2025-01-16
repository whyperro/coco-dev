import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const newTicket = await db.ticket.create({
          data: {
            ...data,
            statusUpdatedAt: new Date(),
            routes: {
              connect: data.routes.map((routeId: string) => ({ id: routeId })),
          },
          },
          include: {
            provider: {
              select: {
                id: true,
                credit: true,
              }
            }
          }
        });

      return NextResponse.json(newTicket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      return NextResponse.json(
        {
          message: "Error en el servidor.",
        },
        {
          status: 500,
        }
      );
    }
  }
