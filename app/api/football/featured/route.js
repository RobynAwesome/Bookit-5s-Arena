import { NextResponse } from "next/server";
import { getFeaturedMatches } from "@/lib/sports/football";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const matches = await getFeaturedMatches();
    return NextResponse.json(Array.isArray(matches) ? matches : [], {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[api/football/featured]", error);
    // Empty array keeps the home strip graceful when upstream or config fails during events.
    return NextResponse.json([], {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  }
}
