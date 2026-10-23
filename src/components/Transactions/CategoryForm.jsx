// src/components/Transactions/CategoryForm.jsx
import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { addCategory, getCategories } from '../../db/queries';

export default function CategoryForm({ onClose, onSaveSuccess, onCategoryCreated }) {
  const { db, runMutation } = useDatabase();
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍔');
  const [color, setColor] = useState('#4F46E5');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Emojis list preset
  const emojiPresets = ['🍔', '🚗', '🛍️', '🎬', '💡', '🏥', '📚', '✈️', '📱', '🎁', '🏠', '👔', '🔧', '🍿', '🎨', '🐶', '💪', '☕'];

  // Color values preset
  const colorPresets = [
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Rose', value: '#E11D48' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Amber', value: '#D97706' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Gray', value: '#78716C' },
    { name: 'Pink', value: '#EC4899' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!name || name.trim() === '') {
      newErrors.name = 'Category name is required';
    } else {
      // Check for duplicate category name in DB
      try {
        const existingCats = getCategories(db);
        const isDuplicate = existingCats.some(
          c => c.name.toLowerCase() === name.trim().toLowerCase()
        );
        if (isDuplicate) {
          newErrors.name = 'Category name already exists';
        }
      } catch (e) {
        console.error(e);
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
        name: name.trim(),
        icon,
        color
      };

      await runMutation((database) => {
        addCategory(database, payload);
      });

      const cats = getCategories(db);
      const newCat = cats.find(c => c.name.toLowerCase() === payload.name.toLowerCase());

      if (onSaveSuccess) {
        onSaveSuccess(`Category "${payload.name}" created successfully.`);
      }
      if (onCategoryCreated && newCat) {
        onCategoryCreated(newCat);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to create category.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.submit && (
        <div className="alert-banner danger" style={{ padding: '8px 12px', fontSize: '0.8rem', marginBottom: '16px' }}>
          {errors.submit}
        </div>
      )}

      {/* Category Name */}
      <div className="form-group">
        <label htmlFor="catName">Category Name</label>
        <input
          id="catName"
          type="text"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Subscriptions"
          maxLength={30}
          autoFocus
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      {/* Icon Picker Grid */}
      <div className="form-group">
        <label>Select Icon</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px',
          maxHeight: '120px',
          overflowY: 'auto',
          padding: '8px',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          backgroundColor: '#FFFFFF'
        }}>
          {emojiPresets.map((emoji) => (
            <button
              key={emoji}
              type="button"
              style={{
                fontSize: '1.25rem',
                padding: '8px',
                border: '1px solid transparent',
                borderRadius: '6px',
                backgroundColor: icon === emoji ? 'var(--color-indigo-light)' : 'transparent',
                borderColor: icon === emoji ? 'var(--color-indigo)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center'
              }}
              onClick={() => setIcon(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div className="form-group">
        <label>Select Accent Color</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          padding: '4px'
        }}>
          {colorPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              style={{
                padding: '8px',
                border: '1px solid',
                borderRadius: '6px',
                backgroundColor: preset.value,
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                borderColor: color === preset.value ? '#1C1917' : 'transparent',
                boxShadow: color === preset.value ? '0 0 0 2px #FFFFFF' : 'none'
              }}
              onClick={() => setColor(preset.value)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions" style={{ marginTop: '24px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
