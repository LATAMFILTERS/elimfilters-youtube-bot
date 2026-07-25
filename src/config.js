function requireValue(name, val) {
  // Previously only enforced when NODE_ENV === "production" - but neither
  // this app's render.yaml nor Render itself sets NODE_ENV, so this never
  // actually threw in production and "required" vars silently fell back
  // to an empty/unusable default instead.
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export function getConfig() {
  return {
    port: parseInt(process.env.PORT || "10000", 10),
    youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || "@elimfilters9112",
    // Optional: youtube.js already degrades gracefully (returns []) when unset.
    youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
    // No hardcoded fallback - a webhook verify token baked into the
    // source is not a secret. GET /webhook now actually checks this
    // value (it didn't before), so it must come from the environment.
    youtubeVerifyToken: requireValue("YOUTUBE_VERIFY_TOKEN", process.env.YOUTUBE_VERIFY_TOKEN),
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    dryRun: (process.env.DRY_RUN || "true").toLowerCase() === "true"
  };
}
