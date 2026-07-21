import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { aggregateReport, allTransactions } from '../../store/selectors';
import { fmt, fmtD } from '../../lib/format';
import { Icon } from '../../components/Icon';
import { RangeCalendar, type Range } from '../../overlays/RangeCalendar';
import type { CalDate } from '../../types';

const TODAY: CalDate = { y: 2026, m: 6, d: 19 };

const PRESETS: { label: string; range: Range }[] = [
  { label: 'Hari ini', range: { start: { y: 2026, m: 6, d: 19 }, end: { y: 2026, m: 6, d: 19 } } },
  { label: '7 hari', range: { start: { y: 2026, m: 6, d: 13 }, end: { y: 2026, m: 6, d: 19 } } },
  { label: 'Bulan ini', range: { start: { y: 2026, m: 6, d: 1 }, end: { y: 2026, m: 6, d: 31 } } },
];

// LAPORAN — sales summary over a chosen date range: total + tx/item/avg tiles,
// a cash/QRIS split bar, and a top-products chart.
export function SalesReportScreen() {
  const seedTx = useStore((s) => s.seedTx);
  const sessionTx = useStore((s) => s.sessionTx);
  const showToast = useStore((s) => s.showToast);

  const [range, setRange] = useState<Range>({ start: TODAY, end: TODAY });
  const [calOpen, setCalOpen] = useState(false);

  const agg = useMemo(
    () => aggregateReport(allTransactions(seedTx, sessionTx), range.start, range.end),
    [seedTx, sessionTx, range],
  );

  const start = range.start ?? TODAY;
  const end = range.end ?? start;
  const days =
    Math.round(
      (new Date(end.y, end.m, end.d).getTime() - new Date(start.y, start.m, start.d).getTime()) /
        86400000,
    ) + 1;
  const sameDay = start.y === end.y && start.m === end.m && start.d === end.d;
  const dateLabel = sameDay ? fmtD(start) : fmtD(start) + ' – ' + fmtD(end);
  const periodLabel = sameDay ? 'Penjualan ' + fmtD(start) : 'Penjualan ' + days + ' hari';
  const avg = agg.txCount > 0 ? (agg.total / agg.txCount / 1000).toFixed(1).replace('.', ',') + 'rb' : '—';

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-reports"
    >
      <div className="flex flex-none flex-col gap-[14px] bg-brand px-5 pt-4 pb-[18px]">
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-extrabold text-cream">Laporan</span>
          <div
            onClick={() => setCalOpen(true)}
            data-testid="report-cal"
            className="flex cursor-pointer items-center gap-[7px] rounded-[10px] px-3 py-2 text-[12px] font-bold text-cream"
            style={{ background: 'rgba(244,241,234,.12)' }}
          >
            <Icon name="calendar" size={14} color="#F4F1EA" strokeWidth={2.2} />
            {dateLabel}
          </div>
        </div>
        <div>
          <div className="text-[11.5px] font-bold tracking-[.5px] text-[rgba(244,241,234,.65)] uppercase">
            {periodLabel}
          </div>
          <div
            className="mt-[2px] text-[34px] font-extrabold tracking-[-1px] text-cream"
            data-testid="report-total"
          >
            {fmt(agg.total)}
          </div>
          {agg.txCount > 0 && (
            <div className="mt-[2px] text-[12px] font-bold text-success">
              ▲ 12% vs periode sebelumnya
            </div>
          )}
        </div>
        <div className="flex gap-[10px]">
          <Tile label="Transaksi" value={String(agg.txCount)} />
          <Tile label="Item terjual" value={String(agg.items)} />
          <Tile label="Rata-rata" value={avg} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-5 pt-[14px] pb-5">
        <div className="flex flex-col gap-[10px] rounded-2xl border border-[rgba(23,37,28,.06)] bg-white p-4">
          <div className="text-[13px] font-extrabold text-ink-soft">Metode pembayaran</div>
          <div className="flex h-[14px] overflow-hidden rounded-full">
            <div style={{ width: agg.cashPct + '%', background: '#0E6B39' }} />
            <div style={{ width: 100 - agg.cashPct + '%', background: '#E8A020' }} />
          </div>
          <div className="flex justify-between text-[11.5px] font-bold">
            <span className="text-brand">● Cash · {fmt(agg.cash) + ' (' + agg.cashPct + '%)'}</span>
            <span className="text-warning-dark">
              ● QRIS · {fmt(agg.qris) + ' (' + (100 - agg.cashPct) + '%)'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-[rgba(23,37,28,.06)] bg-white p-4">
          <div className="text-[13px] font-extrabold text-ink-soft">Produk terlaris</div>
          {agg.tops.length === 0 ? (
            <div className="py-[14px] text-center text-[12.5px] font-semibold leading-[1.5] text-muted">
              Belum ada penjualan di rentang ini.
              <br />
              Transaksi pertama bakal muncul di sini.
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {agg.tops.map((t, i) => (
                <div key={i} className="flex items-center gap-[10px]">
                  <span className="w-[18px] text-[12px] font-extrabold text-muted">{i + 1}</span>
                  <span className="flex-1 text-[13px] font-bold">{t.name}</span>
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-page">
                    <div
                      className="h-full bg-brand"
                      style={{ width: Math.round((t.qy / agg.maxQ) * 100) + '%' }}
                    />
                  </div>
                  <span className="w-[52px] text-right text-[12px] font-extrabold">
                    {t.qy + ' ' + t.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          onClick={() => showToast('Laporan ter-export (CSV) ✓')}
          className="box-border flex h-[50px] flex-none cursor-pointer items-center justify-center gap-2 rounded-[14px] border-2 border-brand bg-white text-[14px] font-extrabold text-brand"
        >
          <Icon name="download" size={16} color="#0E6B39" strokeWidth={2.2} />
          Export laporan harian
        </div>
      </div>

      {calOpen && (
        <RangeCalendar
          title="Periode laporan"
          initial={range}
          presets={PRESETS}
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

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-[14px] p-[10px_12px]" style={{ background: 'rgba(244,241,234,.10)' }}>
      <div className="text-[11px] font-bold text-[rgba(244,241,234,.65)]">{label}</div>
      <div className="text-[19px] font-extrabold text-cream">{value}</div>
    </div>
  );
}
