# Firebase Config Location

The Firebase web config is stored in `.env` and exposed to the browser by `server.js` at `/firebase-config.js`.

## Update Steps

1. Copy `.env.example` to `.env` in the project root.
2. Fill each `FIREBASE_*` value from **Project settings ▸ General ▸ Your apps ▸ Web app** in the Firebase Console.
3. Start the app server with `npm start`.
4. Refresh `admin.html` in your browser.

```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_DATABASE_URL=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
```

## Verify the Change

1. Run `npm start` from the repo root.
2. Open `http://localhost:4001/admin.html`.
3. Sign up or sign in. If authentication succeeds and the dashboard loads, the config is correct.
4. If you see an error banner, open DevTools (F12) and inspect the console for missing/invalid config messages.

## Need Extra Help?

- Follow the complete walkthrough in [FIREBASE_SETUP.md](FIREBASE_SETUP.md).
- Use [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md) for the short version.
