# Dee Portfolio Platform

React + Vite portfolio site with a Firebase-backed blog/admin and a Gemini-powered portfolio assistant.

## Quick Start

```bash
npm install
npm run dev
```

Default local ports:
- Frontend (Vite): `http://localhost:8000`
- Backend (Express): `http://localhost:4001`

## System Overview

This repository is split into clear layers:

1. `src/`:
- React UI layer for portfolio, blog, admin, and chatbot panel.

2. `server.js`:
- Express runtime layer for static hosting, Firebase config delivery, uploads, and chatbot orchestration APIs.

3. `chatbot/`:
- Chatbot product layer (architecture, prompts, knowledge, schemas, API contract notes, UI behavior docs).

4. `media/`:
- Static media assets (images, PDFs, certificates, etc.).

5. `.github/workflows/`:
- CI and deployment automation.

## Project Parts (What Each Area Does)

| Path | Responsibility |
|---|---|
| `src/main.jsx` | React app bootstrap and router mount |
| `src/App.jsx` | Route table (`/`, `/home`, `/blog`, `/admin`) |
| `src/Pages/Portfolio/` | Main portfolio page composition |
| `src/Pages/Hero/` | Hero section + animated background presentation |
| `src/Pages/About/` | Bio/positioning content section |
| `src/Pages/Credentials/` | Credential/certification rendering + modal view |
| `src/Pages/Projects/` | Featured projects carousel and project links |
| `src/Pages/Skills/` | Skills and tools presentation |
| `src/Pages/Contact/` | Contact links and form UI |
| `src/Pages/Footer/` | Footer links and identity |
| `src/Pages/Blog/` | Public blog feed and post modal rendering |
| `src/Pages/Admin/` | Admin auth, dashboard, content management, secret rotation UI |
| `src/Components/Navbar/` | Main site navigation |
| `src/Components/Chatbot/` | Chatbot UI adapter (session bootstrap, message send, actions, citations) |
| `src/contexts/AuthContext.jsx` | Firebase auth state/provider |
| `src/hooks/useBlogPosts.js` | Realtime data hooks for posts, projects, credentials |
| `src/utils/blogUtils.js` | Blog normalization/filtering/date helpers |
| `src/utils/scrollToSection.js` | Shared smooth-scroll helper |
| `src/firebase.js` | Firebase client initialization |
| `server.js` | API server, upload endpoint, chatbot orchestration, static host |
| `chatbot/prompts/` | Externalized chatbot prompt layers |
| `chatbot/knowledge/` | Grounding data used for retrieval |
| `chatbot/api/contract.md` | Chatbot endpoint/request-response contract |
| `chatbot/ui/` | UI state vocabulary and structured message guidance |
| `chatbot/schemas/` | Response/citation/session schema drafts |
| `.github/workflows/ci.yml` | Lint + smoke test + build checks |
| `.github/workflows/deploy-vercel.yml` | Vercel preview/production deployments |

## Chatbot Runtime (Current)

Implemented:
- `POST /api/chatbot/session`
- `POST /api/chatbot/message`
- `POST /api/chatbot/summarize`
- `GET /api/chatbot/config/status`

Behavior:
- Server-side Gemini call and fallback behavior
- Prompt layering from `chatbot/prompts/*.md`
- Retrieval grounding from `chatbot/knowledge/portfolio-profile.json`
- In-memory session context (`recentTurns`, rolling summary, pinned facts)
- Structured UI responses (`summary`, `sections`, `citations`, `suggestedActions`, `meta`)

## Environment Variables

Required (core app):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Required (chatbot generation):
- `GEMINI_API_KEY`

Required (uploads):
- `BLOB_READ_WRITE_TOKEN`

Optional (admin/server features):
- `FIREBASE_SERVICE_ACCOUNT`
- `ADMIN_SECRETS_KEY`
- `ADMIN_UIDS`

## Scripts

- `npm run dev`: run frontend + backend concurrently
- `npm run dev:client`: run Vite only
- `npm run dev:server`: run Express only
- `npm run lint`: TypeScript no-emit checks
- `npm test`: runtime smoke test script
- `npm run build`: production build to `dist/`
- `npm start`: run Express server

## CI/CD

- CI: `.github/workflows/ci.yml`
- Deploy: `.github/workflows/deploy-vercel.yml`

Expected deploy secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Notes

- The chatbot session memory is runtime in-memory and resets on server restart.
- `docs/` and zip-derived standalone admin-console artifacts were removed during cleanup.
