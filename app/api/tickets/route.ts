import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Check if the branch name already exists

        if(data.ticket_number !== undefined){
          const ticketFound = await db.ticket.findFirst({
            where: {
              ticket_number: data.ticket_number,
            },
          });

          if (ticketFound) {
            return NextResponse.json(
              {
              message: "El ticket ya existe.",
              },
              {
              status: 400, // Set 400 status code for a validation error
              }
            );
          }
        }

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
