import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
      const data = await request.json();
      const ticket = await db.ticket.findFirst({
        where: {
          id: data.ticketId,
        }
      })
      const newTransaction = await db.transaction.create({
        data: {
          payment_ref:data.payment_ref,
          payment_method: data.payment_method,
          image_ref: data.image_ref,
          ticketId: data.ticketId,
          registered_by: data.registered_by,
          transaction_date: data.transaction_date
        },
      });
      if(newTransaction && ticket) {
        await db.ticket.update({
          where: {
            id: data.ticketId,
          },
          data: {
            status: "PAGADO",
            statusUpdatedAt: ticket.status !== data.status ? new Date() : ticket.statusUpdatedAt,
          }
        })
      }

    return NextResponse.json(newTransaction, {
      status: 200
    } );
  } catch (error) {
    console.error("Error creating transaction:", error);
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
