// Server Component — authoritative data in, cinematic client projection out.
import ArenaChronicle from '@/components/experience/ArenaChronicle';
import AmenitiesStrip from '@/components/home/AmenitiesStrip';
import EventsSection from '@/components/home/EventsSection';
import HomeMediaHighlights from '@/components/home/HomeMediaHighlights';
import AboutSection from '@/components/home/AboutSection';
import SocialSection from '@/components/home/SocialSection';
import ContactSection from '@/components/home/ContactSection';
import WelcomePopup from '@/components/home/WelcomePopup';
import BlackboxMarketMask from '@/components/marketing/BlackboxMarketMask';
import { showBlackboxMarketMaskOnHome } from '@/lib/featureFlags';
import connectDB from '@/lib/mongodb';
import { normalizeCourtImageFilename } from '@/lib/courtImage';
import Court from '@/models/Court';

export const revalidate = 60;

const getCourts = async () => {
  try {
    await connectDB();
    const data = await Court.find().sort({ sortOrder: 1 }).lean();

    if (data.length === 0) {
      return { courts: [], source: 'database-empty' };
    }

    return {
      source: 'database',
      courts: data.map((doc) => ({
        ...doc,
        image: normalizeCourtImageFilename(doc.image),
        _id: doc._id?.toString?.() ?? String(doc._id),
        owner: doc.owner != null ? String(doc.owner) : '000000000000000000000001',
        createdAt: doc.createdAt?.toISOString?.(),
        updatedAt: doc.updatedAt?.toISOString?.(),
      })),
    };
  } catch (err) {
    console.error('Failed to get verified court inventory:', err);
    return { courts: [], source: 'unavailable' };
  }
};

const HomePage = async () => {
  const courtResult = await getCourts();
  const courts = courtResult.courts;
  const courtFeedReady = courtResult.source === 'database' && courts.length > 0;
  const numericPrices = courtFeedReady
    ? courts
        .map((court) => Number(court.price_per_hour))
        .filter((price) => Number.isFinite(price) && price > 0)
    : [];
  const minPrice = numericPrices.length > 0 ? Math.min(...numericPrices) : null;

  return (
    <div className="min-h-screen w-full bg-[#040705]">
      <WelcomePopup />
      {showBlackboxMarketMaskOnHome() ? <BlackboxMarketMask /> : null}

      {/*
        KPGS public experience spine:
        one persistent arena world, five time-aware chapters, and no claim that
        a Court record proves a slot is available. The transactional booking
        boundary remains the authority for slot resolution.
      */}
      <ArenaChronicle
        courts={courts}
        courtSource={courtResult.source}
        minPrice={minPrice}
      />

      {/* Secondary venue surfaces follow the primary booking journey instead of competing with it. */}
      <AmenitiesStrip />
      <EventsSection />
      <AboutSection
        courtsCount={courtFeedReady ? courts.length : null}
        minPrice={minPrice}
        courtFeedReady={courtFeedReady}
      />
      <SocialSection />
      <HomeMediaHighlights />
      <ContactSection />
    </div>
  );
};

export default HomePage;
