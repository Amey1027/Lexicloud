// Simple auth store backed by our own Express + SQLite server.
// Replaces supabase.auth (sign up / sign in / session / sign out).

import { apiRequest, getToken, setToken, ApiError } from "./api";

export interface AppUser {
  id: string;
  email: string;
  role: string;
}

type Listener = (user: AppUser | null) => void;

let currentUser: AppUser | null = null;
let initialized = false;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener(currentUser));
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function onAuthChange(listener: Listener): () => void {
  listeners.add(listener);
  // Fire immediately with current known state (mirrors supabase's behavior
  // of calling back right away once a session is resolved).
  if (initialized) listener(currentUser);
  return () => listeners.delete(listener);
}

/** Resolves the current session by validating the stored token with the server. */
export async function getSession(): Promise<AppUser | null> {
  const token = getToken();
  if (!token) {
    currentUser = null;
    initialized = true;
    notify();
    return null;
  }

  try {
    const { user } = await apiRequest<{ user: AppUser }>("/api/auth/me");
    currentUser = user;
  } catch {
    setToken(null);
    currentUser = null;
  }
  initialized = true;
  notify();
  return currentUser;
}

export function getCurrentUser(): AppUser | null {
  return currentUser;
}

export async function signUp(email: string, password: string) {
  const { token, user } = await apiRequest<{ token: string; user: AppUser }>(
    "/api/auth/signup",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
  setToken(token);
  currentUser = user;
  notify();
  return user;
}

export async function signIn(email: string, password: string) {
  const { token, user } = await apiRequest<{ token: string; user: AppUser }>(
    "/api/auth/signin",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
  setToken(token);
  currentUser = user;
  notify();
  return user;
}

export function signOut() {
  setToken(null);
  currentUser = null;
  notify();
}

export { ApiError };
