import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Check if the branch name already exists
        console.log(data)
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

        // Create a new branch if the name is unique
        const newTicket = await db.ticket.create({
            data: {
              ticket_number: data.ticket_number,
              booking_ref: data.booking_ref,
              purchase_date: data.purchase_date,
              flight_date: data.flight_date,
              status: data.status,
              registered_by: data.registered_by,
              
              ticket_type: data.ticket_type,
              quantity: data.quantity,
              issued_by: data.issued_by,
              served_by: data.served_by,
              doc_order: data.doc_order,

              passangerId: data.passangerId,
              routeId: data.routeId,
              branchId: data.branchId,
              providerId: data.providerId,
            },
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
