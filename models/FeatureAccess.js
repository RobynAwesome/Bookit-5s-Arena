import mongoose from 'mongoose';

const FeatureAccessSchema = new mongoose.Schema({
  featureKey:     { type: String, required: true, unique: true, index: true },
  label:          { type: String, required: true },
  tier:           { type: String, enum: ['guest', 'user', 'manager', 'admin'], required: true },
  tab:            { type: String, required: true },
  section:        { type: String, required: true },
  defaultEnabled: { type: Boolean, default: true },
  roleOverrides:  { type: Map, of: Boolean, default: {} },
  userOverrides:  { type: Map, of: Boolean, default: {} },
}, { timestamps: true });

export default mongoose.models.FeatureAccess ||
  mongoose.model('FeatureAccess', FeatureAccessSchema);
