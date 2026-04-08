import { NextResponse } from "next/server";
import { getPremierLeagueMatches } from "@/lib/sports/premierLeague";
import { getFootballNewsFeed } from "@/lib/media/news";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");
    const matches = await getPremierLeagueMatches(season);
    const newsFeed = await getFootballNewsFeed({
      seasonLabel: matches.season.label,
    });

    return NextResponse.json({
      season: matches.season,
      provider: newsFeed.providers,
      articles: newsFeed.articles,
      videos: newsFeed.videos,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load league news" },
      { status: 500 },
    );
  }
}
