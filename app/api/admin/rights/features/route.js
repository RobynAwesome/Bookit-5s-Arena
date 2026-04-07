export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { isSuperAdmin } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import FeatureAccess from '@/models/FeatureAccess';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || !isSuperAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Super admin access required.' }, { status: 403 });
    }

    await connectDB();
    const features = await FeatureAccess.find({}).sort({ tier: 1, tab: 1, section: 1 }).lean();

    // Group by tier → tab → features[]
    const grouped = {};
    for (const f of features) {
      if (!grouped[f.tier]) grouped[f.tier] = {};
      if (!grouped[f.tier][f.tab]) grouped[f.tier][f.tab] = [];
      grouped[f.tier][f.tab].push({
        featureKey: f.featureKey,
        label: f.label,
        section: f.section,
        defaultEnabled: f.defaultEnabled,
        roleOverrides: Object.fromEntries(f.roleOverrides || new Map()),
        userOverrides: Object.fromEntries(f.userOverrides || new Map()),
      });
    }

    return NextResponse.json({ grouped });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
