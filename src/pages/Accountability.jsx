import { useState, useEffect } from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getTransactions, getSummary, getSettings, fmt } from '../data/store';
import Card from '../components/Card';

export default function Accountability() {
  const [txns, setTxns] = useState([]);
  const settings = getSettings();

  useEffect(() => { setTxns(getTransactions()); }, []);

  const summary = getSummary(txns);

  // Group by date for audit log
  const byDate = {};
  [...txns].sort((a, b) => b.date.localeCompare(a.date)).forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = [];
    byDate[t.date].push(t);
  });

  const checks = [
    { label: 'All transactions have descriptions', pass: txns.every(t => t.description?.trim()), icon: CheckCircle2 },
    { label: 'All transactions have categories',   pass: txns.every(t => t.category?.trim()),   icon: CheckCircle2 },
    { label: 'All transactions have valid dates',  pass: txns.every(t => !isNaN(new Date(t.date))), icon: CheckCircle2 },
    { label: 'Balance is positive',                pass: summary.balance >= 0,                   icon: summary.balance >= 0 ? CheckCircle2 : AlertTriangle },
  ];

  return (
    <div style={{ padding: '28px', flex: 1 }}>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Accountability</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Audit trail and compliance checks</p>
      </div>

      {/* Health checks */}
      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
        {checks.map(c => (
          <div key={c.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12
          }}>
            <c.icon size={18} color={c.pass ? 'var(--success)' : 'var(--warning)'} />
            <span style={{ fontSize: 13, color: c.pass ? 'var(--text)' : 'var(--warning)' }}>{c.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: c.pass ? 'var(--success)' : 'var(--warning)' }}>
              {c.pass ? 'PASS' : 'WARN'}
            </span>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Records',    value: txns.length },
          { label: 'Income Records',   value: txns.filter(t => t.type === 'income').length },
          { label: 'Expense Records',  value: txns.filter(t => t.type === 'expense').length },
          { label: 'Net Balance',      value: fmt(summary.balance, settings.currency) },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 6, fontFamily: 'var(--mono)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Audit log */}
      <Card className="fade-up-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Audit Log</h3>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>All transactions chronologically</span>
        </div>

        {Object.entries(byDate).map(([date, items]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Clock size={12} color="var(--muted)" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{date}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 4 }} />
            </div>
            {items.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{t.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.category} · ID: <span style={{ fontFamily: 'var(--mono)' }}>{t.id}</span></div>
                </div>
                <div style={{ fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 700, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount, settings.currency)}
                </div>
              </div>
            ))}
          </div>
        ))}

        {txns.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No transactions recorded yet.</div>}
      </Card>
    </div>
  );
}
