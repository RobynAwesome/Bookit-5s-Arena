import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthSession } from "@/lib/getSession";
import { requireRole } from "@/lib/roles";
import ReactorChannel from "@/models/ReactorChannel";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const session = await getAuthSession();
  if (!requireRole(session, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const payload = await request.json();
    const channel = await ReactorChannel.findByIdAndUpdate(params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json({ channel });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update reactor channel" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request, { params }) {
  const session = await getAuthSession();
  if (!requireRole(session, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const deleted = await ReactorChannel.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete reactor channel" },
      { status: 400 },
    );
  }
}
