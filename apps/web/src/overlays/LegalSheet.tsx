import { Icon } from '../components/Icon';

export type LegalKind = 'tos' | 'privacy';

const CONTENT: Record<LegalKind, { h: string; p: string }[]> = {
  tos: [
    { h: '1. Penerimaan Ketentuan', p: 'Dengan mendaftar dan menggunakan aplikasi Qlosir, kamu setuju terikat pada Syarat & Ketentuan ini. Jika tidak setuju, mohon berhenti menggunakan layanan.' },
    { h: '2. Akun & Keamanan', p: 'Kamu bertanggung jawab menjaga kerahasiaan PIN dan password akun. Semua transaksi yang tercatat lewat akunmu dianggap sah dan menjadi tanggung jawabmu.' },
    { h: '3. Penggunaan Layanan', p: 'Qlosir disediakan untuk mencatat penjualan, mengelola stok, dan membuat invoice. Dilarang menggunakan layanan untuk aktivitas melanggar hukum atau merugikan pihak lain.' },
    { h: '4. Data Transaksi', p: 'Data penjualan dan produk tersimpan di perangkatmu dan tersinkron ke cloud saat online. Kamu tetap pemilik penuh atas data toko kamu.' },
    { h: '5. Perubahan Layanan', p: 'Kami dapat memperbarui fitur atau ketentuan sewaktu-waktu. Perubahan penting akan diberitahukan melalui aplikasi.' },
  ],
  privacy: [
    { h: '1. Data yang Kami Kumpulkan', p: 'Kami mengumpulkan nama pemilik, nama toko, nomor HP, serta data produk dan transaksi yang kamu masukkan untuk menjalankan layanan.' },
    { h: '2. Penggunaan Data', p: 'Data dipakai untuk menyediakan fitur kasir, laporan penjualan, dan sinkronisasi antar perangkat. Kami tidak menjual data pribadimu ke pihak ketiga.' },
    { h: '3. Penyimpanan & Keamanan', p: 'Data disimpan secara lokal di perangkat dan dienkripsi saat disinkron ke server. Kami menerapkan langkah wajar untuk melindungi datamu.' },
    { h: '4. Berbagi Invoice', p: 'Saat kamu mengirim invoice via WhatsApp atau link publik, isi struk dapat diakses oleh siapa pun yang memiliki tautan tersebut.' },
    { h: '5. Hak Kamu', p: 'Kamu dapat meminta ekspor atau penghapusan data toko kapan saja melalui menu Pengaturan atau menghubungi dukungan Qlosir.' },
  ],
};

// Legal popup (TOS / privacy). Top-anchored sheet from the prototype.
export function LegalSheet({
  kind,
  onClose,
  onAgree,
}: {
  kind: LegalKind;
  onClose: () => void;
  onAgree: () => void;
}) {
  const title = kind === 'tos' ? 'Syarat & Ketentuan' : 'Kebijakan Privasi';
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col"
      style={{ background: 'rgba(23,37,28,.5)', animation: 'overlayIn .2s ease both' }}
      data-testid="legal-sheet"
    >
      <div className="h-16 flex-none" onClick={onClose} />
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px] bg-cream"
        style={{
          boxShadow: '0 -8px 30px rgba(23,37,28,.25)',
          animation: 'sheetUp .3s cubic-bezier(.3,1.1,.4,1) both',
        }}
      >
        <div className="flex flex-none items-start justify-between gap-3 border-b border-[rgba(23,37,28,.08)] px-5 pt-5 pb-[14px]">
          <div>
            <div className="text-[17px] font-extrabold tracking-[-0.3px]">{title}</div>
            <div className="mt-[2px] text-[11.5px] font-semibold text-muted">
              Terakhir diperbarui 1 Juli 2026
            </div>
          </div>
          <div
            onClick={onClose}
            className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-[11px] bg-page"
          >
            <Icon name="close" size={15} color="#4A5850" strokeWidth={2.6} />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-[18px] pb-2">
          {CONTENT[kind].map((s, i) => (
            <div key={i} className="mb-[18px]">
              <div className="mb-[6px] text-[13.5px] font-extrabold text-ink">{s.h}</div>
              <div className="text-[12.5px] font-medium leading-[1.65] text-ink-soft">{s.p}</div>
            </div>
          ))}
          <div className="px-0 pt-[6px] pb-1 text-center text-[11px] font-semibold text-muted-3">
            Ini teks contoh untuk prototype — bukan dokumen hukum final.
          </div>
        </div>
        <div className="flex-none border-t border-[rgba(23,37,28,.08)] bg-cream px-5 pt-[14px] pb-[22px]">
          <div
            onClick={onAgree}
            className="flex h-[52px] cursor-pointer items-center justify-center rounded-2xl bg-brand text-[15px] font-extrabold text-cream"
            style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
          >
            Saya Mengerti &amp; Setuju
          </div>
        </div>
      </div>
    </div>
  );
}
