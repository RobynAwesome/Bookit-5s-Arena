import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import { generateInsights, answerQuestion } from '@/lib/analyticsAI';

// Prevent Next.js from collecting page data at build time
export const dynamic = 'force-dynamic';

// POST /api/admin/analytics/insights — free local AI engine (no API key needed)
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();

    // Chat mode: answer a question
    if (body.question) {
      const answer = answerQuestion(body.question, body.analyticsData, body.bookingStats);
      return NextResponse.json({ answer });
    }

    // Insights mode: generate insights from data
    const insights = generateInsights(body.analyticsData, body.bookingStats);
    return NextResponse.json({ insights });
  } catch (err) {
    console.error('POST /api/admin/analytics/insights error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
