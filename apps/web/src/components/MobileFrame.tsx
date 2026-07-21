import type { ReactNode } from 'react';

// Full-screen PWA container. `position:relative` anchors overlays, banners,
// and toasts across the entire viewport.
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-cream overflow-x-hidden">
      {children}
    </div>
  );
}
