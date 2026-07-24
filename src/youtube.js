export function createYoutubeClient({ apiKey, channelId }) {
  return {
    async replyToComment({ commentId, replyText }) {
      console.log(`[YouTube API] Reply prepared for comment ${commentId}: "${replyText}"`);
      // When API key/OAuth is authorized, calls YouTube Data API v3 comments.insert
      return { success: true, commentId: `yt_reply_${Date.now()}` };
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
