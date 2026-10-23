// src/App.jsx
import React, { useState } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { Coins, AlertOctagon } from 'lucide-react';
import './App.css';

function MainAppContent() {
  const { isLoading, error } = useDatabase();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-canvas)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div className="brand-logo" style={{ animation: 'bounce 2s infinite' }}>
            <Coins size={22} />
          </div>
          <span className="brand-name" style={{ fontSize: '1.4rem' }}>SpendSense</span>
        </div>
        <LoadingSpinner text="Bootstrapping in-browser SQLite database..." />
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-canvas)',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ color: 'var(--color-expense)', marginBottom: '16px' }}>
          <AlertOctagon size={48} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Database Engine Error</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Could not load the sql.js WebAssembly engine. Make sure <code>/sql-wasm.wasm</code> is placed in your public directory.
        </p>
        <pre style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'var(--color-primary-light)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          textAlign: 'left',
          overflowX: 'auto',
          maxWidth: '90%'
        }}>
          {error.message}
        </pre>
      </div>
    );
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'transactions':
        return <TransactionsPage />;
      case 'budgets':
        return <BudgetsPage />;
      case 'ai-insights':
        return <AIInsightsPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Workspace Wrapper */}
      <div className="main-wrapper">
        {/* Dynamic header */}
        <Header activeTab={activeTab} />

        {/* Dynamic content page */}
        <main className="main-content">
          {renderActiveTabContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <MainAppContent />
    </DatabaseProvider>
  );
}
