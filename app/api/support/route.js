export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { answerSupportQuestion, QUICK_QUESTIONS } from '@/lib/supportAI';
import { rateLimit } from '@/lib/rateLimit';
import { verifyBotRequest } from '@/lib/security/botid';
import { logBraintrustEvent } from '@/lib/integrations/braintrust';

export async function POST(request) {
  const botVerification = await verifyBotRequest();
  if (botVerification.isBot) {
    return NextResponse.json({ error: 'Automated support spam is blocked.' }, { status: 403 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (rateLimit(ip, 5, 60000)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Message too long (max 500 characters)' }, { status: 400 });
    }

    const result = answerSupportQuestion(message);

    void logBraintrustEvent({
      input: {
        route: "/api/support",
        message,
      },
      output: {
        answer: result.answer,
        confidence: result.confidence,
      },
      metadata: {
        category: "support-faq",
      },
      scores: {
        confidence: result.confidence,
      },
    });

    return NextResponse.json({
      answer: result.answer,
      confidence: result.confidence,
      suggestions: QUICK_QUESTIONS.filter(() => Math.random() > 0.5).slice(0, 3),
    });
  } catch (error) {
    console.error('Support chat error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
