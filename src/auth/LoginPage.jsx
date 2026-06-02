import { useState } from 'react';
import { Vault, Eye, EyeOff, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getSettings } from '../data/store';

export default function LoginPage() {
  const { login } = useAuth();
  const settings = getSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [error, setError]        = useState('');
  const [loading, setLoading]    = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) { setError('Please enter username and password'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400)); // brief delay feels more real
    const res = login(username, password);
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    background: '#0d1526', border: '1px solid #1e2d45',
    color: '#e2e8f0', fontFamily: "'Sora', sans-serif", fontSize: 14,
    outline: 'none', marginTop: 6, transition: 'border-color .2s'
  };

  const roles = [
    { id: 'admin',  icon: ShieldCheck, label: 'Admin',  desc: 'Full access — add, edit, delete transactions' },
    { id: 'viewer', icon: BookOpen,    label: 'Viewer', desc: 'Read-only — view reports and print'            },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora', sans-serif", padding: 16,
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.05) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 0 0 8px rgba(59,130,246,0.1)'
          }}>
            <Vault size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>ClubVault</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{settings.clubName}</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111827', border: '1px solid #1e2d45',
          borderRadius: 18, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Sign in to your account</h2>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 22 }}>Choose your role and enter your password</p>

          {/* Role pills */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>Username</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {roles.map(r => (
                <button key={r.id} onClick={() => setUsername(r.id)} style={{
                  flex: 1, padding: '10px 10px', borderRadius: 10, cursor: 'pointer',
                  border: username === r.id ? '1.5px solid #3b82f6' : '1.5px solid #1e2d45',
                  background: username === r.id ? 'rgba(59,130,246,0.1)' : '#0d1526',
                  color: username === r.id ? '#3b82f6' : '#64748b',
                  textAlign: 'left', fontFamily: "'Sora', sans-serif", transition: 'all .2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <r.icon size={14} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.label}</span>
                  </div>
                  <div style={{ fontSize: 10, lineHeight: 1.4, color: username === r.id ? '#93bbfc' : '#475569' }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>Password</div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder={username === 'admin' ? 'admin123' : username === 'viewer' ? 'viewer123' : 'Select a role first'}
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#1e2d45'}
              />
              <button onClick={() => setShowPass(s => !s)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, marginTop: 3
              }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '9px 12px', marginBottom: 16, fontSize: 12, color: '#ef4444' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
            background: loading ? '#1e3a5f' : '#3b82f6', color: '#fff',
            fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#334155', marginTop: 20 }}>
          Default: admin / admin123 · viewer / viewer123
        </p>
      </div>
    </div>
  );
}
