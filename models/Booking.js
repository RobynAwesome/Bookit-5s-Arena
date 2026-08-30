import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    // Guest booking fields (when user is not authenticated)
    guestName:  { type: String, default: null },
    guestEmail: { type: String, default: null },
    guestPhone: { type: String, default: null },
    // Per-booking communication snapshot. This is deliberately persisted so a
    // later profile edit cannot rewrite the evidence of where this reservation
    // was supposed to be delivered.
    preferredChannel: {
      type: String,
      enum: ['whatsapp', 'email', 'sms'],
      default: 'whatsapp',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: null,
    },
    // Revision 1 is the original reservation. Each material reschedule bumps
    // this number so a fresh set of messages can be sent while retries within
    // the same revision remain idempotent.
    communicationRevision: {
      type: Number,
      min: 1,
      default: 1,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD'
      required: [true, 'Booking date is required'],
    },
    start_time: {
      type: String, // stored as 'HH:MM'
      required: [true, 'Start time is required'],
    },
    duration: {
      type: Number, // in hours
      required: [true, 'Duration is required'],
      min: [1, 'Minimum booking is 1 hour'],
      max: [3, 'Maximum booking is 3 hours'],
    },
    total_price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    // Occupancy is a separate invariant from customer-visible status. New and
    // touched active bookings set this true; cancellation sets it false. The
    // bookingOccupancy helper owns the active-start partial unique index so it
    // can safely migrate the legacy unconditional unique index at runtime.
    occupancyActive: {
      type: Boolean,
      default: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'reserved'],
      default: 'unpaid',
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    /** Paystack ``reference`` (or other PSP id) — set when initializing checkout and/or on webhook for idempotent lookup */
    externalPaymentRef: {
      type: String,
      default: null,
      trim: true,
    },
    /** Last processed Paystack ``data.id`` — stops replay storms on ``charge.success`` */
    paystackLastEventId: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ─────────────────────────────────────────────────────────────────
// IMPORTANT: the old unconditional unique index on
// { court, date, start_time } is intentionally not declared here. It prevents
// a cancelled slot from ever being reused. lib/bookings/bookingOccupancy.js
// migrates that legacy index to an active-booking-only partial unique index and
// also enforces every occupied hourly segment through BookingSlot.

// Fast lookup of all bookings for a user (GET /api/bookings sorts by date asc)
BookingSchema.index({ user: 1, date: 1 });

// Fast overlap check: given court + date, filter only non-cancelled slots
BookingSchema.index({ court: 1, date: 1, status: 1 });

// Admin dashboard — newest bookings first
BookingSchema.index({ createdAt: -1 });

// Paystack reference lookup (only documents with a non-empty ref participate)
BookingSchema.index(
  { externalPaymentRef: 1 },
  {
    unique: true,
    partialFilterExpression: {
      externalPaymentRef: { $exists: true, $type: 'string', $gt: '' },
    },
  },
);

BookingSchema.index(
  { paystackLastEventId: 1 },
  { sparse: true, partialFilterExpression: { paystackLastEventId: { $gt: '' } } },
);

if (mongoose.models.Booking) {
  try { mongoose.deleteModel('Booking'); } catch { /* ignore */ }
}
if (mongoose.modelSchemas?.Booking) {
  delete mongoose.modelSchemas.Booking;
}
export default mongoose.model('Booking', BookingSchema);
