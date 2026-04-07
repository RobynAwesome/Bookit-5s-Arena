import mongoose from 'mongoose';

const LeagueTeamSchema = new mongoose.Schema(
  {
    /* League reference */
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true,
    },

    /* Manager / captain details */
    managerName: { type: String, required: true, trim: true },
    managerEmail: { type: String, required: true, trim: true, lowercase: true },
    managerPhone: { type: String, required: true, trim: true },
    managerImage: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    /* Team identity */
    teamName: { type: String, required: true, trim: true },
    logo: { type: String }, // Team logo URL

    /* Players (5 required + up to 3 reserves) */
    players: [
      {
        name: { type: String, required: true },
        position: { type: String, enum: ['GK', 'DEF', 'MID', 'FWD'], default: 'MID' },
        isReserve: { type: Boolean, default: false },
        image: { type: String },
      },
    ],

    /* Support staff (up to 3) */
    supportGuests: [
      {
        name: { type: String },
        role: { type: String },
        image: { type: String },
      },
    ],

    /* Communication preference */
    communicationPref: {
      type: String,
      enum: ['sms', 'email', 'whatsapp'],
      default: 'whatsapp',
    },

    /* Group assignment (if league uses group-stage format) */
    groupLetter: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] },

    /* Standings */
    mp: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    d: { type: Number, default: 0 },
    l: { type: Number, default: 0 },
    gf: { type: Number, default: 0 },
    ga: { type: Number, default: 0 },
    gd: { type: Number, default: 0 },
    pts: { type: Number, default: 0 },

    /* Status */
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'disqualified'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Validations (same as TournamentTeam)
LeagueTeamSchema.path('players').validate(function (players) {
  const starters = players.filter((p) => !p.isReserve);
  return starters.length >= 5;
}, 'A team must have at least 5 starting players.');

LeagueTeamSchema.path('players').validate(function (players) {
  const reserves = players.filter((p) => p.isReserve);
  return reserves.length <= 3;
}, 'A team can have at most 3 reserve players.');

LeagueTeamSchema.path('supportGuests').validate(function (guests) {
  return guests.length <= 3;
}, 'A team can have at most 3 support guests.');

// Indexes
LeagueTeamSchema.index({ leagueId: 1, groupLetter: 1 });
LeagueTeamSchema.index({ leagueId: 1, pts: -1, gd: -1, gf: -1 });

const LeagueTeam =
  mongoose.models.LeagueTeam || mongoose.model('LeagueTeam', LeagueTeamSchema);

export default LeagueTeam;
