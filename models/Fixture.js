import mongoose from 'mongoose';

const FixtureSchema = new mongoose.Schema(
  {
    /* Competition context */
    competitionType: {
      type: String,
      enum: ['tournament', 'league'],
      required: true,
    },
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      default: null, // null for tournament, league _id for leagues
    },

    /* Group / round info */
    groupLetter: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    },
    matchday: { type: Number, default: 1 },
    round: {
      type: String,
      enum: ['group', 'league', 'r16', 'qf', 'sf', 'final', 'third-place'],
      default: 'group',
    },

    /* Teams */
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'homeTeamModel',
      required: true,
    },
    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'awayTeamModel',
      required: true,
    },
    homeTeamModel: {
      type: String,
      enum: ['TournamentTeam', 'LeagueTeam'],
      default: 'TournamentTeam',
    },
    awayTeamModel: {
      type: String,
      enum: ['TournamentTeam', 'LeagueTeam'],
      default: 'TournamentTeam',
    },

    /* Scores */
    homeScore: { type: Number, default: null },
    awayScore: { type: Number, default: null },

    /* Match status */
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'postponed'],
      default: 'scheduled',
    },

    /* Schedule */
    scheduledAt: { type: Date },
    venue: { type: String, default: 'Hellenic Football Club, Milnerton' },

    /* Match events (goals, cards, subs) */
    events: [
      {
        minute: { type: Number },
        type: { type: String, enum: ['goal', 'own-goal', 'yellow-card', 'red-card', 'substitution'] },
        teamId: { type: mongoose.Schema.Types.ObjectId },
        playerName: { type: String },
        detail: { type: String }, // e.g. "Penalty", "Header", "Free Kick"
      },
    ],

    /* Notification tracking */
    notificationsSent: {
      schedule: { type: Boolean, default: false },
      result: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Index for efficient queries
FixtureSchema.index({ competitionType: 1, groupLetter: 1, status: 1 });
FixtureSchema.index({ competitionType: 1, competitionId: 1, matchday: 1 });
FixtureSchema.index({ homeTeam: 1 });
FixtureSchema.index({ awayTeam: 1 });

const Fixture =
  mongoose.models.Fixture || mongoose.model('Fixture', FixtureSchema);

export default Fixture;
