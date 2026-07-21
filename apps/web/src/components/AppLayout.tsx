import { Outlet, useLocation } from 'react-router-dom';
import { MobileFrame } from './MobileFrame';
import { BottomNav } from './BottomNav';
import { Banner } from './Banner';
import { Toast } from './Toast';

// Routes that show the 5-tab bottom navigation.
const NAV_PATHS = ['/cashier', '/products', '/history', '/reports', '/settings'];

// Chrome layout: device frame + offline/sync banner + toast, with the bottom
// nav shown only on the five primary tabs.
export function AppLayout() {
  const { pathname } = useLocation();
  const showNav = NAV_PATHS.includes(pathname);
  const showBanner = !['/login', '/signup', '/forgot-password', '/pin'].includes(pathname);

  return (
    <MobileFrame>
      {showBanner && <Banner />}
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      {showNav && <BottomNav />}
      <Toast />
    </MobileFrame>
  );
}
