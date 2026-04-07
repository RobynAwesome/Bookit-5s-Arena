/**
 * Single source of truth for all 48 World Cup 5s teams.
 * logo   — team/player badge image (worldcup-logos/)
 * profile — individual player headshot (worldcup-player-profiles/)
 * null   — no image on disk yet; UI falls back to coloured initial
 *
 * 8 groups × 6 teams = 48 slots total.
 * Groups are assigned by the admin in the competition hub.
 */

const L = '/images/tournament/worldcup-logos/';
const P = '/images/tournament/worldcup-player-profiles/';

export const WORLD_CUP_TEAMS = [
  /* ── Tier 1: Full logo + player profile ──────────────────────── */
  { name: 'Argentina',    player: 'Lionel Messi',         logo: `${L}lionel-messi-team.jpg`,                 profile: `${P}lionel-messi.jpg` },
  { name: 'Portugal',     player: 'Cristiano Ronaldo',    logo: `${L}cristiano-ronaldo-team.jpg`,             profile: `${P}cristiano-ronaldo.jpg` },
  { name: 'France',       player: 'Kylian Mbappé',        logo: `${L}kylian-mbappe-team.jpg`,                 profile: `${P}kylian-mbappe.jpg` },
  { name: 'Brazil',       player: 'Vinícius Jr',          logo: `${L}vinícius-jr-team.jpg`,                   profile: `${P}vinícius-jr.jpg` },
  { name: 'Spain',        player: 'Lamine Yamal',         logo: `${L}lamine-yamal-team.jpg`,                  profile: `${P}lamine-yamal.jpg` },
  { name: 'England',      player: 'Harry Kane',           logo: `${L}harry-kane-team.jpg`,                    profile: `${P}harry-kane.jpg` },
  { name: 'Germany',      player: 'Florian Wirtz',        logo: `${L}florian-wirtz-team.jpg`,                 profile: `${P}florian-wirtz.jpg` },
  { name: 'South Korea',  player: 'Son Heung-Min',        logo: `${L}son-heung-min-team.jpg`,                 profile: `${P}son-heung-min.jpg` },
  { name: 'Italy',        player: 'Gianluigi Donnarumma', logo: `${L}gianluigi-donnarumma-team.jpg`,          profile: `${P}gianluigi-donnarumma-gen.png` },
  { name: 'Morocco',      player: 'Achraf Hakimi',        logo: `${L}achraf-hakimi-team.jpg`,                 profile: `${P}achraf-hakimi.jpg` },
  { name: 'Japan',        player: 'Takefusa Kubo',        logo: `${L}takefusa-kubo-team.jpg`,                 profile: `${P}takefusa-kubo.jpg` },
  { name: 'Mexico',       player: 'Santiago Giménez',     logo: `${L}santiago-gimenez-team.jpg`,              profile: `${P}santiago-gimenez.jpg` },
  { name: 'Jordan',       player: 'Baha Abdulrahman',     logo: `${L}Jordan-team.jpg`,                        profile: `${P}jordan.jpg` },
  { name: 'Cape Verde',   player: 'Garry Rodrigues',      logo: `${L}cape-verde-team.jpg`,                    profile: `${P}cape-verde.jpg` },
  { name: 'Curaçao',      player: 'Cuco Martina',         logo: `${L}curaçao-team.jpg`,                       profile: `${P}curaçao.jpg` },
  { name: 'Switzerland',  player: 'Jordan Pefok',         logo: `${L}jordan-pefok-team.jpg`,                  profile: null },
  { name: 'Uzbekistan',   player: 'Eldor Shomurodov',     logo: `${L}uzbekistan-team.jpg`,                    profile: `${P}uzbekistan.jpg` },
  { name: 'Chile',        player: 'Alexis Sánchez',       logo: `${L}santiago-donnama-team.jpg`,              profile: `${P}santiago-donnama.jpg` },

  /* ── Tier 2: Full logo + player profile (newly mapped logos) ─── */
  { name: 'Netherlands',  player: 'Virgil van Dijk',      logo: `${L}virgil-van-dijk-team.png`,               profile: `${P}virgil-van-dijk.png` },
  { name: 'Belgium',      player: 'Kevin De Bruyne',      logo: `${L}kevin-de-bruyne-team.png`,               profile: `${P}kevin-de-bruyne.png` },
  { name: 'Croatia',      player: 'Luka Modrić',          logo: `${L}luka-modric-team.png`,                   profile: `${P}luka-modric.png` },
  { name: 'Uruguay',      player: 'Federico Valverde',    logo: `${L}federico-valverde-team.png`,             profile: `${P}federico-valverde.png` },
  { name: 'Colombia',     player: 'Luis Díaz',            logo: `${L}luis-diaz-team.png`,                     profile: `${P}luis-diaz.png` },
  { name: 'Nigeria',      player: 'Victor Osimhen',       logo: `${L}victor-osimhen-team.png`,                profile: `${P}victor-osimhen.png` },
  { name: 'USA',          player: 'Christian Pulisic',    logo: `${L}christian-pulisic-team.png`,             profile: `${P}christian-pulisic.png` },
  { name: 'Senegal',      player: 'Sadio Mané',           logo: `${L}sadio-mane-team.png`,                    profile: `${P}sadio-mane.png` },
  { name: 'Ghana',        player: 'Thomas Partey',        logo: `${L}thomas-partey-team.png`,                 profile: `${P}thomas-partey.png` },
  { name: 'Algeria',      player: 'Riyad Mahrez',         logo: `${L}riyad-mahrez-team.jpg`,                  profile: `${P}riyad-mahrez.png` },
  { name: 'South Africa', player: 'Percy Tau',            logo: `${L}percy-tau-team.png`,                     profile: `${P}percy-tau.png` },

  /* ── Tier 3: Logo + profile (remaining confirmed pairs) ──────── */
  { name: 'Canada',       player: 'Alphonso Davies',      logo: `${L}alphonso-davies-team.jpg`,               profile: `${P}alphonso-davies.png` },
  { name: 'Ecuador',      player: 'Moisés Caicedo',       logo: `${L}moises-caicedo-team.png`,                profile: `${P}moises-caicedo.png` },
  { name: 'Denmark',      player: 'Christian Eriksen',    logo: `${L}christian-eriksen-team.jpg`,             profile: `${P}christian-eriksen.png` },
  { name: 'Turkey',       player: 'Hakan Çalhanoğlu',     logo: `${L}hakan-calhanoglu-team.png`,              profile: null },
  { name: 'Austria',      player: 'David Alaba',          logo: `${L}david-alaba-team.jpg`,                   profile: `${P}david-alaba.png` },
  { name: 'Saudi Arabia', player: 'Salem Al-Dawsari',     logo: `${L}salem-al-dawsari-team.png`,              profile: `${P}salem-al-dawsari.png` },
  { name: 'Iran',         player: 'Mehdi Taremi',         logo: `${L}mehdi-taremi-team.jpg`,                  profile: `${P}mehdi-taremi.png` },
  { name: 'Australia',    player: 'Mathew Ryan',          logo: `${L}mathew-ryan-team.png`,                   profile: `${P}mathew-ryan.png` },
  { name: 'Ivory Coast',  player: 'Wilfried Zaha',        logo: `${L}wilfried-zaha-team.png`,                 profile: `${P}wilfried-zaha.png` },
  { name: 'Tunisia',      player: 'Youssef Msakni',       logo: `${L}youssef-msakni-team.png`,                profile: `${P}youssef-msakni.png` },
  { name: 'New Zealand',  player: 'Chris Wood',           logo: `${L}chris-wood-team.jpg`,                    profile: `${P}chris-wood.png` },
  { name: 'Ukraine',      player: 'Mykhaylo Mudryk',      logo: `${L}mykhaylo-mudryk-team.jpg`,               profile: `${P}mykhaylo-mudryk.png` },
  { name: 'Costa Rica',   player: 'Keylor Navas',         logo: `${L}keylor-navas.-team.jpg`,                 profile: `${P}keylor-navas.png` },
  { name: 'Panama',       player: 'Rommel Quioto',        logo: `${L}rommel-quioto-team.jpg`,                 profile: `${P}rommel-quioto.png` },
  { name: 'Jamaica',      player: 'Michail Antonio',      logo: `${L}michail-antonio-team.png`,               profile: `${P}michail-antonio.png` },
  { name: 'Qatar',        player: 'Al-Moez Ali',          logo: `${L}al-moez-ali-team.jpg`,                   profile: `${P}al-moez-ali.jpg` },
  /* ── UNIQUE BONUS TEAMS (Phase 1 & 2) ─────────────────────────── */
  { name: 'Israel',      player: 'Manor Solomon',      logo: `${L}manor-solomon-team.png`,        profile: `${P}manor-solomon.png` },
  { name: 'Palestine',   player: 'Oday Dabbagh',       logo: `${L}oday-dabbagh-team.png`,         profile: `${P}oday-dabbagh.png` },
  { name: 'Syria',       player: 'Omar Al-Somah',      logo: `${L}omar-al-somah-team.png`,        profile: `${P}omar-al-somah.png` },
  { name: 'Benin',       player: 'Steve Mounié',       logo: `${L}steve-mounie-team.png`,         profile: `${P}steve-mounie.png` },
  { name: 'Togo',        player: 'Ihlas Bebou',        logo: `${L}ihlas-bebou-team.png`,          profile: `${P}ihlas-bebou.png` },
  { name: 'Kenya',       player: 'Michael Olunga',     logo: `${L}michael-olunga-team.png`,       profile: `${P}michael-olunga.png` },
  { name: 'Tanzania',    player: 'Mbwana Samatta',     logo: `${L}mbwana-samatta-team.png`,       profile: `${P}mbwana-samatta.png` },
  { name: 'Zimbabwe',    player: 'Marvelous Nakamba',  logo: `${L}marvelous-nakamba-team.png`,    profile: `${P}marvelous-nakamba.png` },
  { name: 'Madagascar',  player: 'Thomas Fontaine',    logo: `${L}thomas-fontaine-team.png`,      profile: `${P}thomas-fontaine.png` },
  { name: 'Libya',       player: 'Mohamed Al-Musrati', logo: `${L}mohamed-al-musrati-team.png`,   profile: `${P}mohamed-al-musrati.png` },
  { name: 'Mauritania',  player: 'Aboubakar Kamara',    logo: `${L}aboubakar-kamara-team.png`,     profile: `${P}aboubakar-kamara.png` },
  { name: 'Namibia',     player: 'Peter Shalulile',    logo: `${L}peter-shalulile-team.png`,      profile: null },

  /* ── BONUS TEAMS (Phase 3 — new images added) ──────────────────── */
  { name: 'Egypt',         player: 'Mohamed Salah',              logo: `${L}mohamed-salah-team.png`,              profile: `${P}mohamed-salah.png` },
  { name: 'Cameroon',      player: 'André Frank Zambo Anguissa', logo: `${L}zambo-anguissa-team.png`,             profile: `${P}zambo-anguissa.png` },
  { name: 'Poland',        player: 'Robert Lewandowski',         logo: `${L}robert-lewandowski-team.png`,         profile: `${P}robert-lewandowski.png` },
  { name: 'Serbia',        player: 'Dušan Vlahović',             logo: `${L}dusan-vlahovic-team.png`,             profile: `${P}dusan-vlahovic.png` },
  { name: 'Bafana Bafana', player: 'Oswin Appollis',             logo: `${L}oswin-appollis-team.jpg`,             profile: `${P}oswin-appollis.jpg` },
  { name: 'Mali',          player: 'Yves Bissouma',              logo: `${L}yves-bissouma-team.png`,              profile: `${P}yves-bissouma.png` },
  { name: 'DR Congo',      player: 'Chancel Mbemba',             logo: `${L}chancel-mbemba-team.png`,             profile: `${P}chancel-mbemba.png` },
  { name: 'Burkina Faso',  player: 'Edmond Tapsoba',             logo: `${L}edmond-tapsoba-team.png`,             profile: `${P}edmond-tapsoba.png` },
  { name: 'Zambia',        player: 'Patson Daka',                logo: `${L}patson-daka-team.png`,                profile: `${P}patson-daka.png` },
  { name: 'Guinea',        player: 'Serhou Guirassy',            logo: `${L}serhou-guirassy-team.png`,            profile: `${P}serhou-guirassy.png` },
  { name: 'Guinea 2',      player: 'Fahad Bayo',                 logo: `${L}fahad-bayo-team.png`,                 profile: `${P}fahad-bayo.png` },
  { name: 'Angola',        player: 'Gelson Dala',                logo: `${L}gelson-dala-team.png`,                profile: `${P}gelson-dala.png` },
  { name: 'Burundi',       player: 'Saido Berahino',             logo: `${L}saido-berahino-team.png`,             profile: `${P}saido-berahino.png` },
  { name: 'Gabon',         player: 'Pierre-Emerick Aubameyang',  logo: `${L}pierre-emerick-aubameyang-team.png`,  profile: null },
];

/** Convenience: the display image for a team — logo first, profile fallback */
export function teamImage(team) {
  return team.logo || team.profile || null;
}

/** Player headshot only — for PlayerShowcase */
export function playerImage(team) {
  return team.profile || null;
}

/** Team logo/badge only — for CountrySelector */
export function logoImage(team) {
  return team.logo || null;
}
