import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSearch, Loader2, PieChart, Radar, Target } from "lucide-react";
import { useState } from "react";
import PieVariant from "./PieVariant";
import RadarVariant from "./RadarVariant";
import RadialVariant from "./RadialVariant";
import { Skeleton } from "../ui/skeleton";

type Props = {
  data: {
    name: string;
    amount: number;
  }[];
  title: string;
  description: string,
};

const BranchPie = ({ data = [], title, description }: Props) => {

  const [chartType, setChartType] = useState("pie");

  const onTypeChange = (type: string) => {
    setChartType(type);
  };

  return (
    <Card className="border-none drop-shadow-md">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center w-full">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl line-clamp-1">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select disabled defaultValue={chartType} onValueChange={onTypeChange}>
              <SelectTrigger className="lg:w-auto h-9 rounded-md px-3 disabled:opacity-85">
                <SelectValue placeholder="Tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">
                  <div className="flex items-center">
                    <PieChart className="size-4 mr-2 shrink-0" />
                    <p>Grafica de Pie</p>
                  </div>
                </SelectItem>
                <SelectItem value="radar">
                  <div className="flex items-center">
                    <Radar className="size-4 mr-2 shrink-0" />
                    <p>Grafica de Radar</p>
                  </div>
                </SelectItem>
                <SelectItem value="radial">
                  <div className="flex items-center">
                    <Target className="size-4 mr-2 shrink-0" />
                    <p>Grafica Radial</p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearch className="size-6 text-muted-foreground mr-2" />
            <p>No se ha encontrado información de este periodo...</p>
          </div>
        ) : (
          <>
            {chartType === "pie" && <PieVariant data={data} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BranchPie;


export const BranchPieLoading = () => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 lg:w-[120px] w-full" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full flex items-center justify-center">
          <Loader2 className="size-6 text-slate-300 animate-spin" />
        </div>
      </CardContent>
    </Card>
  )
}
