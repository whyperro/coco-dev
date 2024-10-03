import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip,
  XAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import CustomTooltip from '../misc/CustomTooltip';

type BranchData = {
  date: string;
  amount: number;
};

type Props = {
  data: {
    branchId: string;
    branchName: string;  // Optional, for labeling
    data: BranchData[];
  }[];
};

const BarVariant = ({ data }: Props) => {
  const locale = es;

  // Flattening the data
  const flattenedData = data.flatMap(branch =>
    branch.data.map(entry => ({
      date: entry.date,
      amount: entry.amount,
      branchName: branch.branchName, // Optional for labeling
    }))
  );
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={flattenedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date" // Key for the x-axis
          tickFormatter={(value) => {
            const parsedDate = parseISO(value); // Ensure date is parsed
            return format(parsedDate, 'dd MMM', { locale }); // Format date for x-axis
          }}
          style={{ fontSize: '12px' }}
          tickMargin={16}
        />
        <Tooltip
          content={<CustomTooltip />}
          formatter={(value) => [`${value} €`, 'Total Amount']} // Display currency
        />
        <Bar
          dataKey="amount" // Key for total amount
          fill="#3b82f6" // Color for the bar
          className="drop-shadow-lg"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarVariant;
