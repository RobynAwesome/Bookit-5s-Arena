export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/getSession";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

// Tier thresholds based on total confirmed bookings
const getTier = (count) => {
  if (count >= 20)
    return {
      name: "Diamond",
      icon: "💎",
      color: "#60a5fa",
      next: null,
      nextAt: null,
    };
  if (count >= 10)
    return {
      name: "Gold",
      icon: "🥇",
      color: "#f59e0b",
      next: "Diamond",
      nextAt: 20,
    };
  if (count >= 5)
    return {
      name: "Silver",
      icon: "🥈",
      color: "#94a3b8",
      next: "Gold",
      nextAt: 10,
    };
  return {
    name: "Bronze",
    icon: "🥉",
    color: "#d97706",
    next: "Silver",
    nextAt: 5,
  };
};

// Role-based achievements
const getAchievements = (bookings, role = "user") => {
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const courts = new Set(bookings.map((b) => b.court?.toString()));
  const sortedByDate = [...bookings].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const nthBooking = (n) => sortedByDate[n - 1];
  const formatUnlockInfo = (booking) => {
    if (!booking) return {};
    return {
      unlockedAt: booking.date,
      unlockedCourt: booking.court?.name || "Court",
    };
  };
  // Social/manager-focused achievements
  const socialAchievements = [
    {
      id: "shared_social",
      name: "Social Sharer",
      desc: "Shared your booking on social media",
      icon: "📣",
      unlocked: false, // Placeholder, implement tracking if needed
      rarity: "uncommon",
    },
    {
      id: "referred_teams",
      name: "Team Builder",
      desc: "Referred 5 teams to join",
      icon: "🤝",
      unlocked: false, // Placeholder
      rarity: "rare",
    },
    {
      id: "hosted_tournament",
      name: "Host with the Most",
      desc: "Hosted a tournament",
      icon: "🏟️",
      unlocked: false, // Placeholder
      rarity: "epic",
    },
  ];
  // Interface/user-focused achievements
  const interfaceAchievements = [
    {
      id: "booked_via_app",
      name: "App Booker",
      desc: "Booked a court via the app",
      icon: "📱",
      unlocked: bookings.length > 0,
      rarity: "common",
      ...formatUnlockInfo(nthBooking(1)),
    },
    {
      id: "customized_profile",
      name: "Profile Pro",
      desc: "Customized your profile",
      icon: "🖼️",
      unlocked: false, // Placeholder, implement tracking if needed
      rarity: "uncommon",
    },
    {
      id: "scavenger_hunt",
      name: "Logo Hunter",
      desc: "Completed the logo scavenger hunt",
      icon: "🔍",
      unlocked: false, // Placeholder, implement tracking if needed
      rarity: "rare",
    },
  ];
  // Shared achievements
  const sharedAchievements = [
    {
      id: "first_booking",
      name: "First Touch",
      desc: "Made your first booking",
      icon: "⚽",
      unlocked: bookings.length >= 1,
      rarity: "common",
      ...formatUnlockInfo(nthBooking(1)),
    },
    {
      id: "hat_trick",
      name: "Hat Trick",
      desc: "Completed 3 bookings",
      icon: "🎯",
      unlocked: bookings.length >= 3,
      rarity: "common",
      ...formatUnlockInfo(nthBooking(3)),
    },
    {
      id: "regular",
      name: "Pitch Regular",
      desc: "Completed 5 bookings",
      icon: "🏃",
      unlocked: bookings.length >= 5,
      rarity: "uncommon",
      ...formatUnlockInfo(nthBooking(5)),
    },
    {
      id: "explorer",
      name: "Court Explorer",
      desc: "Booked 2 different courts",
      icon: "🗺️",
      unlocked: courts.size >= 2,
      rarity: "uncommon",
      ...formatUnlockInfo(
        sortedByDate.find((b, i, arr) =>
          arr
            .slice(0, i)
            .some((prev) => prev.court?.toString() !== b.court?.toString()),
        ),
      ),
    },
    {
      id: "marathon",
      name: "Marathon Man",
      desc: "Accumulated 10+ hours on the pitch",
      icon: "⏱️",
      unlocked: confirmed.reduce((s, b) => s + (b.duration || 0), 0) >= 10,
      rarity: "rare",
      ...formatUnlockInfo(
        confirmed.find(
          (b, i, arr) =>
            arr.slice(0, i).reduce((s, b) => s + (b.duration || 0), 0) < 10 &&
            arr.slice(0, i + 1).reduce((s, b) => s + (b.duration || 0), 0) >=
              10,
        ),
      ),
    },
    {
      id: "veteran",
      name: "Arena Veteran",
      desc: "Completed 10 bookings",
      icon: "🏆",
      unlocked: bookings.length >= 10,
      rarity: "rare",
      ...formatUnlockInfo(nthBooking(10)),
    },
    {
      id: "big_spender",
      name: "Big Spender",
      desc: "Spent over R5,000 at the arena",
      icon: "💸",
      unlocked: confirmed.reduce((s, b) => s + (b.total_price || 0), 0) >= 5000,
      rarity: "epic",
      ...formatUnlockInfo(
        confirmed.find(
          (b, i, arr) =>
            arr.slice(0, i).reduce((s, b) => s + (b.total_price || 0), 0) <
              5000 &&
            arr.slice(0, i + 1).reduce((s, b) => s + (b.total_price || 0), 0) >=
              5000,
        ),
      ),
    },
    {
      id: "legend",
      name: "5S Legend",
      desc: "Completed 20 bookings — true arena royalty",
      icon: "👑",
      unlocked: bookings.length >= 20,
      rarity: "legendary",
      ...formatUnlockInfo(nthBooking(20)),
    },
  ];
  // Merge based on role
  if (role === "manager") {
    return [
      ...sharedAchievements,
      ...socialAchievements,
      ...interfaceAchievements,
    ];
  }
  // Default: user
  return [
    ...sharedAchievements,
    ...interfaceAchievements,
    ...socialAchievements,
  ];
};

import User from "@/models/User";
export async function GET() {
  const session = await getAuthSession();
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await connectDB();

  // Get user role
  const user = await User.findById(session.user.id);
  const role = user?.role || "user";

  const bookings = await Booking.find({ user: session.user.id })
    .populate("court", "name")
    .sort({ date: -1 });

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const totalHours = confirmed.reduce((s, b) => s + (b.duration || 0), 0);
  const totalSpent = confirmed.reduce((s, b) => s + (b.total_price || 0), 0);
  const courtsVisited = new Set(
    bookings.map((b) => b.court?.name).filter(Boolean),
  );
  const tier = getTier(confirmed.length);
  const achievements = getAchievements(bookings, role);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Points: 100 per confirmed booking + 50 per hour + bonus for tier
  const points = confirmed.length * 100 + totalHours * 50;

  // Recent bookings (last 5)
  const recent = bookings.slice(0, 5).map((b) => ({
    _id: b._id,
    courtName: b.court?.name || "Court",
    date: b.date,
    start_time: b.start_time,
    duration: b.duration,
    total_price: b.total_price,
    status: b.status,
  }));

  return NextResponse.json({
    tier,
    points,
    totalBookings: confirmed.length,
    totalHours,
    totalSpent,
    courtsVisited: courtsVisited.size,
    achievements,
    unlockedCount,
    recent,
    memberSince:
      bookings.length > 0 ? bookings[bookings.length - 1].createdAt : null,
    role,
  });
}
