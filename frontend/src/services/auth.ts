import {
  signInWithPopup,
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
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
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
  "auth/email-already-in-use": "Este email já está em uso",
  "auth/invalid-email": "Email inválido",
  "auth/operation-not-allowed": "Operação não permitida",
  "auth/weak-password": "Senha muito fraca",
  "auth/user-disabled": "Usuário desabilitado",
  "auth/user-not-found": "Usuário não encontrado",
  "auth/wrong-password": "Senha incorreta",
  "auth/invalid-credential": "Credenciais inválidas",
  "auth/popup-closed-by-user": "Popup fechado pelo usuário",
  "auth/account-exists-with-different-credential":
    "Conta existe com credencial diferente",
  "auth/network-request-failed": "Erro de conexão",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERRORS;

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(errorCode: string): string {
  return AUTH_ERRORS[errorCode as AuthErrorCode] || "Erro desconhecido";
}
