'use client'

import { formatDataRange } from "@/lib/utils";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { driver } from "driver.js";
import 'driver.js/dist/driver.css';
import { PiggyBank, TicketCheck, TicketMinus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import DataCard from "./DataCard";

interface DataGridProps {
  total_amount: number,
  ticketCount: number,
  pendingCount: number,
  paidCount: number,
  incomeChange: number,
  pendingTicketChange: number,
  paidTicketChange: number,
}

const DataGrid = ({ total_amount, pendingCount, paidCount, incomeChange, pendingTicketChange, paidTicketChange }: DataGridProps) => {
  const params = useSearchParams();
  const from = params.get('from') || undefined
  const to = params.get('to') || undefined
  const dateRangeLabel = formatDataRange({ from, to })

  const driverObj = driver({
    smoothScroll: true,
    nextBtnText: "Siguiente",
    prevBtnText: "Anterior",
    showProgress: true,
    steps: [
      {
        element: '#card-container', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Resumen',
          description: 'En este apartado se muestra un pequeño resumen de los ingresos del (por defecto) último mes.'
        }
      },
      {
        element: '#ingresos-card', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Ingresos del Mes',
          description: 'Muestra el total de ingresos del último mes o del rango seleccionado.'
        }
      },
      {
        element: '#count-card', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Cantidad Registrada',
          description: 'Muestra la cantidad de boletos totales que han sido registrados (pendientes y pagados).'
        }
      },
      {
        element: '#pending-card', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Pendientes',
          description: 'Muestra la cantidad de boletos que aún se encuentran por pagar.'
        }
      },
      {
        element: '#paid-card', // The id or className of the div which you want to focous of highlight
        popover: {
          title: 'Pagados',
          description: 'Muestra la cantidad de boletos pagados.'
        }
      },
    ]
  });



  return (
    <>
      <Button onClick={() => driverObj.drive()} className="mb-2 w-[20px] h-[20px]" size={"icon"}><QuestionMarkIcon /></Button>
      <div id="card-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <div id="ingresos-card">
          <DataCard percentageChange={incomeChange} isCurrency title="Ingresos" value={total_amount} icon={PiggyBank} variant="default" dateRange={dateRangeLabel} />
        </div>
        <div id="pending-card">
          <DataCard percentageChange={pendingTicketChange} title="Boletos Pendientes" value={pendingCount} icon={TicketMinus} variant="warning" dateRange={dateRangeLabel} />
        </div>
        <div id="paid-card">
          <DataCard percentageChange={paidTicketChange} title="Boletos Pagados" value={paidCount} icon={TicketCheck} variant="success" dateRange={dateRangeLabel} />
        </div>
      </div>
    </>
  )
}

export default DataGrid
