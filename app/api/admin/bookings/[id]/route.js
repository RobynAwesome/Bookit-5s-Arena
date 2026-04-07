export const dynamic = 'force-dynamic';
        import { NextResponse } from 'next/server';
        import { getAuthSession } from '@/lib/getSession';
        import { requireRole } from '@/lib/roles';
        import dbConnect from '@/lib/mongodb';
        import Booking from '@/models/Booking';

            export async function PATCH(request, { params }) {
                    try {
                        const session = await getAuthSession();
                        if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
                        if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

                        await dbConnect();

                        const { id } = await params;

                        // Validate ObjectId format
                        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
                        return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
                        }

                        const { status } = await request.json();

                        const allowed = ['pending', 'confirmed', 'cancelled'];
                        if (!allowed.includes(status)) {
                        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
                        }

                        const booking = await Booking.findByIdAndUpdate(
                        id,
                        { status },
                        { new: true }
                        );

                        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
                        return NextResponse.json(booking);
                    } catch (error) {
                console.error('Update booking error:', error);
                return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
            }
            }
