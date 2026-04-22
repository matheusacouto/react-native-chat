import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Platform } from "react-native";
import { Alert } from "react-native";
import { router } from "@/src/navigation/router";
import {
  getCurrentUser,
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
import {
  getCurrentPushTokenAsync,
  registerForPushNotificationsAsync,
} from "../services/firebase/push";
import {
  registerPushToken,
  unregisterPushToken,
} from "../services/api/push.service";

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
  const authSyncPromiseRef = useRef<Promise<AuthUser> | null>(null);
  const lastSyncedFirebaseUidRef = useRef<string | null>(null);
  const lastSyncedUserRef = useRef<AuthUser | null>(null);

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
        lastSyncedFirebaseUidRef.current = null;
        lastSyncedUserRef.current = null;
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        await syncAuthenticatedUser(firebaseUser);
      } catch {
        lastSyncedFirebaseUidRef.current = null;
        lastSyncedUserRef.current = null;
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
      await syncAuthenticatedUser();
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true);
    setAuthFeedback(null);

    try {
      await signInWithGoogleNative();
      await syncAuthenticatedUser();
    } finally {
      setIsLoading(false);
    }
  }

  async function syncAuthenticatedUser(
    firebaseUser?: FirebaseAuthTypes.User,
  ): Promise<AuthUser> {
    const currentFirebaseUser = firebaseUser ?? getCurrentUser();

    if (!currentFirebaseUser) {
      throw new Error("Usuário do Firebase não encontrado!");
    }

    if (authSyncPromiseRef.current) {
      return authSyncPromiseRef.current;
    }

    if (
      lastSyncedFirebaseUidRef.current === currentFirebaseUser.uid &&
      lastSyncedUserRef.current
    ) {
      return lastSyncedUserRef.current;
    }

    const syncPromise = (async () => {
      const idToken = await getUserIdToken(currentFirebaseUser);

      const backendUser = await loginWithFirebase(idToken);
      lastSyncedFirebaseUidRef.current = currentFirebaseUser.uid;
      lastSyncedUserRef.current = backendUser;
      setUser(backendUser);
      await registerCurrentDevicePushToken(idToken);

      return backendUser;
    })();

    authSyncPromiseRef.current = syncPromise;

    try {
      return await syncPromise;
    } finally {
      if (authSyncPromiseRef.current === syncPromise) {
        authSyncPromiseRef.current = null;
      }
    }
  }

  async function clearSession() {
    try {
      await unregisterCurrentDevicePushToken();
      await signOutFirebase();
    } finally {
      lastSyncedFirebaseUidRef.current = null;
      lastSyncedUserRef.current = null;
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

  async function unregisterCurrentDevicePushToken() {
    try {
      const currentFirebaseUser = getCurrentUser();

      if (!currentFirebaseUser) {
        return;
      }

      const pushToken = await getCurrentPushTokenAsync();

      if (!pushToken) {
        return;
      }

      const idToken = await getUserIdToken(currentFirebaseUser);

      await unregisterPushToken(idToken, pushToken);
    } catch (error) {
      console.log("Falha ao desregistrar push token", error);
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
