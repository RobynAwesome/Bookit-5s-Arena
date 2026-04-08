import connectDB from "@/lib/mongodb";
import { getAuthEnv } from "@/lib/config/env";

export async function getCoreSystemHealth() {
  const auth = getAuthEnv();
  const mongoUri = Boolean(
    process.env.MONGODB_URI ||
    process.env.MONGODB_DIRECT_URI ||
    process.env.MONGODB_URI_DIRECT,
  );

  let database = {
    provider: "MongoDB",
    configured: mongoUri,
    status: mongoUri ? "ok" : "unconfigured",
  };

  if (mongoUri) {
    try {
      await connectDB();
      database = {
        ...database,
        status: "ok",
      };
    } catch (error) {
      database = {
        ...database,
        status: "degraded",
        error: error.message,
      };
    }
  }

  return {
    auth: {
      provider: "NextAuth",
      configured: Boolean(auth.secret && auth.url),
      status: auth.secret && auth.url ? "ok" : "degraded",
      url: auth.url,
      hasSecret: Boolean(auth.secret),
    },
    database,
  };
}
