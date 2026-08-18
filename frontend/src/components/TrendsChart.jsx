import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { LineChart as LineChartIcon, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs space-y-1">
        <p className="text-slate-400 font-mono">{label}</p>
        <p className="text-emerald-400 font-bold text-sm">
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
};

export default function TrendsChart({
  data = [],
  metricName = 'Weight',
  unit = 'kg',
  height = 280,
  color = '#10b981', // emerald-500
}) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800"
        style={{ height }}
      >
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <TrendingUp className="h-6 w-6" />
        </div>
        <p className="text-sm font-bold text-white">No trend data recorded</p>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Log a few entries over time to visualize your {metricName.toLowerCase()} trend.
        </p>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800"
        style={{ height }}
      >
        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
          <LineChartIcon className="h-6 w-6" />
        </div>
        <p className="text-sm font-bold text-white">1 Data Point Logged</p>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Current value: <span className="font-mono text-emerald-400 font-bold">{data[0].value} {unit}</span> on {data[0].date}.
          Log at least 2 entries to generate your progression chart.
        </p>
      </div>
    );
  }

  const values = data.map((d) => Number(d.value)).filter((v) => !isNaN(v));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.1 || 2;
  const yDomain = [
    Math.max(0, Math.floor(minVal - padding)),
    Math.ceil(maxVal + padding),
  ];

  const gradientId = `trendGradient_${metricName.replace(/\s+/g, '_')}`;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(str) => {
              if (!str) return '';
              const parts = str.split('-');
              return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : str;
            }}
          />

          <YAxis
            domain={yDomain}
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip content={<CustomTooltip unit={unit} />} />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: color, strokeWidth: 1.5, stroke: '#020617' }}
            activeDot={{ r: 6, fill: '#ffffff', stroke: color, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
