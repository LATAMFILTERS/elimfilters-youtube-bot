export function createYoutubeClient({ apiKey, channelId, oauthClientId, oauthClientSecret, oauthRefreshToken }) {
  let cachedToken = null; // { accessToken, expiresAt }

  async function getAccessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
      return cachedToken.accessToken;
    }
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: oauthClientId,
        client_secret: oauthClientSecret,
        refresh_token: oauthRefreshToken,
        grant_type: "refresh_token"
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      throw new Error(`YouTube OAuth token refresh failed: ${res.status} ${data.error_description || data.error || "unknown error"}`);
    }
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000
    };
    return cachedToken.accessToken;
  }

  return {
    async replyToComment({ commentId, replyText }) {
      if (!oauthClientId || !oauthClientSecret || !oauthRefreshToken) {
        throw new Error("YouTube reply publishing is not configured: comments.insert requires an OAuth2 access token, which is not set up for this bot");
      }
      const accessToken = await getAccessToken();
      const res = await fetch("https://www.googleapis.com/youtube/v3/comments?part=snippet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          snippet: {
            parentId: commentId,
            textOriginal: replyText
          }
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(`YouTube API ${res.status}: ${data.error?.message || "comments.insert failed"}`);
      }
      return { success: true, commentId: data.id };
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
