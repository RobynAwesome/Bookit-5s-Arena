"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaEdit,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaStar,
  FaFutbol,
} from "react-icons/fa";

const BookingDetailPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBooking(data);
        setLoading(false);
      });
  }, [id]);

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    const res = await fetch(`/api/bookings/${id}/resend`, { method: "POST" });
    setResendMsg(
      res.ok
        ? "Receipt sent to your email!"
        : "Failed to send. Please try again.",
    );
    setResending(false);
  };

  const isWithin1Hour = () => {
    if (!booking) return false;
    const bookingDateTime = new Date(
      `${booking.date}T${booking.start_time}:00`,
    );
    return (bookingDateTime - new Date()) / (1000 * 60 * 60) < 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-lg">
          Loading booking...
        </div>
      </div>
    );
  }

  if (!booking || booking.error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Booking not found.</p>
          <Link
            href="/bookings"
            className="text-green-400 hover:text-green-300 text-sm"
          >
            ← Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const court = booking.court;
  const canEdit = !isWithin1Hour() && booking.status !== "cancelled";

  const statusStyle =
    booking.status === "confirmed"
      ? "bg-green-900/40 text-green-400 border border-green-800/60"
      : booking.status === "cancelled"
        ? "bg-red-900/40 text-red-400 border border-red-800/60"
        : "bg-yellow-900/40 text-yellow-400 border border-yellow-800/60";

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm mb-8 transition-colors uppercase tracking-wide hover:scale-105 duration-200 hover:underline hover:underline-offset-4"
        >
          <FaArrowLeft size={11} /> Back to Bookings
        </Link>

        {/* Court info card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl mb-6">
          <div className="flex flex-col md:flex-row">
            {court?.image && (
              <div className="relative w-full md:w-72 h-52 shrink-0">
                <Image
                  src={`/images/courts/${court.image}`}
                  alt={court.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-transparent to-gray-900/60 hidden md:block" />
              </div>
            )}
            <div className="p-6 space-y-3 flex-1">
              <h1
                className="text-2xl font-black uppercase tracking-widest text-white"
                style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
              >
                {court?.name}
              </h1>
              {court?.description && (
                <p className="text-green-400 text-sm italic">
                  {court.description}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {court?.amenities && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaStar className="text-green-500 shrink-0" size={11} />
                    {court.amenities}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <FaClock className="text-green-500 shrink-0" size={11} />
                  {court?.availability}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaFutbol className="text-green-500 shrink-0" size={11} />R
                  {court?.price_per_hour}/hour
                </div>
                {court?.address && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaMapMarkerAlt
                      className="text-green-500 shrink-0"
                      size={11}
                    />
                    {court.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking details card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              Booking Details
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusStyle}`}
            >
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FaCalendarAlt size={9} /> Date
              </p>
              <p className="font-semibold text-white text-sm">
                {new Date(booking.date).toLocaleDateString("en-ZA", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <FaClock size={9} /> Start
              </p>
              <p className="font-semibold text-white text-sm">
                {booking.start_time}
              </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                Duration
              </p>
              <p className="font-semibold text-white text-sm">
                {booking.duration} hour{booking.duration > 1 ? "s" : ""}
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-800/40 rounded-xl p-4">
              <p className="text-xs text-green-600 uppercase tracking-widest mb-2">
                Total Paid
              </p>
              <p className="font-black text-green-400 text-xl">
                R{booking.total_price}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-all disabled:opacity-50 hover:scale-105 hover:shadow-green-400/20 active:scale-95"
            >
              <FaEnvelope size={12} />
              {resending ? "Sending..." : "Resend Receipt"}
            </button>

            {canEdit ? (
              <Link
                href={`/bookings/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-green-800/60 text-green-400 rounded-xl text-sm hover:border-green-600 hover:bg-green-900/20 transition-all"
              >
                <FaEdit size={12} /> Edit Booking
              </Link>
            ) : (
              <button
                disabled
                title={
                  booking.status === "cancelled"
                    ? "Cancelled bookings cannot be edited"
                    : "Cannot edit within 1 hour of start time"
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 border border-gray-800 text-gray-600 rounded-xl text-sm cursor-not-allowed"
              >
                <FaEdit size={12} /> Edit Booking
              </button>
            )}
          </div>

          {resendMsg && (
            <p
              className={`text-sm font-medium ${resendMsg.includes("sent") ? "text-green-400" : "text-red-400"}`}
            >
              {resendMsg}
            </p>
          )}

          {/* T&Cs */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-600 leading-relaxed">
              By booking a court at 5s Arena, you agree to our Terms &amp;
              Conditions. Bookings are non-refundable within 1 hour of the
              scheduled start time. Cancellations made more than 1 hour in
              advance will be reviewed by management. 5s Arena reserves the
              right to cancel bookings due to unforeseen circumstances, in which
              case a full refund or rebooking will be offered. Players are
              responsible for their own safety and that of other participants.
              5s Arena accepts no liability for injury, loss, or damage to
              personal property. All bookings are subject to availability and
              confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
