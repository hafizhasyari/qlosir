// Centralised SVG icon set. Paths are copied verbatim from the prototype so the
// rendered strokes match pixel-for-pixel. Stroke icons inherit `currentColor`
// unless a color is passed; a few are fill icons (whatsapp).

export type IconName =
  | 'eye'
  | 'alert'
  | 'back'
  | 'lock'
  | 'whatsapp'
  | 'check'
  | 'scan'
  | 'plus'
  | 'minus'
  | 'box'
  | 'download'
  | 'trash'
  | 'edit'
  | 'barcode'
  | 'printer'
  | 'link'
  | 'calendar'
  | 'clock'
  | 'chart'
  | 'gear'
  | 'register'
  | 'close'
  | 'logout'
  | 'wifiOff'
  | 'sync'
  | 'chevronRight';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string; // stroke or fill color override
  strokeWidth?: number;
}

// Each entry: [inner markup, isFill]
const PATHS: Record<IconName, [string, boolean]> = {
  eye: ['<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle>', false],
  alert: ['<circle cx="12" cy="12" r="10"></circle><path d="M12 8v5M12 16h.01"></path>', false],
  back: ['<path d="M15 18l-6-6 6-6"></path>', false],
  lock: ['<rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>', false],
  whatsapp: ['<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.3.4c-.1.2-.2.3 0 .6.2.3.9 1.4 1.9 2.3 1.3 1.2 2.4 1.5 2.7 1.7.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.2.5.3.6.4 0 .1 0 .8-.2 1.4z"></path>', true],
  check: ['<path d="M20 6L9 17l-5-5"></path>', false],
  scan: ['<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M7 12h10"></path>', false],
  plus: ['<path d="M12 5v14M5 12h14"></path>', false],
  minus: ['<path d="M5 12h14"></path>', false],
  box: ['<path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 8.1L12 13l8.7-4.9M12 13v9"></path>', false],
  download: ['<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path>', false],
  trash: ['<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"></path>', false],
  edit: ['<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>', false],
  barcode: ['<path d="M3 5v14M6 5v14M9 5v14M13 5v14M16 5v14M18 5v14M21 5v14"></path>', false],
  printer: ['<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"></path>', false],
  link: ['<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19"></path>', false],
  calendar: ['<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 9h18M8 2v4M16 2v4"></path>', false],
  clock: ['<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path>', false],
  chart: ['<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"></path>', false],
  gear: ['<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>', false],
  register: ['<rect x="3" y="4" width="18" height="14" rx="2"></rect><path d="M3 9h18M8 14h2"></path>', false],
  close: ['<path d="M6 6l12 12M18 6L6 18"></path>', false],
  logout: ['<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>', false],
  wifiOff: ['<path d="M1 1l22 22M9 9a7 7 0 0 0-2.4 1.6M5.3 5.3A11 11 0 0 0 1.4 9m11.3 3a4 4 0 0 1 2.9 1.2M16.9 12a7 7 0 0 1 2.5 1.6m3.2-4.6a11 11 0 0 0-5.2-3.3M12 20h.01"></path>', false],
  sync: ['<path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v5h-5"></path>', false],
  chevronRight: ['<path d="M9 18l6-6-6-6"></path>', false],
};

export function Icon({ name, size = 20, className, color, strokeWidth = 2 }: IconProps) {
  const [markup, isFill] = PATHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={isFill ? (color ?? 'currentColor') : 'none'}
      stroke={isFill ? undefined : (color ?? 'currentColor')}
      strokeWidth={isFill ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

// The Qlosir wordmark logo mark (green shop + loupe). Used on auth screens.
export function LogoMark({ size = 76 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 6 a11 11 0 0 1 11 11 v5" stroke="#E8A020" strokeWidth="7" strokeLinecap="round" />
      <path d="M32 6 a11 11 0 0 0 -11 11 v5" stroke="#E8A020" strokeWidth="7" strokeLinecap="round" />
      <rect x="13" y="22" width="38" height="32" rx="9" fill="#F4F1EA" />
      <path d="M44 48 L56 60" stroke="#F4F1EA" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}
