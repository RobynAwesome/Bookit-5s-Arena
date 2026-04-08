import { NextResponse } from "next/server";
import { getFeaturedLocationWeather } from "@/lib/weather/openMeteo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const locations = await getFeaturedLocationWeather();

    return NextResponse.json({
      locations,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load featured weather" },
      { status: 500 },
    );
  }
}
