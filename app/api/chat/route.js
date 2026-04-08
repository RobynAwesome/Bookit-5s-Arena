export const dynamic = 'force-dynamic';
// app/api/chat/route.js
// AI Chatbot — Fallback chain:
//   1. Groq (free, fast — Llama 3.3 70B via groq.com, GROQ_API_KEY)
//   2. Anthropic Claude (ANTHROPIC_API_KEY)
//   3. Rule-based local engine (lib/supportAI.js — always works, no key needed)

import { answerSupportQuestion } from '@/lib/supportAI';
import { verifyBotRequest } from '@/lib/security/botid';
import { logBraintrustEvent } from '@/lib/integrations/braintrust';

const SYSTEM_PROMPT = `You are the friendly AI assistant for 5s Arena, a 5-a-side football venue in Cape Town, South Africa.

About 5s Arena:
- Full name: 5s Arena at Hellenic Football Club
- Location: Pringle Rd, Milnerton, Cape Town 7441, South Africa
- Courts: Multiple floodlit, all-weather synthetic grass pitches
- Hours: 10:00 AM – 10:00 PM daily (every day)
- Pricing: From R400/hour (varies by court and time slot)
- Amenities: Bar & Restaurant, Sound System, Secure Parking, Floodlit courts, All-weather synthetic turf
- Events we host: Birthday parties, Tournaments (5v5 World Cup), Social Leagues, Corporate team-building events, Holiday football clinics for kids
- Contact: WhatsApp 063 782 0245 (Mashoto), Email: fivearena@mail.com
- Social media: Facebook (Fives Arena), Instagram @fivesarena, TikTok @fivesarena

Our Brand New Features (Direct users to these URLs):
- Tournament Features: Live Fixtures & Standings (/fixtures), Knockout Brackets (/tournament/bracket), and a Manager Dashboard for Squad lineups and AI Co-Coach (/tournament/manager).
- Hub & Content: The 5s Arena Tech Blog (/blog). The API documentation (/docs/api) and past Case Studies (/case-studies).
- Community & Careers: We have a Job Board to apply for Referee or Bartender roles (/jobs). Check out our Partner Affiliates (/partners).

Your role:
- Answer questions about the venue concisely, warmly, and enthusiastically (football emojis welcome!)
- If they ask about Leauges, Tournaments, or Jobs, proudly point them to the new features above!
- Keep answers short — 1–3 sentences max unless detail is genuinely needed
- If unsure about specific details (exact packages, availability), direct them to WhatsApp: 063 782 0245
- Never make up pricing, policies or availability not stated above
- Speak as if you love football and love this venue`;

// ── Shared message builder ─────────────────────────────────────────────────
function buildMessages(history, message) {
  return [
    ...(Array.isArray(history) ? history : []).slice(-8).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content),
    })),
    { role: 'user', content: message },
  ];
}

// ── Provider 1: Groq (free, fast — OpenAI-compatible) ─────────────────────
async function tryGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Best Groq free model
      max_tokens: 400,
      temperature: 0.7,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!response.ok) {
    console.warn('Groq API error:', response.status);
    return null;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? null;
}

// ── Provider 2: Anthropic Claude ──────────────────────────────────────────
async function tryClaude(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    console.warn('Anthropic API error:', response.status);
    return null;
  }

  const data = await response.json();
  return data?.content?.[0]?.text ?? null;
}

// ── Provider 3: Rule-based local engine ───────────────────────────────────
function tryRuleBased(message) {
  const result = answerSupportQuestion(message);
  return result.answer;
}

import { rateLimit } from '@/lib/rateLimit';

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(request) {
  const botVerification = await verifyBotRequest();
  if (botVerification.isBot) {
    return Response.json({ error: 'Automated chat abuse is blocked.' }, { status: 403 });
  }

  const ip =
    request.headers
      .get('x-forwarded-for')
      ?.split(',')[0]
      ?.trim() || 'unknown';
  if (rateLimit(ip, 10, 60000)) {
    return Response.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Invalid message.' }, { status: 400 });
    }

    if (message.length > 1000) {
      return Response.json(
        { error: 'Message is too long. Please keep it under 1000 characters.' },
        { status: 400 }
      );
    }

    const messages = buildMessages(history, message);

    // Try providers in order of preference
    let reply = await tryGroq(messages);
    let provider = 'groq';

    if (!reply) {
      reply = await tryClaude(messages);
      provider = 'claude';
    }

    if (!reply) {
      reply = tryRuleBased(message);
      provider = 'local';
    }

    if (!reply) {
      return Response.json({ error: 'AI service temporarily unavailable.' }, { status: 503 });
    }

    void logBraintrustEvent({
      input: {
        route: "/api/chat",
        provider,
        message,
      },
      output: {
        reply,
      },
      metadata: {
        category: "support-chat",
        provider,
      },
      scores: {
        response_length: reply.length,
      },
    });

    return Response.json({ reply, provider });
  } catch (err) {
    console.error('Chat API error:', err);
    return Response.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
