# Digitalshop frontend

## Local development

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_URL` to the backend URL, for example `http://localhost:8800`.
3. Add your social links in `.env` using the `VITE_*_URL` variables for YouTube, TikTok, Instagram, and Facebook.
4. Run `npm install`, then `npm run dev`.

## Vercel deployment

Deploy the `frontend` directory as a Vercel project with the Vite framework.
Set these environment variables for Production, Preview, and Development as needed:

```text
VITE_API_URL=https://your-backend.vercel.app
VITE_TELEGRAM_URL=https://t.me/mgsawshop
VITE_YOUTUBE_URL=https://www.youtube.com/
VITE_TIKTOK_URL=https://www.tiktok.com/
VITE_INSTAGRAM_URL=https://www.instagram.com/
VITE_FACEBOOK_URL=https://www.facebook.com/
```

Vite embeds this variable at build time, so redeploy after changing it. The
backend must allow the deployed frontend origin through `FRONTEND_URLS`.

## Checks

```bash
npm run lint
npm run build
```
