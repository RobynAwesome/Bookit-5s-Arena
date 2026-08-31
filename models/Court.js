import mongoose from 'mongoose';

const BookingPolicySchema = new mongoose.Schema(
  {
    timezone: { type: String, trim: true },
    openTime: {
      type: String,
      trim: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    closeTime: {
      type: String,
      trim: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    slotMinutes: { type: Number, min: 1, max: 720 },
    minDurationHours: { type: Number, min: 1, max: 24 },
    maxDurationHours: { type: Number, min: 1, max: 24 },
    editCutoffMinutes: { type: Number, min: 0, max: 10080 },
  },
  { _id: false },
);

const CourtSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, trim: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    capacity: { type: Number, default: 10 },
    amenities: { type: String, trim: true },
    // Human-facing copy may remain here for legacy records. Booking enforcement
    // uses bookingPolicy when configured, with a legacy resolver only for old data.
    availability: { type: String, trim: true },
    bookingPolicy: { type: BookingPolicySchema, default: undefined },
    price_per_hour: { type: Number, required: true },
    image: { type: String, default: 'court-default.jpg' },
    sortOrder: { type: Number, default: 99 },
  },
  { timestamps: true }
);

// ── Indexes ─────────────────────────────────────────────────────────────────
CourtSchema.index({ sortOrder: 1, createdAt: 1 });
CourtSchema.index({ owner: 1, sortOrder: 1 });

if (mongoose.models.Court) {
  try { mongoose.deleteModel('Court'); } catch {}
}
export default mongoose.model('Court', CourtSchema);
