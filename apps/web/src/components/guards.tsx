import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

// Requires a completed till-PIN unlock (and password login). Sends the user to
// the right earlier step otherwise.
export function RequireUnlocked({ children }: { children: ReactNode }) {
  const authed = useStore((s) => s.authed);
  const unlocked = useStore((s) => s.unlocked);
  if (!authed) return <Navigate to="/login" replace />;
  if (!unlocked) return <Navigate to="/pin" replace />;
  return <>{children}</>;
}

// Requires password login (used by the PIN screen).
export function RequireAuthed({ children }: { children: ReactNode }) {
  const authed = useStore((s) => s.authed);
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
