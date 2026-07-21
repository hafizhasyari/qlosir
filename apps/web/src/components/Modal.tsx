import type { ReactNode } from 'react';

// Centered popup dialog (popIn animation) — used for the delete confirmation.
export function Modal({
  children,
  z = 11,
  testId,
}: {
  children: ReactNode;
  z?: number;
  testId?: string;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-8"
      style={{ zIndex: z, background: 'rgba(23,37,28,.45)', animation: 'overlayIn .2s ease both' }}
      data-testid={testId}
    >
      <div
        className="flex w-full flex-col gap-[14px] rounded-[20px] bg-white p-[22px]"
        style={{
          boxShadow: '0 12px 40px rgba(23,37,28,.3)',
          animation: 'popIn .24s cubic-bezier(.3,1.1,.4,1) both',
        }}
      >
        {children}
      </div>
    </div>
  );
}
