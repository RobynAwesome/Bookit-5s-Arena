import { NextResponse } from "next/server";
import { getPremierLeagueStats } from "@/lib/sports/premierLeagueStats";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");
    const category = searchParams.get("category") || "goals";
    const payload = await getPremierLeagueStats(season, category);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load stats" },
      { status: 500 },
    );
  }
}
