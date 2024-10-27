// Endpoint para obtener el reporte diario de boletos
import db from "@/lib/db";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { endOfDay, parse, startOfDay } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function GET(request: Request){
  try {
    const currentDate = new Date();
    const startDate = startOfDay(currentDate); // Inicio del día actual
    const endDate = endOfDay(currentDate); // Fin del día actual
    // Obtenemos boletos filtrados por la fecha de compra y categorizados por estado
    const tickets = await db.ticket.findMany({
      where: {
        createdAt: {
          gte: startDate, // Mayor o igual al inicio del día
          lte: endDate,   // Menor o igual al final del día
        },
        status: {
          not: "CANCELADO"
        }
      },
      include: {
        passanger: { select: { first_name: true, last_name: true, dni_number: true } },
        provider: { select: { name: true } },
        route: { select: { origin: true, destiny: true, route_type: true } },
        branch: { select: { location_name: true } },
        transaction: { select: { payment_ref: true, payment_method: true } },
      },
      orderBy: { status: "asc" }
    });

    // Formateamos los datos para separar boletos pagados y pendientes
    const paidTickets = tickets.filter(ticket => ticket.status === "PAGADO");
    const pendingTickets = tickets.filter(ticket => ticket.status === "PENDIENTE");

    // Respuesta del endpoint
    return NextResponse.json({
      currentDate,
      paidTickets: paidTickets.map(ticket => ({
        ticket_number: ticket.ticket_number,
        booking_ref: ticket.booking_ref,
        ticket_price: ticket.ticket_price,
        fee: ticket.fee,
        total: ticket.total,
        payment_ref: ticket.transaction?.payment_ref || null,
        transaction: ticket.transaction,
        passanger: ticket.passanger,
        provider: ticket.provider,
        route: ticket.route,
        branch: ticket.branch.location_name,
      })),
      pendingTickets: pendingTickets.map(ticket => ({
        ticket_number: ticket.ticket_number,
        booking_ref: ticket.booking_ref,
        ticket_price: ticket.ticket_price,
        fee: ticket.fee,
        total: ticket.total,
        passanger: ticket.passanger,
        provider: ticket.provider,
        route: ticket.route,
        branch: ticket.branch.location_name,
      })),
    });
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    return NextResponse.json(
      {
        message: "Error fetching transaction summary.",
      },
      { status: 500 }
    );
  }
}
