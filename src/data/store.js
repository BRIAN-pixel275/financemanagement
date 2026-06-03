import { supabase } from '../supabase';

// ── Real-time listener ────────────────────────────────────────────────────────
export function subscribeToTransactions(callback) {
  supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .then(({ data }) => callback(data || []));

  const channel = supabase
    .channel('transactions')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'transactions' },
      () => {
        supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .then(({ data }) => callback(data || []));
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ── Keep getTransactions for any direct calls ─────────────────────────────────
export async function getTransactions() {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  return data || [];
}

// ── Add ───────────────────────────────────────────────────────────────────────
export async function addTransaction(tx) {
  const { error } = await supabase.from('transactions').insert([{
    date: tx.date,
    type: tx.type,
    category: tx.category,
    description: tx.description,
    amount: tx.amount,
  }]);
  if (error) console.error('Add error:', error);
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateTransaction(id, changes) {
  const { error } = await supabase
    .from('transactions')
    .update(changes)
    .eq('id', id);
  if (error) console.error('Update error:', error);
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  if (error) console.error('Delete error:', error);
}

// ── Settings (localStorage) ───────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  clubName: 'My Club',
  treasurer: 'Brian',
  currency: 'KSh',
  fiscalYear: '2025',
  email: '',
  adminPass: 'admin123',
  viewerPass: 'viewer123',
};

export function getSettings() {
  try {
    const raw = localStorage.getItem('cv_settings');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(s) {
  localStorage.setItem('cv_settings', JSON.stringify({ ...DEFAULT_SETTINGS, ...s }));
}

// ── Budget (localStorage) ─────────────────────────────────────────────────────
const DEFAULT_BUDGET = {
  'Events': 10000,
  'Administration': 5000,
  'Equipment': 8000,
  'Travel': 3000,
  'Food & Drinks': 4000,
  'Other': 3000,
};

export function getBudget() {
  try {
    const raw = localStorage.getItem('cv_budget');
    return raw ? JSON.parse(raw) : DEFAULT_BUDGET;
  } catch { return DEFAULT_BUDGET; }
}

export function saveBudget(b) {
  localStorage.setItem('cv_budget', JSON.stringify(b));
}

// ── Summary helper ────────────────────────────────────────────────────────────
export function getSummary(transactions) {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense, count: transactions.length };
}

// ── Categories ────────────────────────────────────────────────────────────────
export const INCOME_CATEGORIES  = ['Membership Fees', 'Donations', 'Fundraising', 'Grants', 'Other'];
export const EXPENSE_CATEGORIES = ['Events', 'Administration', 'Equipment', 'Travel', 'Food & Drinks', 'Other'];

// ── Format currency ───────────────────────────────────────────────────────────
export function fmt(amount, currency = 'KSh') {
  return `${currency} ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

// ── Unique ID (kept for compatibility) ────────────────────────────────────────
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}