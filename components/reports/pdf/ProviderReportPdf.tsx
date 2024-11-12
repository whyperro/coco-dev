import { convertAmountFromMiliunits, formatCurrency } from "@/lib/utils";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
interface ClientTicket {
  ticket_number: string;
  booking_ref: string;
  purchase_date: string;
  flight_date: string;
  status: string;
  ticket_price: number;
  fee: number;
  total: number;
  provider: { name: string };
  transaction: { payment_ref: string | null; payment_method: string | null } | null;
  passanger: { first_name: string, last_name: string } | null;
  routes: { origin: string; destiny: string; route_type: string }[];
  branch: { location_name: string };
}
interface ProviderReportPdf {
  provider: string;  // Client's full name
  routeCounts: {
    id: string,
    origin: string,
    destiny: string,
    scale: string[],
    route_type: string,
    _count: {
      tickets: number,
    }
  }[];  // Array of associated passengers
  paidTickets: ClientTicket[];  // Array of tickets with "PAGADO" status
  pendingTickets: ClientTicket[];  // Array of tickets with "PENDIENTE" status
  date: string,
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

const ProviderReportPdf = ({ provider, paidTickets, pendingTickets, routeCounts, date }: ProviderReportPdf) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Berkana</Text>
          <Text style={styles.subtitle}>Reporte de Proveedor</Text>
          <Text style={styles.subtitle}>{provider}</Text>
          <Text style={styles.date}>Rango de Fecha</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* Paid Tickets Section */}
        <Text style={styles.sectionTitle}>Boletos Pagados</Text>
        {paidTickets.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnExtraWide}>Nro. Ticket</Text>
              <Text style={styles.columnExtraWide}>Book. Ref.</Text>
              <Text style={styles.columnWide}>Fare</Text>
              <Text style={styles.columnWide}>Fee</Text>
              <Text style={styles.columnWide}>Total</Text>
              <Text style={styles.columnWide}>Método Pago</Text>
              <Text style={styles.columnWide}>Proveedor</Text>
            </View>
            {paidTickets.map((ticket) => (
              <View style={styles.tableRow} key={ticket.ticket_number}>
                <Text style={styles.columnExtraWide}>{ticket.ticket_number}</Text>
                <Text style={styles.columnExtraWide}>{ticket.booking_ref}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.ticket_price))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.fee))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.total))}</Text>
                <Text style={styles.columnWide}>{ticket.transaction?.payment_method === 'PAGO_MOVIL' ? "PM" : "ZELLE"}</Text>
                <Text style={styles.columnWide}>{ticket.provider.name}</Text>
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
            </View>
            {pendingTickets.map((ticket) => (
              <View style={styles.tableRow} key={ticket.ticket_number}>
                <Text style={styles.columnExtraWide}>{ticket.ticket_number}</Text>
                <Text style={styles.column}>{ticket.booking_ref}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.ticket_price))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.fee))}</Text>
                <Text style={styles.column}>{formatCurrency(convertAmountFromMiliunits(ticket.total))}</Text>
                <Text style={styles.columnWide}>{ticket.provider.name}</Text>
                <Text style={styles.columnWide}>{ticket.passanger?.last_name} {ticket.passanger?.first_name} </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRecords}>No hay boletos pendientes en este reporte.</Text>
        )}

        {/* Client Report Section */}
        <Text style={styles.sectionTitle}>Resumen de vuelos</Text>
        {routeCounts.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnWide}>Origen</Text>
              <Text style={styles.columnWide}>Escalas</Text>
              <Text style={styles.columnWide}>Destinos</Text>
              <Text style={styles.columnWide}>Tipo de ruta</Text>
              <Text style={styles.columnWide}>Vuelos realizados</Text>

            </View >
            {routeCounts.map((route) => (
              <View style={styles.tableRow} key={route.origin}>
                <Text style={styles.columnWide}>{route.origin}</Text>
                <Text style={styles.columnWide}>{route.scale ? route.scale : "N/A"}</Text>
                <Text style={styles.columnWide}>{route.destiny}</Text>
                <Text style={styles.columnWide}>{route.route_type}</Text>
                <Text style={styles.columnWide}>{route._count.tickets}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRecords}>No hay datos de rutas en este reporte.</Text>
        )}
        {/* Footer */}
        <Text style={styles.footer}>Este es un documento generado automáticamente. Por favor, consérvelo para sus registros.</Text>
      </Page>
    </Document>
  );
};

export default ProviderReportPdf;
