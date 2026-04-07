export const dynamic = 'force-dynamic';
import { getAuthSession } from '@/lib/getSession';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET — return current user profile
export async function GET(request) {
  const session = await getAuthSession();
  if (!session) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.user.id).select('-password');
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  return Response.json({
    name: user.name,
    email: user.email,
    image: user.profileImage || user.image,
    role: user.role,
    username: user.username || '',
    phone: user.phone || '',
    status: user.status || 'Ready for 5s Arena',
    communicationPreference: user.communicationPreference || 'email',
    newsletterOptIn: user.newsletterOptIn || false,
    birthDate: user.birthDate || null,
    birthdayClaimedYear: user.birthdayClaimedYear || null,
  });
}

// PUT — update name, username, status, newsletter opt-in and/or password
export async function PUT(request) {
  const session = await getAuthSession();
  if (!session) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await request.json();
  const { name, username, status, phone, communicationPreference, newsletterOptIn, birthDate, currentPassword, newPassword } = body;

  // Validate types to prevent NoSQL injection
  if (typeof name !== 'string') {
    return Response.json({ error: 'Invalid input.' }, { status: 400 });
  }

  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    return Response.json({ error: 'Name must be between 2 and 100 characters.' }, { status: 400 });
  }

  // Validate status length
  if (status && status.length > 100) {
    return Response.json({ error: 'Status must be at most 100 characters.' }, { status: 400 });
  }

  // Validate username if provided
  if (username && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return Response.json({ error: 'Username must be 3–30 characters: letters, numbers, underscores only.' }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  // Update fields
  user.name = name.trim();
  if (status !== undefined) user.status = status.trim() || 'Ready for 5s Arena';
  if (username !== undefined) user.username = username.trim() || null;
  if (typeof newsletterOptIn === 'boolean') user.newsletterOptIn = newsletterOptIn;

  // Update phone number
  if (phone !== undefined) {
    user.phone = typeof phone === 'string' ? phone.trim() || null : null;
  }
  // Update communication preference (mandatory: email, whatsapp, or sms)
  if (communicationPreference && ['email', 'whatsapp', 'sms'].includes(communicationPreference)) {
    // If choosing whatsapp/sms, phone must be provided
    const effectivePhone = phone !== undefined ? phone : user.phone;
    if ((communicationPreference === 'whatsapp' || communicationPreference === 'sms') && !effectivePhone) {
      return Response.json({ error: 'Please add a phone number to use WhatsApp or SMS communication.' }, { status: 400 });
    }
    user.communicationPreference = communicationPreference;
  }

  // Update birth date if provided
  if (birthDate !== undefined) {
    if (birthDate === null) {
      user.birthDate = null;
    } else {
      const parsed = new Date(birthDate);
      if (isNaN(parsed.getTime())) {
        return Response.json({ error: 'Invalid birth date.' }, { status: 400 });
      }
      // Must be in the past and person must be at least 5 years old
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      if (parsed > fiveYearsAgo) {
        return Response.json({ error: 'Please enter a valid birth date.' }, { status: 400 });
      }
      user.birthDate = parsed;
    }
  }

  // Update password only if a new one was provided
  if (newPassword) {
    if (newPassword.length < 6) {
      return Response.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
    }
    // Credentials users must verify current password first
    if (user.password) {
      if (!currentPassword) {
        return Response.json({ error: 'Please enter your current password to change it.' }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return Response.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }
    }
    user.password = newPassword; // pre-save hook hashes it
  }

  await user.save();
  return Response.json({ message: 'Profile updated successfully.' });
}
