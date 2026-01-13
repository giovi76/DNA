
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SequenceStats } from '../types';

interface Props {
  stats: SequenceStats;
}

const COLORS = {
  A: '#10b981', // emerald-500
  T: '#ef4444', // red-500
  C: '#f59e0b', // amber-500
  G: '#3b82f6', // blue-500
};

const SequenceStatsChart: React.FC<Props> = ({ stats }) => {
  const data = [
    { name: 'Adenine (A)', value: stats.counts.A, color: COLORS.A },
    { name: 'Thymine (T)', value: stats.counts.T, color: COLORS.T },
    { name: 'Cytosine (C)', value: stats.counts.C, color: COLORS.C },
    { name: 'Guanine (G)', value: stats.counts.G, color: COLORS.G },
  ].filter(d => d.value > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SequenceStatsChart;
