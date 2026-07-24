import { createNvidiaClient } from "./nvidia.js";
import { createYoutubeClient } from "./youtube.js";

export function createWorker({ config, db }) {
  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });
  const youtube = createYoutubeClient({ apiKey: config.youtubeApiKey, channelId: config.youtubeChannelId });

  return {
    async run() {
      // 1. Optionally poll YouTube API for new comments
      const newComments = await youtube.fetchRecentComments();
      for (const c of newComments) {
        await db.enqueue(c);
      }

      // 2. Process pending jobs in PostgreSQL Queue
      const jobs = await db.claim(5);
      if (!jobs.length) return;

      for (const job of jobs) {
        try {
          console.log(`[YouTube Worker] Processing job ${job.comment_id}: "${job.comment_text.slice(0, 50)}..."`);
          const replyText = await nvidia.generateReply(job.comment_text);

          if (config.dryRun) {
            console.log(`[YouTube Worker] DRY_RUN=true: Draft reply for ${job.comment_id} -> "${replyText}"`);
            await db.complete(job.comment_id, `[DRY_RUN DRAFT] ${replyText}`);
            continue;
          }

          await youtube.replyToComment({ commentId: job.comment_id, replyText });
          await db.complete(job.comment_id, replyText);
        } catch (err) {
          console.error(`[YouTube Worker] Error processing ${job.comment_id}:`, err.message);
          await db.fail(job.comment_id, err.message);
        }
      }
    }
  };
}
