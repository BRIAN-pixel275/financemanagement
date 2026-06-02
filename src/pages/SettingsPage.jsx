import { useState, useEffect } from 'react';
import { Save, Trash2, KeyRound, ShieldCheck, Eye } from 'lucide-react';
import { getSettings, saveSettings, getBudget, saveBudget, EXPENSE_CATEGORIES } from '../data/store';
import Card from '../components/Card';
import { useAuth } from '../auth/AuthContext';

export default function SettingsPage() {
  const [settings, setSettings] = useState(getSettings());
  const [budget, setBudget]     = useState(getBudget());
  const [saved, setSaved]       = useState(false);
  const [adminPass, setAdminPass]   = useState('');
  const [viewerPass, setViewerPass] = useState('');
  const [passSaved, setPassSaved]   = useState(false);
  const { user } = useAuth();

  const handleSave = () => {
    saveSettings(settings);
    saveBudget(budget);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePassSave = () => {
    const s = getSettings();
    if (adminPass)  s.adminPass  = adminPass;
    if (viewerPass) s.viewerPass = viewerPass;
    saveSettings(s);
    setAdminPass('');
    setViewerPass('');
    setPassSaved(true);
    setTimeout(() => setPassSaved(false), 2000);
  };

  const clearData = () => {
    if (confirm('⚠️ This will delete ALL transactions. Cannot be undone. Continue?')) {
      localStorage.removeItem('cv_transactions');
      alert('Transaction data cleared. Refresh the page.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, outline: 'none', marginTop: 6
  };

  return (
    <div style={{ padding: '28px', flex: 1, maxWidth: 720 }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Admin access — configure ClubVault</p>
      </div>

      {/* Club info */}
      <Card className="fade-up-2" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Club Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { key: 'clubName',   label: 'Club Name'       },
            { key: 'treasurer',  label: 'Treasurer Name'  },
            { key: 'currency',   label: 'Currency Symbol' },
            { key: 'fiscalYear', label: 'Fiscal Year'     },
            { key: 'email',      label: 'Contact Email', full: true },
          ].map(f => (
            <label key={f.key} style={{ gridColumn: f.full ? '1/-1' : undefined }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{f.label}</span>
              <input value={settings[f.key] || ''} onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))} style={inputStyle} />
            </label>
          ))}
        </div>
        <button onClick={handleSave} style={{
          marginTop: 18, display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 18px', borderRadius: 9, border: 'none',
          background: saved ? 'var(--success)' : 'var(--primary)',
          color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13,
          transition: 'background .3s'
        }}>
          <Save size={14} /> {saved ? 'Saved!' : 'Save Club Info'}
        </button>
      </Card>

      {/* Password management */}
      <Card className="fade-up-3" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <KeyRound size={16} color="var(--primary)" />
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Change Passwords</h3>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>
          Leave blank to keep current password. Changes take effect on next login.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
              <ShieldCheck size={12} color="var(--primary)" />
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Admin Password</span>
            </div>
            <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)}
              placeholder="New password..." style={inputStyle} />
          </label>
          <label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
              <Eye size={12} color="#f59e0b" />
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Viewer Password</span>
            </div>
            <input type="password" value={viewerPass} onChange={e => setViewerPass(e.target.value)}
              placeholder="New password..." style={inputStyle} />
          </label>
        </div>
        <button onClick={handlePassSave} style={{
          marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 18px', borderRadius: 9, border: 'none',
          background: passSaved ? 'var(--success)' : '#1e3a5f',
          color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13,
          transition: 'background .3s'
        }}>
          <KeyRound size={14} /> {passSaved ? 'Passwords Updated!' : 'Update Passwords'}
        </button>
      </Card>

      {/* Budget */}
      <Card className="fade-up-3" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Category Budgets</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Monthly budget targets for expense categories (0 = no limit).</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {EXPENSE_CATEGORIES.map(cat => (
            <label key={cat}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{cat}</span>
              <input type="number" value={budget[cat] || 0}
                onChange={e => setBudget(b => ({ ...b, [cat]: parseFloat(e.target.value) || 0 }))}
                style={inputStyle} />
            </label>
          ))}
        </div>
        <button onClick={handleSave} style={{
          marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 18px', borderRadius: 9, border: 'none',
          background: saved ? 'var(--success)' : 'var(--primary)',
          color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13,
        }}>
          <Save size={14} /> Save Budgets
        </button>
      </Card>

      {/* Danger zone */}
      <Card style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>Danger Zone</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>Permanently delete all transaction records. This cannot be undone.</p>
        <button onClick={clearData} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 9, border: '1px solid var(--danger)',
          background: 'none', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13
        }}>
          <Trash2 size={14} /> Clear All Transaction Data
        </button>
      </Card>
    </div>
  );
}
