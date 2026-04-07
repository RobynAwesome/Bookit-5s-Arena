export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { isSuperAdmin } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import FeatureAccess from '@/models/FeatureAccess';

// PATCH /api/admin/rights/features/[featureKey]
// Body: { roleOverrides?: { role: true|false|null }, userOverrides?: { userId: true|false|null } }
export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || !isSuperAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Super admin access required.' }, { status: 403 });
    }

    const { featureKey } = await params;
    const body = await request.json();

    await connectDB();
    const feature = await FeatureAccess.findOne({ featureKey });
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found.' }, { status: 404 });
    }

    // Apply role overrides: null removes the override, true/false sets it
    if (body.roleOverrides) {
      for (const [role, value] of Object.entries(body.roleOverrides)) {
        if (value === null) {
          feature.roleOverrides.delete(role);
        } else {
          feature.roleOverrides.set(role, Boolean(value));
        }
      }
    }

    // Apply user overrides
    if (body.userOverrides) {
      for (const [userId, value] of Object.entries(body.userOverrides)) {
        if (value === null) {
          feature.userOverrides.delete(userId);
        } else {
          feature.userOverrides.set(userId, Boolean(value));
        }
      }
    }

    // Update defaultEnabled if provided
    if (typeof body.defaultEnabled === 'boolean') {
      feature.defaultEnabled = body.defaultEnabled;
    }

    await feature.save();

    return NextResponse.json({
      featureKey: feature.featureKey,
      defaultEnabled: feature.defaultEnabled,
      roleOverrides: Object.fromEntries(feature.roleOverrides),
      userOverrides: Object.fromEntries(feature.userOverrides),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
