import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export type Column = { key: string; label: string; type?: 'text' | 'money' | 'number' | 'date' | 'percent' };
export type Report = {
  title: string;
  businessName: string;
  period: { from: Date; to: Date; label: string };
  generatedAt: Date;
  summary: { label: string; value: string | number | null }[];
  columns: Column[];
  rows: Record<string, unknown>[];
  notes?: string[];
};

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

function cell(v: unknown, type?: Column['type']): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return fmtDate(v);
  if (type === 'money') return Number(v).toFixed(2);
  if (type === 'percent') return `${v}%`;
  return String(v);
}

/** CSV with a header block; values that start with = + - @ are prefixed to stop formula injection. */
export function toCsv(r: Report): Buffer {
  const esc = (s: string) => {
    let v = s;
    if (/^[=+\-@\t\r]/.test(v) && !/^-?\d+(\.\d+)?$/.test(v)) v = `'${v}`;
    return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  };
  const lines = [
    [r.title],
    ['Business', r.businessName],
    ['Period', `${fmtDate(r.period.from)} to ${fmtDate(r.period.to)} (${r.period.label})`],
    ['Generated', r.generatedAt.toISOString()],
    [],
    ...r.summary.map((s) => [s.label, cell(s.value)]),
    [],
    r.columns.map((c) => c.label),
    ...r.rows.map((row) => r.columns.map((c) => cell(row[c.key], c.type))),
    [],
    ...(r.notes ?? []).map((n) => [n]),
  ];
  return Buffer.from('﻿' + lines.map((l) => l.map((x) => esc(String(x))).join(',')).join('\r\n'), 'utf8');
}

export async function toXlsx(r: Report): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ABUUR Digital';
  wb.created = r.generatedAt;
  const info = wb.addWorksheet('Summary');
  info.addRow([r.title]).font = { bold: true, size: 14 };
  info.addRow(['Business', r.businessName]);
  info.addRow(['Period', `${fmtDate(r.period.from)} to ${fmtDate(r.period.to)} (${r.period.label})`]);
  info.addRow(['Generated', r.generatedAt.toISOString()]);
  info.addRow([]);
  for (const s of r.summary) info.addRow([s.label, s.value ?? '']);
  for (const n of r.notes ?? []) info.addRow([n]);
  info.getColumn(1).width = 36;
  info.getColumn(2).width = 40;

  const ws = wb.addWorksheet('Data');
  ws.columns = r.columns.map((c) => ({ header: c.label, key: c.key, width: Math.max(12, c.label.length + 4) }));
  ws.getRow(1).font = { bold: true };
  for (const row of r.rows) {
    ws.addRow(Object.fromEntries(r.columns.map((c) => {
      const v = row[c.key];
      if (v instanceof Date) return [c.key, v];
      if (c.type === 'money' || c.type === 'number' || c.type === 'percent') return [c.key, v === null || v === undefined ? null : Number(v)];
      return [c.key, v === null || v === undefined ? '' : String(v)];
    })));
  }
  r.columns.forEach((c, n) => {
    if (c.type === 'money') ws.getColumn(n + 1).numFmt = '#,##0.00';
    if (c.type === 'date') ws.getColumn(n + 1).numFmt = 'yyyy-mm-dd';
  });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

function pdfBuffer(build: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Producer: 'ABUUR Digital', Creator: 'ABUUR Digital' } });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    build(doc);
    doc.end();
  });
}

export function toPdf(r: Report, maxRows = 2000): Promise<Buffer> {
  return pdfBuffer((doc) => {
    doc.fontSize(16).font('Helvetica-Bold').text(r.title);
    doc.moveDown(0.3).fontSize(10).font('Helvetica')
      .text(r.businessName)
      .text(`Period: ${fmtDate(r.period.from)} to ${fmtDate(r.period.to)} (${r.period.label})`)
      .text(`Generated: ${r.generatedAt.toISOString().replace('T', ' ').slice(0, 16)} UTC`);
    doc.moveDown();
    for (const s of r.summary) doc.font('Helvetica-Bold').text(`${s.label}: `, { continued: true }).font('Helvetica').text(cell(s.value));
    doc.moveDown();
    const cols = r.columns.slice(0, 7);
    const width = (doc.page.width - 80) / cols.length;
    const drawRow = (vals: string[], bold = false) => {
      if (doc.y > doc.page.height - 60) doc.addPage();
      const y = doc.y;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
      vals.forEach((v, n) => doc.text(v.slice(0, 60), 40 + n * width, y, { width: width - 4, height: 22, ellipsis: true }));
      doc.y = y + 14;
    };
    drawRow(cols.map((c) => c.label), true);
    for (const row of r.rows.slice(0, maxRows)) drawRow(cols.map((c) => cell(row[c.key], c.type)));
    if (r.rows.length > maxRows) doc.moveDown().text(`… ${r.rows.length - maxRows} more rows: export as Excel or CSV for the full list.`, 40);
    if (r.columns.length > cols.length) doc.moveDown().text(`Showing ${cols.length} of ${r.columns.length} columns; Excel/CSV include all.`, 40);
    for (const n of r.notes ?? []) doc.moveDown(0.5).fontSize(8).text(n, 40);
  });
}

export function receiptPdf(r: {
  receiptNumber: string;
  business: { name: string; phone: string | null; email: string | null; address: string | null };
  customer: { name: string; phone: string | null; email: string | null } | null;
  amount: number;
  currency: string;
  method: string | null;
  reference: string | null;
  paidAt: Date | null;
  invoice: { number: string; total: number; paid: number; balance: number } | null;
}): Promise<Buffer> {
  return pdfBuffer((doc) => {
    doc.fontSize(18).font('Helvetica-Bold').text(r.business.name);
    doc.fontSize(9).font('Helvetica').text([r.business.address, r.business.phone, r.business.email].filter(Boolean).join(' · '));
    doc.moveDown().fontSize(14).font('Helvetica-Bold').text(`Payment receipt ${r.receiptNumber}`);
    doc.moveDown(0.5).fontSize(11).font('Helvetica');
    const line = (k: string, v: string | null | undefined) => v && doc.text(`${k}: ${v}`);
    line('Date', r.paidAt ? r.paidAt.toISOString().slice(0, 10) : null);
    line('Received from', r.customer?.name);
    line('Amount', `${r.amount.toFixed(2)} ${r.currency}`);
    line('Method', r.method);
    line('Reference', r.reference);
    if (r.invoice) {
      doc.moveDown(0.5);
      line('Invoice', r.invoice.number);
      line('Invoice total', r.invoice.total.toFixed(2));
      line('Paid to date', r.invoice.paid.toFixed(2));
      line('Balance', r.invoice.balance.toFixed(2));
    }
    doc.moveDown(2).fontSize(8).fillColor('#555').text('Issued with ABUUR Digital. This receipt records a payment confirmed by the business.');
  });
}
