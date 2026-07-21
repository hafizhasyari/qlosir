import { useLocation, useNavigate } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

// 5-tab bottom navigation. English route paths, Indonesian labels (per the copy
// rule). Active tab turns brand-green.
const TABS: { path: string; label: string; icon: IconName }[] = [
  { path: '/cashier', label: 'Kasir', icon: 'register' },
  { path: '/products', label: 'Produk', icon: 'box' },
  { path: '/history', label: 'Riwayat', icon: 'clock' },
  { path: '/reports', label: 'Laporan', icon: 'chart' },
  { path: '/settings', label: 'Setelan', icon: 'gear' },
];

export function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      className="flex flex-none border-t border-[rgba(23,37,28,.07)] bg-white px-3 pt-[10px] pb-4"
      data-testid="bottom-nav"
    >
      {TABS.map((t) => {
        const active = pathname === t.path;
        return (
          <div
            key={t.path}
            onClick={() => nav(t.path)}
            className="flex flex-1 cursor-pointer flex-col items-center gap-[3px]"
            data-testid={`nav-${t.label.toLowerCase()}`}
          >
            <Icon
              name={t.icon}
              size={22}
              color={active ? '#0E6B39' : '#9AA39D'}
              strokeWidth={2.1}
            />
            <span
              className="text-[10.5px]"
              style={{ fontWeight: active ? 800 : 600, color: active ? '#0E6B39' : '#9AA39D' }}
            >
              {t.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
