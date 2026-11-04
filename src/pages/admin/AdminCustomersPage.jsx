/**
 * ADMIN CUSTOMERS — Verifikasi KYC penyewa: tinjau KTP & selfie,
 * setujui atau tolak dengan alasan (PRD 10.3 #5).
 */

import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, XCircle, Eye, RefreshCw, Wallet, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  Alert,
  Avatar,
  Card,
  EmptyState,
  Field,
  InfoRow,
  LoadingBlock,
  Modal,
  PageHeader,
  Pagination,
  Pill,
  SearchInput,
  StatCard,
  Table,
  Tabs,
  Td,
  TextArea,
  Tr,
} from '../../components/ui';
import { adminApi } from '../../api/adminApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDocumentTitle, usePagination } from '../../hooks';
import { formatRupiah, formatDateTime, formatDateShort, maskNik } from '../../utils/formatter';

export const AdminCustomersPage = () => {
  useDocumentTitle('Customer & KYC');
  const notify = useNotification();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listCustomers({ search })
      .then((res) => setCustomers(res.data || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search]);

  const pending = customers.filter((c) => !c.isVerified);
  const verified = customers.filter((c) => c.isVerified);

  const displayed = tab === 'pending' ? pending : tab === 'verified' ? verified : customers;
  const pagination = usePagination(displayed, 10);

  const handleVerify = async (isVerified) => {
    if (!isVerified && rejectReason.trim().length < 3) {
      notify.warning('Alasan penolakan wajib diisi');
      return;
    }

    setProcessing(true);
    try {
      const res = await adminApi.verifyCustomer(
        selected.id,
        { isVerified, rejectionReason: rejectReason },
        user
      );
      notify.success(res.message);
      setSelected(null);
      setRejectReason('');
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
        title="Customer & Verifikasi KYC"
        subtitle="Tinjau dokumen identitas penyewa sebelum menyetujui akun."
        actions={
          <Button variant="secondary" className="text-xs flex items-center gap-2" onClick={load}>
            <RefreshCw size={13} /> Muat Ulang
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Customer" value={customers.length} icon={Users} tone="brand" />
        <StatCard label="Terverifikasi" value={verified.length} icon={CheckCircle2} tone="success" />
        <StatCard label="Menunggu KYC" value={pending.length} icon={ShieldAlert} tone="warning" />
        <StatCard
          label="Total Transaksi"
          value={formatRupiah(customers.reduce((s, c) => s + (c.totalSpent || 0), 0))}
          icon={Wallet}
          tone="neutral"
        />
      </div>

      <Card className="mb-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, email, telepon, atau NIK..."
        />
        <div className="mt-4">
          <Tabs
            tabs={[
              { value: 'all', label: 'Semua', count: customers.length },
              { value: 'pending', label: 'Menunggu KYC', count: pending.length },
              { value: 'verified', label: 'Terverifikasi', count: verified.length },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
      </Card>

      <Card padded={false}>
        {displayed.length === 0 ? (
          <EmptyState icon={Users} title="Tidak ada customer" description="Belum ada data customer pada filter ini." />
        ) : (
          <div className="p-5">
            <Table
              columns={[
                { key: 'name', label: 'Customer' },
                { key: 'contact', label: 'Kontak' },
                { key: 'nik', label: 'NIK' },
                { key: 'history', label: 'Riwayat' },
                { key: 'status', label: 'KYC' },
                { key: 'action', label: '', align: 'right' },
              ]}
            >
              {pagination.paginated.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={c.fullName} size={30} />
                      <div>
                        <p className="font-medium">{c.fullName}</p>
                        <p className="text-[10px] text-gray-400">{formatDateShort(c.createdAt)}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <p>{c.email}</p>
                    <p className="text-[10px] text-gray-400">{c.phoneNumber}</p>
                  </Td>
                  <Td>
                    <span className="font-mono text-[11px]">{maskNik(c.nikKtp)}</span>
                  </Td>
                  <Td>
                    <p className="font-semibold">{c.totalOrders || 0} pesanan</p>
                    <p className="text-[10px] text-gray-400">{formatRupiah(c.totalSpent || 0)}</p>
                  </Td>
                  <Td>
                    <Pill tone={c.isVerified ? 'success' : 'warning'} size="xs">
                      {c.isVerified ? 'Terverifikasi' : 'Menunggu'}
                    </Pill>
                  </Td>
                  <Td align="right">
                    <Button
                      variant={c.isVerified ? 'secondary' : 'primary'}
                      className="text-[10px] px-3 py-1.5"
                      onClick={() => {
                        setSelected(c);
                        setRejectReason('');
                      }}
                    >
                      <Eye size={11} className="inline mr-1" />
                      {c.isVerified ? 'Lihat' : 'Tinjau KYC'}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Table>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={pagination.setPage}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        size="lg"
        title="Tinjau Verifikasi KYC"
        subtitle={selected?.fullName}
        footer={
          selected && !selected.isVerified ? (
            <>
              <Button
                variant="danger"
                className="text-xs flex items-center gap-2"
                disabled={processing}
                onClick={() => handleVerify(false)}
              >
                <XCircle size={13} /> Tolak
              </Button>
              <Button
                variant="primary"
                className="text-xs flex items-center gap-2"
                disabled={processing}
                onClick={() => handleVerify(true)}
              >
                <CheckCircle2 size={13} /> Verifikasi
              </Button>
            </>
          ) : (
            <Button variant="secondary" className="text-xs" onClick={() => setSelected(null)}>
              Tutup
            </Button>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Foto e-KTP</p>
                <img
                  src={selected.ktpImageUrl}
                  alt="KTP"
                  className="w-full rounded-xl border border-gray-100 object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Selfie dengan KTP</p>
                <img
                  src={selected.selfieKtpImageUrl}
                  alt="Selfie KTP"
                  className="w-full rounded-xl border border-gray-100 object-cover"
                />
              </div>
            </div>

            <Card className="bg-[#F9F9FB]">
              <div className="divide-y divide-gray-100">
                <InfoRow label="Nama Lengkap" value={selected.fullName} strong />
                <InfoRow label="NIK KTP" value={<span className="font-mono">{selected.nikKtp}</span>} />
                <InfoRow label="Email" value={selected.email} />
                <InfoRow label="Telepon" value={selected.phoneNumber} />
                <InfoRow label="Media Sosial" value={selected.socialMediaLink || '-'} />
                <InfoRow label="Total Pesanan" value={`${selected.totalOrders || 0} pesanan`} />
                <InfoRow label="Total Transaksi" value={formatRupiah(selected.totalSpent || 0)} />
                <InfoRow
                  label="Status"
                  value={
                    <Pill tone={selected.isVerified ? 'success' : 'warning'} size="xs">
                      {selected.isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                    </Pill>
                  }
                />
              </div>
            </Card>

            {selected.isVerified ? (
              <Alert tone="success">
                Customer ini sudah terverifikasi pada {formatDateTime(selected.verifiedAt)} dan dapat
                melakukan pemesanan.
              </Alert>
            ) : (
              <>
                <Alert tone="warning" title="Periksa dengan teliti">
                  Pastikan foto KTP jelas, data cocok dengan yang diisi, dan wajah pada selfie sesuai
                  dengan foto KTP sebelum menyetujui.
                </Alert>

                <Field label="Alasan Penolakan (wajib jika ditolak)">
                  <TextArea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Foto KTP tidak terbaca / data tidak sesuai"
                  />
                </Field>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCustomersPage;