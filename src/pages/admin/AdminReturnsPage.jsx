/**
 * ADMIN RETURNS — Pengembalian & inspeksi: check-in unit, checklist 12 titik,
 * kalkulasi denda otomatis, dan penyelesaian deposit (PRD 10.3 #8-#10).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { PackageCheck, RefreshCw, ClipboardCheck, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  Alert, Card, Checkbox, EmptyState, Field, InfoRow, Input, LoadingBlock, Modal,
  PageHeader, Pill, ProgressBar, SectionTitle, Select, Table, Td, TextArea, Tr,
} from '../../components/ui';
import { OrderStatusBadge } from '../../components/shared';
import { rentalApi } from '../../api/rentalApi';
import { adminOrderApi } from '../../api/adminOrderApi';
import { adminApi } from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDocumentTitle } from '../../hooks';
import { formatRupiah, formatDateTime } from '../../utils/formatter';
import { calculateLateFine, calculateDepositSettlement } from '../../utils/pricingEngine';
import {
  ACCESSORY_FINE_RATES, BODY_CONDITION, BODY_CONDITION_LABELS, FINE_TYPE, FINE_TYPE_LABELS,
  INSPECTION_CHECKLIST, ORDER_STATUS, SCREEN_CONDITION, SCREEN_CONDITION_LABELS,
} from '../../constants';

const DAMAGE_RATES = { SCREEN_CRACKED: 1500000, SCREEN_SCRATCHED: 150000, BODY_DENTED: 350000, BODY_SCRATCHED: 100000, ICLOUD_LOCKED: 500000 };
const ACC_LABELS = { cable: 'Kabel Charging', charger_brick: 'Kepala Charger', box: 'Boks Original' };

const makeForm = (unit) => {
  const n = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return {
    actualReturnTime: `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}T${p(n.getHours())}:${p(n.getMinutes())}`,
    returnedBatteryHealth: unit?.batteryHealth || 90,
    icloudRemoved: false, passcodeRemoved: false,
    screenCondition: SCREEN_CONDITION.GOOD, bodyCondition: BODY_CONDITION.PRISTINE,
    checklist: INSPECTION_CHECKLIST.reduce((a, i) => ({ ...a, [i.key]: true }), {}),
    accessoriesReturned: { cable: true, charger_brick: true, box: true },
    inspectionNotes: '',
  };
};

export const AdminReturnsPage = () => {
  useDocumentTitle('Pengembalian & Inspeksi');
  const notify = useNotification();

  const [orders, setOrders] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('incoming');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(makeForm());
  const [manualFines, setManualFines] = useState([]);
  const [processing, setProcessing] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([rentalApi.listAll({}), adminApi.listUnits({})])
      .then(([o, u]) => { setOrders(o.data || []); setUnits(u.data || []); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const incoming = orders.filter((o) => [ORDER_STATUS.ACTIVE_RENTAL, ORDER_STATUS.OVERDUE].includes(o.orderStatus));
  const awaiting = orders.filter((o) => [ORDER_STATUS.RETURNED, ORDER_STATUS.INSPECTION_PENDING].includes(o.orderStatus));
  const done = orders.filter((o) => o.inspection && o.orderStatus === ORDER_STATUS.COMPLETED);
  const displayed = tab === 'incoming' ? incoming : tab === 'inspection' ? awaiting : done;

  const unitOf = (order) => {
    const id = (order.items || []).find((i) => i.allocatedUnitId)?.allocatedUnitId;
    return units.find((u) => u.id === id) || null;
  };

  const openInspection = (order) => { setSelected(order); setManualFines([]); setForm(makeForm(unitOf(order))); };

  const lateFine = useMemo(() => {
    if (!selected || !form.actualReturnTime) return { amount: 0, note: '' };
    return calculateLateFine(selected.endDate, form.actualReturnTime, (selected.items || [])[0]?.itemDailyPrice || 0);
  }, [selected, form.actualReturnTime]);

  const allFines = useMemo(() => {
    const list = [];
    if (lateFine.amount > 0) list.push({ fineType: FINE_TYPE.LATE_RETURN, amount: lateFine.amount, reason: lateFine.note });

    Object.entries(form.accessoriesReturned).forEach(([k, ok]) => {
      if (!ok) list.push({ fineType: FINE_TYPE.MISSING_ACCESSORY, amount: ACCESSORY_FINE_RATES[k] || 0, reason: `${ACC_LABELS[k]} tidak dikembalikan` });
    });

    if (form.screenCondition === SCREEN_CONDITION.CRACKED) list.push({ fineType: FINE_TYPE.PHYSICAL_DAMAGE, amount: DAMAGE_RATES.SCREEN_CRACKED, reason: 'Layar retak/pecah' });
    else if (form.screenCondition === SCREEN_CONDITION.SCRATCHED) list.push({ fineType: FINE_TYPE.PHYSICAL_DAMAGE, amount: DAMAGE_RATES.SCREEN_SCRATCHED, reason: 'Baret baru pada layar' });

    if (form.bodyCondition === BODY_CONDITION.DENTED) list.push({ fineType: FINE_TYPE.PHYSICAL_DAMAGE, amount: DAMAGE_RATES.BODY_DENTED, reason: 'Penyok pada housing' });
    else if (form.bodyCondition === BODY_CONDITION.LIGHT_SCRATCH) list.push({ fineType: FINE_TYPE.PHYSICAL_DAMAGE, amount: DAMAGE_RATES.BODY_SCRATCHED, reason: 'Baret halus baru pada body' });

    if (!form.icloudRemoved) list.push({ fineType: FINE_TYPE.ICLOUD_LOCKED, amount: DAMAGE_RATES.ICLOUD_LOCKED, reason: 'Akun iCloud belum dihapus' });

    return [...list, ...manualFines].filter((f) => f.amount > 0);
  }, [lateFine, form, manualFines]);

  const settlement = useMemo(
    () => calculateDepositSettlement(selected?.securityDeposit || 0, allFines),
    [selected, allFines]
  );

  const failedChecks = INSPECTION_CHECKLIST.filter((i) => form.checklist[i.key] === false);

  const handleSubmit = async () => {
    if (!form.icloudRemoved || !form.passcodeRemoved) {
      notify.warning('Konfirmasi iCloud & passcode wajib dicentang');
      return;
    }
    setProcessing(true);
    try {
      const res = await adminOrderApi.submitInspection(
        selected.id,
        { ...form, actualReturnTime: new Date(form.actualReturnTime).toISOString(), initialBatteryHealth: unitOf(selected)?.batteryHealth, fines: allFines },
        user
      );
      notify.success(res.message);
      setSelected(null);
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const toggleCheck = (key) => setForm((p) => ({ ...p, checklist: { ...p.checklist, [key]: p.checklist[key] === false } }));

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Pengembalian & Inspeksi"
        subtitle="Check-in unit, jalankan checklist 12 titik, dan hitung denda otomatis."
        actions={<Button variant="secondary" className="text-xs flex items-center gap-2" onClick={load}><RefreshCw size={13} /> Muat Ulang</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F2FD] flex items-center justify-center"><PackageCheck size={18} className="text-[#0071E3]" /></div>
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Sedang Disewa</p><p className="text-lg font-bold text-[#1D1D1F]">{incoming.length} unit</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><ClipboardCheck size={18} className="text-amber-600" /></div>
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Perlu Inspeksi</p><p className="text-lg font-bold text-[#1D1D1F]">{awaiting.length} unit</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-600" /></div>
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Inspeksi Selesai</p><p className="text-lg font-bold text-[#1D1D1F]">{done.length} unit</p></div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="flex flex-wrap gap-2">
          {[
            { v: 'incoming', l: `Sedang Disewa (${incoming.length})` },
            { v: 'inspection', l: `Menunggu Inspeksi (${awaiting.length})` },
            { v: 'completed', l: `Selesai (${done.length})` },
          ].map((t) => (
            <button key={t.v} type="button" onClick={() => setTab(t.v)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${tab === t.v ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200'}`}>
              {t.l}
            </button>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        {displayed.length === 0 ? (
          <EmptyState icon={PackageCheck} title="Tidak ada unit" description="Tidak ada unit pada kategori ini." />
        ) : (
          <div className="p-5">
            <Table columns={[
              { key: 'order', label: 'Pesanan' }, { key: 'customer', label: 'Customer' },
              { key: 'unit', label: 'Unit / IMEI' }, { key: 'due', label: 'Jatuh Tempo' },
              { key: 'status', label: 'Status' }, { key: 'action', label: '', align: 'right' },
            ]}>
              {displayed.map((order) => {
                const overdue = new Date(order.endDate) < new Date();
                return (
                  <Tr key={order.id}>
                    <Td><span className="font-mono text-[11px]">{order.orderNumber}</span></Td>
                    <Td><p className="font-medium">{order.customerName}</p><p className="text-[10px] text-gray-400">{order.customerPhone}</p></Td>
                    <Td>
                      <p>{(order.items || [])[0]?.modelName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{(order.items || [])[0]?.allocatedImei || '-'}</p>
                    </Td>
                    <Td>
                      <span className="text-[11px]">{formatDateTime(order.endDate)}</span>
                      {overdue && tab === 'incoming' && <span className="block text-[10px] text-rose-600 font-semibold">Terlambat</span>}
                    </Td>
                    <Td><OrderStatusBadge status={order.orderStatus} size="xs" /></Td>
                    <Td align="right">
                      {tab === 'completed' ? (
                        <Button variant="secondary" className="text-[10px] px-3 py-1.5" onClick={() => setSelected({ ...order, readonly: true })}>Lihat Hasil</Button>
                      ) : (
                        <Button variant={order.orderStatus === ORDER_STATUS.INSPECTION_PENDING ? 'primary' : 'secondary'} className="text-[10px] px-3 py-1.5" onClick={() => openInspection(order)}>
                          {order.orderStatus === ORDER_STATUS.INSPECTION_PENDING ? 'Mulai Inspeksi' : 'Check-in'}
                        </Button>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected?.readonly ? 'Hasil Inspeksi' : 'Formulir Inspeksi Pengembalian'}
        subtitle={selected ? `${selected.orderNumber} · ${selected.customerName}` : ''}
        footer={
          selected?.readonly ? (
            <Button variant="secondary" className="text-xs" onClick={() => setSelected(null)}>Tutup</Button>
          ) : (
            <>
              <Button variant="secondary" className="text-xs" onClick={() => setSelected(null)}>Batal</Button>
              <Button variant="primary" className="text-xs" disabled={processing} onClick={handleSubmit}>
                {processing ? 'Menyimpan...' : 'Simpan & Selesaikan'}
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            {selected.readonly && selected.inspection ? (
              <Card className="bg-[#F9F9FB]">
                <div className="divide-y divide-gray-100">
                  <InfoRow label="Waktu Kembali" value={formatDateTime(selected.inspection.actualReturnTime)} />
                  <InfoRow label="Battery Health Awal" value={`${selected.inspection.initialBatteryHealth}%`} />
                  <InfoRow label="Battery Health Kembali" value={`${selected.inspection.returnedBatteryHealth}%`} />
                  <InfoRow label="iCloud Dihapus" value={selected.inspection.icloudRemoved ? 'Ya' : 'Tidak'} />
                  <InfoRow label="Passcode Dihapus" value={selected.inspection.passcodeRemoved ? 'Ya' : 'Tidak'} />
                  <InfoRow label="Kondisi Layar" value={SCREEN_CONDITION_LABELS[selected.inspection.screenCondition]} />
                  <InfoRow label="Kondisi Body" value={BODY_CONDITION_LABELS[selected.inspection.bodyCondition]} />
                  <InfoRow label="Total Denda" value={formatRupiah((selected.fines || []).reduce((s, f) => s + f.amount, 0))} strong />
                </div>
                {selected.inspection.inspectionNotes && <p className="text-xs text-gray-500 mt-3">{selected.inspection.inspectionNotes}</p>}
              </Card>
            ) : (
              <>
                <Card className="bg-[#F9F9FB]">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Unit</p>
                      <p className="text-xs font-semibold text-[#1D1D1F] mt-1">{(selected.items || [])[0]?.modelName}</p>
                      <p className="text-[10px] text-gray-400">{(selected.items || [])[0]?.storageCapacity} · {(selected.items || [])[0]?.colorName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">IMEI</p>
                      <p className="text-xs font-semibold font-mono text-[#1D1D1F] mt-1">{(selected.items || [])[0]?.allocatedImei || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Deposit</p>
                      <p className="text-xs font-semibold text-[#1D1D1F] mt-1">{formatRupiah(selected.securityDeposit)}</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <SectionTitle subtitle="Waktu unit diterima & kondisi baterai saat kembali">Data Pengembalian</SectionTitle>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Waktu Pengembalian Aktual" required>
                      <Input type="datetime-local" value={form.actualReturnTime} onChange={(e) => setForm({ ...form, actualReturnTime: e.target.value })} />
                    </Field>
                    <Field label="Battery Health Saat Kembali (%)" required>
                      <Input type="number" min="1" max="100" value={form.returnedBatteryHealth} onChange={(e) => setForm({ ...form, returnedBatteryHealth: e.target.value })} />
                    </Field>
                  </div>
                  {lateFine.amount > 0 && (
                    <Alert tone="danger" className="mt-4" title="Denda keterlambatan terdeteksi">
                      {lateFine.note} — {formatRupiah(lateFine.amount)}
                    </Alert>
                  )}
                </Card>

                <Card>
                  <SectionTitle
                    subtitle="Klik untuk menandai item bermasalah (default: normal)"
                    actions={failedChecks.length > 0 && <Pill tone="danger" size="xs">{failedChecks.length} bermasalah</Pill>}
                  >
                    Checklist Hardware (12 Titik)
                  </SectionTitle>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {INSPECTION_CHECKLIST.map((item) => {
                      const ok = form.checklist[item.key] !== false;
                      return (
                        <button key={item.key} type="button" onClick={() => toggleCheck(item.key)}
                          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                          <span className="text-[11px] font-medium text-[#1D1D1F]">{item.label}</span>
                          <Pill tone={ok ? 'success' : 'danger'} size="xs">{ok ? 'Normal' : 'Bermasalah'}</Pill>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card>
                  <SectionTitle subtitle="Kondisi kosmetik unit saat dikembalikan">Kondisi Fisik</SectionTitle>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Kondisi Layar" required>
                      <Select value={form.screenCondition} onChange={(e) => setForm({ ...form, screenCondition: e.target.value })}>
                        {Object.entries(SCREEN_CONDITION_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </Select>
                    </Field>
                    <Field label="Kondisi Body" required>
                      <Select value={form.bodyCondition} onChange={(e) => setForm({ ...form, bodyCondition: e.target.value })}>
                        {Object.entries(BODY_CONDITION_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <div className="mt-4 space-y-3">
                    <Checkbox checked={form.icloudRemoved} onChange={(e) => setForm({ ...form, icloudRemoved: e.target.checked })}
                      label="Akun iCloud sudah dihapus (wajib)" description="Unit tidak dapat disewakan ulang jika masih terkunci iCloud" />
                    <Checkbox checked={form.passcodeRemoved} onChange={(e) => setForm({ ...form, passcodeRemoved: e.target.checked })}
                      label="Passcode layar sudah dihapus (wajib)" />
                  </div>
                </Card>

                <Card>
                  <SectionTitle subtitle="Centang aksesori yang dikembalikan lengkap">Kelengkapan Aksesori</SectionTitle>
                  <div className="space-y-3">
                    {Object.entries(ACC_LABELS).map(([key, label]) => (
                      <Checkbox key={key} checked={form.accessoriesReturned[key]}
                        onChange={(e) => setForm({ ...form, accessoriesReturned: { ...form.accessoriesReturned, [key]: e.target.checked } })}
                        label={label} description={`Denda jika hilang: ${formatRupiah(ACCESSORY_FINE_RATES[key])}`} />
                    ))}
                  </div>
                </Card>

                <Card>
                  <SectionTitle
                    subtitle="Tambahan denda yang tidak terdeteksi otomatis"
                    actions={
                      <Button variant="secondary" className="text-[10px] px-3 py-2 flex items-center gap-1"
                        onClick={() => setManualFines([...manualFines, { fineType: FINE_TYPE.OTHER, amount: 0, reason: '' }])}>
                        <Plus size={11} /> Tambah
                      </Button>
                    }
                  >
                    Denda Manual
                  </SectionTitle>
                  {manualFines.length === 0 ? (
                    <p className="text-[11px] text-gray-400">Belum ada denda manual.</p>
                  ) : (
                    <div className="space-y-2">
                      {manualFines.map((fine, idx) => (
                        <div key={idx} className="grid sm:grid-cols-[150px_120px_1fr_36px] gap-2 items-start">
                          <Select value={fine.fineType} onChange={(e) => { const n = [...manualFines]; n[idx] = { ...fine, fineType: e.target.value }; setManualFines(n); }}>
                            {Object.entries(FINE_TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                          </Select>
                          <Input type="number" placeholder="Nominal" value={fine.amount}
                            onChange={(e) => { const n = [...manualFines]; n[idx] = { ...fine, amount: Number(e.target.value) }; setManualFines(n); }} />
                          <Input placeholder="Alasan denda" value={fine.reason}
                            onChange={(e) => { const n = [...manualFines]; n[idx] = { ...fine, reason: e.target.value }; setManualFines(n); }} />
                          <button type="button" onClick={() => setManualFines(manualFines.filter((_, i) => i !== idx))}
                            aria-label="Hapus denda" className="w-9 h-9 rounded-xl text-rose-500 hover:bg-rose-50 flex items-center justify-center">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Field label="Catatan Inspeksi">
                  <TextArea value={form.inspectionNotes} onChange={(e) => setForm({ ...form, inspectionNotes: e.target.value })}
                    placeholder="Contoh: Kondisi baik, ada baret halus baru pada back cover." />
                </Field>
              </>
            )}

            <Card className="bg-[#F9F9FB]">
              <SectionTitle subtitle="Perhitungan denda & pengembalian deposit">Penyelesaian Deposit</SectionTitle>
              <div className="divide-y divide-gray-100">
                <InfoRow label="Deposit Dibayar" value={formatRupiah(selected.securityDeposit || 0)} />
                {allFines.map((f, i) => (
                  <InfoRow key={i} label={FINE_TYPE_LABELS[f.fineType] || f.fineType} value={`- ${formatRupiah(f.amount)}`} valueClass="text-rose-600" />
                ))}
                <InfoRow label="Total Denda" value={formatRupiah(settlement.totalFines)} strong valueClass="text-rose-600" />
                {settlement.additionalInvoice > 0 ? (
                  <InfoRow label="Tagihan Tambahan" value={formatRupiah(settlement.additionalInvoice)} strong valueClass="text-rose-600" />
                ) : (
                  <InfoRow label="Deposit Dikembalikan" value={formatRupiah(Math.max(0, settlement.refundAmount))} strong valueClass="text-emerald-600" />
                )}
              </div>
              <div className="mt-4">
                <ProgressBar value={selected.securityDeposit ? (settlement.totalFines / selected.securityDeposit) * 100 : 0}
                  tone={settlement.additionalInvoice > 0 ? 'danger' : 'warning'} showLabel />
                <p className="text-[10px] text-gray-400 mt-1">Proporsi denda terhadap deposit</p>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminReturnsPage;