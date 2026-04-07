export const metadata = {
  title: "Roadmap",
  description: "What's coming next to Bookit 5s Arena.",
};

const ROADMAP = [
  {
    phase: "Live Now",
    color: "text-green-400 border-green-500",
    items: [
      "Court booking — pay cash at the venue",
      "Guest bookings — reserve and pay on arrival",
      "User accounts with Google OAuth",
      "Admin dashboard & booking management",
      "Email booking confirmations",
      "PWA — install on mobile",
      "5s Arena World Cup Tournament system",
      "Team registration & manager interface",
      "Live tournament standings & fixtures",
      "AI co-coach for team managers",
      "Rules of the Game — interactive page",
      "Theme switcher (dark / light / crazy / read)",
      "Real-time SSE standings updates",
    ],
  },
  {
    phase: "Coming Soon",
    color: "text-yellow-400 border-yellow-500",
    items: [
      "World Cup Tournament kick-off — May 26–31, 2026",
      "Leagues feature — Season 1",
      "SMS & WhatsApp fixture notifications",
      "Player statistics & season records",
      "Referee assignment system",
    ],
  },
  {
    phase: "Planned",
    color: "text-blue-400 border-blue-500",
    items: [
      "In-app live match scoring (fan view)",
      "Team chat & community hub",
      "Affiliate & referral programme",
      "Branded merchandise shop",
      "Sponsorship integration",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Animated Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="relative w-32 h-32 mb-4 animate-bounce-slow">
            <img
              src="/images/logo.png"
              alt="Bookit 5s Arena Logo"
              className="w-full h-full object-contain rounded-full"
              style={{ animation: "spin 8s linear infinite" }}
            />
          </div>
          <h1
            className="text-5xl font-black uppercase mb-2 tracking-tight text-green-400"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            Roadmap
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            What we&apos;re building at 5s Arena
          </p>
        </div>

        <div className="space-y-10">
          {ROADMAP.map((phase) => (
            <div key={phase.phase}>
              <h2
                className={`text-lg font-black uppercase tracking-widest border-l-4 pl-4 mb-4 ${phase.color}`}
              >
                {phase.phase}
              </h2>
              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-gray-300"
                  >
                    <span className="text-green-500 mt-1">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
