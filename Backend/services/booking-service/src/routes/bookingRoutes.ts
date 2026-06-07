import { Router } from 'express';
import { authenticate, requireRole } from '@skylink/shared';
import * as bookingController from '../controllers/bookingController';

const router = Router();

router.post('/', authenticate, bookingController.bookFlight);
router.get('/my', authenticate, bookingController.getMyBookings);
router.get('/count', bookingController.getBookingCount);

// Internal queries (Unauthenticated/Internal communications)
router.get('/passengers', bookingController.getPassengersForFlight);

router.get('/:id', authenticate, bookingController.getBookingById);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

// Administrative
router.get('/', authenticate, requireRole('Administrator', 'Staff'), bookingController.getAllBookings);

export default router;
