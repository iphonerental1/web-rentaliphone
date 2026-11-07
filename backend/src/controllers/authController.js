const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * POST /api/v1/auth/login
 * Admin Login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, 'Username atau email dan password wajib diisi.', 400);
    }

    // Cari admin berdasarkan username atau email
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [{ username: username.trim() }, { email: username.trim().toLowerCase() }],
      },
    });

    if (!admin) {
      return errorResponse(res, 'Kredensial tidak valid. Periksa kembali username/password.', 401);
    }

    // Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Kredensial tidak valid. Periksa kembali username/password.', 401);
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const adminData = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      createdAt: admin.createdAt,
    };

    return successResponse(res, 'Login berhasil.', {
      token,
      expiresIn: JWT_EXPIRES_IN,
      admin: adminData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Mendapatkan profil admin yang sedang login
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 'Data profil admin berhasil diambil.', {
      admin: req.admin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/auth/password
 * Ubah password admin
 */
const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return errorResponse(res, 'Password lama dan password baru wajib diisi.', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password baru minimal 6 karakter.', 400);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return errorResponse(res, 'Password lama yang Anda masukkan salah.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: req.admin.id },
      data: { password: hashedPassword },
    });

    return successResponse(res, 'Password berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  updatePassword,
};
