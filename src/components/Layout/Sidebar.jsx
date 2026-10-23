// src/components/Layout/Sidebar.jsx
import React from 'react';
import { LayoutDashboard, ReceiptText, Sparkles, Wallet, Coins } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets & Limits', icon: Wallet },
    { id: 'ai-insights', label: 'AI Analyst Insights', icon: Sparkles },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-section">
        <div className="brand-logo">
          <Coins size={20} />
        </div>
        <span className="brand-name">SpendSense</span>
      </div>

      <nav style={{ flexGrow: 1 }}>
        <ul className="nav-links">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>SpendSense AI v1.0</p>
        <p style={{ fontSize: '0.7rem', marginTop: '4px' }}>Local SQL Engine Active</p>
      </div>
    </aside>
  );
}
