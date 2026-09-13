"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const FootballFixturesHub = dynamic(
  () => import("@/components/fixtures/FootballFixturesHub"),
  {
    loading: () => (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 rounded-[32px] border border-green-500/10 bg-white/[0.02]">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 animate-pulse">Loading competition hub...</span>
      </div>
    ),
    ssr: false,
  }
);

const PremierLeagueFixturesHub = dynamic(
  () => import("@/components/fixtures/PremierLeagueFixturesHub"),
  {
    loading: () => (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 rounded-[32px] border border-green-500/10 bg-white/[0.02]">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 animate-pulse">Loading Premier League hub...</span>
      </div>
    ),
    ssr: false,
  }
);
import LeagueOnboardingModal from "@/components/fixtures/LeagueOnboardingModal";
import FavoriteLeaguesRail from "@/components/fixtures/FavoriteLeaguesRail";
import FixturesRefactorShield from "@/components/fixtures/FixturesRefactorShield";
import BlackboxMarketMask from "@/components/marketing/BlackboxMarketMask";
import { resolveLeagueSlug, DEFAULT_LEAGUE_SLUG } from "@/lib/sports/leagueSlug";
import { LEAGUES_CATALOG } from "@/lib/sports/leaguesCatalog";
import {
  hasCompletedLeagueOnboarding,
  readFavoriteLeagues,
} from "@/lib/sports/leaguePreferences";
import {
  showBlackboxMarketMaskOnFixtures,
  showFixturesRefactorShield,
} from "@/lib/featureFlags";
import { motion } from "framer-motion";

function FixturesPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leagueParam = searchParams.get("league");
  const resolvedLeague = resolveLeagueSlug(leagueParam);
  const [selectedLeague, setSelectedLeague] = useState(resolvedLeague);
  const [favorites, setFavorites] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setSelectedLeague(resolveLeagueSlug(searchParams.get("league")));
  }, [searchParams]);

  useEffect(() => {
    const saved = readFavoriteLeagues();
    setFavorites(saved);
    setShowOnboarding(!hasCompletedLeagueOnboarding());
  }, []);

  const selectLeague = (slug) => {
    setSelectedLeague(slug);
    router.replace(`/fixtures?league=${slug}`, { scroll: false });
  };

  const handleOnboardingComplete = (saved) => {
    setFavorites(saved);
    setShowOnboarding(false);
    if (saved[0]) {
      selectLeague(saved[0]);
    }
  };

  return (
    <>
      <LeagueOnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />

      <motion.div
        className="fixtures-page min-h-screen pb-20 pt-10 px-4"
        style={{
          background: "var(--fixtures-bg, linear-gradient(180deg, #04060a 0%, #0a0f14 60%, #04060a 100%))",
          color: "var(--text-primary)",
        }}
      >
        <motion.div className="mx-auto max-w-6xl space-y-10">
          {showFixturesRefactorShield() && selectedLeague !== DEFAULT_LEAGUE_SLUG ? (
            <FixturesRefactorShield
              onContinuePremierLeague={() => selectLeague(DEFAULT_LEAGUE_SLUG)}
            />
          ) : null}

          <section className="flex flex-col items-center gap-4 text-center">
            <h1
              className="text-4xl md:text-6xl font-black uppercase leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: "0.08em" }}
            >
              LIVE <span className="text-green-400">FIXTURES</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Your match centre for 27 leagues — live scores, tables, headlines, and highlights in one place.
            </p>
          </section>

          {!showOnboarding && favorites.length > 0 ? (
            <FavoriteLeaguesRail
              favorites={favorites}
              activeSlug={selectedLeague}
              onSelect={selectLeague}
              onEdit={() => setShowOnboarding(true)}
            />
          ) : null}

          <section className="flex flex-col items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">
              Browse all competitions
            </p>
            <motion.div
              className="flex flex-wrap justify-center gap-2 p-2 rounded-2xl border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(74, 222, 128, 0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              {LEAGUES_CATALOG.map((league) => (
                <button
                  key={league.slug}
                  type="button"
                  onClick={() => selectLeague(league.slug)}
                  className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${
                    selectedLeague === league.slug
                      ? "bg-green-500 text-black shadow-lg shadow-green-500/30"
                      : favorites.includes(league.slug)
                        ? "text-green-300 hover:text-white hover:bg-white/5 border border-green-500/20"
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {league.emoji} {league.shortName}
                </button>
              ))}
            </motion.div>
          </section>

          <motion.div
            key={selectedLeague}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {selectedLeague === DEFAULT_LEAGUE_SLUG ? (
              <PremierLeagueFixturesHub />
            ) : (
              <FootballFixturesHub slug={selectedLeague} />
            )}
          </motion.div>
        </motion.div>
      </motion.div>
      {showBlackboxMarketMaskOnFixtures() ? <BlackboxMarketMask /> : null}
    </>
  );
}

export default function FixturesPage() {
  return (
    <Suspense fallback={<motion.div className="min-h-screen bg-black" />}>
      <FixturesPageInner />
    </Suspense>
  );
}
