import mongoose from 'mongoose';

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
    availability: { type: String, trim: true },
    price_per_hour: { type: Number, required: true },
    image: { type: String, default: 'court-default.jpg' },
    sortOrder: { type: Number, default: 99 },
  },
  { timestamps: true }
);

// ── Indexes ─────────────────────────────────────────────────────────────────
// Public court listing sorted by manual order then creation date
CourtSchema.index({ sortOrder: 1, createdAt: 1 });

// Admin "my courts" — filter by owner, ordered by sortOrder
CourtSchema.index({ owner: 1, sortOrder: 1 });

if (mongoose.models.Court) {
  try { mongoose.deleteModel('Court'); } catch {}
}
export default mongoose.model('Court', CourtSchema);
