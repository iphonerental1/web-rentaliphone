/**
 * ADMIN MAINTENANCE — Log servis perangkat, tracking unit di service center,
 * dan pemantauan health baterai armada (PRD 10.3 #11).
 */

import React, { useEffect, useState } from 'react';
import { Wrench, BarChart3, RefreshCw, CheckCircle2, ShieldAlert, TrendingUp } from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  Alert,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  ProgressBar,
  SectionTitle,
  Select,
  StatCard,
  Table,
  Td,
  TextArea,
  Tr,
} from '../../components/ui';
import { BatteryBadge, GradeBadge, UnitStatusBadge } from '../../components/shared';
import { adminApi } from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDocumentTitle } from '../../hooks';
import { formatPercent } from '../../utils/formatter';
import { MAINTENANCE_TYPE_LABELS, UNIT_STATUS_META } from '../../constants';

export const AdminMaintenancePage = () => {
  useDocumentTitle('Maintenance Unit');
  const notify = useNotification();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    maintenanceType: 'ROUTINE_CHECK',
    cost: 0,
    startDate: new Date().toISOString().slice(0, 10),
    vendorName: '',
    description: '',
  });
  const [processing, setProcessing] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listUnits({})
      .then((res) => setUnits(res.data || []))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const inMaintenance = units.filter((u) => u.currentStatus === 'MAINTENANCE');
  const lowBattery = units.filter((u) => u.batteryHealth < 85 && u.currentStatus !== 'MAINTENANCE');
  const avgHealth = units.reduce((s, u) => s + u.batteryHealth, 0) / (units.length || 1);

  const openMaintenance = (unit) => {
    setSelected(unit);
    setForm({
      maintenanceType: unit.batteryHealth < 80 ? 'BATTERY_REPLACEMENT' : 'ROUTINE_CHECK',
      cost: 0,
      startDate: new Date().toISOString().slice(0, 10),
      vendorName: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    if (form.description.trim().length < 5) {
      notify.warning('Deskripsi pekerjaan maintenance wajib diisi (min. 5 karakter)');
      return;
    }

    setProcessing(true);
    try {
      await adminApi.updateUnit(
        selected.id,
        { currentStatus: 'MAINTENANCE', notes: `[MAINTENANCE] ${form.description}` },
        user
      );
      notify.success(`Unit ${selected.imei} dikirim ke maintenance`);
      setSelected(null);
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const finishMaintenance = async (unit) => {
    setProcessing(true);
    try {
      await adminApi.updateUnit(
        unit.id,
        { currentStatus: 'AVAILABLE', notes: `${unit.notes || ''} — maintenance selesai`.trim() },
        user
      );
      notify.success(`Unit ${unit.imei} kembali tersedia`);
      load();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Maintenance Unit"
        subtitle="Kelola unit di service center dan pantau health baterai armada."
        actions={
          <Button variant="secondary" className="text-xs flex items-center gap-2" onClick={load}>
            <RefreshCw size={13} /> Muat Ulang
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Sedang Maintenance" value={inMaintenance.length} icon={Wrench} tone="warning" />
        <StatCard label="Baterai Kritis" value={lowBattery.length} hint="BH < 85%, perlu servis" icon={ShieldAlert} tone="danger" />
        <StatCard label="Total Unit" value={units.length} icon={BarChart3} tone="brand" />
        <StatCard label="Health Rata-rata" value={formatPercent(avgHealth)} icon={TrendingUp} tone="success" />
      </div>

      <Card className="mb-5">
        <SectionTitle subtitle="Unit yang sedang diperbaiki di service center">Unit Dalam Maintenance</SectionTitle>

        {inMaintenance.length === 0 ? (
          <EmptyState icon={Wrench} title="Tidak ada unit di maintenance" description="Semua unit siap operasional." />
        ) : (
          <div className="space-y-3">
            {inMaintenance.map((unit) => (
              <div
                key={unit.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 p-4"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1D1D1F] font-mono">{unit.imei}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {unit.modelName} · {unit.storageCapacity} · SN {unit.serialNumber}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <BatteryBadge health={unit.batteryHealth} />
                    <GradeBadge grade={unit.physicalGrade} size="xs" />
                    <UnitStatusBadge status={unit.currentStatus} size="xs" />
                  </div>
                  {unit.notes && <p className="text-[10px] text-gray-400 mt-2">{unit.notes}</p>}
                </div>
                <Button
                  variant="primary"
                  className="text-[10px] px-3 py-2 shrink-0"
                  disabled={processing}
                  onClick={() => finishMaintenance(unit)}
                >
                  Tandai Selesai
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padded={false}>
        <div className="p-5">
          <SectionTitle subtitle="Unit dengan battery health di bawah standar (grade C)">Perlu Perhatian</SectionTitle>

          {lowBattery.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Semua unit sehat" description="Tidak ada unit dengan baterai kritis." />
          ) : (
            <Table
              columns={[
                { key: 'imei', label: 'IMEI / SN' },
                { key: 'model', label: 'Model' },
                { key: 'health', label: 'Battery Health' },
                { key: 'grade', label: 'Grade' },
                { key: 'action', label: '', align: 'right' },
              ]}
            >
              {lowBattery.map((unit) => (
                <Tr key={unit.id}>
                  <Td>
                    <p className="font-mono text-[11px]">{unit.imei}</p>
                    <p className="font-mono text-[10px] text-gray-400">SN {unit.serialNumber}</p>
                  </Td>
                  <Td>
                    {unit.modelName}
                    <span className="block text-[10px] text-gray-400">{unit.storageCapacity}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <ProgressBar value={unit.batteryHealth} tone={unit.batteryHealth >= 80 ? 'warning' : 'danger'} />
                      </div>
                      <span className="text-[11px] font-semibold">{unit.batteryHealth}%</span>
                    </div>
                  </Td>
                  <Td>
                    <GradeBadge grade={unit.physicalGrade} size="xs" />
                  </Td>
                  <Td align="right">
                    <Button variant="secondary" className="text-[10px] px-3 py-1.5" onClick={() => openMaintenance(unit)}>
                      Jadwalkan Servis
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </div>
      </Card>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="md"
        title="Jadwalkan Maintenance"
        subtitle={selected ? `${selected.modelName} · IMEI ${selected.imei}` : ''}
        footer={
          <>
            <Button variant="secondary" className="text-xs" onClick={() => setSelected(null)}>
              Batal
            </Button>
            <Button variant="primary" className="text-xs" disabled={processing} onClick={handleSubmit}>
              {processing ? 'Memproses...' : 'Kirim ke Maintenance'}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#F5F5F7] p-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Baterai</p>
                <p className="text-sm font-bold text-[#1D1D1F] mt-0.5">{selected.batteryHealth}%</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Grade</p>
                <p className="text-sm font-bold text-[#1D1D1F] mt-0.5">
                  {selected.physicalGrade.replace('GRADE_', '')}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Status</p>
                <p className="text-sm font-bold text-[#1D1D1F] mt-0.5">
                  {(UNIT_STATUS_META[selected.currentStatus] || {}).label}
                </p>
              </div>
            </div>

            <Field label="Jenis Maintenance" required>
              <Select
                value={form.maintenanceType}
                onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })}
              >
                {Object.entries(MAINTENANCE_TYPE_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Estimasi Biaya (Rp)">
                <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </Field>
              <Field label="Tanggal Mulai" required>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Vendor / Service Center">
              <Input
                value={form.vendorName}
                onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                placeholder="Contoh: Apple Authorized Service / Mitra Care"
              />
            </Field>

            <Field label="Deskripsi Pekerjaan" required>
              <TextArea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Contoh: Ganti baterai original karena health sudah 78%"
              />
            </Field>

            <Alert tone="warning">
              Unit akan berstatus <strong>Maintenance</strong> dan tidak dapat dialokasikan ke pesanan
              selama perbaikan berlangsung.
            </Alert>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMaintenancePage;