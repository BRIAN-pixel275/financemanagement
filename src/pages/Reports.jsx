import { useState, useEffect, useRef } from 'react';
import { FileDown, FileText, Printer, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { getTransactions, getSummary, getSettings, fmt } from '../data/store';
import { generateReportPDF } from '../utils/pdfGenerator';
import { useAuth } from '../auth/AuthContext';
import Card from '../components/Card';

export default function Reports() {
  const [txns, setTxns]         = useState([]);
  const [period, setPeriod]     = useState('all');
  const [pdfUrl, setPdfUrl]     = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating]   = useState(false);
  const { canEdit } = useAuth();
  const settings = getSettings();

  useEffect(() => {
  const unsub = subscribeToTransactions((data) => {
    setTxns(data);
  });
  return () => unsub();
}, []);

  const now = new Date();
  const filtered = txns.filter(t => {
    if (period === 'all') return true;
    const d = new Date(t.date);
    if (period === 'month')   return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'quarter') { const q = Math.floor(now.getMonth() / 3); return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear(); }
    if (period === 'year')    return d.getFullYear() === now.getFullYear();
    return true;
  });

  const summary = getSummary(filtered);
  const cats = {};
  filtered.forEach(t => {
    if (!cats[t.category]) cats[t.category] = { income: 0, expense: 0 };
    cats[t.category][t.type] += t.amount;
  });

  const buildPdf = () => {
    setGenerating(true);
    // slight defer so spinner renders
    setTimeout(() => {
      const url = generateReportPDF(filtered, summary, cats, settings, period);
      setPdfUrl(url);
      setGenerating(false);
      setShowPreview(true);
    }, 50);
  };

  const handlePreviewToggle = () => {
    if (!showPreview && !pdfUrl) { buildPdf(); return; }
    if (!showPreview) { setShowPreview(true); return; }
    setShowPreview(false);
  };

  const handleRefresh = () => {
    setPdfUrl(null);
    setShowPreview(false);
    setTimeout(buildPdf, 50);
  };

  const handleDownload = () => {
    if (!pdfUrl) { buildPdf(); return; }
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `clubvault-report-${period}.pdf`;
    a.click();
  };

  const handlePrint = () => {
    if (!pdfUrl) {
      const url = generateReportPDF(filtered, summary, cats, settings, period);
      const win = window.open(url);
      win && win.addEventListener('load', () => win.print());
      return;
    }
    const win = window.open(pdfUrl);
    win && win.addEventListener('load', () => win.print());
  };

  const exportCSV = () => {
    const header = 'Date,Type,Category,Description,Amount\n';
    const rows = filtered.map(t => `${t.date},${t.type},${t.category},"${t.description}",${t.amount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `clubvault-report-${period}.csv` });
    a.click();
  };

  // invalidate cached pdf when period changes
  useEffect(() => { setPdfUrl(null); setShowPreview(false); }, [period]);

  const labelStyle = { fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const valueStyle = { fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'var(--mono)', marginTop: 4 };

  return (
    <div style={{ padding: '28px', flex: 1 }}>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Reports</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Generate, preview and export financial reports
            {!canEdit && <span style={{ marginLeft: 8, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20 }}>VIEWER</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canEdit && (
            <button onClick={exportCSV} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px',
              borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12
            }}>
              <FileDown size={14} /> CSV
            </button>
          )}
          <button onClick={handlePrint} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px',
            borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface2)',
            color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12
          }}>
            <Printer size={14} /> Print
          </button>
          {pdfUrl && (
            <button onClick={handleRefresh} title="Regenerate PDF" style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 13px',
              borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12
            }}>
              <RefreshCw size={14} />
            </button>
          )}
          <button onClick={handlePreviewToggle} disabled={generating} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
            borderRadius: 9, border: 'none',
            background: showPreview ? '#1a3a5c' : 'var(--primary)',
            color: '#fff', cursor: generating ? 'wait' : 'pointer',
            fontFamily: 'var(--font)', fontWeight: 600, fontSize: 12, transition: 'background .2s'
          }}>
            {generating ? <RefreshCw size={14} style={{ animation: 'spin .8s linear infinite' }} /> : showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {generating ? 'Building...' : showPreview ? 'Hide Preview' : 'Preview PDF'}
          </button>
          {pdfUrl && (
            <button onClick={handleDownload} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px',
              borderRadius: 9, border: 'none', background: '#10b981',
              color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 12
            }}>
              <FileDown size={14} /> Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Period selector */}
      <div className="fade-up-2" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['all','All Time'],['month','This Month'],['quarter','This Quarter'],['year','This Year']].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font)', fontSize: 12, fontWeight: 500,
            background: period === v ? 'var(--primary)' : 'var(--surface2)',
            color: period === v ? '#fff' : 'var(--muted)'
          }}>{l}</button>
        ))}
      </div>

      {/* PDF Preview panel */}
      {showPreview && pdfUrl && (
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Eye size={15} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>PDF Preview</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>— scroll inside the preview to see all pages</span>
          </div>
          <div style={{
            borderRadius: 14, overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <iframe
              src={pdfUrl}
              title="Report Preview"
              style={{ width: '100%', height: 680, border: 'none', display: 'block', background: '#1a1a2e' }}
            />
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Income',   value: fmt(summary.income, settings.currency),  color: 'var(--success)' },
          { label: 'Total Expenses', value: fmt(summary.expense, settings.currency), color: 'var(--danger)'  },
          { label: 'Net Balance',    value: fmt(summary.balance, settings.currency), color: summary.balance >= 0 ? 'var(--primary)' : 'var(--danger)' },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', borderTop: `3px solid ${c.color}` }}>
            <div style={labelStyle}>{c.label}</div>
            <div style={{ ...valueStyle, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <Card className="fade-up-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <FileText size={18} color="var(--primary)" />
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Category Breakdown</h3>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{filtered.length} transactions</span>
        </div>
        {Object.keys(cats).length === 0
          ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>No transactions in this period.</div>
          : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Category','Income','Expenses','Net'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Category' ? 'left' : 'right', fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(cats).map(([cat, { income, expense }]) => (
                  <tr key={cat} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 500 }}>{cat}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', color: 'var(--success)', fontFamily: 'var(--mono)' }}>{income > 0 ? fmt(income, settings.currency) : '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', color: 'var(--danger)', fontFamily: 'var(--mono)' }}>{expense > 0 ? fmt(expense, settings.currency) : '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', fontWeight: 700, fontFamily: 'var(--mono)', color: income - expense >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                      {fmt(income - expense, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700 }}>TOTAL</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--mono)' }}>{fmt(summary.income, settings.currency)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--danger)', fontFamily: 'var(--mono)' }}>{fmt(summary.expense, settings.currency)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: summary.balance >= 0 ? 'var(--primary)' : 'var(--danger)', fontFamily: 'var(--mono)' }}>{fmt(summary.balance, settings.currency)}</td>
                </tr>
              </tfoot>
            </table>
        }
      </Card>
    </div>
  );
}
