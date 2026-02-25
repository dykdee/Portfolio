# Admin Panel Quick Start

Need the shortest path from zero to a working dashboard? Follow the steps below and reference the linked docs if you get stuck.

## TL;DR

1. **Create** a Firebase project and web app (Console ▸ Add project ▸ Web `</>` app).
2. **Enable** Email/Password auth plus a Realtime Database in Test mode.
3. **Paste** the config into `adminscript.js` (see [FIREBASE_CONFIG_LOCATION.md](FIREBASE_CONFIG_LOCATION.md)).
4. **Serve** the site locally: `python3 -m http.server 8000`.
5. **Visit** `http://localhost:8000/admin.html`, sign up, and publish a post.

## Step-by-step

### 1. Firebase Project (5 minutes)
- Console ▸ Add project → name it → disable Analytics if not needed.
- Within Project settings ▸ General, register a Web app to reveal the config object.

### 2. Enable Services
- Build ▸ Authentication ▸ Get started → enable Email/Password.
- Build ▸ Realtime Database ▸ Create Database → choose region → start in Test mode → paste the rules from [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

### 3. Wire the Config
- Open `adminscript.js` and replace every field in `firebaseConfig` with the values from the console.
- Save the file—`admin.html` now loads Firebase through that script tag.

### 4. Run Locally
```bash
cd /home/dee/Projects/dee
python3 -m http.server 8000
```

Visit `http://localhost:8000/admin.html`, create an account, and start adding posts. The UI will confirm each action with the alert banner.

## Post-setup Checklist

- [ ] Authentication works (sign up, sign in, sign out).
- [ ] Posts save, update, and delete for the signed-in user.
- [ ] Tags can be added/removed with the chip UI.
- [ ] Realtime Database shows data under `users/{uid}/posts`.
- [ ] Security rules deny access for anonymous users (test by signing out and reloading the admin page).

## Need More Detail?

- Full walkthrough: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- Architecture overview: [README_ADMIN.md](README_ADMIN.md)
- Release notes and roadmap: [ADMIN_IMPROVEMENTS.md](ADMIN_IMPROVEMENTS.md)
