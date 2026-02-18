import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  signInWithGoogle,
  signInWithEmail as signInEmail,
  signUpWithEmail,
  logOut,
  resetPassword as resetPwd,
  type UserCredential,
} from "../services/auth";
import { auth } from "../firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async (): Promise<UserCredential> => {
    setError(null);
    try {
      return await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
      throw err;
    }
  };

  const handleSignInWithEmail = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    setError(null);
    try {
      return await signInEmail(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
      throw err;
    }
  };

  const handleSignUpWithEmail = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    setError(null);
    try {
      return await signUpWithEmail(email, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar conta";
      setError(message);
      throw err;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setError(null);
    try {
      await logOut();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao fazer logout";
      setError(message);
      throw err;
    }
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      await resetPwd(email);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao redefinir senha";
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
