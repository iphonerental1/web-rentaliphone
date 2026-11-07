const express = require('express');
const router = express.Router();

const { verifyAdminToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { errorResponse } = require('../utils/response');

const dashboardController = require('../controllers/dashboardController');
const iphoneModelController = require('../controllers/iphoneModelController');
const iphoneUnitController = require('../controllers/iphoneUnitController');
const bookingController = require('../controllers/bookingController');
const uploadController = require('../controllers/uploadController');
const reportController = require('../controllers/reportController');

// Seluruh rute di bawah ini diproteksi dengan verifyAdminToken
router.use(verifyAdminToken);

// 1. Dashboard & Analytics
router.get('/dashboard/stats', dashboardController.getStats);

// 2. Manajemen Model iPhone
router.get('/models', iphoneModelController.getAllModels);
router.post('/models', iphoneModelController.createModel);
router.get(['/models/:id', '/models/detail'], iphoneModelController.getModelById);
router.put(['/models/:id', '/models'], iphoneModelController.updateModel);
router.delete(['/models/:id', '/models'], iphoneModelController.deleteModel);

// 3. Manajemen Stok Unit Fisik iPhone
router.get('/units', iphoneUnitController.getAllUnits);
router.post('/units', iphoneUnitController.createUnit);
router.get(['/units/:id', '/units/detail'], iphoneUnitController.getUnitById);
router.put(['/units/:id', '/units'], iphoneUnitController.updateUnit);
router.patch(['/units/:id/status', '/units/status'], iphoneUnitController.updateUnitStatus);
router.delete(['/units/:id', '/units'], iphoneUnitController.deleteUnit);

// 4. Manajemen Booking & Transaksi
router.get('/bookings', bookingController.getAllBookings);
router.post('/bookings', bookingController.createBooking);
router.get(['/bookings/:id', '/bookings/detail'], bookingController.getBookingById);
router.patch(['/bookings/:id/status', '/bookings/status'], bookingController.updateBookingStatus);
router.put(['/bookings/:id', '/bookings'], bookingController.updateBookingDetails);

// 5. Upload File (Foto Unit / Bukti Transfer)
const flexibleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'Ukuran file terlalu besar. Maksimum ukuran file adalah 5MB.', 400);
        }
        return errorResponse(res, `Terjadi kesalahan saat mengunggah file: ${err.message}`, 400);
      }
      if (err.message && err.message.includes('Unexpected end of form')) {
        return errorResponse(res, 'Tidak ada file gambar yang diunggah.', 400);
      }
      return errorResponse(
        res,
        err.message || 'Format file tidak didukung! Hanya gambar JPEG, JPG, PNG, dan WEBP yang diperbolehkan.',
        err.statusCode || 400
      );
    }
    if (req.files && req.files.length > 0) {
      const validFiles = req.files.filter((f) => f.size > 0 || (f.originalname && f.originalname.trim() !== ''));
      if (validFiles.length > 0) {
        req.file = validFiles.find((f) => f.fieldname === 'file' || f.fieldname === 'image') || validFiles[0];
      }
    }
    next();
  });
};
router.post('/upload', flexibleUpload, uploadController.uploadFile);

// 6. Laporan Transaksi
router.get('/reports', reportController.getReports);

module.exports = router;
