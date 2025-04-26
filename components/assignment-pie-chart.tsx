'use client';

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AssignmentPieChartProps {
  data: ChartData[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return value === 0 ? null : (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AssignmentPieChart({ data }: AssignmentPieChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  
  return (
    <div className="relative w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={85}
            innerRadius={65}
            fill="#8884d8"
            dataKey="value"
            label={renderCustomizedLabel}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                strokeWidth={0}
              />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: '14px',
              paddingTop: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-2xl font-bold text-foreground">
          {total}
        </div>
        <div className="text-sm text-muted-foreground">
          Total
        </div>
      </div>
    </div>
  );
} 