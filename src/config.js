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
  const dryRun = (process.env.DRY_RUN || "true").toLowerCase() === "true";

  const youtubeOauthClientId = process.env.YOUTUBE_OAUTH_CLIENT_ID || "";
  const youtubeOauthClientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET || "";
  const youtubeOauthRefreshToken = process.env.YOUTUBE_OAUTH_REFRESH_TOKEN || "";
  // comments.insert requires OAuth2 (a read-only API key can't write), so
  // these are only mandatory once the bot is actually allowed to publish.
  // Requiring them unconditionally would crash-loop the service the moment
  // DRY_RUN=false ships, before anyone's had a chance to load real creds.
  if (!dryRun && (!youtubeOauthClientId || !youtubeOauthClientSecret || !youtubeOauthRefreshToken)) {
    throw new Error("YOUTUBE_OAUTH_CLIENT_ID, YOUTUBE_OAUTH_CLIENT_SECRET, and YOUTUBE_OAUTH_REFRESH_TOKEN are required when DRY_RUN=false");
  }

  return {
    port: parseInt(process.env.PORT || "10000", 10),
    youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || "@elimfilters9112",
    // Optional: youtube.js already degrades gracefully (returns []) when unset.
    youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
    youtubeOauthClientId,
    youtubeOauthClientSecret,
    youtubeOauthRefreshToken,
    // No hardcoded fallback - a webhook verify token baked into the
    // source is not a secret. GET /webhook now actually checks this
    // value (it didn't before), so it must come from the environment.
    youtubeVerifyToken: requireValue("YOUTUBE_VERIFY_TOKEN", process.env.YOUTUBE_VERIFY_TOKEN),
    databaseUrl: requireValue("DATABASE_URL", process.env.DATABASE_URL),
    nvidiaApiKey: process.env.NVIDIA_NIM_API_KEY || "",
    nvidiaModel: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b",
    // Knowledge System Integration
    KNOWLEDGE_CENTER_API_URL: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
    KNOWLEDGE_CENTER_API_KEY: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
    KNOWLEDGE_ENGINE_RUNTIME_URL: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
    ENGINE_API_KEY: process.env.ENGINE_API_KEY?.trim() || null,
    dryRun
  };
}
