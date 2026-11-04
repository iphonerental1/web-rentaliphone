/**
 * DASHBOARD OVERVIEW (/admin/dashboard) — kartu ringkasan:
 * pendapatan, unit aktif, jadwal pengembalian, booking terbaru.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Banknote, CalendarClock, PackageCheck, Timer } from 'lucide-react';
import { Card, EmptyState, Skeleton, StatCard, Table, Pill } from '../../components/ui';
import { OrderStatusBadge } from '../../components/shared';
import { adminApi } from '../../api/adminApi';
import { UNIT_STATUS_META } from '../../constants';
import { formatDateShort, formatDateTime, formatRupiah } from '../../utils/formatter';
import { useDocumentTitle } from '../../hooks';

export const AdminDashboardPage = () => {
  useDocumentTitle('Dashboard Admin');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
        <Skeleton className="h-64 col-span-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KARTU RINGKASAN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pendapatan"
          value={formatRupiah(stats.totalRevenue)}
          hint="Booking terbayar"
          icon={Banknote}
          tone="brand"
        />
        <StatCard
          label="Sedang Disewa"
          value={stats.rentedUnits}
          hint={`dari ${stats.totalUnits} unit`}
          icon={PackageCheck}
          tone="success"
        />
        <StatCard
          label="Booking Aktif"
          value={stats.activeRentals}
          hint="masa sewa berjalan"
          icon={Timer}
          tone="info"
        />
        <StatCard
          label="Menunggu Tindak"
          value={stats.pendingOrders}
          hint="chat WA / verifikasi"
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* JADWAL PENGEMBALIAN */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <CalendarClock size={15} className="text-[#0071E3]" /> Jadwal Pengembalian
            </p>
            <Link to="/admin/bookings" className="text-[11px] font-bold text-[#0071E3] hover:underline">
              Semua
            </Link>
          </div>

          {stats.upcomingReturns.length === 0 ? (
            <EmptyState title="Tidak ada jadwal dekat" description="Semua unit tepat waktu." icon={CalendarClock} />
          ) : (
            <div className="space-y-3">
              {stats.upcomingReturns.slice(0, 5).map((o) => (
                <div key={o.id} className="rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1D1D1F] truncate">{o.customerName}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {(o.items || [])[0]?.modelName} · {formatDateShort(o.endDate)}
                    </p>
                  </div>
                  <OrderStatusBadge status={o.orderStatus} size="xs" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* KETERSEDIAAN UNIT */}
        <Card>
          <p className="text-sm font-bold text-[#1D1D1F] mb-4">Status Unit Fisik</p>
          <div className="space-y-3">
            {Object.entries(stats.unitByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Pill tone={UNIT_STATUS_META[status]?.tone || 'neutral'} size="sm">
                  {UNIT_STATUS_META[status]?.label || status}
                </Pill>
                <span className="text-sm font-bold text-[#1D1D1F]">{count}</span>
              </div>
            ))}
            {Object.keys(stats.unitByStatus).length === 0 && (
              <EmptyState title="Belum ada unit" description="Tambahkan unit di Inventaris." icon={PackageCheck} />
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
            <span className="text-gray-500">Unit tersedia</span>
            <span className="font-bold text-emerald-600">{stats.availableUnits} siap disewa</span>
          </div>
        </Card>

        {/* BOOKING TERBARU */}
        <Card className="lg:col-span-1" padded={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <p className="text-sm font-bold text-[#1D1D1F]">Booking Terbaru</p>
            <Link
              to="/admin/bookings"
              className="text-[11px] font-bold text-[#0071E3] flex items-center gap-1 hover:underline"
            >
              Kelola <ArrowRight size={12} />
            </Link>
          </div>
          <div className="px-2 pb-3">
            <Table
              columns={[
                { key: 'order', label: 'Order' },
                { key: 'customer', label: 'Pelanggan' },
                { key: 'total', label: 'Total', align: 'right' },
                { key: 'status', label: 'Status' },
              ]}
            >
              {stats.recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-gray-50">
                  <td className="px-3 py-2.5 text-[11px] font-mono text-gray-500">{o.orderNumber}</td>
                  <td className="px-3 py-2.5 text-xs text-[#1D1D1F] font-medium">{o.customerName}</td>
                  <td className="px-3 py-2.5 text-xs font-bold text-[#0071E3]">
                    {formatRupiah(o.grandTotal)}
                  </td>
                  <td className="px-3 py-2.5">
                    <OrderStatusBadge status={o.orderStatus} size="xs" />
                  </td>
                </tr>
              ))}
            </Table>
            {stats.recentOrders.length === 0 && (
              <EmptyState title="Belum ada booking" description="Catat booking pertama dari WhatsApp." />
            )}
          </div>
        </Card>
      </div>

      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Data tersimpan di browser (mock database) — terakhir dimuat {formatDateTime(new Date())}
      </p>
    </div>
  );
};

export default AdminDashboardPage;
