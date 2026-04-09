// Server Component — keeps ISR data fetching; passes data to client components for animations
import HeroSection      from '@/components/home/HeroSection';
import StatsBar         from '@/components/home/StatsBar';
import WeatherWidget    from '@/components/home/WeatherWidget';
import CourtsSection    from '@/components/home/CourtsSection';
import AmenitiesStrip   from '@/components/home/AmenitiesStrip';
import EventsSection    from '@/components/home/EventsSection';
import FixturesPromo    from '@/components/home/FixturesPromo';
import AboutSection     from '@/components/home/AboutSection';
import SocialSection    from '@/components/home/SocialSection';
import TournamentSection from '@/components/home/TournamentSection';
import TournamentShowcase from '@/components/home/TournamentShowcase';
import ContactSection   from '@/components/home/ContactSection';
import WelcomePopup     from '@/components/home/WelcomePopup';
import connectDB        from '@/lib/mongodb';
import { getFallbackCourts } from '@/lib/localData/courts';
import Court            from '@/models/Court';

export const revalidate = 60; // ISR — revalidate every 60 seconds

// ─── server-side fetch ────────────────────────────────────────
const getCourts = async () => {
  try {
    await connectDB();
    const data = await Court.find().sort({ sortOrder: 1 }).lean();
    return data.map(doc => ({ 
      ...doc, 
      _id: doc._id.toString(),
      owner: doc.owner.toString(),
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString()
    }));
  } catch (err) {
    console.error('Failed to get courts:', err);
    return getFallbackCourts();
  }
};

// ─── page component ───────────────────────────────────────────
const HomePage = async () => {
  const courts = await getCourts();

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <WelcomePopup />

      {/* ══ HERO — animated entrance + particle background ══════ */}
      <HeroSection />

      {/* ══ STATS BAR — count-up animations ════════════════════ */}
      <StatsBar courtsCount={courts.length || 4} />

      {/* ══ WEATHER — live Cape Town weather via Open-Meteo ═════ */}
      <WeatherWidget />

      {/* ══ TOURNAMENT — showstopper World Cup section ══════════ */}
      <TournamentSection />

      {/* ══ COURTS — staggered scroll-reveal + hover glow ═══════ */}
      <CourtsSection courts={courts} />

      {/* ══ AMENITIES — spring pop-in ════════════════════════════ */}
      <AmenitiesStrip />

      {/* ══ EVENTS — staggered cards + coloured glows ════════════ */}
      <EventsSection />

      {/* ══ ABOUT — slide in from sides ══════════════════════════ */}
      <AboutSection courtsCount={courts.length || 4} />

      {/* ══ SOCIAL — staggered slide reveal ═════════════════════ */}
      <SocialSection />

      {/* ══ TOURNAMENT SHOWCASE — live standings + SSE ══════════ */}
      <TournamentShowcase />

      {/* ══ FIXTURES PROMO — massive CTA after social ════════════ */}
      <FixturesPromo />

      {/* ══ CONTACT + FOOTER — animated cards ═══════════════════ */}
      <ContactSection />

    </div>
  );
};

export default HomePage;
