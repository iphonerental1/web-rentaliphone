const { errorResponse } = require('../utils/response');

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`, 404);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Multer Error Handling
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'Ukuran file terlalu besar. Maksimum ukuran file adalah 5MB.', 400);
    }
    return errorResponse(res, `Terjadi kesalahan saat mengunggah file: ${err.message}`, 400);
  }

  // Handle Multer fileFilter or form parsing error
  if (err.message && err.message.includes('Format file tidak didukung')) {
    return errorResponse(res, err.message, 400);
  }
  if (err.message && err.message.includes('Unexpected end of form')) {
    return errorResponse(res, 'Tidak ada file gambar yang diunggah.', 400);
  }

  // Prisma Unique Constraint Error (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'bidang unik';
    return errorResponse(res, `Data duplikat: Nilai pada ${fields} sudah digunakan.`, 409);
  }

  // Prisma Record Not Found (P2025)
  if (err.code === 'P2025') {
    return errorResponse(res, 'Data yang diminta tidak ditemukan.', 404);
  }

  // Prisma Foreign Key Constraint (P2003)
  if (err.code === 'P2003') {
    return errorResponse(res, 'Relasi data tidak valid atau data referensi tidak ditemukan.', 400);
  }

  // Custom validation or error message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
