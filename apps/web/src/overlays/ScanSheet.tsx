import { useMemo } from 'react';
import { Icon } from '../components/Icon';

// Fullscreen barcode-scanner overlay. On a real device the camera feed fills the
// frame; here we render the prototype's animated placeholder plus the two
// simulation buttons the demo/E2E use to drive a hit or a miss.
export function ScanSheet({
  onHit,
  onMiss,
  onClose,
}: {
  onHit: () => void;
  onMiss: () => void;
  onClose: () => void;
}) {
  // Static bar pattern (widths chosen once per mount, like the prototype).
  const bars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => (i * 7) % 5 > 2).map((wide) => (wide ? 3 : 2)),
    [],
  );

  return (
    <div
      className="absolute inset-0 z-[25] flex flex-col"
      style={{ background: '#0B120E', animation: 'overlayIn .2s ease both' }}
      data-testid="scan-sheet"
    >
      <div className="flex flex-none items-center justify-between px-5 py-[18px] text-cream">
        <span className="text-[16px] font-extrabold">Scan Barcode</span>
        <div
          onClick={onClose}
          data-testid="scan-close"
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[11px]"
          style={{ background: 'rgba(244,241,234,.14)' }}
        >
          <Icon name="close" size={15} color="#F4F1EA" strokeWidth={2.6} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[22px] px-7">
        <div
          className="relative h-[250px] w-[250px] overflow-hidden rounded-[20px]"
          style={{ background: 'rgba(244,241,234,.04)' }}
        >
          <div className="absolute top-0 left-0 h-[34px] w-[34px] rounded-tl-[16px] border-t-4 border-l-4 border-success" />
          <div className="absolute top-0 right-0 h-[34px] w-[34px] rounded-tr-[16px] border-t-4 border-r-4 border-success" />
          <div className="absolute bottom-0 left-0 h-[34px] w-[34px] rounded-bl-[16px] border-b-4 border-l-4 border-success" />
          <div className="absolute right-0 bottom-0 h-[34px] w-[34px] rounded-br-[16px] border-r-4 border-b-4 border-success" />
          <div
            className="absolute right-[14%] left-[14%] h-[2.5px] bg-success"
            style={{ boxShadow: '0 0 12px 2px rgba(123,217,138,.7)', animation: 'scanLine 2.2s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/2 right-0 left-0 flex -translate-y-1/2 justify-center gap-[3px] px-10 opacity-50"
          >
            {bars.map((w, i) => (
              <div key={i} className="h-[120px] bg-success" style={{ width: w }} />
            ))}
          </div>
        </div>
        <div className="text-center text-[13px] font-semibold leading-[1.55] text-[rgba(244,241,234,.7)]">
          Arahkan kamera ke barcode produk.
          <br />
          Kamera asli aktif di perangkat sungguhan.
        </div>
      </div>

      <div className="flex flex-none flex-col gap-[10px] px-6 pt-4 pb-[26px]">
        <div
          onClick={onHit}
          data-testid="scan-hit"
          className="flex h-[54px] cursor-pointer items-center justify-center gap-[9px] rounded-2xl bg-brand text-[15px] font-extrabold text-cream"
        >
          <Icon name="scan" size={19} color="#F4F1EA" strokeWidth={2.2} />
          Simulasi Scan Produk
        </div>
        <div
          onClick={onMiss}
          data-testid="scan-miss"
          className="flex h-[44px] cursor-pointer items-center justify-center rounded-[14px] text-[13px] font-bold text-[rgba(244,241,234,.85)]"
          style={{ background: 'rgba(244,241,234,.1)' }}
        >
          Simulasi barcode tak dikenal
        </div>
      </div>
    </div>
  );
}
