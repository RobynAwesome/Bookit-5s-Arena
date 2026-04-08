import connectDB from "@/lib/mongodb";
import ReactorChannel from "@/models/ReactorChannel";
import { searchYouTubeVideos } from "@/lib/media/youtube";

const DEFAULT_REACTOR_CHANNELS = [
  {
    name: "AFTV",
    slug: "aftv",
    searchQuery: "AFTV Premier League reaction",
    teamFocus: ["Arsenal"],
    enabled: true,
    priority: 10,
  },
  {
    name: "Stretford Paddock",
    slug: "stretford-paddock",
    searchQuery: "Stretford Paddock Premier League reaction",
    teamFocus: ["Man Utd"],
    enabled: true,
    priority: 20,
  },
  {
    name: "The Redmen TV",
    slug: "the-redmen-tv",
    searchQuery: "The Redmen TV Premier League reaction",
    teamFocus: ["Liverpool"],
    enabled: true,
    priority: 30,
  },
  {
    name: "DR Sports",
    slug: "dr-sports",
    searchQuery: "DR Sports Premier League reaction",
    teamFocus: ["Premier League"],
    enabled: true,
    priority: 40,
  },
  {
    name: "Expressions Oozing",
    slug: "expressions-oozing",
    searchQuery: "Expressions Oozing Premier League reaction",
    teamFocus: ["Spurs"],
    enabled: true,
    priority: 50,
  },
];

export async function getActiveReactorChannels() {
  try {
    await connectDB();
    const channels = await ReactorChannel.find({ enabled: true })
      .sort({ priority: 1, name: 1 })
      .lean();

    if (channels.length) {
      return channels;
    }
  } catch {
    // Fall back to defaults when DB access is unavailable.
  }

  return DEFAULT_REACTOR_CHANNELS;
}

export async function getCuratedReactorVideos(topic, { limit = 6 } = {}) {
  const channels = await getActiveReactorChannels();
  const activeChannels = channels.filter((channel) => channel.enabled !== false);

  const results = await Promise.all(
    activeChannels.slice(0, 5).map(async (channel) => {
      try {
        const videos = await searchYouTubeVideos(
          `${channel.searchQuery || channel.name} ${topic}`,
          { limit: 1 },
        );

        return videos.map((video) => ({
          ...video,
          reactor: {
            name: channel.name,
            slug: channel.slug,
            teamFocus: channel.teamFocus || [],
          },
        }));
      } catch {
        return [];
      }
    }),
  );

  const deduped = new Map();

  for (const video of results.flat()) {
    if (!deduped.has(video.id)) {
      deduped.set(video.id, video);
    }
  }

  return [...deduped.values()].slice(0, limit);
}

export { DEFAULT_REACTOR_CHANNELS };
