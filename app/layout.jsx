import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SoccerBallMenu from "@/components/SoccerBallMenu";
import NewsletterPopup from "@/components/NewsletterPopup";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import CookieBanner from "@/components/CookieBanner";
import ClientOnly from "@/components/ClientOnly";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/context/ThemeContext";
import { FeatureAccessProvider } from "@/hooks/useFeatureAccess";
import { SITE_URL } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/react";
import "../assets/styles/globals.css";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bookit 5's Arena",
    template: "%s | Bookit 5's Arena",
  },
  description:
    "Cape Town's most advanced 5-a-side football venue. Experience the World Cup 5s, real-time competition standings, and pro-tier floodlit courts at Milnerton. Book online from R400/hour.",
  keywords: [
    "World Cup 5s",
    "5-a-side football",
    "Cape Town",
    "Milnerton",
    "court booking",
    "football tournament",
    "Hellenic Football Club",
    "Bookit 5's Arena",
    "Competition Hub",
  ],
  authors: [{ name: "Bookit 5's Arena" }],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: SITE_URL,
    siteName: "Bookit 5's Arena",
    title: "Bookit 5's Arena | World Cup 5s Football Cape Town",
    description:
      "Elite 5-a-side football in Milnerton, Cape Town. Live competition standings, floodlit courts, and integrated fan experiences. Join the World Cup 5s today.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Bookit 5's Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bookit 5's Arena | Cape Town Football",
    description:
      "Experience the World Cup 5s and real-time competition stats in Milnerton, Cape Town.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15803d",
};

import ScrollToTop from "@/components/ScrollToTop";
import BottomNavbar from "@/components/BottomNavbar";

const RootLayout = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/icon-512x512.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link rel="shortcut icon" href="/icons/favicon-32x32.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik+Dirt&display=swap"
          rel="stylesheet"
        />
        {/* Plausible Analytics — Lightweight & Privacy-focused */}
        <script
          defer
          data-domain="fivesarena.com"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body
        className="overflow-x-hidden bg-gray-950 text-white antialiased selection:bg-green-500/30"
        suppressHydrationWarning
      >
        <AuthProvider>
          <FeatureAccessProvider>
            <ThemeProvider>
              <AnalyticsTracker />
              <ClientOnly />
              <Header />
              <main>
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              {/* Fixed floating elements */}
              <ScrollToTop />
              <SoccerBallMenu />
              <BottomNavbar />
              <NewsletterPopup />
              <CookieBanner />
            </ThemeProvider>
          </FeatureAccessProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
