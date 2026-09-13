import { NextResponse } from "next/server";
import { getLeagueMeta } from "@/lib/sports/football";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const { slug } = await context.params;
    const meta = await getLeagueMeta(slug);
    return NextResponse.json(meta, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load league meta" },
      { status: 500 },
    );
  }
}
