import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Icon } from '../../components/Icon';

// GANTI PIN — verify the old till PIN, then set + confirm a new 6-digit PIN.
export function ChangePinScreen() {
  const nav = useNavigate();
  const changePin = useStore((s) => s.changePin);
  const showToast = useStore((s) => s.showToast);

  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [show, setShow] = useState(false);
  const [oldError, setOldError] = useState(false);

  const clean = (v: string) => v.replace(/\D/g, '').slice(0, 6);
  const confirmShown = newPin2.length > 0;
  const confirmOk = newPin2 === newPin;

  const save = () => {
    if (newPin.length < 6) return showToast('PIN baru harus 6 digit');
    if (newPin2 !== newPin) return showToast('Konfirmasi PIN belum sama');
    const res = changePin(oldPin, newPin);
    if (res === 'wrongold') {
      setOldError(true);
      return;
    }
    if (res === 'same') return showToast('PIN baru sama dengan yang lama');
    showToast('PIN berhasil diganti ✓');
    nav('/settings');
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-change-pin"
    >
      <div
        onClick={() => nav('/settings')}
        className="flex flex-none cursor-pointer items-center gap-3 bg-brand px-5 py-[18px]"
      >
        <Icon name="back" size={22} color="#F4F1EA" strokeWidth={2.4} />
        <span className="text-[17px] font-extrabold text-cream">Ganti PIN</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div className="text-[13px] font-semibold leading-[1.6] text-ink-soft">
          PIN 6 digit dipakai buat buka aplikasi. Verifikasi PIN lama, lalu buat PIN baru.
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12.5px] font-bold text-ink-soft">PIN lama</label>
          <div
            className="box-border flex h-[54px] items-center gap-[10px] rounded-[14px] bg-white px-4"
            style={{ border: `1px solid ${oldError ? '#C6432D' : 'rgba(23,37,28,.12)'}` }}
          >
            <input
              value={oldPin}
              onChange={(e) => {
                setOldPin(clean(e.target.value));
                setOldError(false);
              }}
              type={show ? 'text' : 'password'}
              placeholder="Masukkan PIN lama"
              inputMode="numeric"
              data-testid="cp-old"
              className="h-full min-w-0 flex-1 border-none bg-transparent text-[16px] font-bold text-ink"
            />
            <div onClick={() => setShow(!show)} className="flex flex-none cursor-pointer text-brand">
              <Icon name="eye" size={18} strokeWidth={2.1} />
            </div>
          </div>
          {oldError && (
            <div className="text-[11.5px] font-bold text-danger" data-testid="cp-old-error">
              PIN lama salah
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12.5px] font-bold text-ink-soft">PIN baru</label>
          <input
            value={newPin}
            onChange={(e) => setNewPin(clean(e.target.value))}
            type={show ? 'text' : 'password'}
            placeholder="6 digit PIN baru"
            inputMode="numeric"
            data-testid="cp-new"
            className="box-border h-[54px] w-full rounded-[14px] border border-[rgba(23,37,28,.12)] bg-white px-4 text-[16px] font-bold text-ink"
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12.5px] font-bold text-ink-soft">Konfirmasi PIN baru</label>
          <input
            value={newPin2}
            onChange={(e) => setNewPin2(clean(e.target.value))}
            type="password"
            placeholder="Ulangi PIN baru"
            inputMode="numeric"
            data-testid="cp-new2"
            className="box-border h-[54px] w-full rounded-[14px] border border-[rgba(23,37,28,.12)] bg-white px-4 text-[16px] font-bold text-ink"
          />
          {confirmShown && (
            <div
              className="text-[11.5px] font-bold"
              style={{ color: confirmOk ? '#0E6B39' : '#C6432D' }}
            >
              {confirmOk ? 'PIN cocok ✓' : 'PIN belum sama'}
            </div>
          )}
        </div>
      </div>

      <div className="flex-none px-5 pt-[14px] pb-[22px]">
        <div
          onClick={save}
          data-testid="cp-save"
          className="flex h-14 cursor-pointer items-center justify-center rounded-2xl bg-brand text-[16px] font-extrabold text-cream"
          style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
        >
          Simpan PIN Baru
        </div>
      </div>
    </div>
  );
}
