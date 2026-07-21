import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, OTP_CODE } from '../../store/useStore';
import { Icon } from '../../components/Icon';

type Step = 'phone' | 'otp' | 'reset' | 'done';

// LUPA PASSWORD — 3-step WhatsApp OTP reset (phone → otp → reset → done).
export function ForgotPasswordScreen() {
  const nav = useNavigate();
  const accounts = useStore((s) => s.accounts);
  const resetPassword = useStore((s) => s.resetPassword);
  const showToast = useStore((s) => s.showToast);

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [phoneErr, setPhoneErr] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpErr, setOtpErr] = useState(false);
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [showPass, setShowPass] = useState(false);

  const dot = (active: boolean) =>
    ({ background: active ? '#0E6B39' : '#D8D2C4' }) as const;
  const has = (s: Step[]) => s.includes(step);

  const sendOtp = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) return showToast('Isi nomor HP yang valid dulu');
    if (!accounts.find((a) => a.phone === digits)) return setPhoneErr(true);
    setStep('otp');
    setOtp('');
    setOtpErr(false);
    showToast('Kode OTP dikirim via WhatsApp ✓');
  };
  const verifyOtp = () => {
    if (otp.length < 6) return showToast('Masukkan 6 digit OTP');
    if (otp !== OTP_CODE) return setOtpErr(true);
    setStep('reset');
  };
  const savePass = () => {
    if (pass.length < 6) return showToast('Password minimal 6 karakter');
    if (pass2 !== pass) return showToast('Konfirmasi password belum sama');
    resetPassword(phone, pass);
    setStep('done');
  };

  const fieldBorder = (err: boolean) => `1px solid ${err ? '#C6432D' : 'rgba(23,37,28,.12)'}`;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-brand"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-forgot"
    >
      <div className="relative flex flex-none flex-col items-center gap-[14px] px-8 pt-16 pb-7">
        <div
          onClick={() => nav('/login')}
          className="absolute top-6 left-5 flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[11px]"
          style={{ background: 'rgba(244,241,234,.12)' }}
        >
          <Icon name="back" size={19} color="#F4F1EA" strokeWidth={2.4} />
        </div>
        <div
          className="flex h-[76px] w-[76px] items-center justify-center rounded-[24px]"
          style={{ background: 'rgba(244,241,234,.12)' }}
        >
          <Icon name="lock" size={38} color="#F4F1EA" strokeWidth={2} />
        </div>
        <div className="text-center">
          <div className="text-[24px] font-extrabold tracking-[-0.5px] text-cream">Lupa Password?</div>
          <div className="mt-1 text-[13px] text-[rgba(244,241,234,.7)]">
            Kami bantu reset lewat WhatsApp
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-t-[28px] bg-cream px-6 pt-7">
        <div className="flex gap-[6px]">
          <div className="h-[5px] flex-1 rounded-full" style={dot(has(['phone', 'otp', 'reset', 'done']))} />
          <div className="h-[5px] flex-1 rounded-full" style={dot(has(['otp', 'reset', 'done']))} />
          <div className="h-[5px] flex-1 rounded-full" style={dot(has(['reset', 'done']))} />
        </div>

        {step === 'phone' && (
          <>
            <div>
              <div className="text-[18px] font-extrabold tracking-[-0.3px]">Verifikasi nomor HP</div>
              <div className="mt-[3px] text-[12.5px] font-semibold leading-[1.55] text-muted">
                Kami kirim kode OTP ke WhatsApp kamu buat verifikasi.
              </div>
            </div>
            <div className="flex flex-col gap-[7px]">
              <label className="text-[12.5px] font-bold text-ink-soft">Nomor HP terdaftar</label>
              <input
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/[^\d-+ ]/g, '').slice(0, 16)); setPhoneErr(false); }}
                placeholder="cth: 0812-3456-7890"
                inputMode="tel"
                data-testid="fp-phone"
                className="box-border h-[52px] w-full rounded-[14px] bg-white px-4 text-[15px] font-semibold text-ink"
                style={{ border: fieldBorder(phoneErr) }}
              />
            </div>
            {phoneErr && (
              <div className="flex items-start gap-[9px] rounded-xl border px-[13px] py-[11px]" style={{ background: '#FDECE7', borderColor: 'rgba(198,67,45,.28)' }}>
                <Icon name="alert" size={16} color="#C6432D" strokeWidth={2.2} className="mt-px flex-none" />
                <div className="flex-1 text-[12px] font-semibold leading-[1.5] text-danger-dark">
                  Nomor ini belum terdaftar.{' '}
                  <span onClick={() => nav('/signup')} className="cursor-pointer font-extrabold text-brand">Daftar dulu</span>
                </div>
              </div>
            )}
            <div onClick={sendOtp} data-testid="fp-send" className="flex h-[54px] cursor-pointer items-center justify-center gap-[9px] rounded-2xl bg-brand text-[15.5px] font-extrabold text-cream" style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}>
              <Icon name="whatsapp" size={18} color="#F4F1EA" />
              Kirim OTP via WhatsApp
            </div>
            <div className="text-center text-[12.5px] font-semibold text-muted">
              Ingat password? <span onClick={() => nav('/login')} className="cursor-pointer font-extrabold text-brand">Masuk</span>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <div>
              <div className="text-[18px] font-extrabold tracking-[-0.3px]">Masukkan kode OTP</div>
              <div className="mt-[3px] text-[12.5px] font-semibold leading-[1.55] text-muted">
                Kode 6 digit dikirim ke WhatsApp <strong className="text-ink">{phone || '—'}</strong>.
              </div>
            </div>
            <div className="rounded-xl bg-tint px-[14px] py-[10px] text-center text-[12px] font-bold text-brand">
              Demo: kode OTP kamu <strong>247831</strong>
            </div>
            <input
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpErr(false); }}
              placeholder="______"
              inputMode="numeric"
              data-testid="fp-otp"
              className="box-border h-[56px] w-full rounded-[14px] bg-white px-4 text-center text-[24px] font-extrabold tracking-[10px] text-ink"
              style={{ border: fieldBorder(otpErr) }}
            />
            {otpErr && <div className="text-center text-[12px] font-bold text-danger">Kode OTP salah. Coba lagi.</div>}
            <div onClick={verifyOtp} data-testid="fp-verify" className="flex h-[54px] cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15.5px] font-extrabold text-cream" style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}>
              Verifikasi
            </div>
            <div className="text-center text-[12.5px] font-semibold text-muted">
              Belum dapat kode? <span onClick={() => showToast('Kode OTP dikirim ulang ✓')} className="cursor-pointer font-extrabold text-brand">Kirim ulang</span>
            </div>
          </>
        )}

        {step === 'reset' && (
          <>
            <div>
              <div className="text-[18px] font-extrabold tracking-[-0.3px]">Buat password baru</div>
              <div className="mt-[3px] text-[12.5px] font-semibold leading-[1.55] text-muted">
                Nomor terverifikasi ✓ — sekarang bikin password baru.
              </div>
            </div>
            <div className="flex flex-col gap-[7px]">
              <label className="text-[12.5px] font-bold text-ink-soft">Password baru</label>
              <div className="box-border flex h-[52px] items-center gap-[10px] rounded-[14px] border border-[rgba(23,37,28,.12)] bg-white px-4">
                <input value={pass} onChange={(e) => setPass(e.target.value.slice(0, 30))} type={showPass ? 'text' : 'password'} placeholder="Minimal 6 karakter" className="h-full min-w-0 flex-1 border-none bg-transparent text-[15px] font-semibold text-ink" data-testid="fp-new" />
                <div onClick={() => setShowPass(!showPass)} className="flex flex-none cursor-pointer text-brand"><Icon name="eye" size={18} strokeWidth={2.1} /></div>
              </div>
            </div>
            <div className="flex flex-col gap-[7px]">
              <label className="text-[12.5px] font-bold text-ink-soft">Konfirmasi password baru</label>
              <input value={pass2} onChange={(e) => setPass2(e.target.value.slice(0, 30))} type="password" placeholder="Ulangi password" className="box-border h-[52px] w-full rounded-[14px] border border-[rgba(23,37,28,.12)] bg-white px-4 text-[15px] font-semibold text-ink" data-testid="fp-new2" />
              {pass2.length > 0 && (
                <div className="text-[11.5px] font-bold" style={{ color: pass2 === pass ? '#0E6B39' : '#C6432D' }}>
                  {pass2 === pass ? 'Password cocok ✓' : 'Password belum sama'}
                </div>
              )}
            </div>
            <div onClick={savePass} data-testid="fp-save" className="flex h-[54px] cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15.5px] font-extrabold text-cream" style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}>
              Simpan Password Baru
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-10 text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand" style={{ boxShadow: '0 6px 18px rgba(14,107,57,.35)' }}>
              <Icon name="check" size={34} color="#F4F1EA" strokeWidth={3} />
            </div>
            <div>
              <div className="text-[19px] font-extrabold tracking-[-0.3px]">Password berhasil diubah</div>
              <div className="mx-auto mt-[6px] max-w-[280px] text-[13px] font-semibold leading-[1.6] text-muted">
                Sekarang kamu bisa masuk pakai password baru.
              </div>
            </div>
            <div onClick={() => nav('/login')} data-testid="fp-done" className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15px] font-extrabold text-cream" style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}>
              Masuk Sekarang
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
