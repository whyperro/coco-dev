import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip,
  XAxis,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid
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

const LineVariant = ({ data }: Props) => {
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
    <ResponsiveContainer width={"100%"} height={350}>
      <LineChart data={flattenedData}>
        <CartesianGrid strokeDasharray={"3 3"} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey={"date"}
          tickFormatter={(value) => format(new Date(value), "dd MMM", { locale })} // Ensure to parse the date correctly
          style={{ fontSize: "12px" }}
          tickMargin={16}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line dot={false} dataKey={"amount"} stroke='#3b82f6' strokeWidth={2} className='drop-shadow-lg' />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineVariant;
