import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Lock } from 'lucide-react';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getSettings, fmt } from '../data/store';
import TransactionModal from '../components/TransactionModal';
import { useAuth } from '../auth/AuthContext';

export default function Transactions() {
  const [txns, setTxns]     = useState([]);
  const [search, setSearch] = useState('');
  const [typeF, setTypeF]   = useState('all');
  const [modal, setModal]   = useState({ open: false, tx: null });
  const settings = getSettings();
  const { canEdit, isViewer } = useAuth();

  useEffect(() => { setTxns(getTransactions()); }, []);

  const filtered = txns.filter(t => {
    const matchType = typeF === 'all' || t.type === typeF;
    const q = search.toLowerCase();
    const matchSearch = !q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const handleSave = (tx) => {
    if (modal.tx) setTxns(updateTransaction(modal.tx.id, tx));
    else setTxns(addTransaction(tx));
  };

  const handleDelete = (id) => {
    if (confirm('Delete this transaction?')) setTxns(deleteTransaction(id));
  };

  const inputStyle = {
    padding: '9px 12px 9px 36px', borderRadius: 8,
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, outline: 'none', width: 220
  };

  return (
    <div style={{ padding: '28px', flex: 1 }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Transactions</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            {filtered.length} records
            {isViewer && (
              <span style={{ marginLeft: 10, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>READ ONLY</span>
            )}
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setModal({ open: true, tx: null })} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: 'var(--primary)', color: '#fff',
            cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13
          }}>
            <Plus size={16} /> Add Transaction
          </button>
        )}
      </div>

      <div className="fade-up-2" style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','income','expense'].map(t => (
            <button key={t} onClick={() => setTypeF(t)} style={{
              padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font)', fontSize: 12, fontWeight: 500,
              background: typeF === t ? 'var(--primary)' : 'var(--surface2)',
              color: typeF === t ? '#fff' : 'var(--muted)',
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="fade-up-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Date','Type','Category','Description','Amount', canEdit ? 'Actions' : ''].filter(Boolean).map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Amount' || h === 'Actions' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No transactions found.</td></tr>
            )}
            {filtered.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: t.type === 'income' ? '#10b98120' : '#ef444420', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>{t.type}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>{t.category}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount, settings.currency)}
                </td>
                {canEdit && (
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setModal({ open: true, tx: t })} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4, opacity: 0.7 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit && <TransactionModal open={modal.open} initial={modal.tx} onClose={() => setModal({ open: false, tx: null })} onSave={handleSave} />}
    </div>
  );
}
