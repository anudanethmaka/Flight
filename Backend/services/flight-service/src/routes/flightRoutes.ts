import { Router } from 'express';
import { authenticate, requireRole } from '@skylink/shared';
import * as flightController from '../controllers/flightController';

const router = Router();

router.get('/', flightController.searchFlights);
router.get('/count', flightController.getFlightCount);
router.get('/:id', flightController.getFlightById);

router.post('/', authenticate, requireRole('Administrator', 'Staff'), flightController.createFlight);
router.put('/:id', authenticate, requireRole('Administrator', 'Staff'), flightController.updateFlight);
router.delete('/:id', authenticate, requireRole('Administrator'), flightController.deleteFlight);

// Internal query to adjust available seats
router.put('/:id/seats', flightController.adjustSeats);

// AI Assistant
router.post('/assistant/chat', flightController.chatWithAssistant);

export default router;
