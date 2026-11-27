import mongoose from 'mongoose';

let isListenersAttached = false;

function attachConnectionListeners() {
  if (isListenersAttached) return;
  isListenersAttached = true;

  mongoose.connection.on('connected', () => {
    console.info('[DB] MongoDB connection established.');
  });

  mongoose.connection.on('reconnected', () => {
    console.info('[DB] MongoDB reconnected.');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB connection error:', err?.message || 'Unknown error');
  });
}

/**
 * Establish a single reusable Mongoose connection to MongoDB Atlas.
 * Never logs the raw connection string or credentials.
 */
export async function connectToDatabase(uri = process.env.MONGODB_URI) {
  attachConnectionListeners();

  if (!uri || typeof uri !== 'string' || !uri.trim()) {
    console.warn('[DB] MONGODB_URI is not configured. Running without active DB connection.');
    return false;
  }

  // Reuse existing active or pending connection
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return true;
  }

  try {
    await mongoose.connect(uri.trim(), {
      maxPoolSize: 5, // Ideal for Atlas M0 free tier connection limits
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000,
    });
    return true;
  } catch (err) {
    console.error('[DB] Initial MongoDB connection failed:', err?.message || 'Unknown error');
    return false;
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus() {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    case 0:
    default:
      return 'disconnected';
  }
}

export async function closeDatabaseConnection() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}
