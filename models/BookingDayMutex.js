import mongoose from 'mongoose';

/**
 * Serialization guard for writes that mutate bookings for one court/day.
 *
 * MongoDB does not provide a native exclusion constraint for overlapping time
 * ranges. Incrementing this document inside the same transaction as the
 * overlap check forces concurrent writers for the same court/day to contend on
 * one document before a booking is persisted.
 */
const BookingDayMutexSchema = new mongoose.Schema(
  {
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    revision: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

BookingDayMutexSchema.index({ court: 1, date: 1 }, { unique: true });

if (mongoose.models.BookingDayMutex) {
  try { mongoose.deleteModel('BookingDayMutex'); } catch {}
}

export default mongoose.model('BookingDayMutex', BookingDayMutexSchema);
