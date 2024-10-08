import { clsx, type ClassValue } from "clsx"
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 1000);
}

export function convertAmountFromMiliunits(amount: number) {
  return amount / 1000;
}

interface Period {
  from: string | Date | undefined
  to: string | Date | undefined
}


export function fillMissingDays(
  activeDays: {
    date: Date,
    income: number,
    expenses: number,
  }[],
  startDate: Date,
  endDate: Date,
){

  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const transactionsByDay = allDays.map((day) => {

    const found = activeDays.find((d) => isSameDay(d.date, day));

    if(found) {
      return found
    } else {
      return {
        date: day,
        income: 0,
        expenses: 0
      }
    }
  });

  return transactionsByDay;

}

export function formatCurrency(value: number) {
  return Intl.NumberFormat("en-US",{
    style: 'currency',
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number, options: {addPrefix?: boolean} = {
  addPrefix: false,
}) {
  const result = new Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(value / 100);

  if(options.addPrefix && value > 0) {
    return `+${result}`
  }

  return result
}

export function formatDataRange(period?:Period) {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30)

  if(!period?.from) {
    return `${format(defaultFrom, "LLL dd", {locale: es})} - ${format(defaultTo, "LLL dd, y", {locale: es})}`
  }

  if(period?.to) {
    return `${format(period.from, "LLL dd", {locale: es})} - ${format(period.to, "LLL dd, y", {locale: es})}`
  }


  return format(period.from, "LLL dd, y", {locale: es})

}
