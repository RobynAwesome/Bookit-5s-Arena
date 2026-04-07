// ── Local Support AI Engine (no API key needed) ──
// Rule-based chatbot for user support questions about 5s Arena

const KNOWLEDGE_BASE = {
  booking: {
    keywords: ['book', 'reserve', 'booking', 'slot', 'schedule', 'available', 'availability'],
    answer: 'To book a court, head to the home page, choose your preferred court, select a date and time, then click "Book Now". You can book courts from 10:00 to 22:00 daily. Courts start at R400/hour.',
  },
  cancel: {
    keywords: ['cancel', 'refund', 'cancellation', 'undo'],
    answer: 'You can cancel a booking from your "My Bookings" page. Click the "Cancel" button on the booking you want to cancel. Cancellations made at least 24 hours in advance are eligible for a full refund. Contact us on WhatsApp for urgent cancellation requests.',
  },
  price: {
    keywords: ['price', 'cost', 'rate', 'fee', 'how much', 'charge', 'rand', 'R400', 'R500', 'expensive', 'cheap', 'affordable'],
    answer: 'Court prices start from R400 per hour. Pricing varies by court type and time of day. Peak hours (17:00-21:00) may have higher rates. Check each court\'s page for exact pricing. Gold and Diamond reward members get discounts!',
  },
  location: {
    keywords: ['location', 'address', 'where', 'directions', 'map', 'find', 'milnerton', 'cape town', 'hellenic'],
    answer: '5s Arena is located at Hellenic Football Club, Milnerton, Cape Town. We have secure parking on site. You can find us on Google Maps by searching "5s Arena Cape Town" or "Hellenic Football Club Milnerton".',
  },
  hours: {
    keywords: ['hours', 'open', 'close', 'time', 'operating', 'when', 'what time'],
    answer: 'Our courts are available from 10:00 to 22:00 daily (last booking starts at 22:00). The venue, bar, and restaurant may have extended hours. Check individual court pages for specific availability.',
  },
  amenities: {
    keywords: ['amenities', 'facilities', 'parking', 'bar', 'restaurant', 'food', 'drink', 'toilet', 'shower', 'changing'],
    answer: 'We offer floodlit courts, secure parking, a bar and restaurant, changing rooms, and toilet facilities. Some courts also have spectator seating. Check each court\'s amenities list for details.',
  },
  rewards: {
    keywords: ['rewards', 'points', 'loyalty', 'tier', 'achievement', 'bronze', 'silver', 'gold', 'diamond', 'perk'],
    answer: 'Our rewards programme has 4 tiers: Bronze (starting), Silver (5 bookings), Gold (10 bookings), and Diamond (20 bookings). Earn 100 points per booking + 50 per hour played. Higher tiers unlock discounts, priority booking, and exclusive perks. Visit the Rewards page to track your progress!',
  },
  referral: {
    keywords: ['referral', 'refer', 'invite', 'friend', 'share', 'code'],
    answer: 'Share your unique referral code with friends! When they register using your code, you earn 200 points. Our 5-stage referral chain means you keep earning when your referrals invite others — up to 5 levels deep! Find your code on the Rewards → Referrals tab.',
  },
  events: {
    keywords: ['event', 'birthday', 'corporate', 'party', 'tournament', 'function', 'team building'],
    answer: 'We host birthdays, corporate events, tournaments, and social functions. Visit our Events page to browse packages and submit a booking request. Our team will confirm availability and pricing within 24 hours.',
  },
  fixtures: {
    keywords: ['fixture', 'score', 'live', 'match', 'result', 'league', 'premier league', 'la liga'],
    answer: 'Check our Fixtures page for live scores, match updates, and results across all major leagues — Premier League, La Liga, Serie A, Bundesliga, PSL, and Champions League. Coming soon: full API integration for real-time scores!',
  },
  account: {
    keywords: ['account', 'register', 'sign up', 'login', 'password', 'email', 'profile'],
    answer: 'Create a free account to book courts, track rewards, and manage bookings. You can register with email or sign in with Google. Visit /register to create an account or /login to sign in. Forgot your password? Use the reset link on the login page.',
  },
  payment: {
    keywords: ['payment', 'pay', 'card', 'cash', 'eft', 'bank', 'transfer'],
    answer: 'You can securely book courts and pay online using our Stripe integration, or reserve your slot online and pay at the venue (cash or card). For events and larger bookings, we also accept EFT — contact us for bank details.',
  },
  contact: {
    keywords: ['contact', 'whatsapp', 'phone', 'call', 'email', 'reach', 'support', 'help'],
    answer: 'Reach us on WhatsApp at +27 63 782 0245 for quick support. You can also email us or use the contact form on our website. Our team responds within a few hours during business hours.',
  },
  rules: {
    keywords: ['rule', 'rules', 'regulation', 'no show', 'late', 'behaviour'],
    answer: 'Key rules: Arrive 10 minutes before your slot. No studs allowed — only flat-soled shoes or astro boots. No-shows may result in a booking penalty. Be respectful to other players and staff. Full rules are available on the Rules page.',
  },
};

export function answerSupportQuestion(question) {
  const q = question.toLowerCase().trim();

  // Check for greetings
  if (/^(hi|hello|hey|howzit|sup|morning|afternoon|evening)(\s|$|!)/.test(q)) {
    return {
      answer: 'Hey there! 👋 Welcome to 5s Arena support. How can I help you today? You can ask about bookings, prices, location, rewards, events, or anything else!',
      confidence: 'high',
    };
  }

  // Check for thank you
  if (/^(thank|thanks|cheers|appreciate|ta)/.test(q)) {
    return {
      answer: "You're welcome! If you need anything else, just ask. Enjoy your time at 5s Arena! ⚽",
      confidence: 'high',
    };
  }

  // Score each topic
  const scores = Object.entries(KNOWLEDGE_BASE).map(([topic, data]) => {
    let score = 0;
    for (const kw of data.keywords) {
      if (q.includes(kw)) score += kw.length; // longer keyword matches = higher weight
    }
    return { topic, score, answer: data.answer };
  });

  scores.sort((a, b) => b.score - a.score);

  if (scores[0].score > 0) {
    // If top two scores are close, combine answers
    if (scores[1] && scores[1].score > 0 && scores[0].score - scores[1].score < 3) {
      return {
        answer: `${scores[0].answer}\n\n${scores[1].answer}`,
        confidence: 'medium',
        topics: [scores[0].topic, scores[1].topic],
      };
    }
    return {
      answer: scores[0].answer,
      confidence: scores[0].score >= 8 ? 'high' : 'medium',
      topic: scores[0].topic,
    };
  }

  // Fallback
  return {
    answer: "I'm not sure about that one, but I'd love to help! Here are some things I can assist with:\n\n• **Bookings** — how to book, cancel, or check availability\n• **Pricing** — court rates and discounts\n• **Location** — how to find us\n• **Rewards** — tiers, points, and perks\n• **Events** — birthday parties, corporate events\n• **Contact** — how to reach our team\n\nOr WhatsApp us at +27 63 782 0245 for direct help!",
    confidence: 'low',
  };
}

// Quick suggestion chips
export const QUICK_QUESTIONS = [
  'How do I book a court?',
  'What are the prices?',
  'Where are you located?',
  'How do rewards work?',
  'Can I cancel a booking?',
  'Do you host events?',
];
