// src/components/Transactions/TransactionForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { getCategories, addTransaction, updateTransaction } from '../../db/queries';
import { autoCategorizeDescription } from '../../ai/groq';
import { getCategoryEmoji } from '../Common/categoryUtils';
import CategoryForm from './CategoryForm';
import { X } from 'lucide-react';

export default function TransactionForm({ transaction, onClose, onSaveSuccess }) {
  const { db, runMutation } = useDatabase();
  const [categoriesList, setCategoriesList] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [type, setType] = useState('expense');

  // Errors state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshCategories = useCallback((autoSelectId = null) => {
    if (!db) return;
    try {
      const cats = getCategories(db);
      setCategoriesList(cats);
      if (autoSelectId) {
        setCategoryId(autoSelectId.toString());
      } else if (cats.length > 0 && !transaction && !categoryId) {
        setCategoryId(cats[0].id.toString());
      }
    } catch (e) {
      console.error("Failed to load categories for form:", e);
    }
  }, [db, transaction, categoryId]);

  // Load categories from database
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  // Pre-fill fields if in edit mode
  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.category_id.toString());
      setDescription(transaction.description || '');
      setDate(transaction.date);
      setType(transaction.type);
    }
  }, [transaction]);

  const handleDescriptionBlur = async () => {
    if (!description.trim() || transaction) return; // Skip if empty or editing
    try {
      const predictedId = await autoCategorizeDescription(description, categoriesList);
      if (predictedId) {
        setCategoryId(predictedId.toString());
      }
    } catch (e) {
      console.warn("Failed to auto-categorize:", e);
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Amount validations
    if (!amount || amount.trim() === '') {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        newErrors.amount = 'Amount must be a number';
      } else if (numAmount <= 0) {
        newErrors.amount = 'Amount must be greater than zero';
      }
    }

    // 2. Category validations
    if (!categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    // 3. Date validations
    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const parsedDate = Date.parse(date);
      if (isNaN(parsedDate)) {
        newErrors.date = 'Please enter a valid date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        categoryId: parseInt(categoryId, 10),
        description: description.trim(),
        date,
        type
      };

      await runMutation((database) => {
        if (transaction) {
          // Edit Mode
          updateTransaction(database, transaction.id, payload);
        } else {
          // Add Mode
          addTransaction(database, payload);
        }
      });

      if (onSaveSuccess) {
        onSaveSuccess(transaction ? 'Transaction updated successfully.' : 'Transaction added successfully.');
      }
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Database operation failed. Check logs.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit}>
      {errors.submit && (
        <div className="alert-banner danger" style={{ padding: '8px 12px', fontSize: '0.8rem', marginBottom: '16px' }}>
          {errors.submit}
        </div>
      )}

      {/* Transaction Type */}
      <div className="form-group">
        <label>Transaction Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            className={`btn ${type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setType('expense')}
            style={{ width: '100%' }}
          >
            Expense
          </button>
          <button
            type="button"
            className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setType('income')}
            style={{ width: '100%' }}
          >
            Income
          </button>
        </div>
      </div>

      {/* Amount & Date */}
      <div className="form-row-2">
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="input-field"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          {errors.amount && <span className="error-message">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>
      </div>

      {/* Category Dropdown (dynamically sourced from SQLite DB) */}
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          className="input-field"
          value={categoryId}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'ADD_NEW') {
              setIsCategoryModalOpen(true);
            } else {
              setCategoryId(val);
            }
          }}
        >
          <option value="" disabled>Select category...</option>
          {categoriesList.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {getCategoryEmoji(cat.icon)} {cat.name}
            </option>
          ))}
          <option value="ADD_NEW">+ Add New Category...</option>
        </select>
        {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <input
          id="description"
          type="text"
          className="input-field"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          placeholder="e.g. Weekly grocery shopping"
          maxLength={80}
        />
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : transaction ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
    </form>

    {isCategoryModalOpen && (
      <div className="modal-overlay" style={{ zIndex: 200 }}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Create New Category</h3>
            <button type="button" className="modal-close-btn" onClick={() => setIsCategoryModalOpen(false)}>
              <X size={18} />
            </button>
          </div>
          
          <CategoryForm 
            onClose={() => setIsCategoryModalOpen(false)}
            onCategoryCreated={(newCat) => {
              refreshCategories(newCat.id);
              if (onSaveSuccess) {
                onSaveSuccess(`Category "${newCat.name}" created and selected.`);
              }
            }}
          />
        </div>
      </div>
    )}
    </>
  );
}
