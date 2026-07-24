import express from "express";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { normalizeYoutubeEvents } from "./security.js";
import { createWorker } from "./worker.js";

const config = getConfig();
const db = createDb(config.databaseUrl);
await db.init();

const worker = createWorker({ config, db });
const app = express();

const webhookStats = {
  received: 0,
  rejected: 0,
  lastEventCount: 0,
  lastReceivedAt: null
};

const legalPage = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | ELIMFILTERS</title><style>body{font:16px/1.6 Arial,sans-serif;max-width:820px;margin:48px auto;padding:0 22px;color:#171717}h1,h2{color:#111}a{color:#195faa}.muted{color:#666}</style></head><body><h1>${title}</h1>${body}<p class="muted">Last updated: July 24, 2026</p></body></html>`;

app.get("/privacy", (_req, res) =>
  res.type("html").send(legalPage("Privacy Policy", `
<p>LATAM FILTERS PRO INC, operating the ELIMFILTERS brand, uses the official YouTube Data API v3 to assist with comment responses on the @elimfilters channel.</p>
<h2>Information processed</h2><p>We process public YouTube comment text, channel display names, timestamps, and video identifiers to generate technical assistance.</p>
<h2>Contact</h2><p>ELIMFILTERS — <a href="mailto:elimfilters@gmail.com">elimfilters@gmail.com</a></p>`))
);

app.get("/terms", (_req, res) =>
  res.type("html").send(legalPage("Terms of Service", `
<p>This service assists ELIMFILTERS with managing community comments on its official YouTube Channel. Subject to YouTube Terms of Service.</p>
<p>Questions: <a href="mailto:elimfilters@gmail.com">elimfilters@gmail.com</a>.</p>`))
);

app.get("/health", async (_req, res) =>
  res.json({
    ok: true,
    service: "elimfilters-youtube-bot",
    channelId: config.youtubeChannelId,
    dryRun: config.dryRun,
    queue: await db.status(),
    webhook: webhookStats
  })
);

app.get("/review-drafts", async (_req, res) => {
  if (!config.dryRun) return res.sendStatus(404);
  res.json({ ok: true, dryRun: true, drafts: await db.recentDrafts(10) });
});

// YouTube Webhook verification / challenge endpoint (PubSubHubbub)
app.get("/webhook", (req, res) => {
  const challenge = req.query["hub.challenge"] || req.query["challenge"];
  return res.status(200).send(challenge || "OK");
});

// YouTube Webhook event receiver
app.post("/webhook", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
  webhookStats.received++;
  webhookStats.lastReceivedAt = new Date().toISOString();

  let body;
  try {
    body = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.sendStatus(400);
  }

  const events = normalizeYoutubeEvents(body);
  webhookStats.lastEventCount = events.length;

  await Promise.all(events.map(e => db.enqueue(e)));
  res.sendStatus(200);

  setImmediate(() => worker.run().catch(console.error));
});

app.listen(config.port, () =>
  console.log(`ELIMFILTERS YouTube bot listening on port ${config.port}; dryRun=${config.dryRun}`)
);

setInterval(() => worker.run().catch(console.error), 5 * 60 * 1000).unref();
