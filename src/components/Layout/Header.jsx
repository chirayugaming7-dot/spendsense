// src/components/Layout/Header.jsx
import React from 'react';
import { Calendar, Database } from 'lucide-react';

export default function Header({ activeTab }) {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Financial Dashboard';
      case 'transactions':
        return 'Transactions Ledger';
      case 'budgets':
        return 'Category Budgets';
      case 'ai-insights':
        return 'AI Analyst & Insights';
      default:
        return 'SpendSense';
    }
  };

  const getTodayDate = () => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="top-header">
      <div className="page-title-section">
        <h1>{getPageTitle()}</h1>
      </div>
      
      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Calendar size={15} />
          <span>{getTodayDate()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-income)', backgroundColor: 'var(--color-income-light)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
          <Database size={12} />
          <span>SQLite WASM Loaded</span>
        </div>
      </div>
    </header>
  );
}
