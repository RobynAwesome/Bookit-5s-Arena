import sseEmitter from '@/lib/sseEmitter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * SSE endpoint for league-specific real-time updates
 * Channel: league:{leagueId}
 */
export async function GET(request, { params }) {
  const { leagueId } = await params;
  const channel = `league:${leagueId}`;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'connected', channel, timestamp: Date.now() })}\n\n`
        )
      );

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      const onEvent = (data) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Client disconnected
        }
      };

      sseEmitter.subscribe(channel, onEvent);

      stream._cleanup = () => {
        clearInterval(heartbeat);
        sseEmitter.unsubscribe(channel, onEvent);
      };
    },
    cancel() {
      if (stream._cleanup) stream._cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
