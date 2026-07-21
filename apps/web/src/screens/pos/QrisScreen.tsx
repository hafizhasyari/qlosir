import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { computeTotals } from '../../store/selectors';
import { fmt } from '../../lib/format';
import { Icon } from '../../components/Icon';

// BAYAR — QRIS — static store QR, manually confirmed by the cashier (v1 has no
// PSP callback). "Sudah Dibayar" records the transaction as QRIS/paid.
export function QrisScreen() {
  const nav = useNavigate();
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const storeName = useStore((s) => s.storeName());
  const checkout = useStore((s) => s.checkout);

  const totals = computeTotals(products, cart);

  const save = () => {
    const tx = checkout('qris', totals.total);
    if (tx) nav('/receipt');
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-qris"
    >
      <div
        onClick={() => nav('/cart')}
        className="flex flex-none cursor-pointer items-center gap-3 bg-brand px-5 py-[18px]"
      >
        <Icon name="back" size={22} color="#F4F1EA" strokeWidth={2.4} />
        <span className="text-[17px] font-extrabold text-cream">Bayar — QRIS</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-5 py-[22px]">
        <div className="text-center">
          <div className="text-[12.5px] font-bold tracking-[.5px] text-muted uppercase">
            Total tagihan
          </div>
          <div className="mt-1 text-[32px] font-extrabold tracking-[-1px]">{fmt(totals.total)}</div>
        </div>

        <div className="box-border flex w-[280px] flex-col items-center gap-3 rounded-[20px] border border-[rgba(23,37,28,.06)] bg-white p-5">
          <div className="text-[15px] font-extrabold tracking-[2px] text-ink">QRIS</div>
          <div
            className="relative h-[200px] w-[200px] rounded-xl border-[10px] border-white"
            style={{
              background: 'repeating-conic-gradient(#17251C 0% 25%, #fff 0% 50%) 0 0/20px 20px',
              outline: '1.5px solid rgba(23,37,28,.15)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-[10px] bg-white px-[10px] py-2 text-center text-[10px] font-extrabold leading-[1.3] text-muted">
                QR STATIS
                <br />
                PLACEHOLDER
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[13.5px] font-extrabold">{storeName}</div>
            <div className="text-[11px] font-semibold text-muted">NMID · ID102026001234</div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-tint-amber px-4 py-[10px] text-[12.5px] font-bold text-warning-dark">
          <div className="h-2 w-2 rounded-full bg-warning" />
          Menunggu pembayaran pembeli…
        </div>
      </div>

      <div className="flex flex-none flex-col gap-[10px] px-5 pt-[14px] pb-[22px]">
        <div
          onClick={save}
          data-testid="qris-save"
          className="flex h-14 cursor-pointer items-center justify-center rounded-2xl bg-brand text-[16px] font-extrabold text-cream"
          style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
        >
          ✓&nbsp; Sudah Dibayar
        </div>
        <div className="text-center text-[11.5px] font-semibold text-muted">
          Konfirmasi manual — cek notifikasi bank kamu dulu
        </div>
      </div>
    </div>
  );
}
