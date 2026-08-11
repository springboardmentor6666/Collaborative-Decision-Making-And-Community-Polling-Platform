import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { OptionResponse } from '@/modules/decisions/types/decision';

interface PollChartProps {
  options: OptionResponse[];
  voteCounts: Record<number, number>;
  totalVotes: number;
}

export function PollChart({ options, voteCounts, totalVotes }: PollChartProps) {
  // Format data for Recharts
  const data = options.map(opt => ({
    name: opt.title,
    votes: voteCounts[opt.optionId] || 0,
    percentage: totalVotes > 0 ? Math.round(((voteCounts[opt.optionId] || 0) / totalVotes) * 100) : 0,
  }));

  // Find max votes for color highlighting
  const maxVotes = Math.max(...data.map(d => d.votes), 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          <p className="text-slate-300 text-sm">
            <span className="font-bold text-blue-400">{payload[0].value}</span> votes
            <span className="text-slate-500 ml-2">({payload[0].payload.percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 14 }}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.votes === maxVotes && entry.votes > 0 ? '#3b82f6' : '#475569'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
