import type { ReactNode } from 'react';

// Bottom sheet overlay: dimmed backdrop (tap to close) + upward-sliding panel.
// Mirrors the prototype's sheet markup (overlayIn + sheetUp animations).
export function Sheet({
  onClose,
  children,
  z = 16,
  testId,
}: {
  onClose: () => void;
  children: ReactNode;
  z?: number;
  testId?: string;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ zIndex: z, background: 'rgba(23,37,28,.45)', animation: 'overlayIn .2s ease both' }}
      data-testid={testId}
    >
      <div className="flex-1" onClick={onClose} />
      <div
        className="flex flex-col gap-[14px] rounded-t-[24px] bg-white px-5 pt-5 pb-6"
        style={{
          boxShadow: '0 -8px 30px rgba(23,37,28,.2)',
          animation: 'sheetUp .28s cubic-bezier(.3,1.1,.4,1) both',
        }}
      >
        {children}
      </div>
    </div>
  );
}
