'use client'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { es } from "date-fns/locale";

const DailyReportGenerator = () => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [dateState, setDateState] = useState<Date>();

  // Parse and initialize date from the URL, or set it to today if not present
  const dateParam = params.get("date");
  const initialDate = dateParam ? parseISO(dateParam) : new Date();

  // Update dateState when the URL date param changes
  useEffect(() => {
    setDateState(initialDate);
  }, [dateParam]);

  const pushToUrl = (date: Date | undefined) => {
    const query = {
      date: date ? format(date, "yyyy-MM-dd") : undefined,
    };
    const url = queryString.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  };

  const onReset = () => {
    pushToUrl(undefined); // Clear the date in URL
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] pl-3 text-left font-normal",
            !dateState && "text-muted-foreground"
          )}
        >
          {dateState ? (
            format(dateState, "PPP", { locale: es })
          ) : (
            <span>Pick a date</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateState}
          locale={es}
          onSelect={(date) => setDateState(date)}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          initialFocus
        />
        <div className="p-4 w-full flex items-center gap-x-2">
          <PopoverClose asChild>
            <Button onClick={onReset} disabled={!dateState} className="w-full" variant="outline">
              Reiniciar
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button onClick={() => pushToUrl(dateState)} disabled={!dateState} className="w-full">
              Aplicar
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DailyReportGenerator;
