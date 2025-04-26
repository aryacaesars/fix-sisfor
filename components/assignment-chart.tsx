"use client";

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

interface AssignmentStat {
  name: string;
  value: number;
  color: string;
}

interface AssignmentChartProps {
  stats: AssignmentStat[];
}

export function AssignmentChart({ stats }: AssignmentChartProps) {
  if (!stats.some(stat => stat.value > 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No assignment data available</p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full max-w-xs">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={stats}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }: { name: string; percent: number }) => 
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {stats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 