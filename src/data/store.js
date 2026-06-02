// ─── ClubVault Data Store ───────────────────────────────────────────────────
// All data lives in localStorage. Import these helpers in any component.

const KEYS = {
  transactions: 'cv_transactions',
  settings: 'cv_settings',
  budget: 'cv_budget',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Seed data (first run only) ───────────────────────────────────────────────
const SEED_TRANSACTIONS = [
  { id: uid(), date: '2025-05-01', type: 'income',  category: 'Membership Fees', description: 'May membership dues', amount: 12000, receipt: null, createdAt: new Date().toISOString() },
  { id: uid(), date: '2025-05-03', type: 'expense', category: 'Events',          description: 'Sports day supplies', amount: 4500,  receipt: null, createdAt: new Date().toISOString() },
  { id: uid(), date: '2025-05-10', type: 'income',  category: 'Donations',       description: 'Alumni donation',     amount: 8000,  receipt: null, createdAt: new Date().toISOString() },
  { id: uid(), date: '2025-05-15', type: 'expense', category: 'Administration',  description: 'Printing costs',      amount: 1200,  receipt: null, createdAt: new Date().toISOString() },
  { id: uid(), date: '2025-05-20', type: 'expense', category: 'Events',          description: 'Meeting refreshments',amount: 2800,  receipt: null, createdAt: new Date().toISOString() },
  { id: uid(), date: '2025-05-25', type: 'income',  category: 'Fundraising',     description: 'Car wash fundraiser', amount: 6500,  receipt: null, createdAt: new Date().toISOString() },
  { id: uid(), date: '2025-06-01', type: 'income',  category: 'Membership Fees', description: 'June membership dues',amount: 11500, receipt: null, createdAt: new Date().toISOString() },
  { id: uid(), date: '2025-06-05', type: 'expense', category: 'Equipment',       description: 'New projector bulb',  amount: 3500,  receipt: null, createdAt: new Date().toISOString() },
];

const DEFAULT_SETTINGS = {
  clubName: 'My Club',
  treasurer: 'Brian',
  currency: 'KSh',
  fiscalYear: '2025',
  email: '',
};

const DEFAULT_BUDGET = {
  'Membership Fees': 15000,
  'Events': 10000,
  'Administration': 5000,
  'Equipment': 8000,
  'Fundraising': 0,
  'Donations': 0,
  'Other': 3000,
};

// ── Transactions ─────────────────────────────────────────────────────────────
export function getTransactions() {
  const existing = load(KEYS.transactions, null);
  if (!existing) {
    save(KEYS.transactions, SEED_TRANSACTIONS);
    return SEED_TRANSACTIONS;
  }
  return existing;
}

export function addTransaction(tx) {
  const list = getTransactions();
  const entry = { ...tx, id: uid(), createdAt: new Date().toISOString() };
  const updated = [entry, ...list];
  save(KEYS.transactions, updated);
  return updated;
}

export function updateTransaction(id, changes) {
  const list = getTransactions();
  const updated = list.map(t => t.id === id ? { ...t, ...changes } : t);
  save(KEYS.transactions, updated);
  return updated;
}

export function deleteTransaction(id) {
  const list = getTransactions();
  const updated = list.filter(t => t.id !== id);
  save(KEYS.transactions, updated);
  return updated;
}

// ── Settings ─────────────────────────────────────────────────────────────────
export function getSettings() {
  return load(KEYS.settings, DEFAULT_SETTINGS);
}
export function saveSettings(s) {
  save(KEYS.settings, { ...DEFAULT_SETTINGS, ...s });
}

// ── Budget ───────────────────────────────────────────────────────────────────
export function getBudget() {
  return load(KEYS.budget, DEFAULT_BUDGET);
}
export function saveBudget(b) {
  save(KEYS.budget, b);
}

// ── Computed summaries ───────────────────────────────────────────────────────
export function getSummary(transactions) {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense, count: transactions.length };
}

export const INCOME_CATEGORIES  = ['Membership Fees', 'Donations', 'Fundraising', 'Grants', 'Other'];
export const EXPENSE_CATEGORIES = ['Events', 'Administration', 'Equipment', 'Travel', 'Food & Drinks', 'Other'];

export function fmt(amount, currency = 'KSh') {
  return `${currency} ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

export { uid };
