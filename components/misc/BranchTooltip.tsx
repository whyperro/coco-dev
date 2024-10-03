import { convertAmountFromMiliunits, formatCurrency } from '@/lib/utils';
import { Separator } from '../ui/separator';

const BranchTooltip = ({ active, payload }: any) => {
  if (!active) {
    return null;
  }
  const name = payload[0].payload.name;
  const value = payload[0].value;

  return (
    <div className='rounded-sm bg-white shadow-sm border overflow-hidden'>
      <div className='text-sm p-2 px-3 bg-muted text-muted-foreground'>
        {name}
      </div>
      <Separator />
      <div className='flex items-center justify-between gap-x-4'>
        <div className='flex items-center gap-x-2'>
          <div className='size-1.5 bg-green-600 rounded-full ml-2' />
          <p className='text-sm text-muted-foreground'>Ingreso</p>
        </div>
        <p className='text-sm text-right font-bold'>
          {formatCurrency(convertAmountFromMiliunits(value))}
        </p>
      </div>
    </div>
  )
}

export default BranchTooltip
