import db from "@/lib/db";
import { format, parse, subDays } from "date-fns";
import { NextResponse } from "next/server";

interface branchData {
  name: string;
  amount: number;
}

export async function GET(request: Request, { params }: { params: { provider_number: string } }) {
  const { provider_number } = params;

  // Parse query parameters for date range
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Default date range: last 30 days if none provided
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;
  const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;
  try {
    // Fetch client data
    const provider = await db.provider.findUnique({
      where: { provider_number },
    });

    if (!provider) {
      return NextResponse.json({ message: "Provider not found" }, { status: 404 });
    }

    // Fetch tickets within date range
    const tickets = await db.ticket.findMany({
      where: {
        OR: [
          { createdAt: { gte: startDate, lte: endDate } },
          { statusUpdatedAt: { gte: startDate, lte: endDate } }
        ],
        provider: { provider_number },
      },
      include: {
        provider: { select: { name: true } },
        routes: { select: { origin: true, destiny: true, route_type: true } },
        branch: { select: { location_name: true } },
        transaction: { select: { payment_ref: true, payment_method: true } },
        passanger:{select:{first_name:true, last_name:true}}
      },
      orderBy: { status: "asc" }
    });

    // // Fetch associated passengers for the client
    const routeCounts = await db.route.findMany({
      where: {
        tickets: {
          some: {
            provider: {provider_number}
          }
        }
      },
      select: {
        id: true,
        origin: true,
        scale:true,
        destiny: true,
        route_type:true,
        _count: {
          select: {
            tickets: true, // Cuenta los tickets asociados a esta ruta
          },
        },
      },
      orderBy:{
        tickets:{_count:"desc"}
      }
    });
    // Separate tickets by status
    const paidTickets = tickets.filter(ticket => ticket.status === "PAGADO");
    const pendingTickets = tickets.filter(ticket => ticket.status === "PENDIENTE");

    // Prepare final report
    const report = {
      date: `${format(startDate, "yyyy-MM-dd")} al ${format(endDate, "yyyy-MM-dd")}`,
      client: `${provider.name}`,
      routeCounts,
      paidTickets,
      pendingTickets,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching client report:", error);
    return NextResponse.json({ message: "Error fetching client report." }, { status: 500 });
  }
}
