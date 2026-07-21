// Domain types for Qlosir. Field names mirror the prototype's mock data and the
// PRD data model so a real REST API can slot in later without renaming.

export interface Account {
  phone: string; // digits only, e.g. "081234567890"
  pass: string;
  pin: string; // 6 digits
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string; // "" when none
  cat: string; // free-text category
  unit: string; // pcs, btl, bks, ltr, kg, sct, sak, tbg, custom
  price: number; // sell price
  buy: number; // cost price
  stock: number;
  ini: string; // 2-letter avatar initials
}

export interface StockHistEntry {
  delta: number; // +/-
  title: string; // e.g. "Restock · Agen X", "Penjualan · INV-…"
  time: string; // human label, e.g. "Hari ini, 13:58"
  remain: number; // stock after the change
}

export type StockHist = Record<number, StockHistEntry[]>;

export type PaymentMethod = 'cash' | 'qris';

export interface CalDate {
  y: number;
  m: number; // 0-based month
  d: number;
}

// A single line within a transaction (denormalised, with preformatted fields
// used directly by the receipt / history views).
export interface TxLine {
  id: number;
  name: string;
  unit: string;
  qty: number;
  price: number;
  disc: number;
  label: string; // "Name ×qty"
  hasDisc: boolean;
  grossF: string; // formatted gross (qty*price)
  discF: string; // formatted discount "−n"
  amountF: string; // formatted line total
}

export interface Transaction {
  no: string; // INV-YYYYMMDD-00N
  time: string; // "HH:MM"
  method: PaymentMethod;
  total: number;
  cash: number;
  change: number;
  items: number; // total item count
  lines: TxLine[];
  date: CalDate;
  dateNum: number; // y*10000 + m*100 + d — for range filtering
}

// Wrapper stored in the session log (mirrors the prototype's sessionTx shape).
export interface SessionTx {
  method: PaymentMethod;
  total: number;
  items: number;
  tx: Transaction;
}

export interface CartLine {
  qty: number;
  disc: number;
}

export type Cart = Record<number, CartLine>;

export interface StoreSettings {
  name: string | null; // null falls back to default store name
  addr: string;
  phone: string;
  paper: '58mm' | '80mm';
}

// Cart totals computed from products + cart.
export interface Totals {
  lines: { p: Product; qty: number; disc: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
}
