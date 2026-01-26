'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
  count: number;
}

export default function DashboardChart({ data }: { data: ChartData[] }) {
  const chartData = (data && data.length > 0) ? data : Array.from({ length: 12 }, (_, i) => ({
    date: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    count: Math.floor(Math.random() * 1000),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#14b8a6"
          fillOpacity={1}
          fill="url(#colorCount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
