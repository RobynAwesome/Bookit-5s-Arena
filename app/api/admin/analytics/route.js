export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import PageView from '@/models/PageView';

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const rawDays = parseInt(searchParams.get('days') || '30', 10);
    const days = Math.min(Math.max(isNaN(rawDays) ? 30 : rawDays, 1), 365); // Clamp 1-365
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const baseFilter = { timestamp: { $gte: since } };

    // Total page views
    const totalPageViews = await PageView.countDocuments({ ...baseFilter, event: 'pageview' });

    // Unique visitors (unique session IDs)
    const uniqueSessions = await PageView.distinct('sessionId', baseFilter);
    const totalVisitors = uniqueSessions.length;

    // Page views by day
    const pageViewsByDayRaw = await PageView.aggregate([
      { $match: { ...baseFilter, event: 'pageview' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const pageViewsByDay = pageViewsByDayRaw.map((d) => ({ date: d._id, count: d.count }));

    // Top pages
    const topPagesRaw = await PageView.aggregate([
      { $match: { ...baseFilter, event: 'pageview' } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topPages = topPagesRaw.map((p) => ({
      path: p._id,
      views: p.count,
      percentage: totalPageViews > 0 ? Math.round((p.count / totalPageViews) * 100) : 0,
    }));

    // Top referrers
    const topReferrersRaw = await PageView.aggregate([
      { $match: { ...baseFilter, referrer: { $ne: '' } } },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: ['$referrer', ''] },
              {
                $arrayElemAt: [
                  { $split: [{ $arrayElemAt: [{ $split: ['$referrer', '//'] }, 1] }, '/'] },
                  0,
                ],
              },
              'direct',
            ],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topReferrers = topReferrersRaw.map((r) => ({ referrer: r._id || 'direct', visits: r.count }));

    // Device breakdown
    const deviceBreakdownRaw = await PageView.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ]);
    const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 };
    for (const d of deviceBreakdownRaw) {
      if (d._id in deviceBreakdown) deviceBreakdown[d._id] = d.count;
    }

    // Top events
    const topEventsRaw = await PageView.aggregate([
      { $match: { ...baseFilter, event: { $ne: 'pageview' } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topEvents = topEventsRaw.map((e) => ({ event: e._id, count: e.count }));

    return NextResponse.json({
      pageViewsByDay,
      topPages,
      topReferrers,
      deviceBreakdown,
      topEvents,
      totalVisitors,
      totalPageViews,
      days,
    });
  } catch (err) {
    console.error('GET /api/admin/analytics error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
