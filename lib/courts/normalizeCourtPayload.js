function cleanOptionalString(value) {
  if (value === undefined || value === null) return undefined;
  const cleaned = String(value).trim();
  return cleaned || undefined;
}

function normalizeAmenities(value) {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(', ');
    return cleaned || undefined;
  }
  return cleanOptionalString(value);
}

function normalizeImage(body) {
  const direct = cleanOptionalString(body.image);
  if (direct) return direct;

  if (Array.isArray(body.images)) {
    const first = body.images.find((item) => String(item || '').trim());
    return cleanOptionalString(first);
  }

  return undefined;
}

function normalizeFiniteNumber(value, field, { min = Number.NEGATIVE_INFINITY, integer = false } = {}) {
  if (value === undefined || value === null || value === '') return undefined;

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${field} must be a finite number`);
  }
  if (number < min) {
    throw new Error(`${field} must be at least ${min}`);
  }
  if (integer && !Number.isInteger(number)) {
    throw new Error(`${field} must be an integer`);
  }
  return number;
}

/**
 * Normalize public/admin court payloads onto the single persisted Court schema.
 *
 * `pricePerHour` / `images` remain accepted as migration aliases because the
 * old API documented those names, but only `price_per_hour` / `image` are
 * persisted. This prevents the route and model from drifting into two sources
 * of truth again.
 */
export function normalizeCourtPayload(body = {}) {
  const name = cleanOptionalString(body.name);
  const rawPrice = body.price_per_hour ?? body.pricePerHour;
  const price_per_hour = normalizeFiniteNumber(rawPrice, 'price_per_hour', { min: 0 });

  if (!name) {
    throw new Error('name is required');
  }
  if (price_per_hour === undefined) {
    throw new Error('price_per_hour is required');
  }

  const normalized = {
    name,
    price_per_hour,
  };

  const description = cleanOptionalString(body.description);
  const address = cleanOptionalString(body.address);
  const availability = cleanOptionalString(body.availability);
  const amenities = normalizeAmenities(body.amenities);
  const image = normalizeImage(body);
  const capacity = normalizeFiniteNumber(body.capacity, 'capacity', { min: 2, integer: true });
  const sortOrder = normalizeFiniteNumber(body.sortOrder, 'sortOrder', { integer: true });

  if (description !== undefined) normalized.description = description;
  if (address !== undefined) normalized.address = address;
  if (availability !== undefined) normalized.availability = availability;
  if (amenities !== undefined) normalized.amenities = amenities;
  if (image !== undefined) normalized.image = image;
  if (capacity !== undefined) normalized.capacity = capacity;
  if (sortOrder !== undefined) normalized.sortOrder = sortOrder;

  if (body.location && typeof body.location === 'object') {
    const lat = normalizeFiniteNumber(body.location.lat, 'location.lat');
    const lng = normalizeFiniteNumber(body.location.lng, 'location.lng');
    if (lat !== undefined || lng !== undefined) {
      normalized.location = {};
      if (lat !== undefined) normalized.location.lat = lat;
      if (lng !== undefined) normalized.location.lng = lng;
    }
  }

  return normalized;
}
