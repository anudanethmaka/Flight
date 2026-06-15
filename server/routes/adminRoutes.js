const express = require('express');
const { getAllUsers, updateUserStatus, getStats } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect + isAdmin to all admin routes
router.use(protect, isAdmin);

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/stats', getStats);

module.exports = router;
