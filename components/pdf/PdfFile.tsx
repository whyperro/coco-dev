"use client"
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { useGetPaidTickets, useGetPaidTicketsReport } from "@/actions/tickets/actions";
import { Ticket } from "@/types";
import { convertAmountFromMiliunits, convertAmountToMiliunits } from "@/lib/utils";

  interface PdfFileProps {
    tickets: Ticket[] | undefined; // Puede ser undefined si aún no se han cargado
    error: Error | null; // Puede ser null si no hay error
  }


const PdfFile = ({tickets, error}: PdfFileProps) => {
    
    const style = StyleSheet.create({
        page:{
            padding:20,
        },
        header:{
            flexDirection:"row",
            marginBottom:"35px",
            gap:5,
            justifyContent:"space-between",
            alignItems:"center"
        },
        logo:{
            color:'#63c144',
            height:"auto",
            fontWeight:"bold"
        },
        textConteiner:{
            alignItems:"center",
            marginLeft:"20px"
        },
        textOne:{
            fontSize:"18px",
            fontWeight:"bold",
            letterSpacing:"2px",
            marginBottom:"3px"

        },
        tableHeader:{
            flexDirection:'row',
            border:1,
            borderColor:'#000000'
        },
        tableHeaderColumn1:{
            width:"70%",
            textAlign:"center",
            fontSize:"9px",
            paddingBottom:"10px",
            paddingTop:"10px",
            backgroundColor: '#E4E4E4',
            // marginLeft:"11px",
            borderColor:'#000000'

        },
        tableHeaderColumn2:{
            width:"50%",
            textAlign:"center",
            fontSize:"9px",
            backgroundColor: '#E4E4E4',
            // paddingBottom:"10px",
            borderLeft:1,
            // paddingTop:"10px",
            padding:"10px",
            borderColor:'#000000'
        },
        tableHeaderColumn3:{
            width:"70%",
            textAlign:"center",
            fontSize:"9px",
            paddingBottom:"10px",
            backgroundColor: '#E4E4E4',
            borderLeft:1,
            paddingTop:"10px",
            // marginLeft:"11px",
            borderColor:'#000000'

        },
        tableColumn1:{
            width:"70%",
            textAlign:"center",
            fontSize:"9px",
            paddingBottom:"10px",
            paddingTop:"10px",
            // marginLeft:"11px",
            borderColor:'#000000'

        },
        tableColumn2:{
            width:"50%",
            textAlign:"center",
            fontSize:"9px",
            // paddingBottom:"10px",
            borderLeft:1,
            // paddingTop:"10px",
            padding:"10px",
            borderColor:'#000000'
        },
        tableColumn3:{
            width:"70%",
            textAlign:"center",
            fontSize:"9px",
            paddingBottom:"10px",
            borderLeft:1,
            paddingTop:"10px",
            // marginLeft:"11px",
            borderColor:'#000000'

        },
        tableRow:{
            flexDirection:"row",
            border:1,
            borderTop:"none",
            borderColor:'#000000'
        },        


    })

    if (error) {
        return <div>Error fetching tickets: {error.message}</div>;
    }    

  return (
    <Document>
        <Page size='A4' style={style.page}>
            <View style={style.header}>
                <View>
                    <Text style={style.logo}>Berkana</Text>
                </View>
                <View style={style.textConteiner}>
                    <Text style={style.textOne}>Reporte Diario</Text>
                </View>
            </View>
            <View style={style.tableHeader}>                
                <Text style={style.tableHeaderColumn1}>TICKET</Text>
                <Text style={style.tableHeaderColumn2}>FARE</Text>
                <Text style={style.tableHeaderColumn2}>TAX</Text>
                <Text style={style.tableHeaderColumn2}>FEE</Text>
                <Text style={style.tableHeaderColumn2}>COMM</Text>
                <Text style={style.tableHeaderColumn2}>NET</Text>
                <Text style={style.tableHeaderColumn2}>FP</Text>
                <Text style={style.tableHeaderColumn2}>TRANS</Text>
                <Text style={style.tableHeaderColumn2}>RELOC</Text>
                <Text style={style.tableHeaderColumn3}>PAX NAME</Text>
                <Text style={style.tableHeaderColumn3}>OBS</Text>
            </View>
            {tickets?.map((ticket, index) =>(
                <View style={style.tableRow} key={index}>                   
                    <Text style={style.tableColumn1}>{ticket.ticket_number}</Text>
                    <Text style={style.tableColumn2}>{convertAmountFromMiliunits(ticket.ticket_price)}</Text>
                    <Text style={style.tableColumn2}>TAX</Text>
                    <Text style={style.tableColumn2}>{convertAmountFromMiliunits(ticket.fee)}</Text>
                    <Text style={style.tableColumn2}>COMM</Text>
                    <Text style={style.tableColumn2}>{convertAmountFromMiliunits(ticket.total)}</Text>
                    <Text style={style.tableColumn2}>{ticket.transaction?.payment_method || 'N/A'}</Text>
                    <Text style={style.tableColumn2}>TKTT</Text>
                    <Text style={style.tableColumn2}>{ticket.booking_ref}</Text>
                    <Text style={style.tableColumn3}>{`${ticket.passanger.first_name} ${ticket.passanger.last_name}`}</Text>
                    <Text style={style.tableColumn3}>{ticket.description}</Text>
                </View>
            ))}

        </Page>
    </Document>
  );
};

export default PdfFile;


