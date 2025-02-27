// Endpoint para obtener el reporte diario de boletos
import db from "@/lib/db";
import { endOfDay, format, parse, startOfDay, subDays } from "date-fns";
import { NextResponse } from "next/server";

interface IBranchData {
    name: string,
    totalAmount: number;
    ticketCount: number;
    paidCount: number;
    pendingCount: number;
}

export async function GET(request: Request){
  const { searchParams } = new URL(request.url);
  try {
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      console.log(from, to)

      const defaultTo = format(new Date(), "yyyy-MM-dd");
      const defaultFrom = format(subDays(new Date(), 31), "yyyy-MM-dd");
      const startDate = from ? from : defaultFrom;
      const endDate = to ? to : defaultTo;

      const defaultToParsed = new Date();
      const defaultFromParsed = subDays(defaultTo, 31);

      const startDateParsed = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFromParsed;
      const endDateParsed = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultToParsed;

    const tickets = await db.ticket.findMany({
      where: {
        OR: [
          { purchase_date: { gte: startDate, lte: endDate } }, 
          { statusUpdatedAt: { gte: startDateParsed, lte: endDateParsed } },
        ],
        status: {
          not: "CANCELADO"
        }
      },
      include: {
        passanger: { select: { first_name: true, last_name: true, dni_number: true, client: true } },
        provider: { select: { name: true } },
        routes: { select: { origin: true, destiny: true, route_type: true } },
        branch: { select: { location_name: true } },
        transaction: { select: { payment_ref: true, payment_method: true, ticketId: true } },
      },
      orderBy: { status: "asc" }
    });

    // Formateamos los datos para separar boletos pagados y pendientes
    const paidTickets = tickets.filter(ticket => ticket.status === "PAGADO");
    const pendingTickets = tickets.filter(ticket => (ticket.status === "PENDIENTE" || ticket.status === 'POR_CONFIRMAR'));

    const transactions = await db.transaction.findMany({
      where: {
        transaction_date: {
          gte: startDateParsed,
          lte: endDateParsed,
        },
      },
      select: {
        transaction_date: true,
        ticketId: true, // Include ticketId to link transactions to branches
        ticket: {
          select: {
            total: true, // Select the total from the ticket
            branch: true,
          },
        },
        payment_method: true,
      },
    });

    const clientsData = await db.client.findMany({
      where: {
        passenger: {
          some: {
            ticket: {
              some: {
                OR: [
                  { purchase_date: { gte: startDate, lte: endDate } },
                  { statusUpdatedAt: { gte: startDateParsed, lte: endDateParsed } },
                ],
                status: {
                  not: "CANCELADO",
                },
              },
            },
          },
        },
      },
      include: {
        passenger: {
          include: {
            ticket: {
              where: {
                OR: [
                  { purchase_date: { gte: startDate, lte: endDate } },
                  { statusUpdatedAt: { gte: startDateParsed, lte: endDateParsed } },
                ],
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
      const pendingTickets = allTickets.filter(ticket => (ticket.status === "PENDIENTE" || ticket.status === 'POR_CONFIRMAR'));
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
            OR: [
              { purchase_date: { gte: startDate, lte: endDate } },
              { statusUpdatedAt: { gte: startDateParsed, lte: endDateParsed } },
            ],
            status: {
              not: "CANCELADO",
            },
          },
          select: {
            status: true,
            total: true, // Include total to calculate revenue
            ticket_price: true,
          },
        },
      },
    });

    const providersReport = providersData.map(provider => {
      const paidTickets = provider.tickets.filter(ticket => ticket.status === "PAGADO");
      const pendingTickets = provider.tickets.filter(ticket => (ticket.status === "PENDIENTE" || ticket.status === 'POR_CONFIRMAR'));

      const paidCount = paidTickets.length;
      const pendingCount = pendingTickets.length;

      const paidAmount = paidTickets.reduce((sum, ticket) => sum + ticket.total, 0); // Calculate total for paid tickets

      return {
        provider: provider.name,
        paidCount,
        pendingCount,
        paidAmount, // Amount for paid tickets
        pendingAmount: provider.credit,
      };
    });

    const branchData: {
      [key: string]: {
        totalAmount: number;
        ticketCount: number;
        paidCount: number;
        pendingCount: number;
      };
    } = {};

    // Populate branch data from transactions
    transactions.forEach(transaction => {
      const ticket = tickets.find(t => t.id === transaction.ticketId);
      const branch = ticket ? `${ticket.branch.location_name}` : 'unknown';

      if (!branchData[branch]) {
        branchData[branch] = { totalAmount: 0, ticketCount: 0, paidCount: 0, pendingCount: 0 };
      }

      // Increment total amount
      branchData[branch].totalAmount += transaction.ticket?.total || 0;
    });

    tickets.forEach(ticket => {
      const branch = ticket ? `${ticket.branch.location_name}` : 'unknown';

      // Initialize branchData if it doesn't already exist
      if (!branchData[branch]) {
        branchData[branch] = { totalAmount: 0, ticketCount: 0, paidCount: 0, pendingCount: 0 };
      }

      if (ticket) {
        if (ticket.status === 'PAGADO') {
          branchData[branch].paidCount += 1;
        } else if (ticket.status === 'PENDIENTE' || ticket.status === 'POR_CONFIRMAR') {
          branchData[branch].pendingCount += 1;
        }
      }
    });

    // Format data for chart or report
    const branchReport: IBranchData[] = Object.keys(branchData).map(branch => ({
      name: branch,
      amount: branchData[branch].totalAmount,
      ticketCount: branchData[branch].paidCount + branchData[branch].pendingCount,
      paidCount: branchData[branch].paidCount,
      pendingCount: branchData[branch].pendingCount,
      totalAmount: branchData[branch].totalAmount,
    }));

    const allPaymentMethods = ["ZELLE", "PAGO_MOVIL", "DEBITO", "CREDITO", "EFECTIVO"]; // List of all payment methods

    const branchTransactionTypeRecord = transactions.reduce<Record<string, Record<string, number>>>(
      (acc, transaction) => {
        const method = transaction.payment_method || "UNKNOWN";
        const branch = transaction.ticket.branch.location_name || "UNASSIGNED";
        const total = transaction.ticket?.total || 0;

        if (!acc[branch]) {
          acc[branch] = {};
        }

        acc[branch][method] = (acc[branch][method] || 0) + total;
        return acc;
      },
      {}
    );

    // Transform to the desired array structure with payment methods as an array
    const transactionTypesReport = Object.entries(branchTransactionTypeRecord).map(
      ([branch, methods]) => {
        // Ensure all payment methods are included, setting to 0 if not present in the methods object
        const payment_methods = allPaymentMethods.map((method) => ({
          method,
          totalAmount: methods[method] || 0,
        }));

        // Calculate the branch total by summing all method totals
        const branch_total = payment_methods.reduce((sum, { totalAmount }) => sum + totalAmount, 0);

        return {
          branch,
          payment_methods,
          branch_total,
        };
      }
    );

    // Respuesta del endpoint
    return NextResponse.json({
      date: `${format(startDate, "yyyy-MM-dd")} al ${format(endDate, "yyyy-MM-dd")}`,
      paidTickets: paidTickets.map(ticket => ({
        ticket_number: ticket.ticket_number,
        booking_ref: ticket.booking_ref,
        ticket_price: ticket.ticket_price,
        fee: ticket.fee,
        total: ticket.total,
        rate: ticket.rate,
        total_bs: ticket.total_bs,
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
        rate: ticket.rate,
        total_bs: ticket.total_bs,
        passanger: ticket.passanger,
        provider: ticket.provider,
        routes: ticket.routes,
        branch: ticket.branch.location_name,
      })),
      clientsReport,
      providersReport,
      branchReport,
      transactionTypesReport
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
