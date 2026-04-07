export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { isSuperAdmin, SUPER_ADMIN_EMAIL } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || !isSuperAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Super admin access required.' }, { status: 403 });
    }

    const { id } = params;
    const { roles } = await request.json();

    if (!Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: 'roles must be a non-empty array.' }, { status: 400 });
    }

    const validRoles = ['user', 'manager', 'admin'];
    if (!roles.every((r) => validRoles.includes(r))) {
      return NextResponse.json({ error: 'Invalid role value.' }, { status: 400 });
    }

    await connectDB();
    const target = await User.findById(id);
    if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    // Prevent granting all 3 roles to anyone except the super admin
    if (target.email !== SUPER_ADMIN_EMAIL && roles.length === 3) {
      return NextResponse.json(
        { error: 'Only the super admin can hold all 3 roles.' },
        { status: 403 }
      );
    }

    // Cannot modify the super admin's roles
    if (target.email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Super admin roles cannot be modified.' },
        { status: 403 }
      );
    }

    target.roles = roles;
    await target.save();

    return NextResponse.json({ success: true, user: { _id: target._id, email: target.email, roles: target.roles } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
