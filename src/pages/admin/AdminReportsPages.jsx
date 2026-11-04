/**
 * ADMIN REPORTS & AUDIT LOG — Laporan pendapatan, utilisasi armada, rekap denda,
 * dan jejak aktivitas sensitif (PRD 10.3 #12 & #14).
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet, TrendingUp, ShieldAlert, XCircle, FileSpreadsheet, CheckCircle2, ScrollText, Users, RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  Card, EmptyState, InfoRow, LoadingBlock, Modal, PageHeader, Pagination, Pill,
  ProgressBar, SearchInput, SectionTitle, Select, StatCard, Table, Td, Tr,
} from '../../components/ui';
import { BatteryBadge } from '../../components/shared';
import { adminApi } from '../../api/adminApi';
import { useDocumentTitle, usePagination } from '../../hooks';
import { formatRupiah, formatDateTime } from '../../utils/formatter';
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_TONES } from '../../data/seedAuditLogs';
import { FINE_TYPE_LABELS, ROLE_LABELS } from '../../constants';

/* ═══════════════ REPORTS ═══════════════ */
export const AdminReportsPage = () => {
  useDocumentTitle('Laporan & Analitik');
  const [overview, setOverview] = useState(null);
  const [fines, setFines] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.reportOverview(),
      adminApi.reportFinesSummary(),
      adminApi.reportUnitUtilization(),
      adminApi.reportRevenueTrend(),
    ])
      .then(([o, f, u, t]) => {
        setOverview(o.data);
        setFines(f.data);
        setUtilization(u.data || []);
        setTrend(t.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = useMemo(() => Math.max(...trend.map((t) => t.revenue), 1), [trend]);

  const exportCsv = () => {
    const rows = [
      ['Metrik', 'Nilai'],
      ['Total Pendapatan', overview?.totalRevenue || 0],
      ['Pendapatan Sewa', overview?.rentalRevenue || 0],
      ['Deposit Tertahan', overview?.depositHeld || 0],
      ['Total Denda', overview?.totalFines || 0],
      ['Total Pesanan', overview?.totalOrders || 0],
      ['Pesanan Selesai', overview?.completedOrders || 0],
      ['Pesanan Aktif', overview?.activeOrders || 0],
      ['Total Hari Sewa', overview?.totalRentalDays || 0],
      ['Utilisasi (%)', (overview?.utilizationPercent || 0).toFixed(1)],
      ['Total Unit', overview?.units?.total || 0],
      ['Unit Tersedia', overview?.units?.available || 0],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-irent-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Laporan & Analitik"
        subtitle="Ringkasan kinerja bisnis, utilisasi armada, dan rekap denda."
        actions={
          <Button variant="primary" className="text-xs flex items-center gap-2" onClick={exportCsv}>
            <FileSpreadsheet size={13} /> Ekspor CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Pendapatan" value={formatRupiah(overview?.totalRevenue || 0)} icon={Wallet} tone="success" />
        <StatCard label="Pendapatan Sewa" value={formatRupiah(overview?.rentalRevenue || 0)} icon={TrendingUp} tone="brand" />
        <StatCard label="Deposit Tertahan" value={formatRupiah(overview?.depositHeld || 0)} icon={ShieldAlert} tone="warning" />
        <StatCard label="Total Denda" value={formatRupiah(overview?.totalFines || 0)} icon={XCircle} tone="danger" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <SectionTitle subtitle="Pendapatan sewa 6 bulan terakhir">Tren Pendapatan</SectionTitle>
          <div className="flex items-end justify-between gap-2 h-44">
            {trend.map((t) => (
              <div key={t.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-[#1D1D1F]">
                  {t.revenue > 0 ? `${(t.revenue / 1000000).toFixed(1)}jt` : '0'}
                </span>
                <div className="w-full bg-[#0071E3] rounded-t-lg min-h-[4px]"
                  style={{ height: `${Math.max(4, (t.revenue / maxRevenue) * 130)}px` }} />
                <span className="text-[10px] text-gray-400">{t.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle subtitle="Kinerja operasional armada dan pesanan">Ringkasan Operasional</SectionTitle>
          <div className="divide-y divide-gray-50">
            <InfoRow label="Total Pesanan" value={overview?.totalOrders || 0} />
            <InfoRow label="Pesanan Selesai" value={overview?.completedOrders || 0} />
            <InfoRow label="Pesanan Aktif" value={overview?.activeOrders || 0} />
            <InfoRow label="Total Hari Sewa" value={`${overview?.totalRentalDays || 0} hari`} />
            <InfoRow label="Total Unit" value={overview?.units?.total || 0} />
            <InfoRow label="Unit Tersedia" value={overview?.units?.available || 0} />
            <InfoRow label="Unit Disewa" value={overview?.units?.rented || 0} />
            <InfoRow label="Unit Maintenance" value={overview?.units?.maintenance || 0} />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-[#1D1D1F]">Utilisasi Armada</span>
              <span className="text-xs font-bold text-[#0071E3]">{(overview?.utilizationPercent || 0).toFixed(1)}%</span>
            </div>
            <ProgressBar value={overview?.utilizationPercent || 0} tone="brand" />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle subtitle="Sebaran jenis denda yang diterapkan">Rekap Denda</SectionTitle>
          {!fines || fines.totalFines === 0 ? (
            <EmptyState icon={CheckCircle2} title="Belum ada denda" description="Tidak ada denda tercatat." />
          ) : (
            <div className="divide-y divide-gray-50">
              {Object.entries(fines.byType || {}).map(([type, amount]) => (
                <InfoRow key={type} label={FINE_TYPE_LABELS[type] || type.replace(/_/g, ' ')}
                  value={formatRupiah(amount)} valueClass="text-rose-600 font-semibold" />
              ))}
              <InfoRow label="Total Denda" value={formatRupiah(fines.totalAmount)} strong />
              <InfoRow label="Jumlah Kasus" value={`${fines.totalFines} kasus`} />
            </div>
          )}
        </Card>

        <Card padded={false}>
          <div className="p-5">
            <SectionTitle subtitle="Unit dengan riwayat penyewaan terbanyak">Utilisasi Per Unit</SectionTitle>
            {utilization.length === 0 ? (
              <EmptyState icon={TrendingUp} title="Belum ada data" />
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <Table columns={[
                  { key: 'unit', label: 'Unit' }, { key: 'rentals', label: 'Sewa', align: 'center' },
                  { key: 'days', label: 'Hari', align: 'center' }, { key: 'health', label: 'BH', align: 'right' },
                ]}>
                  {utilization.map((u) => (
                    <Tr key={u.unitId}>
                      <Td>
                        <p className="font-mono text-[11px]">{u.imei}</p>
                        <p className="text-[10px] text-gray-400">{u.modelName}</p>
                      </Td>
                      <Td align="center"><span className="font-semibold">{u.totalRentals}×</span></Td>
                      <Td align="center">{u.rentedDays}</Td>
                      <Td align="right"><BatteryBadge health={u.batteryHealth} /></Td>
                    </Tr>
                  ))}
                </Table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ═══════════════ AUDIT LOG ═══════════════ */
export const AdminAuditLogPage = () => {
  useDocumentTitle('Audit Log');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listAuditLogs({ search, action: actionFilter, limit: 200 })
      .then((res) => setLogs(res.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, actionFilter]);

  const uniqueActions = useMemo(() => [...new Set(logs.map((l) => l.action))].sort(), [logs]);
  const pagination = usePagination(logs, 15);

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Jejak aktivitas sensitif sistem untuk kebutuhan compliance dan traceability."
        actions={
          <Button variant="secondary" className="text-xs flex items-center gap-2" onClick={load}>
            <RefreshCw size={13} /> Muat Ulang
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Log" value={logs.length} icon={ScrollText} tone="brand" />
        <StatCard label="Aktivitas Admin" value={logs.filter((l) => l.userRole === 'ADMIN').length} icon={Users} tone="warning" />
        <StatCard label="Aktivitas Customer" value={logs.filter((l) => l.userRole === 'CUSTOMER').length} icon={TrendingUp} tone="success" />
        <StatCard label="Jenis Aksi" value={new Set(logs.map((l) => l.action)).size} icon={ShieldAlert} tone="neutral" />
      </div>

      <Card className="mb-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari email, aksi, atau entitas..." />
          <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">Semua Jenis Aksi</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>{AUDIT_ACTION_LABELS[a] || a}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card padded={false}>
        {logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="Tidak ada log" description="Belum ada aktivitas tercatat." />
        ) : (
          <div className="p-5">
            <Table columns={[
              { key: 'time', label: 'Waktu' }, { key: 'actor', label: 'Aktor' },
              { key: 'action', label: 'Aksi' }, { key: 'entity', label: 'Entitas' },
              { key: 'ip', label: 'IP' }, { key: 'detail', label: '', align: 'right' },
            ]}>
              {pagination.paginated.map((log) => (
                <Tr key={log.id} onClick={() => setSelected(log)}>
                  <Td><span className="text-[11px] whitespace-nowrap">{formatDateTime(log.createdAt)}</span></Td>
                  <Td>
                    <p className="font-medium">{log.userEmail}</p>
                    <Pill tone={log.userRole === 'SUPERADMIN' ? 'danger' : log.userRole === 'ADMIN' ? 'brand' : 'neutral'} size="xs">
                      {ROLE_LABELS[log.userRole] || log.userRole}
                    </Pill>
                  </Td>
                  <Td>
                    <Pill tone={AUDIT_ACTION_TONES[log.action] || 'neutral'} size="xs">{log.action}</Pill>
                  </Td>
                  <Td>
                    <p className="font-mono text-[11px]">{log.entityName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{log.entityId}</p>
                  </Td>
                  <Td><span className="font-mono text-[10px] text-gray-400">{log.ipAddress}</span></Td>
                  <Td align="right"><span className="text-[10px] font-semibold text-[#0071E3]">Detail →</span></Td>
                </Tr>
              ))}
            </Table>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.setPage}
              totalItems={pagination.totalItems} pageSize={pagination.pageSize} />
          </div>
        )}
      </Card>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="md"
        title="Detail Audit Log"
        subtitle={selected ? AUDIT_ACTION_LABELS[selected.action] || selected.action : ''}
        footer={<Button variant="secondary" className="text-xs" onClick={() => setSelected(null)}>Tutup</Button>}
      >
        {selected && (
          <div className="space-y-4">
            <Card className="bg-[#F9F9FB]">
              <div className="divide-y divide-gray-100">
                <InfoRow label="Waktu" value={formatDateTime(selected.createdAt)} />
                <InfoRow label="Aktor" value={selected.userEmail} />
                <InfoRow label="Role" value={ROLE_LABELS[selected.userRole] || selected.userRole} />
                <InfoRow label="Aksi" value={selected.action} />
                <InfoRow label="Entitas" value={`${selected.entityName} (${selected.entityId})`} />
                <InfoRow label="IP Address" value={<span className="font-mono">{selected.ipAddress}</span>} />
                <InfoRow label="User Agent" value={<span className="text-[10px]">{selected.userAgent}</span>} />
              </div>
            </Card>

            {selected.oldValues && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Nilai Sebelum</p>
                <pre className="text-[10px] bg-[#F5F5F7] rounded-xl p-3 overflow-x-auto">{JSON.stringify(selected.oldValues, null, 2)}</pre>
              </div>
            )}
            {selected.newValues && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Nilai Sesudah</p>
                <pre className="text-[10px] bg-[#E8F2FD] rounded-xl p-3 overflow-x-auto">{JSON.stringify(selected.newValues, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};