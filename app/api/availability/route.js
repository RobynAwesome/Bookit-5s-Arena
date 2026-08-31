export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Court from '@/models/Court';
import Booking from '@/models/Booking';
import {
  bookingIntervalsOverlap,
  getAllowedStartTimes,
  getDurationOptions,
  resolveBookingPolicy,
} from '@/lib/bookingSlots';

/**
 * GET /api/availability?date=YYYY-MM-DD&courtId=<optional ObjectId>
 *
 * Court policy is data. This endpoint does not decide a venue's operating
 * window or duration rules; it resolves them from the authoritative Court.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const courtId = searchParams.get('courtId');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Query parameter date (YYYY-MM-DD) is required' }, { status: 400 });
    }

    if (courtId && !/^[a-fA-F0-9]{24}$/.test(courtId)) {
      return NextResponse.json({ error: 'Invalid courtId' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (bookingDate < today) {
      return NextResponse.json({ error: 'date must be today or in the future' }, { status: 400 });
    }

    await connectDB();

    const courtFilter = courtId ? { _id: courtId } : {};
    const courts = await Court.find(courtFilter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('_id name bookingPolicy')
      .lean();

    if (courtId && courts.length === 0) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    const courtIds = courts.map((court) => court._id);
    const bookingRows = await Booking.find({
      court: { $in: courtIds },
      date,
      status: { $ne: 'cancelled' },
    })
      .select('court start_time duration')
      .lean();

    const byCourt = new Map();
    for (const row of bookingRows) {
      const key = String(row.court);
      if (!byCourt.has(key)) byCourt.set(key, []);
      byCourt.get(key).push({ start_time: row.start_time, duration: row.duration });
    }

    const courtPayload = courts.map((court) => {
      const policy = resolveBookingPolicy(court.bookingPolicy);
      const bookings = byCourt.get(String(court._id)) || [];
      const durationOptions = getDurationOptions(policy);
      const candidateStarts = getAllowedStartTimes(policy.minDurationHours, policy);

      const slots = candidateStarts.map((slot) => {
        const availableDurations = durationOptions.filter((duration) => {
          const requestSlot = { start_time: slot.value, duration };
          return !bookings.some((booking) => bookingIntervalsOverlap(booking, requestSlot));
        });

        return {
          start_time: slot.value,
          availableDurations,
        };
      }).filter((slot) => slot.availableDurations.length > 0);

      return {
        id: String(court._id),
        name: court.name,
        policy: {
          timezone: policy.timezone,
          openTime: policy.openTime,
          closeTime: policy.closeTime,
          slotMinutes: policy.slotMinutes,
          minDurationHours: policy.minDurationHours,
          maxDurationHours: policy.maxDurationHours,
          editCutoffMinutes: policy.editCutoffMinutes,
          source: policy.source,
        },
        window: { open: policy.openTime, close: policy.closeTime },
        slots,
      };
    });

    const policyFingerprints = new Set(
      courtPayload.map((court) => JSON.stringify(court.policy)),
    );

    return NextResponse.json({
      date,
      window: policyFingerprints.size === 1 && courtPayload[0] ? courtPayload[0].window : null,
      courts: courtPayload,
    }, { status: 200 });
  } catch (error) {
    console.error('GET /api/availability error:', error);
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
  }
}
