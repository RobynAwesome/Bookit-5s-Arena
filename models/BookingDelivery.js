import mongoose from 'mongoose';

const BookingDeliverySchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    recipientType: {
      type: String,
      enum: ['user', 'business'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'whatsapp', 'sms'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['reservation_receipt', 'reservation_notice', 'payment_receipt'],
      required: true,
    },
    recipientAddress: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sending', 'sent', 'failed', 'skipped'],
      default: 'queued',
      required: true,
    },
    provider: {
      type: String,
      default: null,
      trim: true,
    },
    providerMessageId: {
      type: String,
      default: null,
      trim: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// One logical delivery receipt per booking/recipient/channel/purpose.
// Retries update this document instead of emitting duplicate logical receipts.
BookingDeliverySchema.index(
  { booking: 1, recipientType: 1, channel: 1, purpose: 1 },
  { unique: true, name: 'booking_delivery_idempotency' }
);

BookingDeliverySchema.index({ booking: 1, createdAt: 1 });

if (mongoose.models.BookingDelivery) {
  try { mongoose.deleteModel('BookingDelivery'); } catch { /* ignore hot reload */ }
}
if (mongoose.modelSchemas?.BookingDelivery) {
  delete mongoose.modelSchemas.BookingDelivery;
}

export default mongoose.model('BookingDelivery', BookingDeliverySchema);
