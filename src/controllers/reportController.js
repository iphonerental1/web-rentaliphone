const prisma = require('../config/prisma');
const { successResponse } = require('../utils/response');

/**
 * GET /api/v1/admin/reports
 * Rekapitulasi pendapatan & transaksi berdasarkan rentang tanggal
 */
const getReports = async (req, res, next) => {
  try {
    const { startDate, endDate, status, format } = req.query;

    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        unit: {
          include: {
            model: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let totalRevenue = 0;
    let totalFine = 0;
    let completedCount = 0;
    let activeCount = 0;
    let cancelledCount = 0;
    const modelBreakdown = {};

    for (const b of bookings) {
      const price = Number(b.totalPrice) || 0;
      const fine = Number(b.fineAmount) || 0;

      if (b.status === 'COMPLETED' || b.status === 'ONGOING' || b.status === 'BOOKED') {
        totalRevenue += price;
        totalFine += fine;
      }

      if (b.status === 'COMPLETED') completedCount++;
      else if (b.status === 'ONGOING' || b.status === 'BOOKED') activeCount++;
      else if (b.status === 'CANCELLED') cancelledCount++;

      const modelName = b.unit.model.name;
      if (!modelBreakdown[modelName]) {
        modelBreakdown[modelName] = { count: 0, revenue: 0 };
      }
      modelBreakdown[modelName].count += 1;
      if (b.status === 'COMPLETED' || b.status === 'ONGOING' || b.status === 'BOOKED') {
        modelBreakdown[modelName].revenue += price;
      }
    }

    const formattedTransactions = bookings.map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      customerIdentity: b.customerIdentity,
      unitCode: b.unit.unitCode,
      modelName: `${b.unit.model.name} (${b.unit.model.storage})`,
      color: b.unit.color,
      startDate: b.startDate,
      endDate: b.endDate,
      actualReturnDate: b.actualReturnDate,
      totalDays: b.totalDays,
      totalPrice: Number(b.totalPrice),
      fineAmount: Number(b.fineAmount),
      grandTotal: Number(b.totalPrice) + Number(b.fineAmount),
      bankName: b.bankName,
      status: b.status,
      createdAt: b.createdAt,
    }));

    // Support CSV Export
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-transaksi.csv');

      const headers = [
        'Kode Booking',
        'Nama Pelanggan',
        'No Telp',
        'Kode Unit',
        'Model iPhone',
        'Warna',
        'Tgl Mulai',
        'Tgl Selesai',
        'Durasi (Hari)',
        'Biaya Sewa',
        'Denda',
        'Total',
        'Status',
      ];

      const rows = formattedTransactions.map((t) => [
        `"${t.bookingCode}"`,
        `"${t.customerName}"`,
        `"${t.customerPhone}"`,
        `"${t.unitCode}"`,
        `"${t.modelName}"`,
        `"${t.color}"`,
        `"${new Date(t.startDate).toLocaleDateString('id-ID')}"`,
        `"${new Date(t.endDate).toLocaleDateString('id-ID')}"`,
        t.totalDays,
        t.totalPrice,
        t.fineAmount,
        t.grandTotal,
        `"${t.status}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      return res.send(csvContent);
    }

    return successResponse(res, 'Laporan transaksi berhasil di-generate.', {
      summary: {
        totalBookings: bookings.length,
        completedCount,
        activeCount,
        cancelledCount,
        totalRentalRevenue: totalRevenue,
        totalFineRevenue: totalFine,
        grandTotalRevenue: totalRevenue + totalFine,
      },
      modelBreakdown,
      transactions: formattedTransactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
};
