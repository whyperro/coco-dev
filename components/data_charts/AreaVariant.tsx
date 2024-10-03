import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip,
  XAxis,
  AreaChart,
  Area,
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

const AreaVariant = ({ data }: Props) => {
  const locale = es;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data.flatMap(branch => branch.data.map(d => ({ ...d, branchId: branch.branchId, branchName: branch.branchName })))}>
        <CartesianGrid strokeDasharray="3 3" />
        <defs>
          {data.map((branch, index) => (
            <linearGradient
              id={`colorBranch${index}`}
              key={branch.branchId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="2%" stopColor={`#${Math.floor(Math.random() * 16777215).toString(16)}`} stopOpacity={0.8} />
              <stop offset="98%" stopColor={`#${Math.floor(Math.random() * 16777215).toString(16)}`} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(value) => format(parseISO(value), 'dd MMM', { locale })}
          style={{ fontSize: '12px' }}
          tickMargin={16}
        />
        <Tooltip
          content={<CustomTooltip />}
          formatter={(value, name) => [`${value} $`, name]} // Ensure this includes the right value and name
        />

        {/* Generate an Area for each branch */}
        {data.map((branch, index) => (
          <Area
            key={branch.branchId}
            type="monotone"
            dataKey="amount"
            data={branch.data}
            name={branch.branchName} // This name will be used in the tooltip
            strokeWidth={2}
            stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
            fill={`url(#colorBranch${index})`}
            className="drop-shadow-lg"
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaVariant;
