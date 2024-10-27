"use client";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { convertAmountFromMiliunits, formatCurrency } from "@/lib/utils";
import { Ticket } from "@/types";
import '@fontsource/poppins';

interface PdfFileProps {
  paidTickets: Ticket[];
  pendingTickets: Ticket[];
  date: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    backgroundColor: "#f7f7f7", // Fondo claro
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#4CAF50", // Color verde
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // Color gris oscuro
  },
  date: {
    fontSize: 12,
    marginBottom: 15,
    color: "#555", // Color gris medio
  },
  sectionTitle: {
    fontSize: 16,
    marginVertical: 10,
    textDecoration: "underline", // Subrayado
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    backgroundColor: "#e0e0e0",
    padding: 5,
    fontWeight: "bold", // Negrita para el encabezado
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff", // Color blanco para las filas
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
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#777", // Color gris claro
  },
  noRecords: {
    textAlign: "center",
    fontSize: 12,
    marginVertical: 10,
    color: "#f44336", // Color rojo para el mensaje de error
  },
});

const PdfFile = ({ paidTickets, pendingTickets, date }: PdfFileProps) => {
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
              <Text style={styles.column}>Nro. Ticket</Text>
              <Text style={styles.columnWide}>Booking Ref</Text>
              <Text style={styles.columnWide}>Fare</Text>
              <Text style={styles.columnWide}>Fee</Text>
              <Text style={styles.columnWide}>Total</Text>
              <Text style={styles.columnWide}>Método Pago</Text>
              <Text style={styles.columnWide}>Pasajero</Text>
              <Text style={styles.columnWide}>Proveedor</Text>
              <Text style={styles.columnWide}>Ruta</Text>
            </View>
            {paidTickets.map((ticket) => (
              <View style={styles.tableRow} key={ticket.ticket_number}>
                <Text style={styles.column}>{ticket.ticket_number}</Text>
                <Text style={styles.columnWide}>{ticket.booking_ref}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.ticket_price))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.fee))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.total))}</Text>
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
              <Text style={styles.column}>Nro. Ticket</Text>
              <Text style={styles.column}>Booking Ref</Text>
              <Text style={styles.columnWide}>Fare</Text>
              <Text style={styles.columnWide}>Fee</Text>
              <Text style={styles.columnWide}>Total</Text>
              <Text style={styles.columnWide}>Proveedor</Text>
              <Text style={styles.columnWide}>Pasajero</Text>
              <Text style={styles.columnWide}>Ruta</Text>
            </View>
            {pendingTickets.map((ticket) => (
              <View style={styles.tableRow} key={ticket.ticket_number}>
                <Text style={styles.column}>{ticket.ticket_number}</Text>
                <Text style={styles.column}>{ticket.booking_ref}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.ticket_price))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.fee))}</Text>
                <Text style={styles.columnWide}>{formatCurrency(convertAmountFromMiliunits(ticket.total))}</Text>
                <Text style={styles.columnWide}>{ticket.provider.name}</Text>
                <Text style={styles.columnWide}>{`${ticket.passanger.first_name} ${ticket.passanger.last_name}`}</Text>
                <Text style={styles.columnWide}>{ticket.route.origin} - {ticket.route.destiny}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noRecords}>No hay boletos pendientes en este reporte.</Text>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Este es un documento generado automáticamente. Por favor, conservenlo para sus registros.</Text>
      </Page>
    </Document>
  );
};

export default PdfFile;
