# Firebase Authentication Implementation Guide

## Overview

This project now includes a **fake Firebase Authentication** system that simulates the Firebase Auth API. This educational implementation demonstrates how Firebase authentication works without requiring a real Firebase project.

---

## 🔥 What's Included

### New Files

1. **`src/lib/fakeFirebase.ts`** - Complete Firebase Auth simulation
2. **`src/pages/AuthPage.tsx`** - Modern sign-up/sign-in UI

### Modified Files

1. **`src/lib/mockApi.ts`** - Added `createUser()` function
2. **`src/App.tsx`** - Integrated Firebase auth flow
3. **`README.md`** - Updated documentation

---

## 🚀 Features

### Authentication Methods

- ✅ **Sign Up with Email/Password** - Create new accounts with role selection
- ✅ **Sign In with Email/Password** - Authenticate existing users
- ✅ **Sign Out** - Clear session and return to auth page
- ✅ **Password Reset** - Simulated email sending
- ✅ **Session Persistence** - Stay logged in across page refreshes
- ✅ **Profile Updates** - Update display name and photo URL
- ✅ **Account Deletion** - Delete user accounts

### Security Features (Simulated)

- Password validation (min 6 characters)
- Email format validation
- Duplicate email prevention
- Password hashing (fake, for educational purposes)
- JWT-like token generation
- Session management via localStorage

---

## 📦 API Reference

### Sign Up

```typescript
import { signUpWithEmailAndPassword } from "./lib/fakeFirebase";

const result = await signUpWithEmailAndPassword({
  email: "user@example.com",
  password: "password123",
  displayName: "John Doe",
  role: "STUDENT", // or "TEACHER"
});

console.log(result.user); // FirebaseUser object
console.log(result.token); // Auth token
console.log(result.role); // User role
```

### Sign In

```typescript
import { signInWithEmailAndPassword } from "./lib/fakeFirebase";

const result = await signInWithEmailAndPassword(
  "user@example.com",
  "password123"
);

console.log(result.user); // FirebaseUser object
console.log(result.token); // Auth token
console.log(result.role); // User role
```

### Sign Out

```typescript
import { signOut } from "./lib/fakeFirebase";

await signOut();
// User session cleared
```

### Get Current User

```typescript
import { getCurrentAuthUser } from "./lib/fakeFirebase";

const authUser = getCurrentAuthUser();
if (authUser) {
  console.log(authUser.user); // FirebaseUser
  console.log(authUser.role); // User role
}
```

### Check Authentication

```typescript
import { isAuthenticated } from "./lib/fakeFirebase";

if (isAuthenticated()) {
  console.log("User is logged in");
}
```

### Password Reset

```typescript
import { sendPasswordResetEmail } from "./lib/fakeFirebase";

await sendPasswordResetEmail("user@example.com");
// Simulated email sent
```

### Update Profile

```typescript
import { updateUserProfile } from "./lib/fakeFirebase";

await updateUserProfile({
  displayName: "Jane Doe",
  photoURL: "https://example.com/photo.jpg",
});
```

### Delete Account

```typescript
import { deleteUserAccount } from "./lib/fakeFirebase";

await deleteUserAccount();
// User account deleted and signed out
```

---

## 🎨 User Interface

### Sign In Form

- Email input
- Password input (min 6 chars)
- "Forgot password?" link
- "Sign up" link for new users
- Demo account credentials displayed

### Sign Up Form

- Role selection (Student/Teacher) with visual buttons
- Full name input
- Email input
- Phone input (optional)
- Password input with requirements
- Confirm password input
- "Sign in" link for existing users

### Password Reset Form

- Email input
- Success message on submission
- Back to sign-in link

---

## 💾 Data Storage

### localStorage Keys

| Key                     | Description                   |
| ----------------------- | ----------------------------- |
| `firebase_auth_users`   | Array of registered users     |
| `firebase_current_user` | Current authenticated user    |
| `firebase_auth_token`   | Current auth token (fake JWT) |

### Data Structure

**StoredAuthUser:**

```typescript
{
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
  passwordHash: string; // Fake hash
  role: "STUDENT" | "TEACHER";
}
```

**FirebaseUser (Public):**

```typescript
{
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
}
```

---

## 🧪 Demo Accounts

Pre-seeded accounts for testing:

| Email            | Password    | Role    |
| ---------------- | ----------- | ------- |
| student@demo.com | password123 | Student |
| teacher@demo.com | password123 | Teacher |

These accounts are automatically created on first app load via `seedDemoAccounts()`.

---

## 🔒 Security Notes

### ⚠️ Educational Purposes Only

This implementation is **NOT secure** for production use:

1. **Client-Side Only** - No server validation
2. **Fake Hashing** - Passwords are reversibly "hashed" (just reversed with prefix/suffix)
3. **localStorage Tokens** - Tokens stored in plain text in browser
4. **No Rate Limiting** - Vulnerable to brute force
5. **No HTTPS Required** - Traffic not encrypted
6. **No Email Verification** - Emails not actually sent
7. **No 2FA** - Two-factor authentication not implemented

### 🎓 Learning Objectives

This implementation demonstrates:

- ✅ Authentication flow patterns
- ✅ Form validation and error handling
- ✅ Session management concepts
- ✅ Password reset workflows
- ✅ Role-based access control
- ✅ Token-based authentication (conceptually)

### 🚀 Production Migration

For real applications, use:

- **Real Firebase SDK**: `npm install firebase`
- **Firebase Console**: Create project at [firebase.google.com](https://firebase.google.com)
- **Environment Variables**: Store API keys securely
- **Server-Side Validation**: Verify tokens on backend
- **Email Provider**: Configure SendGrid, AWS SES, etc.

---

## 🔄 Migration to Real Firebase

### Step 1: Install Firebase SDK

```bash
npm install firebase
```

### Step 2: Configure Firebase

```typescript
// src/lib/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Step 3: Replace Fake Auth Calls

```typescript
// Before (Fake)
import { signInWithEmailAndPassword } from "./lib/fakeFirebase";
await signInWithEmailAndPassword(email, password);

// After (Real Firebase)
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebaseConfig";
await signInWithEmailAndPassword(auth, email, password);
```

### Step 4: Update Environment Variables

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## 🎯 Testing Checklist

- [ ] Sign up with new email creates account
- [ ] Sign up with existing email shows error
- [ ] Sign in with correct credentials works
- [ ] Sign in with wrong password shows error
- [ ] Session persists after page refresh
- [ ] Sign out clears session
- [ ] Password reset shows success message
- [ ] Role selection (Student/Teacher) works
- [ ] Student role shows Dashboard
- [ ] Teacher role shows TeacherSchedule
- [ ] Form validation shows errors correctly
- [ ] Loading states display properly

---

## 📚 Additional Resources

### Real Firebase Documentation

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Web Authentication Guide](https://firebase.google.com/docs/auth/web/start)
- [Managing Users](https://firebase.google.com/docs/auth/web/manage-users)

### Code Examples

- [Firebase Auth Samples](https://github.com/firebase/quickstart-js/tree/master/auth)
- [React Firebase Tutorial](https://fireship.io/lessons/react-firebase-chat-tutorial/)

---

## 🐛 Troubleshooting

### Issue: "Email already in use"

**Solution:** The email is already registered. Use sign-in instead or choose a different email.

### Issue: Session not persisting

**Solution:** Check browser localStorage settings. Private/incognito mode may clear storage.

### Issue: Password reset doesn't send email

**Expected:** This is simulated only. Real Firebase requires email provider configuration.

### Issue: Can't see registered users

**Debug:**

```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem("firebase_auth_users")));
```

### Issue: Want to reset all data

**Solution:**

```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

## 🎓 Educational Value

This implementation teaches:

1. **Authentication Patterns** - How sign-up/sign-in flows work
2. **Form Handling** - Validation, error states, loading states
3. **Session Management** - Persistent login across refreshes
4. **Role-Based Access** - Different UIs for different user types
5. **Security Concepts** - Password hashing, tokens, validation
6. **UX Best Practices** - Clear error messages, loading indicators
7. **React Patterns** - State management, conditional rendering

---

## 📝 License

Same as parent project (MIT License). For educational purposes only.

---

**Built with ❤️ for learning Firebase Authentication patterns**
