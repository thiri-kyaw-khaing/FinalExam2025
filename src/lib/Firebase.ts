// ==================== FAKE FIREBASE AUTH ====================
// This simulates Firebase Authentication API for educational purposes
// In production, use the real Firebase SDK: firebase.google.com

import { uid } from "../utils/helpers";

// ==================== TYPES ====================

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface FirebaseAuthCredentials {
  email: string;
  password: string;
  displayName?: string;
  role?: "STUDENT" | "TEACHER";
}

interface StoredAuthUser extends FirebaseUser {
  passwordHash: string; // In real Firebase, this is server-side only
  role: "STUDENT" | "TEACHER";
}

// ==================== CONSTANTS ====================

const STORAGE_KEYS = {
  AUTH_USERS: "firebase_auth_users",
  CURRENT_AUTH_USER: "firebase_current_user",
  AUTH_TOKEN: "firebase_auth_token",
};

const NETWORK_DELAY_MS = { min: 400, max: 800 };

// ==================== UTILITY FUNCTIONS ====================

function simulateNetworkDelay(): Promise<void> {
  const delay =
    Math.random() * (NETWORK_DELAY_MS.max - NETWORK_DELAY_MS.min) +
    NETWORK_DELAY_MS.min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function getAuthUsers(): StoredAuthUser[] {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
  return data ? JSON.parse(data) : [];
}

function saveAuthUsers(users: StoredAuthUser[]): void {
  localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
}

function hashPassword(password: string): string {
  // FAKE hashing - just reverse and add prefix
  // Real Firebase uses bcrypt/scrypt server-side
  return `HASH_${password.split("").reverse().join("")}_SALT`;
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function generateAuthToken(userId: string): string {
  // Fake JWT token
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      uid: userId,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })
  );
  const signature = btoa(`fake_signature_${userId}`);
  return `${header}.${payload}.${signature}`;
}

function mapToPublicUser(user: StoredAuthUser): FirebaseUser {
  const { passwordHash, role, ...publicUser } = user;
  return publicUser;
}

// ==================== FIREBASE AUTH API ====================

/**
 * Create account with email and password
 * Simulates: firebase.auth().createUserWithEmailAndPassword()
 */
export async function signUpWithEmailAndPassword(
  credentials: FirebaseAuthCredentials
): Promise<{ user: FirebaseUser; token: string; role: "STUDENT" | "TEACHER" }> {
  console.log(
    `🔥 Firebase Auth: createUserWithEmailAndPassword(${credentials.email})`
  );
  await simulateNetworkDelay();

  const { email, password, displayName, role } = credentials;

  // Validation
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  if (!role) {
    throw new Error("Role (STUDENT or TEACHER) is required");
  }

  const users = getAuthUsers();

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    throw new Error("Email already in use");
  }

  // Create new user
  const newUser: StoredAuthUser = {
    uid: uid(),
    email,
    displayName: displayName || email.split("@")[0],
    photoURL: null,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
    role,
  };

  users.push(newUser);
  saveAuthUsers(users);

  // Generate auth token
  const token = generateAuthToken(newUser.uid);
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

  const publicUser = mapToPublicUser(newUser);
  const authData = {
    user: publicUser,
    role: newUser.role,
  };
  localStorage.setItem(
    STORAGE_KEYS.CURRENT_AUTH_USER,
    JSON.stringify(authData)
  );

  console.log(`✅ Firebase Auth: User created successfully`, publicUser);

  return { user: publicUser, token, role: newUser.role };
}

/**
 * Sign in with email and password
 * Simulates: firebase.auth().signInWithEmailAndPassword()
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<{ user: FirebaseUser; token: string; role: "STUDENT" | "TEACHER" }> {
  console.log(`🔥 Firebase Auth: signInWithEmailAndPassword(${email})`);
  await simulateNetworkDelay();

  // Validation
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const users = getAuthUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    throw new Error("User not found");
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid password");
  }

  // Generate auth token
  const token = generateAuthToken(user.uid);
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

  const publicUser = mapToPublicUser(user);
  const authData = {
    user: publicUser,
    role: user.role,
  };
  localStorage.setItem(
    STORAGE_KEYS.CURRENT_AUTH_USER,
    JSON.stringify(authData)
  );

  console.log(`✅ Firebase Auth: Sign in successful`, publicUser);

  return { user: publicUser, token, role: user.role };
}

/**
 * Sign out current user
 * Simulates: firebase.auth().signOut()
 */
export async function signOut(): Promise<void> {
  console.log(`🔥 Firebase Auth: signOut()`);
  await simulateNetworkDelay();

  localStorage.removeItem(STORAGE_KEYS.CURRENT_AUTH_USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

  console.log(`✅ Firebase Auth: Sign out successful`);
}

/**
 * Get current authenticated user
 * Simulates: firebase.auth().currentUser
 */
export function getCurrentAuthUser(): {
  user: FirebaseUser;
  role: "STUDENT" | "TEACHER";
} | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_AUTH_USER);
    if (!data) return null;

    const parsed = JSON.parse(data);

    // Validate the structure
    if (!parsed || !parsed.user || !parsed.user.uid || !parsed.role) {
      console.warn("⚠️ Invalid auth data found, clearing...");
      localStorage.removeItem(STORAGE_KEYS.CURRENT_AUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("❌ Error reading auth user:", error);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const user = getCurrentAuthUser();
  return !!(token && user);
}

/**
 * Send password reset email (fake)
 * Simulates: firebase.auth().sendPasswordResetEmail()
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  console.log(`🔥 Firebase Auth: sendPasswordResetEmail(${email})`);
  await simulateNetworkDelay();

  const users = getAuthUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    // Firebase doesn't reveal if email exists for security
    console.log(`⚠️ Email not found, but response is success (security)`);
  }

  console.log(
    `✅ Firebase Auth: Password reset email sent (simulated) to ${email}`
  );
}

/**
 * Update user profile
 * Simulates: user.updateProfile()
 */
export async function updateUserProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  console.log(`🔥 Firebase Auth: updateProfile()`, updates);
  await simulateNetworkDelay();

  const currentUser = getCurrentAuthUser();
  if (!currentUser) {
    throw new Error("No user is currently signed in");
  }

  const users = getAuthUsers();
  const userIndex = users.findIndex((u) => u.uid === currentUser.user.uid);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  // Update user
  if (updates.displayName !== undefined) {
    users[userIndex].displayName = updates.displayName;
  }
  if (updates.photoURL !== undefined) {
    users[userIndex].photoURL = updates.photoURL;
  }

  saveAuthUsers(users);

  // Update current user in storage
  const updatedPublicUser = mapToPublicUser(users[userIndex]);
  localStorage.setItem(
    STORAGE_KEYS.CURRENT_AUTH_USER,
    JSON.stringify({ ...updatedPublicUser, role: users[userIndex].role })
  );

  console.log(`✅ Firebase Auth: Profile updated`, updatedPublicUser);
}

/**
 * Delete current user account
 * Simulates: user.delete()
 */
export async function deleteUserAccount(): Promise<void> {
  console.log(`🔥 Firebase Auth: deleteUser()`);
  await simulateNetworkDelay();

  const currentUser = getCurrentAuthUser();
  if (!currentUser) {
    throw new Error("No user is currently signed in");
  }

  const users = getAuthUsers();
  const filteredUsers = users.filter((u) => u.uid !== currentUser.user.uid);
  saveAuthUsers(filteredUsers);

  // Clear session
  await signOut();

  console.log(`✅ Firebase Auth: User account deleted`);
}

// ==================== SEED DEMO ACCOUNTS ====================

/**
 * Create demo accounts for testing (call on first load)
 */
export function seedDemoAccounts(): void {
  const users = getAuthUsers();

  if (users.length > 0) {
    console.log(`ℹ️ Demo accounts already exist, skipping seed`);
    return;
  }

  console.log(`🌱 Seeding demo Firebase Auth accounts...`);

  const demoAccounts: StoredAuthUser[] = [
    {
      uid: "firebase_" + uid(),
      email: "student@demo.com",
      displayName: "Demo Student",
      photoURL: null,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword("password123"),
      role: "STUDENT",
    },
    {
      uid: "firebase_" + uid(),
      email: "teacher@demo.com",
      displayName: "Demo Teacher",
      photoURL: null,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword("password123"),
      role: "TEACHER",
    },
  ];

  saveAuthUsers(demoAccounts);
  console.log(
    `✅ Demo accounts created:`,
    demoAccounts.map((u) => u.email)
  );
  console.log(`🔑 Default password for all demo accounts: password123`);
}
