import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Icon } from '../components/Icon';
import type { Product } from '../types';

type Mode = 'restock' | 'adjust';
const REASONS = ['Koreksi hitung', 'Kemasan rusak', 'Kadaluarsa', 'Hilang'];
const RESTOCK_CHIPS = [5, 10, 24];

// Restock / Adjustment bottom sheet. Restock adds stock (with an optional
// supplier note); Adjustment adds or subtracts with a reason. Both append a
// stock_history entry via the store's applyStock.
export function StockSheet({
  mode,
  product,
  onClose,
}: {
  mode: Mode;
  product: Product;
  onClose: () => void;
}) {
  const applyStock = useStore((s) => s.applyStock);

  const [qty, setQty] = useState(mode === 'restock' ? 10 : 1);
  const [dir, setDir] = useState<'minus' | 'plus'>('minus');
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');

  const isAdjust = mode === 'adjust';
  const delta = mode === 'restock' ? qty : dir === 'minus' ? -qty : qty;
  const newStock = product.stock + delta;

  const save = () => {
    if (!qty) return;
    const title =
      mode === 'restock'
        ? 'Restock · ' + (note.trim() || 'manual')
        : 'Adjustment · ' + reason;
    if (applyStock(product.id, delta, title)) onClose();
  };

  const dirBase =
    'box-border flex h-11 flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-xl text-[13px] font-extrabold';

  return (
    <div
      className="absolute inset-0 z-[10] flex flex-col"
      style={{ background: 'rgba(23,37,28,.45)', animation: 'overlayIn .2s ease both' }}
      data-testid="stock-sheet"
    >
      <div className="flex-1" onClick={onClose} />
      <div
        className="flex flex-col gap-[14px] rounded-t-[24px] bg-white px-5 pt-5 pb-6"
        style={{ boxShadow: '0 -8px 30px rgba(23,37,28,.2)', animation: 'sheetUp .28s cubic-bezier(.3,1.1,.4,1) both' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-extrabold">
            {(isAdjust ? 'Adjustment' : 'Restock') + ' — ' + product.name}
          </div>
          <div
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[10px] bg-cream text-[13px] font-bold text-ink-soft"
          >
            ✕
          </div>
        </div>

        {isAdjust && (
          <>
            <div className="flex gap-2">
              <div
                onClick={() => setDir('minus')}
                data-testid="adj-minus"
                className={dirBase}
                style={
                  dir === 'minus'
                    ? { background: '#FDECE7', color: '#C6432D', border: '2px solid rgba(198,67,45,.4)' }
                    : { background: '#F4F1EA', color: '#4A5850' }
                }
              >
                <Icon name="minus" size={12} strokeWidth={3.4} />
                Kurangi
              </div>
              <div
                onClick={() => setDir('plus')}
                data-testid="adj-plus"
                className={dirBase}
                style={
                  dir === 'plus'
                    ? { background: '#E4F3E8', color: '#0E6B39', border: '2px solid rgba(14,107,57,.35)' }
                    : { background: '#F4F1EA', color: '#4A5850' }
                }
              >
                <Icon name="plus" size={12} strokeWidth={3.4} />
                Tambah
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <div
                  key={r}
                  onClick={() => setReason(r)}
                  className="flex h-[38px] cursor-pointer items-center rounded-full px-[14px] text-[12px] font-bold"
                  style={
                    reason === r
                      ? { background: '#17251C', color: '#F4F1EA' }
                      : { background: '#F4F1EA', color: '#4A5850', border: '1px solid rgba(23,37,28,.08)' }
                  }
                >
                  {r}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-4">
          <div
            onClick={() => setQty((v) => Math.max(v - 1, 0))}
            data-testid="stock-qty-dec"
            className="box-border flex h-12 w-12 cursor-pointer items-center justify-center rounded-[14px] border border-[rgba(23,37,28,.1)] bg-cream text-ink"
          >
            <Icon name="minus" size={15} strokeWidth={3} />
          </div>
          <input
            value={qty ? String(qty) : ''}
            onChange={(e) => setQty(parseInt(e.target.value.replace(/\D/g, '').slice(0, 4) || '0', 10))}
            inputMode="numeric"
            placeholder="0"
            data-testid="stock-qty"
            className="box-border h-14 w-24 rounded-[14px] border-2 border-brand bg-white text-center text-[28px] font-extrabold text-ink"
          />
          <div
            onClick={() => setQty((v) => Math.min(v + 1, 9999))}
            data-testid="stock-qty-inc"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-[14px] bg-brand text-cream"
          >
            <Icon name="plus" size={15} strokeWidth={3} />
          </div>
        </div>

        {!isAdjust && (
          <>
            <div className="flex justify-center gap-2">
              {RESTOCK_CHIPS.map((v) => (
                <div
                  key={v}
                  onClick={() => setQty(v)}
                  className="flex h-[38px] cursor-pointer items-center rounded-full border border-[rgba(23,37,28,.08)] bg-cream px-[18px] text-[12.5px] font-bold text-ink"
                >
                  {'+' + v}
                </div>
              ))}
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 40))}
              placeholder="Supplier / catatan (opsional)"
              className="box-border h-12 w-full rounded-[14px] border border-[rgba(23,37,28,.08)] bg-cream px-4 text-[13.5px] text-ink"
            />
          </>
        )}

        <div className="text-center text-[13.5px] font-extrabold">
          <span style={{ color: newStock < 0 ? '#C6432D' : '#0E6B39' }} data-testid="stock-preview">
            {'Stok ' + product.stock + ' → ' + newStock + ' ' + product.unit}
          </span>
        </div>

        <div
          onClick={save}
          data-testid="stock-save"
          className="flex h-[54px] cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15px] font-extrabold text-cream"
          style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
        >
          Simpan Perubahan Stok
        </div>
      </div>
    </div>
  );
}
