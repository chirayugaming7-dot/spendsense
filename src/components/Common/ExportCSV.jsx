// src/components/Common/ExportCSV.jsx
import React from 'react';
import { Download } from 'lucide-react';

export default function ExportCSV({ transactions, filename = 'spendsense_export.csv' }) {
  const convertToCSV = (data) => {
    const headers = ['Date', 'Category', 'Description', 'Type', 'Amount'];
    const rows = data.map(t => [
      t.date,
      t.category_name,
      t.description || '',
      t.type,
      t.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        // Escape quotes and commas in strings
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(','))
    ].join('\n');

    return csvContent;
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert("No data available to export.");
      return;
    }

    const csvData = convertToCSV(transactions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleExport} className="btn btn-secondary">
      <Download size={16} />
      <span>Export to CSV</span>
    </button>
  );
}
