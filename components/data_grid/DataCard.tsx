import { CountUp } from '@/components/misc/CountUp'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn, formatCurrency, formatPercentage } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"
import { LucideProps } from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes } from "react"
import { Skeleton } from "../ui/skeleton"


const boxVariants = cva(
  "rounded-md p-3",
  {
    variants: {
      variant: {
        default: "bg-blue-500/20",
        success: "bg-emerald-500/20",
        danger: "bg-rose-500/20",
        warning: "bg-yellow-500/20",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const iconVariants = cva(
  "size-6",
  {
    variants: {
      variant: {
        default: "fill-blue-500",
        success: "fill-emerald-500",
        danger: "fill-rose-500",
        warning: "fill-yellow-500",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

type BoxVariants = VariantProps<typeof boxVariants>
type IconVariants = VariantProps<typeof iconVariants>


interface DataCardProps extends BoxVariants, IconVariants {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>,
  title: string,
  value?: number,
  percentageChange: number,
  dateRange: string,
  isCurrency?: boolean,
}

const DataCard = ({ icon: Icon, title, value = 0, variant, dateRange, percentageChange, isCurrency }: DataCardProps) => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-2xl line-clamp-1">{title}</CardTitle>
          <CardDescription className="line-clamp-1">{dateRange}</CardDescription>
        </div>
        <div className={cn("shrink-0", boxVariants({ variant }))}>
          <Icon className={cn(iconVariants({ variant }))} />
        </div>
      </CardHeader>
      <CardContent>
        <h1 className="font-bold text-2xl mb-2 line-clamp-1 break-all">
          <CountUp preserveValue start={0} end={value} decimal={"."} decimals={isCurrency ? 2 : undefined} formattingFn={isCurrency ? formatCurrency : undefined} />
        </h1>
        <p className={cn("text-muted-foreground text-sm line-clamp-1", percentageChange > 0 ? "text-emerald-500" : "text-rose-500")}>
          {formatPercentage(percentageChange)} desde el último periodo
        </p>
      </CardContent>
    </Card>
  )
}

export default DataCard

export const DataCardLoading = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-x-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-2/4" />
          <Skeleton className="h-6 w-2/4" />
        </div>
        <Skeleton className="size-12" />
      </CardHeader>
      <CardContent>
        <Skeleton className="shrink-0 h-10 w-24 mb-2" />
        <Skeleton className="shrink-0 h-4 w-40" />
      </CardContent>
    </Card>
  )
}
