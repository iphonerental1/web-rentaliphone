const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/v1/catalog
 * Public: Daftar katalog iPhone beserta ketersediaan unit AVAILABLE
 * Query: ?series=&storage=&search=
 */
const getCatalog = async (req, res, next) => {
  try {
    const { series, storage, search } = req.query;

    const where = {};

    if (series) {
      where.series = {
        contains: series,
        mode: 'insensitive',
      };
    }

    if (storage) {
      where.storage = {
        contains: storage,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { series: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const models = await prisma.iphoneModel.findMany({
      where,
      include: {
        units: {
          select: {
            id: true,
            unitCode: true,
            color: true,
            batteryHealth: true,
            status: true,
          },
        },
      },
      orderBy: {
        pricePerDay: 'desc',
      },
    });

    const formattedCatalog = models.map((model) => {
      const totalUnits = model.units.length;
      const availableUnits = model.units.filter((u) => u.status === 'AVAILABLE');
      const availableCount = availableUnits.length;
      const uniqueColors = [...new Set(model.units.map((u) => u.color))];
      const availableColors = [...new Set(availableUnits.map((u) => u.color))];

      return {
        id: model.id,
        name: model.name,
        slug: model.slug,
        series: model.series,
        storage: model.storage,
        pricePerDay: Number(model.pricePerDay),
        description: model.description,
        imageUrl: model.imageUrl,
        totalUnits,
        availableUnitsCount: availableCount,
        isAvailable: availableCount > 0,
        colors: uniqueColors,
        availableColors,
        createdAt: model.createdAt,
      };
    });

    return successResponse(res, 'Katalog iPhone berhasil diambil.', formattedCatalog, 200, {
      total: formattedCatalog.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/catalog/:slug
 * Public: Detail spesifik satu seri iPhone beserta ketersediaan warna & unit
 */
const getModelBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const model = await prisma.iphoneModel.findUnique({
      where: { slug },
      include: {
        units: {
          select: {
            id: true,
            unitCode: true,
            color: true,
            batteryHealth: true,
            status: true,
          },
        },
      },
    });

    if (!model) {
      return errorResponse(res, `Model iPhone dengan slug '${slug}' tidak ditemukan.`, 404);
    }

    const totalUnits = model.units.length;
    const availableUnits = model.units.filter((u) => u.status === 'AVAILABLE');
    const rentedUnits = model.units.filter((u) => u.status === 'RENTED');
    const availableColors = [...new Set(availableUnits.map((u) => u.color))];
    const allColors = [...new Set(model.units.map((u) => u.color))];

    const data = {
      id: model.id,
      name: model.name,
      slug: model.slug,
      series: model.series,
      storage: model.storage,
      pricePerDay: Number(model.pricePerDay),
      description: model.description,
      imageUrl: model.imageUrl,
      totalUnits,
      availableUnitsCount: availableUnits.length,
      rentedUnitsCount: rentedUnits.length,
      isAvailable: availableUnits.length > 0,
      allColors,
      availableColors,
      units: model.units,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return successResponse(res, `Detail iPhone ${model.name} berhasil diambil.`, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCatalog,
  getModelBySlug,
};
