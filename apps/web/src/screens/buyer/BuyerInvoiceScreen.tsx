import { useNavigate, useParams } from 'react-router-dom';
import { useStore, DEFAULT_STORE_NAME } from '../../store/useStore';
import { ReceiptPaper } from '../../components/ReceiptPaper';
import { Icon } from '../../components/Icon';

// HALAMAN PEMBELI — the public invoice deep-link (/i/:id). No app chrome; dark
// backdrop with the receipt card and PNG/PDF download actions (mocked in v1).
// Client-only demo: resolves the transaction from the persisted store.
export function BuyerInvoiceScreen() {
  const { id } = useParams();
  const nav = useNavigate();
  const settings = useStore((s) => s.settings);
  const storeName = useStore((s) => s.storeName());
  const showToast = useStore((s) => s.showToast);

  // Client-only demo: the public page resolves to the last recorded transaction.
  // A real deploy would fetch GET /i/:id from the Core API.
  const tx = useStore((s) => s.lastTx);

  if (!tx) {
    return (
      <div
        className="flex min-h-screen w-full flex-col items-center justify-center gap-3 p-8 text-center"
        style={{ background: '#17251C' }}
        data-testid="screen-buyer"
      >
        <div className="text-[15px] font-bold text-[rgba(244,241,234,.8)]">
          Invoice tidak ditemukan.
        </div>
        <div className="text-[12px] font-semibold text-[rgba(244,241,234,.5)]">
          Tautan mungkin sudah kedaluwarsa.
        </div>
      </div>
    );
  }

  const addr = (settings.addr || '') + ' · ' + (settings.phone || '');
  const txLink = 'qlosir.app/i/' + id;

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{ animation: 'screenIn .26s ease both', background: '#17251C' }}
      data-testid="screen-buyer"
    >
      <div className="flex flex-none items-center gap-[10px] px-5 pt-[18px]">
        <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] bg-brand">
          <svg width="19" height="19" viewBox="0 0 64 64" fill="none">
            <path d="M32 6 a11 11 0 0 1 11 11 v5" stroke="#E8A020" strokeWidth="7" strokeLinecap="round" />
            <path d="M32 6 a11 11 0 0 0 -11 11 v5" stroke="#E8A020" strokeWidth="7" strokeLinecap="round" />
            <rect x="13" y="22" width="38" height="32" rx="9" fill="#F4F1EA" />
            <path d="M44 48 L56 60" stroke="#F4F1EA" strokeWidth="9" strokeLinecap="round" />
          </svg>
        </div>
        <span className="min-w-0 flex-1 overflow-hidden text-[12.5px] font-bold text-ellipsis whitespace-nowrap text-[rgba(244,241,234,.8)]">
          {txLink}
        </span>
        <div
          onClick={() => nav(-1)}
          data-testid="buyer-close"
          className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-[10px] text-[13px] font-bold text-cream"
          style={{ background: 'rgba(244,241,234,.12)' }}
        >
          <Icon name="close" size={14} color="#F4F1EA" strokeWidth={2.6} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center gap-[14px] overflow-y-auto px-5 pt-5 pb-3">
        <ReceiptPaper
          tx={tx}
          storeName={storeName || DEFAULT_STORE_NAME}
          addr={addr}
          variant="buyer"
        />
        <div className="flex w-[300px] gap-[10px]">
          <div
            onClick={() => showToast('Struk diunduh sebagai PNG (mock)')}
            data-testid="buyer-png"
            className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-cream text-[13px] font-extrabold text-ink"
          >
            <Icon name="download" size={15} strokeWidth={2.2} />
            PNG
          </div>
          <div
            onClick={() => showToast('Struk diunduh sebagai PDF (mock)')}
            data-testid="buyer-pdf"
            className="box-border flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] text-[13px] font-extrabold text-cream"
            style={{ background: 'rgba(244,241,234,.12)', border: '1px solid rgba(244,241,234,.2)' }}
          >
            <Icon name="download" size={15} color="#F4F1EA" strokeWidth={2.2} />
            PDF
          </div>
        </div>
      </div>

      <div className="flex-none px-5 pb-[18px] text-center text-[10.5px] font-semibold text-[rgba(244,241,234,.4)]">
        Halaman publik — pembeli buka tanpa login
      </div>
    </div>
  );
}
