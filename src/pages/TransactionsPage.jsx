// src/pages/TransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { getTransactions } from '../db/queries';
import TransactionFilters from '../components/Transactions/TransactionFilters';
import TransactionTable from '../components/Transactions/TransactionTable';
import TransactionForm from '../components/Transactions/TransactionForm';
import CategoryForm from '../components/Transactions/CategoryForm';
import ExportCSV from '../components/Common/ExportCSV';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Toast from '../components/Common/Toast';
import { Plus, X, FolderPlus } from 'lucide-react';

export default function TransactionsPage() {
  const { db, mutateCount } = useDatabase();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    type: 'all',
    sortBy: 'none'
  });

  // Modal & Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  // Query transactions based on filters via SQL
  useEffect(() => {
    if (!db) return;

    const loadTransactions = () => {
      try {
        const rows = getTransactions(db, filters);
        setTransactions(rows);
      } catch (e) {
        console.error("Failed to query transactions:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [db, filters, mutateCount]);

  const handleEditClick = (t) => {
    setSelectedTransaction(t);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const handleToast = (message) => {
    setToastMessage(message);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{transactions.length}</strong> transactions
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ExportCSV transactions={transactions} />
          <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>
            <FolderPlus size={16} />
            <span>Create Category</span>
          </button>
          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* SQL Filters */}
      <TransactionFilters filters={filters} setFilters={setFilters} />

      {/* Transactions Table */}
      {isLoading ? (
        <LoadingSpinner text="Executing database query..." />
      ) : (
        <TransactionTable 
          transactions={transactions} 
          onEditClick={handleEditClick}
          onDeleteSuccess={handleToast}
        />
      )}

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedTransaction ? 'Edit Transaction' : 'New Transaction'}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <TransactionForm 
              transaction={selectedTransaction} 
              onClose={() => setIsModalOpen(false)}
              onSaveSuccess={handleToast}
            />
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Category</h3>
              <button className="modal-close-btn" onClick={() => setIsCategoryModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <CategoryForm 
              onClose={() => setIsCategoryModalOpen(false)}
              onSaveSuccess={handleToast}
            />
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
