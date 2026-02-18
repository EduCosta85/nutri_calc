# Firebase Setup Instructions

## Environment Variables

Create a file `frontend/.env.local` with your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy....................
VITE_FIREBASE_AUTH_DOMAIN=nutricalc-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nutricalc-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=nutricalc-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Click **</>** (Web app)
6. Copy the `firebaseConfig` object values

## Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable:
   - **Email/Password** - Enable both Sign up and Email link
   - **Google** - Enable and configure OAuth consent screen

## Enable Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select a region (e.g., us-central1)
4. Start in **Test mode** (or configure security rules later)

## Firestore Security Rules

When ready, update rules in Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/rawMaterials/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/recipes/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
