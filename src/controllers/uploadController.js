const { successResponse, errorResponse } = require('../utils/response');
const { BASE_URL } = require('../config/env');

/**
 * POST /api/v1/admin/upload
 * Endpoint upload gambar (foto unit / bukti transfer WA)
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Tidak ada file gambar yang diunggah. Gunakan field name "file" atau "image".', 400);
    }

    // Buat URL yang dapat diakses publik melalui browser/frontend
    // Normalize path separator for windows
    const relativePath = req.file.path.replace(/\\/g, '/');
    const fileUrl = `${BASE_URL}/${relativePath}`;

    return successResponse(
      res,
      'File gambar berhasil diunggah.',
      {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/${relativePath}`,
        url: fileUrl,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
};
