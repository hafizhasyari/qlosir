import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { computeTotals } from '../../store/selectors';
import { fmt } from '../../lib/format';
import { Icon } from '../../components/Icon';

// BAYAR — CASH — enter cash received, see quick presets + live change, save.
export function CashScreen() {
  const nav = useNavigate();
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const checkout = useStore((s) => s.checkout);

  const [cashStr, setCashStr] = useState('');

  const totals = computeTotals(products, cart);
  const total = totals.total;
  const cash = parseInt(cashStr || '0', 10);
  const enough = cash >= total && total > 0;

  // Quick-fill presets: exact, then next 10k / 50k rounding, then 100k.
  const quicks = useMemo(() => {
    const rounds = [
      ...new Set(
        [Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000, 100000].filter(
          (v) => v > total,
        ),
      ),
    ].slice(0, 2);
    return [{ label: 'Uang pas', v: total }, ...rounds.map((v) => ({ label: fmt(v), v }))];
  }, [total]);

  const save = () => {
    const tx = checkout('cash', cash);
    if (tx) nav('/receipt');
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-cash"
    >
      <div
        onClick={() => nav('/cart')}
        className="flex flex-none cursor-pointer items-center gap-3 bg-brand px-5 py-[18px]"
      >
        <Icon name="back" size={22} color="#F4F1EA" strokeWidth={2.4} />
        <span className="text-[17px] font-extrabold text-cream">Bayar — Cash</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-[22px]">
        <div className="rounded-[18px] border border-[rgba(23,37,28,.06)] bg-white p-[18px] text-center">
          <div className="text-[12.5px] font-bold tracking-[.5px] text-muted uppercase">
            Total tagihan
          </div>
          <div className="mt-[6px] text-[34px] font-extrabold tracking-[-1px] text-ink">
            {fmt(total)}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold text-ink-soft">Uang diterima</label>
          <input
            value={cashStr ? 'Rp ' + parseInt(cashStr, 10).toLocaleString('id-ID') : ''}
            onChange={(e) => setCashStr(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="Rp 0"
            inputMode="numeric"
            data-testid="cash-input"
            className="box-border h-[62px] w-full rounded-2xl border-2 border-brand bg-white px-[18px] text-[26px] font-extrabold text-brand"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {quicks.map((qk, i) => (
            <div
              key={i}
              onClick={() => setCashStr(String(qk.v))}
              data-testid={`cash-quick-${i}`}
              className="flex h-11 cursor-pointer items-center rounded-xl border border-[rgba(23,37,28,.1)] bg-white px-4 text-[13px] font-bold text-ink"
            >
              {qk.label}
            </div>
          ))}
        </div>

        <div
          className="rounded-[18px] border-[1.5px] p-[18px] text-center"
          data-testid="change-box"
          style={
            enough
              ? { background: '#E4F3E8', borderColor: 'rgba(14,107,57,.25)' }
              : { background: '#FDF3E1', borderColor: 'rgba(232,160,32,.35)' }
          }
        >
          <div
            className="text-[12.5px] font-bold tracking-[.5px] uppercase"
            style={{ color: enough ? '#0E6B39' : '#9A6A0B' }}
          >
            {enough ? 'Kembalian' : cash > 0 ? 'Masih kurang' : 'Kembalian'}
          </div>
          <div
            className="mt-1 text-[30px] font-extrabold tracking-[-1px]"
            data-testid="change-value"
            style={{ color: enough ? '#0E6B39' : '#9A6A0B' }}
          >
            {enough ? fmt(cash - total) : cash > 0 ? fmt(total - cash) : 'Rp 0'}
          </div>
        </div>
      </div>

      <div className="flex-none px-5 pt-[14px] pb-[22px]">
        <div
          onClick={save}
          data-testid="cash-save"
          className="flex h-14 cursor-pointer items-center justify-center rounded-2xl bg-brand text-[16px] font-extrabold text-cream"
          style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
        >
          Simpan Transaksi
        </div>
      </div>
    </div>
  );
}
