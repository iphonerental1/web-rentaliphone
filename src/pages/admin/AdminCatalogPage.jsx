/**
 * MANAJEMEN KATALOG (/admin/katalog) — CRUD model iPhone.
 * Edit disimpan sebagai overlay (catalogStore) sehingga data statis aman;
 * perubahan langsung terlihat di katalog publik.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
  Card,
  EmptyState,
  Input,
  Modal,
  Pill,
  SkeletonTable,
  Table,
} from '../../components/ui';
import { Button } from '../../components/common/Button';
import { ImageUpload } from '../../components/shared';
import { adminApi } from '../../api/adminApi';
import { formatRupiah, slugify } from '../../utils/formatter';
import { fileToDataUrl } from '../../utils/imageHelpers';
import { useDocumentTitle } from '../../hooks';

const emptyNewModel = {
  modelName: '',
  storageCapacity: '128GB',
  colorName: '',
  dailyRate: 200000,
  weeklyRate: '',
  monthlyRate: '',
  securityDepositAmount: 0,
  releaseYear: new Date().getFullYear(),
  badge: '',
  description: '',
  screenSize: '6.1 inci',
  processor: '-',
  cameraSpecs: '-',
  imageFile: null,
};

export const AdminCatalogPage = () => {
  useDocumentTitle('Kelola Katalog — Admin');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ badge: '', description: '', isPublished: true, variantRates: [] });
  const [editImages, setEditImages] = useState({}); // { [variantId]: { file, previewUrl } }
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newModel, setNewModel] = useState(emptyNewModel);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.listCatalog();
    setModels(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? models.filter(
        (m) =>
          m.modelName.toLowerCase().includes(keyword) ||
          (m.badge || '').toLowerCase().includes(keyword)
      )
    : models;

  const openEdit = (m) => {
    setEditing(m);
    setEditForm({
      badge: m.badge || '',
      description: m.description || '',
      isPublished: m.isPublished !== false,
      variantRates: (m.variants || []).map((v) => ({ id: v.id, dailyRate: v.dailyRate })),
    });
    setEditImages({});
    setFormError('');
    setShowEdit(true);
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      // Konversi foto varian terpilih menjadi data URL (kompresi otomatis)
      const variantRates = await Promise.all(
        editForm.variantRates.map(async (vr) => {
          const picked = editImages[vr.id];
          if (!picked?.file) return vr;
          const imageUrl = await fileToDataUrl(picked.file);
          return { ...vr, imageUrl };
        })
      );
      const res = await adminApi.updateModel(editing.id, { ...editForm, variantRates });
      setShowEdit(false);
      flash(res.message);
      load();
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const setNewField = (key, value) => setNewModel((f) => ({ ...f, [key]: value }));

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const imageUrl = newModel.imageFile?.file
        ? await fileToDataUrl(newModel.imageFile.file)
        : '';
      const { imageFile, ...rest } = newModel;
      const res = await adminApi.createModel({ ...rest, imageUrl });
      setShowCreate(false);
      setNewModel(emptyNewModel);
      flash(res.message);
      load();
    } catch (err) {
      setFormError(err?.message || 'Gagal menambah model');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await adminApi.deleteModel(confirmDelete.id);
      flash(res.message);
      load();
    } catch (err) {
      flash(err?.message || 'Gagal menghapus model');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1D1D1F]">Manajemen Katalog</h1>
          <p className="text-xs text-gray-500">
            Tambah model, ubah harga/hadge, dan atur visibilitas di situs publik.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setNewModel(emptyNewModel);
            setFormError('');
            setShowCreate(true);
          }}
          className="flex items-center gap-2 self-start"
        >
          <Plus size={15} /> Tambah Model
        </Button>
      </div>

      <Card>
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama model atau badge..."
            className="pl-9"
          />
        </div>

        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState title="Tidak ada model" description="Coba kata kunci lain atau tambah model baru." />
        ) : (
          <Table
            columns={[
              { key: 'model', label: 'Model' },
              { key: 'variants', label: 'Varian', align: 'center' },
              { key: 'rate', label: 'Harga Mulai', align: 'right' },
              { key: 'badge', label: 'Badge' },
              { key: 'visibility', label: 'Visibilitas', align: 'center' },
              { key: 'action', label: '', align: 'right' },
            ]}
          >
            {filtered.map((m) => {
              const thumb =
                m.variants?.find((v) => v.images?.some((i) => i.isPrimary))?.images.find((i) => i.isPrimary)?.imageUrl ||
                m.variants?.[0]?.images?.[0]?.imageUrl ||
                '';
              return (
              <tr key={m.id} className="hover:bg-[#F9F9FB] transition-colors">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    {thumb && (
                      <img
                        src={thumb}
                        alt={m.modelName}
                        className="h-9 w-9 rounded-lg object-cover border border-gray-100 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                        {m.modelName}
                        {m.isCustom && (
                          <Pill tone="info" size="xs">
                            Baru
                          </Pill>
                        )}
                        {m.isOverridden && !m.isCustom && (
                          <Pill tone="warning" size="xs">
                            Diubah
                          </Pill>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {m.releaseYear} · {m.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-xs text-[#1D1D1F]">{m.variantCount}</td>
                <td className="px-3 py-3 text-right text-xs font-bold text-[#0071E3] whitespace-nowrap">
                  {formatRupiah(m.minRate)}/hari
                </td>
                <td className="px-3 py-3">
                  {m.badge ? (
                    <Pill tone="success" size="xs">
                      {m.badge}
                    </Pill>
                  ) : (
                    <span className="text-[11px] text-gray-400">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {m.isPublished !== false ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <Eye size={12} /> Tampil
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                      <EyeOff size={12} /> Tersembunyi
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#0071E3] hover:bg-[#0071E3]/10 transition-colors"
                    title="Edit model"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(m)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                    title={m.isCustom ? 'Hapus model' : 'Sembunyikan model'}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1D1D1F] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      {/* MODAL EDIT MODEL */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title={editing ? `Edit — ${editing.modelName}` : 'Edit Model'}
        subtitle="Perubahan langsung tampil di katalog publik"
        size="lg"
      >
        <form onSubmit={onEditSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="md-badge">
                Badge (opsional)
              </label>
              <Input
                id="md-badge"
                value={editForm.badge}
                onChange={(e) => setEditForm((f) => ({ ...f, badge: e.target.value }))}
                placeholder="Contoh: Terlaris, Best Value"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-[#1D1D1F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isPublished}
                  onChange={(e) => setEditForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-[#0071E3]"
                />
                Tampilkan di katalog publik
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="md-desc">
              Deskripsi
            </label>
            <textarea
              id="md-desc"
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Deskripsi menarik untuk calon penyewa..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#1D1D1F] mb-2">Harga Sewa Harian per Varian</p>
            <div className="space-y-2">
              {editForm.variantRates.map((vr, idx) => {
                const variant = (editing?.variants || []).find((v) => v.id === vr.id);
                return (
                  <div key={vr.id} className="rounded-xl border border-gray-100 px-3.5 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#1D1D1F] flex-1 min-w-0 truncate">
                        {variant ? `${variant.storageCapacity} · ${variant.colorName}` : vr.id}
                      </span>
                      <span className="text-[10px] text-gray-400 hidden sm:block">Rp / hari</span>
                      <Input
                        type="number"
                        min={0}
                        step={5000}
                        value={vr.dailyRate}
                        onChange={(e) =>
                          setEditForm((f) => {
                            const rates = [...f.variantRates];
                            rates[idx] = { ...rates[idx], dailyRate: e.target.value };
                            return { ...f, variantRates: rates };
                          })
                        }
                        className="w-32 text-right"
                      />
                    </div>
                    <div className="mt-2.5">
                      <ImageUpload
                        label="Foto utama varian (opsional)"
                        hint="JPG / PNG / WebP maks. 5 MB — foto ini tampil di katalog publik"
                        value={editImages[vr.id] || null}
                        onChange={(val) => setEditImages((prev) => ({ ...prev, [vr.id]: val }))}
                        aspect="h-24 sm:h-28 w-full"
                      />
                    </div>
                  </div>
                );
              })}
              {editForm.variantRates.length === 0 && (
                <p className="text-[11px] text-gray-400">Model ini tidak memiliki varian.</p>
              )}
            </div>
          </div>

          {formError && <p className="text-xs text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{formError}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowEdit(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL TAMBAH MODEL */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Tambah Model Baru"
        subtitle="Model buatan admin langsung tampil di katalog publik"
        size="lg"
      >
        <form onSubmit={onCreateSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-name">
                Nama Model *
              </label>
              <Input id="nm-name" value={newModel.modelName} onChange={(e) => setNewField('modelName', e.target.value)} placeholder="Contoh: iPhone 16 Pro" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-year">
                Tahun Rilis
              </label>
              <Input id="nm-year" type="number" min={2015} max={2030} value={newModel.releaseYear} onChange={(e) => setNewField('releaseYear', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-storage">
                Kapasitas *
              </label>
              <Input id="nm-storage" value={newModel.storageCapacity} onChange={(e) => setNewField('storageCapacity', e.target.value)} placeholder="128GB" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-color">
                Warna *
              </label>
              <Input id="nm-color" value={newModel.colorName} onChange={(e) => setNewField('colorName', e.target.value)} placeholder="Natural Titanium" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-daily">
                Harga Harian (Rp) *
              </label>
              <Input id="nm-daily" type="number" min={0} step={5000} value={newModel.dailyRate} onChange={(e) => setNewField('dailyRate', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block">
                Skema Pembayaran
              </label>
              <div className="w-full rounded-xl border border-gray-200 bg-[#F7FAFF] px-3.5 py-2 text-xs font-semibold text-[#0071E3]">
                Tanpa Deposit · Wajib DP 30%
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-weekly">
                Harga Mingguan (Rp, opsional)
              </label>
              <Input id="nm-weekly" type="number" min={0} step={10000} value={newModel.weeklyRate} onChange={(e) => setNewField('weeklyRate', e.target.value)} placeholder="otomatis 6× harian" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-monthly">
                Harga Bulanan (Rp, opsional)
              </label>
              <Input id="nm-monthly" type="number" min={0} step={50000} value={newModel.monthlyRate} onChange={(e) => setNewField('monthlyRate', e.target.value)} placeholder="otomatis 24× harian" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-badge">
                Badge (opsional)
              </label>
              <Input id="nm-badge" value={newModel.badge} onChange={(e) => setNewField('badge', e.target.value)} placeholder="Baru, Terbatas..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-proc">
                Processor
              </label>
              <Input id="nm-proc" value={newModel.processor} onChange={(e) => setNewField('processor', e.target.value)} placeholder="A18 Pro" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1D1D1F] mb-1.5 block" htmlFor="nm-desc">
              Deskripsi
            </label>
            <textarea
              id="nm-desc"
              value={newModel.description}
              onChange={(e) => setNewField('description', e.target.value)}
              rows={3}
              placeholder="Jelaskan keunggulan model ini untuk penyewa..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40"
            />
          </div>

          <ImageUpload
            label="Foto Model (opsional)"
            hint="JPG / PNG / WebP maks. 5 MB — tampil sebagai foto utama di katalog publik"
            value={newModel.imageFile || null}
            onChange={(val) => setNewField('imageFile', val)}
            aspect="aspect-[3/2]"
          />

          {formError && <p className="text-xs text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{formError}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Tambah Model
            </Button>
          </div>
        </form>
      </Modal>

      {/* KONFIRMASI HAPUS / SEMBUNYIKAN */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={confirmDelete?.isCustom ? 'Hapus Model?' : 'Sembunyikan Model?'}
        subtitle={confirmDelete ? confirmDelete.modelName : ''}
        size="sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button type="button" variant="secondary" onClick={() => setConfirmDelete(null)}>
              Batal
            </Button>
            <Button type="button" variant="danger" onClick={onDelete}>
              {confirmDelete?.isCustom ? 'Ya, Hapus' : 'Sembunyikan'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          {confirmDelete?.isCustom
            ? 'Model buatan admin akan dihapus permanen dari katalog.'
            : 'Model bawaan tidak dapat dihapus permanen, namun bisa disembunyikan dari katalog publik dan dikembalikan kapan saja.'}
        </p>
      </Modal>
    </div>
  );
};

export default AdminCatalogPage;
