"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FaCheckCircle,
  FaFutbol,
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
  FaCreditCard,
} from "react-icons/fa";

const BookingSuccessContent = () => {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  // Legacy support for direct (non-Stripe) success redirects
  const legacyCourt = searchParams.get("court") ?? null;
  const legacyDate = searchParams.get("date") ?? null;
  const legacyTime = searchParams.get("time") ?? null;
  const legacyDuration = searchParams.get("duration") ?? null;
  const legacyTotal = searchParams.get("total") ?? null;
  const hasLegacyDetails = Boolean(
    legacyCourt || legacyDate || legacyTime || legacyDuration || legacyTotal,
  );

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(!!bookingId);

  useEffect(() => {
    if (!bookingId || sessionStatus === "loading") return;

    const confirmBooking = async () => {
      try {
        // 1. Proactively verify payment with Stripe and auto-confirm the booking.
        //    This fires immediately so the UI shows "Confirmed" even if the
        //    webhook hasn't arrived yet.
        const verifyRes = await fetch("/api/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });

        if (verifyRes.ok) {
          const data = await verifyRes.json();
          setBooking(data);
          setLoading(false);
          return;
        }

        if (sessionStatus === "authenticated") {
          // 2. Authenticated fallback — fetch booking directly if the webhook
          //    has already confirmed it and the user owns the booking.
          const fallback = await fetch(`/api/bookings/${bookingId}`);
          if (fallback.ok) {
            setBooking(await fallback.json());
          }
        } else if (!hasLegacyDetails) {
          setBooking({ paymentStatus: "pending", status: "pending" });
        }
      } catch (err) {
        console.error("Success page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    confirmBooking();
  }, [bookingId, hasLegacyDetails, sessionStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-green-400 font-semibold animate-pulse">
            Confirming your payment...
          </p>
        </div>
      </div>
    );
  }

  // Use fetched booking data or fall back to legacy URL params
  const courtName = booking?.court?.name ?? legacyCourt ?? "—";
  const date = booking?.date ?? legacyDate ?? "—";
  const time = booking?.start_time ?? legacyTime ?? "—";
  const duration = String(booking?.duration ?? legacyDuration ?? "1");
  const total = String(booking?.total_price ?? legacyTotal ?? "—");
  const isPaid = booking?.paymentStatus === "paid";
  const activeRole =
    session?.user?.activeRole ?? (sessionStatus === "authenticated" ? "user" : "guest");
  const primaryAction =
    activeRole === "admin"
      ? { href: "/admin/bookings", label: "Open Admin Bookings" }
      : activeRole === "manager"
        ? { href: "/manager/dashboard", label: "Open Manager HQ" }
        : activeRole === "user"
          ? { href: "/bookings", label: "View My Bookings" }
          : { href: "/register", label: "Create Account" };
  const statusCopy = isPaid
    ? "Payment confirmed — see you on the pitch!"
    : bookingId
      ? "Booking received — final confirmation is syncing now."
      : "Booking details ready — see you on the pitch!";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Top strip */}
          <div className="bg-linear-to-r from-green-900/60 to-gray-900 px-8 py-8 text-center border-b border-gray-800">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-900/40 border-2 border-green-500 mb-4 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
              <FaCheckCircle className="text-4xl text-green-400" />
            </div>
            <h1
              className="text-3xl font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              You&apos;re Booked!
            </h1>
            <p className="text-green-400 text-sm mt-2 font-semibold">
              {statusCopy}
            </p>
            {isPaid && (
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-900/40 border border-green-700/60 rounded-full text-xs text-green-400 font-bold">
                <FaCreditCard size={10} /> Payment Successful · Secured by
                Stripe
              </div>
            )}
          </div>

          {/* Details */}
          <div className="px-8 py-7 space-y-3">
            <div className="flex items-center gap-3 py-3 border-b border-gray-800">
              <FaFutbol className="text-green-400 shrink-0" />
              <span className="text-xs text-gray-500 uppercase tracking-widest w-20">
                Court
              </span>
              <span className="text-white font-semibold">{courtName}</span>
            </div>
            <div className="flex items-center gap-3 py-3 border-b border-gray-800">
              <FaCalendarAlt className="text-green-400 shrink-0" />
              <span className="text-xs text-gray-500 uppercase tracking-widest w-20">
                Date
              </span>
              <span className="text-white font-semibold">
                {date !== "—"
                  ? new Date(date).toLocaleDateString("en-ZA", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-3 py-3 border-b border-gray-800">
              <FaClock className="text-green-400 shrink-0" />
              <span className="text-xs text-gray-500 uppercase tracking-widest w-20">
                Time
              </span>
              <span className="text-white font-semibold">
                {time} · {duration} hour{Number(duration) > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-3 py-4">
              <div className="w-4 shrink-0" />
              <span className="text-xs text-gray-500 uppercase tracking-widest w-20">
                Total Paid
              </span>
              <span className="text-2xl font-black text-green-400">
                R{total}
              </span>
            </div>
          </div>

          {/* Booking status badge */}
          {booking && (
            <div className="px-8 pb-2">
              <div
                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold ${
                  isPaid
                    ? "bg-green-900/20 border-green-700/40 text-green-400"
                    : "bg-yellow-900/20 border-yellow-700/40 text-yellow-400"
                }`}
              >
                <span>Booking Status</span>
                <span className="uppercase tracking-wider text-xs">
                  {booking.status === "confirmed"
                    ? "✓ Confirmed"
                    : booking.status}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-8 py-6 flex flex-col sm:flex-row gap-3">
            <Link
              href={primaryAction.href}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                boxShadow: "0 0 20px rgba(34,197,94,0.3)",
              }}
            >
              {primaryAction.label} <FaArrowRight size={11} />
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 hover:border-gray-600 hover:text-white transition-all duration-300"
            >
              Browse More Courts
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          {activeRole === "guest"
            ? "Guests can keep browsing or create an account later to manage future bookings."
            : "A confirmation email has been sent to your inbox."}
        </p>
      </div>
    </div>
  );
};

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
