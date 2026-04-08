import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/getSession";
import { requireRole } from "@/lib/roles";
import {
  getSandboxPresets,
  getSandboxStatus,
  getVercelSandboxConfig,
  runSandboxPreset,
  stopSandboxInstance,
} from "@/lib/integrations/vercelSandbox";
import { logBraintrustEvent } from "@/lib/integrations/braintrust";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const session = await getAuthSession();
  if (!requireRole(session, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sandboxId = searchParams.get("sandboxId");
    const cmdId = searchParams.get("cmdId");

    if (sandboxId) {
      const status = await getSandboxStatus({ sandboxId, cmdId });
      return NextResponse.json(status);
    }

    return NextResponse.json({
      config: await getVercelSandboxConfig(),
      presets: getSandboxPresets(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load sandbox status" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const session = await getAuthSession();
  if (!requireRole(session, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await request.json();

    if (payload.action === "run") {
      const result = await runSandboxPreset(payload.preset);
      void logBraintrustEvent({
        input: {
          route: "/api/admin/sandbox",
          action: "run",
          preset: payload.preset,
        },
        output: {
          sandboxId: result.sandboxId,
          status: result.status,
        },
        metadata: {
          category: "admin-sandbox",
          action: "run",
          preset: payload.preset,
          actor: session?.user?.email || "",
        },
      });
      return NextResponse.json(result);
    }

    if (payload.action === "stop") {
      const result = await stopSandboxInstance(payload.sandboxId);
      void logBraintrustEvent({
        input: {
          route: "/api/admin/sandbox",
          action: "stop",
          sandboxId: payload.sandboxId,
        },
        output: result,
        metadata: {
          category: "admin-sandbox",
          action: "stop",
          actor: session?.user?.email || "",
        },
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unsupported sandbox action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Sandbox action failed" },
      { status: 500 },
    );
  }
}
