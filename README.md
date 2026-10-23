# SpendSense — AI-Powered Personal Expense Tracker & Financial Analyst

[![SpendSense Live Demo](https://img.shields.io/badge/Live_Demo-spendsense67.vercel.app-22C55E?style=for-the-badge&logo=vercel)](https://spendsense67.vercel.app)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![SQLite](https://img.shields.io/badge/SQLite-WASM-003B57?style=for-the-badge&logo=sqlite)
![Groq AI](https://img.shields.io/badge/Groq-AI_Inference-F05032?style=for-the-badge&logo=groq)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)

SpendSense is a modern, privacy-first personal finance tracking application powered by React 19, In-Browser SQLite (WebAssembly), and Groq Cloud AI inference. It provides real-time SQL analytical calculations, local IndexedDB persistence, customizable categories, monthly budget tracking, and an interactive AI financial analyst assistant.

🌐 **Live Application**: [https://spendsense67.vercel.app](https://spendsense67.vercel.app)

---

## Key Features

### 1. In-Browser SQLite Engine (SQL.js WebAssembly)
- **Local Relational Ledger**: Executes a complete SQLite database directly inside the browser using WebAssembly for optimal speed and privacy.
- **SQL Analytical Queries**: Aggregates balances, monthly spending trends, category distributions, and multi-criteria filters natively using SQL.
- **IndexedDB Snapshot Persistence**: Automatically seeds initial data (recent active ledger period) and persists updates to IndexedDB snapshots so your financial records remain available across browser sessions.

### 2. AI Financial Analyst & Assistant (Groq Cloud)
- **"Ask Your Data" AI Chatbot**: Conversational finance assistant answering ledger questions like *"How much did I spend on Dining in October?"* or *"What was my biggest expense this month?"*.
- **Automated Insights**: Produces structured spending summaries, prioritized savings opportunities, and anomaly alerts.
- **Smart Auto-Categorization**: Real-time AI categorization based on transaction notes and descriptions.
- **Bulk Receipt / Text Parsing**: Extracts structured transaction records from plain text logs or bank SMS snippets into the ledger with one click.
- **Resilient Multi-Model Failover**: Supports top models (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, `openai/gpt-oss-20b`) with an in-app API Key settings modal.

### 3. Expense & Income Ledger
- **Transaction Tracking**: Record incomes and expenses with amounts, categories, dates, and notes.
- **Custom Categories**: Create custom categories on the fly with emoji icons and distinct color badges.
- **Date Ceilings & Normalization**: Keeps your transactions and ledger consistent with current date boundaries.

### 4. Budgets & Data Management
- **Monthly Budget Goals**: Set category budget limits with visual progress indicators, percentage tracking, and overspend warnings.
- **Interactive Visualizations**: Recharts-driven spending breakdown, month-over-month trends, and cashflow charts.
- **Data Export & Import**: Export transactions to CSV or restore previous ledgers at any time.

---

## Tech Stack

- **Frontend**: React 19, Vite
- **Database**: SQLite WebAssembly (sql.js) + IndexedDB
- **AI Inference**: Groq Cloud REST API (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: Responsive Vanilla CSS with Modern Glassmorphism & Dark Mode

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/chirayugaming7-dot/spendsense.git
   cd spendsense
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Groq Cloud API Key if you wish to use your own key:
   ```env
   VITE_GROQ_API_KEY=your_actual_groq_api_key_here
   ```
   *(Note: You can also configure or change your API key directly within the app UI under AI Insights → API Key Settings).*

4. **Run Locally**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## Project Structure

```
spendsense/
├── public/                # Static assets & sql-wasm WebAssembly binaries
├── src/
│   ├── ai/                # Groq AI client, prompt engineering & multi-model failover
│   ├── components/        # UI components (Dashboard, Transactions, Budgets, AI Insights)
│   ├── context/           # DatabaseContext & SQLite provider
│   ├── db/                # SQLite schemas, initial dataset seed, and SQL queries
│   ├── pages/             # Route pages (Dashboard, Transactions, AI Insights, Budgets)
│   ├── App.jsx            # Main app shell & routing
│   └── main.jsx           # Entry point
├── vercel.json            # Vercel deployment configuration & SPA routing
├── vite.config.js         # Vite configuration with /api/groq proxy
└── package.json           # Dependencies and scripts
```

---

## License

Distributed under the MIT License.
