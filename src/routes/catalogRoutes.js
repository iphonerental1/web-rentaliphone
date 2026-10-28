const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

// Public catalog endpoints (Tanpa Token)
router.get('/', catalogController.getCatalog);
router.get('/:slug', catalogController.getModelBySlug);

module.exports = router;
