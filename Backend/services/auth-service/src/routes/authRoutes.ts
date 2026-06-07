import { Router } from 'express';
import { authenticate, requireRole } from '@skylink/shared';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

// Administrative
router.get('/users', authenticate, requireRole('Administrator'), authController.getAllUsers);
router.post('/staff', authenticate, requireRole('Administrator'), authController.createStaff);

// Internal query
router.get('/count', authController.getUserCount);

export default router;
