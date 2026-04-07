import mongoose from 'mongoose';

const EventBookingSchema = new mongoose.Schema({
  type: { type: String, enum: ['birthday', 'corporate', 'tournament', 'social'], required: true },
  packageName: { type: String, required: true },
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String },
  guestCount: { type: Number, required: true, min: 1 },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Hot-reload safe
if (mongoose.models.EventBooking) {
  try { mongoose.deleteModel('EventBooking'); } catch {}
}
if (mongoose.modelSchemas?.EventBooking) {
  delete mongoose.modelSchemas.EventBooking;
}
export default mongoose.model('EventBooking', EventBookingSchema);
