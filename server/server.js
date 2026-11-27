import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pathToFileURL } from 'url';
import { closeDatabaseConnection, connectToDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import {
  isOriginAllowed,
  sanitizeMongoOperators,
} from './middleware/securityMiddleware.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminIntegrationRoutes from './routes/adminIntegrationRoutes.js';
import adminSubmissionRoutes from './routes/adminSubmissionRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import { startSyncWorker, stopSyncWorker } from './services/syncWorker.js';
import { ensureInitialAdmin } from './utils/initAdmin.js';
import { attachRequestContext, logEvent } from './utils/logger.js';
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

export function createApp({ rateLimitMax } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(attachRequestContext);
  app.use(helmet());

  app.use(
    cors({
      origin(origin, callback) {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }
        logEvent('warn', 'cors_origin_rejected', { origin });
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());
  app.use(sanitizeMongoOperators);

  const submissionLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    limit: rateLimitMax ?? (Number(process.env.RATE_LIMIT_MAX) || 60),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      status: 'failed',
      message: 'Too many submission requests. Please wait a moment and retry.',
    },
  });

  const adminAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: rateLimitMax ?? 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
    },
  });

  app.use('/api/health', healthRoutes);
  app.use('/api/submissions', submissionLimiter, submissionRoutes);
  app.use('/api/admin/auth', adminAuthLimiter, adminAuthRoutes);
  app.use('/api/admin', adminSubmissionRoutes);
  app.use('/api/admin', adminIntegrationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

async function startServer() {
  const port = Number(process.env.PORT) || 5000;
  const app = createApp();

  const dbConnected = await connectToDatabase();
  if (dbConnected) {
    await ensureInitialAdmin();
    startSyncWorker();
  }

  const server = app.listen(port, () => {
    logEvent('info', 'server_started', {
      port,
      nodeEnv: process.env.NODE_ENV || 'development',
      dbConnected,
    });
  });

  const shutdown = async (signal) => {
    logEvent('info', 'server_shutdown', { signal });
    stopSyncWorker();
    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  startServer();
}
