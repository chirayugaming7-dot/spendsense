// src/ai/groq.js

export const getApiKey = () => {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('spendsense_groq_api_key');
    if (customKey && customKey.trim()) return customKey.trim();
  }
  return import.meta.env.VITE_GROQ_API_KEY || '';
};

export const setApiKey = (key) => {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('spendsense_groq_api_key', key.trim());
    } else {
      localStorage.removeItem('spendsense_groq_api_key');
    }
  }
};

const getGroqModel = () => {
  return import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b';
};

export const isGroqConfigured = () => {
  const key = getApiKey();
  return typeof key === 'string' && key.trim() !== '' && !key.startsWith('gsk_YourGroqAPIKey');
};

// Direct REST call to Groq Cloud API with multi-model and multi-endpoint fallback
const callGroqAPI = async (messages, responseFormatJson = false) => {
  const apiKey = getApiKey();
  const primaryModel = getGroqModel();
  // Order of models to try in case of rate-limits or temporary tier unavailability
  const candidateModels = [primaryModel, 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  let lastError = null;

  for (const model of candidateModels) {
    const payload = {
      model,
      messages,
      temperature: 0.1 // Muted creativity for high mathematical consistency
    };
    
    if (responseFormatJson) {
      payload.response_format = { type: 'json_object' };
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    let response;
    // 1. Try direct Groq endpoint (Groq natively sends CORS headers: access-control-allow-origin: *)
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch {
      // 2. If direct call fails (e.g. adblocker blocking api.groq.com), fallback to relative proxy
      try {
        response = await fetch('/api/groq/openai/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      } catch (proxyErr) {
        lastError = proxyErr;
        continue;
      }
    }
    
    if (response && response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }

    if (response) {
      const errorText = await response.text();
      lastError = new Error(`Groq API (${model}) failed: ${response.status} - ${errorText}`);
      // If 404 (model not found) or 429 (rate limited), try the next candidate model
      if (response.status === 404 || response.status === 429 || response.status === 400) {
        console.warn(`Model ${model} returned ${response.status}, trying fallback model...`);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error("Failed to contact Groq API. Please check internet connection.");
};

// --- LOCAL FALLBACK ENGINE FOR DEMOS ---
// Computes precise mathematical metrics and provides a clean analysis
const generateLocalAnalysis = (data) => {
  const { totalExpenses, totalIncome, netBalance, categorySpending, budgetAlerts } = data;
  
  const topSpent = categorySpending.length > 0 ? categorySpending[0] : null;
  const topSpentShare = (topSpent && totalExpenses > 0) ? ((topSpent.spent / totalExpenses) * 100).toFixed(0) : 0;
  
  let periodSummary = `Based on your SQLite database ledger, you have recorded an aggregated spend of $${totalExpenses.toLocaleString()} against total income of $${totalIncome.toLocaleString()}, yielding a net cash surplus of $${netBalance.toLocaleString()}. `;
  
  if (topSpent) {
    periodSummary += `Your single largest expense category is **${topSpent.category}**, consuming $${topSpent.spent.toLocaleString()} (approx. ${topSpentShare}% of total expenses). `;
  }
  
  if (budgetAlerts.length > 0) {
    periodSummary += `Warning: you are currently over budget in **${budgetAlerts.length}** categories: ${budgetAlerts.map(a => a.category).join(', ')}. It is recommended to review these targets.`;
  } else {
    periodSummary += `Excellent job! All categories are currently within their budget limits this month.`;
  }

  const savingSuggestions = [];
  
  if (topSpent) {
    savingSuggestions.push({
      title: `Optimize ${topSpent.category} Outlays`,
      description: `Your spending on ${topSpent.category} ($${topSpent.spent.toLocaleString()}) represents your highest expense share. Trimming discretionary purchases here by 15% would save valuable cash.`,
      potentialSavings: Math.round(topSpent.spent * 0.15),
      priority: 'HIGH'
    });
  }

  const utilSpent = categorySpending.find(c => c.category === 'Utilities');
  if (utilSpent) {
    savingSuggestions.push({
      title: `Audit Muted Utility Spending`,
      description: `Utilities account for $${utilSpent.spent.toLocaleString()} of expenses. Simple behavioral adjustments can lower consumption by up to 10%.`,
      potentialSavings: Math.round(utilSpent.spent * 0.10),
      priority: 'MEDIUM'
    });
  }

  savingSuggestions.push({
    title: `Establish savings rule`,
    description: `Set up a automatic rule transferring 5% of monthly salary ($${Math.round(totalIncome * 0.05)}) directly into savings on payday.`,
    potentialSavings: Math.round(totalIncome * 0.05),
    priority: 'LOW'
  });

  const anomalies = [];
  if (totalExpenses > 0 && categorySpending.length > 0) {
    const avgCategorySpend = totalExpenses / categorySpending.length;
    for (const cat of categorySpending) {
      if (cat.spent > avgCategorySpend * 2) {
        anomalies.push({
          category: cat.category,
          amount: cat.spent,
          message: `Your spending in ${cat.category} ($${cat.spent.toLocaleString()}) is unusually elevated, exceeding twice the category average of $${Math.round(avgCategorySpend).toLocaleString()}.`
        });
      }
    }
  }

  return {
    periodSummary,
    savingSuggestions,
    anomalies
  };
};

// --- DYNAMIC AI ANALYST API CALLS ---

// 1. Generate spending summary, suggestions, and anomalies
export async function getSpendingSummaryAndSuggestions(aggregatedData) {
  if (!isGroqConfigured()) {
    console.log("Groq API key not configured. Running fallback local financial model...");
    return generateLocalAnalysis(aggregatedData);
  }

  try {
    const systemPrompt = `
      You are SpendSense AI, an expert financial analyst. 
      Analyze the user's financial datasets objectively.
      Return a response strictly formatted in JSON matching this schema:
      {
        "periodSummary": "A detailed 3-4 sentence natural language spending summary of the period.",
        "savingSuggestions": [
          { "title": "...", "description": "...", "potentialSavings": 120, "priority": "HIGH" }
        ],
        "anomalies": [
          { "category": "...", "amount": 100, "message": "..." }
        ]
      }
      Do not include any other conversational filler or code block fences, return only raw JSON.
      Perform accurate math and reference figures exactly as provided in the context.
    `;

    const userPrompt = `Analyze this summary of transactions data:
    Total Expenses: $${aggregatedData.totalExpenses}
    Total Income: $${aggregatedData.totalIncome}
    Net Balance: $${aggregatedData.netBalance}
    Category Spending: ${JSON.stringify(aggregatedData.categorySpending)}
    Monthly Trends: ${JSON.stringify(aggregatedData.monthlyTrends)}
    Overspent Budget Alerts: ${JSON.stringify(aggregatedData.budgetAlerts)}
    Recent Transactions: ${JSON.stringify(aggregatedData.recentTransactions)}
    `;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const resultText = await callGroqAPI(messages, true);
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Groq API error during summary generation:", error);
    return generateLocalAnalysis(aggregatedData);
  }
}

// 2. Chat with data (Ask Your Data)
export async function askYourData(question, transactionsList) {
  if (!isGroqConfigured()) {
    // Local keyword-based fallback if no API key is available
    const q = question.toLowerCase();
    const formatCurrency = (v) => `$${Math.round(v).toLocaleString()}`;
    
    if (q.includes('food') || q.includes('dining')) {
      const foodTrans = transactionsList.filter(t => t.category_name === 'Food & Dining');
      const total = foodTrans.reduce((sum, t) => sum + t.amount, 0);
      return `*(Demo local mode)* Based on your SQLite ledger, you have **${foodTrans.length}** transactions under **Food & Dining**. The total spending in this category is **${formatCurrency(total)}**.`;
    }
    
    if (q.includes('august')) {
      const augTrans = transactionsList.filter(t => t.date.startsWith('2026-08'));
      const expenses = augTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const income = augTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      return `*(Demo local mode)* In **August 2026**, you spent **${formatCurrency(expenses)}** and earned **${formatCurrency(income)}** across **${augTrans.length}** transactions.`;
    }

    if (q.includes('september')) {
      const sepTrans = transactionsList.filter(t => t.date.startsWith('2026-09'));
      const expenses = sepTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const income = sepTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      return `*(Demo local mode)* In **September 2026**, you spent **${formatCurrency(expenses)}** and earned **${formatCurrency(income)}** across **${sepTrans.length}** transactions.`;
    }

    if (q.includes('october')) {
      const octTrans = transactionsList.filter(t => t.date.startsWith('2026-10'));
      const expenses = octTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const income = octTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      return `*(Demo local mode)* In **October 2026**, you spent **${formatCurrency(expenses)}** and earned **${formatCurrency(income)}** across **${octTrans.length}** transactions.`;
    }

    const expensesTotal = transactionsList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return `*(Demo local mode)* I see a total of **${transactionsList.length}** transactions in the database amounting to **${formatCurrency(expensesTotal)}** in expenses. Please configure a valid \`VITE_GROQ_API_KEY\` in your \`.env\` file to enable dynamic Llama-3 conversational answers.`;
  }

  try {
    // Compress transactions into a compact CSV-style string to stay within free-tier token limits
    const csvHeader = 'date|type|amount|category|description';
    const csvRows = transactionsList.map(t =>
      `${t.date}|${t.type}|${t.amount}|${t.category_name || ''}|${t.description || ''}`
    );
    const compactData = [csvHeader, ...csvRows].join('\n');

    const systemPrompt = `You are a concise AI Analyst for a personal expense tracker.
Below is the user's transaction dataset in pipe-delimited CSV format:
${compactData}

Rules:
- Keep answers SHORT: 2-4 sentences max. No lengthy explanations.
- Answer accurately using only the transaction data provided.
- Perform accurate arithmetic (sums, averages, counts, comparisons).
- Use **bold** for key figures and category names.
- If the user asks about data outside this context, briefly redirect them.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ];

    return await callGroqAPI(messages, false);
  } catch (error) {
    console.error("Groq API error during ask-your-data call:", error);
    if (error.message && error.message.includes('429')) {
      return "The AI model is temporarily rate-limited. Please wait 10 seconds and try again.";
    }
    return `Sorry, I encountered an error querying the AI model: ${error.message || 'Please check your connection.'}`;
  }
}

// 3. Auto-categorize an expense description (Bonus)
export async function autoCategorizeDescription(description, categories) {
  if (!isGroqConfigured() || !description) {
    const desc = description.toLowerCase();
    if (desc.includes('coffee') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('starbucks') || desc.includes('food') || desc.includes('pizza')) {
      const match = categories.find(c => c.name === 'Food & Dining');
      if (match) return match.id;
    }
    if (desc.includes('uber') || desc.includes('gas') || desc.includes('train') || desc.includes('taxi') || desc.includes('car')) {
      const match = categories.find(c => c.name === 'Transportation');
      if (match) return match.id;
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('movie') || desc.includes('ticket') || desc.includes('game')) {
      const match = categories.find(c => c.name === 'Entertainment');
      if (match) return match.id;
    }
    if (desc.includes('shirt') || desc.includes('shoes') || desc.includes('jacket') || desc.includes('store') || desc.includes('amazon')) {
      const match = categories.find(c => c.name === 'Shopping');
      if (match) return match.id;
    }
    return categories.length > 0 ? categories[0].id : '';
  }

  try {
    const systemPrompt = `
      You are a database classification utility. 
      Select the ID of the category that best matches the transaction description.
      Available categories:
      ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
      
      Respond with ONLY the numeric category ID as raw text. Do not write explanation, code fences, or punctuation.
    `;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Classify description: "${description}"` }
    ];

    const resultText = await callGroqAPI(messages, false);
    const parsedId = parseInt(resultText.trim(), 10);
    return isNaN(parsedId) ? categories[0].id : parsedId;
  } catch (error) {
    console.error("Auto-categorize failed:", error);
    return categories[0].id;
  }
}

// 4. Bulk input text parsing into transaction rows (Bonus)
export async function parseBulkText(bulkText, categories) {
  if (!isGroqConfigured()) {
    throw new Error("Groq API key is required to use the Bulk Input AI Parser feature.");
  }

  try {
    const systemPrompt = `
      You are a data entry extraction utility.
      Parse the user's raw text paste of transactions into an array of structured JSON records.
      
      Available category IDs and names in the database:
      ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
      
      For each transaction, extract:
      - amount: numeric value (positive number)
      - categoryId: select the best matching category ID from the list provided.
      - description: brief summary of what it was
      - date: ISO 8601 YYYY-MM-DD. If year is missing, assume 2026. If date is totally unspecified, use today's date: "${new Date().toISOString().split('T')[0]}"
      - type: "expense" or "income" (default to "expense" unless described as pay, earned, salary, deposit, or freelance income)

      Return a response strictly matching this JSON object schema:
      {
        "transactions": [
          { "amount": 12.5, "categoryId": 1, "description": "Coffee", "date": "2026-10-23", "type": "expense" }
        ]
      }
      Do not write markdown fences or code formatting, return raw JSON object only.
    `;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Parse this block of text:\n${bulkText}` }
    ];

    const resultText = await callGroqAPI(messages, true);
    const parsed = JSON.parse(resultText);
    return Array.isArray(parsed) ? parsed : (parsed.transactions || []);
  } catch (error) {
    console.error("Bulk parsing failed:", error);
    throw new Error("AI model failed to read the bulk text. Please verify formatting.");
  }
}
