import { useState, useEffect } from 'react';
import { subscribeToTransactions, getSummary, getSettings, getBudget, fmt } from '../data/store';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Card from '../components/Card';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

export default function Analytics() {
  const [txns, setTxns]     = useState([]);
  const [loading, setLoading] = useState(true);
  const settings = getSettings();
  const budget   = getBudget();

  useEffect(() => {
    const unsub = subscribeToTransactions((data) => {
      setTxns(Array.isArray(data) ? data : []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>
      Loading...
    </div>
  );

  const expenseCats = {};
  txns.filter(t => t.type === 'expense').forEach(t => {
    expenseCats[t.category] = (expenseCats[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(expenseCats).map(([name, value]) => ({ name, value }));

  const monthly = {};
  txns.forEach(t => {
    const mo = t.date.slice(0, 7);
    if (!monthly[mo]) monthly[mo] = { month: mo, income: 0, expense: 0 };
    monthly[mo][t.type === 'income' ? 'income' : 'expense'] += t.amount;
  });
  const barData = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));

  const budgetData = Object.entries(budget).map(([cat, budgeted]) => ({
    category: cat,
    budgeted,
    actual: expenseCats[cat] || 0,
  })).filter(d => d.budgeted > 0);

  const summary = getSummary(txns);
  const savingsRate = summary.income > 0 ? ((summary.balance / summary.income) * 100).toFixed(1) : 0;

  return (
    <div style={{ padding: '28px', flex: 1 }}>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Analytics</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Financial insights for {settings.clubName}</p>
      </div>

      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Savings Rate',    value: `${savingsRate}%`,  sub: 'of income retained' },
          { label: 'Avg Transaction', value: fmt(txns.length ? (summary.income + summary.expense) / txns.length : 0, settings.currency), sub: 'per transaction' },
          { label: 'Expense Ratio',   value: `${summary.income > 0 ? ((summary.expense / summary.income) * 100).toFixed(1) : 0}%`, sub: 'expense to income' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 6, fontFamily: 'var(--mono)' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Monthly Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="income"  fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Expenses by Category</h3>
          {pieData.length === 0
            ? <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', paddingTop: 60 }}>No expenses yet</div>
            : <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
          }
        </Card>
      </div>

      <Card className="fade-up-4">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Budget vs Actual Spending</h3>
        {budgetData.length === 0
          ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>No budget set. Go to Settings to configure budgets.</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {budgetData.map(d => {
                const pct  = Math.min((d.actual / d.budgeted) * 100, 100);
                const over = d.actual > d.budgeted;
                return (
                  <div key={d.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{d.category}</span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: over ? 'var(--danger)' : 'var(--muted)' }}>
                        {fmt(d.actual, settings.currency)} / {fmt(d.budgeted, settings.currency)}
                        {over && ' ⚠ Over'}
                      </span>
                    </div>
                    <div style={{ height: 7, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--danger)' : 'var(--primary)', borderRadius: 4, transition: 'width .5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </Card>
    </div>
  );
}