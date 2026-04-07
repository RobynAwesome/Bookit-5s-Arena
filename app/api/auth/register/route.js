export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { rateLimit } from '@/lib/rateLimit';

// POST /api/auth/register
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { name, email, password, recaptchaToken, role: requestedRole } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    // Role whitelisting — SAFETY: Never allow 'admin' registration
    const baseRole = ['user', 'manager'].includes(requestedRole) ? requestedRole : 'user';
    // Build roles array — manager registration includes 'user' + 'manager'
    const roles = baseRole === 'manager' ? ['user', 'manager'] : ['user'];

    // Validate types to prevent NoSQL injection
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input types' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // ── Verify Google reCAPTCHA token (server-side) ──────────────
    // Optional: if token provided, verify it. If not (ad-blocker), allow registration
    // since we have rate-limiting + security notice as fallback protection.
    if (recaptchaToken) {
      try {
        const recaptchaRes = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
          { method: 'POST' }
        );
        const recaptchaData = await recaptchaRes.json();

        if (!recaptchaData.success) {
          return NextResponse.json(
            { error: 'reCAPTCHA verification failed. Please try again.' },
            { status: 400 }
          );
        }
      } catch (err) {
        console.warn('reCAPTCHA verify failed (network):', err.message);
        // Allow registration to proceed — rate-limiting protects against abuse
      }
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Whitelisted fields — prevent mass-assignment
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      roles, // Multi-role array
      newsletterOptIn: true
    });

    return NextResponse.json(
      { message: 'Account created successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
