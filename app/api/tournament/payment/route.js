export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import connectDB from "@/lib/mongodb";
import TournamentTeam from "@/models/TournamentTeam";

// Simple in-memory rate limiter: max 3 uploads per email per 10 minutes
const uploadAttempts = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

function checkRateLimit(email) {
  const now = Date.now();
  const key = email.toLowerCase();
  const attempts = uploadAttempts.get(key) || [];
  const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  uploadAttempts.set(key, recent);
  return true;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const teamName = formData.get("teamName");
    const managerEmail = formData.get("managerEmail");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Enforce PDF only
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error:
            "Only PDF files are allowed. Please upload your deposit slip as a PDF.",
        },
        { status: 400 },
      );
    }

    if (!teamName || !managerEmail) {
      return NextResponse.json(
        { error: "Team name and manager email are required to link payment." },
        { status: 400 },
      );
    }

    // Validate email format
    if (typeof managerEmail !== "string" || !managerEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    // Rate limit: prevent upload abuse
    if (!checkRateLimit(managerEmail)) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again later." },
        { status: 429 },
      );
    }

    // Verify team exists and email matches before accepting upload
    await connectDB();
    const existingTeam = await TournamentTeam.findOne({
      teamName,
      managerEmail: managerEmail.toLowerCase(),
    });
    if (!existingTeam) {
      return NextResponse.json(
        { error: "No team found with this name and email. Please register first." },
        { status: 404 },
      );
    }

    // Max file size: 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 10 MB." }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "payments",
    );
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedTeam = (teamName || "unknown")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const ext = file.name?.split(".").pop() || "pdf";
    const filename = `payment-${sanitizedTeam}-${timestamp}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file locally
    await writeFile(filepath, buffer);

    // Update team record (already verified and connected above)
    const team = await TournamentTeam.findOneAndUpdate(
      { teamName, managerEmail: managerEmail.toLowerCase() },
      {
        paymentScreenshot: filename,
        paymentStatus: "pending",
      },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message:
        "Proof of payment uploaded successfully. Our team will verify within 24 hours.",
      filename,
    });
  } catch (error) {
    console.error("Payment upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload proof of payment. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get("team");
    const email = searchParams.get("email");

    if (!teamName || !email) {
      return NextResponse.json(
        { error: "Team name and email required" },
        { status: 400 },
      );
    }

    await connectDB();
    const team = await TournamentTeam.findOne({
      teamName,
      managerEmail: email.toLowerCase(),
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const messages = {
      unpaid: "Waiting for Proof of Payment upload.",
      pending:
        "Your payment is being reviewed by our team. Verification takes up to 24 hours.",
      confirmed: "Payment verified! Your spot in the World Cup is secure.",
      rejected:
        "Payment rejected. Please contact support or re-upload a clear POP.",
    };

    return NextResponse.json({
      status: team.paymentStatus || "unpaid",
      message: messages[team.paymentStatus || "unpaid"],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 },
    );
  }
}
