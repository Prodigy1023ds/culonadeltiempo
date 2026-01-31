culonaxelmundo backend
=====================

This is a small Node/Express backend that aggregates posts containing a hashtag (e.g. `#culonaxelmundo`) from multiple social networks and exposes a unified JSON feed at `/feed`.

Important: Social networks' official APIs require developer accounts and access tokens. This repo provides provider modules and the wiring — you must obtain API credentials and set them in `.env` to enable each provider.

Providers implemented:
- Twitter (API v2 recent search) — requires `TWITTER_BEARER_TOKEN`
- Instagram (Graph API for Business accounts) — requires `IG_BUSINESS_ID` and `IG_ACCESS_TOKEN`
- Facebook (Page feed via Graph API) — requires `FB_PAGE_ID` and `FB_ACCESS_TOKEN`
- TikTok — placeholder (TikTok requires special integrations or third-party services; not implemented here)

Quick start
-----------

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` to `.env` and set your keys

3. Run server

```bash
npm start
# or for development with nodemon (install nodemon globally)
npm run dev
```

Endpoints
---------
- `GET /` — health check
- `GET /feed?tag=culonaxelmundo` — unified feed, returns array of normalized items

Unified item schema
-------------------
Each item returned by `/feed` has this shape:

```json
{
  "id": "twitter_123456",
  "type": "image", // or 'video' or 'text'
  "url": "https://...",
  "source": "twitter",
  "permalink": "https://...",
  "text": "...",
  "created": 1670000000000
}
```

Notes on providers
------------------
- Twitter: uses Recent Search v2 endpoint. The query filters out retweets and requests posts with images or videos. You need Elevated or Academic access depending on your usage.
- Instagram: the Graph API requires a Business or Creator account and a connected Facebook Page. You must use a long-lived access token.
- Facebook: fetches posts from a specified Page and filters messages for the hashtag.
- TikTok: no official simple public endpoint; consider using third-party aggregators or building a scraper (beware of TOS).

Security and deployment
-----------------------
- Keep your API keys secret — do not commit `.env`.
- Deploy on a server with HTTPS and proper rate-limiting.
- Consider adding a persistent cache (Redis) and background jobs for polling providers to avoid hitting API rate limits.

If you want, I can:
- Provide a working example for one provider with step-by-step instructions to obtain keys (e.g., Twitter),
- Or wire a simple Firebase-based storage so users can upload assets and have a global shared gallery.

Running with Docker
-------------------
You can run the backend inside Docker (no Node/npm installation needed locally).

1. Build the image from the project root:

```bash
docker build -t culonaxelmundo-backend .
```

2. Run the container using your `.env` file to provide credentials:

```bash
docker run --env-file .env -p 3000:3000 culonaxelmundo-backend
```

3. Verify the server is reachable:

```bash
curl http://localhost:3000/
curl "http://localhost:3000/feed?tag=culonaxelmundo"
```

Notes:
- The image respects `.dockerignore` so local `node_modules` and `.env` won't be copied into the image.
- For production, consider building with multi-stage Dockerfile and adding a process manager, logging, and persistent cache (Redis).
