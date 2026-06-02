// ─── PDF Report Generator ────────────────────────────────────────────────────
// Uses jsPDF to build a styled financial report.
// Returns a data URL that can be used in an <iframe> for preview or downloaded.

import { jsPDF } from 'jspdf';

export function generateReportPDF(filtered, summary, cats, settings, period) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const cur = settings.currency || 'KSh';
  const fmtAmt = (n) => `${cur} ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  const periodLabels = { all: 'All Time', month: 'This Month', quarter: 'This Quarter', year: 'This Year' };
  const now = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── Header band ─────────────────────────────────────────────────────────
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, W, 90, 'F');

  doc.setFillColor(59, 130, 246);
  doc.roundedRect(36, 18, 54, 54, 8, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CV', 63, 52, { align: 'center' });

  doc.setFontSize(20);
  doc.text('ClubVault Financial Report', 102, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`${settings.clubName || 'My Club'} · ${periodLabels[period] || period} · Generated ${now}`, 102, 60);
  doc.text(`Treasurer: ${settings.treasurer || '—'}  |  Fiscal Year: ${settings.fiscalYear || '—'}`, 102, 76);

  // ── Summary boxes ────────────────────────────────────────────────────────
  let y = 112;
  const boxW = (W - 72 - 24) / 3;
  const boxes = [
    { label: 'Total Income',   value: fmtAmt(summary.income),   r: 16, g: 185, b: 129 },
    { label: 'Total Expenses', value: fmtAmt(summary.expense),  r: 239, g: 68, b: 68  },
    { label: 'Net Balance',    value: fmtAmt(summary.balance),  r: 59, g: 130, b: 246 },
  ];
  boxes.forEach((box, i) => {
    const x = 36 + i * (boxW + 12);
    doc.setFillColor(26, 34, 54);
    doc.roundedRect(x, y, boxW, 58, 6, 6, 'F');
    doc.setDrawColor(box.r, box.g, box.b);
    doc.setLineWidth(2);
    doc.roundedRect(x, y, boxW, 3, 1, 1, 'F');
    doc.setFillColor(box.r, box.g, box.b);
    doc.rect(x, y, boxW, 3, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(box.label.toUpperCase(), x + 12, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(box.r, box.g, box.b);
    doc.text(box.value, x + 12, y + 38);
  });

  // ── Category breakdown table ──────────────────────────────────────────────
  y += 76;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(226, 232, 240);
  doc.text('Category Breakdown', 36, y);
  y += 16;

  // Table header
  const cols = { cat: 36, income: 240, expense: 360, net: 460 };
  doc.setFillColor(17, 24, 39);
  doc.rect(36, y, W - 72, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('CATEGORY',  cols.cat + 8,     y + 16);
  doc.text('INCOME',    cols.income,       y + 16, { align: 'right' });
  doc.text('EXPENSES',  cols.expense,      y + 16, { align: 'right' });
  doc.text('NET',       W - 36 - 8,        y + 16, { align: 'right' });
  y += 24;

  // Table rows
  const catEntries = Object.entries(cats);
  catEntries.forEach(([cat, { income, expense }], idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(15, 23, 42);
      doc.rect(36, y, W - 72, 24, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(226, 232, 240);
    doc.text(cat, cols.cat + 8, y + 16);

    if (income > 0) {
      doc.setTextColor(16, 185, 129);
      doc.text(fmtAmt(income), cols.income, y + 16, { align: 'right' });
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('—', cols.income, y + 16, { align: 'right' });
    }

    if (expense > 0) {
      doc.setTextColor(239, 68, 68);
      doc.text(fmtAmt(expense), cols.expense, y + 16, { align: 'right' });
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('—', cols.expense, y + 16, { align: 'right' });
    }

    const net = income - expense;
    doc.setTextColor(net >= 0 ? 59 : 239, net >= 0 ? 130 : 68, net >= 0 ? 246 : 68);
    doc.setFont('helvetica', 'bold');
    doc.text(fmtAmt(net), W - 36 - 8, y + 16, { align: 'right' });
    y += 24;
  });

  // Total row
  doc.setFillColor(30, 45, 69);
  doc.rect(36, y, W - 72, 28, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text('TOTAL', cols.cat + 8, y + 18);
  doc.setTextColor(16, 185, 129);
  doc.text(fmtAmt(summary.income), cols.income, y + 18, { align: 'right' });
  doc.setTextColor(239, 68, 68);
  doc.text(fmtAmt(summary.expense), cols.expense, y + 18, { align: 'right' });
  doc.setTextColor(summary.balance >= 0 ? 59 : 239, summary.balance >= 0 ? 130 : 68, summary.balance >= 0 ? 246 : 68);
  doc.text(fmtAmt(summary.balance), W - 36 - 8, y + 18, { align: 'right' });
  y += 40;

  // ── Transaction list ─────────────────────────────────────────────────────
  if (filtered.length > 0) {
    // New page if needed
    if (y > 620) { doc.addPage(); y = 40; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(226, 232, 240);
    doc.text('Transaction Details', 36, y);
    y += 16;

    // Header
    doc.setFillColor(17, 24, 39);
    doc.rect(36, y, W - 72, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('DATE',        44,       y + 15);
    doc.text('TYPE',        130,      y + 15);
    doc.text('CATEGORY',    190,      y + 15);
    doc.text('DESCRIPTION', 300,      y + 15);
    doc.text('AMOUNT',      W - 44,   y + 15, { align: 'right' });
    y += 22;

    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach((t, idx) => {
      if (y > 780) { doc.addPage(); y = 40; }
      if (idx % 2 === 0) {
        doc.setFillColor(15, 23, 42);
        doc.rect(36, y, W - 72, 20, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(t.date, 44, y + 14);
      doc.setTextColor(t.type === 'income' ? 16 : 239, t.type === 'income' ? 185 : 68, t.type === 'income' ? 129 : 68);
      doc.text(t.type, 130, y + 14);
      doc.setTextColor(148, 163, 184);
      doc.text(t.category, 190, y + 14);
      const desc = doc.splitTextToSize(t.description, 150)[0];
      doc.setTextColor(226, 232, 240);
      doc.text(desc, 300, y + 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(t.type === 'income' ? 16 : 239, t.type === 'income' ? 185 : 68, t.type === 'income' ? 129 : 68);
      doc.text(`${t.type === 'income' ? '+' : '-'}${fmtAmt(t.amount)}`, W - 44, y + 14, { align: 'right' });
      y += 20;
    });
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFillColor(17, 24, 39);
    doc.rect(0, doc.internal.pageSize.getHeight() - 30, W, 30, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`ClubVault · ${settings.clubName} · Confidential`, 36, doc.internal.pageSize.getHeight() - 12);
    doc.text(`Page ${p} of ${pages}`, W - 36, doc.internal.pageSize.getHeight() - 12, { align: 'right' });
  }

  return doc.output('datauristring');
}
