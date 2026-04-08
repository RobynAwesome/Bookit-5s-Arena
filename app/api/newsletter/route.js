export const dynamic = 'force-dynamic';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB, { isMongoConnectionError } from '@/lib/mongodb';
import User from '@/models/User';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { rateLimit } from '@/lib/rateLimit';
import {
  readLocalNewsletterSubscribers,
  upsertLocalNewsletterSubscriber,
} from '@/lib/newsletterSubscribersStore';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

// GET — admin only: list all newsletter subscribers
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return Response.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return Response.json({ error: 'Admin access required' }, { status: 403 });

    let users = [];
    let guests = [];
    let degraded = false;

    try {
      await connectDB();
      [users, guests] = await Promise.all([
        User.find({ newsletterOptIn: true })
          .select('name email username createdAt')
          .sort({ createdAt: -1 }),
        NewsletterSubscriber.find({})
          .select('email subscribedAt createdAt source')
          .sort({ createdAt: -1 }),
      ]);
    } catch (error) {
      if (!isMongoConnectionError(error)) {
        throw error;
      }
      degraded = true;
    }

    const localGuests = await readLocalNewsletterSubscribers();

    const deduped = new Map();

    for (const user of users) {
      deduped.set(String(user.email).toLowerCase(), {
        name: user.name,
        email: user.email,
        username: user.username,
        joinedAt: user.createdAt,
        source: 'user-account',
      });
    }

    for (const guest of guests) {
      const key = String(guest.email).toLowerCase();
      if (!deduped.has(key)) {
        deduped.set(key, {
          name: 'Guest Subscriber',
          email: guest.email,
          username: '',
          joinedAt: guest.subscribedAt || guest.createdAt,
          source: guest.source || 'popup',
        });
      }
    }

    for (const guest of localGuests) {
      const key = String(guest.email).toLowerCase();
      if (!deduped.has(key)) {
        deduped.set(key, {
          name: 'Guest Subscriber',
          email: guest.email,
          username: '',
          joinedAt: guest.subscribedAt || guest.createdAt,
          source: guest.source || 'popup',
        });
      }
    }

    const subscribers = [...deduped.values()].sort(
      (left, right) => new Date(right.joinedAt) - new Date(left.joinedAt),
    );

    return Response.json({
      count: subscribers.length,
      subscribers,
      degraded,
    });
  } catch (error) {
    console.error('GET /api/newsletter error:', error);
    return Response.json({ error: 'Failed to load subscribers.' }, { status: 500 });
  }
}

// POST — public newsletter subscribe for popup and guest flow
export async function POST(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimit(`newsletter:${ip}`, 5, 60000)) {
    return Response.json(
      { error: 'Too many subscribe attempts. Please slow down.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    try {
      await connectDB();

      const user = await User.findOne({ email });
      if (user) {
        if (!user.newsletterOptIn) {
          user.newsletterOptIn = true;
          await user.save();
        }

        return Response.json({
          ok: true,
          message: 'You are subscribed.',
          subscriberType: 'user-account',
          storage: 'database',
        });
      }

      await NewsletterSubscriber.findOneAndUpdate(
        { email },
        {
          $set: {
            email,
            source: 'popup',
            subscribedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return Response.json({
        ok: true,
        message: 'You are subscribed.',
        subscriberType: 'guest',
        storage: 'database',
      });
    } catch (error) {
      if (!isMongoConnectionError(error)) {
        throw error;
      }

      await upsertLocalNewsletterSubscriber(email, { source: 'popup' });

      return Response.json({
        ok: true,
        message: 'You are subscribed.',
        subscriberType: 'guest',
        storage: 'local-fallback',
      });
    }
  } catch (error) {
    console.error('POST /api/newsletter error:', error);
    return Response.json({ error: 'Failed to subscribe.' }, { status: 500 });
  }
}
