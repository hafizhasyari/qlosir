import type { CalDate } from '../types';

// Rupiah formatting — matches the prototype's fmt(): "Rp 1.234".
export function fmt(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// Plain grouped number without the "Rp " prefix: "1.234".
export function group(n: number): string {
  return n.toLocaleString('id-ID');
}

export const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Comparable integer key for a calendar date.
export function num(d: CalDate | null | undefined): number | null {
  return d ? d.y * 10000 + d.m * 100 + d.d : null;
}

// Short date label: "19 Jul 2026" (or "—" when null).
export function fmtD(d: CalDate | null | undefined): string {
  return d ? `${d.d} ${MONTHS_SHORT[d.m]} ${d.y}` : '—';
}

// Current clock label used when creating new transactions / stock entries.
export function nowTime(): string {
  return new Date()
    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    .replace('.', ':');
}
