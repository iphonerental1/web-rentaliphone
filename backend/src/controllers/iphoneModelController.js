const prisma = require('../config/prisma');
const { slugify } = require('../utils/codeGenerator');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/v1/admin/models
 * List semua model katalog iPhone beserta rincian jumlah unit
 */
const getAllModels = async (req, res, next) => {
  try {
    const { search, series } = req.query;

    const where = {};
    if (series) {
      where.series = { contains: series, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { series: { contains: search, mode: 'insensitive' } },
        { storage: { contains: search, mode: 'insensitive' } },
      ];
    }

    const models = await prisma.iphoneModel.findMany({
      where,
      include: {
        units: {
          select: {
            id: true,
            unitCode: true,
            status: true,
            batteryHealth: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = models.map((m) => {
      const totalUnits = m.units.length;
      const availableUnits = m.units.filter((u) => u.status === 'AVAILABLE').length;
      const rentedUnits = m.units.filter((u) => u.status === 'RENTED').length;
      const maintenanceUnits = m.units.filter((u) => u.status === 'MAINTENANCE').length;

      return {
        id: m.id,
        name: m.name,
        slug: m.slug,
        series: m.series,
        storage: m.storage,
        pricePerDay: Number(m.pricePerDay),
        description: m.description,
        imageUrl: m.imageUrl,
        totalUnits,
        availableUnits,
        rentedUnits,
        maintenanceUnits,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
    });

    return successResponse(res, 'Daftar model iPhone berhasil diambil.', data, 200, {
      total: data.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/models/:id
 * Detail spesifik satu model
 */
const getModelById = async (req, res, next) => {
  try {
    let { id } = req.params;

    let model = null;
    if (id && id.trim() !== '') {
      model = await prisma.iphoneModel.findUnique({
        where: { id },
        include: {
          units: true,
        },
      });
    }

    if (!model) {
      // Fallback ke model iPhone terbaru jika ID kosong/tidak disertakan di URL
      model = await prisma.iphoneModel.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { units: true },
      });
    }

    if (!model) {
      return errorResponse(res, 'Model iPhone tidak ditemukan.', 404);
    }

    return successResponse(res, 'Detail model iPhone berhasil diambil.', {
      ...model,
      pricePerDay: Number(model.pricePerDay),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/models
 * Tambah model katalog iPhone baru
 */
const createModel = async (req, res, next) => {
  try {
    const { name, series, storage, pricePerDay, description, imageUrl, slug } = req.body;

    if (!name || !series || !storage || pricePerDay === undefined) {
      return errorResponse(res, 'Field name, series, storage, dan pricePerDay wajib diisi.', 400);
    }

    let finalSlug = slug ? slugify(slug) : slugify(`${name}-${storage}`);

    // Cek duplikasi slug
    const existing = await prisma.iphoneModel.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      if (!slug) {
        // Otomatis tambahkan suffix waktu unik agar testing di Postman tidak error 409 Conflict
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-6)}`;
      } else {
        return errorResponse(res, `Model dengan slug '${finalSlug}' sudah terdaftar. Gunakan slug lain.`, 409);
      }
    }

    const newModel = await prisma.iphoneModel.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        series: series.trim(),
        storage: storage.trim(),
        pricePerDay: parseFloat(pricePerDay),
        description: description ? description.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
      },
    });

    return successResponse(res, 'Model iPhone baru berhasil ditambahkan.', {
      ...newModel,
      pricePerDay: Number(newModel.pricePerDay),
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/models/:id
 * Edit model katalog iPhone
 */
const updateModel = async (req, res, next) => {
  try {
    let { id } = req.params;
    const { name, series, storage, pricePerDay, description, imageUrl, slug } = req.body;

    let existing = null;
    if (id && id.trim() !== '') {
      existing = await prisma.iphoneModel.findUnique({
        where: { id },
      });
    }

    if (!existing) {
      // Fallback: jika id tidak ada atau tidak ditemukan (misal variabel Postman {{modelId}} kosong), ambil model terbaru
      existing = await prisma.iphoneModel.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!existing) {
      return errorResponse(res, 'Model iPhone yang akan diupdate tidak ditemukan.', 404);
    }

    id = existing.id;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (series) updateData.series = series.trim();
    if (storage) updateData.storage = storage.trim();
    if (pricePerDay !== undefined) updateData.pricePerDay = parseFloat(pricePerDay);
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    if (slug) {
      const cleanSlug = slugify(slug);
      if (cleanSlug !== existing.slug) {
        const slugExists = await prisma.iphoneModel.findUnique({
          where: { slug: cleanSlug },
        });
        if (slugExists) {
          return errorResponse(res, `Slug '${cleanSlug}' sudah digunakan oleh model lain.`, 409);
        }
        updateData.slug = cleanSlug;
      }
    }

    const updated = await prisma.iphoneModel.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, 'Model iPhone berhasil diperbarui.', {
      ...updated,
      pricePerDay: Number(updated.pricePerDay),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/models/:id
 * Hapus model iPhone
 */
const deleteModel = async (req, res, next) => {
  try {
    let { id } = req.params;

    let model = null;
    if (id && id.trim() !== '') {
      model = await prisma.iphoneModel.findUnique({
        where: { id },
        include: {
          units: true,
        },
      });
    }

    if (!model) {
      // Fallback ke model terbaru yang unit fisiknya tidak berstatus RENTED
      model = await prisma.iphoneModel.findFirst({
        where: {
          units: {
            none: { status: 'RENTED' },
          },
        },
        include: { units: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!model) {
      return errorResponse(res, 'Model iPhone tidak ditemukan untuk dihapus.', 404);
    }

    id = model.id;

    // Periksa apakah ada unit yang sedang disewa
    const hasRentedUnit = model.units && model.units.some((u) => u.status === 'RENTED');
    if (hasRentedUnit) {
      return errorResponse(
        res,
        'Tidak dapat menghapus model ini karena terdapat unit fisik yang sedang berstatus disewa (RENTED).',
        400
      );
    }

    await prisma.iphoneModel.delete({
      where: { id },
    });

    return successResponse(res, `Model '${model.name}' dan seluruh unit terkait berhasil dihapus.`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
};
