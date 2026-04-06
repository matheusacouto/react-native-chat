import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import { Alert } from "react-native";
import { router } from "@/src/navigation/router";
import {
  getIdToken,
  getUserIdToken,
  onFirebaseAuthStateChanged,
  signInWithEmail,
  signInWithGoogleNative,
  signOutFirebase,
} from "../services/firebase/auth";
import { loginWithFirebase } from "../services/api/auth.service";
import {
  clearSessionExpiredHandler,
  setSessionExpiredHandler,
} from "../services/api/client";
import { registerForPushNotificationsAsync } from "../services/firebase/push";
import { registerPushToken } from "../services/api/push.service";

type AuthUser = {
  id: number;
  firebase_uid: string;
  email: string;
  nome: string | null;
};

type AuthFeedback = {
  message: string;
  variant: "error" | "success" | "info";
};

type AuthContextData = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authFeedback: AuthFeedback | null;
  clearAuthFeedback: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  authFeedback: null,
  clearAuthFeedback: () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authFeedback, setAuthFeedback] = useState<AuthFeedback | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    setSessionExpiredHandler(async () => {
      await clearSession();
      Alert.alert("Sessão expirada", "Faça login novamente.");
      router.replace("/login");
    });

    return () => {
      clearSessionExpiredHandler();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const idToken = await getUserIdToken(firebaseUser);
        const backendUser = await loginWithFirebase(idToken);
        setUser(backendUser);
        await registerCurrentDevicePushToken(idToken);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    setIsLoading(true);
    setAuthFeedback(null);

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
    setAuthFeedback(null);

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

  async function clearSession() {
    try {
      await signOutFirebase();
    } finally {
      setUser(null);
    }
  }

  async function signOut() {
    setIsLoading(true);
    try {
      await clearSession();
      setAuthFeedback({
        message: "Você saiu da sua conta com sucesso.",
        variant: "success",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function registerCurrentDevicePushToken(idToken: string) {
    try {
      const pushToken = await registerForPushNotificationsAsync();

      if (!pushToken) {
        return;
      }

      await registerPushToken(idToken, pushToken.data, Platform.OS);
    } catch (error) {
      console.log("Falha ao registrar push token", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        authFeedback,
        clearAuthFeedback: () => setAuthFeedback(null),
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
