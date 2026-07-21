import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

// Shared presentational primitives reused across screens. They encode the
// prototype's exact paddings/radii/colors so individual screens stay readable.

// Green header bar with an optional back chevron (used on sub-screens).
export function ScreenHeader({
  title,
  onBack,
  right,
  testId,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      className="flex flex-none items-center gap-3 bg-brand px-5 py-[18px]"
      data-testid={testId}
    >
      {onBack && (
        <div onClick={onBack} className="flex cursor-pointer" data-testid="back">
          <Icon name="back" size={22} color="#F4F1EA" strokeWidth={2.4} />
        </div>
      )}
      <span className="flex-1 text-[17px] font-extrabold text-cream">{title}</span>
      {right}
    </div>
  );
}

// Full-width primary (green) action button.
export function PrimaryButton({
  children,
  onClick,
  className,
  style,
  testId,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  testId?: string;
}) {
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className={
        'flex h-[54px] cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15.5px] font-extrabold text-cream ' +
        (className ?? '')
      }
      style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)', ...style }}
    >
      {children}
    </div>
  );
}

// Standard text input matching the cream-form field style.
export function TextField({
  value,
  onChange,
  placeholder,
  inputMode,
  type = 'text',
  className,
  style,
  testId,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'numeric';
  type?: string;
  className?: string;
  style?: CSSProperties;
  testId?: string;
  maxLength?: number;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      type={type}
      maxLength={maxLength}
      data-testid={testId}
      className={
        'box-border h-[52px] w-full rounded-[14px] border border-[rgba(23,37,28,.12)] bg-white px-4 text-[15px] font-semibold text-ink ' +
        (className ?? '')
      }
      style={style}
    />
  );
}

// A form field label.
export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-[12.5px] font-bold text-ink-soft">{children}</label>;
}

// Convenience hook: navigate helper.
export function useNav() {
  return useNavigate();
}
