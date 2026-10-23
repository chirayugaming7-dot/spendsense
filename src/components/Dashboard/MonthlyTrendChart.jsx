// src/components/Dashboard/MonthlyTrendChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyTrendChart({ data }) {
  // Format data: e.g. [{ month: '2026-10-21', expense: 120, income: 450 }]
  const chartData = data.map(item => {
    // If daily format YYYY-MM-DD
    if (item.month && item.month.length === 10) {
      const [year, month, day] = item.month.split('-');
      const date = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10));
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        monthLabel: label,
        Earned: Math.round(item.income),
        Spent: Math.round(item.expense)
      };
    }
    // Convert YYYY-MM to word form
    const [year, month] = (item.month || '').split('-');
    const date = new Date(year, parseInt(month, 10) - 1, 1);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return {
      monthLabel: label,
      Earned: Math.round(item.income),
      Spent: Math.round(item.expense)
    };
  });

  const formatYAxis = (value) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '0.8rem'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{label}</div>
          {payload.map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0', color: 'var(--text-secondary)' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: entry.color,
                display: 'inline-block'
              }} />
              <span>{entry.name}:</span>
              <strong style={{ color: 'var(--text-primary)', marginLeft: 'auto' }}>
                ${entry.value.toLocaleString()}
              </strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis 
            dataKey="monthLabel" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(28, 25, 23, 0.02)' }} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}
          />
          <Bar 
            dataKey="Earned" 
            fill="var(--color-income)" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={32}
          />
          <Bar 
            dataKey="Spent" 
            fill="var(--color-expense)" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
