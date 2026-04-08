import mongoose from 'mongoose';

// Use a cached connection to avoid creating a new connection on every serverless request
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// ── Connection options ────────────────────────────────────────────────────────
// bufferCommands: false — fail immediately if DB is not connected instead of
//   silently queuing operations (surfaces Atlas outages fast in serverless)
// maxPoolSize: 10 — up to 10 concurrent connections per worker instance
// serverSelectionTimeoutMS: 5 s — fast fail if Atlas is unreachable
// socketTimeoutMS: 45 s — close idle TCP sockets before AWS/Vercel kills them
const MONGOOSE_OPTS = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGODB_DIRECT_URI ||
    process.env.MONGODB_URI_DIRECT ||
    process.env.DATABASE_URL ||
    ''
  );
}

export function isMongoConnectionError(error) {
  const message = String(error?.message || '');
  const code = String(error?.code || '');

  return (
    code === 'ENOTFOUND' ||
    code === 'ECONNREFUSED' ||
    message.includes('querySrv') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    message.includes('Server selection timed out') ||
    message.includes('buffering timed out')
  );
}

function annotateMongoError(error, uri) {
  if (!isMongoConnectionError(error)) {
    return error;
  }

  const suffix = uri.startsWith('mongodb+srv://')
    ? ' Atlas SRV DNS lookup failed or timed out. Set MONGODB_DIRECT_URI locally if SRV DNS is unreliable on this network.'
    : ' MongoDB is unreachable from this environment.';

  error.message = `${error.message}${suffix}`;
  return error;
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI, or use MONGODB_DIRECT_URI locally when SRV DNS is unreliable.');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, MONGOOSE_OPTS)
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw annotateMongoError(error, uri);
  }
};

export default connectDB;
