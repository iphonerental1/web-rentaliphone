const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const catalogRoutes = require('./catalogRoutes');
const adminRoutes = require('./adminRoutes');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'iPhone Rental Backend API',
    version: '1.0.0',
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
