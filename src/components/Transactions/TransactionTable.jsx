// src/components/Transactions/TransactionTable.jsx
import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { deleteTransaction } from '../../db/queries';
import { Edit, Trash2 } from 'lucide-react';

import CategoryIcon from '../Common/CategoryIcon';

export default function TransactionTable({ transactions, onEditClick, onDeleteSuccess }) {
  const { runMutation } = useDatabase();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val || 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction? This action is permanent.")) return;

    try {
      await runMutation((db) => {
        deleteTransaction(db, id);
      });
      if (onDeleteSuccess) {
        onDeleteSuccess("Transaction successfully deleted.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete transaction.");
    }
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Type</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{t.date}</td>
              <td>
                <span 
                  className="category-tag" 
                  style={{ 
                    backgroundColor: `${t.category_color}12`,
                    color: t.category_color,
                    border: `1px solid ${t.category_color}25`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CategoryIcon icon={t.category_icon} size={14} color={t.category_color} />
                  <span>{t.category_name}</span>
                </span>
              </td>
              <td>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.description || '—'}</div>
              </td>
              <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                <span style={{
                  color: t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
                  fontWeight: 600
                }}>
                  {t.type}
                </span>
              </td>
              <td style={{ 
                textAlign: 'right', 
                fontWeight: 700, 
                fontSize: '0.95rem',
                fontVariantNumeric: 'tabular-nums',
                color: t.type === 'income' ? 'var(--color-income)' : 'var(--text-primary)'
              }}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => onEditClick(t)}
                    title="Edit transaction"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn btn-secondary btn-danger"
                    style={{ padding: '6px 10px', border: 'none' }}
                    onClick={() => handleDelete(t.id)}
                    title="Delete transaction"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                No transactions match the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
