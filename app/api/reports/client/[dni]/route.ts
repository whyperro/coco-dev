import db from "@/lib/db";
import { format, parse, subDays } from "date-fns";
import { NextResponse } from "next/server";


export async function GET(request: Request, { params }: { params: { dni: string } }) {
  const { dni } = params;

  // Parse query parameters for date range
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Default date range: last 30 days if none provided
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;
  const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;
  console.log(searchParams)
  try {
    // Fetch client data
    const client = await db.client.findUnique({
      where: { dni },
    });

    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    // Fetch tickets within date range
    const tickets = await db.ticket.findMany({
      where: {
        OR: [
          { createdAt: { gte: startDate, lte: endDate } },
          { statusUpdatedAt: { gte: startDate, lte: endDate } }
        ],
        passanger: { client: { dni } },
      },
      include: {
        provider: { select: { name: true } },
        routes: true,
        branch: { select: { location_name: true } },
        transaction: { select: { payment_ref: true, payment_method: true } },
      },
      orderBy: { status: "asc" }
    });

    // Fetch associated passengers for the client
    const passengers = await db.passanger.findMany({
      where: { client: { dni } },
      select: {
        first_name: true,
        last_name: true,
        dni_type: true,
        dni_number: true,
        phone_number: true,
        email: true,
      }
    });

    // Separate tickets by status
    const paidTickets = tickets.filter(ticket => ticket.status === "PAGADO");
    const pendingTickets = tickets.filter(ticket => ticket.status === "PENDIENTE");

    // Prepare final report
    const report = {
      date: `${format(startDate, "yyyy-MM-dd")} al ${format(endDate, "yyyy-MM-dd")}`,
      client: `${client.first_name} ${client.last_name}`,
      passengers,
      paidTickets,
      pendingTickets,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching client report:", error);
    return NextResponse.json({ message: "Error fetching client report." }, { status: 500 });
  }
}
