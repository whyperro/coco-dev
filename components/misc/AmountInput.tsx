import CurrencyInput from 'react-currency-input-field'

type Props = {
  value: string,
  onChange: (value: string | undefined) => void
  placeholder?: string,
  disabled?: boolean,
  prefix?: string
}


export const AmountInput = ({
  value,
  onChange,
  placeholder,
  disabled,
  prefix = '$'
}: Props) => {
  return <div className='relative'>
    <CurrencyInput prefix={prefix} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-75" placeholder={placeholder} value={value} decimalsLimit={2} decimalScale={2} onValueChange={onChange} disabled={disabled} groupSeparator=',' decimalSeparator='.' />
  </div>
}
