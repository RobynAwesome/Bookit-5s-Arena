export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const newsletters = await Newsletter.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ newsletters });
  } catch (err) {
    console.error('GET /api/admin/newsletters error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const body = await request.json();
    const { title, subject, fromName, bodyHtml, status, scheduledAt } = body;

    if (!title || !subject || !bodyHtml) {
      return NextResponse.json({ error: 'title, subject and body are required' }, { status: 400 });
    }

    const newsletter = await Newsletter.create({
      title,
      subject,
      fromName: fromName || '5S Arena',
      body: bodyHtml,
      status: status || 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });

    return NextResponse.json({ newsletter }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/newsletters error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
