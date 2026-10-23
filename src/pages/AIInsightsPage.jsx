// src/pages/AIInsightsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { getAggregatedSummary, getCategories, getTransactions } from '../db/queries';
import { getSpendingSummaryAndSuggestions, askYourData, parseBulkText, isGroqConfigured, getApiKey, setApiKey } from '../ai/groq';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Toast from '../components/Common/Toast';
import { Sparkles, Send, Brain, AlertTriangle, Key, ClipboardList, Database, X } from 'lucide-react';

export default function AIInsightsPage() {
  const { db, mutateCount, runMutation } = useDatabase();
  
  // Page state
  const [aiReport, setAiReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');

  const handleOpenKeyModal = () => {
    setCustomKeyInput(getApiKey());
    setIsKeyModalOpen(true);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    setApiKey(customKeyInput);
    setIsAiConfigured(isGroqConfigured());
    setIsKeyModalOpen(false);
    setToastMessage("Groq API key updated successfully.");
  };

  // Chat chatbot state
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I am your SpendSense AI Analyst. Ask me anything about your transaction records, such as: 'How much did I spend over the last 4 days?' or 'What is my highest category?'" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Bulk input state
  const [bulkText, setBulkText] = useState('');
  const [isBulkParsing, setIsBulkParsing] = useState(false);

  // Auto scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading]);

  // Load report and suggestions
  useEffect(() => {
    if (!db) return;
    
    const loadAiReport = async () => {
      setIsLoading(true);
      try {
        const configured = isGroqConfigured();
        setIsAiConfigured(configured);

        const summaryData = getAggregatedSummary(db);
        const report = await getSpendingSummaryAndSuggestions(summaryData);
        setAiReport(report);
      } catch (e) {
        console.error("AI Insight retrieval failed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAiReport();
  }, [db, mutateCount]);

  // Ask Your Data Submit
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const question = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsChatLoading(true);

    try {
      // Pull full transactions snapshot as context
      const transactions = getTransactions(db);
      const answer = await askYourData(question, transactions);
      setMessages(prev => [...prev, { role: 'model', content: answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'system-error', content: "Failed to fetch response. Try adjusting the query." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Bulk Input Submit
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkText.trim() || isBulkParsing) return;

    setIsBulkParsing(true);
    try {
      const categories = getCategories(db);
      const parsedRows = await parseBulkText(bulkText, categories);

      // Save to SQLite within a single database transaction for safety
      await runMutation((database) => {
        database.run("BEGIN TRANSACTION;");
        try {
          const stmt = database.prepare(`
            INSERT INTO transactions (amount, category_id, description, date, type)
            VALUES (?, ?, ?, ?, ?)
          `);
          
          for (const row of parsedRows) {
            stmt.run([row.amount, row.categoryId, row.description, row.date, row.type]);
          }
          
          stmt.free();
          database.run("COMMIT;");
        } catch (dbErr) {
          database.run("ROLLBACK;");
          throw dbErr;
        }
      });

      setBulkText('');
      setToastMessage(`Success! Successfully parsed and inserted ${parsedRows.length} transactions into SQLite.`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to parse text. Please double check format or provide a valid API key.");
    } finally {
      setIsBulkParsing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Consulting SpendSense AI Analyst..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* AI Engine Status Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        padding: '12px 18px',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: isAiConfigured ? 'var(--color-income-light)' : 'var(--color-warning-light)',
            color: isAiConfigured ? 'var(--color-income)' : 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isAiConfigured ? 'Groq AI Analyst Active' : 'Local Calculations Mode'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isAiConfigured 
                ? 'High-speed cloud inference with multi-model auto-failover'
                : 'Using in-browser financial rules. Configure an API key for live Llama/GPT analytics.'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenKeyModal}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Key size={14} />
          <span>API Key Settings</span>
        </button>
      </div>

      {/* Main Grid: Insights Report & Ask Your Data chatbot */}
      <div className="ai-insights-layout">
        
        {/* Column 1: Analyst report & recommendations */}
        <div className="ai-column">
          
          {/* Spending Summary Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title" style={{ gap: '8px' }}>
              <Brain size={18} style={{ color: 'var(--color-indigo)' }} />
              <span>AI Spending Summary</span>
            </div>
            <div className="summary-text-box">
              <p dangerouslySetInnerHTML={{ __html: (aiReport?.periodSummary || 'Financial ledger loaded. Analysis in progress...').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          </div>

          {/* Actionable recommendations */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title">Action Plan: 2-3 Savings Opportunities</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(aiReport?.savingSuggestions || []).map((sug, idx) => (
                <div key={idx} className="suggestion-card">
                  <div className="suggestion-icon">
                    <Sparkles size={16} />
                  </div>
                  <div className="suggestion-content">
                    <span className="suggestion-title">{sug.title}</span>
                    <span className="suggestion-description">{sug.description}</span>
                    <div className="suggestion-footer">
                      <span className={`priority-badge ${sug.priority}`}>{sug.priority} PRIORITY</span>
                      {sug.potentialSavings > 0 && (
                        <span style={{ color: 'var(--color-income)' }}>
                          Est. Savings: <strong>+${sug.potentialSavings}/mo</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies alert window */}
          {aiReport?.anomalies && aiReport.anomalies.length > 0 && (
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-title" style={{ color: 'var(--color-expense)' }}>
                <AlertTriangle size={18} />
                <span>Detected Spending Anomalies</span>
              </div>
              <div style={{ display: 'flex', flexParagraph: 'column', gap: '12px', flexDirection: 'column' }}>
                {aiReport.anomalies.map((anom, idx) => (
                  <div key={idx} className="alert-banner danger" style={{ margin: 0, padding: '12px' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>{anom.category}</strong>: {anom.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Column 2: Ask Your Data chatbot & Bulk Paste */}
        <div className="ai-column">
          
          {/* Ask Your Data Chatbot */}
          <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '430px' }}>
            <div className="card-title" style={{ gap: '8px' }}>
              <Database size={18} style={{ color: 'var(--color-indigo)' }} />
              <span>Ask Your SQLite Ledger</span>
            </div>
            
            <div className="chat-window" style={{ flexGrow: 1, marginBottom: 0 }}>
              <div className="chat-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`}
                    dangerouslySetInnerHTML={{ __html: msg.content
                      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                    }}
                  />
                ))}
                {isChatLoading && (
                  <div className="chat-loading">
                    Analyzing ledger records...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="chat-input-bar">
                <input
                  type="text"
                  placeholder="e.g. How much did I spend on Food over the last 4 days?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading}
                  maxLength={150}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px' }} disabled={isChatLoading}>
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* Bulk Paste Input window */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title" style={{ gap: '8px' }}>
              <ClipboardList size={18} style={{ color: 'var(--color-indigo)' }} />
              <span>Bulk Transaction AI Parser</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '12px', lineHeight: 1.4 }}>
              Paste multiple transactions (descriptions, amounts, dates) as raw unformatted text. AI will parse them directly into SQLite rows.
            </p>
            
            <form onSubmit={handleBulkSubmit}>
              <textarea
                className="bulk-paste-area"
                placeholder={`e.g.\nSpent $14 on lunch yesterday\nBought shirts at target for $45.99 on October 22\nFreelance design payment of $350 on October 21`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                disabled={isBulkParsing || !isAiConfigured}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isBulkParsing || !isAiConfigured || !bulkText.trim()}
              >
                {isBulkParsing ? 'AI parsing & seeding SQLite...' : 'Parse & Insert Transactions'}
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Groq Cloud API Key</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsKeyModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveKey}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                Enter your Groq Cloud API key (<code>gsk_...</code>). It is securely stored in your browser's local storage and used for live AI financial analysis.
              </p>
              <div className="form-group">
                <label htmlFor="groqKeyInput">API Key</label>
                <input
                  id="groqKeyInput"
                  type="password"
                  className="input-field"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="gsk_..."
                  autoFocus
                />
              </div>
              <div className="form-actions" style={{ marginTop: '18px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsKeyModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
