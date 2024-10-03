import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '../ui/separator';

const CustomTooltip = ({ active, payload }: any) => {
  const locale = es;

  // If tooltip is not active or no payload, return null
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Extract date and value from the payload
  const { date, amount, branchName } = payload[0].payload; // Update to match new data structure
  console.log(payload[0].payload)
  return (
    <div className="rounded-sm bg-white shadow-sm border overflow-hidden">
      {/* Tooltip Header: Date */}
      <div className="text-sm p-2 px-3 bg-muted text-muted-foreground italic font-medium">
        {format(new Date(date), 'MMM dd, yyyy', { locale })} {/* Ensure 'date' is used */}
      </div>

      <Separator />

      {/* Tooltip Body: Income/Expenses */}
      <div className="p-2 px-3 space-y-1">
        <div className="flex flex-col items-center justify-between gap-x-4">
          <div className='flex items-center justify-between gap-x-2'>
            <div className="flex items-center gap-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <p className="text-sm text-muted-foreground">Total del día:</p>
            </div>
            <p className="text-sm text-right font-bold text-blue-500">
              {formatCurrency(amount)} {/* Update to match new data structure */}
            </p>
          </div>
          <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <p className="text-sm text-muted-foreground">Sucursal:</p>
          </div>
          <p className="text-sm text-right font-bold text-blue-500">
            {branchName} {/* Update to match new data structure */}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTooltip;
