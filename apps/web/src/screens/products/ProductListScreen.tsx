import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, LOW_STOCK_THRESHOLD } from '../../store/useStore';
import { stockCounts } from '../../store/selectors';
import { fmt } from '../../lib/format';
import { Icon } from '../../components/Icon';

// PRODUK & STOK — searchable product list sorted stock-ascending (so low/out
// float up), a low-stock alert banner, and a FAB to add.
export function ProductListScreen() {
  const nav = useNavigate();
  const products = useStore((s) => s.products);
  const showToast = useStore((s) => s.showToast);

  const [searchP, setSearchP] = useState('');

  const q = searchP.toLowerCase();
  const rows = products
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    .slice()
    .sort((a, b) => a.stock - b.stock);

  const { out, low } = stockCounts(products, LOW_STOCK_THRESHOLD);
  const hasAlert = out + low > 0;
  const alertText =
    (out ? out + ' produk habis' : '') +
    (out && low ? ', ' : '') +
    (low ? low + ' produk stok menipis' : '');

  const storeEmpty = products.length === 0;
  const noMatch = !storeEmpty && rows.length === 0;

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-products"
    >
      <div className="flex flex-none flex-col gap-3 bg-brand px-5 pt-4 pb-[14px]">
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-extrabold text-cream">Produk &amp; Stok</span>
          <div
            onClick={() => showToast('Import CSV — pilih file (mock)')}
            className="flex cursor-pointer items-center gap-[6px] rounded-[10px] px-3 py-2 text-[12px] font-bold text-cream"
            style={{ background: 'rgba(244,241,234,.12)' }}
          >
            <Icon name="download" size={15} color="#F4F1EA" strokeWidth={2.2} />
            Import CSV
          </div>
        </div>
        <input
          value={searchP}
          onChange={(e) => setSearchP(e.target.value)}
          placeholder="Cari produk…"
          data-testid="product-search"
          className="box-border h-12 w-full rounded-[14px] border-none bg-cream px-4 text-[14px] text-ink"
        />
      </div>

      {hasAlert && (
        <div
          className="mx-5 mt-3 flex flex-none items-center gap-[10px] rounded-[14px] border-[1.5px] border-[rgba(198,67,45,.3)] bg-tint-red px-[14px] py-3"
          data-testid="stock-alert"
        >
          <span className="text-[16px]">⚠️</span>
          <div className="flex-1 text-[12.5px] font-bold leading-[1.4] text-danger-dark">
            {alertText}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto px-5 pt-3 pb-[90px]">
        {storeEmpty && (
          <div className="flex flex-col items-center gap-3 px-6 py-9 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-tint">
              <Icon name="box" size={26} color="#0E6B39" strokeWidth={2} />
            </div>
            <div className="text-[14px] font-extrabold">Belum ada produk</div>
            <div className="text-[12.5px] font-semibold leading-[1.55] text-muted">
              Tap tombol + di kanan bawah untuk tambah produk.
            </div>
          </div>
        )}
        {noMatch && (
          <div className="px-5 py-9 text-center text-[13px] font-semibold text-muted">
            Nggak ketemu produk dengan kata itu.
          </div>
        )}
        {rows.map((p) => {
          const badgeStyle =
            p.stock === 0
              ? { background: '#FDECE7', color: '#C6432D' }
              : p.stock <= LOW_STOCK_THRESHOLD
                ? { background: '#FDF3E1', color: '#9A6A0B' }
                : { background: '#E4F3E8', color: '#0E6B39' };
          return (
            <div
              key={p.id}
              onClick={() => nav('/products/' + p.id)}
              data-testid={`product-row-${p.id}`}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[rgba(23,37,28,.06)] bg-white p-[12px_14px]"
            >
              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-page text-[15px] font-extrabold text-muted-3">
                {p.ini}
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold">{p.name}</div>
                <div className="text-[11px] font-semibold text-muted">
                  {'SKU ' + p.sku + ' · ' + fmt(p.price)}
                </div>
              </div>
              <div className="rounded-lg px-[10px] py-[5px] text-[11px] font-extrabold" style={badgeStyle}>
                {p.stock === 0 ? 'Habis' : 'Stok ' + p.stock}
              </div>
            </div>
          );
        })}
      </div>

      <div
        onClick={() => nav('/products/new')}
        data-testid="product-add-fab"
        className="absolute right-5 bottom-5 flex h-14 w-14 cursor-pointer items-center justify-center rounded-[18px] bg-warning text-ink"
        style={{ boxShadow: '0 8px 20px rgba(232,160,32,.4)' }}
      >
        <Icon name="plus" size={24} strokeWidth={2.6} />
      </div>
    </div>
  );
}
