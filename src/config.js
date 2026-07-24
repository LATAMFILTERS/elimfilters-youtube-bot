function requireValue(name, val) {
  if (!val && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val || "";
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "10000", 10),
    youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || "",
    youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
    youtubeVerifyToken: process.env.YOUTUBE_VERIFY_TOKEN || "elimfilters_youtube_webhook_verify_2026",
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL || "postgres://localhost:5432/elimfilters"),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "true").toLowerCase() === "true"
  };
}
