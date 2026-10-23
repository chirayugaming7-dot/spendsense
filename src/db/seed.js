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
    { category_id: getCatId('Food & Dining'), amount: 600 },
    { category_id: getCatId('Transportation'), amount: 250 },
    { category_id: getCatId('Shopping'), amount: 400 },
    { category_id: getCatId('Entertainment'), amount: 200 },
    { category_id: getCatId('Utilities'), amount: 300 },
    { category_id: getCatId('Healthcare'), amount: 150 },
    { category_id: getCatId('Education'), amount: 100 },
    { category_id: getCatId('Travel'), amount: 500 }
  ];

  const budgetStmt = db.prepare(`INSERT INTO budgets (category_id, amount) VALUES (?, ?)`);
  for (const b of budgets) {
    budgetStmt.run([b.category_id, b.amount]);
  }
  budgetStmt.free();

  // Seed Transactions (August, September, October 2026)
  // ~80 realistic transactions: expenses & income
  const transactions = [
    // --- AUGUST 2026 ---
    // Income
    { amount: 4500, category: 'Utilities', description: 'Monthly Salary', date: '2026-08-01', type: 'income' },
    { amount: 350, category: 'Education', description: 'Freelance Design Project', date: '2026-08-15', type: 'income' },

    // Food & Dining
    { amount: 12.50, category: 'Food & Dining', description: 'Morning Coffee & Pastry', date: '2026-08-02', type: 'expense' },
    { amount: 45.20, category: 'Food & Dining', description: 'Weekly Grocery Run', date: '2026-08-04', type: 'expense' },
    { amount: 88.00, category: 'Food & Dining', description: 'Dinner with friends', date: '2026-08-06', type: 'expense' },
    { amount: 15.40, category: 'Food & Dining', description: 'Lunch takeout', date: '2026-08-10', type: 'expense' },
    { amount: 52.80, category: 'Food & Dining', description: 'Supermarket shopping', date: '2026-08-14', type: 'expense' },
    { amount: 120.00, category: 'Food & Dining', description: 'Fine Dining Anniversary', date: '2026-08-19', type: 'expense' },
    { amount: 38.60, category: 'Food & Dining', description: 'Groceries store', date: '2026-08-22', type: 'expense' },
    { amount: 18.90, category: 'Food & Dining', description: 'Sushi lunch', date: '2026-08-25', type: 'expense' },
    { amount: 62.10, category: 'Food & Dining', description: 'Weekend groceries', date: '2026-08-28', type: 'expense' },

    // Transportation
    { amount: 45.00, category: 'Transportation', description: 'Gas station', date: '2026-08-03', type: 'expense' },
    { amount: 18.50, category: 'Transportation', description: 'Uber ride', date: '2026-08-08', type: 'expense' },
    { amount: 48.00, category: 'Transportation', description: 'Gas fill-up', date: '2026-08-16', type: 'expense' },
    { amount: 32.00, category: 'Transportation', description: 'Monthly Train Pass', date: '2026-08-20', type: 'expense' },
    { amount: 22.40, category: 'Transportation', description: 'Uber to office', date: '2026-08-27', type: 'expense' },

    // Shopping
    { amount: 110.00, category: 'Shopping', description: 'Summer Jacket', date: '2026-08-05', type: 'expense' },
    { amount: 24.99, category: 'Shopping', description: 'Phone Case', date: '2026-08-12', type: 'expense' },
    { amount: 85.00, category: 'Shopping', description: 'Running Shoes', date: '2026-08-18', type: 'expense' },
    { amount: 45.00, category: 'Shopping', description: 'Books from bookstore', date: '2026-08-24', type: 'expense' },

    // Entertainment
    { amount: 15.99, category: 'Entertainment', description: 'Netflix Subscription', date: '2026-08-02', type: 'expense' },
    { amount: 28.00, category: 'Entertainment', description: 'Movie Tickets', date: '2026-08-07', type: 'expense' },
    { amount: 12.99, category: 'Entertainment', description: 'Spotify Family Plan', date: '2026-08-15', type: 'expense' },
    { amount: 75.00, category: 'Entertainment', description: 'Concert ticket', date: '2026-08-21', type: 'expense' },

    // Utilities
    { amount: 115.00, category: 'Utilities', description: 'Electricity Bill', date: '2026-08-05', type: 'expense' },
    { amount: 65.00, category: 'Utilities', description: 'Internet service', date: '2026-08-08', type: 'expense' },
    { amount: 45.00, category: 'Utilities', description: 'Water bill', date: '2026-08-10', type: 'expense' },

    // Healthcare
    { amount: 25.00, category: 'Healthcare', description: 'Pharmacy - Allergy Meds', date: '2026-08-09', type: 'expense' },
    { amount: 60.00, category: 'Healthcare', description: 'Dentist Clean checkup', date: '2026-08-23', type: 'expense' },

    // Education
    { amount: 49.00, category: 'Education', description: 'Online Coding Course', date: '2026-08-11', type: 'expense' },


    // --- SEPTEMBER 2026 ---
    // Income
    { amount: 4500, category: 'Utilities', description: 'Monthly Salary', date: '2026-09-01', type: 'income' },
    { amount: 420, category: 'Education', description: 'Freelance Programming Consulting', date: '2026-09-18', type: 'income' },

    // Food & Dining
    { amount: 14.20, category: 'Food & Dining', description: 'Coffee & Donut break', date: '2026-09-02', type: 'expense' },
    { amount: 56.40, category: 'Food & Dining', description: 'Grocery shopping', date: '2026-09-05', type: 'expense' },
    { amount: 42.10, category: 'Food & Dining', description: 'Mid-week Groceries', date: '2026-09-12', type: 'expense' },
    { amount: 95.00, category: 'Food & Dining', description: 'Birthday Dinner party', date: '2026-09-15', type: 'expense' },
    { amount: 18.50, category: 'Food & Dining', description: 'Fast food lunch', date: '2026-09-19', type: 'expense' },
    { amount: 68.20, category: 'Food & Dining', description: 'Weekend bulk grocery store', date: '2026-09-23', type: 'expense' },
    { amount: 34.00, category: 'Food & Dining', description: 'Pizza delivery night', date: '2026-09-26', type: 'expense' },
    { amount: 72.80, category: 'Food & Dining', description: 'Whole Foods purchase', date: '2026-09-29', type: 'expense' },

    // Transportation
    { amount: 46.50, category: 'Transportation', description: 'Gas station refill', date: '2026-09-03', type: 'expense' },
    { amount: 15.00, category: 'Transportation', description: 'City center parking fee', date: '2026-09-10', type: 'expense' },
    { amount: 49.00, category: 'Transportation', description: 'Gas station refill', date: '2026-09-20', type: 'expense' },
    { amount: 24.50, category: 'Transportation', description: 'Uber home late night', date: '2026-09-25', type: 'expense' },

    // Shopping
    { amount: 145.00, category: 'Shopping', description: 'Designer Sunglasses', date: '2026-09-07', type: 'expense' },
    { amount: 32.00, category: 'Shopping', description: 'T-shirt sale', date: '2026-09-14', type: 'expense' },
    { amount: 280.00, category: 'Shopping', description: 'Office Chair ergonomic', date: '2026-09-22', type: 'expense' },

    // Entertainment
    { amount: 15.99, category: 'Entertainment', description: 'Netflix Subscription', date: '2026-09-02', type: 'expense' },
    { amount: 12.99, category: 'Entertainment', description: 'Spotify Family Plan', date: '2026-09-15', type: 'expense' },
    { amount: 35.00, category: 'Entertainment', description: 'Video Game purchase', date: '2026-09-17', type: 'expense' },
    { amount: 45.00, category: 'Entertainment', description: 'Bowling Night with colleagues', date: '2026-09-28', type: 'expense' },

    // Utilities
    { amount: 145.00, category: 'Utilities', description: 'Electricity Bill (AC heavy)', date: '2026-09-05', type: 'expense' },
    { amount: 65.00, category: 'Utilities', description: 'Internet service', date: '2026-09-08', type: 'expense' },
    { amount: 50.00, category: 'Utilities', description: 'Water bill', date: '2026-09-10', type: 'expense' },

    // Healthcare
    { amount: 15.00, category: 'Healthcare', description: 'Eye Drops pharmacy', date: '2026-09-11', type: 'expense' },
    { amount: 35.00, category: 'Healthcare', description: 'Physiotherapist co-pay', date: '2026-09-24', type: 'expense' },

    // Travel
    { amount: 480.00, category: 'Travel', description: 'Flight Tickets - Weekend Getaway', date: '2026-09-10', type: 'expense' },
    { amount: 240.00, category: 'Travel', description: 'Hotel stay booking', date: '2026-09-12', type: 'expense' },
    { amount: 95.00, category: 'Travel', description: 'Travel insurance & luggage', date: '2026-09-13', type: 'expense' },


    // --- OCTOBER 2026 ---
    // Income
    { amount: 4500, category: 'Utilities', description: 'Monthly Salary', date: '2026-10-01', type: 'income' },
    { amount: 600, category: 'Education', description: 'Freelance UI Work', date: '2026-10-18', type: 'income' },

    // Food & Dining
    { amount: 11.80, category: 'Food & Dining', description: 'Starbucks coffee run', date: '2026-10-02', type: 'expense' },
    { amount: 58.90, category: 'Food & Dining', description: 'Groceries supermarket', date: '2026-10-05', type: 'expense' },
    { amount: 16.50, category: 'Food & Dining', description: 'Salad lunch delivery', date: '2026-10-11', type: 'expense' },
    { amount: 49.30, category: 'Food & Dining', description: 'Weekly groceries fill', date: '2026-10-16', type: 'expense' },
    { amount: 112.00, category: 'Food & Dining', description: 'Steakhouse dinner celebration', date: '2026-10-23', type: 'expense' },
    
    // Transportation
    { amount: 48.00, category: 'Transportation', description: 'Gas station', date: '2026-10-07', type: 'expense' },
    { amount: 21.00, category: 'Transportation', description: 'Train fare cards', date: '2026-10-15', type: 'expense' },

    // Shopping
    { amount: 89.99, category: 'Shopping', description: 'Mechanical Keyboard', date: '2026-10-09', type: 'expense' },
    { amount: 15.00, category: 'Shopping', description: 'Notebooks & Pens office supply', date: '2026-10-14', type: 'expense' },

    // Entertainment
    { amount: 15.99, category: 'Entertainment', description: 'Netflix Subscription', date: '2026-10-02', type: 'expense' },
    { amount: 12.99, category: 'Entertainment', description: 'Spotify Family Plan', date: '2026-10-20', type: 'expense' },

    // Utilities
    { amount: 135.00, category: 'Utilities', description: 'Electricity Bill', date: '2026-10-08', type: 'expense' },
    { amount: 65.00, category: 'Utilities', description: 'Internet service', date: '2026-10-12', type: 'expense' },

    // Healthcare
    { amount: 45.00, category: 'Healthcare', description: 'Prescription Glasses', date: '2026-10-19', type: 'expense' }
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

  console.log(`Seeded ${transactions.length} transactions successfully!`);
};
