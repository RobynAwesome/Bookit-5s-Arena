import mongoose from 'mongoose';
import https from 'node:https';

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

async function resolveDnsJson(name, type) {
  const requestUrl =
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;

  return new Promise((resolve, reject) => {
    const request = https.get(
      requestUrl,
      {
        headers: { accept: 'application/dns-json' },
      },
      (response) => {
        let body = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if ((response.statusCode || 500) >= 400) {
            reject(new Error(`DNS-over-HTTPS lookup failed with ${response.statusCode}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy(new Error('DNS-over-HTTPS lookup timed out'));
    });
  });
}

function parseDnsAnswerData(data) {
  return String(data || '').replace(/\.$/, '').trim();
}

async function deriveDirectMongoUri(uri) {
  const parsed = new URL(uri);
  const srvHost = parsed.hostname;
  const srvName = `_mongodb._tcp.${srvHost}`;

  const [srvPayload, txtPayload] = await Promise.all([
    resolveDnsJson(srvName, 'SRV'),
    resolveDnsJson(srvHost, 'TXT').catch(() => ({ Answer: [] })),
  ]);

  const srvRecords = Array.isArray(srvPayload?.Answer)
    ? srvPayload.Answer
        .map((answer) => parseDnsAnswerData(answer?.data))
        .map((value) => {
          const [priority, weight, port, ...targetParts] = value.split(/\s+/);
          return {
            priority: Number(priority),
            weight: Number(weight),
            port: Number(port),
            target: targetParts.join(' ').replace(/\.$/, ''),
          };
        })
        .filter((record) => record.target && Number.isFinite(record.port))
    : [];

  if (!srvRecords.length) {
    throw new Error(`No SRV records found for ${srvName}`);
  }

  const txtOptions = new URLSearchParams();
  const txtRecords = Array.isArray(txtPayload?.Answer)
    ? txtPayload.Answer.map((answer) => parseDnsAnswerData(answer?.data).replace(/^"|"$/g, ''))
    : [];

  for (const record of txtRecords) {
    for (const segment of record.split('&')) {
      const [key, value] = segment.split('=');
      if (key && value && !txtOptions.has(key)) {
        txtOptions.set(key, value);
      }
    }
  }

  const mergedParams = new URLSearchParams(parsed.searchParams);
  for (const [key, value] of txtOptions.entries()) {
    if (!mergedParams.has(key)) {
      mergedParams.set(key, value);
    }
  }

  const hosts = srvRecords
    .sort((left, right) => left.target.localeCompare(right.target))
    .map((record) => `${record.target}:${record.port}`)
    .join(',');

  const credentials = parsed.username
    ? `${encodeURIComponent(decodeURIComponent(parsed.username))}:${encodeURIComponent(decodeURIComponent(parsed.password))}@`
    : '';

  const pathname = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '/';
  const query = mergedParams.toString();

  return `mongodb://${credentials}${hosts}${pathname}${query ? `?${query}` : ''}`;
}

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
  // If already connected (readyState 1), return
  if (mongoose.connection?.readyState === 1 && cached.conn) {
    return cached.conn;
  }

  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI or MONGODB_DIRECT_URI.');
  }

  // If already connecting (readyState 2), wait for the existing promise
  if (mongoose.connection?.readyState === 2 && cached.promise) {
    await cached.promise;
    if (mongoose.connection.readyState === 1) return mongoose.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, MONGOOSE_OPTS).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    if (isMongoConnectionError(error) && uri.startsWith('mongodb+srv://')) {
      try {
        const directUri = await deriveDirectMongoUri(uri);
        cached.promise = mongoose.connect(directUri, MONGOOSE_OPTS).then((m) => m);
        cached.conn = await cached.promise;
        return cached.conn;
      } catch (fallbackError) {
        cached.promise = null;
        cached.conn = null;
        throw annotateMongoError(fallbackError, uri);
      }
    }
    throw annotateMongoError(error, uri);
  }
};

export default connectDB;
