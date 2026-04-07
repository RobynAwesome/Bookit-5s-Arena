export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import Court from '@/models/Court';

// GET /api/courts/:id — fetch a single court (public)
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid court ID' }, { status: 400 });
    }

    await connectDB();
    const court = await Court.findById(id);

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    return NextResponse.json(court, { status: 200 });
  } catch (error) {
    console.error('GET /api/courts/:id error:', error);
    return NextResponse.json({ error: 'Failed to fetch court' }, { status: 500 });
  }
}

// PUT /api/courts/:id — update a court (owner or admin)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid court ID' }, { status: 400 });
    }

    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();
    const court = await Court.findById(id);

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Allow court owner or admin to edit
    const isOwner = court.owner && court.owner.toString() === session.user.id;
    const isAdmin = requireRole(session, 'admin');
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You are not authorised to edit this court' }, { status: 403 });
    }

    const body = await request.json();

    // Whitelist allowed fields to prevent mass-assignment (e.g. overwriting `owner`)
    const allowedFields = ['name', 'description', 'address', 'location', 'capacity', 'amenities', 'availability', 'price_per_hour', 'image', 'sortOrder'];
    const sanitised = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) sanitised[key] = body[key];
    }

    const updatedCourt = await Court.findByIdAndUpdate(id, sanitised, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updatedCourt, { status: 200 });
  } catch (error) {
    console.error('PUT /api/courts/:id error:', error);
    return NextResponse.json({ error: 'Failed to update court' }, { status: 500 });
  }
}

// DELETE /api/courts/:id — delete a court (owner or admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid court ID' }, { status: 400 });
    }

    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();
    const court = await Court.findById(id);

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Allow court owner or admin to delete
    const isOwner = court.owner && court.owner.toString() === session.user.id;
    const isAdmin = requireRole(session, 'admin');
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You are not authorised to delete this court' }, { status: 403 });
    }

    await court.deleteOne();

    return NextResponse.json({ message: 'Court deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/courts/:id error:', error);
    return NextResponse.json({ error: 'Failed to delete court' }, { status: 500 });
  }
}
