import dotenv from 'dotenv';
import { closeDatabaseConnection, connectToDatabase } from '../config/database.js';
import { ensureInitialAdmin } from '../utils/initAdmin.js';

dotenv.config();

async function run() {
  const ok = await connectToDatabase();
  if (!ok) {
    console.error('[SEED] Cannot connect to MongoDB. Check MONGODB_URI in server/.env');
    process.exit(1);
  }

  const result = await ensureInitialAdmin();
  console.info('[SEED] Admin initialization result:', result);
  await closeDatabaseConnection();
}

run().catch(async (err) => {
  console.error('[SEED] Failed:', err?.message || err);
  await closeDatabaseConnection();
  process.exit(1);
});
