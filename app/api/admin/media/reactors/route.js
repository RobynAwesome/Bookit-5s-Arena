import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthSession } from "@/lib/getSession";
import { requireRole } from "@/lib/roles";
import ReactorChannel from "@/models/ReactorChannel";
import { DEFAULT_REACTOR_CHANNELS } from "@/lib/media/reactors";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();
  if (!requireRole(session, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const channels = await ReactorChannel.find().sort({ priority: 1, name: 1 }).lean();
    return NextResponse.json({ channels: channels.length ? channels : DEFAULT_REACTOR_CHANNELS });
  } catch {
    return NextResponse.json({ channels: DEFAULT_REACTOR_CHANNELS });
  }
}

export async function POST(request) {
  const session = await getAuthSession();
  if (!requireRole(session, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const payload = await request.json();
    const created = await ReactorChannel.create({
      name: payload.name,
      slug: payload.slug,
      searchQuery: payload.searchQuery || "",
      channelId: payload.channelId || "",
      teamFocus: Array.isArray(payload.teamFocus) ? payload.teamFocus : [],
      enabled: payload.enabled !== false,
      priority: Number.isFinite(payload.priority) ? payload.priority : 100,
    });

    return NextResponse.json({ channel: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create reactor channel" },
      { status: 400 },
    );
  }
}
