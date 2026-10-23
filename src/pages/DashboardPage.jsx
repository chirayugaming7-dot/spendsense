// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { getAggregatedSummary, getCategoryBreakdown, getMonthlyTrend } from '../db/queries';
import StatCards from '../components/Dashboard/StatCards';
import CategoryPieChart from '../components/Dashboard/CategoryPieChart';
import MonthlyTrendChart from '../components/Dashboard/MonthlyTrendChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import CategoryIcon from '../components/Common/CategoryIcon';
import { ArrowRight } from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  const { db, mutateCount } = useDatabase();
  const [summary, setSummary] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const loadDashboardData = () => {
      try {
        const agSummary = getAggregatedSummary(db);
        const breakdown = getCategoryBreakdown(db);
        const trend = getMonthlyTrend(db);

        setSummary(agSummary);
        setPieData(breakdown);
        setTrendData(trend);
      } catch (err) {
        console.error("Failed to query dashboard database:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [db, mutateCount]);

  if (isLoading) {
    return <LoadingSpinner text="Fetching financial metrics..." />;
  }

  if (!summary) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No transaction summary available. Please check database connection.</p>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Statistics Row */}
      <StatCards summary={summary} />

      {/* 2. Charts Row */}
      <div className="charts-grid">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title">Cashflow Trend (Earned vs Spent)</div>
          <div className="chart-container">
            <MonthlyTrendChart data={trendData} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-title">Category Spending</div>
          <div className="chart-container">
            <CategoryPieChart data={pieData} />
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Recent Ledger & Insights Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        {/* Recent Ledger */}
        <div className="card">
          <div className="card-title">
            <span>Recent Transactions</span>
            <button
              onClick={() => setActiveTab('transactions')}
              style={{
                background: 'none',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-indigo)',
                cursor: 'pointer'
              }}
            >
              <span>View full ledger</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="recent-transactions-list">
            {summary.recentTransactions.slice(0, 5).map((t, idx) => {
              return (
                <div key={idx} className="recent-transaction-item">
                  <div className="trans-meta">
                    <div style={{
                      backgroundColor: 'var(--color-primary-light)',
                      padding: '8px',
                      borderRadius: '8px',
                      color: 'var(--color-indigo)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CategoryIcon icon={t.category_icon} size={16} color="var(--color-indigo)" />
                    </div>
                    <div>
                      <div className="trans-desc">{t.description || t.category}</div>
                      <div className="trans-date">
                        {t.category} • {t.date}
                      </div>
                    </div>
                  </div>
                  <div className={`trans-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              );
            })}
            
            {summary.recentTransactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                No recent transactions.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Budget Alert Panel */}
        <div className="card">
          <div className="card-title">Budget Health Alerts</div>
          <div style={{ display: 'flex', flexParagraph: 'column', gap: '16px', flexDirection: 'column' }}>
            {summary.budgetAlerts.map((alert, idx) => (
              <div key={idx} className="alert-banner danger" style={{ margin: 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {alert.category} Budget Exceeded!
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                    Spent {formatCurrency(alert.spent_this_month)} of {formatCurrency(alert.limit_amount)} limit.
                  </div>
                </div>
              </div>
            ))}

            {summary.budgetAlerts.length === 0 && (
              <div style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--color-income-light)',
                color: 'var(--color-income)',
                padding: '16px',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                All categories are safely within budget this month!
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '8px' }}>
              💡 budgets are set per category. When you spend more than your allocated limit, SpendSense will flag it immediately.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
