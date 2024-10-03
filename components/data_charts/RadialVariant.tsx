import { convertAmountFromMiliunits, formatCurrency, formatPercentage } from '@/lib/utils';
import React from 'react'
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import CategoryTooltip from './CategoryTooltip';


const COLORS = ["#0052FF", "#12C6FF", "#FF647F", "#FF9354"];

type Props = {
  data?: {
    name: string,
    amount: number,
  }[]
};

const RadialVariant = ({ data }: Props) => {
  return (
    <ResponsiveContainer width={"100%"} height={350}>
      <RadialBarChart
        cx={'50%'}
        cy={"30%"}
        barSize={10}
        innerRadius={'90%'}
        outerRadius={'40%'}
        data={data?.map((item, index) => ({
          ...item,
          fill: COLORS[index % COLORS.length]
        }))}
      >
        <RadialBar
          label={{
            position: 'insideStart',
            fill: "#fff",
            fontSize: "12px"
          }}
          background
          dataKey={'amount'}
        />
        <Legend
          layout='horizontal'
          verticalAlign='bottom'
          align='right'
          iconType='circle'
          content={({ payload }: any) => {
            return (
              <ul className='flex flex-col space-y-2'>
                {payload.map((entry: any, index: number) => (
                  <li key={`item-${index}`} className='flex items-center space-x-2'>
                    <span className='size-2 rounded-full' style={{ backgroundColor: entry.color }} />
                    <div className='space-x-1'>
                      <span className='text-sm text-muted-foreground'>{entry.value}:</span>
                      <span className='text-sm font-bold'>{formatCurrency(convertAmountFromMiliunits(entry.payload.value))}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}

export default RadialVariant
