const express = require('express');
const {
  getFlights,
  searchFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require('../controllers/flightController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getFlights);
router.get('/search', searchFlights);
router.get('/:id', getFlightById);
router.post('/', protect, isAdmin, createFlight);
router.put('/:id', protect, isAdmin, updateFlight);
router.delete('/:id', protect, isAdmin, deleteFlight);

module.exports = router;
