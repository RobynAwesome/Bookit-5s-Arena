import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema({
  path: { type: String, required: true },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  sessionId: { type: String, default: '' }, // anonymous session tracking
  userId: { type: String, default: null }, // logged-in user if any
  timestamp: { type: Date, default: Date.now },
  country: { type: String, default: '' },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
  event: { type: String, default: 'pageview' }, // 'pageview', 'click', 'book_click', 'whatsapp_click', etc.
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: false });

PageViewSchema.index({ timestamp: -1 });
PageViewSchema.index({ path: 1, timestamp: -1 });

if (mongoose.models.PageView) {
  try { mongoose.deleteModel('PageView'); } catch {}
}
export default mongoose.model('PageView', PageViewSchema);
