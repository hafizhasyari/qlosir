import { useStore } from '../store/useStore';

// Global toast pinned near the bottom of the device frame.
export function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      className="pointer-events-none absolute right-0 bottom-[34px] left-0 z-[70] flex justify-center px-5"
      data-testid="toast"
    >
      <div
        className="rounded-xl bg-ink px-[18px] py-[10px] text-center text-[12.5px] font-bold text-cream"
        style={{ boxShadow: '0 8px 24px rgba(23,37,28,.45)', animation: 'toastIn .2s ease' }}
      >
        {toast}
      </div>
    </div>
  );
}
