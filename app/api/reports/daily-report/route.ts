// Endpoint para obtener el reporte diario de boletos
import db from "@/lib/db";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { NextResponse } from "next/server";

interface IClientData {
  name: string;
  amount: number;
}

export async function GET(request: Request){
  const { searchParams } = new URL(request.url);
  try {
    const date = searchParams.get("date") || new Date();
    const defaultCurrentDate = new Date();
    const currentDate = addDays(date, 1)
    const startDate = searchParams.get("date") ? startOfDay(currentDate) : startOfDay(defaultCurrentDate); // Inicio del día actual
    const endDate = searchParams.get("date") ? endOfDay(currentDate) : endOfDay(defaultCurrentDate); // Fin del día actual
    // Obtenemos boletos filtrados por la fecha de compra y categorizados por estado
    console.log(startDate)
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
        passanger: { select: { first_name: true, last_name: true, dni_number: true, client: true } },
        provider: { select: { name: true } },
        routes: { select: { origin: true, destiny: true, route_type: true } },
        branch: { select: { location_name: true } },
        transaction: { select: { payment_ref: true, payment_method: true } },
      },
      orderBy: { status: "asc" }
    });

    // Formateamos los datos para separar boletos pagados y pendientes
    const paidTickets = tickets.filter(ticket => ticket.status === "PAGADO");
    const pendingTickets = tickets.filter(ticket => ticket.status === "PENDIENTE");

    const transactions = await db.transaction.findMany({
      where: {
        transaction_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        transaction_date: true,
        ticketId: true, // Include ticketId to link transactions to branches
        ticket: {
          select: {
            total: true, // Select the total from the ticket
          },
        },
      },
    });

    const clientsData = await db.client.findMany({
      include: {
        passenger: {
          include: {
            ticket: {
              where: {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
                status: {
                  not: "CANCELADO",
                },
              },
              select: {
                status: true,
                total: true,
              },
            },
          },
        },
      },
    });

    const clientsReport = clientsData.map(client => {
      // Extract tickets from all passengers
      const allTickets = client.passenger.flatMap(passenger => passenger.ticket);

      // Calculate paid tickets
      const paidTickets = allTickets.filter(ticket => ticket.status === "PAGADO");
      const paidCount = paidTickets.length;
      const paidAmount = paidTickets.reduce((sum, ticket) => sum + ticket.total, 0);

      // Calculate pending tickets
      const pendingTickets = allTickets.filter(ticket => ticket.status === "PENDIENTE");
      const pendingCount = pendingTickets.length;
      const pendingAmount = pendingTickets.reduce((sum, ticket) => sum + ticket.total, 0);

      // Calculate total amount (paid + pending)
      const totalAmount = paidAmount + pendingAmount;
      return {
        name: `${client.first_name} ${client.last_name}`,
        paidCount,
        pendingCount,
        paidAmount,
        pendingAmount,
        totalAmount,
      };
    });

    const providersData = await db.provider.findMany({
      include: {
        tickets: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              not: "CANCELADO",
            },
          },
          select: {
            status: true,
            total: true, // Include total to calculate revenue
          },
        },
      },
    });

    const providersReport = providersData.map(provider => {
      const paidTickets = provider.tickets.filter(ticket => ticket.status === "PAGADO");
      const pendingTickets = provider.tickets.filter(ticket => ticket.status === "PENDIENTE");

      const paidCount = paidTickets.length;
      const pendingCount = pendingTickets.length;

      const paidAmount = paidTickets.reduce((sum, ticket) => sum + ticket.total, 0); // Calculate total for paid tickets
      const pendingAmount = pendingTickets.reduce((sum, ticket) => sum + ticket.total, 0); // Calculate total for pending tickets
      const totalAmount = paidAmount + pendingAmount; // Calculate total amount (paid + pending)

      return {
        provider: provider.name,
        paidCount,
        pendingCount,
        paidAmount, // Amount for paid tickets
        pendingAmount, // Amount for pending tickets
        totalAmount, // Total amount generated
      };
    });

    const branchData: { [key: string]: number } = {};
    transactions.forEach(transaction => {
      const ticket = tickets.find(t => t.id === transaction.ticketId);
      const branch = ticket ? `${ticket.branch.location_name}` : 'unknown';

      if (!branchData[branch]) {
        branchData[branch] = 0;
      }
      branchData[branch] += transaction.ticket.total || 0; // Accumulate amounts per branch
    });

    // Format data for the Pie chart
    const branchReport: IClientData[] = Object.keys(branchData).map(client => ({
      name: client,
      amount: branchData[client],
    }));

    console.log(branchReport)
    // Respuesta del endpoint
    return NextResponse.json({
      date: searchParams.get("date") ? currentDate : defaultCurrentDate,
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
        routes: ticket.routes,
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
        routes: ticket.routes,
        branch: ticket.branch.location_name,
      })),
      clientsReport,
      providersReport,
      branchReport,
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
