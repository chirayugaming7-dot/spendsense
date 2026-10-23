// src/components/Dashboard/StatCards.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Scale, TrendingUp } from 'lucide-react';

export default function StatCards({ summary }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val || 0);
  };

  // Calculate average daily spend assuming August, September, October 2026 data is present (approx 92 days)
  const avgDailySpend = (summary.totalExpenses || 0) / 92;

  const cards = [
    {
      label: 'Total Earned',
      value: formatCurrency(summary.totalIncome),
      icon: ArrowUpRight,
      iconClass: 'income',
      subtext: 'August - October 2026'
    },
    {
      label: 'Total Spent',
      value: formatCurrency(summary.totalExpenses),
      icon: ArrowDownRight,
      iconClass: 'expense',
      subtext: 'August - October 2026'
    },
    {
      label: 'Net Cashflow',
      value: formatCurrency(summary.netBalance),
      icon: Scale,
      iconClass: 'balance',
      subtext: summary.netBalance >= 0 ? 'Surplus balance' : 'Deficit balance',
      valueColor: summary.netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'
    },
    {
      label: 'Avg. Daily Spend',
      value: formatCurrency(avgDailySpend),
      icon: TrendingUp,
      iconClass: 'daily',
      subtext: 'Aggregated daily average'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="stat-card">
            <div className="stat-header">
              <span className="stat-label">{card.label}</span>
              <div className={`stat-icon ${card.iconClass}`}>
                <Icon size={16} />
              </div>
            </div>
            <div 
              className="stat-value" 
              style={card.valueColor ? { color: card.valueColor } : {}}
            >
              {card.value}
            </div>
            <div className="stat-subtext">{card.subtext}</div>
          </div>
        );
      })}
    </div>
  );
}
