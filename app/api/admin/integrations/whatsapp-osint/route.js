import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/getSession";
import { requireRole } from "@/lib/roles";
import { rateLimit } from "@/lib/rateLimit";
import {
  lookupWhatsAppProfile,
  normalizePhoneNumber,
} from "@/lib/integrations/whatsappOsint";
import { logBraintrustEvent } from "@/lib/integrations/braintrust";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const session = await getAuthSession();
  if (!requireRole(session, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip =
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() || "unknown";
  const rateLimitKey = `${session?.user?.email || ip}:whatsapp-osint`;

  if (rateLimit(rateLimitKey, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many lookup attempts. Try again later." },
      { status: 429 },
    );
  }

  try {
    const payload = await request.json();
    const normalizedPhoneNumber = normalizePhoneNumber(payload?.phoneNumber);

    if (!normalizedPhoneNumber || normalizedPhoneNumber.length > 20) {
      return NextResponse.json(
        { error: "Enter a valid phone number in international format." },
        { status: 400 },
      );
    }

    const result = await lookupWhatsAppProfile(normalizedPhoneNumber);

    void logBraintrustEvent({
      input: {
        route: "/api/admin/integrations/whatsapp-osint",
        action: "lookup",
        fingerprint: result.fingerprint,
      },
      output: {
        isBusiness: result.isBusiness,
        isRegistered: result.isRegistered,
      },
      metadata: {
        category: "admin-osint",
        provider: "whatsapp-osint",
        actor: session?.user?.email || "",
        fingerprint: result.fingerprint,
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "WhatsApp OSINT lookup failed" },
      { status: 500 },
    );
  }
}
