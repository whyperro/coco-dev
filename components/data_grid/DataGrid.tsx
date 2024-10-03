'use client'

import { formatDataRange } from "@/lib/utils";
import { PiggyBank, Tickets } from "lucide-react";
import { useSearchParams } from "next/navigation";
import DataCard from "./DataCard";

interface DataGridProps {
  total_amount: number,
  ticketCount: number,
  pendingCount: number,
}

const DataGrid = ({ total_amount, ticketCount, pendingCount }: DataGridProps) => {
  const params = useSearchParams();
  const from = params.get('from') || undefined
  const to = params.get('to') || undefined
  const dateRangeLabel = formatDataRange({ to, from })
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
      <DataCard percentageChange={24.33} isCurrency title="Ingresos" value={total_amount} icon={PiggyBank} variant="default" dateRange={dateRangeLabel} />
      <DataCard percentageChange={24.33} title="Boletos Registrados" value={ticketCount} icon={Tickets} variant="default" dateRange={dateRangeLabel} />
      <DataCard percentageChange={24.33} title="Boletos Pendientes" value={pendingCount} icon={Tickets} variant="default" dateRange={dateRangeLabel} />
    </div>
  )
}

export default DataGrid
