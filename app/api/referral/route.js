export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { SITE_URL } from '@/lib/constants';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Points awarded per referral level (1 = direct invite, up to 5 levels deep)
const LEVEL_POINTS = {
  1: 200,
  2: 100,
  3: 50,
  4: 25,
  5: 10,
};

// GET /api/referral — get referral info for the logged-in user
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).populate(
      'referralChain.user',
      'name image createdAt'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure referral code exists
    if (!user.referralCode) {
      await user.save(); // triggers pre-save hook to generate code
    }

    const shareUrl = `${SITE_URL}/register?ref=${user.referralCode}`;

    // Count direct referrals (level 1 in chain)
    const directReferrals = user.referralChain.filter((r) => r.level === 1).length;

    return NextResponse.json({
      referralCode: user.referralCode,
      referralPoints: user.referralPoints,
      directReferrals,
      totalChainSize: user.referralChain.length,
      chain: user.referralChain.map((entry) => ({
        name: entry.user?.name || 'Unknown',
        image: entry.user?.image || null,
        level: entry.level,
        pointsEarned: entry.pointsEarned,
        joinedAt: entry.user?.createdAt || null,
      })),
      shareUrl,
    });
  } catch (error) {
    console.error('GET /api/referral error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral data' }, { status: 500 });
  }
}

// POST /api/referral — apply a referral code
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Validate referral code format (alphanumeric, reasonable length)
    if (!/^[a-zA-Z0-9]{4,20}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid referral code format' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Already has a referrer
    if (user.referredBy) {
      return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 });
    }

    // Cannot use own code
    if (user.referralCode === code.toUpperCase()) {
      return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 });
    }

    // Find the referrer
    const referrer = await User.findOne({ referralCode: code.toUpperCase() });
    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Link this user to the referrer
    user.referredBy = referrer._id;
    await user.save();

    // Walk up the referral chain and award points (max 5 levels)
    let currentAncestor = referrer;
    let level = 1;

    while (currentAncestor && level <= 5) {
      const points = LEVEL_POINTS[level];

      // Award points to this ancestor
      currentAncestor.referralPoints += points;

      // Add the new user to the ancestor's referral chain
      currentAncestor.referralChain.push({
        user: user._id,
        level,
        pointsEarned: points,
      });

      await currentAncestor.save();

      // Move up: who referred this ancestor?
      if (currentAncestor.referredBy) {
        currentAncestor = await User.findById(currentAncestor.referredBy);
        level++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      message: 'Referral code applied successfully!',
      referredBy: referrer.name,
    });
  } catch (error) {
    console.error('POST /api/referral error:', error);
    return NextResponse.json({ error: 'Failed to apply referral code' }, { status: 500 });
  }
}
