import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { allTransactions } from '../../store/selectors';
import { fmt, fmtD, MONTHS_SHORT, num } from '../../lib/format';
import { Icon } from '../../components/Icon';
import { RangeCalendar, type Range } from '../../overlays/RangeCalendar';
import type { CalDate } from '../../types';

const TODAY: CalDate = { y: 2026, m: 6, d: 19 };
const FILTERS = ['Semua', 'Cash', 'QRIS'] as const;
type Filter = (typeof FILTERS)[number];

// RIWAYAT TRANSAKSI — all transactions (seed + session), filterable by payment
// method and date range. Tapping a row opens its receipt.
export function HistoryScreen() {
  const nav = useNavigate();
  const seedTx = useStore((s) => s.seedTx);
  const sessionTx = useStore((s) => s.sessionTx);
  const openTxFromHistory = useStore((s) => s.openTxFromHistory);

  const [filter, setFilter] = useState<Filter>('Semua');
  const [range, setRange] = useState<Range>({ start: TODAY, end: TODAY });
  const [calOpen, setCalOpen] = useState(false);

  const rs = num(range.start);
  const re = num(range.end);

  const rows = useMemo(() => {
    const combined = allTransactions(seedTx, sessionTx)
      .filter((x) => (!rs || x.dateNum >= rs) && (!re || x.dateNum <= re))
      .sort((a, b) => b.dateNum - a.dateNum || b.time.localeCompare(a.time));
    return combined.filter(
      (x) =>
        filter === 'Semua' ||
        (filter === 'Cash' ? x.method === 'cash' : x.method === 'qris'),
    );
  }, [seedTx, sessionTx, rs, re, filter]);

  const dayLabel = rs
    ? rs === re || !re
      ? fmtD(range.start)
      : fmtD(range.start) + ' – ' + fmtD(range.end)
    : 'Semua tanggal';

  const openTx = (txNo: string) => {
    const tx = allTransactions(seedTx, sessionTx).find((x) => x.no === txNo);
    if (!tx) return;
    openTxFromHistory(tx);
    nav('/receipt');
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-history"
    >
      <div className="flex flex-none flex-col gap-3 bg-brand px-5 pt-4 pb-[14px]">
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-extrabold text-cream">Riwayat Transaksi</span>
          <div
            onClick={() => setCalOpen(true)}
            data-testid="history-cal"
            className="flex cursor-pointer items-center gap-[7px] rounded-[10px] px-3 py-2 text-[12px] font-bold text-cream"
            style={{ background: 'rgba(244,241,234,.12)' }}
          >
            <Icon name="calendar" size={14} color="#F4F1EA" strokeWidth={2.2} />
            {dayLabel}
          </div>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <div
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`hist-filter-${f}`}
              className="flex h-[34px] cursor-pointer items-center rounded-full px-4 text-[12px] font-bold"
              style={
                filter === f
                  ? { background: '#F4F1EA', color: '#0E6B39' }
                  : { background: 'rgba(244,241,234,.12)', color: 'rgba(244,241,234,.8)' }
              }
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto px-5 pt-[14px] pb-5">
        {rows.length === 0 && (
          <div className="px-5 py-10 text-center text-[13px] font-semibold leading-[1.6] text-muted">
            Belum ada transaksi di rentang ini.
            <br />
            Transaksi baru dari layar Kasir bakal muncul di sini.
          </div>
        )}
        {rows.map((x) => {
          const isCash = x.method === 'cash';
          return (
            <div
              key={x.no}
              onClick={() => openTx(x.no)}
              data-testid={`hist-row-${x.no}`}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[rgba(23,37,28,.06)] bg-white p-[13px_14px]"
            >
              <div
                className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                style={isCash ? { background: '#E4F3E8', color: '#0E6B39' } : { background: '#FDF3E1', color: '#9A6A0B' }}
              >
                <Icon name={isCash ? 'register' : 'scan'} size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold">{x.no}</div>
                <div className="text-[11px] font-semibold text-muted">
                  {(x.date ? x.date.d + ' ' + MONTHS_SHORT[x.date.m] + ' · ' : '') +
                    x.time +
                    ' · ' +
                    x.items +
                    ' item'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[14px] font-extrabold text-brand">{fmt(x.total)}</div>
                <div
                  className="mt-[2px] text-[10.5px] font-extrabold"
                  style={{ color: isCash ? '#7A857E' : '#9A6A0B' }}
                >
                  {isCash ? 'Cash' : 'QRIS'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {calOpen && (
        <RangeCalendar
          title="Filter tanggal"
          initial={range}
          onApply={(r) => {
            setRange(r);
            setCalOpen(false);
          }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </div>
  );
}
