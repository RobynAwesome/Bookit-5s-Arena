import { NextResponse } from "next/server";
import { getLeagueMatches } from "@/lib/sports/football";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season") || new Date().getFullYear();
    const payload = await getLeagueMatches(slug, season);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load matches" },
      { status: 500 },
    );
  }
}
