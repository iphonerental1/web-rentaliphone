const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../config/env');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to verify Admin JWT Token
 */
const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Format token tidak valid.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Sesi telah kedaluwarsa. Silakan login kembali.', 401);
      }
      return errorResponse(res, 'Token tidak valid atau telah dimodifikasi.', 401);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return errorResponse(res, 'Akun admin tidak ditemukan atau telah dinonaktifkan.', 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return errorResponse(res, 'Terjadi kesalahan pada validasi autentikasi.', 500);
  }
};

module.exports = {
  verifyAdminToken,
};
