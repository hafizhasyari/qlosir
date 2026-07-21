import { useState } from 'react';
import { useStore } from '../store/useStore';
import { fmt } from '../lib/format';

const CHIPS = [500, 1000, 2000, 5000];

// Per-line nominal discount sheet. Reads the current cart line to show the item
// label + cap, writes back through the store's setDisc (which enforces the cap).
export function DiscountSheet({ productId, onClose }: { productId: number; onClose: () => void }) {
  const product = useStore((s) => s.products.find((p) => p.id === productId));
  const line = useStore((s) => s.cart[productId]);
  const setDisc = useStore((s) => s.setDisc);

  const [str, setStr] = useState(String(line?.disc || ''));

  if (!product || !line) return null;

  const max = line.qty * product.price;
  const display = str ? 'Rp ' + parseInt(str, 10).toLocaleString('id-ID') : '';

  const save = () => {
    const disc = parseInt(str || '0', 10);
    if (setDisc(productId, disc) === 'ok') onClose();
  };

  return (
    <div
      className="absolute inset-0 z-[16] flex flex-col"
      style={{ background: 'rgba(23,37,28,.45)', animation: 'overlayIn .2s ease both' }}
      data-testid="discount-sheet"
    >
      <div className="flex-1" onClick={onClose} />
      <div
        className="flex flex-col gap-[14px] rounded-t-[24px] bg-white px-5 pt-5 pb-6"
        style={{ boxShadow: '0 -8px 30px rgba(23,37,28,.2)', animation: 'sheetUp .28s cubic-bezier(.3,1.1,.4,1) both' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-extrabold">Diskon item</div>
            <div className="mt-px text-[12px] font-semibold text-muted">
              {product.name + ' · ' + line.qty + ' × ' + fmt(product.price)}
            </div>
          </div>
          <div
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[10px] bg-cream text-[13px] font-bold text-ink-soft"
          >
            ✕
          </div>
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className="text-[12px] font-bold text-ink-soft">Nominal diskon (Rp)</label>
          <input
            value={display}
            onChange={(e) => setStr(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Rp 0"
            inputMode="numeric"
            data-testid="discount-input"
            className="box-border h-14 w-full rounded-[14px] border-2 border-brand bg-white px-4 text-[24px] font-extrabold text-brand"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CHIPS.map((v) => (
            <div
              key={v}
              onClick={() => setStr(String(v))}
              className="flex h-10 cursor-pointer items-center rounded-xl border border-[rgba(23,37,28,.1)] bg-cream px-4 text-[13px] font-bold text-ink"
            >
              {'Rp ' + v.toLocaleString('id-ID')}
            </div>
          ))}
        </div>

        <div className="text-center text-[12.5px] font-bold text-muted">Harga item {fmt(max)}</div>

        <div
          onClick={save}
          data-testid="discount-apply"
          className="flex h-[54px] cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15px] font-extrabold text-cream"
          style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
        >
          Terapkan Diskon
        </div>
      </div>
    </div>
  );
}
