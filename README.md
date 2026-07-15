# LexiCloud

LexiCloud is an AI-assisted legal drafting and compliance tool built with React, Vite, TypeScript, and Tailwind. It helps generate contracts, agreements, and notices, checks documents for compliance issues, suggests clauses, and keeps a history of generated documents.

This project is **fully self-hosted** - it is no longer connected to Lovable or Supabase. It has its own backend (in `/server`) using:

- **Express** for the API
- **SQLite** (via `better-sqlite3`) as the database - a single file, no external database service required
- **JWT-based authentication** with hashed passwords (`bcryptjs`), replacing Supabase Auth
- **Google Gemini** called directly for document generation, compliance checks, and clause suggestions (replacing the Lovable AI gateway)
- **Resend** (your own API key) for the "email document" feature

## Project structure

```
LexiCloud-main/
├── src/                # React frontend (Vite)
│   └── lib/
│       ├── api.ts        # low-level fetch client for the backend
│       ├── auth.ts       # sign up / sign in / session, talks to /api/auth
│       └── backend.ts    # templates, history, AI generation, email calls
├── server/             # Your own backend
│   ├── src/
│   │   ├── db.js          # SQLite schema + seed templates
│   │   ├── auth.js        # password hashing + JWT helpers
│   │   ├── routes/        # auth, templates, history, ai, email routes
│   │   └── index.js       # Express app entry point
│   └── data/               # lexicloud.sqlite lives here (created on first run)
└── ...
```

## Running it locally

### 1. Backend

```bash
cd server
cp .env.example .env
# edit .env: set JWT_SECRET, GEMINI_API_KEY, and (optionally) RESEND_API_KEY
npm install
npm run dev
```

The API starts on `http://localhost:4000` by default and creates `server/data/lexicloud.sqlite` automatically on first run, seeded with the same starter document templates the app shipped with.

You'll need:
- A **Gemini API key** from https://aistudio.google.com/apikey (for document generation, compliance checks, and clause suggestions)
- Optionally, a **Resend API key** from https://resend.com/api-keys (for emailing generated documents) - leave it unset to disable that feature

### 2. Frontend

```bash
cp .env.example .env   # sets VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

The app runs on `http://localhost:8080` and talks to the backend above.

## Deploying

- The frontend (`npm run build`) produces a static `dist/` folder you can host anywhere (Vercel, Netlify, static hosting, etc). Set `VITE_API_URL` to your deployed backend's URL at build time.
- The backend is a plain Node/Express app - deploy it anywhere that runs Node (a VPS, Render, Railway, Fly.io, etc). Make sure the `server/data` directory is on persistent storage, since that's where the SQLite database file lives.
