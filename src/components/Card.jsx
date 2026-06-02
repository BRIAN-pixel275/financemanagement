export default function Card({ children, style = {}, className = '' }) {
  return (
    <div className={className} style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 20,
      ...style
    }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'var(--primary)', trend, className = '' }) {
  return (
    <div className={className} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 20px',
      display: 'flex', alignItems: 'flex-start', gap: 14
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 4, letterSpacing: '-0.5px', fontFamily: 'var(--mono)' }}>{value}</div>
        {trend && <div style={{ fontSize: 11, color: trend.up ? 'var(--success)' : 'var(--danger)', marginTop: 4 }}>{trend.text}</div>}
      </div>
    </div>
  );
}
