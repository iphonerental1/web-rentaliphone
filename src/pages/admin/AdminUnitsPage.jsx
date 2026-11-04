/**
 * INVENTARIS UNIT FISIK (/admin/units) — CRUD unit IMEI.
 * Status unit utamanya dikendalikan alur booking; di sini hanya untuk
 * pengecualian (maintenance, inspeksi, pensiun, dsb).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Battery, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  SkeletonTable,
  Table,
} from '../../components/ui';
import { Button } from '../../components/common/Button';
import { GradeBadge, ImageUpload, UnitStatusBadge } from '../../components/shared';
import { adminApi } from '../../api/adminApi';
import { catalogApi } from '../../api/catalogApi';
import { UNIT_STATUS, UNIT_STATUS_META } from '../../constants';
import { fileToDataUrl } from '../../utils/imageHelpers';
import { useDocumentTitle } from '../../hooks';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  ...Object.entries(UNIT_STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
];

const emptyUnit = {
  variantId: '',
  imei: '',
  batteryHealth: 90,
  physicalGrade: 'GRADE_A',
  currentStatus: UNIT_STATUS.AVAILABLE,
  notes: '',
  imageFile: null,
};

export const AdminUnitsPage = () => {
  useDocumentTitle('Inventaris Unit — Admin');
  const [units, setUnits] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // unit id saat mode edit
  const [form, setForm] = useState(emptyUnit);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.listUnits({ status: statusFilter, search });
    setUnits(res.data);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => {
    catalogApi.list({ limit: 500 }).then((res) => setVariants(res.data));
  }, []);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyUnit);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (unit) => {
    setEditing(unit.id);
    setForm({
      variantId: unit.variantId,
      imei: unit.imei,
      batteryHealth: unit.batteryHealth,
      physicalGrade: unit.physicalGrade,
      currentStatus: unit.currentStatus,
      notes: unit.notes || '',
      imageFile: null,
    });
    setFormError('');
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const imageUrl = form.imageFile?.file ? await fileToDataUrl(form.imageFile.file) : '';
      const { imageFile, ...rest } = form;
      const payload = imageUrl ? { ...rest, imageUrl } : rest;
      const res = editing
        ? await adminApi.updateUnit(editing, payload)
        : await adminApi.createUnit(payload);
      setShowForm(false);
      flash(res.message);
      load();
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan unit');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await adminApi.deleteUnit(confirmDelete.id);
      flash(res.message);
      load();
    } catch (err) {
      flash(err?.message || 'Gagal menghapus unit');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1D1D1F]">Inventaris Unit Fisik</h1>
          <p className="text-xs text-gray-500">
            Data unit per IMEI — battery health, grade fisik, dan status ketersediaan.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="flex items-center gap-2 self-start">
          <Plus size={15} /> Tambah Unit
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari IMEI, model, warna..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-52">
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : units.length === 0 ? (
          <EmptyState title="Belum ada unit" description="Tambahkan unit fisik pertama Anda." />
        ) : (
          <Table
            columns={[
              { key: 'unit', label: 'Unit' },
              { key: 'imei', label: 'IMEI' },
              { key: 'battery', label: 'Baterai', align: 'center' },
              { key: 'grade', label: 'Grade' },
              { key: 'status', label: 'Status' },
              { key: 'action', label: '', align: 'right' },
            ]}
          >
            {units.map((u) => (
              <tr key={u.id} className="hover:bg-[#F9F9FB] transition-colors">
                <td className="px-3 py-3">
                  <p className="text-xs font-medium text-[#1D1D1F]">{u.modelName}</p>
                  <p className="text-[10px] text-gray-500">
                    {u.storageCapacity} · {u.colorName}
                  </p>
                </td>
                <td className="px-3 py-3 text-[11px] font-mono text-gray-600">{u.imei}</td>
                <td className="px-3 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      u.batteryHealth >= 90 ? 'text-emerald-600' : u.batteryHealth >= 80 ? 'text-amber-600' : 'text-rose-600'
                    }`}
                  >
                    <Battery size={12} /> {u.batteryHealth}%
                  </span>
                </td>
                <td className="px-3 py-3">
                  <GradeBadge grade={u.physicalGrade} size="xs" />
                </td>
                <td className="px-3 py-3">
                  <UnitStatusBadge status={u.currentStatus} size="xs" />
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => openEdit(u)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#0071E3] hover:bg-[#0071E3]/10 transition-colors"
                    title="Edit unit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(u)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                    title="Hapus unit"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1D1D1F] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT UNIT */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Unit' : 'Tambah Unit Baru'}
        subtitle="Identitas fisik device — IMEI wajib unik"
        size="md"
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="un-variant">
              Varian (Model · Kapasitas · Warna) *
            </label>
            <Select
              id="un-variant"
              value={form.variantId}
              onChange={(e) => setField('variantId', e.target.value)}
              required
              disabled={!!editing}
            >
              <option value="">— Pilih varian —</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.modelName} · {v.storageCapacity} · {v.colorName}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="un-imei">
                IMEI *
              </label>
              <Input id="un-imei" value={form.imei} onChange={(e) => setField('imei', e.target.value)} placeholder="15 digit nomor IMEI" inputMode="numeric" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="un-bh">
                Battery Health (%)
              </label>
              <Input id="un-bh" type="number" min={50} max={100} value={form.batteryHealth} onChange={(e) => setField('batteryHealth', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="un-grade">
                Grade Fisik
              </label>
              <Select id="un-grade" value={form.physicalGrade} onChange={(e) => setField('physicalGrade', e.target.value)}>
                <option value="GRADE_A">Grade A (pristine)</option>
                <option value="GRADE_B">Grade B (good)</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="un-status">
                Status
              </label>
              <Select id="un-status" value={form.currentStatus} onChange={(e) => setField('currentStatus', e.target.value)}>
                {Object.entries(UNIT_STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] mb-1 block" htmlFor="un-notes">
              Catatan
            </label>
            <textarea
              id="un-notes"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={2}
              placeholder="Kelengkapan: charger, case, handbag..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40"
            />
          </div>

          <ImageUpload
            label="Foto Unit (opsional)"
            hint="JPG / PNG / WebP maks. 5 MB — foto kondisi fisik unit ini"
            value={form.imageFile || null}
            onChange={(val) => setField('imageFile', val)}
            aspect="h-24 sm:h-28 w-full"
          />

          {formError && <p className="text-xs text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{formError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Simpan Perubahan' : 'Tambah Unit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* KONFIRMASI HAPUS */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Hapus Unit?"
        subtitle={confirmDelete ? `IMEI ${confirmDelete.imei}` : ''}
        size="sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button type="button" variant="secondary" onClick={() => setConfirmDelete(null)}>
              Batal
            </Button>
            <Button type="button" variant="danger" onClick={onDelete}>
              Ya, Hapus
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Unit akan dihapus permanen dari inventaris. Pastikan unit tidak sedang dalam transaksi
          aktif.
        </p>
      </Modal>
    </div>
  );
};

export default AdminUnitsPage;
