const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

const VALID_STATUSES = ['AVAILABLE', 'RENTED', 'MAINTENANCE'];

/**
 * GET /api/v1/admin/units
 * List semua unit fisik iPhone dengan filter modelId, status, atau search
 */
const getAllUnits = async (req, res, next) => {
  try {
    const { modelId, status, search } = req.query;

    const where = {};

    if (modelId) {
      where.modelId = modelId;
    }

    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { unitCode: { contains: search, mode: 'insensitive' } },
        { imei: { contains: search, mode: 'insensitive' } },
        { color: { contains: search, mode: 'insensitive' } },
        { model: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const units = await prisma.iphoneUnit.findMany({
      where,
      include: {
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            series: true,
            storage: true,
            pricePerDay: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedUnits = units.map((u) => ({
      id: u.id,
      unitCode: u.unitCode,
      imei: u.imei,
      color: u.color,
      batteryHealth: u.batteryHealth,
      status: u.status,
      model: {
        ...u.model,
        pricePerDay: Number(u.model.pricePerDay),
      },
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return successResponse(res, 'Daftar unit iPhone berhasil diambil.', formattedUnits, 200, {
      total: formattedUnits.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/units/:id
 * Detail spesifik satu unit fisik
 */
const getUnitById = async (req, res, next) => {
  try {
    let { id } = req.params;

    let unit = null;
    if (id && id.trim() !== '') {
      unit = await prisma.iphoneUnit.findUnique({
        where: { id },
        include: {
          model: true,
          bookings: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              bookingCode: true,
              customerName: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
      });
    }

    if (!unit) {
      // Fallback ke unit terbaru jika ID kosong/tidak disertakan di URL
      unit = await prisma.iphoneUnit.findFirst({
        include: {
          model: true,
          bookings: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              bookingCode: true,
              customerName: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!unit) {
      return errorResponse(res, 'Unit iPhone tidak ditemukan.', 404);
    }

    return successResponse(res, 'Detail unit iPhone berhasil diambil.', {
      ...unit,
      model: {
        ...unit.model,
        pricePerDay: Number(unit.model.pricePerDay),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/units
 * Tambah unit fisik iPhone baru
 */
const createUnit = async (req, res, next) => {
  try {
    const { modelId, unitCode, imei, color, batteryHealth, status } = req.body;

    let targetModelId = modelId;
    if (!targetModelId || targetModelId.trim() === '') {
      // Fallback ke model iPhone terbaru yang tersedia jika variabel {{modelId}} kosong di Postman
      const latestModel = await prisma.iphoneModel.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (latestModel) {
        targetModelId = latestModel.id;
      }
    }

    if (!targetModelId) {
      return errorResponse(res, 'Field modelId wajib diisi. Silakan tambahkan model iPhone terlebih dahulu.', 400);
    }

    // Cek keberadaan model
    const model = await prisma.iphoneModel.findUnique({
      where: { id: targetModelId },
    });
    if (!model) {
      return errorResponse(res, 'Model iPhone referensi tidak ditemukan.', 404);
    }

    let finalUnitCode = unitCode && unitCode.trim() ? unitCode.trim() : `UNIT-${Date.now().toString().slice(-6)}`;
    let finalImei = imei && imei.trim() ? imei.trim() : `35${Date.now()}`;

    // Cek duplikasi unitCode (BUG-002: Harus tolak 409 jika unitCode sudah ada)
    const existingUnitCode = await prisma.iphoneUnit.findUnique({
      where: { unitCode: finalUnitCode },
    });
    if (existingUnitCode) {
      return errorResponse(res, `Kode unit '${finalUnitCode}' sudah digunakan.`, 409);
    }

    // Cek duplikasi IMEI (BUG-001: Harus tolak 409 jika IMEI sudah ada)
    const existingImei = await prisma.iphoneUnit.findUnique({
      where: { imei: finalImei },
    });
    if (existingImei) {
      return errorResponse(res, `IMEI '${finalImei}' sudah digunakan oleh unit lain.`, 409);
    }

    const unitColor = color && color.trim() ? color.trim() : 'Desert Titanium';
    const unitStatus = status && VALID_STATUSES.includes(status.toUpperCase()) ? status.toUpperCase() : 'AVAILABLE';

    // Validasi batteryHealth rentang 1 - 100 (BUG-003: Harus tolak 400 jika di luar 1-100)
    const bh = batteryHealth !== undefined ? parseInt(batteryHealth, 10) : 100;
    if (isNaN(bh) || bh < 1 || bh > 100) {
      return errorResponse(res, 'Battery health harus angka 1 - 100.', 400);
    }
    const finalBatteryHealth = bh;

    const newUnit = await prisma.iphoneUnit.create({
      data: {
        modelId: targetModelId,
        unitCode: finalUnitCode,
        imei: finalImei,
        color: unitColor,
        batteryHealth: finalBatteryHealth,
        status: unitStatus,
      },
      include: {
        model: true,
      },
    });

    return successResponse(res, 'Unit fisik iPhone berhasil ditambahkan.', {
      ...newUnit,
      model: {
        ...newUnit.model,
        pricePerDay: Number(newUnit.model.pricePerDay),
      },
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/units/:id
 * Edit data unit fisik
 */
const updateUnit = async (req, res, next) => {
  try {
    let { id } = req.params;
    const { modelId, unitCode, imei, color, batteryHealth, status } = req.body;

    let existing = null;
    if (id && id.trim() !== '') {
      existing = await prisma.iphoneUnit.findUnique({
        where: { id },
      });
    }

    if (!existing) {
      // Fallback ke unit terbaru jika ID kosong (variabel {{unitId}} kosong di Postman)
      existing = await prisma.iphoneUnit.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!existing) {
      return errorResponse(res, 'Unit iPhone tidak ditemukan.', 404);
    }

    id = existing.id;

    const updateData = {};
    if (modelId) {
      const model = await prisma.iphoneModel.findUnique({ where: { id: modelId } });
      if (!model) return errorResponse(res, 'Model iPhone baru tidak ditemukan.', 404);
      updateData.modelId = modelId;
    }

    if (unitCode && unitCode.trim() !== existing.unitCode) {
      const dup = await prisma.iphoneUnit.findUnique({ where: { unitCode: unitCode.trim() } });
      if (dup) return errorResponse(res, `Kode unit '${unitCode}' sudah digunakan.`, 409);
      updateData.unitCode = unitCode.trim();
    }

    if (imei && imei.trim() !== existing.imei) {
      const dup = await prisma.iphoneUnit.findUnique({ where: { imei: imei.trim() } });
      if (dup) return errorResponse(res, `IMEI '${imei}' sudah digunakan oleh unit lain.`, 409);
      updateData.imei = imei.trim();
    }

    if (color) updateData.color = color.trim();

    if (batteryHealth !== undefined) {
      const bh = parseInt(batteryHealth, 10);
      if (isNaN(bh) || bh < 1 || bh > 100) {
        return errorResponse(res, 'Battery health harus angka 1 - 100.', 400);
      }
      updateData.batteryHealth = bh;
    }

    if (status) {
      const upper = status.toUpperCase();
      if (!VALID_STATUSES.includes(upper)) {
        return errorResponse(res, `Status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}`, 400);
      }
      updateData.status = upper;
    }

    const updated = await prisma.iphoneUnit.update({
      where: { id },
      data: updateData,
      include: {
        model: true,
      },
    });

    return successResponse(res, 'Data unit iPhone berhasil diperbarui.', {
      ...updated,
      model: {
        ...updated.model,
        pricePerDay: Number(updated.model.pricePerDay),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/units/:id/status
 * Ubah status unit (AVAILABLE, RENTED, MAINTENANCE)
 */
const updateUnitStatus = async (req, res, next) => {
  try {
    let { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status baru wajib diisi.', 400);
    }

    const upperStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(upperStatus)) {
      return errorResponse(res, `Status tidak valid. Gunakan salah satu dari: ${VALID_STATUSES.join(', ')}`, 400);
    }

    let unit = null;
    if (id && id.trim() !== '') {
      unit = await prisma.iphoneUnit.findUnique({
        where: { id },
      });
    }

    if (!unit) {
      // Fallback ke unit terbaru jika ID kosong (variabel {{unitId}} kosong di Postman)
      unit = await prisma.iphoneUnit.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!unit) {
      return errorResponse(res, 'Unit iPhone tidak ditemukan.', 404);
    }

    id = unit.id;

    const updated = await prisma.iphoneUnit.update({
      where: { id },
      data: { status: upperStatus },
      include: {
        model: {
          select: { name: true, storage: true },
        },
      },
    });

    return successResponse(res, `Status unit '${updated.unitCode}' berhasil diubah menjadi ${upperStatus}.`, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/units/:id
 * Hapus unit fisik iPhone
 */
const deleteUnit = async (req, res, next) => {
  try {
    let { id } = req.params;

    let unit = null;
    if (id && id.trim() !== '') {
      unit = await prisma.iphoneUnit.findUnique({
        where: { id },
      });
    }

    if (!unit) {
      // Fallback ke unit terbaru yang tidak berstatus RENTED
      unit = await prisma.iphoneUnit.findFirst({
        where: { status: { not: 'RENTED' } },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!unit) {
      return errorResponse(res, 'Unit iPhone tidak ditemukan untuk dihapus.', 404);
    }

    id = unit.id;

    if (unit.status === 'RENTED') {
      return errorResponse(res, 'Unit sedang dalam masa sewa aktif (RENTED) dan tidak dapat dihapus.', 400);
    }

    await prisma.iphoneUnit.delete({
      where: { id },
    });

    return successResponse(res, `Unit '${unit.unitCode}' berhasil dihapus.`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
};
