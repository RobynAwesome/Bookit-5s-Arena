export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import dbConnect from '@/lib/mongodb';
import PageView from '@/models/PageView';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

function detectDevice(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/.test(ua)) return 'mobile';
  return 'desktop';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { path, event = 'pageview', meta = {} } = body;

    if (!path || typeof path !== 'string') return NextResponse.json({ error: 'path required' }, { status: 400 });

    // Validate input types and lengths to prevent abuse
    if (typeof event !== 'string' || event.length > 50) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }
    if (path.length > 500) {
      return NextResponse.json({ error: 'Path too long' }, { status: 400 });
    }
    // Sanitize meta — only allow simple string values, no nested objects/operators
    const sanitizedMeta = {};
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
      for (const [key, val] of Object.entries(meta)) {
        if (typeof key === 'string' && key.length < 50 && !key.startsWith('$')) {
          sanitizedMeta[key] = typeof val === 'string' ? val.slice(0, 200) : String(val).slice(0, 200);
        }
      }
    }

    // Get or create session ID from cookie
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('_sid')?.value;
    const isNewSession = !sessionId;
    if (!sessionId) sessionId = uuidv4();

    // Read referrer from request headers
    const referrer = request.headers.get('referer') || meta.referrer || '';
    const userAgent = request.headers.get('user-agent') || '';
    const device = detectDevice(userAgent);

    // Get session for userId if logged in
    let userId = null;
    try {
      const session = await getAuthSession();
      if (session?.user?.id) userId = session.user.id;
    } catch (_) {
      // ignore auth errors for public tracking
    }

    await dbConnect();
    await PageView.create({
      path,
      referrer,
      userAgent,
      sessionId,
      userId,
      device,
      event,
      meta: sanitizedMeta,
    });

    const response = NextResponse.json({ ok: true });

    // Set session cookie if new
    if (isNewSession) {
      response.cookies.set('_sid', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('POST /api/analytics/track error:', err);
    // Silent fail — never break the user experience
    return NextResponse.json({ ok: true });
  }
}
