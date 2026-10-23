// src/db/queries.js

// Helper to convert db.exec results to array of objects
export function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Get all categories from DB
export function getCategories(db) {
  return queryAll(db, `
    SELECT id, name, icon, color 
    FROM categories 
    ORDER BY name ASC
  `);
}

// Add a new category and create a default budget entry of $0
export function addCategory(db, { name, icon, color }) {
  db.run(`INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)`, [name, icon, color]);
  const rows = queryAll(db, `SELECT id FROM categories WHERE name = ?`, [name]);
  if (rows.length > 0) {
    db.run(`INSERT INTO budgets (category_id, amount) VALUES (?, 0.0)`, [rows[0].id]);
  }
}

// Get transactions based on date range, category, type, and sorting via actual SQL queries
export function getTransactions(db, { startDate, endDate, categoryId, type, sortBy } = {}) {
  let sql = `
    SELECT t.id, t.amount, t.description, t.date, t.type, t.created_at,
           c.id as category_id, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    sql += ` AND t.date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    sql += ` AND t.date <= ?`;
    params.push(endDate);
  }
  if (categoryId) {
    sql += ` AND t.category_id = ?`;
    params.push(parseInt(categoryId, 10));
  }
  if (type && type !== 'all') {
    sql += ` AND t.type = ?`;
    params.push(type);
  }

  // Sort Filter using actual SQL
  if (sortBy === 'amount-asc') {
    sql += ` ORDER BY t.amount ASC, t.date DESC`;
  } else if (sortBy === 'amount-desc') {
    sql += ` ORDER BY t.amount DESC, t.date DESC`;
  } else if (sortBy === 'date-asc') {
    sql += ` ORDER BY t.date ASC, t.id ASC`;
  } else {
    sql += ` ORDER BY t.date DESC, t.id DESC`;
  }
  
  return queryAll(db, sql, params);
}

// Add a transaction
export function addTransaction(db, { amount, categoryId, description, date, type }) {
  const sql = `
    INSERT INTO transactions (amount, category_id, description, date, type)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [amount, categoryId, description, date, type]);
}

// Update a transaction
export function updateTransaction(db, id, { amount, categoryId, description, date, type }) {
  const sql = `
    UPDATE transactions 
    SET amount = ?, category_id = ?, description = ?, date = ?, type = ?
    WHERE id = ?
  `;
  db.run(sql, [amount, categoryId, description, date, type, id]);
}

// Delete a transaction
export function deleteTransaction(db, id) {
  const sql = `DELETE FROM transactions WHERE id = ?`;
  db.run(sql, [id]);
}

// Get all distinct transaction months (YYYY-MM)
export function getAvailableMonths(db) {
  return queryAll(db, `
    SELECT DISTINCT strftime('%Y-%m', date) as month
    FROM transactions
    ORDER BY month DESC
  `).map(r => r.month).filter(Boolean);
}

// Get budgets with actual expenses aggregated per category for a specific month (defaults to latest active month)
export function getBudgets(db, month = null) {
  let targetMonth = month;
  if (!targetMonth) {
    const latest = queryAll(db, `SELECT strftime('%Y-%m', MAX(date)) as m FROM transactions WHERE type = 'expense'`);
    targetMonth = (latest.length > 0 && latest[0].m) ? latest[0].m : new Date().toISOString().slice(0, 7);
  }

  return queryAll(db, `
    SELECT b.id, b.amount as limit_amount, b.period,
           c.id as category_id, c.name as category_name, c.icon as category_icon, c.color as category_color,
           COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as actual_amount
    FROM categories c
    JOIN budgets b ON b.category_id = c.id
    LEFT JOIN transactions t ON t.category_id = c.id AND strftime('%Y-%m', t.date) = ?
    GROUP BY c.id
    ORDER BY c.name ASC
  `, [targetMonth]);
}

// Update budget limit
export function updateBudget(db, categoryId, amount) {
  const sql = `
    UPDATE budgets 
    SET amount = ? 
    WHERE category_id = ?
  `;
  db.run(sql, [amount, categoryId]);
}

// Category breakdown data (Pie Chart) with actual SQL aggregates
export function getCategoryBreakdown(db, { startDate, endDate, type = 'expense' } = {}) {
  let sql = `
    SELECT c.name, c.color, c.icon, SUM(t.amount) as value
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = ?
  `;
  const params = [type];

  if (startDate) {
    sql += ` AND t.date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    sql += ` AND t.date <= ?`;
    params.push(endDate);
  }

  sql += ` GROUP BY c.id ORDER BY value DESC`;
  
  return queryAll(db, sql, params);
}

// Monthly spending trend (Line/Bar Chart) with actual SQL aggregates
export function getMonthlyTrend(db, { startDate, endDate } = {}) {
  let sql = `
    SELECT strftime('%Y-%m', t.date) as month,
           SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as expense,
           SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as income
    FROM transactions t
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    sql += ` AND t.date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    sql += ` AND t.date <= ?`;
    params.push(endDate);
  }

  sql += ` GROUP BY month ORDER BY month ASC`;
  
  return queryAll(db, sql, params);
}

// Aggregated Summary metrics (Stats Card + AI prompt context)
export function getAggregatedSummary(db) {
  // 1. Total summary stats
  const totals = queryAll(db, `
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income
    FROM transactions
  `)[0];

  // 2. Category spending totals
  const categorySpending = queryAll(db, `
    SELECT c.name as category, SUM(t.amount) as spent
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense'
    GROUP BY c.id
    ORDER BY spent DESC
  `);

  // 3. Monthly trends
  const monthlyTrends = queryAll(db, `
    SELECT strftime('%Y-%m', date) as month,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as spent,
           SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as earned
    FROM transactions
    GROUP BY month
    ORDER BY month ASC
  `);

  // 4. Overspent categories compared to budgets (evaluated against latest active month)
  const latestMonthRow = queryAll(db, `SELECT strftime('%Y-%m', MAX(date)) as m FROM transactions WHERE type = 'expense'`)[0];
  const targetAlertMonth = latestMonthRow?.m || new Date().toISOString().slice(0, 7);

  const budgetAlerts = queryAll(db, `
    SELECT c.name as category, b.amount as limit_amount, 
           SUM(t.amount) as spent_this_month
    FROM categories c
    JOIN budgets b ON b.category_id = c.id
    JOIN transactions t ON t.category_id = c.id
    WHERE t.type = 'expense' 
      AND strftime('%Y-%m', t.date) = ?
    GROUP BY c.id
    HAVING spent_this_month > limit_amount
  `, [targetAlertMonth]);

  // 5. Recent transactions
  const recentTransactions = queryAll(db, `
    SELECT t.amount, t.description, t.date, t.type, c.name as category,
           c.icon as category_icon, c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    ORDER BY t.date DESC, t.id DESC
    LIMIT 10
  `);

  return {
    totalExpenses: totals ? totals.total_expenses : 0,
    totalIncome: totals ? totals.total_income : 0,
    netBalance: totals ? (totals.total_income - totals.total_expenses) : 0,
    categorySpending,
    monthlyTrends,
    budgetAlerts,
    recentTransactions
  };
}
