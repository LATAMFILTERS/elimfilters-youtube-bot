# ELIMFILTERS YouTube Bot

Official YouTube AI Technical Assistant for ELIMFILTERS Channel.

## Configuration Environment Variables

- `PORT`: Server port (default 10000)
- `YOUTUBE_CHANNEL_ID`: YouTube Channel ID
- `YOUTUBE_API_KEY`: YouTube Data API v3 Key
- `DATABASE_URL`: PostgreSQL connection string (shared with `elimfilters-instagram-db`)
- `NVIDIA_NIM_API_KEY`: NVIDIA NIM API Key for AI responses
- `NVIDIA_MODEL`: Model name (`nvidia/nemotron-3-super-120b-a12b`)
- `DRY_RUN`: `true` to generate draft responses in database without posting directly

## Endpoints

- `GET /health` - Health check and status
- `GET /privacy` - Privacy policy
- `GET /terms` - Terms of service
- `GET /review-drafts` - Review generated AI drafts in DRY_RUN mode
- `GET /webhook` - YouTube Webhook verification
- `POST /webhook` - YouTube Webhook event handler
