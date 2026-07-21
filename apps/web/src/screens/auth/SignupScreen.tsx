import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Icon, LogoMark } from '../../components/Icon';
import { LegalSheet, type LegalKind } from '../../overlays/LegalSheet';

const smallInput =
  'box-border h-[42px] w-full min-w-0 rounded-xl border border-[rgba(23,37,28,.12)] bg-white px-[13px] text-[14px] font-semibold text-ink';

// SIGNUP — full owner registration with password + PIN confirmation and TOS.
export function SignupScreen() {
  const nav = useNavigate();
  const signup = useStore((s) => s.signup);
  const showToast = useStore((s) => s.showToast);

  const [nama, setNama] = useState('');
  const [toko, setToko] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [tos, setTos] = useState(false);
  const [legal, setLegal] = useState<LegalKind | null>(null);

  const doSignup = () => {
    if (nama.trim().length < 2) return showToast('Isi nama pemilik dulu');
    if (toko.trim().length < 2) return showToast('Isi nama toko dulu');
    if (phone.replace(/\D/g, '').length < 9) return showToast('Isi nomor HP yang valid dulu');
    if (pass.length < 6) return showToast('Password minimal 6 karakter');
    if (pass2 !== pass) return showToast('Konfirmasi password belum sama');
    if (pin.length < 6) return showToast('PIN harus 6 digit');
    if (pin2 !== pin) return showToast('Konfirmasi PIN belum sama');
    if (!tos) return showToast('Centang persetujuan S&K dulu');
    const res = signup({ nama, toko, phone, pass, pin });
    if (res === 'exists') {
      showToast('Nomor sudah terdaftar — silakan masuk');
      nav('/login');
      return;
    }
    showToast('Akun dibuat ✓ — masukkan PIN kamu');
    nav('/pin');
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-brand"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-signup"
    >
      <div className="relative flex flex-none flex-col items-center gap-[14px] px-8 pt-16 pb-7">
        <div
          onClick={() => nav('/login')}
          className="absolute top-6 left-5 flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[11px]"
          style={{ background: 'rgba(244,241,234,.12)' }}
        >
          <Icon name="back" size={19} color="#F4F1EA" strokeWidth={2.4} />
        </div>
        <LogoMark size={76} />
        <div className="text-center">
          <div className="text-[28px] font-extrabold tracking-[-0.5px] text-cream">Qlosir</div>
          <div className="mt-1 text-[13.5px] text-[rgba(244,241,234,.7)]">
            Kasir warung, beres dalam genggaman
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px] bg-cream px-6 pt-5">
        <div className="flex flex-none flex-col justify-start gap-[9px]">
          <div>
            <div className="text-[19px] font-extrabold tracking-[-0.3px]">Buat akun gratis</div>
            <div className="mt-px text-[12px] font-semibold text-muted">1 menit langsung bisa jualan</div>
          </div>

          <div className="flex gap-[10px]">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-[12px] font-bold text-ink-soft">Nama pemilik</label>
              <input value={nama} onChange={(e) => setNama(e.target.value.slice(0, 30))} placeholder="Muhamad Soleh" className={smallInput} data-testid="su-nama" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-[12px] font-bold text-ink-soft">Nama toko</label>
              <input value={toko} onChange={(e) => setToko(e.target.value.slice(0, 30))} placeholder="Warung Pak Soleh" className={smallInput} data-testid="su-toko" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-ink-soft">
              Nomor HP <span className="font-semibold text-muted">(buat login &amp; WA)</span>
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d-+ ]/g, '').slice(0, 16))} placeholder="cth: 0812-3456-7890" inputMode="tel" className={smallInput} data-testid="su-phone" />
          </div>

          <div className="flex gap-[10px]">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label className="text-[12px] font-bold text-ink-soft">Password</label>
              <div className="box-border flex h-[42px] items-center gap-2 rounded-xl border border-[rgba(23,37,28,.12)] bg-white px-3">
                <input value={pass} onChange={(e) => setPass(e.target.value.slice(0, 30))} type={showPass ? 'text' : 'password'} placeholder="Min. 6 karakter" className="h-full min-w-0 flex-1 border-none bg-transparent text-[14px] font-semibold text-ink" data-testid="su-pass" />
                <div onClick={() => setShowPass(!showPass)} className="flex flex-none cursor-pointer text-brand">
                  <Icon name="eye" size={17} strokeWidth={2.1} />
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label className="text-[12px] font-bold text-ink-soft">Konfirmasi</label>
              <input value={pass2} onChange={(e) => setPass2(e.target.value.slice(0, 30))} type="password" placeholder="Ulangi" className={smallInput} data-testid="su-pass2" />
            </div>
          </div>
          {pass2.length > 0 && (
            <div className="-mt-1 text-[11px] font-bold" style={{ color: pass2 === pass ? '#0E6B39' : '#C6432D' }}>
              {pass2 === pass ? 'Password cocok ✓' : 'Password belum sama'}
            </div>
          )}

          <div className="flex gap-[10px]">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label className="text-[12px] font-bold text-ink-soft">
                PIN kasir <span className="font-semibold text-muted">(6 digit)</span>
              </label>
              <div className="box-border flex h-[42px] items-center gap-2 rounded-xl border border-[rgba(23,37,28,.12)] bg-white px-3">
                <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} type={showPin ? 'text' : 'password'} placeholder="123456" inputMode="numeric" className="h-full min-w-0 flex-1 border-none bg-transparent text-[14px] font-bold tracking-[3px] text-ink" data-testid="su-pin" />
                <div onClick={() => setShowPin(!showPin)} className="flex flex-none cursor-pointer text-brand">
                  <Icon name="eye" size={17} strokeWidth={2.1} />
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label className="text-[12px] font-bold text-ink-soft">Konfirmasi PIN</label>
              <input value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, '').slice(0, 6))} type="password" placeholder="Ulangi" inputMode="numeric" className={smallInput + ' font-bold'} data-testid="su-pin2" />
            </div>
          </div>
          {pin2.length > 0 && (
            <div className="-mt-1 text-[11px] font-bold" style={{ color: pin2 === pin ? '#0E6B39' : '#C6432D' }}>
              {pin2 === pin ? 'PIN cocok ✓' : 'PIN belum sama'}
            </div>
          )}

          <div onClick={() => setTos(!tos)} className="flex cursor-pointer items-start gap-[10px]">
            <div
              className="mt-px box-border flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px]"
              style={tos ? { background: '#0E6B39' } : { background: '#fff', border: '1.5px solid rgba(23,37,28,.2)' }}
              data-testid="su-tos"
            >
              {tos && <Icon name="check" size={12} color="#F4F1EA" strokeWidth={3.4} />}
            </div>
            <div className="text-[12px] font-semibold leading-[1.5] text-ink-soft">
              Saya setuju dengan{' '}
              <span onClick={(e) => { e.stopPropagation(); setLegal('tos'); }} className="font-extrabold text-brand">
                Syarat &amp; Ketentuan
              </span>{' '}
              dan{' '}
              <span onClick={(e) => { e.stopPropagation(); setLegal('privacy'); }} className="font-extrabold text-brand">
                Kebijakan Privasi
              </span>{' '}
              Qlosir
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1" />
        <div className="flex flex-none flex-col gap-[10px] bg-cream pt-3 pb-5">
          <div
            onClick={doSignup}
            data-testid="su-submit"
            className="flex h-[52px] cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15.5px] font-extrabold text-cream"
            style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
          >
            Daftar &amp; Mulai Jualan
          </div>
          <div className="text-center text-[12.5px] font-semibold text-muted">
            Sudah punya akun?{' '}
            <span onClick={() => nav('/login')} className="cursor-pointer font-extrabold text-brand">
              Masuk
            </span>
          </div>
        </div>
      </div>

      {legal && (
        <LegalSheet
          kind={legal}
          onClose={() => setLegal(null)}
          onAgree={() => { setTos(true); setLegal(null); }}
        />
      )}
    </div>
  );
}
