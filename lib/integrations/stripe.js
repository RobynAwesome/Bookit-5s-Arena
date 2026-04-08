// ── Stripe Payment Integration Boilerplate ──
// To activate: npm install stripe
// Then add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env.local
//
// Usage:
//   import { createCheckoutSession, handleWebhook } from '@/lib/integrations/stripe';

import Stripe from 'stripe';
import { SITE_URL } from '@/lib/constants';

// Lazy-load Stripe instance
let stripe = null;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripe;
};

/**
 * Create a Stripe Checkout session for a court booking
 * @param {Object} booking - { courtName, date, time, duration, totalPrice, userEmail }
 * @returns {Object} - { sessionId, url }
 */
export async function createCheckoutSession(booking) {
  const s = getStripe();
  const session = await s.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'zar',
          product_data: {
            name: `Court Booking: ${booking.courtName}`,
            description: `${booking.date} at ${booking.time} (${booking.duration}h)`,
          },
          unit_amount: Math.round(booking.totalPrice * 100), // cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${SITE_URL}/bookings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/bookings?payment=cancelled`,
    customer_email: booking.userEmail,
    metadata: {
      bookingId: booking.bookingId,
      courtName: booking.courtName,
    },
  });

  return { sessionId: session.id, url: session.url };
}

/**
 * Verify and parse a Stripe webhook event
 * @param {Buffer} rawBody - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {Object} - Stripe event object
 */
export function constructWebhookEvent(rawBody, signature) {
  const s = getStripe();
  return s.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

/**
 * Retrieve a checkout session by ID
 * @param {string} sessionId
 * @returns {Object} - Stripe session
 */
export async function getCheckoutSession(sessionId) {
  const s = getStripe();
  return s.checkout.sessions.retrieve(sessionId);
}
