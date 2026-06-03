import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Activity, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscribeToTransactions, getSummary, getSettings, fmt, addTransaction } from '../data/store';
import { StatCard } from '../components/Card';
import TransactionModal from '../components/TransactionModal';
import { useAuth } from '../auth/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function buildChartData(transactions) {
  const monthly = {};
  transactions.forEach(t => {
    const mo = t.date.slice(0, 7);
    if (!monthly[mo]) monthly[mo] = { month: mo, income: 0, expense: 0 };
    if (t.type === 'income') monthly[mo].income += t.amount;
    else monthly[mo].expense += t.amount;
  });
  return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}

export default function Dashboard() {
  const [txns, setTxns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const settings = getSettings();
  const { canEdit, isViewer } = useAuth();

  useEffect(() => {
    const unsub = subscribeToTransactions((data) => {
      setTxns(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const summary = getSummary(txns);
  const recent = txns.slice(0, 5);
  const chartData = buildChartData(txns);

  const handleAdd = async (tx) => { await addTransaction(tx); };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>
      Loading...
    </div>
  );

  return (
    <div style={{ padding: '28px', flex: 1 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            {settings.clubName}
            {isViewer && (
              <span style={{ marginLeft: 10, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                VIEW ONLY
              </span>
            )}
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: 'var(--primary)', color: '#fff',
            cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13
          }}>
            <Plus size={16} /> Add Transaction
          </button>
        )}
      </div>

      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Balance"  value={fmt(summary.balance,  settings.currency)} icon={Wallet}      color="var(--primary)" />
        <StatCard label="Total Income"   value={fmt(summary.income,   settings.currency)} icon={TrendingUp}  color="var(--success)" />
        <StatCard label="Total Expenses" value={fmt(summary.expense,  settings.currency)} icon={TrendingDown} color="var(--danger)"  />
        <StatCard label="Transactions"   value={summary.count}                            icon={Activity}    color="var(--warning)" />
      </div>

      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Income vs Expenses (6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="income"  stroke="#10b981" fill="url(#gIncome)"  strokeWidth={2} />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#gExpense)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent Transactions</h3>
            <Link to="/transactions" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.length === 0
              ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>No transactions yet.</div>
              : recent.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: t.type === 'income' ? '#10b98120' : '#ef444420', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {t.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.category} · {t.date}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }}>
                    {t.type === 'income' ? '+' : '-'}{settings.currency} {t.amount.toLocaleString()}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {canEdit && <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAdd} />}
    </div>
  );
}