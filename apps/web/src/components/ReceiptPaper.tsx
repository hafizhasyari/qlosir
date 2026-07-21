import type { Transaction } from '../types';
import { fmt } from '../lib/format';

// The thermal-style receipt body shared by the cashier "done" screen and the
// public buyer invoice. `variant` tweaks the header/footer to match each.
export function ReceiptPaper({
  tx,
  storeName,
  addr,
  variant,
  linkLabel,
}: {
  tx: Transaction;
  storeName: string;
  addr: string;
  variant: 'done' | 'buyer';
  linkLabel?: string;
}) {
  const isBuyer = variant === 'buyer';

  return (
    <div
      className="w-[300px] bg-white text-[12px] text-ink"
      style={
        isBuyer
          ? { borderRadius: 6, padding: '20px 18px 14px', boxShadow: '0 12px 40px rgba(0,0,0,.35)' }
          : { borderRadius: 4, padding: '18px 18px 14px', boxShadow: '0 4px 16px rgba(23,37,28,.1)' }
      }
      data-testid="receipt-paper"
    >
      <div className="border-b border-dashed border-[rgba(23,37,28,.25)] pb-[10px] text-center">
        <div className="text-[13.5px] font-extrabold uppercase">{storeName}</div>
        <div className="mt-[2px] text-[10.5px] text-muted">{addr}</div>
      </div>

      {isBuyer && (
        <div className="flex justify-between border-b border-dashed border-[rgba(23,37,28,.25)] py-[9px] text-[10.5px] font-semibold text-ink-soft">
          <span>{tx.no}</span>
          <span>18 Jul 2026 · {tx.time}</span>
        </div>
      )}

      <div className="flex flex-col gap-[6px] py-[11px]">
        {tx.lines.map((l, i) => (
          <div key={i} className="flex flex-col gap-[2px]">
            <div className="flex justify-between">
              <span>{l.label}</span>
              <span
                className="font-bold"
                style={l.hasDisc ? { color: '#9AA39D', textDecoration: 'line-through' } : undefined}
              >
                {l.grossF}
              </span>
            </div>
            {l.hasDisc && (
              <div className="flex justify-between pl-3 font-bold text-warning-dark">
                <span>Diskon</span>
                <span>{l.discF}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t border-dashed border-[rgba(23,37,28,.25)] pt-2">
        <div className="flex justify-between text-[13px] font-extrabold">
          <span>TOTAL</span>
          <span>{fmt(tx.total)}</span>
        </div>
        {isBuyer ? (
          <>
            <div className="flex justify-between text-[11px] text-ink-soft">
              <span>Metode</span>
              <span className="font-bold">{tx.method === 'cash' ? 'Cash' : 'QRIS'}</span>
            </div>
            <div className="flex justify-between text-[11px] text-ink-soft">
              <span>Status</span>
              <span className="font-extrabold text-brand">LUNAS ✓</span>
            </div>
          </>
        ) : tx.method === 'cash' ? (
          <>
            <div className="flex justify-between text-ink-soft">
              <span>Tunai</span>
              <span>{tx.cash.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Kembali</span>
              <span>{tx.change.toLocaleString('id-ID')}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-ink-soft">
            <span>Metode</span>
            <span>QRIS · lunas</span>
          </div>
        )}
      </div>

      {isBuyer ? (
        <div className="mt-3 text-center text-[9.5px] text-muted-3">Dibuat dengan Qlosir</div>
      ) : (
        <div className="mt-[10px] text-center text-[10px] text-muted">
          Terima kasih 🙏 — {linkLabel}
        </div>
      )}
    </div>
  );
}
