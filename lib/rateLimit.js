const rateLimitMap = new Map();

export function rateLimit(ip, limit = 5, windowMs = 60000) {
  const windowStart = Date.now() - windowMs;
  
  // Clean up old entries periodically
  if (Math.random() < 0.05) {
    for (const [key, data] of rateLimitMap.entries()) {
      if (data.timestamp < windowStart) {
        rateLimitMap.delete(key);
      }
    }
  }

  const record = rateLimitMap.get(ip) || { count: 0, timestamp: Date.now() };

  if (record.timestamp < windowStart) {
    record.count = 1;
    record.timestamp = Date.now();
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  return record.count > limit;
}
