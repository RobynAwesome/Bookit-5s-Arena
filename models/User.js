import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Not required — OAuth users won't have a password
      minlength: [6, 'Password must be at least 6 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    // Custom uploaded avatar (overrides image from OAuth)
    profileImage: {
      type: String,
      default: null,
    },
    // Public handle — auto-generated from name on OAuth sign-up, editable by user
    username: {
      type: String,
      trim: true,
      default: null,
    },
    // Phone number for WhatsApp/SMS communication
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    // Communication preference: 'email' | 'whatsapp' | 'sms' — mandatory pick one
    communicationPreference: {
      type: String,
      enum: ['email', 'whatsapp', 'sms'],
      default: 'email',
    },
    // Newsletter opt-in — defaults to true for new users (auto-subscribe)
    newsletterOptIn: {
      type: Boolean,
      default: true,
    },
    // Birthday — for celebrations & free booking claim
    birthDate: {
      type: Date,
      default: null,
    },
    // Has the user claimed their free birthday booking this year?
    birthdayClaimedYear: {
      type: Number,
      default: null,
    },
    // Multi-role support: user can hold one or more roles simultaneously
    // 'user' = regular user, 'manager' = manages squads/tournaments, 'admin' = god-mode
    roles: {
      type: [String],
      enum: ['user', 'manager', 'admin'],
      default: ['user'],
      validate: {
        validator: function (arr) {
          if (!arr || arr.length < 1) return false;
          const valid = ['user', 'manager', 'admin'];
          if (!arr.every((r) => valid.includes(r))) return false;
          // Only rkholofelo@gmail.com may have all 3 roles
          if (arr.length === 3 && this.email !== 'rkholofelo@gmail.com') return false;
          return true;
        },
        message: 'Invalid roles configuration',
      },
    },
    // Backward compat: single role field kept as virtual getter
    role: {
      type: String,
      enum: ['user', 'manager', 'admin'],
    },
    // Referral system
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralPoints: {
      type: Number,
      default: 0,
    },
    referralChain: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        level: { type: Number, min: 1, max: 5 },
        pointsEarned: { type: Number, default: 0 },
      },
    ],
    // Player status (e.g. "Ready for Match", "Looking for Team", "Injured")
    status: {
      type: String,
      trim: true,
      maxlength: [100, 'Status must be at most 100 characters'],
      default: 'Ready for 5s Arena',
    },
  },
  { timestamps: true }
);

// Enforce super admin roles invariant and backward compat
UserSchema.pre('save', async function () {
  // Super admin always gets all 3 roles
  if (this.email === 'rkholofelo@gmail.com') {
    this.roles = ['user', 'manager', 'admin'];
  }
  // No other user can have all 3 roles
  if (this.email !== 'rkholofelo@gmail.com' && this.roles?.length === 3) {
    this.roles = this.roles.filter((r) => r !== 'admin');
  }
  // Ensure roles array is never empty
  if (!this.roles || this.roles.length === 0) {
    this.roles = ['user'];
  }
  // Sync backward-compat role field with highest role in array
  const hierarchy = { user: 0, manager: 1, admin: 2 };
  this.role = this.roles.reduce((max, r) => (hierarchy[r] || 0) > (hierarchy[max] || 0) ? r : max, this.roles[0]);
});

// Auto-generate referral code if not set
UserSchema.pre('save', async function () {
  if (!this.referralCode) {
    const namePart = (this.name || 'user')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `${namePart}${randomPart}`;
  }
});

// Hash password before saving if it was modified
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare plain password with stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// In dev, hot-reload can leave a stale model in mongoose.models with the old schema.
// Always delete and re-register so schema changes (new fields, new enum values) take effect immediately.
if (mongoose.models.User) {
  try { mongoose.deleteModel('User'); } catch { /* ignore */ }
}
if (mongoose.modelSchemas?.User) {
  delete mongoose.modelSchemas.User;
}
export default mongoose.model('User', UserSchema);
