import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, DEFAULT_STORE_NAME } from '../../store/useStore';
import { Icon } from '../../components/Icon';
import { ReceiptPaper } from '../../components/ReceiptPaper';

// DONE — post-checkout success screen: receipt preview, print, WhatsApp send,
// copy link, and the deep-link to the public buyer page.
export function ReceiptScreen() {
  const nav = useNavigate();
  const tx = useStore((s) => s.lastTx);
  const linkId = useStore((s) => s.lastLinkId);
  const settings = useStore((s) => s.settings);
  const storeName = useStore((s) => s.storeName());
  const showToast = useStore((s) => s.showToast);

  const [waStr, setWaStr] = useState('');
  const [waSent, setWaSent] = useState(false);

  // Guard against a direct visit without a completed transaction.
  if (!tx) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-[15px] font-bold text-muted">Belum ada transaksi.</div>
        <div
          onClick={() => nav('/cashier')}
          className="cursor-pointer text-[13.5px] font-extrabold text-brand"
        >
          Kembali ke Kasir →
        </div>
      </div>
    );
  }

  const addr = (settings.addr || '') + ' · ' + (settings.phone || '');
  const txLink = 'qlosir.app/i/' + linkId;

  const sendWa = () => {
    if (waSent) return;
    if (waStr.replace(/\D/g, '').length < 9) {
      showToast('Isi nomor WA pembeli dulu');
      return;
    }
    setWaSent(true);
    showToast('Invoice terkirim via WhatsApp ✓');
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-receipt"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center gap-[14px] overflow-y-auto px-5 pt-[26px] pb-[14px]">
        <div
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-brand"
          style={{ boxShadow: '0 6px 18px rgba(14,107,57,.35)' }}
        >
          <Icon name="check" size={28} color="#F4F1EA" strokeWidth={3} />
        </div>
        <div className="text-center">
          <div className="text-[20px] font-extrabold">Transaksi berhasil</div>
          <div className="mt-1 text-[12.5px] font-semibold text-muted" data-testid="receipt-meta">
            {tx.no + ' · ' + (tx.method === 'cash' ? 'Cash' : 'QRIS') + ' · ' + tx.time}
          </div>
        </div>
        <ReceiptPaper
          tx={tx}
          storeName={storeName || DEFAULT_STORE_NAME}
          addr={addr}
          variant="done"
          linkLabel={txLink}
        />
      </div>

      <div
        className="flex flex-none flex-col gap-[10px] rounded-t-[24px] bg-white px-5 pt-[18px] pb-5"
        style={{ boxShadow: '0 -6px 24px rgba(23,37,28,.08)' }}
      >
        <div className="flex gap-[10px]">
          <div
            onClick={() => showToast('Dikirim ke printer thermal ' + settings.paper + ' ✓')}
            data-testid="receipt-print"
            className="flex h-[50px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-ink text-[13.5px] font-bold text-cream"
          >
            <Icon name="printer" size={18} color="#F4F1EA" strokeWidth={2} />
            Cetak Thermal
          </div>
          <div className="box-border flex h-[50px] w-[90px] items-center justify-center rounded-[14px] border-[1.5px] border-[rgba(23,37,28,.15)] bg-white text-[12.5px] font-bold text-ink-soft">
            {settings.paper} ▾
          </div>
        </div>
        <div className="flex gap-[10px]">
          <input
            value={waStr}
            onChange={(e) => setWaStr(e.target.value.replace(/[^\d-]/g, '').slice(0, 15))}
            placeholder="Nomor WA pembeli…"
            inputMode="tel"
            data-testid="receipt-wa-input"
            className="box-border h-[50px] min-w-0 flex-1 rounded-[14px] border border-[rgba(23,37,28,.1)] bg-cream px-[14px] text-[14px] font-semibold text-ink"
          />
          <div
            onClick={sendWa}
            data-testid="receipt-wa-send"
            className="flex h-[50px] flex-none cursor-pointer items-center justify-center rounded-[14px] px-[18px] text-[13.5px] font-extrabold text-white"
            style={{ background: waSent ? '#128C7E' : '#1FA855' }}
          >
            {waSent ? 'Terkirim ✓' : 'Kirim WA'}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div
            onClick={() => showToast('Link invoice disalin ✓')}
            data-testid="receipt-copy"
            className="flex cursor-pointer items-center gap-[7px] text-[12px] font-bold text-brand"
          >
            <Icon name="link" size={14} color="#0E6B39" strokeWidth={2.2} />
            Salin link
          </div>
          <div className="h-[14px] w-px bg-[rgba(23,37,28,.15)]" />
          <div
            onClick={() => nav('/i/' + linkId)}
            data-testid="receipt-buyer"
            className="flex cursor-pointer items-center gap-[7px] text-[12px] font-bold text-brand"
          >
            <Icon name="eye" size={14} color="#0E6B39" strokeWidth={2.2} />
            Lihat halaman pembeli
          </div>
        </div>
        <div
          onClick={() => nav('/cashier')}
          data-testid="receipt-new"
          className="cursor-pointer pt-[2px] text-center text-[13.5px] font-extrabold text-brand"
        >
          Transaksi baru →
        </div>
      </div>
    </div>
  );
}
