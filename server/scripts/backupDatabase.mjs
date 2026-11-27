import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { closeDatabaseConnection, connectToDatabase } from '../config/database.js';
import Admin from '../models/Admin.js';
import IntegrationOutbox from '../models/IntegrationOutbox.js';
import Submission from '../models/Submission.js';
import SyncJob from '../models/SyncJob.js';

dotenv.config();

export async function createDatabaseBackup({
  uri = process.env.MONGODB_URI,
  outputDir = path.resolve(process.cwd(), 'backups'),
} = {}) {
  const connected = await connectToDatabase(uri);
  if (!connected) {
    throw new Error('Cannot connect to MongoDB for backup.');
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(outputDir, `ghf-backup-${timestamp}.json.gz`);

  const [submissions, admins, outboxes, syncJobs] = await Promise.all([
    Submission.find({}).lean(),
    Admin.find({}).lean(),
    IntegrationOutbox.find({}).lean(),
    SyncJob.find({}).lean(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    counts: {
      submissions: submissions.length,
      admins: admins.length,
      outboxes: outboxes.length,
      syncJobs: syncJobs.length,
    },
    collections: {
      submissions,
      admins,
      outboxes,
      syncJobs,
    },
  };

  const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(payload), 'utf8'));
  fs.writeFileSync(filePath, compressed, { mode: 0o600 });

  return { filePath, counts: payload.counts };
}

const isCli = process.argv[1]?.endsWith('backupDatabase.mjs');
if (isCli) {
  createDatabaseBackup()
    .then(async (res) => {
      console.info('[BACKUP] Backup created:', res.filePath, res.counts);
      await closeDatabaseConnection();
    })
    .catch(async (err) => {
      console.error('[BACKUP] Failed:', err?.message || err);
      await closeDatabaseConnection();
      process.exit(1);
    });
}
