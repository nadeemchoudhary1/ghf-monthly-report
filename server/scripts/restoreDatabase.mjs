import dotenv from 'dotenv';
import fs from 'fs';
import zlib from 'zlib';
import { closeDatabaseConnection, connectToDatabase } from '../config/database.js';
import Admin from '../models/Admin.js';
import IntegrationOutbox from '../models/IntegrationOutbox.js';
import Submission from '../models/Submission.js';
import SyncJob from '../models/SyncJob.js';

dotenv.config();

/**
 * Restore a compressed JSON backup into a target MongoDB database.
 * By default refuses to restore into production MONGODB_URI unless explicitly overridden.
 */
export async function restoreDatabaseBackup({
  filePath,
  targetUri = process.env.RESTORE_MONGODB_URI,
  allowProductionOverwrite = false,
} = {}) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Valid backup filePath is required.');
  }
  if (!targetUri) {
    throw new Error('Target RESTORE_MONGODB_URI is required (never overwrite production implicitly).');
  }
  if (
    !allowProductionOverwrite &&
    process.env.MONGODB_URI &&
    targetUri.trim() === process.env.MONGODB_URI.trim()
  ) {
    throw new Error('Safety block: targetUri matches production MONGODB_URI.');
  }

  const rawBuffer = fs.readFileSync(filePath);
  const parsed = JSON.parse(zlib.gunzipSync(rawBuffer).toString('utf8'));
  const collections = parsed?.collections || {};

  const connected = await connectToDatabase(targetUri);
  if (!connected) {
    throw new Error('Cannot connect to target MongoDB for restore.');
  }

  // Clear target test database collections before restoring clean snapshot
  await Promise.all([
    Submission.deleteMany({}),
    Admin.deleteMany({}),
    IntegrationOutbox.deleteMany({}),
    SyncJob.deleteMany({}),
  ]);

  if (collections.submissions?.length) {
    await Submission.insertMany(collections.submissions, { ordered: false });
  }
  if (collections.admins?.length) {
    await Admin.insertMany(collections.admins, { ordered: false });
  }
  if (collections.outboxes?.length) {
    await IntegrationOutbox.insertMany(collections.outboxes, { ordered: false });
  }
  if (collections.syncJobs?.length) {
    await SyncJob.insertMany(collections.syncJobs, { ordered: false });
  }

  await Promise.all([
    Submission.syncIndexes(),
    Admin.syncIndexes(),
    IntegrationOutbox.syncIndexes(),
    SyncJob.syncIndexes(),
  ]);

  return {
    restoredCounts: {
      submissions: await Submission.countDocuments({}),
      admins: await Admin.countDocuments({}),
      outboxes: await IntegrationOutbox.countDocuments({}),
      syncJobs: await SyncJob.countDocuments({}),
    },
  };
}

const isCli = process.argv[1]?.endsWith('restoreDatabase.mjs');
if (isCli) {
  const fileArg = process.argv.find((a) => a.startsWith('--file='))?.slice(7);
  const uriArg = process.argv.find((a) => a.startsWith('--uri='))?.slice(6);
  const allowProd = process.argv.includes('--allow-production-overwrite');

  restoreDatabaseBackup({
    filePath: fileArg,
    targetUri: uriArg || process.env.RESTORE_MONGODB_URI,
    allowProductionOverwrite: allowProd,
  })
    .then(async (res) => {
      console.info('[RESTORE] Restore complete:', res.restoredCounts);
      await closeDatabaseConnection();
    })
    .catch(async (err) => {
      console.error('[RESTORE] Failed:', err?.message || err);
      await closeDatabaseConnection();
      process.exit(1);
    });
}
