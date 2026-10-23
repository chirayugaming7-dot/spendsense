// src/components/Dashboard/CategoryPieChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CategoryPieChart({ data }) {
  // Format to standard charts dataset
  const chartData = data
    .filter(item => item.value > 0)
    .map(item => ({
      name: item.name,
      value: Math.round(item.value),
      color: item.color || '#6366F1'
    }));

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: entry.color,
              display: 'inline-block'
            }} />
            <strong style={{ color: 'var(--text-primary)' }}>{entry.name}</strong>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Amount: <strong style={{ color: 'var(--text-primary)' }}>${entry.value.toLocaleString()}</strong>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Share: <strong style={{ color: 'var(--text-primary)' }}>{percentage}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifycenter: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        No expense data found for the selected filters.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '8px', 
        marginTop: '16px',
        maxHeight: '100px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {chartData.map((entry, idx) => {
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: entry.color,
                flexShrink: 0
              }} />
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap', 
                color: 'var(--text-secondary)',
                flexGrow: 1
              }}>
                {entry.name}
              </span>
              <strong style={{ color: 'var(--text-primary)', flexShrink: 0 }}>
                {percentage}%
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
