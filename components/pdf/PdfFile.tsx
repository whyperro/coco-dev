import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { convertAmountFromMiliunits, formatCurrency } from "@/lib/utils";
import { Ticket } from "@/types";

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
    totalAmount: number,
  }[],
  date: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    backgroundColor: "#f7f7f7",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#4CAF50",
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
    backgroundColor: "#e0e0e0",
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
  },
  providerText: {
    fontSize: 12,
  },
});

const PdfFile = ({ paidTickets, pendingTickets, clientsReport, providersReport, date }: PdfFileProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Berkana</Text>
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
              <Text style={styles.columnWide}>Método Pago</Text>
              <Text style={styles.columnWide}>Pasajero</Text>
              <Text style={styles.columnWide}>Proveedor</Text>
              <Text style={styles.columnWide}>Ruta</Text>
            </View>
            {paidTickets.map((ticket) => (
              <View style={styles.tableRow} key={ticket.ticket_number}>
                <Text style={styles.columnExtraWide}>{ticket.ticket_number}</Text>
                <Text style={styles.columnWide}>{ticket.booking_ref}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.ticket_price))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.fee))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.total))}</Text>
                <Text style={styles.columnWide}>{ticket.transaction?.payment_method === 'PAGO_MOVIL' ? "PM" : "ZELLE"}</Text>
                <Text style={styles.columnWide}>{ticket.passanger.first_name} {ticket.passanger.last_name}</Text>
                <Text style={styles.columnWide}>{ticket.provider.name}</Text>
                <Text style={styles.columnWide}>{ticket.route.origin} - {ticket.route.destiny}</Text>
              </View>
            ))}
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
              <Text style={styles.column}>Book. Ref.</Text>
              <Text style={styles.column}>Fare</Text>
              <Text style={styles.column}>Fee</Text>
              <Text style={styles.column}>Total</Text>
              <Text style={styles.columnWide}>Proveedor</Text>
              <Text style={styles.columnWide}>Pasajero</Text>
              <Text style={styles.columnWide}>Ruta</Text>
            </View>
            {pendingTickets.map((ticket) => (
              <View style={styles.tableRow} key={ticket.ticket_number}>
                <Text style={styles.columnExtraWide}>{ticket.ticket_number}</Text>
                <Text style={styles.column}>{ticket.booking_ref}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.ticket_price))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.fee))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.total))}</Text>
                <Text style={styles.columnWide}>{ticket.provider.name}</Text>
                <Text style={styles.columnWide}>{`${ticket.passanger.first_name} ${ticket.passanger.last_name}`}</Text>
                <Text style={styles.columnWide}>{ticket.route.origin} - {ticket.route.destiny}</Text>
              </View>
            ))}
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
              <Text style={styles.column}>B. Pendientes</Text>
              <Text style={styles.columnWide}>Deuda Pendiente</Text>
              <Text style={styles.columnWide}>Ingresos Realizados</Text>
              <Text style={styles.columnWide}>Total General</Text>
            </View>
            {providersReport.map((provider) => (
              <View style={styles.tableRow} key={provider.provider}>
                <Text style={styles.columnWide}>{provider.provider}</Text>
                <Text style={styles.column}>{provider.paidCount}</Text>
                <Text style={styles.column}>{provider.pendingCount}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(provider.pendingAmount))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(provider.paidCount))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(provider.totalAmount))}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRecords}>No hay datos de proveedores en este reporte.</Text>
        )}
        {/* Footer */}
        <Text style={styles.footer}>Este es un documento generado automáticamente. Por favor, consérvelo para sus registros.</Text>
      </Page>
    </Document>
  );
};

export default PdfFile;
