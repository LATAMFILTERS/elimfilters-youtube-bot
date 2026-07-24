export function normalizeYoutubeEvents(body) {
  if (!body) return [];
  const events = [];

  // Handle YouTube Data API v3 webhook / pubsubhubbub or polling items
  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      const topComment = item.snippet?.topLevelComment?.snippet || item.snippet;
      if (topComment) {
        events.push({
          id: String(item.id || topComment.id || `yt_${Date.now()}`),
          videoId: item.snippet?.videoId || topComment.videoId || '',
          text: topComment.textDisplay || topComment.textOriginal || '',
          authorName: topComment.authorDisplayName || 'YouTube User',
          authorUrl: topComment.authorChannelUrl || ''
        });
      }
    }
  } else if (body.id && (body.text || body.textDisplay)) {
    events.push({
      id: String(body.id),
      videoId: body.videoId || '',
      text: body.text || body.textDisplay || '',
      authorName: body.authorName || 'YouTube User',
      authorUrl: body.authorUrl || ''
    });
  }

  return events;
}
