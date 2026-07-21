import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { computeTotals } from '../../store/selectors';
import { fmt } from '../../lib/format';
import { Icon } from '../../components/Icon';
import { DiscountSheet } from '../../overlays/DiscountSheet';

// CART — review lines, adjust qty, apply per-line discounts, pick payment.
export function CartScreen() {
  const nav = useNavigate();
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const changeQty = useStore((s) => s.changeQty);
  const showToast = useStore((s) => s.showToast);

  const [discId, setDiscId] = useState<number | null>(null);

  const totals = computeTotals(products, cart);
  const cartCount = totals.lines.reduce((s, l) => s + l.qty, 0);
  const empty = totals.lines.length === 0;

  const goPay = (path: string) => {
    if (empty) {
      showToast('Cart masih kosong');
      return;
    }
    nav(path);
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-cart"
    >
      <div
        onClick={() => nav('/cashier')}
        className="flex flex-none cursor-pointer items-center gap-3 bg-brand px-5 py-[18px]"
      >
        <Icon name="back" size={22} color="#F4F1EA" strokeWidth={2.4} />
        <span className="text-[17px] font-extrabold text-cream">Cart · {cartCount} item</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto px-5 py-4">
        {empty && (
          <div className="py-10 text-center text-[13px] font-semibold text-muted">
            Cart kosong — balik ke Kasir buat tambah produk.
          </div>
        )}
        {totals.lines.map((l) => (
          <div
            key={l.p.id}
            className="flex flex-col gap-[10px] rounded-2xl border border-[rgba(23,37,28,.06)] bg-white p-[14px]"
            data-testid={`cart-line-${l.p.id}`}
          >
            <div className="flex justify-between gap-[10px]">
              <div>
                <div className="text-[14px] font-bold">{l.p.name}</div>
                <div className="text-[12px] font-semibold text-muted">
                  {fmt(l.p.price) + ' / ' + l.p.unit}
                </div>
              </div>
              <div className="text-[14px] font-extrabold">{fmt(l.lineTotal)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div
                onClick={() => setDiscId(l.p.id)}
                data-testid={`disc-toggle-${l.p.id}`}
                className="cursor-pointer text-[12px] font-bold"
                style={
                  l.disc
                    ? { background: '#FDF3E1', borderRadius: 8, padding: '4px 8px', color: '#9A6A0B' }
                    : { color: '#0E6B39' }
                }
              >
                {l.disc ? 'Diskon −' + fmt(l.disc) + ' ✎' : '+ Diskon item'}
              </div>
              <div className="flex items-center gap-[14px] rounded-xl bg-cream px-[10px] py-[6px]">
                <div
                  onClick={() => changeQty(l.p.id, -1)}
                  data-testid={`qty-dec-${l.p.id}`}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[9px] border border-[rgba(23,37,28,.1)] bg-white text-ink"
                >
                  <Icon name="minus" size={13} strokeWidth={3} />
                </div>
                <span className="min-w-[18px] text-center text-[15px] font-extrabold">{l.qty}</span>
                <div
                  onClick={() => changeQty(l.p.id, 1)}
                  data-testid={`qty-inc-${l.p.id}`}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[9px] bg-brand text-cream"
                >
                  <Icon name="plus" size={13} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex flex-none flex-col gap-[14px] rounded-t-[24px] bg-white px-5 pt-[18px] pb-[22px]"
        style={{ boxShadow: '0 -6px 24px rgba(23,37,28,.08)' }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[13px] font-semibold text-ink-soft">
            <span>Subtotal</span>
            <span>{fmt(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[13px] font-semibold text-warning-dark">
            <span>Diskon</span>
            <span>−{fmt(totals.discount)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-[rgba(23,37,28,.15)] pt-[10px] text-[18px] font-extrabold">
            <span>Total</span>
            <span className="text-brand" data-testid="cart-total">
              {fmt(totals.total)}
            </span>
          </div>
        </div>
        <div className="flex gap-[10px]">
          <div
            onClick={() => goPay('/cash')}
            data-testid="pay-cash"
            className="flex h-[54px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15px] font-extrabold text-cream"
          >
            Bayar Cash
          </div>
          <div
            onClick={() => goPay('/qris')}
            data-testid="pay-qris"
            className="box-border flex h-[54px] flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-brand bg-white text-[15px] font-extrabold text-brand"
          >
            QRIS
          </div>
        </div>
      </div>

      {discId !== null && <DiscountSheet productId={discId} onClose={() => setDiscId(null)} />}
    </div>
  );
}
