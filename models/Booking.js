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
    guestName: { type: String, default: null },
    guestEmail: { type: String, default: null },
    guestPhone: { type: String, default: null },
    date: {
      type: String,
      required: [true, 'Booking date is required'],
    },
    start_time: {
      type: String,
      required: [true, 'Start time is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Minimum persisted booking duration is 1 hour'],
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
    externalPaymentRef: {
      type: String,
      default: null,
      trim: true,
    },
    paystackLastEventId: {
      type: String,
      default: null,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

// Exact-start lookup. Overlap exclusion is enforced transactionally through
// BookingDayMutex so cancelled slots can become bookable again.
BookingSchema.index({ court: 1, date: 1, start_time: 1 });
BookingSchema.index({ user: 1, date: 1 });
BookingSchema.index({ court: 1, date: 1, status: 1 });
BookingSchema.index({ createdAt: -1 });

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

BookingSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $exists: true, $type: 'string', $gt: '' },
    },
  },
);

if (mongoose.models.Booking) {
  try { mongoose.deleteModel('Booking'); } catch { /* ignore */ }
}
if (mongoose.modelSchemas?.Booking) {
  delete mongoose.modelSchemas.Booking;
}
export default mongoose.model('Booking', BookingSchema);
