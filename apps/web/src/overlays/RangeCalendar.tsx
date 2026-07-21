import { useState } from 'react';
import type { CalDate } from '../types';
import { MONTHS, DOW, fmtD } from '../lib/format';
import { buildCalendarCells, pickRange } from '../store/selectors';
import { Icon } from '../components/Icon';

const TODAY: CalDate = { y: 2026, m: 6, d: 19 };

export interface Range {
  start: CalDate | null;
  end: CalDate | null;
}

// Shared bottom-sheet range picker used by History (title "Filter tanggal") and
// Reports (title "Periode laporan" + quick presets). Keeps a draft range while
// open; commits on "Terapkan".
export function RangeCalendar({
  title,
  initial,
  presets,
  onApply,
  onClose,
}: {
  title: string;
  initial: Range;
  presets?: { label: string; range: Range }[];
  onApply: (r: Range) => void;
  onClose: () => void;
}) {
  const [start, setStart] = useState<CalDate | null>(initial.start ?? TODAY);
  const [end, setEnd] = useState<CalDate | null>(initial.end ?? TODAY);
  const [y, setY] = useState((initial.end ?? initial.start ?? TODAY).y);
  const [m, setM] = useState((initial.end ?? initial.start ?? TODAY).m);

  const cells = buildCalendarCells(y, m, start, end);

  const pick = (d: CalDate) => {
    const next = pickRange(start, end, d);
    setStart(next.start);
    setEnd(next.end);
  };

  const prev = () => {
    setM((cm) => (cm === 0 ? 11 : cm - 1));
    setY((cy) => (m === 0 ? cy - 1 : cy));
  };
  const next = () => {
    setM((cm) => (cm === 11 ? 0 : cm + 1));
    setY((cy) => (m === 11 ? cy + 1 : cy));
  };

  const reset = () => onApply({ start: TODAY, end: TODAY });
  const apply = () => onApply({ start, end: end ?? start });

  return (
    <div
      className="absolute inset-0 z-[18] flex flex-col"
      style={{ background: 'rgba(23,37,28,.45)', animation: 'overlayIn .2s ease both' }}
      data-testid="range-calendar"
    >
      <div className="flex-1" onClick={onClose} />
      <div
        className="flex flex-col gap-4 rounded-t-[24px] bg-white px-5 pt-5 pb-6"
        style={{ boxShadow: '0 -8px 30px rgba(23,37,28,.2)', animation: 'sheetUp .28s cubic-bezier(.3,1.1,.4,1) both' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-extrabold">{title}</div>
          <div
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[10px] bg-cream"
          >
            <Icon name="close" size={14} color="#4A5850" strokeWidth={2.6} />
          </div>
        </div>

        {presets && (
          <div className="flex gap-2">
            {presets.map((p) => (
              <div
                key={p.label}
                onClick={() => {
                  setStart(p.range.start);
                  setEnd(p.range.end);
                  const b = p.range.end ?? p.range.start ?? TODAY;
                  setY(b.y);
                  setM(b.m);
                }}
                className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[10px] bg-cream text-[12px] font-bold text-ink-soft"
              >
                {p.label}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 rounded-xl bg-cream px-3 py-[9px]">
            <div className="text-[10.5px] font-bold text-muted">DARI</div>
            <div
              className="mt-px text-[13px] font-extrabold"
              style={{ color: start ? '#17251C' : '#B8B2A4' }}
            >
              {fmtD(start)}
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-cream px-3 py-[9px]">
            <div className="text-[10.5px] font-bold text-muted">SAMPAI</div>
            <div
              className="mt-px text-[13px] font-extrabold"
              style={{ color: end ? '#17251C' : '#B8B2A4' }}
            >
              {fmtD(end)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div
            onClick={prev}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[11px] bg-cream"
          >
            <Icon name="back" size={16} color="#17251C" strokeWidth={2.4} />
          </div>
          <div className="text-[14px] font-extrabold">
            {MONTHS[m]} {y}
          </div>
          <div
            onClick={next}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[11px] bg-cream"
          >
            <Icon name="chevronRight" size={16} color="#17251C" strokeWidth={2.4} />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-[3px]">
          {DOW.map((d) => (
            <div key={d} className="py-[2px] text-center text-[10.5px] font-bold text-muted-2">
              {d}
            </div>
          ))}
          {cells.map((c, i) => {
            const active = c.isStart || c.isEnd;
            return (
              <div
                key={i}
                onClick={c.date ? () => pick(c.date!) : undefined}
                className="flex h-[38px] items-center justify-center rounded-[10px] text-[13px]"
                style={{
                  cursor: c.date ? 'pointer' : 'default',
                  fontWeight: active ? 800 : 600,
                  background: active ? '#0E6B39' : c.inRange ? '#E4F3E8' : 'transparent',
                  color: active ? '#F4F1EA' : c.inRange ? '#0E6B39' : '#17251C',
                }}
              >
                {c.label}
              </div>
            );
          })}
        </div>

        <div className="flex gap-[10px]">
          <div
            onClick={reset}
            className="flex h-[50px] flex-1 cursor-pointer items-center justify-center rounded-[14px] bg-cream text-[14px] font-extrabold text-ink"
          >
            Reset
          </div>
          <div
            onClick={apply}
            data-testid="calendar-apply"
            className="flex h-[50px] flex-[2] cursor-pointer items-center justify-center rounded-[14px] bg-brand text-[14px] font-extrabold text-cream"
            style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
          >
            Terapkan
          </div>
        </div>
      </div>
    </div>
  );
}
