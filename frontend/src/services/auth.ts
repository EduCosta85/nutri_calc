import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "../firebase/config";

export type { UserCredential };

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google — tries popup first, falls back to redirect.
 * Popup fails on many mobile browsers and some hosted environments.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    // Popup blocked or unavailable — fall back to redirect
    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, googleProvider);
      // After redirect, the page reloads and getRedirectResult picks it up
      // Return a never-resolving promise since we're redirecting
      return new Promise(() => {});
    }
    throw error;
  }
}

/**
 * Check for redirect result on page load.
 * Must be called once when the app initializes.
 */
export async function checkRedirectResult(): Promise<UserCredential | null> {
  try {
    return await getRedirectResult(auth);
  } catch {
    return null;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user
 */
export async function logOut(): Promise<void> {
  return signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Auth error codes mapping for user-friendly messages
 */
export const AUTH_ERRORS = {
  "auth/email-already-in-use": "Este email ja esta em uso",
  "auth/invalid-email": "Email invalido",
  "auth/operation-not-allowed": "Operacao nao permitida",
  "auth/weak-password": "Senha muito fraca (minimo 6 caracteres)",
  "auth/user-disabled": "Usuario desabilitado",
  "auth/user-not-found": "Usuario nao encontrado",
  "auth/wrong-password": "Senha incorreta",
  "auth/invalid-credential": "Email ou senha incorretos",
  "auth/popup-closed-by-user": "Login cancelado",
  "auth/popup-blocked": "Popup bloqueado — tentando redirecionamento...",
  "auth/account-exists-with-different-credential":
    "Conta existe com credencial diferente",
  "auth/network-request-failed": "Erro de conexao — verifique sua internet",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERRORS;

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(errorCode: string): string {
  return AUTH_ERRORS[errorCode as AuthErrorCode] || "Erro desconhecido";
}
