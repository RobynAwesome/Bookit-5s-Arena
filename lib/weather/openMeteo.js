import { withRuntimeCache } from "@/lib/runtimeCache";

const WEATHER_NAMESPACE = "weather";

const FEATURED_LOCATIONS = [
  {
    slug: "arena",
    label: "5s Arena",
    subtitle: "Milnerton",
    latitude: -33.8766,
    longitude: 18.4904,
  },
  {
    slug: "cape-town",
    label: "Cape Town",
    subtitle: "Western Cape",
    latitude: -33.9249,
    longitude: 18.4241,
  },
  {
    slug: "johannesburg",
    label: "Johannesburg",
    subtitle: "Gauteng",
    latitude: -26.2041,
    longitude: 28.0473,
  },
  {
    slug: "durban",
    label: "Durban",
    subtitle: "KwaZulu-Natal",
    latitude: -29.8587,
    longitude: 31.0218,
  },
  {
    slug: "london",
    label: "London",
    subtitle: "Premier League pulse",
    latitude: 51.5072,
    longitude: -0.1276,
  },
];

export const WMO_CODES = {
  0: { label: "Clear Sky", emoji: "☀️" },
  1: { label: "Mainly Clear", emoji: "🌤️" },
  2: { label: "Partly Cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Icy Fog", emoji: "🌫️" },
  51: { label: "Light Drizzle", emoji: "🌦️" },
  53: { label: "Drizzle", emoji: "🌦️" },
  55: { label: "Heavy Drizzle", emoji: "🌧️" },
  61: { label: "Light Rain", emoji: "🌧️" },
  63: { label: "Rain", emoji: "🌧️" },
  65: { label: "Heavy Rain", emoji: "🌧️" },
  71: { label: "Light Snow", emoji: "🌨️" },
  73: { label: "Snow", emoji: "❄️" },
  75: { label: "Heavy Snow", emoji: "❄️" },
  80: { label: "Rain Showers", emoji: "🌦️" },
  81: { label: "Rain Showers", emoji: "🌦️" },
  82: { label: "Violent Showers", emoji: "⛈️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Hail Storm", emoji: "⛈️" },
  99: { label: "Heavy Hail Storm", emoji: "⛈️" },
};

function getCondition(code) {
  return WMO_CODES[code] || { label: "Unknown", emoji: "🌡️" };
}

function isFootballWeather(sample) {
  return (
    sample.temperature >= 15 &&
    sample.temperature <= 28 &&
    sample.weatherCode <= 3
  );
}

async function fetchLocationWeather(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m",
    timezone: "Africa/Johannesburg",
    wind_speed_unit: "kmh",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }

  const payload = await response.json();
  const current = payload?.current;

  if (!current) {
    throw new Error("Open-Meteo current conditions were missing");
  }

  const condition = getCondition(current.weathercode);

  return {
    slug: location.slug,
    label: location.label,
    subtitle: location.subtitle,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    weatherCode: current.weathercode,
    condition: condition.label,
    emoji: condition.emoji,
    wind: Math.round(current.windspeed_10m),
    humidity: current.relativehumidity_2m,
    footballReady: isFootballWeather({
      temperature: Math.round(current.temperature_2m),
      weatherCode: current.weathercode,
    }),
    fetchedAt: new Date().toISOString(),
  };
}

export async function getFeaturedLocationWeather() {
  return withRuntimeCache(
    WEATHER_NAMESPACE,
    "featured-locations",
    15 * 60 * 1000,
    async () => {
      const results = await Promise.allSettled(
        FEATURED_LOCATIONS.map(fetchLocationWeather),
      );

      return results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
    },
  );
}

export async function getWeatherProviderHealth() {
  try {
    const locations = await getFeaturedLocationWeather();

    return {
      provider: "Open-Meteo",
      configured: true,
      status: locations.length ? "ok" : "degraded",
      sampleCount: locations.length,
      locations,
    };
  } catch (error) {
    return {
      provider: "Open-Meteo",
      configured: true,
      status: "degraded",
      error: error.message,
    };
  }
}
