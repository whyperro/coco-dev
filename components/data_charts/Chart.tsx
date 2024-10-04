import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaChart, BarChart, FileSearch, LineChart, Loader2 } from "lucide-react";
import { useState } from "react";
import AreaVariant from "./AreaVariant"; // Assuming you're using an Area Chart
import BarVariant from "./BarVariant";
import LineVariant from "./LineVariant";
import { useGetBranches } from "@/actions/branches/actions";

type BranchData = {
  branchId: string;
  branchName: string;
  data: {
    date: string;
    amount: number;
  }[];
};

type Props = {
  data?: BranchData[];
};

const Chart = ({ data = [] }: Props) => {

  const [chartType, setChartType] = useState("area");

  const { data: branches, loading } = useGetBranches();

  const [selectedBranch, setSelectedBranch] = useState<string>("all"); // State for selected branch

  const onTypeChange = (type: string) => {
    setChartType(type);
  };

  const onBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
  };

  // Filter data based on selected branch
  const filteredData = selectedBranch === "all"
    ? data // Show all branches
    : data.filter(branch => branch.branchId === selectedBranch); // Show selected branch

  return (
    <Card className="border-none drop-shadow-md">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center w-full">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl line-clamp-1">Transacciones</CardTitle>
            <CardDescription className="text-muted-foreground">
              Aquí puede ver la gráfica de los ingresos totales dado el rango.
            </CardDescription>
          </div>
          <div className="flex flex-col xl:flex-row gap-2">
            <Select defaultValue={chartType} onValueChange={onTypeChange}>
              <SelectTrigger className="lg:w-auto h-9 rounded-md px-3">
                <SelectValue placeholder="Tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">
                  <div className="flex items-center">
                    <AreaChart className="size-4 mr-2 shrink-0" />
                    <p>Grafica de Áreas</p>
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center">
                    <BarChart className="size-4 mr-2 shrink-0" />
                    <p>Grafica de Barras</p>
                  </div>
                </SelectItem>
                <SelectItem value="line">
                  <div className="flex items-center">
                    <LineChart className="size-4 mr-2 shrink-0" />
                    <p>Grafica de Líneas</p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all" onValueChange={onBranchChange}>
              <SelectTrigger className="lg:w-auto h-9 rounded-md px-3">
                <SelectValue placeholder="Seleccione una sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <p>Todas las Sucursales</p>
                </SelectItem>
                {
                  loading && <Loader2 className="size-4 animate-spin" />
                }
                {branches && branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.location_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className="size-6 text-muted-foreground mr-2" />
            <p>No se ha encontrado información de este periodo...</p>
          </div>
        ) : (
          <>
            {chartType === "area" && <AreaVariant data={filteredData} />}
            {chartType === 'bar' && <BarVariant data={filteredData} />}
            {chartType === 'line' && <LineVariant data={filteredData} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Chart;
