import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import {
  Alert
} from "react-native";
import { router } from "expo-router";
import {
  getIdToken,
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
  isLoading: true,
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
  const [isLoading, setIsLoading] = useState(true);

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
        const idToken = await firebaseUser.getIdToken();
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
