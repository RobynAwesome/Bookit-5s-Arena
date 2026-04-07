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
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'reserved'],
      default: 'unpaid',
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes ─────────────────────────────────────────────────────────────────
// Prevent double bookings: same court, same date, same start_time
BookingSchema.index({ court: 1, date: 1, start_time: 1 }, { unique: true });

// Fast lookup of all bookings for a user (GET /api/bookings sorts by date asc)
BookingSchema.index({ user: 1, date: 1 });

// Fast overlap check: given court + date, filter only non-cancelled slots
BookingSchema.index({ court: 1, date: 1, status: 1 });

// Admin dashboard — newest bookings first
BookingSchema.index({ createdAt: -1 });

// In dev, hot-reload can leave a stale model in mongoose.models with the old schema.
// Always delete and re-register so schema changes (new fields, new enum values) take effect immediately.
if (mongoose.models.Booking) {
  try { mongoose.deleteModel('Booking'); } catch { /* ignore */ }
}
if (mongoose.modelSchemas?.Booking) {
  delete mongoose.modelSchemas.Booking;
}
export default mongoose.model('Booking', BookingSchema);
