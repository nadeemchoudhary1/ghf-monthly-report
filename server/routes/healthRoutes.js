import { Router } from 'express';
import { getDatabaseStatus, isDatabaseConnected } from '../config/database.js';

const router = Router();

router.get('/', (_req, res) => {
  const dbStatus = getDatabaseStatus();
  const connected = isDatabaseConnected();

  return res.status(connected ? 200 : 503).json({
    success: connected,
    server: 'online',
    database: dbStatus,
  });
});

export default router;
