// src/pages/BudgetsPage.jsx
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { getBudgets, updateBudget, getAvailableMonths } from '../db/queries';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Toast from '../components/Common/Toast';
import { Edit2, Save, X, AlertTriangle } from 'lucide-react';

import CategoryIcon from '../components/Common/CategoryIcon';

export default function BudgetsPage() {
  const { db, mutateCount, runMutation } = useDatabase();
  const [budgets, setBudgets] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit mode tracking
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  
  const [toastMessage, setToastMessage] = useState(null);

  // Load budgets from database
  useEffect(() => {
    if (!db) return;
    try {
      const months = getAvailableMonths(db);
      setAvailableMonths(months);
      const activeMonth = selectedMonth || (months.length > 0 ? months[0] : new Date().toISOString().slice(0, 7));
      if (!selectedMonth && activeMonth) {
        setSelectedMonth(activeMonth);
      }
      const rows = getBudgets(db, activeMonth);
      setBudgets(rows);
    } catch (e) {
      console.error("Failed to load budgets:", e);
    } finally {
      setIsLoading(false);
    }
  }, [db, mutateCount, selectedMonth]);

  const handleEditClick = (b) => {
    setEditingId(b.category_id);
    setEditAmount(b.limit_amount.toString());
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const handleSaveClick = async (categoryId) => {
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount < 0) {
      alert("Please enter a valid positive budget amount.");
      return;
    }

    try {
      await runMutation((database) => {
        updateBudget(database, categoryId, numAmount);
      });
      setEditingId(null);
      setToastMessage("Budget updated successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to update budget limit.");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val || 0);
  };

  if (isLoading) {
    return <LoadingSpinner text="Querying budget thresholds..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Overview Card */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="card-title" style={{ margin: 0 }}>Monthly Limits & Budgets</div>
          {availableMonths.length > 0 && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {availableMonths.map((m) => {
                const [year, month] = m.split('-');
                const label = new Date(year, parseInt(month, 10) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                return <option key={m} value={m}>{label}</option>;
              })}
            </select>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
          Compare month spending against your targets. Update budget limits to optimize your financial habits.
        </p>

        <div className="recent-transactions-list" style={{ gap: '20px' }}>
          {budgets.map((b) => {
            const isEditing = editingId === b.category_id;
            const percentage = b.limit_amount > 0 ? (b.actual_amount / b.limit_amount) * 100 : 0;
            const isOverspent = b.actual_amount > b.limit_amount;
            
            // Progress Bar Color
            let barColor = 'var(--color-indigo)';
            if (percentage >= 100) {
              barColor = 'var(--color-expense)';
            } else if (percentage >= 80) {
              barColor = 'var(--color-warning)';
            } else {
              barColor = 'var(--color-income)';
            }

            return (
              <div 
                key={b.id} 
                style={{ 
                  border: '1px solid var(--border-color)', 
                  padding: '20px', 
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  
                  {/* Left Column: Category Badge & Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '10px', 
                        backgroundColor: `${b.category_color || '#4F46E5'}15`,
                        color: b.category_color || 'var(--color-indigo)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CategoryIcon icon={b.category_icon} size={22} color={b.category_color || 'var(--color-indigo)'} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{b.category_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Actual Spend: {formatCurrency(b.actual_amount)}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Limits & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>$</span>
                        <input
                          type="number"
                          className="input-field"
                          style={{ width: '100px', padding: '6px 10px' }}
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="Limit"
                        />
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleSaveClick(b.category_id)}
                        >
                          <Save size={14} />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px' }}
                          onClick={handleCancelClick}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          Budget: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(b.limit_amount)}</strong>
                        </span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px' }}
                          onClick={() => handleEditClick(b)}
                          title="Edit Limit"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar Row */}
                <div className="budget-progress-container">
                  <div className="budget-progress-bar-bg">
                    <div 
                      className="budget-progress-bar-fill"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: barColor
                      }}
                    />
                  </div>
                  <div className="budget-progress-header" style={{ marginTop: '2px' }}>
                    <span>{percentage.toFixed(0)}% used</span>
                    {isOverspent && (
                      <span style={{ color: 'var(--color-expense)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <AlertTriangle size={12} />
                        Overspent by {formatCurrency(b.actual_amount - b.limit_amount)}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
