import db from "@/lib/db";
import { format, parse, subDays } from "date-fns";
import { NextResponse } from "next/server";

interface RouteCount {
  id: string;
  origin: string;
  scale: string | null;
  destiny: string;
  route_type: string;
  count: number;
}

export async function GET(
  request: Request,
  { params }: { params: { provider_number: string } }
) {
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
    // Fetch provider data
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
          { statusUpdatedAt: { gte: startDate, lte: endDate } },
        ],
        provider: { provider_number },
      },
      include: {
        provider: { select: { name: true } },
        routes: { select: { id: true, origin: true, scale: true, destiny: true, route_type: true } },
        branch: { select: { location_name: true } },
        transaction: { select: { payment_ref: true, payment_method: true } },
        passanger: { select: { first_name: true, last_name: true } },
      },
      orderBy: { status: "asc" },
    });

    // Separate tickets by status
    const paidTickets = tickets.filter(ticket => ticket.status === "PAGADO");
    const pendingTickets = tickets.filter(ticket => ticket.status === "PENDIENTE");

    // Calculate routeCounts from tickets
    const routeCounts: Record<string, RouteCount> = tickets.reduce((acc, ticket) => {
      ticket.routes.forEach(route => {
        const routeKey = `${route.origin}-${route.scale || "N/A"}-${route.destiny}-${route.route_type}`;
        if (!acc[routeKey]) {
          acc[routeKey] = {
            id: route.id,
            origin: route.origin,
            scale: route.scale || "Sin escala", // Maneja rutas sin escalas
            destiny: route.destiny,
            route_type: route.route_type,
            count: 0,
          };
        }
        acc[routeKey].count += 1;
      });
      return acc;
    }, {} as Record<string, RouteCount>);

    // Convert routeCounts object to an array and sort by count
    const sortedRouteCounts = Object.values(routeCounts).sort((a, b) => b.count - a.count);

    // Prepare final report
    const report = {
      date: `${format(startDate, "yyyy-MM-dd")} al ${format(endDate, "yyyy-MM-dd")}`,
      client: provider.name,
      routeCounts: sortedRouteCounts,
      paidTickets,
      pendingTickets,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching client report:", error);
    return NextResponse.json({ message: "Error fetching client report." }, { status: 500 });
  }
}
