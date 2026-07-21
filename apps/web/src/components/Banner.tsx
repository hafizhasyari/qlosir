import { useStore } from '../store/useStore';
import { Icon } from './Icon';

// Top-of-frame offline / syncing banners. Rendered inside chrome screens only
// (never on auth screens), matching the prototype's showOfflineBar / showSyncBar.
export function Banner() {
  const online = useStore((s) => s.online);
  const syncing = useStore((s) => s.syncing);
  const pendingSync = useStore((s) => s.pendingSync);

  if (!online) {
    return (
      <div
        className="absolute top-0 right-0 left-0 z-[12] flex items-center gap-[10px] bg-ink px-4 py-[10px]"
        data-testid="offline-banner"
      >
        <Icon name="wifiOff" size={15} color="#E8A020" strokeWidth={2.2} />
        <span className="flex-1 text-[11.5px] font-bold text-cream">
          Offline — transaksi tersimpan di HP kamu
        </span>
        {pendingSync > 0 && (
          <span className="rounded-full bg-warning px-[9px] py-[3px] text-[10.5px] font-extrabold text-ink">
            {pendingSync} antre sync
          </span>
        )}
      </div>
    );
  }

  if (syncing) {
    return (
      <div
        className="absolute top-0 right-0 left-0 z-[12] flex items-center gap-[10px] bg-brand-dark px-4 py-[10px]"
        data-testid="sync-banner"
      >
        <Icon name="sync" size={15} color="#7BD98A" strokeWidth={2.4} />
        <span className="flex-1 text-[11.5px] font-bold text-cream">
          Sinkronisasi {pendingSync} transaksi…
        </span>
      </div>
    );
  }

  return null;
}
