import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  fromName: { type: String, default: '5S Arena' },
  body: { type: String, required: true }, // HTML content
  status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
  scheduledAt: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  recipientCount: { type: Number, default: 0 },
}, { timestamps: true });

if (mongoose.models.Newsletter) {
  try { mongoose.deleteModel('Newsletter'); } catch {}
}
export default mongoose.model('Newsletter', NewsletterSchema);
