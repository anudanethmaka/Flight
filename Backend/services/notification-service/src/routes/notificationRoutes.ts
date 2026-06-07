import { Router } from 'express';
import { authenticate } from '@skylink/shared';
import * as notificationController from '../controllers/notificationController';

const router = Router();

router.get('/my', authenticate, notificationController.getMyNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Internal query endpoints
router.post('/send', notificationController.sendNotification);
router.post('/flight-update', notificationController.handleFlightUpdate);

export default router;
