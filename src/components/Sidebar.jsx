import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, BarChart2,
  FileText, ShieldCheck, Settings, Vault, LogOut, Eye
} from 'lucide-react';
import { getSettings } from '../data/store';
import { useAuth } from '../auth/AuthContext';

const NAV_ALL = [
  { path: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'      },
  { path: '/transactions',   icon: ArrowLeftRight,  label: 'Transactions'   },
  { path: '/analytics',      icon: BarChart2,       label: 'Analytics'      },
  { path: '/reports',        icon: FileText,        label: 'Reports'        },
  { path: '/accountability', icon: ShieldCheck,     label: 'Accountability' },
  { path: '/settings',       icon: Settings,        label: 'Settings', adminOnly: true },
];

export default function Sidebar() {
  const settings = getSettings();
  const { user, isAdmin, logout } = useAuth();
  const nav = NAV_ALL.filter(n => !n.adminOnly || isAdmin);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hide-mobile" style={{
        width: 220, minHeight: '100vh', background: 'var(--surface)',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Vault size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>ClubVault</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{settings.clubName}</div>
          </div>
        </div>

        {/* Role badge */}
        {user && (
          <div style={{ margin: '12px 10px 4px', padding: '8px 12px', borderRadius: 8, background: isAdmin ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${isAdmin ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin ? <ShieldCheck size={13} color="var(--primary)" /> : <Eye size={13} color="#f59e0b" />}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: isAdmin ? 'var(--primary)' : '#f59e0b', textTransform: 'uppercase' }}>{user.username}</div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{isAdmin ? 'Full access' : 'View & print only'}</div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 10px' }}>
          {nav.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              transition: 'all .15s',
              background: isActive ? 'var(--primary-glow)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--muted)',
              borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            })}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 8, border: 'none', background: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)'; }}>
            <LogOut size={15} /> Sign Out
          </button>
          <div style={{ padding: '4px 12px', fontSize: 10, color: 'var(--border)' }}>FY {settings.fiscalYear}</div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between',
      }} className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Vault size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>ClubVault</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: isAdmin ? 'var(--primary)' : '#f59e0b', fontWeight: 700 }}>
            {user?.username?.toUpperCase()}
          </span>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        padding: '8px 4px', justifyContent: 'space-around', alignItems: 'center',
      }} className="mobile-bottomnav">
        {nav.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            textDecoration: 'none', padding: '4px 8px', borderRadius: 8, minWidth: 48,
            color: isActive ? 'var(--primary)' : 'var(--muted)',
            background: isActive ? 'var(--primary-glow)' : 'transparent',
          })}>
            <Icon size={18} />
            <span style={{ fontSize: 9, fontWeight: 600 }}>{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}