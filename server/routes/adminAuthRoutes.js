import { Router } from 'express';
import {
  changeAdminPassword,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from '../controllers/adminAuthController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { adminCsrfGuard } from '../middleware/securityMiddleware.js';

const router = Router();

router.post('/login', adminCsrfGuard, loginAdmin);
router.post('/logout', adminCsrfGuard, logoutAdmin);
router.get('/me', requireAdminAuth, getCurrentAdmin);
router.post('/change-password', requireAdminAuth, adminCsrfGuard, changeAdminPassword);

export default router;
