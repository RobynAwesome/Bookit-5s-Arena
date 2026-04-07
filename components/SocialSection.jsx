'use client';

import Script from 'next/script';
import { FaTiktok, FaInstagram, FaFacebook, FaWhatsapp, FaPhone } from 'react-icons/fa';

// Update FACEBOOK_PAGE_URL to your exact Facebook page URL
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/fivesarena';

const SocialSection = () => {
  return (
    <section className="mt-16 mb-8">

      {/* Facebook JavaScript SDK — needed for the Page Plugin below */}
      <div id="fb-root" />
      <Script
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0"
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />

      {/* Section heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Follow Us</h2>
        <p className="text-gray-500 text-sm">Stay up to date with matches, events, and news from 5s Arena</p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">

        {/* TikTok */}
        <a
          href="https://www.tiktok.com/@fivesarena"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
            <FaTiktok className="text-white text-xl" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">TikTok</p>
            <p className="text-sm text-gray-500">@fivesarena</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-black text-white group-hover:bg-gray-800 transition-colors">
            Follow
          </span>
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/fivesarena"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all text-center group"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
            }}
          >
            <FaInstagram className="text-white text-xl" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Instagram</p>
            <p className="text-sm text-gray-500">@fivesarena</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white group-hover:opacity-90 transition-opacity">
            Follow
          </span>
        </a>

        {/* Facebook */}
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <FaFacebook className="text-white text-xl" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Facebook</p>
            <p className="text-sm text-gray-500">5s Arena</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
            Like Page
          </span>
        </a>
      </div>

      {/* Facebook Page Plugin — live post feed */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Latest from Facebook</h3>
        <div className="flex justify-center overflow-hidden rounded-xl border border-gray-200">
          <div
            className="fb-page"
            data-href={FACEBOOK_PAGE_URL}
            data-tabs="timeline"
            data-width="500"
            data-height="400"
            data-small-header="true"
            data-adapt-container-width="true"
            data-hide-cover="false"
            data-show-facepile="false"
          />
        </div>
      </div>

      {/* Contact / WhatsApp */}
      <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Get in Touch</h3>
        <p className="text-gray-500 text-sm mb-5">
          Prefer to talk? Reach us on WhatsApp or give us a call — we&apos;re happy to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/27637820245"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            <FaWhatsapp className="text-lg" /> WhatsApp Us
          </a>
          <a
            href="tel:+27637820245"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg transition-colors"
          >
            <FaPhone className="text-sm" /> +27 63 782 0245
          </a>
        </div>
      </div>

    </section>
  );
};

export default SocialSection;
