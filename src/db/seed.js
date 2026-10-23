// src/db/seed.js

export const seedDatabase = (db) => {
  console.log("Seeding SQLite database with initial mockup data...");

  // Seed Categories
  const categories = [
    { name: 'Food & Dining', icon: 'Utensils', color: '#F59E0B' },
    { name: 'Transportation', icon: 'Car', color: '#3B82F6' },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899' },
    { name: 'Entertainment', icon: 'Film', color: '#8B5CF6' },
    { name: 'Utilities', icon: 'Zap', color: '#10B981' },
    { name: 'Healthcare', icon: 'Activity', color: '#EF4444' },
    { name: 'Education', icon: 'BookOpen', color: '#6366F1' },
    { name: 'Travel', icon: 'Plane', color: '#14B8A6' }
  ];

  const catStmt = db.prepare(`INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)`);
  for (const cat of categories) {
    catStmt.run([cat.name, cat.icon, cat.color]);
  }
  catStmt.free();

  // Retrieve category IDs
  const catRows = [];
  const stmt = db.prepare("SELECT id, name FROM categories");
  while (stmt.step()) {
    catRows.push(stmt.getAsObject());
  }
  stmt.free();

  const getCatId = (name) => catRows.find(c => c.name === name).id;

  // Seed Budgets
  const budgets = [
    { category_id: getCatId('Food & Dining'), amount: 500 },
    { category_id: getCatId('Transportation'), amount: 200 },
    { category_id: getCatId('Shopping'), amount: 350 },
    { category_id: getCatId('Entertainment'), amount: 180 },
    { category_id: getCatId('Utilities'), amount: 400 },
    { category_id: getCatId('Healthcare'), amount: 120 },
    { category_id: getCatId('Education'), amount: 150 },
    { category_id: getCatId('Travel'), amount: 300 }
  ];

  const budgetStmt = db.prepare(`INSERT INTO budgets (category_id, amount) VALUES (?, ?)`);
  for (const b of budgets) {
    budgetStmt.run([b.category_id, b.amount]);
  }
  budgetStmt.free();

  // Seed Transactions strictly within the last 4 days (October 21 - October 24, 2026)
  const transactions = [
    // --- Day 1: October 21, 2026 ---
    { amount: 3200, category: 'Utilities', description: 'Bi-Weekly Paycheck', date: '2026-10-21', type: 'income' },
    { amount: 450, category: 'Education', description: 'Freelance Frontend Consulting', date: '2026-10-21', type: 'income' },
    { amount: 14.50, category: 'Food & Dining', description: 'Artisan Espresso & Croissant', date: '2026-10-21', type: 'expense' },
    { amount: 48.75, category: 'Food & Dining', description: "Trader Joe's Grocery Haul", date: '2026-10-21', type: 'expense' },
    { amount: 32.40, category: 'Food & Dining', description: 'Chipotle Burrito Bowl with Guac', date: '2026-10-21', type: 'expense' },
    { amount: 45.00, category: 'Transportation', description: 'Shell Gas Station Fill-up', date: '2026-10-21', type: 'expense' },
    { amount: 18.20, category: 'Transportation', description: 'Uber Ride to Downtown', date: '2026-10-21', type: 'expense' },
    { amount: 65.00, category: 'Shopping', description: 'Ergonomic Desk Mat & Cable Sleeves', date: '2026-10-21', type: 'expense' },
    { amount: 125.00, category: 'Utilities', description: 'Monthly High-Speed Fiber Internet', date: '2026-10-21', type: 'expense' },
    { amount: 28.50, category: 'Healthcare', description: 'CVS Pharmacy Prescription Refill', date: '2026-10-21', type: 'expense' },

    // --- Day 2: October 22, 2026 ---
    { amount: 9.80, category: 'Food & Dining', description: 'Morning Cold Brew Coffee', date: '2026-10-22', type: 'expense' },
    { amount: 22.50, category: 'Food & Dining', description: 'Sweetgreen Salad Lunch', date: '2026-10-22', type: 'expense' },
    { amount: 76.40, category: 'Food & Dining', description: 'Italian Trattoria Dinner with Colleagues', date: '2026-10-22', type: 'expense' },
    { amount: 35.00, category: 'Transportation', description: 'Metro Transit Card Top-up', date: '2026-10-22', type: 'expense' },
    { amount: 120.00, category: 'Shopping', description: 'Uniqlo Autumn Waterproof Jacket', date: '2026-10-22', type: 'expense' },
    { amount: 34.99, category: 'Shopping', description: 'USB-C Fast Charging Hub', date: '2026-10-22', type: 'expense' },
    { amount: 15.99, category: 'Entertainment', description: 'Netflix Ultra HD Subscription', date: '2026-10-22', type: 'expense' },
    { amount: 38.00, category: 'Entertainment', description: 'IMAX Cinema Movie Tickets', date: '2026-10-22', type: 'expense' },
    { amount: 49.00, category: 'Education', description: 'Fullstack React Performance Workshop', date: '2026-10-22', type: 'expense' },
    { amount: 85.00, category: 'Utilities', description: 'City Water & Sewage Utility', date: '2026-10-22', type: 'expense' },

    // --- Day 3: October 23, 2026 ---
    { amount: 650, category: 'Education', description: 'API Integration Client Milestone', date: '2026-10-23', type: 'income' },
    { amount: 16.20, category: 'Food & Dining', description: 'Bagel & Matcha Latte Breakfast', date: '2026-10-23', type: 'expense' },
    { amount: 62.80, category: 'Food & Dining', description: 'Whole Foods Market Organic Produce', date: '2026-10-23', type: 'expense' },
    { amount: 110.00, category: 'Food & Dining', description: 'Friday Night Japanese Sushi Feast', date: '2026-10-23', type: 'expense' },
    { amount: 24.50, category: 'Transportation', description: 'Lyft Ride Home from Dinner', date: '2026-10-23', type: 'expense' },
    { amount: 89.00, category: 'Shopping', description: 'Wireless Noise-Cancelling Earbuds', date: '2026-10-23', type: 'expense' },
    { amount: 12.99, category: 'Entertainment', description: 'Spotify Premium Family Plan', date: '2026-10-23', type: 'expense' },
    { amount: 65.00, category: 'Entertainment', description: 'Live Acoustic Concert Entry Pass', date: '2026-10-23', type: 'expense' },
    { amount: 180.00, category: 'Travel', description: 'Express Train Weekend Getaway Booking', date: '2026-10-23', type: 'expense' },
    { amount: 145.00, category: 'Utilities', description: 'Electricity & Renewable Power Grid Bill', date: '2026-10-23', type: 'expense' },

    // --- Day 4: October 24, 2026 (Today) ---
    { amount: 11.50, category: 'Food & Dining', description: 'Cold Pressed Green Juice & Muffin', date: '2026-10-24', type: 'expense' },
    { amount: 28.00, category: 'Food & Dining', description: 'Weekend Brunch with Avocado Toast', date: '2026-10-24', type: 'expense' },
    { amount: 42.10, category: 'Food & Dining', description: 'Farmers Market Fresh Bakery & Fruit', date: '2026-10-24', type: 'expense' },
    { amount: 42.00, category: 'Transportation', description: 'Chevron Gas Station Fill-up', date: '2026-10-24', type: 'expense' },
    { amount: 45.00, category: 'Shopping', description: 'Hardcover Design Book', date: '2026-10-24', type: 'expense' },
    { amount: 55.00, category: 'Healthcare', description: 'Annual Dental Checkup & Cleaning Copay', date: '2026-10-24', type: 'expense' },
    { amount: 22.00, category: 'Entertainment', description: 'Board Game Cafe Entry & Snacks', date: '2026-10-24', type: 'expense' },
    { amount: 95.00, category: 'Travel', description: 'Boutique Hotel Weekend Deposit', date: '2026-10-24', type: 'expense' }
  ];

  const transStmt = db.prepare(`
    INSERT INTO transactions (amount, category_id, description, date, type) 
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const t of transactions) {
    const catId = getCatId(t.category);
    transStmt.run([t.amount, catId, t.description, t.date, t.type]);
  }
  transStmt.free();

  console.log(`Seeded ${transactions.length} transactions successfully across last 4 days!`);
};
