import type { CalDate, Cart, Product, SessionTx, Totals, Transaction } from '../types';
import { num } from '../lib/format';

// Cart totals — ported from the prototype's totals().
export function computeTotals(products: Product[], cart: Cart): Totals {
  const lines = Object.entries(cart).map(([id, l]) => {
    const p = products.find((x) => x.id === +id)!;
    return { p, qty: l.qty, disc: l.disc, lineTotal: l.qty * p.price - l.disc };
  });
  const subtotal = lines.reduce((s, l) => s + l.qty * l.p.price, 0);
  const discount = lines.reduce((s, l) => s + l.disc, 0);
  return { lines, subtotal, discount, total: subtotal - discount };
}

// All transactions (seed + this session) newest-first.
export function allTransactions(seedTx: Transaction[], sessionTx: SessionTx[]): Transaction[] {
  return [...seedTx, ...sessionTx.filter((x) => x.tx).map((x) => x.tx)];
}

export interface ReportAgg {
  cash: number;
  qris: number;
  total: number;
  txCount: number;
  items: number;
  cashPct: number;
  tops: { name: string; unit: string; qy: number }[];
  maxQ: number;
}

// Aggregate a report over the transactions falling in [start, end].
export function aggregateReport(
  txs: Transaction[],
  start: CalDate | null,
  end: CalDate | null,
): ReportAgg {
  const rs = num(start);
  const re = num(end);
  const inRange = txs.filter((x) => (!rs || x.dateNum >= rs) && (!re || x.dateNum <= re));
  const cash = inRange.filter((x) => x.method === 'cash').reduce((s, x) => s + x.total, 0);
  const qris = inRange.filter((x) => x.method === 'qris').reduce((s, x) => s + x.total, 0);
  const total = cash + qris;
  const txCount = inRange.length;
  const items = inRange.reduce((s, x) => s + x.items, 0);
  const cashPct = total > 0 ? Math.round((cash / total) * 100) : 0;

  const agg: Record<number, { name: string; unit: string; qy: number }> = {};
  inRange.forEach((x) =>
    (x.lines || []).forEach((l) => {
      if (!agg[l.id]) agg[l.id] = { name: l.name, unit: l.unit, qy: 0 };
      agg[l.id].qy += l.qty;
    }),
  );
  const tops = Object.values(agg)
    .sort((a, b) => b.qy - a.qy)
    .slice(0, 4);
  const maxQ = tops.length ? tops[0].qy : 1;

  return { cash, qris, total, txCount, items, cashPct, tops, maxQ };
}

// Low-stock / out-of-stock counts for the products screen alert.
export function stockCounts(products: Product[], threshold: number) {
  const out = products.filter((p) => p.stock === 0).length;
  const low = products.filter((p) => p.stock > 0 && p.stock <= threshold).length;
  return { out, low };
}

export interface CalCell {
  label: string;
  date: CalDate | null;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
}

// Build the 7-column month grid for the range calendars.
export function buildCalendarCells(
  y: number,
  m: number,
  start: CalDate | null,
  end: CalDate | null,
): CalCell[] {
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const s = num(start);
  const e = num(end);
  const cells: CalCell[] = [];
  for (let i = 0; i < first; i++)
    cells.push({ label: '', date: null, isStart: false, isEnd: false, inRange: false });
  for (let d = 1; d <= days; d++) {
    const cur = { y, m, d };
    const n = num(cur)!;
    cells.push({
      label: String(d),
      date: cur,
      isStart: n === s,
      isEnd: n === e,
      inRange: !!(s && e && n > s && n < e),
    });
  }
  return cells;
}

// Range-picker click logic — ported from pickCal()/pickRepCal().
export function pickRange(
  start: CalDate | null,
  end: CalDate | null,
  d: CalDate,
): { start: CalDate | null; end: CalDate | null } {
  if (!start || (start && end)) return { start: d, end: null };
  if (num(d)! < num(start)!) return { start: d, end: start };
  return { start, end: d };
}
