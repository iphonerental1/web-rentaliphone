const prisma = require('../config/prisma');
const { successResponse } = require('../utils/response');

/**
 * GET /api/v1/admin/dashboard/stats
 * Mengambil ringkasan statistik pendapatan, stok aktif, dan jadwal pengembalian hari ini
 */
const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Ringkasan Stok Fisik Unit
    const [totalUnits, availableUnits, rentedUnits, maintenanceUnits] = await Promise.all([
      prisma.iphoneUnit.count(),
      prisma.iphoneUnit.count({ where: { status: 'AVAILABLE' } }),
      prisma.iphoneUnit.count({ where: { status: 'RENTED' } }),
      prisma.iphoneUnit.count({ where: { status: 'MAINTENANCE' } }),
    ]);

    // 2. Data Booking Keseluruhan untuk Kalkulasi Pendapatan
    const allBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['COMPLETED', 'ONGOING', 'BOOKED'],
        },
      },
      select: {
        totalPrice: true,
        fineAmount: true,
        createdAt: true,
        status: true,
      },
    });

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let totalFine = 0;

    for (const b of allBookings) {
      const price = Number(b.totalPrice) || 0;
      const fine = Number(b.fineAmount) || 0;
      totalRevenue += price + fine;
      totalFine += fine;

      if (new Date(b.createdAt) >= startOfMonth) {
        monthlyRevenue += price + fine;
      }
    }

    // 3. Jadwal Pengembalian Hari Ini (Atau Terlewat / Overdue)
    const returnsToday = await prisma.booking.findMany({
      where: {
        status: { in: ['BOOKED', 'ONGOING'] },
        endDate: { lte: endOfDay },
      },
      include: {
        unit: {
          include: {
            model: {
              select: {
                name: true,
                storage: true,
              },
            },
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });

    // 4. Booking Terbaru (5 transaksi terakhir)
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        unit: {
          include: {
            model: {
              select: {
                name: true,
                storage: true,
              },
            },
          },
        },
      },
    });

    // 5. Total Booking berdasarkan Status
    const [totalBookingsCount, activeCount, completedCount, cancelledCount] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: ['BOOKED', 'ONGOING'] } } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
    ]);

    const formattedReturns = returnsToday.map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      unitCode: b.unit.unitCode,
      modelName: `${b.unit.model.name} (${b.unit.model.storage})`,
      color: b.unit.color,
      endDate: b.endDate,
      totalPrice: Number(b.totalPrice),
      status: b.status,
      isOverdue: new Date(b.endDate) < new Date(),
    }));

    const formattedRecent = recentBookings.map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      unitCode: b.unit.unitCode,
      modelName: `${b.unit.model.name} (${b.unit.model.storage})`,
      startDate: b.startDate,
      endDate: b.endDate,
      totalPrice: Number(b.totalPrice),
      status: b.status,
      createdAt: b.createdAt,
    }));

    return successResponse(res, 'Statistik dashboard admin berhasil diambil.', {
      revenue: {
        totalRevenue,
        monthlyRevenue,
        totalFine,
      },
      units: {
        totalUnits,
        availableUnits,
        rentedUnits,
        maintenanceUnits,
      },
      bookingsSummary: {
        total: totalBookingsCount,
        active: activeCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
      returnsToday: formattedReturns,
      recentBookings: formattedRecent,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
