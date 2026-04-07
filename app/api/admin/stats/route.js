export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getAuthSession();

    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Admins only' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const statusFilter = searchParams.get('status');

    const today = new Date().toISOString().split('T')[0];

    const match = { status: { $ne: 'cancelled' } };
    // Validate date formats to prevent injection
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) match.date = { ...match.date, $gte: from };
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) match.date = { ...match.date, $lte: to };
    // Only allow known status filters
    if (statusFilter === 'upcoming') match.date = { ...match.date, $gte: today };
    if (statusFilter === 'past') match.date = { ...match.date, $lt: today };

    // Build last-7-days range for revenue trend
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const [
      totalBookings,
      revenueResult,
      courts,
      upcomingBookings,
      mostBooked,
      courtBreakdown,
      statusBreakdown,
      recentBookings,
      totalUsers,
      revenueLast7,
      cancelledCount,
      hourBreakdown,
    ] = await Promise.all([
      Booking.countDocuments(match),
      Booking.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$total_price' } } },
      ]),
      Court.countDocuments(),
      Booking.countDocuments({ date: { $gte: today }, status: { $ne: 'cancelled' } }),
      Booking.aggregate([
        { $match: match },
        { $group: { _id: '$court', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        { $lookup: { from: 'courts', localField: '_id', foreignField: '_id', as: 'court' } },
        { $unwind: '$court' },
        { $project: { name: '$court.name', count: 1 } },
      ]),
      Booking.aggregate([
        { $match: match },
        { $group: { _id: '$court', bookings: { $sum: 1 }, revenue: { $sum: '$total_price' } } },
        { $sort: { bookings: -1 } },
        { $lookup: { from: 'courts', localField: '_id', foreignField: '_id', as: 'court' } },
        { $unwind: '$court' },
        { $project: { name: '$court.name', bookings: 1, revenue: 1 } },
      ]),
      // Status breakdown (all bookings, no filter)
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Recent 5 bookings
      Booking.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('court', 'name')
        .populate('user', 'name email'),
      // Total registered users
      User.countDocuments(),
      // Revenue per day for last 7 days
      Booking.aggregate([
        { $match: { date: { $gte: last7[0] }, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$date', revenue: { $sum: '$total_price' }, bookings: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Cancelled count
      Booking.countDocuments({ status: 'cancelled' }),
      // Hour breakdown (peak hours)
      Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $project: { hour: { $substr: ['$start_time', 0, 2] } } },
        { $group: { _id: '$hour', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total ?? 0;
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    // Merge revenue trend with all 7 days (fill gaps with 0)
    const revenueTrend = last7.map((date) => {
      const found = revenueLast7.find((r) => r._id === date);
      return { date, revenue: found?.revenue ?? 0, bookings: found?.bookings ?? 0 };
    });

    // Format status breakdown as object
    const statusCounts = { confirmed: 0, pending: 0, cancelled: 0 };
    statusBreakdown.forEach((s) => {
      if (s._id in statusCounts) statusCounts[s._id] = s.count;
    });
    statusCounts.cancelled = cancelledCount;

    // Payment breakdown
    const allBookings = await Booking.find({}).lean();
    const paidCount = allBookings.filter(b => b.paymentStatus === 'paid').length;
    const unpaidConfirmed = allBookings.filter(b => b.status === 'confirmed' && b.paymentStatus !== 'paid').length;
    const refundedCount = allBookings.filter(b => b.paymentStatus === 'refunded').length;
    const paidRevenue = allBookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.total_price || 0), 0);

    // Format recent bookings
    const recentBookingsList = recentBookings.map((b) => ({
      _id: b._id,
      courtName: b.court?.name ?? 'Unknown',
      userName: b.user?.name ?? 'Guest',
      date: b.date,
      start_time: b.start_time,
      total_price: b.total_price,
      status: b.status,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
    }));

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      totalCourts: courts,
      upcomingBookings,
      mostBookedCourt: mostBooked[0] ?? null,
      courtBreakdown,
      avgBookingValue,
      totalUsers,
      revenueTrend,
      statusCounts,
      recentBookings: recentBookingsList,
      peakHours: hourBreakdown.map((h) => ({ hour: `${h._id}:00`, count: h.count })),
      paidCount,
      unpaidConfirmed,
      refundedCount,
      paidRevenue,
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
