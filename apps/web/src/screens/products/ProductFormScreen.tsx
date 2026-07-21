import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Icon } from '../../components/Icon';
import { ScanSheet } from '../../overlays/ScanSheet';

const UNIT_PRESETS = ['pcs', 'btl', 'bks', 'ltr', 'kg', 'sct', 'sak', 'tbg'];
const fieldCls =
  'box-border h-[50px] w-full rounded-[14px] border border-[rgba(23,37,28,.12)] bg-white px-4 text-[14px] font-semibold text-ink';

// TAMBAH / EDIT PRODUK — one form for both. Edit prefills from the product and
// hides the initial-stock field (stock changes go through Restock/Adjustment).
export function ProductFormScreen() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const products = useStore((s) => s.products);
  const saveNewProduct = useStore((s) => s.saveNewProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const showToast = useStore((s) => s.showToast);

  const editing = products.find((p) => p.id === Number(id));
  const isEdit = !!editing;
  const scannedBarcode = (location.state as { barcode?: string } | null)?.barcode ?? '';

  const [nama, setNama] = useState(editing?.name ?? '');
  const [sku, setSku] = useState(editing?.sku ?? '');
  const [barcode, setBarcode] = useState(editing?.barcode ?? scannedBarcode);
  const [cat, setCat] = useState(editing?.cat ?? '');
  const [unit, setUnit] = useState(editing?.unit ?? 'pcs');
  const [jual, setJual] = useState(editing ? String(editing.price) : '');
  const [beli, setBeli] = useState(editing?.buy ? String(editing.buy) : '');
  const [stok, setStok] = useState('');
  const [scanning, setScanning] = useState(false);

  const catSuggest = useMemo(
    () => [...new Set(products.map((p) => p.cat).filter(Boolean))],
    [products],
  );
  const isCustomUnit = !!unit && !UNIT_PRESETS.includes(unit);

  const rp = (v: string) => (v ? 'Rp ' + parseInt(v, 10).toLocaleString('id-ID') : '');

  const save = () => {
    const name = nama.trim();
    const price = parseInt(jual || '0', 10);
    if (!name) return showToast('Isi nama produk dulu');
    if (!cat.trim()) return showToast('Isi kategori produk dulu');
    if (!price) return showToast('Isi harga jual dulu');
    const input = { name, sku, barcode, cat, unit, price, buy: parseInt(beli || '0', 10) };
    if (isEdit) {
      updateProduct(editing.id, input);
      showToast('Perubahan produk tersimpan ✓');
      nav('/products/' + editing.id);
      return;
    }
    const newId = saveNewProduct({ ...input, stock: parseInt(stok || '0', 10) });
    showToast('Produk "' + name + '" tersimpan ✓');
    nav('/products/' + newId);
  };

  const scanHit = () => {
    const codes = products.map((p) => p.barcode).filter(Boolean);
    const code = codes.length
      ? codes[Math.floor(Math.random() * codes.length)]
      : String(8990000000000 + Math.floor(Math.random() * 9999999));
    setBarcode(code);
    setScanning(false);
    showToast('Barcode terbaca: ' + code);
  };
  const scanMiss = () => {
    const fake = String(8990000000000 + Math.floor(Math.random() * 8999999));
    setBarcode(fake);
    setScanning(false);
    showToast('Barcode baru: ' + fake);
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ animation: 'screenIn .26s ease both' }}
      data-testid="screen-product-form"
    >
      <div
        onClick={() => nav(isEdit ? '/products/' + editing.id : '/products')}
        className="flex flex-none cursor-pointer items-center gap-3 bg-brand px-5 py-[18px]"
      >
        <Icon name="back" size={22} color="#F4F1EA" strokeWidth={2.4} />
        <span className="text-[17px] font-extrabold text-cream">
          {isEdit ? 'Edit Produk' : 'Tambah Produk'}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-5 py-4">
        <Field label="Nama produk">
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value.slice(0, 40))}
            placeholder="cth: Kecap Manis 135ml"
            data-testid="form-name"
            className={fieldCls}
          />
        </Field>

        <Field label="SKU" hint="(kosongkan untuk auto)">
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase().slice(0, 12))}
            placeholder="cth: KCP-001"
            data-testid="form-sku"
            className={fieldCls}
          />
        </Field>

        <Field label="Barcode" hint="(opsional)">
          <div className="flex gap-[10px]">
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.replace(/\D/g, '').slice(0, 13))}
              placeholder="Scan atau ketik manual"
              inputMode="numeric"
              data-testid="form-barcode"
              className={fieldCls + ' min-w-0 flex-1 tracking-[.5px]'}
            />
            <div
              onClick={() => setScanning(true)}
              className="flex h-[50px] w-[50px] flex-none cursor-pointer items-center justify-center rounded-[14px] bg-brand"
            >
              <Icon name="scan" size={22} color="#F4F1EA" strokeWidth={2.2} />
            </div>
          </div>
        </Field>

        <Field label="Kategori">
          <input
            value={cat}
            onChange={(e) => setCat(e.target.value.slice(0, 20))}
            placeholder="cth: Sembako, Minuman, Rokok…"
            data-testid="form-cat"
            className={fieldCls}
          />
          {catSuggest.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] font-semibold text-muted">Pakai lagi:</span>
              {catSuggest.map((c) => (
                <div
                  key={c}
                  onClick={() => setCat(c)}
                  className="flex h-[34px] cursor-pointer items-center rounded-full px-[13px] text-[12px] font-bold"
                  style={
                    cat === c
                      ? { background: '#17251C', color: '#F4F1EA' }
                      : { background: '#fff', color: '#4A5850', border: '1px solid rgba(23,37,28,.1)' }
                  }
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </Field>

        <Field label="Satuan">
          <div className="flex flex-wrap gap-2">
            {UNIT_PRESETS.map((u) => (
              <div
                key={u}
                onClick={() => setUnit(u)}
                className="flex h-10 cursor-pointer items-center rounded-full px-[14px] text-[12.5px] font-bold"
                style={
                  unit === u
                    ? { background: '#0E6B39', color: '#F4F1EA' }
                    : { background: '#fff', color: '#4A5850', border: '1px solid rgba(23,37,28,.1)' }
                }
              >
                {u}
              </div>
            ))}
            <input
              value={isCustomUnit ? unit : ''}
              onChange={(e) => setUnit(e.target.value.toLowerCase().slice(0, 8))}
              placeholder="+ lainnya"
              className="box-border h-10 w-24 rounded-full px-[14px] text-[12.5px] font-bold outline-none"
              style={
                isCustomUnit
                  ? { background: '#0E6B39', color: '#F4F1EA', border: '1px solid #0E6B39' }
                  : { background: '#fff', color: '#17251C', border: '1px dashed rgba(23,37,28,.25)' }
              }
            />
          </div>
        </Field>

        <div className="flex gap-3">
          <Field label="Harga jual" className="flex-1">
            <input
              value={rp(jual)}
              onChange={(e) => setJual(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Rp 0"
              inputMode="numeric"
              data-testid="form-price"
              className={fieldCls + ' min-w-0 text-brand'}
            />
          </Field>
          <Field label="Harga beli" className="flex-1">
            <input
              value={rp(beli)}
              onChange={(e) => setBeli(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Rp 0"
              inputMode="numeric"
              data-testid="form-buy"
              className={fieldCls + ' min-w-0'}
            />
          </Field>
        </div>

        {isEdit ? (
          <div className="rounded-[14px] border border-[rgba(23,37,28,.08)] bg-white p-[12px_16px] text-[12px] font-semibold leading-[1.5] text-muted">
            Stok saat ini <strong className="text-ink">{editing.stock + ' ' + editing.unit}</strong>{' '}
            — ubah lewat Restock / Adjustment biar riwayatnya tercatat.
          </div>
        ) : (
          <Field label="Stok awal">
            <input
              value={stok}
              onChange={(e) => setStok(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0"
              inputMode="numeric"
              data-testid="form-stock"
              className={fieldCls}
            />
          </Field>
        )}
      </div>

      <div className="flex-none bg-cream px-5 pt-[14px] pb-[22px]">
        <div
          onClick={save}
          data-testid="form-save"
          className="flex h-14 cursor-pointer items-center justify-center rounded-2xl bg-brand text-[16px] font-extrabold text-cream"
          style={{ boxShadow: '0 6px 18px rgba(14,107,57,.3)' }}
        >
          {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
        </div>
      </div>

      {scanning && (
        <ScanSheet onHit={scanHit} onMiss={scanMiss} onClose={() => setScanning(false)} />
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={'flex flex-col gap-[7px] ' + (className ?? '')}>
      <label className="text-[12.5px] font-bold text-ink-soft">
        {label}
        {hint && <span className="font-semibold text-muted"> {hint}</span>}
      </label>
      {children}
    </div>
  );
}
