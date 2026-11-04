/**
 * LAPORAN TRANSAKSI (/admin/reports) — rekapitulasi pendapatan pada
 * rentang tanggal + ekspor CSV.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Download, Percent, Receipt, Timer, XCircle } from 'lucide-react';
import { Card, EmptyState, Input, Skeleton, StatCard, Table } from '../../components/ui';
import { Button } from '../../components/common/Button';
import { OrderStatusBadge } from '../../components/shared';
import { adminApi } from '../../api/adminApi';
import { formatDateShort, formatRupiah } from '../../utils/formatter';
import { useDocumentTitle } from '../../hooks';

/** Default: 30 hari terakhir. */
const defaultFrom = () => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
const defaultTo = () => new Date().toISOString().slice(0, 10);

export const AdminReportsPage = () => {
  useDocumentTitle('Laporan Transaksi — Admin');
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.reports({ from, to });
    setReport(res.data);
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const onExportCsv = () => {
    if (!report || report.orders.length === 0) return;
    const header = ['No Order', 'Pelanggan', 'No WA', 'Unit', 'Mulai', 'Selesai', 'Hari', 'Total', 'Denda', 'Status'];
    const rows = report.orders.map((o) => {
      const item = (o.items || [])[0] || {};
      const fine = (o.fines || []).reduce((s, f) => s + (f.amount || 0), 0);
      return [
        o.orderNumber,
        o.customerName,
        o.customerPhone,
        `${item.modelName || ''} ${item.storageCapacity || ''} ${item.colorName || ''}`.trim(),
        formatDateShort(o.startDate),
        formatDateShort(o.endDate),
        o.totalDays,
        o.grandTotal,
        fine,
        o.orderStatus,
      ];
    });
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-irent-${from || 'awal'}-${to || 'akhir'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1D1D1F]">Laporan Transaksi</h1>
          <p className="text-xs text-gray-500">Rekapitulasi pendapatan &amp; utilisasi unit sewa.</p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 mb-1 block" htmlFor="rp-from">
              Dari Tanggal
            </label>
            <Input id="rp-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-500 mb-1 block" htmlFor="rp-to">
              Sampai
            </label>
            <Input id="rp-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          </div>
          <Button type="button" variant="outline" onClick={onExportCsv} className="flex items-center gap-2">
            <Download size={14} /> Ekspor CSV
          </Button>
        </div>
      </div>

      {loading || !report ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Pendapatan" value={formatRupiah(report.revenue)} hint={`${report.totalOrders} booking`} icon={Receipt} tone="brand" />
            <StatCard label="Denda" value={formatRupiah(report.fines)} hint="dari keterlambatan/kerusakan" icon={XCircle} tone="danger" />
            <StatCard label="Hari Sewa" value={report.rentalDays} hint="total hari tercatat" icon={Timer} tone="info" />
            <StatCard label="Utilisasi Unit" value={`${report.utilization}%`} hint="hari sewa / kapasitas" icon={Percent} tone="success" />
          </div>

          <Card padded={false}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <CalendarDays size={15} className="text-[#0071E3]" />
                Booking {from ? formatDateShort(from) : 'Awal'} — {to ? formatDateShort(to) : 'Sekarang'}
              </p>
              <p className="text-[11px] text-gray-400">
                {report.completedCount} selesai · {report.cancelledCount} batal
              </p>
            </div>

            {report.orders.length === 0 ? (
              <EmptyState title="Tidak ada transaksi" description="Ubah rentang tanggal untuk melihat data lain." />
            ) : (
              <Table
                columns={[
                  { key: 'order', label: 'Order' },
                  { key: 'customer', label: 'Pelanggan' },
                  { key: 'unit', label: 'Unit' },
                  { key: 'period', label: 'Periode' },
                  { key: 'total', label: 'Total', align: 'right' },
                  { key: 'status', label: 'Status' },
                ]}
              >
                {report.orders.map((o) => {
                  const item = (o.items || [])[0] || {};
                  const fine = (o.fines || []).reduce((s, f) => s + (f.amount || 0), 0);
                  return (
                    <tr key={o.id} className="hover:bg-[#F9F9FB] transition-colors">
                      <td className="px-3 py-3 text-[11px] font-mono text-[#1D1D1F]">{o.orderNumber}</td>
                      <td className="px-3 py-3 text-xs text-[#1D1D1F]">{o.customerName}</td>
                      <td className="px-3 py-3 text-[11px] text-gray-600">
                        {item.modelName} · {item.storageCapacity}
                      </td>
                      <td className="px-3 py-3 text-[11px] text-gray-600 whitespace-nowrap">
                        {formatDateShort(o.startDate)} — {formatDateShort(o.endDate)}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <p className="text-xs font-bold text-[#0071E3]">{formatRupiah(o.grandTotal)}</p>
                        {fine > 0 && <p className="text-[10px] text-rose-600">denda {formatRupiah(fine)}</p>}
                      </td>
                      <td className="px-3 py-3">
                        <OrderStatusBadge status={o.orderStatus} size="xs" />
                      </td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;
