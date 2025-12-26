
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const data = [
  { name: 'Mon', risk: 40 },
  { name: 'Tue', risk: 35 },
  { name: 'Wed', risk: 55 },
  { name: 'Thu', risk: 45 },
  { name: 'Fri', risk: 30 },
  { name: 'Sat', risk: 20 },
  { name: 'Sun', risk: 15 },
];

const severityData = [
  { name: 'Critical', count: 4, color: '#ef4444' },
  { name: 'High', count: 12, color: '#f97316' },
  { name: 'Medium', count: 25, color: '#f59e0b' },
  { name: 'Low', count: 40, color: '#10b981' },
];

export const RiskTrendChart: React.FC = () => (
  <div className="h-64 w-full bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
    <h3 className="text-sm font-medium text-zinc-400 mb-4">Risk Exposure Trend</h3>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
          itemStyle={{ color: '#06b6d4' }}
        />
        <Area type="monotone" dataKey="risk" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const SeverityDistribution: React.FC = () => (
  <div className="h-64 w-full bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
    <h3 className="text-sm font-medium text-zinc-400 mb-4">Vulnerability Severity Distribution</h3>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={severityData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip cursor={{fill: 'transparent'}} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {severityData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
