import { useNavigate } from 'react-router-dom';
import { useStore, DEFAULT_STORE_NAME } from '../../store/useStore';
import { Icon } from '../../components/Icon';

// PENGATURAN — store profile, receipt/payment prefs (paper width, static QRIS),
// and security actions (change PIN, logout).
export function SettingsScreen() {
  const nav = useNavigate();
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const logout = useStore((s) => s.logout);
  const showToast = useStore((s) => s.showToast);

  const inputCls =
    'box-border h-12 w-full rounded-xl border border-[rgba(23,37,28,.08)] bg-cream px-[14px] text-[14px] font-semibold text-ink';

  const doLogout = () => {
    logout();
    nav('/login');
  };

  const paperBtn = (v: '58mm' | '80mm') => (
    <div
      onClick={() => setSettings({ paper: v })}
      data-testid={`paper-${v}`}
      className="box-border flex h-[38px] cursor-pointer items-center rounded-[10px] px-[14px] text-[12.5px] font-extrabold"
      style={
        settings.paper === v
          ? { background: '#0E6B39', color: '#F4F1EA' }
          : { background: '#F4F1EA', color: '#4A5850', border: '1px solid rgba(23,37,28,.1)' }
      }
    >
      {v}
    </div>
  );

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-settings"
    >
      <div className="flex-none bg-brand px-5 pt-4 pb-[14px]">
        <span className="text-[18px] font-extrabold text-cream">Pengaturan</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-5 pt-4 pb-5">
        <SectionLabel>Profil toko</SectionLabel>
        <div className="flex flex-col gap-[13px] rounded-2xl border border-[rgba(23,37,28,.06)] bg-white p-4">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12px] font-bold text-ink-soft">
              Nama toko <span className="font-semibold text-muted">(tampil di struk)</span>
            </label>
            <input
              value={settings.name ?? DEFAULT_STORE_NAME}
              onChange={(e) => setSettings({ name: e.target.value })}
              data-testid="set-name"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12px] font-bold text-ink-soft">Alamat</label>
            <input
              value={settings.addr}
              onChange={(e) => setSettings({ addr: e.target.value })}
              data-testid="set-addr"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="text-[12px] font-bold text-ink-soft">No. WA toko</label>
            <input
              value={settings.phone}
              onChange={(e) => setSettings({ phone: e.target.value })}
              inputMode="tel"
              data-testid="set-phone"
              className={inputCls}
            />
          </div>
        </div>

        <SectionLabel>Struk &amp; pembayaran</SectionLabel>
        <div className="flex flex-col gap-[13px] rounded-2xl border border-[rgba(23,37,28,.06)] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[13.5px] font-bold">Lebar kertas thermal</div>
              <div className="mt-px text-[11.5px] font-semibold text-muted">Buat cetak struk</div>
            </div>
            <div className="flex gap-[6px]">
              {paperBtn('58mm')}
              {paperBtn('80mm')}
            </div>
          </div>
          <div
            onClick={() => showToast('Upload gambar QRIS baru (mock)')}
            className="flex cursor-pointer items-center gap-3 border-t border-[rgba(23,37,28,.07)] pt-[13px]"
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-tint">
              <Icon name="scan" size={18} color="#0E6B39" strokeWidth={2.1} />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold">QRIS statis toko</div>
              <div className="mt-px text-[11.5px] font-semibold text-muted">
                NMID · ID102026001234 — terpasang ✓
              </div>
            </div>
            <span className="text-[12px] font-extrabold text-brand">Ganti</span>
          </div>
        </div>

        <SectionLabel>Keamanan</SectionLabel>
        <div className="flex flex-col rounded-2xl border border-[rgba(23,37,28,.06)] bg-white px-4 py-1">
          <div
            onClick={() => nav('/settings/pin')}
            data-testid="set-change-pin"
            className="flex cursor-pointer items-center gap-3 py-[13px]"
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-tint-amber">
              <Icon name="lock" size={18} color="#9A6A0B" strokeWidth={2.1} />
            </div>
            <div className="flex-1 text-[13.5px] font-bold">Ganti PIN</div>
            <span className="text-[16px] text-muted-3">›</span>
          </div>
          <div
            onClick={doLogout}
            data-testid="set-logout"
            className="flex cursor-pointer items-center gap-3 border-t border-[rgba(23,37,28,.07)] py-[13px]"
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-tint-red">
              <Icon name="logout" size={18} color="#C6432D" strokeWidth={2.1} />
            </div>
            <div className="flex-1 text-[13.5px] font-bold text-danger">Keluar akun</div>
          </div>
        </div>

        <div className="mt-1 text-center text-[11px] font-semibold text-muted-3">
          Qlosir v1.0 · prototype
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11.5px] font-extrabold tracking-[.8px] text-muted uppercase">
      {children}
    </div>
  );
}
