import { convertAmountFromMiliunits, formatCurrency, formatBolivares } from "@/lib/utils";
import { Ticket } from "@/types";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
interface PdfFileProps {
  paidTickets: Ticket[];
  pendingTickets: Ticket[];
  clientsReport: {
    name: string,
    paidCount: number,
    pendingCount: number,
    paidAmount: number,
    pendingAmount: number,
    totalAmount: number,
  }[],
  providersReport: {
    provider: string,
    paidCount: number,
    pendingCount: number,
    paidAmount: number,
    pendingAmount: number,
  }[],
  branchReport: {
    name: string,
    totalAmount: number;
    ticketCount: number;
    paidCount: number;
    pendingCount: number;
  }[],
  transactionTypesReport: {
    branch: string,
    payment_methods: {
      method: string,
      totalAmount: number,
    }[],
    branch_total: number,
  }[],
  date: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    backgroundColor: "#f7f7f7",
  },
  image: {
    width: 100,
    height: 100,
  },
  header: {
    textAlign: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#63C144",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  date: {
    fontSize: 12,
    marginBottom: 15,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 16,
    marginVertical: 10,
    textDecoration: "underline",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    backgroundColor: "#c5f5b5",
    padding: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  column: {
    width: "12%",
    textAlign: "center",
    padding: 5,
  },
  columnWide: {
    width: "20%",
    textAlign: "center",
    padding: 5,
  },
  columnExtraWide: {
    width: "25%",
    textAlign: "center",
    padding: 5,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#777",
  },
  noRecords: {
    textAlign: "center",
    fontSize: 12,
    marginVertical: 10,
    color: "#f44336",
  },
  providerBox: {
    width: "25%",
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  providerTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  providerText: {
    fontSize: 12,
  },
  tableFooter: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: "#000",
    backgroundColor: "#ffff",
    padding: 5,
    fontWeight: "bold",
  }
});

const PdfFile = ({ paidTickets, pendingTickets, clientsReport, providersReport, branchReport, date, transactionTypesReport }: PdfFileProps) => {
  // Calcular los totales de cada columna
  const totalTicketPrice = paidTickets.reduce((sum, ticket) => sum + ticket.ticket_price, 0);
  const totalFee = paidTickets.reduce((sum, ticket) => sum + ticket.fee, 0);
  const totalAmount = paidTickets.reduce((sum, ticket) => sum + ticket.total, 0);

  const totalTicketPendingPrice = pendingTickets.reduce((sum, ticket) => sum + ticket.ticket_price, 0);
  const totalFeePending = pendingTickets.reduce((sum, ticket) => sum + ticket.fee, 0);
  const totalAmountPending = pendingTickets.reduce((sum, ticket) => sum + ticket.total, 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>- Berkana -</Text>
          <Text style={styles.subtitle}>Reporte Diario</Text>
          <Text style={styles.date}>Fecha: {date}</Text>
        </View>

        {/* Paid Tickets Section */}
        <Text style={styles.sectionTitle}>Boletos Pagados</Text>
        {paidTickets.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnExtraWide}>Nro. Ticket</Text>
              <Text style={styles.columnWide}>Book. Ref.</Text>
              <Text style={styles.column}>Fare</Text>
              <Text style={styles.column}>Fee</Text>
              <Text style={styles.column}>Total</Text>
              <Text style={styles.column}>Tasa</Text>
              <Text style={styles.column}>Total Bs</Text>
              <Text style={styles.column}>M. de Pago</Text>
              <Text style={styles.columnWide}>Pasajero</Text>
              <Text style={styles.columnWide}>Proveedor</Text>
              <Text style={styles.columnWide}>Ruta</Text>
            </View>
            {paidTickets.map((ticket) => (
              <View style={styles.tableRow} key={ticket.ticket_number}>
                <Text style={styles.columnExtraWide}>{ticket.ticket_number ?? "N/A"}</Text>
                <Text style={styles.columnWide}>{ticket.booking_ref}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.ticket_price))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.fee))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.total))}</Text>
                <Text style={styles.column}>{ticket.rate === 0 ? "N/A" : formatBolivares(convertAmountFromMiliunits(ticket.rate))}</Text>
                <Text style={styles.column}>{ticket.total_bs === 0 ? "N/A" : formatBolivares(convertAmountFromMiliunits(ticket.total_bs))}</Text>
                <Text style={styles.column}>{ticket.transaction?.payment_method === 'PAGO_MOVIL' ? "PM" : ticket.transaction?.payment_method}</Text>
                <Text style={styles.columnWide}>{ticket.passanger.first_name} {ticket.passanger.last_name}</Text>
                <Text style={styles.columnWide}>{ticket.provider.name}</Text>
                <Text style={styles.columnWide}>{ticket.routes.map((route, index) => (<Text key={`${route.origin}-${route.destiny}-${index}`}>{route.origin} - {route.destiny}</Text>))}</Text>
              </View>
            ))}
            <View style={styles.tableFooter}>
              <Text style={styles.columnExtraWide}>Total</Text>
              <Text style={styles.columnWide}></Text>
              <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(totalTicketPrice))}</Text>
              <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(totalFee))}</Text>
              <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(totalAmount))}</Text>
              <Text style={styles.column}></Text>
              <Text style={styles.columnWide}></Text>
              <Text style={styles.columnWide}></Text>
              <Text style={styles.columnWide}></Text>
            </View>
          </>
        ) : (
          <Text style={styles.noRecords}>No hay boletos pagados en este reporte.</Text>
        )}

        {/* Pending Tickets Section */}
        <Text style={styles.sectionTitle}>Boletos Pendientes</Text>
        {pendingTickets.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnExtraWide}>Nro. Ticket</Text>
              <Text style={styles.columnWide}>Book. Ref.</Text>
              <Text style={styles.column}>Fare</Text>
              <Text style={styles.column}>Fee</Text>
              <Text style={styles.column}>Total</Text>
              <Text style={styles.column}>Tasa</Text>
              <Text style={styles.column}>Total Bs</Text>
              <Text style={styles.columnWide}>Proveedor</Text>
              <Text style={styles.columnWide}>Pasajero</Text>
              <Text style={styles.columnWide}>Ruta</Text>
            </View>
            {pendingTickets.map((ticket) => (
              <View style={styles.tableRow} key={ticket.ticket_number}>
                <Text style={styles.columnExtraWide}>{ticket.ticket_number ?? "N/A"}</Text>
                <Text style={styles.columnWide}>{ticket.booking_ref}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.ticket_price))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.fee))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.total))}</Text>
                <Text style={styles.column}>{ticket.rate === 0 ? "N/A" : formatBolivares(convertAmountFromMiliunits(ticket.rate))}</Text>
                <Text style={styles.column}>{ticket.total_bs === 0 ? "N/A" : formatBolivares(convertAmountFromMiliunits(ticket.total_bs))}</Text>
                <Text style={styles.columnWide}>{ticket.provider.name}</Text>
                <Text style={styles.columnWide}>{`${ticket.passanger.first_name} ${ticket.passanger.last_name}`}</Text>
                <Text style={styles.columnWide}>{ticket.routes.map((route, index) => (<Text key={`${route.origin}-${route.destiny}-${index}`}>{route.origin} - {route.destiny}</Text>))}</Text>
              </View>
            ))}

            <View style={styles.tableFooter}>
              <Text style={styles.columnExtraWide}>Total</Text>
              <Text style={styles.columnWide}></Text>
              <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(totalTicketPendingPrice))}</Text>
              <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(totalFeePending))}</Text>
              <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(totalAmountPending))}</Text>
              <Text style={styles.columnWide}></Text>
              <Text style={styles.columnWide}></Text>
              <Text style={styles.columnWide}></Text>
            </View>
          </>
        ) : (
          <Text style={styles.noRecords}>No hay boletos pendientes en este reporte.</Text>
        )}

        {/* Client Report Section */}
        <Text style={styles.sectionTitle}>Resumen por Cliente</Text>
        {clientsReport.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnWide}>Cliente</Text>
              <Text style={styles.columnWide}>B. Pendientes</Text>
              <Text style={styles.columnWide}>B. Pagados</Text>
              <Text style={styles.columnWide}>Monto Pend.</Text>
              <Text style={styles.columnWide}>Monto Pag.</Text>
              <Text style={styles.columnWide}>Total General</Text>
            </View>
            {clientsReport.map((client) => (
              <View style={styles.tableRow} key={client.name}>
                <Text style={styles.columnWide}>{client.name}</Text>
                <Text style={styles.columnWide}>{client.pendingCount}</Text>
                <Text style={styles.columnWide}>{client.paidCount}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(client.pendingAmount))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(client.paidAmount))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(client.totalAmount))}</Text>
              </View>
            ))}

          </>
        ) : (
          <Text style={styles.noRecords}>No hay datos de clientes en este reporte.</Text>
        )}
        {/* Provider Information Box */}
        <Text style={styles.sectionTitle}>Resumen por Proveedor</Text>
        {providersReport.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnWide}>Proveedor</Text>
              <Text style={styles.column}>B. Pagados</Text>
              <Text style={styles.columnWide}>B. Pendientes</Text>
              <Text style={styles.columnExtraWide}>Deuda Pendiente</Text>
              <Text style={styles.columnWide}>Ingresos Generados</Text>
            </View>
            {providersReport.map((provider) => (
              <View style={styles.tableRow} key={provider.provider}>
                <Text style={styles.columnWide}>{provider.provider}</Text>
                <Text style={styles.column}>{provider.paidCount}</Text>
                <Text style={styles.columnWide}>{provider.pendingCount}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(provider.pendingAmount))}</Text>
                <Text style={styles.columnExtraWide}>{formatCurrency(convertAmountFromMiliunits(provider.paidAmount))}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRecords}>No hay datos de proveedores en este reporte.</Text>
        )}
        {/* Branch Information Box */}
        <Text style={styles.sectionTitle}>Resumen por Sucursal</Text>
        {branchReport.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnWide}>Sucursal</Text>
              <Text style={styles.columnWide}>Boletos Pagados</Text>
              <Text style={styles.columnWide}>Boletos Pendientes</Text>
              <Text style={styles.columnWide}>Boletos Totales</Text>
              <Text style={styles.columnWide}>Ingresos Realizados</Text>
            </View>
            {branchReport.map((branch) => (
              <View style={styles.tableRow} key={branch.name}>
                <Text style={styles.columnWide}>{branch.name}</Text>
                <Text style={styles.columnWide}>{branch.paidCount}</Text>
                <Text style={styles.columnWide}>{branch.pendingCount}</Text>
                <Text style={styles.columnWide}>{branch.ticketCount}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(branch.totalAmount))}</Text>
              </View>
            ))}

          </>
        ) : (
          <Text style={styles.noRecords}>No hay datos de sucursales en este reporte.</Text>
        )}

        {/* Transaction Types Section */}
        <Text style={styles.sectionTitle}>Resumen de Ingreso por Sucursal</Text>
        {transactionTypesReport.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnWide}>Sucursal</Text>
              {/* Create headers for each payment method dynamically */}
              {transactionTypesReport[0].payment_methods.map(paymentMethod => (
                <Text key={paymentMethod.method} style={styles.columnWide}>{paymentMethod.method}</Text>
              ))}
              <Text style={styles.columnWide}>Total de Sucur.</Text>
            </View>
            {transactionTypesReport.map((branchData) => (
              <View key={branchData.branch} style={styles.tableRow}>
                {/* Display the branch name */}
                <Text style={styles.columnWide}>{branchData.branch}</Text>
                {/* Display each payment method amount for the branch */}
                {branchData.payment_methods.map(paymentMethod => (
                  <Text key={paymentMethod.method} style={styles.columnWide}>
                    {formatCurrency(convertAmountFromMiliunits(paymentMethod.totalAmount))}
                  </Text>
                ))}
                {/* Display the branch total */}
                <Text style={styles.columnWide}>
                  {formatCurrency(convertAmountFromMiliunits(branchData.branch_total))}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRecords}>No hay datos de tipos de transacción en este reporte.</Text>
        )}
        <Text style={styles.footer}>Este es un documento generado automáticamente. Por favor, consérvelo para sus registros.</Text>
      </Page>
    </Document>
  );
};

export default PdfFile;
