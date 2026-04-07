import mongoose from 'mongoose';

const LeagueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  format: { type: String, enum: ['round-robin', 'knockout', 'group-stage', 'league'], required: true },
  maxTeams: { type: Number, required: true, min: 2 },
  entryFee: { type: Number, required: true, min: 0 },
  prizePool: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  registrationDeadline: { type: Date, required: true },
  rules: { type: String, default: '' },
  image: { type: String, default: '' },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Hot-reload safe
if (mongoose.models.League) {
  try { mongoose.deleteModel('League'); } catch {}
}
if (mongoose.modelSchemas?.League) {
  delete mongoose.modelSchemas.League;
}
export default mongoose.model('League', LeagueSchema);
