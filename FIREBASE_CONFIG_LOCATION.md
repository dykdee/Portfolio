# Firebase Config Location

The Firebase credentials are stored in `adminscript.js`, keeping `admin.html` focused on markup only. Update that single file any time you rotate keys or switch projects.

## Update Steps

1. Open `adminscript.js`.
2. Locate the `firebaseConfig` object near the top of the file.
3. Replace each placeholder value with the corresponding value from **Project settings ▸ General ▸ Your apps ▸ Web app** in the Firebase Console.
4. Save the file and refresh `admin.html` in your browser.

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Verify the Change

1. Run `python3 -m http.server 8000` from the repo root.
2. Open `http://localhost:8000/admin.html`.
3. Sign up or sign in. If authentication succeeds and the dashboard loads, the config is correct.
4. If you see an error banner, open DevTools (F12) and inspect the console for missing/invalid config messages.

## Need Extra Help?

- Follow the complete walkthrough in [FIREBASE_SETUP.md](FIREBASE_SETUP.md).
- Use [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md) for the short version.
