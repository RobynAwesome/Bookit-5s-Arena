/**
 * Seed the FeatureAccess collection with all site features.
 * Run with: node scripts/seedFeatures.js
 * Safe to run multiple times (upserts).
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

const FEATURES = [
  // ── GUEST tier ──────────────────────────────────────────────────
  { featureKey: 'guest.courts.view',       label: 'Browse Courts',          tier: 'guest',   tab: 'Courts',        section: 'View',       defaultEnabled: true },
  { featureKey: 'guest.events.view',       label: 'View Events',            tier: 'guest',   tab: 'Events',        section: 'View',       defaultEnabled: true },
  { featureKey: 'guest.tournament.view',   label: 'View Tournament Info',   tier: 'guest',   tab: 'Tournament',    section: 'View',       defaultEnabled: true },
  { featureKey: 'guest.standings.view',    label: 'View Standings',         tier: 'guest',   tab: 'Tournament',    section: 'Standings',  defaultEnabled: true },
  { featureKey: 'guest.fixtures.view',     label: 'View Fixtures',          tier: 'guest',   tab: 'Fixtures',      section: 'View',       defaultEnabled: true },
  { featureKey: 'guest.leagues.view',      label: 'View Leagues',           tier: 'guest',   tab: 'Competitions',  section: 'View',       defaultEnabled: true },
  { featureKey: 'guest.booking.guest',     label: 'Guest Booking',          tier: 'guest',   tab: 'Bookings',      section: 'Create',     defaultEnabled: true },

  // ── USER tier ────────────────────────────────────────────────────
  { featureKey: 'user.bookings.create',    label: 'Create Booking',         tier: 'user',    tab: 'Bookings',      section: 'Create',     defaultEnabled: true },
  { featureKey: 'user.bookings.view',      label: 'View Own Bookings',      tier: 'user',    tab: 'Bookings',      section: 'View',       defaultEnabled: true },
  { featureKey: 'user.bookings.cancel',    label: 'Cancel Booking',         tier: 'user',    tab: 'Bookings',      section: 'Cancel',     defaultEnabled: true },
  { featureKey: 'user.profile.view',       label: 'View Profile',           tier: 'user',    tab: 'Profile',       section: 'View',       defaultEnabled: true },
  { featureKey: 'user.profile.edit',       label: 'Edit Profile',           tier: 'user',    tab: 'Profile',       section: 'Edit',       defaultEnabled: true },
  { featureKey: 'user.profile.avatar',     label: 'Upload Avatar',          tier: 'user',    tab: 'Profile',       section: 'Avatar',     defaultEnabled: true },
  { featureKey: 'user.profile.birthday',   label: 'Birthday Claim',         tier: 'user',    tab: 'Profile',       section: 'Birthday',   defaultEnabled: true },
  { featureKey: 'user.rewards.view',       label: 'View Rewards',           tier: 'user',    tab: 'Rewards',       section: 'View',       defaultEnabled: true },
  { featureKey: 'user.referral.view',      label: 'Referral Programme',     tier: 'user',    tab: 'Rewards',       section: 'Referral',   defaultEnabled: true },
  { featureKey: 'user.fixtures.view',      label: 'View Live Fixtures',     tier: 'user',    tab: 'Fixtures',      section: 'View',       defaultEnabled: true },
  { featureKey: 'user.tournament.register',label: 'Register for Tournament',tier: 'user',    tab: 'Tournament',    section: 'Register',   defaultEnabled: true },
  { featureKey: 'user.tournament.view',    label: 'View Own Team',          tier: 'user',    tab: 'Tournament',    section: 'View',       defaultEnabled: true },
  { featureKey: 'user.chat.support',       label: 'Support Chat',           tier: 'user',    tab: 'Support',       section: 'Chat',       defaultEnabled: true },

  // ── MANAGER tier ─────────────────────────────────────────────────
  { featureKey: 'manager.dashboard.view',  label: 'Manager Dashboard',      tier: 'manager', tab: 'Dashboard',     section: 'View',       defaultEnabled: true },
  { featureKey: 'manager.squad.view',      label: 'View Squad',             tier: 'manager', tab: 'Squad',         section: 'View',       defaultEnabled: true },
  { featureKey: 'manager.squad.edit',      label: 'Edit Players',           tier: 'manager', tab: 'Squad',         section: 'Edit',       defaultEnabled: true },
  { featureKey: 'manager.fixtures.view',   label: 'View Fixtures',          tier: 'manager', tab: 'Fixtures',      section: 'View',       defaultEnabled: true },
  { featureKey: 'manager.standings.view',  label: 'View Standings',         tier: 'manager', tab: 'Standings',     section: 'View',       defaultEnabled: true },

  // ── ADMIN tier ───────────────────────────────────────────────────
  { featureKey: 'admin.dashboard.view',    label: 'Admin Dashboard',        tier: 'admin',   tab: 'Dashboard',     section: 'View',       defaultEnabled: true },
  { featureKey: 'admin.dashboard.godmode', label: 'God-Mode Commands',      tier: 'admin',   tab: 'Dashboard',     section: 'God Mode',   defaultEnabled: true },
  { featureKey: 'admin.bookings.view',     label: 'View All Bookings',      tier: 'admin',   tab: 'Bookings',      section: 'View',       defaultEnabled: true },
  { featureKey: 'admin.bookings.edit',     label: 'Edit Booking Status',    tier: 'admin',   tab: 'Bookings',      section: 'Edit',       defaultEnabled: true },
  { featureKey: 'admin.bookings.payment',  label: 'Mark Payment',           tier: 'admin',   tab: 'Bookings',      section: 'Payment',    defaultEnabled: true },
  { featureKey: 'admin.analytics.view',    label: 'View Analytics',         tier: 'admin',   tab: 'Analytics',     section: 'View',       defaultEnabled: true },
  { featureKey: 'admin.newsletter.view',   label: 'View Newsletter',        tier: 'admin',   tab: 'Newsletter',    section: 'View',       defaultEnabled: true },
  { featureKey: 'admin.newsletter.create', label: 'Create Newsletter',      tier: 'admin',   tab: 'Newsletter',    section: 'Create',     defaultEnabled: true },
  { featureKey: 'admin.newsletter.send',   label: 'Send Newsletter',        tier: 'admin',   tab: 'Newsletter',    section: 'Send',       defaultEnabled: true },
  { featureKey: 'admin.tournament.teams',  label: 'Manage Teams',           tier: 'admin',   tab: 'Tournament',    section: 'Teams',      defaultEnabled: true },
  { featureKey: 'admin.tournament.standings','label': 'Edit Standings',     tier: 'admin',   tab: 'Tournament',    section: 'Standings',  defaultEnabled: true },
  { featureKey: 'admin.tournament.fixtures','label': 'Manage Fixtures',     tier: 'admin',   tab: 'Tournament',    section: 'Fixtures',   defaultEnabled: true },
  { featureKey: 'admin.tournament.draw',   label: 'Generate Draw',          tier: 'admin',   tab: 'Tournament',    section: 'Draw',       defaultEnabled: true },
  { featureKey: 'admin.tournament.notify', label: 'Send Notifications',     tier: 'admin',   tab: 'Tournament',    section: 'Notify',     defaultEnabled: true },
  { featureKey: 'admin.tournament.payment','label': 'Verify Deposit Slip',  tier: 'admin',   tab: 'Tournament',    section: 'Payment',    defaultEnabled: true },
  { featureKey: 'admin.league.teams',      label: 'Manage League Teams',    tier: 'admin',   tab: 'League',        section: 'Teams',      defaultEnabled: true },
  { featureKey: 'admin.league.standings',  label: 'Edit League Standings',  tier: 'admin',   tab: 'League',        section: 'Standings',  defaultEnabled: true },
  { featureKey: 'admin.league.fixtures',   label: 'Manage League Fixtures', tier: 'admin',   tab: 'League',        section: 'Fixtures',   defaultEnabled: true },
  { featureKey: 'admin.league.draw',       label: 'Generate League Draw',   tier: 'admin',   tab: 'League',        section: 'Draw',       defaultEnabled: true },
  { featureKey: 'admin.events.manage',     label: 'Manage Events',          tier: 'admin',   tab: 'Events',        section: 'Manage',     defaultEnabled: true },
  { featureKey: 'admin.courts.manage',     label: 'Manage Courts',          tier: 'admin',   tab: 'Courts',        section: 'Manage',     defaultEnabled: true },
  { featureKey: 'admin.rights.manage',     label: 'Rights Management',      tier: 'admin',   tab: 'Rights',        section: 'Manage',     defaultEnabled: false },
];

const FeatureSchema = new mongoose.Schema({
  featureKey:     { type: String, required: true, unique: true },
  label:          { type: String, required: true },
  tier:           { type: String, enum: ['guest','user','manager','admin'], required: true },
  tab:            { type: String, required: true },
  section:        { type: String, required: true },
  defaultEnabled: { type: Boolean, default: true },
  roleOverrides:  { type: Map, of: Boolean, default: {} },
  userOverrides:  { type: Map, of: Boolean, default: {} },
}, { timestamps: true });

await mongoose.connect(MONGODB_URI);
const FeatureAccess = mongoose.models.FeatureAccess || mongoose.model('FeatureAccess', FeatureSchema);

let upserted = 0;
for (const f of FEATURES) {
  await FeatureAccess.updateOne({ featureKey: f.featureKey }, { $setOnInsert: f }, { upsert: true });
  upserted++;
}
console.log(`✅ Seeded ${upserted} features`);
await mongoose.disconnect();
