import { createContext, ReactNode, useContext, useState } from "react";
import {
  getIdToken,
  signInWithEmail,
  signInWithGoogleNative,
  signOutFirebase,
} from "../services/firebase/auth";
import { loginWithFirebase } from "../services/api/auth.service";

type AuthUser = {
  id: number;
  firebase_uid: string;
  email: string;
  nome: string | null;
};

type AuthContextData = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  async function signIn(email: string, password: string) {
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);

      const idToken = await getIdToken();

      if (idToken == null) {
        throw new Error("Token do Firebase não encontrado!");
      }

      const user = await loginWithFirebase(idToken);

      setUser(user);
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true);

    try {
      await signInWithGoogleNative();

      const idToken = await getIdToken();

      if (idToken == null) {
        throw new Error("Token do Firebase não encontrado!");
      }

      const user = await loginWithFirebase(idToken);

      setUser(user);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);

    try {
      await signOutFirebase();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signIn,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
