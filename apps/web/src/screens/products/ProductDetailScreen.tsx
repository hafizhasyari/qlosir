import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore, LOW_STOCK_THRESHOLD } from '../../store/useStore';
import { fmt } from '../../lib/format';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/Modal';
import { StockSheet } from '../../overlays/StockSheet';

// DETAIL PRODUK — product summary, stock actions (restock/adjust), edit/delete,
// barcode, and the per-product stock history feed.
export function ProductDetailScreen() {
  const { id } = useParams();
  const nav = useNavigate();
  const product = useStore((s) => s.products.find((p) => p.id === Number(id)));
  const hist = useStore((s) => (product ? s.hist[product.id] : undefined));
  const deleteProduct = useStore((s) => s.deleteProduct);
  const showToast = useStore((s) => s.showToast);

  const [sheet, setSheet] = useState<'restock' | 'adjust' | null>(null);
  const [delOpen, setDelOpen] = useState(false);

  if (!product) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-[15px] font-bold text-muted">Produk tidak ditemukan.</div>
        <div
          onClick={() => nav('/products')}
          className="cursor-pointer text-[13.5px] font-extrabold text-brand"
        >
          Kembali ke Produk →
        </div>
      </div>
    );
  }

  const thr = LOW_STOCK_THRESHOLD;
  const stockColor = product.stock === 0 ? '#C6432D' : product.stock <= thr ? '#9A6A0B' : '#17251C';

  const doDelete = () => {
    const name = product.name;
    deleteProduct(product.id);
    setDelOpen(false);
    showToast('Produk "' + name + '" dihapus');
    nav('/products');
  };

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-product-detail"
    >
      <div
        onClick={() => nav('/products')}
        className="flex flex-none cursor-pointer items-center gap-3 bg-brand px-5 py-[18px]"
      >
        <Icon name="back" size={22} color="#F4F1EA" strokeWidth={2.4} />
        <span className="text-[17px] font-extrabold text-cream">{product.name}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-5 py-4">
        <div className="flex items-center gap-4 rounded-[18px] border border-[rgba(23,37,28,.06)] bg-white p-[18px]">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[14px] bg-page text-[20px] font-extrabold text-muted-3">
            {product.ini}
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold text-muted">
              {'SKU ' + product.sku + ' · ' + product.cat + ' · ' + product.unit}
            </div>
            <div className="mt-1 flex gap-[14px]">
              <div>
                <div className="text-[10.5px] font-semibold text-muted">Jual</div>
                <div className="text-[14px] font-extrabold text-brand">{fmt(product.price)}</div>
              </div>
              <div>
                <div className="text-[10.5px] font-semibold text-muted">Beli</div>
                <div className="text-[14px] font-extrabold">{fmt(product.buy)}</div>
              </div>
              <div>
                <div className="text-[10.5px] font-semibold text-muted">Stok</div>
                <div className="text-[14px] font-extrabold" style={{ color: stockColor }} data-testid="detail-stock">
                  {String(product.stock) + (product.stock <= thr ? ' ⚠' : '')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-[10px]">
          <div
            onClick={() => setSheet('restock')}
            data-testid="open-restock"
            className="flex h-[50px] flex-1 cursor-pointer items-center justify-center gap-[7px] rounded-[14px] bg-brand text-[14px] font-extrabold text-cream"
          >
            <Icon name="plus" size={14} strokeWidth={3} />
            Restock
          </div>
          <div
            onClick={() => setSheet('adjust')}
            data-testid="open-adjust"
            className="box-border flex h-[50px] flex-1 cursor-pointer items-center justify-center rounded-[14px] border-2 border-[rgba(23,37,28,.12)] bg-white text-[14px] font-extrabold text-ink"
          >
            Adjustment
          </div>
        </div>

        <div className="flex gap-[10px]">
          <div
            onClick={() => nav('/products/' + product.id + '/edit')}
            data-testid="open-edit"
            className="box-border flex h-[50px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] border-2 border-[rgba(23,37,28,.12)] bg-white text-[14px] font-extrabold text-ink"
          >
            <Icon name="edit" size={15} strokeWidth={2.2} />
            Edit Produk
          </div>
          <div
            onClick={() => setDelOpen(true)}
            data-testid="open-delete"
            className="box-border flex h-[50px] w-[50px] flex-none cursor-pointer items-center justify-center rounded-[14px] border-2 border-[rgba(198,67,45,.25)] bg-tint-red text-danger"
          >
            <Icon name="trash" size={17} strokeWidth={2.2} />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[14px] border border-[rgba(23,37,28,.06)] bg-white p-[13px_14px]">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-page">
            <Icon name="barcode" size={19} color="#4A5850" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-bold text-muted">BARCODE</div>
            <div
              className="text-[13.5px] font-extrabold tracking-[.5px]"
              style={{ color: product.barcode ? '#17251C' : '#B8B2A4' }}
            >
              {product.barcode || 'Belum ada barcode'}
            </div>
          </div>
          <div
            onClick={() => nav('/products/' + product.id + '/edit')}
            className="flex h-[34px] flex-none cursor-pointer items-center rounded-[10px] bg-tint px-[14px] text-[12px] font-extrabold text-brand"
          >
            {product.barcode ? 'Ganti' : 'Scan'}
          </div>
        </div>

        <div className="mt-[2px] text-[13px] font-extrabold text-ink-soft">Riwayat perubahan stok</div>
        <div className="flex flex-col gap-2">
          {(hist || []).map((h, i) => {
            const dStyle = h.delta > 0
              ? { background: '#E4F3E8', color: '#0E6B39' }
              : h.title.startsWith('Adjustment')
                ? { background: '#FDF3E1', color: '#9A6A0B' }
                : { background: '#FDECE7', color: '#C6432D' };
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-[14px] border border-[rgba(23,37,28,.06)] bg-white p-[12px_14px]"
              >
                <div
                  className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] text-[13px] font-extrabold"
                  style={dStyle}
                >
                  {(h.delta > 0 ? '+' : '') + h.delta}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold">{h.title}</div>
                  <div className="text-[11px] font-semibold text-muted">{h.time}</div>
                </div>
                <div className="text-[12px] font-extrabold text-muted">{'sisa ' + h.remain}</div>
              </div>
            );
          })}
        </div>
      </div>

      {sheet && <StockSheet mode={sheet} product={product} onClose={() => setSheet(null)} />}

      {delOpen && (
        <Modal testId="delete-modal">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-tint-red">
            <Icon name="trash" size={20} color="#C6432D" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[16px] font-extrabold">Hapus {product.name}?</div>
            <div className="mt-1 text-[12.5px] font-semibold leading-[1.5] text-muted">
              Produk dan riwayat stoknya hilang permanen. Transaksi lama tidak berubah.
            </div>
          </div>
          <div className="flex gap-[10px]">
            <div
              onClick={() => setDelOpen(false)}
              className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-[14px] bg-cream text-[13.5px] font-extrabold text-ink"
            >
              Batal
            </div>
            <div
              onClick={doDelete}
              data-testid="confirm-delete"
              className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-[14px] bg-danger text-[13.5px] font-extrabold text-white"
            >
              Ya, Hapus
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
