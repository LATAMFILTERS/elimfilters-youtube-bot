export function createYoutubeClient({ apiKey, channelId }) {
  return {
    async replyToComment() {
      // YouTube Data API v3 comments.insert requires an OAuth2 access token
      // with youtube.force-ssl scope - a plain API key (read-only) cannot
      // authenticate this call. No OAuth credentials are configured for
      // this bot, so posting is not actually possible yet. This used to
      // unconditionally return {success:true} without ever calling the
      // API, which made worker.js mark jobs "completed" for replies that
      // were never sent to YouTube. Throw instead so the caller's
      // catch block runs db.fail() and the job is retried/surfaced
      // truthfully rather than silently swallowed as a fake success.
      throw new Error("YouTube reply publishing is not configured: comments.insert requires an OAuth2 access token, which is not set up for this bot");
    },

    async fetchRecentComments() {
      if (!apiKey || !channelId) return [];
      try {
        const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&allThreadsRelatedToChannelId=${channelId}&key=${apiKey}&maxResults=20`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.items || []).map(item => ({
          id: item.id,
          videoId: item.snippet?.videoId || '',
          text: item.snippet?.topLevelComment?.snippet?.textDisplay || '',
          authorName: item.snippet?.topLevelComment?.snippet?.authorDisplayName || 'YouTube User',
          authorUrl: item.snippet?.topLevelComment?.snippet?.authorChannelUrl || ''
        }));
      } catch (err) {
        console.error('[YouTube fetchComments]', err.message);
        return [];
      }
    }
  };
}
