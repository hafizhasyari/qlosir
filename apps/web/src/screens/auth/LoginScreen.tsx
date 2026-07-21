import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Icon, LogoMark } from '../../components/Icon';

type AuthError = 'notfound' | 'wrongpass' | 'exists' | null;

// LOGIN AKUN — phone + password. Green top, cream sheet. Copy verbatim.
export function LoginScreen() {
  const nav = useNavigate();
  const login = useStore((s) => s.login);
  const showToast = useStore((s) => s.showToast);

  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<AuthError>(null);

  const doAuth = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      showToast('Isi nomor HP yang valid dulu');
      return;
    }
    if (!pass) {
      showToast('Isi password dulu');
      return;
    }
    const res = login(phone, pass);
    if (res === 'ok') {
      nav('/pin');
      return;
    }
    setError(res);
  };

  const errorText =
    error === 'notfound'
      ? 'Akun dengan nomor ini belum terdaftar.'
      : error === 'wrongpass'
        ? 'Password salah. Coba lagi atau reset password.'
        : error === 'exists'
          ? 'Nomor ini sudah terdaftar. Masuk pakai password kamu.'
          : '';
  const phoneErr = error === 'notfound' || error === 'exists';

  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-brand"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-login"
    >
      <div className="flex flex-none flex-col items-center gap-[14px] px-8 pt-16 pb-7">
        <LogoMark size={76} />
        <div className="text-center">
          <div className="text-[28px] font-extrabold tracking-[-0.5px] text-cream">Qlosir</div>
          <div className="mt-1 text-[13.5px] text-[rgba(244,241,234,.7)]">
            Kasir warung, beres dalam genggaman
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 rounded-t-[28px] bg-cream px-6 pt-7 pb-6">
        <div>
          <div className="text-[20px] font-extrabold tracking-[-0.3px]">Masuk</div>
          <div className="mt-[2px] text-[12.5px] font-semibold text-muted">
            Pakai akun pemilik toko kamu
          </div>
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12.5px] font-bold text-ink-soft">Nomor HP</label>
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/[^\d-+ ]/g, '').slice(0, 16));
              setError(null);
            }}
            placeholder="cth: 0812-3456-7890"
            inputMode="tel"
            data-testid="login-phone"
            className="box-border h-[52px] w-full rounded-[14px] bg-white px-4 text-[15px] font-semibold text-ink"
            style={{ border: `1px solid ${phoneErr ? '#C6432D' : 'rgba(23,37,28,.12)'}` }}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[12.5px] font-bold text-ink-soft">Password</label>
          <div
            className="box-border flex h-[52px] items-center gap-[10px] rounded-[14px] bg-white px-4"
            style={{
              border: `1px solid ${error === 'wrongpass' ? '#C6432D' : 'rgba(23,37,28,.12)'}`,
            }}
          >
            <input
              value={pass}
              onChange={(e) => {
                setPass(e.target.value.slice(0, 30));
                setError(null);
              }}
              type={showPass ? 'text' : 'password'}
              placeholder="Password kamu"
              data-testid="login-pass"
              className="h-full min-w-0 flex-1 border-none bg-transparent text-[15px] font-semibold text-ink"
            />
            <div
              onClick={() => setShowPass(!showPass)}
              className="flex flex-none cursor-pointer text-brand"
            >
              <Icon name="eye" size={18} strokeWidth={2.1} />
            </div>
          </div>
        </div>

        {error && (
          <div
            className="flex items-start gap-[9px] rounded-xl border px-[13px] py-[11px]"
            style={{ background: '#FDECE7', borderColor: 'rgba(198,67,45,.28)' }}
            data-testid="login-error"
          >
            <Icon
              name="alert"
              size={16}
              color="#C6432D"
              strokeWidth={2.2}
              className="mt-px flex-none"
            />
            <div className="flex-1 text-[12px] font-semibold leading-[1.5] text-danger-dark">
              {errorText}{' '}
              {error === 'notfound' && (
                <span
                  onClick={() => nav('/signup')}
                  className="cursor-pointer font-extrabold text-brand"
                >
                  Daftar sekarang
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-[11.5px] font-semibold text-muted-3">
            Demo: 0812-3456-7890 / warung123
          </div>
          <div
            onClick={() => nav('/forgot-password')}
            className="cursor-pointer text-[12.5px] font-bold text-brand"
          >
            Lupa password?
          </div>
        </div>

        <div
          onClick={doAuth}
          data-testid="login-submit"
          className="flex h-[54px] cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15.5px] font-extrabold text-cream"
          style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
        >
          Masuk
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[rgba(23,37,28,.12)]" />
          <span className="text-[11.5px] font-semibold text-muted">atau</span>
          <div className="h-px flex-1 bg-[rgba(23,37,28,.12)]" />
        </div>

        <div
          onClick={() => showToast('OTP WhatsApp dikirim (mock)')}
          className="box-border flex h-[52px] cursor-pointer items-center justify-center gap-[9px] rounded-2xl border-[1.5px] border-[rgba(23,37,28,.12)] bg-white text-[14px] font-bold text-ink"
        >
          <Icon name="whatsapp" size={18} color="#1FA855" />
          Masuk dengan WhatsApp OTP
        </div>

        <div className="mt-auto text-center text-[12.5px] font-semibold text-muted">
          Belum punya akun?{' '}
          <span onClick={() => nav('/signup')} className="cursor-pointer font-extrabold text-brand">
            Daftar gratis
          </span>
        </div>
      </div>
    </div>
  );
}
