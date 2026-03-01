# Admin Panel Guide

This document captures how the Firebase-backed admin console is organized, how data moves through the system, and what to maintain after the initial setup.

## Architecture

| Layer | Description |
|-------|-------------|
| UI | `admin.html` renders the form, post grid, alerts, and modal components styled via `styles.css`. |
| Logic | `adminscript.js` owns Firebase initialization, auth listeners, CRUD helpers, and DOM bindings. |
| Data | Firebase Authentication (Email/Password) plus Realtime Database with a `users/{uid}/posts/{postId}` tree. |

### Data Model

```json
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "category": "tutorials|projects|tips",
  "tags": ["string"],
  "author": "string",
  "date": "YYYY-MM-DD",
  "image": "https://...",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "status": "published|scheduled",
  "publishAt": "ISO timestamp",
  "publishedAt": "ISO timestamp"
}
```

Security rules limit read/write access to the authenticated user’s `uid` and enforce the required fields above.

## Feature Inventory

- Email/Password sign up, sign in, and sign out (Firebase Auth)
- Sticky post composer with validation, tag chips, slug generation, and featured image URL field
- Real-time post list with edit/delete actions and count badge
- Delete confirmation modal with backdrop blur
- Responsive layout (two-column on desktop, single column on tablet/mobile)
- Alert system for success/error feedback

## Setup Snapshot

1. Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to create the Firebase project and database rules.
2. Paste the config into `adminscript.js` as explained in [FIREBASE_CONFIG_LOCATION.md](FIREBASE_CONFIG_LOCATION.md).
3. Serve the site locally and run through the [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md) checklist.

## Operational Workflow

1. **Authenticate** – Sign in via Email/Password. The header shows the user avatar (first letter) plus email.
2. **Create/Update** – Fill the form, manage tags with Enter/backspace, and click the primary CTA. The UI swaps to “Update Post” during edits.
3. **Delete** – Use the delete button, confirm the modal, and watch for the toast message.
4. **Sync** – Realtime listeners ensure the grid mirrors Firebase instantly for the signed-in user.
5. **Sign Out** – Use the header button to tear down listeners and return to the auth view.

## Maintenance Checklist

- Rotate Firebase credentials when needed by updating `adminscript.js`.
- Review database security rules before moving out of Test mode.
- Periodically export the Realtime Database from the Firebase Console for backups.
- Monitor Authentication ▸ Users to prune stale accounts if desired.
- Keep an eye on the Firebase status dashboard for outages affecting auth or database traffic.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| “Firebase: Error (auth/invalid-api-key)” | A config field is blank or belongs to another project. Re-copy from Project settings. |
| Posts fail to save with `PERMISSION_DENIED` | Database rules were not deployed or the DB is still locked down. Apply the rules from FIREBASE_SETUP. |
| Dashboard never appears after login | Check DevTools console for network errors; ensure Realtime Database is enabled in the same region. |
| Modal won’t close | Ensure no custom CSS overrides `.modal` or `.active` classes—compare against `styles.css`. |

## Related Docs

- [ADMIN_IMPROVEMENTS.md](ADMIN_IMPROVEMENTS.md) for release history and feature roadmap
- [ADMIN_QUICK_START.md](ADMIN_QUICK_START.md) for a condensed onboarding script
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for color, typography, and component specs

**Last updated:** February 12, 2026
