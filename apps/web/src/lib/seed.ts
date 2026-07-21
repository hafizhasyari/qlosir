import type { Account, Product, StockHist, Transaction } from '../types';

// Seed data ported verbatim from the prototype's Component constructor.
// The transaction seed uses a deterministic LCG so the demo (reports, date
// filters, payment mix) is stable across reloads.

export const DEMO_PRODUCTS: Product[] = [
  { id: 1, name: 'Indomie Goreng', sku: 'IDM-001', barcode: '8992388101010', cat: 'Sembako', unit: 'pcs', price: 3500, buy: 3100, stock: 48, ini: 'IG' },
  { id: 2, name: 'Aqua 600ml', sku: 'AQA-001', barcode: '8886008101020', cat: 'Minuman', unit: 'btl', price: 4000, buy: 3400, stock: 30, ini: 'AQ' },
  { id: 3, name: 'Sampoerna Mild 16', sku: 'SMP-016', barcode: '8992770101030', cat: 'Rokok', unit: 'bks', price: 32000, buy: 30200, stock: 12, ini: 'SM' },
  { id: 4, name: 'Minyak Goreng 1L', sku: 'MYK-001', barcode: '8991002101040', cat: 'Sembako', unit: 'ltr', price: 17500, buy: 15800, stock: 3, ini: 'MG' },
  { id: 5, name: 'Teh Pucuk 350ml', sku: 'THP-001', barcode: '8993675101050', cat: 'Minuman', unit: 'btl', price: 4500, buy: 3800, stock: 24, ini: 'TP' },
  { id: 6, name: 'Kopi Kapal Api', sku: 'KKA-001', barcode: '8991234101060', cat: 'Sembako', unit: 'sct', price: 2000, buy: 1600, stock: 60, ini: 'KA' },
  { id: 7, name: 'Beras Ramos 5kg', sku: 'BRS-005', barcode: '8990001101070', cat: 'Sembako', unit: 'sak', price: 68000, buy: 63000, stock: 15, ini: 'BR' },
  { id: 8, name: 'Chitato 68g', sku: 'CHT-001', barcode: '8992388101080', cat: 'Snack', unit: 'pcs', price: 12500, buy: 10900, stock: 18, ini: 'CH' },
  { id: 9, name: 'Gas LPG 3kg', sku: 'GAS-003', barcode: '8990009101090', cat: 'Sembako', unit: 'tbg', price: 22000, buy: 20000, stock: 0, ini: 'GP' },
  { id: 10, name: 'Telur Ayam 1kg', sku: 'TLR-001', barcode: '8990010101100', cat: 'Sembako', unit: 'kg', price: 28000, buy: 25500, stock: 4, ini: 'TL' },
  { id: 11, name: 'Le Minerale 600ml', sku: 'LMN-001', barcode: '8994566101110', cat: 'Minuman', unit: 'btl', price: 4000, buy: 3300, stock: 26, ini: 'LM' },
  { id: 12, name: 'Roma Kelapa', sku: 'RMK-001', barcode: '8998877101120', cat: 'Snack', unit: 'pcs', price: 10000, buy: 8700, stock: 20, ini: 'RK' },
];

export const DEMO_ACCOUNTS: Account[] = [{ phone: '081234567890', pass: 'warung123', pin: '123456' }];

export const DEMO_SOLD: Record<number, number> = { 1: 28, 2: 20, 6: 18, 3: 9 };

// Per-product stock history seed (matches the prototype; product 4 has a
// detailed multi-entry history).
export function buildSeedHist(products: Product[]): StockHist {
  const hist: StockHist = {};
  products.forEach((p) => {
    hist[p.id] = [
      { delta: +p.stock + 8, title: 'Stok awal / restock', time: 'Senin, 08:40', remain: p.stock + 8 },
    ];
  });
  hist[4] = [
    { delta: -1, title: 'Penjualan · INV-0041', time: 'Hari ini, 13:58', remain: 3 },
    { delta: -2, title: 'Penjualan · INV-0038', time: 'Hari ini, 10:21', remain: 4 },
    { delta: -1, title: 'Adjustment · kemasan rusak', time: 'Kemarin, 19:02', remain: 6 },
    { delta: +12, title: 'Restock · Agen Sinar Jaya', time: 'Senin, 08:40', remain: 7 },
  ];
  return hist;
}

// ~1 month of seeded transactions (19 Jun – 19 Jul 2026) for reports, date
// filter, payment breakdown and discount validation. Deterministic LCG.
export function buildSeedTx(products: Product[]): Transaction[] {
  let rs = 20260619;
  const rnd = () => {
    rs = (rs * 1103515245 + 12345) & 0x7fffffff;
    return rs / 0x7fffffff;
  };
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

  const seedTx: Transaction[] = [];
  let ctr = 1;
  const days: { y: number; m: number; d: number }[] = [];
  for (let d = 19; d <= 30; d++) days.push({ y: 2026, m: 5, d });
  for (let d = 1; d <= 19; d++) days.push({ y: 2026, m: 6, d });

  days.forEach((day) => {
    const nTx = 2 + Math.floor(rnd() * 5);
    for (let i = 0; i < nTx; i++) {
      const nLines = 1 + Math.floor(rnd() * 3);
      const used: Record<number, number> = {};
      const lines: Transaction['lines'] = [];
      let total = 0;
      let itemCount = 0;
      for (let j = 0; j < nLines; j++) {
        const p = pick(products);
        if (used[p.id]) continue;
        used[p.id] = 1;
        const qty = 1 + Math.floor(rnd() * 3);
        const disc = rnd() < 0.24 ? pick([500, 1000, 2000]) : 0;
        const lineTotal = qty * p.price - disc;
        total += lineTotal;
        itemCount += qty;
        lines.push({
          id: p.id,
          name: p.name,
          unit: p.unit,
          qty,
          price: p.price,
          disc,
          label: p.name + ' ×' + qty,
          hasDisc: disc > 0,
          grossF: (qty * p.price).toLocaleString('id-ID'),
          discF: '−' + disc.toLocaleString('id-ID'),
          amountF: lineTotal.toLocaleString('id-ID'),
        });
      }
      if (!lines.length) continue;
      const method = rnd() < 0.62 ? 'cash' : 'qris';
      const cash =
        method === 'cash' ? Math.ceil(total / 5000) * 5000 + (rnd() < 0.3 ? 5000 : 0) : total;
      const time =
        String(8 + Math.floor(rnd() * 11)).padStart(2, '0') +
        ':' +
        String(Math.floor(rnd() * 60)).padStart(2, '0');
      const no =
        'INV-2026' +
        String(day.m + 1).padStart(2, '0') +
        String(day.d).padStart(2, '0') +
        '-' +
        String(ctr++).padStart(4, '0');
      seedTx.push({
        no,
        time,
        method,
        total,
        cash,
        change: cash - total,
        items: itemCount,
        lines,
        date: day,
        dateNum: day.y * 10000 + day.m * 100 + day.d,
      });
    }
  });
  return seedTx;
}

// Base date the demo is anchored to ("today" in the prototype = 19 Jul 2026).
export const TODAY = { y: 2026, m: 6, d: 19 };
