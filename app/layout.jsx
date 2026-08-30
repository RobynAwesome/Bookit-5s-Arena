import dynamic from "next/dynamic";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import TruthFooter from "@/components/TruthFooter";
import ClientOnly from "@/components/ClientOnly";
import { ThemeProvider } from "@/context/ThemeContext";
import { FeatureAccessProvider } from "@/hooks/useFeatureAccess";
import "../assets/styles/globals.css";

// Lazy-load non-critical client components to reduce initial bundle
const NewsletterPopup = dynamic(() => import("@/components/NewsletterPopup"));
const AnalyticsTracker = dynamic(() => import("@/components/AnalyticsTracker"));
const CookieBanner = dynamic(() => import("@/components/CookieBanner"));
const PageTransition = dynamic(() => import("@/components/PageTransition"));
const Analytics = dynamic(() => import("@vercel/analytics/react").then(m => m.Analytics));
const OfflineBanner = dynamic(() => import("@/packages/ui/src/OfflineBanner"));
const ContextualFloatingNavigation = dynamic(() => import("@/components/ContextualFloatingNavigation"));

const SITE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXTAUTH_URL || "https://fivesarena.com"
    : process.env.NEXTAUTH_URL || "http://localhost:3002";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bookit 5's Arena | 5-a-Side Football Cape Town",
    template: "%s | Bookit 5's Arena",
  },
  description:
    "Explore 5-a-side football at Hellenic FC, Milnerton, with source-qualified court booking, event enquiries, football fixtures and archived competition reference surfaces.",
  keywords: [
    "5-a-side football",
    "Cape Town",
    "Milnerton",
    "court booking",
    "football tournament",
    "Hellenic Football Club",
    "Bookit 5's Arena",
    "Competition Hub",
    "World Cup 5s archive",
  ],
  authors: [{ name: "Bookit 5's Arena" }],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: process.env.NEXTAUTH_URL || "https://fivesarena.com",
    siteName: "Bookit 5's Arena",
    title: "Bookit 5's Arena | 5-a-Side Football Cape Town",
    description:
      "Explore 5-a-side football in Milnerton, Cape Town, including source-qualified booking surfaces, event enquiries and archived competition reference.",
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
      "Explore 5-a-side football in Milnerton, Cape Town, with current-source booking surfaces and archived competition reference.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15803d",
};

const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"));

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
        <link rel="dns-prefetch" href="https://plausible.io" />
        <link rel="dns-prefetch" href="https://media.api-sports.io" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('5s_theme');var ok=t==='dark'||t==='light'||t==='crazy'||t==='read';if(ok){document.documentElement.classList.add(t);}}catch(e){}})();`,
          }}
        />
        <script
          defer
          data-domain="fivesarena.com"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body
        className="overflow-x-hidden antialiased selection:bg-green-500/30"
        style={{ backgroundColor: "var(--bg-primary, #0a1628)", color: "var(--text-primary, #f9fafb)" }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <FeatureAccessProvider>
            <ThemeProvider>
              <AnalyticsTracker />
              <ClientOnly />
              <OfflineBanner />
              <Header />
              <main>
                <PageTransition>{children}</PageTransition>
              </main>
              <TruthFooter />
              <ScrollToTop />
              <ContextualFloatingNavigation />
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