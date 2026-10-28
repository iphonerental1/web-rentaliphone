const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAdminToken } = require('../middlewares/authMiddleware');

// Public route: Login admin
router.post('/login', authController.login);

// Protected routes: Profil & ubah password admin
router.get('/me', verifyAdminToken, authController.getMe);
router.put('/password', verifyAdminToken, authController.updatePassword);

module.exports = router;
