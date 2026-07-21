import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LogoMark } from '../../components/Icon';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

// LOGIN PIN — 6-digit till unlock with keypad, dots and shake-on-error.
export function PinScreen() {
  const nav = useNavigate();
  const storeName = useStore((s) => s.storeName());
  const verifyPin = useStore((s) => s.verifyPin);
  const logout = useStore((s) => s.logout);

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const press = (d: string) => {
    if (pin.length === 6) return;
    const next = d === 'del' ? pin.slice(0, -1) : pin.length < 6 ? pin + d : pin;
    setPin(next);
    setError(false);
    if (next.length === 6) {
      setTimeout(() => {
        if (verifyPin(next)) {
          nav('/cashier');
        } else {
          const a = attempts + 1;
          setAttempts(a);
          setError(true);
          setShake(true);
          setPin('');
          setTimeout(() => setShake(false), 450);
        }
      }, 200);
    }
  };

  const doLogout = () => {
    logout();
    nav('/login');
  };

  const dotFill = error ? '#F2B8AD' : '#F4F1EA';
  const dotBorder = error ? '2px solid rgba(242,184,173,.6)' : '2px solid rgba(244,241,234,.5)';
  const hint = error
    ? attempts >= 3
      ? `PIN salah ${attempts}×. Lupa PIN? Ganti akun & reset.`
      : 'PIN salah. Coba lagi.'
    : '(demo: PIN 123456)';

  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-brand"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-pin"
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 pt-10 pb-4">
        <LogoMark size={84} />
        <div className="text-center">
          <div className="text-[28px] font-extrabold tracking-[-0.5px] text-cream">Qlosir</div>
          <div className="mt-1 text-[13.5px] text-[rgba(244,241,234,.7)]">{storeName}</div>
        </div>
        <div className="mt-[10px] text-[14px] text-[rgba(244,241,234,.85)]">Masukkan PIN kamu</div>
        <div
          onClick={doLogout}
          className="cursor-pointer text-[12px] font-bold text-[rgba(244,241,234,.55)] underline"
          data-testid="pin-logout"
        >
          Ganti akun
        </div>
        <div
          className="flex gap-[14px]"
          style={{ animation: shake ? 'shakeX .45s cubic-bezier(.36,.07,.19,.97) both' : undefined }}
          data-testid="pin-dots"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-4 w-4 rounded-full"
              style={
                i < pin.length
                  ? { background: dotFill }
                  : { boxSizing: 'border-box', border: dotBorder }
              }
            />
          ))}
        </div>
        <div
          className="text-[11.5px]"
          style={{ fontWeight: error ? 700 : 600, color: error ? '#F2B8AD' : 'rgba(244,241,234,.55)' }}
        >
          {hint}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-brand-dark px-7 pt-[22px] pb-[30px]">
        {DIGITS.map((d, i) => {
          if (!d) return <div key={i} className="h-[60px]" />;
          if (d === 'del')
            return (
              <div
                key={i}
                onClick={() => press('del')}
                data-testid="pin-del"
                className="flex h-[60px] cursor-pointer items-center justify-center rounded-2xl"
                style={{ background: 'rgba(244,241,234,.06)' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F4F1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 5H8.5a2 2 0 0 0-1.6.8l-4.2 5.6a1 1 0 0 0 0 1.2l4.2 5.6a2 2 0 0 0 1.6.8H21a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
                  <path d="M17 9.5l-5 5M12 9.5l5 5" />
                </svg>
              </div>
            );
          return (
            <div
              key={i}
              onClick={() => press(d)}
              data-testid={`pin-${d}`}
              className="flex h-[60px] cursor-pointer items-center justify-center rounded-2xl text-[24px] font-semibold text-cream"
              style={{ background: 'rgba(244,241,234,.10)' }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
