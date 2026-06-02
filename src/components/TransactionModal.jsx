import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../data/store';

const EMPTY = { type: 'income', date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '' };

export default function TransactionModal({ open, onClose, onSave, initial = null }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...initial } : EMPTY);
  }, [initial, open]);

  if (!open) return null;

  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.date || !form.category || !form.description || !form.amount) {
      alert('Please fill in all fields');
      return;
    }
    onSave({ ...form, amount: parseFloat(form.amount) });
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13,
    outline: 'none', marginTop: 6
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 440
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{initial ? 'Edit' : 'Add'} Transaction</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['income', 'expense'].map(t => (
            <button key={t} onClick={() => { set('type', t); set('category', ''); }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13,
                background: form.type === t ? (t === 'income' ? 'var(--success)' : 'var(--danger)') : 'var(--bg)',
                color: form.type === t ? '#fff' : 'var(--muted)',
                transition: 'all .2s'
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Date</span>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
          </label>
          <label>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Category</span>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
              <option value="">Select category...</option>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Description</span>
            <input value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="What was this for?" style={inputStyle} />
          </label>
          <label>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Amount (KSh)</span>
            <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
              placeholder="0.00" style={inputStyle} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--border)',
            background: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13
          }}>Cancel</button>
          <button onClick={handleSubmit} style={{
            flex: 2, padding: '10px 0', borderRadius: 8, border: 'none',
            background: form.type === 'income' ? 'var(--success)' : 'var(--primary)',
            color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13
          }}>
            {initial ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
