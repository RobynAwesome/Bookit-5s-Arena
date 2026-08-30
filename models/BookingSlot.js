import mongoose from 'mongoose';

const BookingSlotSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    slot_time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// This is the authoritative multi-hour occupancy invariant. A 3-hour booking
// owns three independent hourly rows. Any overlapping request must collide on
// at least one unique (court, date, slot_time) key and its transaction aborts.
BookingSlotSchema.index(
  { court: 1, date: 1, slot_time: 1 },
  { unique: true, name: 'booking_hourly_slot_unique' }
);

BookingSlotSchema.index({ booking: 1, slot_time: 1 });

if (mongoose.models.BookingSlot) {
  try { mongoose.deleteModel('BookingSlot'); } catch { /* ignore hot reload */ }
}
if (mongoose.modelSchemas?.BookingSlot) {
  delete mongoose.modelSchemas.BookingSlot;
}

export default mongoose.model('BookingSlot', BookingSlotSchema);
