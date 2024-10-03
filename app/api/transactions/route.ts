import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
      const data = await request.json();
      const newTransaction = await db.transaction.create({
        data: {
          ticket_price: data.ticket_price,
          fee: data.fee,
          total: data.total,
          rate:data.rate,
          total_bs:data.total_bs,
          payment_ref:data.payment_ref,
          payment_method: data.payment_method,
          ticketId: data.ticketId,
          registered_by: data.registered_by,
          transaction_date: data.transaction_date
        },
      });

    return NextResponse.json(newTransaction);
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
