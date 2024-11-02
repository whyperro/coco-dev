// Endpoint para obtener el reporte diario de boletos
import db from "@/lib/db";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { NextResponse } from "next/server";


interface IBranchData {
    name: string,
    totalAmount: number;
    pendingAmount: number;
    ticketCount: number;
    paidCount: number;
    pendingCount: number;
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
        payment_method: true,
      },
    });

    const transactionTypeTotalsRecord: Record<string, number> = {};
        transactions.forEach(transaction => {
            const method = transaction.payment_method || "UNKNOWN";
            const total = transaction.ticket?.total || 0;

            if (!transactionTypeTotalsRecord[method]) {
              transactionTypeTotalsRecord[method] = 0;
            }
            transactionTypeTotalsRecord[method] += total;
        });
        const transactionTypeTotals = Object.entries(transactionTypeTotalsRecord).map(
          ([transactionType, totalAmount]) => ({
            transactionType,
            totalAmount,
          })
        );

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

    const branchData: {
      [key: string]: {
        totalAmount: number;
        ticketCount: number;
        paidCount: number;
        pendingCount: number;
        pendingAmount: number,
      };
    } = {};

    // Populate branch data from transactions
    transactions.forEach(transaction => {
      const ticket = tickets.find(t => t.id === transaction.ticketId);
      const branch = ticket ? `${ticket.branch.location_name}` : 'unknown';

      if (!branchData[branch]) {
        branchData[branch] = { totalAmount: 0, ticketCount: 0, paidCount: 0, pendingCount: 0, pendingAmount: 0 };
      }

      // Increment total amount
      branchData[branch].totalAmount += transaction.ticket?.total || 0;

      // Increment ticket count
      branchData[branch].ticketCount += 1;

      // Check ticket status and increment appropriate count
      if (ticket) {
        if (ticket.status === 'PAGADO') {
          branchData[branch].paidCount += 1;
        } else if (ticket.status === 'PENDIENTE') {
          branchData[branch].pendingCount += 1;
          branchData[branch].pendingAmount += transaction.ticket?.total || 0;
        }
      }
    });

    // Format data for chart or report
    const branchReport: IBranchData[] = Object.keys(branchData).map(branch => ({
      name: branch,
      amount: branchData[branch].totalAmount,
      ticketCount: branchData[branch].ticketCount,
      paidCount: branchData[branch].paidCount,
      pendingCount: branchData[branch].pendingCount,
      pendingAmount: branchData[branch].pendingAmount,
      totalAmount: branchData[branch].totalAmount,
    }));

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
      transactionTypeTotals,
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
