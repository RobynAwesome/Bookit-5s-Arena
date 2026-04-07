export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export async function GET(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const newsletter = await Newsletter.findById(params.id).lean();
    if (!newsletter) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ newsletter });
  } catch (err) {
    console.error('GET /api/admin/newsletters/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const body = await request.json();
    const { title, subject, fromName, bodyHtml, status, scheduledAt } = body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (subject !== undefined) update.subject = subject;
    if (fromName !== undefined) update.fromName = fromName;
    if (bodyHtml !== undefined) update.body = bodyHtml;
    if (status !== undefined) update.status = status;
    if (scheduledAt !== undefined) update.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    const newsletter = await Newsletter.findByIdAndUpdate(params.id, update, { new: true });
    if (!newsletter) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ newsletter });
  } catch (err) {
    console.error('PUT /api/admin/newsletters/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const newsletter = await Newsletter.findByIdAndDelete(params.id);
    if (!newsletter) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/newsletters/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
