# Firebase Setup Guide (Admin Panel)

Use this guide to connect the Admin panel to a brand-new Firebase project. Every step references the exact navigation in the Firebase Console so you can move from an empty project to a tested admin panel without guessing.

## Prerequisites

- A Google account with access to [Firebase Console](https://console.firebase.google.com/)
- Basic familiarity with editing local files in this repository
- Node.js (for running the local app server)

## 1. Create a Firebase Project

1. Visit the Firebase Console and click **Add project**.
2. Provide a project name (for example, `dee-blog-admin`).
3. Disable Google Analytics unless you specifically need it for this project.
4. Click **Create project** and wait for provisioning to finish.

## 2. Register the Web App

1. Inside your new project, open **Project Overview ▸ Get started by adding Firebase to your app**.
2. Choose the **Web (`</>`)** option and give the app a friendly nickname (for example, `Admin Panel`).
3. Leave Hosting unchecked for now and click **Register app**.
4. Copy the generated config values—you will add them to `.env` shortly.

## 3. Add Credentials to `.env`

1. Copy `.env.example` to `.env` in the repo root.
2. Replace the placeholder values with the Firebase config values from the console.
3. Save `.env`. The server now exposes these values to the frontend through `/firebase-config.js`.

```env
FIREBASE_API_KEY=YOUR_API_KEY
FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
FIREBASE_DATABASE_URL=YOUR_DATABASE_URL
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
FIREBASE_APP_ID=YOUR_APP_ID
FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

## 4. Enable Email/Password Authentication

1. Console path: **Build ▸ Authentication ▸ Get Started**.
2. Open the **Sign-in method** tab.
3. Enable **Email/Password** and click **Save**.
4. (Optional) In **Authentication ▸ Settings ▸ Authorized domains**, add `localhost` so local development works without warnings.

## 5. Create the Realtime Database

1. Console path: **Build ▸ Realtime Database ▸ Create database**.
2. Choose the same region you selected for the project.
3. For development, start in **Test mode** so you can read/write immediately.
4. After the instance is created, switch to the **Rules** tab.

### Recommended Rules (per-user isolation)

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "posts": {
          "$postId": {
            ".validate": "newData.hasChildren(['title', 'excerpt', 'content', 'category', 'date', 'author', 'slug', 'createdAt', 'updatedAt', 'status'])"
          }
        }
      }
    },
    "blogPosts": {
      ".read": true,
      "$postId": {
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['title', 'excerpt', 'content', 'category', 'date', 'author', 'slug', 'createdAt', 'updatedAt', 'status'])"
      }
    }
  }
}
```

These rules keep every user’s posts isolated and ensure every post carries the required fields.

## 6. Run the Admin Panel Locally

```bash
cd /home/dee/Projects/dee
npm start
```

Visit `http://localhost:4001/admin.html` and you should see the auth screen.

1. Click **Sign Up** to create your first admin user (Email/Password is the only enabled provider).
2. Sign in with that account.
3. Create a test post and confirm it shows up instantly in the list.

## 7. Verify Data in Firebase

1. Console path: **Build ▸ Realtime Database ▸ Data**.
2. Expand `users ▸ {your-user-uid} ▸ posts` and confirm the test post landed correctly.
3. You should see a structure similar to:

```
users/
  {uid}/
    posts/
      {postId}/
        title
        slug
        excerpt
        content
        category
        tags
        author
        date
        image
        createdAt
        updatedAt
```

## Troubleshooting Checklist

- **Auth errors**: Verify Email/Password is enabled and the password is at least six characters.
- **Missing config warning**: Ensure every `FIREBASE_*` variable in `.env` is populated (especially `FIREBASE_DATABASE_URL`).
- **Writes denied**: Double-check that you created the database in Test mode or that you applied the rules above.
- **CORS warnings**: Add `localhost` (or your deployed origin) to Authentication ▸ Settings ▸ Authorized domains.

## Reference Docs

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Realtime Database Docs](https://firebase.google.com/docs/database)
- [Security Rules Guide](https://firebase.google.com/docs/database/security)
- [Firebase CLI & Hosting](https://firebase.google.com/docs/cli)
