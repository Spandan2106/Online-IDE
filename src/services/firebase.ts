import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// In-Memory token storage (Security requirement: NEVER store in localStorage or sessionStorage)
let inMemoryAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;

const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
  'openid',
  'email',
  'profile',
];

export async function signInWithGoogle(): Promise<{ user: User; accessToken: string }> {
  const provider = new GoogleAuthProvider();
  SCOPES.forEach((scope) => provider.addScope(scope));
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;

  if (token) {
    inMemoryAccessToken = token;
    // Set 55 minutes expiration estimate
    tokenExpiresAt = Date.now() + 55 * 60 * 1000;
  }

  return {
    user: result.user,
    accessToken: inMemoryAccessToken || '',
  };
}

export async function signOutGoogle(): Promise<void> {
  inMemoryAccessToken = null;
  tokenExpiresAt = null;
  await signOut(auth);
}

export const signOutUser = signOutGoogle;

export function getCachedAccessToken(): string | null {
  if (inMemoryAccessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return inMemoryAccessToken;
  }
  return inMemoryAccessToken; // return current cached token if valid
}

export const getGoogleAccessToken = getCachedAccessToken;

export function setCachedAccessToken(token: string) {
  inMemoryAccessToken = token;
  tokenExpiresAt = Date.now() + 55 * 60 * 1000;
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export const listenToAuthChanges = subscribeToAuth;
