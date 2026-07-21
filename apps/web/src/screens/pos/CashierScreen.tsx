import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, LOW_STOCK_THRESHOLD } from '../../store/useStore';
import { computeTotals } from '../../store/selectors';
import { fmt } from '../../lib/format';
import { Icon } from '../../components/Icon';
import { ScanSheet } from '../../overlays/ScanSheet';

// KASIR — the primary sell screen. Search + category filter over the product
// grid, tap-to-add, a running cart bar, and the barcode scanner overlay.
export function CashierScreen() {
  const nav = useNavigate();
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const online = useStore((s) => s.online);
  const storeName = useStore((s) => s.storeName());
  const addToCart = useStore((s) => s.addToCart);
  const toggleOnline = useStore((s) => s.toggleOnline);
  const showToast = useStore((s) => s.showToast);

  const [searchQ, setSearchQ] = useState('');
  const [cat, setCat] = useState('Semua');
  const [scanning, setScanning] = useState(false);

  const cats = useMemo(
    () => ['Semua', ...new Set(products.map((p) => p.cat).filter(Boolean))],
    [products],
  );

  const q = searchQ.toLowerCase();
  const prods = products.filter(
    (p) =>
      (cat === 'Semua' || p.cat === cat) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
  );

  const totals = computeTotals(products, cart);
  const cartCount = totals.lines.reduce((s, l) => s + l.qty, 0);
  const hasCart = totals.lines.length > 0;

  const storeEmpty = products.length === 0;
  const noMatch = !storeEmpty && prods.length === 0;

  // Scanner simulation — mirrors the prototype's simScanHit / simScanMiss.
  const scanHit = () => {
    const withBc = products.filter((p) => p.barcode);
    setScanning(false);
    if (!withBc.length) {
      showToast('Belum ada produk berbarcode');
      return;
    }
    const p = withBc[Math.floor(Math.random() * withBc.length)];
    addToCart(p.id);
    if (p.stock > 0) showToast(p.name + ' ditambahkan ke cart ✓');
  };
  const scanMiss = () => {
    const fake = String(8990000000000 + Math.floor(Math.random() * 8999999));
    setScanning(false);
    nav('/products/new', { state: { barcode: fake } });
    showToast('Barcode ' + fake + ' belum terdaftar — tambah produk');
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-cashier"
    >
      <div className="flex flex-none flex-col gap-3 bg-brand px-5 pt-4 pb-[14px]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11.5px] font-semibold text-[rgba(244,241,234,.65)]">
              Jumat, 18 Jul 2026
            </div>
            <div className="text-[18px] font-extrabold tracking-[-0.3px] text-cream">
              {storeName}
            </div>
          </div>
          <div
            onClick={toggleOnline}
            data-testid="conn-toggle"
            className="flex cursor-pointer items-center gap-[6px] rounded-full px-3 py-[6px]"
            style={{ background: 'rgba(244,241,234,.12)' }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: online ? '#7BD98A' : '#E8A020' }}
            />
            <span className="text-[11.5px] font-semibold text-cream">
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex gap-[10px]">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Cari produk atau SKU…"
            data-testid="cashier-search"
            className="box-border h-12 flex-1 rounded-[14px] border-none bg-cream px-4 text-[14px] text-ink"
          />
          <div
            onClick={() => setScanning(true)}
            data-testid="cashier-scan"
            className="flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-[14px] bg-warning"
          >
            <Icon name="scan" size={22} color="#17251C" strokeWidth={2.2} />
          </div>
        </div>
      </div>

      <div className="flex flex-none gap-2 overflow-x-auto px-5 pt-3 pb-1">
        {cats.map((name) => {
          const active = cat === name;
          return (
            <div
              key={name}
              onClick={() => setCat(name)}
              data-testid={`cat-${name}`}
              className="flex h-9 flex-none cursor-pointer items-center rounded-full px-4 text-[12.5px]"
              style={
                active
                  ? { background: '#17251C', color: '#F4F1EA', fontWeight: 700 }
                  : {
                      background: '#fff',
                      color: '#4A5850',
                      fontWeight: 600,
                      border: '1px solid rgba(23,37,28,.08)',
                    }
              }
            >
              {name}
            </div>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-2">
        {storeEmpty && (
          <div
            className="mt-3 flex flex-col items-center gap-[14px] rounded-[20px] border border-[rgba(23,37,28,.06)] bg-white px-[22px] py-7 text-center"
            data-testid="cashier-empty"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-tint">
              <Icon name="box" size={30} color="#0E6B39" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[16px] font-extrabold">Toko kamu masih kosong</div>
              <div className="mt-1 text-[12.5px] font-semibold leading-[1.55] text-muted">
                Isi dulu produknya biar bisa mulai jualan.
              </div>
            </div>
            <div
              onClick={() => nav('/products/new')}
              className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-brand text-[14px] font-extrabold text-cream"
            >
              <Icon name="plus" size={14} strokeWidth={3} />
              Tambah Produk Pertama
            </div>
          </div>
        )}

        {noMatch && (
          <div
            className="px-5 py-9 text-center text-[13px] font-semibold leading-[1.6] text-muted"
            data-testid="cashier-nomatch"
          >
            Nggak ada produk yang cocok.
            <br />
            Coba kata kunci atau kategori lain.
          </div>
        )}

        <div className="grid grid-cols-2 content-start gap-3">
          {prods.map((p) => {
            const low = p.stock <= LOW_STOCK_THRESHOLD;
            return (
              <div
                key={p.id}
                className="flex flex-col gap-2 rounded-2xl border border-[rgba(23,37,28,.06)] bg-white p-3"
                data-testid={`product-card-${p.id}`}
              >
                <div className="flex h-14 items-center justify-center rounded-[10px] bg-page text-[18px] font-extrabold text-muted-3">
                  {p.ini}
                </div>
                <div className="min-h-[32px] text-[13px] font-bold leading-[1.25]">{p.name}</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-extrabold text-brand">{fmt(p.price)}</div>
                    <div
                      className="text-[10.5px]"
                      style={{ fontWeight: low ? 700 : 600, color: low ? '#C6432D' : '#7A857E' }}
                    >
                      {p.stock === 0 ? 'Habis' : 'Stok ' + p.stock + (low ? ' ⚠' : '')}
                    </div>
                  </div>
                  <div
                    onClick={() => addToCart(p.id)}
                    data-testid={`add-${p.id}`}
                    className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px]"
                    style={
                      p.stock === 0
                        ? { background: '#D8D2C4', color: '#fff' }
                        : { background: '#0E6B39', color: '#F4F1EA' }
                    }
                  >
                    <Icon name="plus" size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hasCart && (
        <div className="flex-none px-5 pb-3">
          <div
            onClick={() => nav('/cart')}
            data-testid="cart-bar"
            className="flex h-14 cursor-pointer items-center justify-between rounded-2xl bg-ink px-[18px]"
            style={{ boxShadow: '0 6px 18px rgba(23,37,28,.25)' }}
          >
            <div className="flex items-center gap-[10px]">
              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-warning text-[13px] font-extrabold text-ink">
                {cartCount}
              </div>
              <span className="text-[15px] font-extrabold text-cream">{fmt(totals.total)}</span>
            </div>
            <span className="text-[13.5px] font-bold text-success">Lihat Cart →</span>
          </div>
        </div>
      )}

      {scanning && (
        <ScanSheet onHit={scanHit} onMiss={scanMiss} onClose={() => setScanning(false)} />
      )}
    </div>
  );
}
