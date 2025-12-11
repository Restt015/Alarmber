const express = require('express');
const router = express.Router();
const {
    getAlerts,
    getAlertById,
    createAlert,
    updateAlert,
    deleteAlert,
    deactivateAlert
} = require('../controllers/alertController');
const { protect, admin } = require('../middleware/auth');
const { validateAlert } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAlerts);
router.get('/:id', getAlertById);

// Admin only routes
router.post('/', protect, admin, upload.single('image'), validateAlert, createAlert);
router.put('/:id', protect, admin, upload.single('image'), updateAlert);
router.delete('/:id', protect, admin, deleteAlert);
router.patch('/:id/deactivate', protect, admin, deactivateAlert);

module.exports = router;
