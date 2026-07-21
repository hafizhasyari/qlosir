import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Account,
  Cart,
  PaymentMethod,
  Product,
  SessionTx,
  StockHist,
  StoreSettings,
  Transaction,
} from '../types';
import { fmt, nowTime } from '../lib/format';
import {
  buildSeedHist,
  buildSeedTx,
  DEMO_ACCOUNTS,
  DEMO_PRODUCTS,
  DEMO_SOLD,
  TODAY,
} from '../lib/seed';
import { computeTotals } from './selectors';

export const DEFAULT_STORE_NAME = 'Warung Pak Soleh';
export const LOW_STOCK_THRESHOLD = 5;
export const OTP_CODE = '247831';

// Payload for creating / editing a product (raw form values).
export interface ProductInput {
  name: string;
  sku: string;
  barcode: string;
  cat: string;
  unit: string;
  price: number;
  buy: number;
  stock?: number; // only for new products
}

type AuthError = 'notfound' | 'wrongpass' | 'exists' | null;

interface StoreState {
  // Auth
  accounts: Account[];
  loginPhone: string;
  authed: boolean; // password login passed
  unlocked: boolean; // till PIN passed

  // Domain
  products: Product[];
  hist: StockHist;
  sold: Record<number, number>;
  seedTx: Transaction[];
  sessionTx: SessionTx[];
  txCounter: number;
  lastTx: Transaction | null;
  lastLinkId: string | null;

  // Cart
  cart: Cart;

  // Settings
  settings: StoreSettings;

  // Connectivity
  online: boolean;
  pendingSync: number;
  syncing: boolean;

  // Global UI
  toast: string;

  // ---- actions ----
  showToast: (msg: string) => void;
  storeName: () => string;

  login: (phone: string, pass: string) => AuthError | 'ok';
  signup: (input: {
    nama: string;
    toko: string;
    phone: string;
    pass: string;
    pin: string;
  }) => 'exists' | 'ok';
  resetPassword: (phone: string, newPass: string) => void;
  verifyPin: (pin: string) => boolean;
  changePin: (oldPin: string, newPin: string) => 'wrongold' | 'same' | 'ok';
  lock: () => void;
  logout: () => void;

  addToCart: (id: number) => void;
  changeQty: (id: number, d: number) => void;
  setDisc: (id: number, disc: number) => 'toohigh' | 'ok';
  clearCart: () => void;
  checkout: (method: PaymentMethod, cashValue: number) => Transaction | null;
  openTxFromHistory: (tx: Transaction) => void;

  applyStock: (id: number, delta: number, title: string) => boolean;
  saveNewProduct: (input: ProductInput) => number;
  updateProduct: (id: number, input: ProductInput) => void;
  deleteProduct: (id: number) => void;

  toggleOnline: () => void;
  setSettings: (patch: Partial<StoreSettings>) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let syncTimer: ReturnType<typeof setTimeout> | undefined;

function initialsFor(name: string): string {
  const words = name.split(' ').filter(Boolean);
  return ((words[0] || '?')[0] + (words[1] ? words[1][0] : '')).toUpperCase();
}

function freshDemoState() {
  return {
    accounts: DEMO_ACCOUNTS,
    loginPhone: '081234567890',
    products: DEMO_PRODUCTS,
    hist: buildSeedHist(DEMO_PRODUCTS),
    sold: DEMO_SOLD,
    seedTx: buildSeedTx(DEMO_PRODUCTS),
    sessionTx: [] as SessionTx[],
    txCounter: 42,
    lastTx: null as Transaction | null,
    lastLinkId: null as string | null,
    cart: {} as Cart,
    settings: {
      name: null,
      addr: 'Jl. Melati No. 12, Bekasi',
      phone: '0812-3456-7890',
      paper: '58mm',
    } as StoreSettings,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...freshDemoState(),
      authed: false,
      unlocked: false,
      online: true,
      pendingSync: 0,
      syncing: false,
      toast: '',

      showToast: (msg) => {
        clearTimeout(toastTimer);
        set({ toast: msg });
        toastTimer = setTimeout(() => set({ toast: '' }), 2200);
      },

      storeName: () => get().settings.name ?? DEFAULT_STORE_NAME,

      login: (phoneRaw, pass) => {
        const phone = phoneRaw.replace(/\D/g, '');
        const acc = get().accounts.find((a) => a.phone === phone);
        if (!acc) return 'notfound';
        if (acc.pass !== pass) return 'wrongpass';
        set({ authed: true, unlocked: false, loginPhone: phone });
        return 'ok';
      },

      signup: (input) => {
        const phone = input.phone.replace(/\D/g, '');
        if (get().accounts.find((a) => a.phone === phone)) return 'exists';
        // New account starts with an empty store.
        set({
          accounts: [...get().accounts, { phone, pass: input.pass, pin: input.pin }],
          loginPhone: phone,
          authed: true,
          unlocked: false,
          products: [],
          hist: {},
          sold: {},
          seedTx: [],
          sessionTx: [],
          cart: {},
          settings: {
            name: input.toko.trim(),
            addr: 'Alamat toko belum diisi',
            phone: input.phone,
            paper: '58mm',
          },
        });
        return 'ok';
      },

      resetPassword: (phoneRaw, newPass) => {
        const phone = phoneRaw.replace(/\D/g, '');
        set({
          accounts: get().accounts.map((a) => (a.phone === phone ? { ...a, pass: newPass } : a)),
        });
      },

      verifyPin: (pin) => {
        const acc = get().accounts.find((a) => a.phone === get().loginPhone);
        const correct = acc ? acc.pin : '123456';
        if (pin === correct) {
          set({ unlocked: true });
          return true;
        }
        return false;
      },

      changePin: (oldPin, newPin) => {
        const { accounts, loginPhone } = get();
        const acc = accounts.find((a) => a.phone === loginPhone);
        const curPin = acc ? acc.pin : '123456';
        if (oldPin !== curPin) return 'wrongold';
        if (newPin === oldPin) return 'same';
        set({
          accounts: accounts.map((a) => (a.phone === loginPhone ? { ...a, pin: newPin } : a)),
        });
        return 'ok';
      },

      lock: () => set({ unlocked: false }),
      logout: () => set({ authed: false, unlocked: false, cart: {} }),

      addToCart: (id) => {
        const { products, cart, showToast } = get();
        const p = products.find((x) => x.id === id);
        if (!p) return;
        const line = cart[id] || { qty: 0, disc: 0 };
        if (p.stock === 0) {
          showToast('Stok habis — restock dulu');
          return;
        }
        if (line.qty >= p.stock) {
          showToast('Stok tidak cukup (sisa ' + p.stock + ')');
          return;
        }
        set({ cart: { ...cart, [id]: { ...line, qty: line.qty + 1 } } });
      },

      changeQty: (id, d) => {
        const { products, cart, showToast } = get();
        const p = products.find((x) => x.id === id);
        if (!p) return;
        const next = { ...cart };
        const line = { ...next[id] };
        line.qty += d;
        if (d > 0 && line.qty > p.stock) {
          showToast('Stok tidak cukup (sisa ' + p.stock + ')');
          return;
        }
        if (line.qty <= 0) delete next[id];
        else next[id] = line;
        set({ cart: next });
      },

      setDisc: (id, disc) => {
        const { products, cart, showToast } = get();
        const p = products.find((x) => x.id === id);
        const line = cart[id];
        if (!p || !line) return 'ok';
        const max = line.qty * p.price;
        if (disc > max) {
          showToast('Diskon melebihi harga item');
          return 'toohigh';
        }
        set({ cart: { ...cart, [id]: { ...line, disc } } });
        showToast(disc > 0 ? 'Diskon diterapkan ✓' : 'Diskon dihapus');
        return 'ok';
      },

      clearCart: () => set({ cart: {} }),

      checkout: (method, cashValue) => {
        const state = get();
        const t = computeTotals(state.products, state.cart);
        if (!t.lines.length) return null;
        const cash = method === 'cash' ? cashValue : t.total;
        if (method === 'cash' && cash < t.total) {
          state.showToast('Uang diterima masih kurang');
          return null;
        }
        const no = 'INV-20260718-00' + state.txCounter;
        const time = nowTime();
        const products = state.products.map((p) => ({ ...p }));
        const hist: StockHist = { ...state.hist };
        const sold = { ...state.sold };
        t.lines.forEach((l) => {
          const p = products.find((x) => x.id === l.p.id)!;
          p.stock -= l.qty;
          sold[p.id] = (sold[p.id] || 0) + l.qty;
          hist[p.id] = [
            { delta: -l.qty, title: 'Penjualan · ' + no, time: 'Hari ini, ' + time, remain: p.stock },
            ...(hist[p.id] || []),
          ];
        });
        const lastTx: Transaction = {
          no,
          time,
          method,
          total: t.total,
          cash,
          change: cash - t.total,
          date: { ...TODAY },
          dateNum: 20260619,
          items: t.lines.reduce((s, l) => s + l.qty, 0),
          lines: t.lines.map((l) => ({
            id: l.p.id,
            name: l.p.name,
            unit: l.p.unit,
            qty: l.qty,
            price: l.p.price,
            disc: l.disc,
            label: l.p.name + ' ×' + l.qty,
            hasDisc: l.disc > 0,
            grossF: (l.qty * l.p.price).toLocaleString('id-ID'),
            discF: '−' + l.disc.toLocaleString('id-ID'),
            amountF: l.lineTotal.toLocaleString('id-ID'),
          })),
        };
        const linkId = 'x' + state.txCounter + 'k2m';
        set({
          products,
          hist,
          sold,
          lastTx,
          lastLinkId: linkId,
          txCounter: state.txCounter + 1,
          sessionTx: [
            ...state.sessionTx,
            { method, total: t.total, items: lastTx.items, tx: lastTx },
          ],
          pendingSync: state.online ? state.pendingSync : state.pendingSync + 1,
          cart: {},
        });
        return lastTx;
      },

      openTxFromHistory: (tx) => set({ lastTx: tx, lastLinkId: 'x' + tx.no + 'k2m' }),

      applyStock: (id, delta, title) => {
        const { products: cur, hist: curHist, showToast } = get();
        const products = cur.map((p) => ({ ...p }));
        const p = products.find((x) => x.id === id);
        if (!p) return false;
        if (p.stock + delta < 0) {
          showToast('Jumlah melebihi stok tersisa (' + p.stock + ')');
          return false;
        }
        p.stock += delta;
        const hist: StockHist = { ...curHist };
        hist[id] = [
          { delta, title, time: 'Hari ini, ' + nowTime(), remain: p.stock },
          ...(hist[id] || []),
        ];
        set({ products, hist });
        showToast('Stok ' + (delta > 0 ? '+' : '') + delta + ' tersimpan ✓');
        return true;
      },

      saveNewProduct: (input) => {
        const state = get();
        const id = state.products.length ? Math.max(...state.products.map((p) => p.id)) + 1 : 1;
        const sku =
          input.sku.trim().toUpperCase() ||
          input.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() + '-0' + id;
        const stock = input.stock ?? 0;
        const hist: StockHist = { ...state.hist };
        hist[id] = [{ delta: stock, title: 'Stok awal', time: 'Hari ini, ' + nowTime(), remain: stock }];
        set({
          products: [
            ...state.products,
            {
              id,
              name: input.name.trim(),
              sku,
              barcode: input.barcode.trim(),
              cat: input.cat.trim(),
              unit: input.unit,
              price: input.price,
              buy: input.buy,
              stock,
              ini: initialsFor(input.name.trim()),
            },
          ],
          hist,
        });
        return id;
      },

      updateProduct: (id, input) => {
        set({
          products: get().products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  name: input.name.trim(),
                  sku: input.sku.trim().toUpperCase() || p.sku,
                  barcode: input.barcode.trim(),
                  cat: input.cat.trim(),
                  unit: input.unit,
                  price: input.price,
                  buy: input.buy,
                  ini: initialsFor(input.name.trim()),
                }
              : p,
          ),
        });
      },

      deleteProduct: (id) => {
        const { cart, hist, products } = get();
        const nextCart = { ...cart };
        delete nextCart[id];
        const nextHist = { ...hist };
        delete nextHist[id];
        set({ products: products.filter((p) => p.id !== id), cart: nextCart, hist: nextHist });
      },

      toggleOnline: () => {
        const { online, pendingSync, showToast } = get();
        if (online) {
          set({ online: false });
          showToast('Mode offline (simulasi) — jualan tetap jalan');
          return;
        }
        set({ online: true, syncing: pendingSync > 0 });
        if (pendingSync > 0) {
          clearTimeout(syncTimer);
          syncTimer = setTimeout(() => {
            set({ pendingSync: 0, syncing: false });
            showToast(pendingSync + ' transaksi tersinkron ke cloud ✓');
          }, 1800);
        }
      },

      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
    }),
    {
      name: 'qlosir-store',
      version: 1,
      // Persist domain data only; transient UI/connectivity resets each load.
      partialize: (s) => ({
        accounts: s.accounts,
        loginPhone: s.loginPhone,
        products: s.products,
        hist: s.hist,
        sold: s.sold,
        seedTx: s.seedTx,
        sessionTx: s.sessionTx,
        txCounter: s.txCounter,
        lastTx: s.lastTx,
        lastLinkId: s.lastLinkId,
        settings: s.settings,
      }),
    },
  ),
);

// Formatting helper re-exported for convenience in screens.
export { fmt };
