// src/components/Transactions/TransactionFilters.jsx
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { getCategories } from '../../db/queries';
import { getCategoryEmoji } from '../Common/categoryUtils';
import { FilterX } from 'lucide-react';

export default function TransactionFilters({ filters, setFilters }) {
  const { db } = useDatabase();
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    if (!db) return;
    try {
      const cats = getCategories(db);
      setCategoriesList(cats);
    } catch (e) {
      console.error("Failed to load categories for filters:", e);
    }
  }, [db]);

  const handleFieldChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      type: 'all',
      sortBy: 'none'
    });
  };

  return (
    <div className="filters-bar">
      {/* Date Range Start */}
      <div className="filter-group">
        <label htmlFor="startDate">From Date</label>
        <input
          id="startDate"
          type="date"
          className="input-field"
          value={filters.startDate}
          onChange={(e) => handleFieldChange('startDate', e.target.value)}
        />
      </div>

      {/* Date Range End */}
      <div className="filter-group">
        <label htmlFor="endDate">To Date</label>
        <input
          id="endDate"
          type="date"
          className="input-field"
          value={filters.endDate}
          onChange={(e) => handleFieldChange('endDate', e.target.value)}
        />
      </div>

      {/* Categories Dropdown */}
      <div className="filter-group">
        <label htmlFor="filterCategory">Category</label>
        <select
          id="filterCategory"
          className="input-field"
          value={filters.categoryId}
          onChange={(e) => handleFieldChange('categoryId', e.target.value)}
        >
          <option value="">All Categories</option>
          {categoriesList.map(cat => (
            <option key={cat.id} value={cat.id}>
              {getCategoryEmoji(cat.icon)} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Type Dropdown */}
      <div className="filter-group">
        <label htmlFor="filterType">Type</label>
        <select
          id="filterType"
          className="input-field"
          value={filters.type}
          onChange={(e) => handleFieldChange('type', e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      {/* Sort By Dropdown */}
      <div className="filter-group">
        <label htmlFor="sortBy">Sort By</label>
        <select
          id="sortBy"
          className="input-field"
          value={filters.sortBy || 'none'}
          onChange={(e) => handleFieldChange('sortBy', e.target.value)}
        >
          <option value="none">Default (Newest)</option>
          <option value="amount-asc">Amount: Lowest First</option>
          <option value="amount-desc">Amount: Highest First</option>
          <option value="date-asc">Date: Oldest First</option>
        </select>
      </div>

      {/* Reset Action */}
      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={handleResetFilters}
        title="Clear all filters"
      >
        <FilterX size={16} />
        <span>Clear</span>
      </button>
    </div>
  );
}
