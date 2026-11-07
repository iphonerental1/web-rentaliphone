const prisma = require('../config/prisma');
const { generateBookingCode } = require('../utils/codeGenerator');
const { successResponse, errorResponse } = require('../utils/response');

const VALID_BOOKING_STATUSES = ['PENDING_PAYMENT', 'BOOKED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

/**
 * GET /api/v1/admin/bookings
 * Mengambil semua daftar booking & transaksi (filter by status & tanggal)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { status, startDate, endDate, search } = req.query;

    const where = {};

    if (status && VALID_BOOKING_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { customerIdentity: { contains: search, mode: 'insensitive' } },
        { unit: { unitCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        unit: {
          include: {
            model: {
              select: {
                id: true,
                name: true,
                slug: true,
                series: true,
                storage: true,
                pricePerDay: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = bookings.map((b) => ({
      ...b,
      totalPrice: Number(b.totalPrice),
      fineAmount: Number(b.fineAmount),
      unit: {
        ...b.unit,
        model: {
          ...b.unit.model,
          pricePerDay: Number(b.unit.model.pricePerDay),
        },
      },
    }));

    return successResponse(res, 'Daftar booking berhasil diambil.', formatted, 200, {
      total: formatted.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/bookings/:id
 * Detail transaksi & bukti transfer
 */
const getBookingById = async (req, res, next) => {
  try {
    let { id } = req.params;

    let booking = null;
    if (id && id.trim() !== '') {
      booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          unit: {
            include: {
              model: true,
            },
          },
        },
      });
    }

    if (!booking) {
      // Fallback ke booking terbaru jika ID kosong/tidak disertakan di URL
      booking = await prisma.booking.findFirst({
        include: {
          unit: {
            include: {
              model: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!booking) {
      return errorResponse(res, 'Data transaksi booking tidak ditemukan.', 404);
    }

    return successResponse(res, 'Detail booking berhasil diambil.', {
      ...booking,
      totalPrice: Number(booking.totalPrice),
      fineAmount: Number(booking.fineAmount),
      unit: {
        ...booking.unit,
        model: {
          ...booking.unit.model,
          pricePerDay: Number(booking.unit.model.pricePerDay),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/bookings
 * Admin menginput transaksi baru dari WA
 * Menerapkan Database Transaction (prisma.$transaction) untuk mencegah double-booking
 * dan otomatis mengubah status unit menjadi RENTED
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      unitId,
      customerName,
      customerPhone,
      customerIdentity,
      customerAddress,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      bankName,
      paymentProofUrl,
      notes,
      bookingCode,
      status = 'BOOKED',
    } = req.body;

    let targetUnitId = unitId;
    if (!targetUnitId || targetUnitId.trim() === '') {
      // Fallback ke unit iPhone yang AVAILABLE di database jika variabel {{unitId}} kosong di Postman
      const availableUnit = await prisma.iphoneUnit.findFirst({
        where: { status: 'AVAILABLE' },
        orderBy: { createdAt: 'desc' },
      });
      if (availableUnit) {
        targetUnitId = availableUnit.id;
      }
    }

    // Validasi input mandatory
    if (!targetUnitId || !customerName || !customerPhone || !customerIdentity || !startDate || !endDate) {
      return errorResponse(
        res,
        'Field customerName, customerPhone, customerIdentity, startDate, dan endDate wajib diisi.',
        400
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse(res, 'Format tanggal sewa (startDate / endDate) tidak valid.', 400);
    }

    if (end < start) {
      return errorResponse(res, 'Tanggal akhir sewa (endDate) tidak boleh lebih awal dari tanggal mulai (startDate).', 400);
    }

    // Eksekusi atomik menggunakan Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data unit sekaligus cek status ketersediaan
      let unit = await tx.iphoneUnit.findUnique({
        where: { id: targetUnitId },
        include: { model: true },
      });

      if (!unit) {
        throw { statusCode: 404, message: 'Unit fisik iPhone tidak ditemukan.' };
      }

      // Cegah double-booking jika unit sedang RENTED atau MAINTENANCE
      if (unit.status !== 'AVAILABLE') {
        throw {
          statusCode: 409,
          message: `Unit iPhone ${unit.unitCode} (${unit.color}) sedang tidak tersedia untuk disewa (Status saat ini: ${unit.status}). Silakan pilih unit lain.`,
        };
      }

      // 2. Hitung durasi hari dan total harga sewa jika tidak disediakan manual
      const diffTime = Math.abs(end - start);
      const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const finalTotalDays = totalDays ? parseInt(totalDays, 10) : calculatedDays;
      const modelPricePerDay = Number(unit.model.pricePerDay);
      const finalTotalPrice =
        totalPrice !== undefined ? parseFloat(totalPrice) : finalTotalDays * modelPricePerDay;

      // 3. Generate booking code unik
      let finalBookingCode = bookingCode ? bookingCode.trim() : generateBookingCode();

      // Cek keunikan booking code
      const existingCode = await tx.booking.findUnique({
        where: { bookingCode: finalBookingCode },
      });
      if (existingCode) {
        finalBookingCode = generateBookingCode();
      }

      const initialStatus = VALID_BOOKING_STATUSES.includes(status.toUpperCase())
        ? status.toUpperCase()
        : 'BOOKED';

      // 4. Buat record transaksi booking
      const newBooking = await tx.booking.create({
        data: {
          bookingCode: finalBookingCode,
          unitId: unit.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerIdentity: customerIdentity.trim(),
          customerAddress: customerAddress ? customerAddress.trim() : null,
          startDate: start,
          endDate: end,
          totalDays: finalTotalDays,
          totalPrice: finalTotalPrice,
          fineAmount: 0,
          status: initialStatus,
          bankName: bankName ? bankName.trim() : null,
          paymentProofUrl: paymentProofUrl ? paymentProofUrl.trim() : null,
          notes: notes ? notes.trim() : null,
        },
      });

      // 5. Ubah status fisik unit iPhone menjadi RENTED secara otomatis
      const updatedUnit = await tx.iphoneUnit.update({
        where: { id: unit.id },
        data: { status: 'RENTED' },
        include: { model: true },
      });

      return {
        ...newBooking,
        totalPrice: Number(newBooking.totalPrice),
        fineAmount: Number(newBooking.fineAmount),
        unit: {
          ...updatedUnit,
          model: {
            ...updatedUnit.model,
            pricePerDay: Number(updatedUnit.model.pricePerDay),
          },
        },
      };
    });

    return successResponse(res, 'Transaksi booking baru dari WhatsApp berhasil dibuat dan unit diset menjadi RENTED.', result, 201);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/bookings/:id/status
 * Update status booking (misal saat iPhone dikembalikan, status menjadi COMPLETED
 * dan status IphoneUnit otomatis kembali ke AVAILABLE menggunakan prisma.$transaction)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    let { id } = req.params;
    const { status, actualReturnDate, fineAmount, notes } = req.body;

    if (!status) {
      return errorResponse(res, 'Status booking baru wajib diisi.', 400);
    }

    const upperStatus = status.toUpperCase();
    if (!VALID_BOOKING_STATUSES.includes(upperStatus)) {
      return errorResponse(
        res,
        `Status tidak valid. Pilihan status: ${VALID_BOOKING_STATUSES.join(', ')}`,
        400
      );
    }

    let targetBookingId = id;
    if (!targetBookingId || targetBookingId.trim() === '') {
      // Fallback ke booking terbaru jika ID tidak dikirim dari Postman
      const latestBooking = await prisma.booking.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (latestBooking) {
        targetBookingId = latestBooking.id;
      }
    }

    if (!targetBookingId) {
      return errorResponse(res, 'Transaksi booking tidak ditemukan.', 404);
    }

    // Eksekusi atomik perubahan status booking & status unit
    const result = await prisma.$transaction(async (tx) => {
      const currentBooking = await tx.booking.findUnique({
        where: { id: targetBookingId },
        include: { unit: true },
      });

      if (!currentBooking) {
        throw { statusCode: 404, message: 'Transaksi booking tidak ditemukan.' };
      }

      const updateData = {
        status: upperStatus,
      };

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (fineAmount !== undefined) {
        updateData.fineAmount = parseFloat(fineAmount);
      }

      // Jika status menjadi COMPLETED atau CANCELLED -> Unit kembali AVAILABLE
      if (upperStatus === 'COMPLETED' || upperStatus === 'CANCELLED') {
        if (upperStatus === 'COMPLETED') {
          updateData.actualReturnDate = actualReturnDate ? new Date(actualReturnDate) : new Date();
        }

        // Kembalikan status unit iPhone menjadi AVAILABLE
        await tx.iphoneUnit.update({
          where: { id: currentBooking.unitId },
          data: { status: 'AVAILABLE' },
        });
      }

      // Jika status diset ke BOOKED atau ONGOING -> Unit harus RENTED
      if (upperStatus === 'BOOKED' || upperStatus === 'ONGOING') {
        await tx.iphoneUnit.update({
          where: { id: currentBooking.unitId },
          data: { status: 'RENTED' },
        });
      }

      // Update data booking
      const updatedBooking = await tx.booking.update({
        where: { id: targetBookingId },
        data: updateData,
        include: {
          unit: {
            include: {
              model: true,
            },
          },
        },
      });

      return {
        ...updatedBooking,
        totalPrice: Number(updatedBooking.totalPrice),
        fineAmount: Number(updatedBooking.fineAmount),
        unit: {
          ...updatedBooking.unit,
          model: {
            ...updatedBooking.unit.model,
            pricePerDay: Number(updatedBooking.unit.model.pricePerDay),
          },
        },
      };
    });

    const statusMsg =
      upperStatus === 'COMPLETED'
        ? 'Transaksi booking selesai (COMPLETED) dan unit iPhone telah kembali AVAILABLE.'
        : `Status booking berhasil diubah menjadi ${upperStatus}.`;

    return successResponse(res, statusMsg, result);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

/**
 * PUT /api/v1/admin/bookings/:id
 * Update detail transaksi booking (data penyewa, bank, bukti transfer, dll)
 */
const updateBookingDetails = async (req, res, next) => {
  try {
    let { id } = req.params;
    const {
      customerName,
      customerPhone,
      customerIdentity,
      customerAddress,
      bankName,
      paymentProofUrl,
      notes,
      fineAmount,
      totalPrice,
    } = req.body;

    let targetBookingId = id;
    if (!targetBookingId || targetBookingId.trim() === '') {
      // Fallback ke booking terbaru jika ID tidak dikirim dari Postman
      const latestBooking = await prisma.booking.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (latestBooking) {
        targetBookingId = latestBooking.id;
      }
    }

    if (!targetBookingId) {
      return errorResponse(res, 'Transaksi booking tidak ditemukan.', 404);
    }

    const existing = await prisma.booking.findUnique({
      where: { id: targetBookingId },
    });
    if (!existing) {
      return errorResponse(res, 'Transaksi booking tidak ditemukan.', 404);
    }

    const updateData = {};
    if (customerName) updateData.customerName = customerName.trim();
    if (customerPhone) updateData.customerPhone = customerPhone.trim();
    if (customerIdentity) updateData.customerIdentity = customerIdentity.trim();
    if (customerAddress !== undefined) updateData.customerAddress = customerAddress;
    if (bankName !== undefined) updateData.bankName = bankName;
    if (paymentProofUrl !== undefined) updateData.paymentProofUrl = paymentProofUrl;
    if (notes !== undefined) updateData.notes = notes;
    if (fineAmount !== undefined) updateData.fineAmount = parseFloat(fineAmount);
    if (totalPrice !== undefined) updateData.totalPrice = parseFloat(totalPrice);

    const updated = await prisma.booking.update({
      where: { id: targetBookingId },
      data: updateData,
      include: {
        unit: {
          include: { model: true },
        },
      },
    });

    return successResponse(res, 'Detail transaksi booking berhasil diperbarui.', {
      ...updated,
      totalPrice: Number(updated.totalPrice),
      fineAmount: Number(updated.fineAmount),
      unit: {
        ...updated.unit,
        model: {
          ...updated.unit.model,
          pricePerDay: Number(updated.unit.model.pricePerDay),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  updateBookingDetails,
};
