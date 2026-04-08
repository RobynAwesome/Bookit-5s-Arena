/**
 * Site-wide constants — import from here instead of hardcoding values.
 * This prevents inconsistencies across components.
 */

import { getSiteUrl } from "@/lib/config/env";

export const SITE_URL = getSiteUrl();

export const SITE_DOMAIN = 'fivesarena.com';

export const CONTACT = {
  phone: '0637820245',            // local SA format
  phoneIntl: '27637820245',       // international (no +) for wa.me links
  phoneDisplay: '+27 63 782 0245',
  email: 'fivearena@gmail.com',
  whatsappUrl: 'https://wa.me/27637820245',
  whatsappMessage: 'https://wa.me/27637820245?text=Hi%2C%20I%27d%20like%20to%20book%20a%20court%20at%205s%20Arena',
};

export const VENUE = {
  name: 'Hellenic Football Club',
  address: 'Milnerton, Cape Town, South Africa',
  shortAddress: 'Milnerton · Cape Town',
  mapsUrl: 'https://maps.google.com/?q=Hellenic+Football+Club+Milnerton+Cape+Town',
};

export const TOURNAMENT = {
  name: '5s Arena World Cup',
  startDate: '2026-05-26',
  endDate: '2026-05-31',
  signupDeadline: '2026-05-19',
  groups: 8,
  teamsPerGroup: 6,
};

export const SOCIAL = {
  instagram: 'https://www.instagram.com/fivesarena/',
  facebook: 'https://www.facebook.com/fivesarena/',
  twitter: 'https://twitter.com/fivesarena/',
  tiktok: 'https://www.tiktok.com/@fivesarena/',
};
