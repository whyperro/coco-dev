import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { convertAmountFromMiliunits, formatCurrency } from "@/lib/utils";
import { Ticket } from "@/types";

interface Passenger {
  first_name: string;
  last_name: string;
  dni_type: string;
  dni_number: string;
  phone_number: string | null;
  email: string | null
}
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
  routes: { origin: string; destiny: string; route_type: string }[];
  branch: { location_name: string };
}
interface ClientReportPdf {
  client: string;  // Client's full name
  passengers: Passenger[];  // Array of associated passengers
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

const ClientReportPdf = ({ client, paidTickets, pendingTickets, passengers, date }: ClientReportPdf) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Berkana</Text>
          <Text style={styles.subtitle}>Reporte de Cliente</Text>
          <Text style={styles.subtitle}>{client}</Text>
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
              <Text style={styles.columnWide}>Ruta</Text>
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
                <Text style={styles.columnWide}>{ticket.routes.map((route) => (<p>{route.origin} - {route.destiny}</p>))}</Text>
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
                <Text style={styles.columnWide}>{ticket.routes.map((route) => (<p>{route.origin} - {route.destiny}</p>))}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRecords}>No hay boletos pendientes en este reporte.</Text>
        )}

        {/* Client Report Section */}
        <Text style={styles.sectionTitle}>Pasajeros del Cliente</Text>
        {passengers.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.columnWide}>Nombre</Text>
              <Text style={styles.columnWide}>Apellido</Text>
              <Text style={styles.columnWide}>Identificación</Text>
              <Text style={styles.columnWide}>Nro. TLF</Text>
              <Text style={styles.columnWide}>Correo</Text>
            </View>
            {passengers.map((passanger) => (
              <View style={styles.tableRow} key={passanger.dni_number}>
                <Text style={styles.columnWide}>{passanger.first_name}</Text>
                <Text style={styles.columnWide}>{passanger.last_name}</Text>
                <Text style={styles.columnWide}>{passanger.dni_type}-{passanger.dni_number}</Text>
                <Text style={styles.columnWide}>{passanger.phone_number ?? "N/A"}</Text>
                <Text style={styles.columnWide}>{passanger.email ?? "N/A"}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRecords}>No hay datos de pasajeros en este reporte.</Text>
        )}
        {/* Footer */}
        <Text style={styles.footer}>Este es un documento generado automáticamente. Por favor, consérvelo para sus registros.</Text>
      </Page>
    </Document>
  );
};

export default ClientReportPdf;
