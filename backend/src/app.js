const express = require('express');
const cors = require('cors');
const path = require('path');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Konfigurasi CORS
app.use(
  cors({
    origin: '*', // Dapat disesuaikan dengan domain frontend di production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files untuk file upload (foto unit & bukti transfer)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Selamat Datang di RESTful API Sistem Penyewaan iPhone (iPhone Rental System)',
    version: '1.0.0',
    documentation: '/api/v1/health',
    endpoints: {
      publicCatalog: '/api/v1/catalog',
      adminAuth: '/api/v1/auth/login',
      adminDashboard: '/api/v1/admin/dashboard/stats',
      adminModels: '/api/v1/admin/models',
      adminUnits: '/api/v1/admin/units',
      adminBookings: '/api/v1/admin/bookings',
      adminUpload: '/api/v1/admin/upload',
      adminReports: '/api/v1/admin/reports',
    },
  });
});

// Middleware normalisasi multiple slashes (misal: /units//status -> /units/status saat variable kosong di Postman)
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});

// Mount API v1
app.use('/api/v1', routes);

// Middleware 404 Not Found
app.use(notFoundHandler);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
