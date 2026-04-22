import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";

const mockLoginWithFirebase = jest.fn();
const mockGetCurrentPushTokenAsync = jest.fn();
const mockRegisterForPushNotificationsAsync = jest.fn();
const mockRegisterPushToken = jest.fn();
const mockUnregisterPushToken = jest.fn();
const mockSignInWithGoogleNative = jest.fn();
const mockSignInWithEmail = jest.fn();
const mockSignOutFirebase = jest.fn();
const mockGetIdToken = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockGetUserIdToken = jest.fn();
const mockOnFirebaseAuthStateChanged = jest.fn();
const mockSetSessionExpiredHandler = jest.fn();
const mockClearSessionExpiredHandler = jest.fn();

jest.mock("@/src/services/firebase/auth", () => ({
  getIdToken: () => mockGetIdToken(),
  getCurrentUser: () => mockGetCurrentUser(),
  getUserIdToken: (...args: unknown[]) => mockGetUserIdToken(...args),
  onFirebaseAuthStateChanged: (...args: unknown[]) =>
    mockOnFirebaseAuthStateChanged(...args),
  signInWithEmail: (...args: unknown[]) => mockSignInWithEmail(...args),
  signInWithGoogleNative: () => mockSignInWithGoogleNative(),
  signOutFirebase: () => mockSignOutFirebase(),
}));

jest.mock("@/src/services/api/auth.service", () => ({
  loginWithFirebase: (...args: unknown[]) => mockLoginWithFirebase(...args),
}));

jest.mock("@/src/services/firebase/push", () => ({
  getCurrentPushTokenAsync: (...args: unknown[]) =>
    mockGetCurrentPushTokenAsync(...args),
  registerForPushNotificationsAsync: (...args: unknown[]) =>
    mockRegisterForPushNotificationsAsync(...args),
}));

jest.mock("@/src/services/api/push.service", () => ({
  registerPushToken: (...args: unknown[]) => mockRegisterPushToken(...args),
  unregisterPushToken: (...args: unknown[]) =>
    mockUnregisterPushToken(...args),
}));

jest.mock("@/src/services/api/client", () => ({
  clearSessionExpiredHandler: () => mockClearSessionExpiredHandler(),
  setSessionExpiredHandler: (...args: unknown[]) =>
    mockSetSessionExpiredHandler(...args),
}));

jest.mock("@/src/navigation/router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

function AuthProbe() {
  const { signInWithGoogle, signOut, isAuthenticated } = useAuth();

  return (
    <>
      <Text testID="auth-state">
        {isAuthenticated ? "authenticated" : "anonymous"}
      </Text>
      <Text onPress={() => void signInWithGoogle()}>login-google</Text>
      <Text onPress={() => void signOut()}>logout</Text>
    </>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnFirebaseAuthStateChanged.mockReturnValue(jest.fn());
    mockRegisterForPushNotificationsAsync.mockResolvedValue(null);
    mockGetCurrentPushTokenAsync.mockResolvedValue("push-token-1");
    mockGetIdToken.mockResolvedValue("firebase-token");
    mockGetCurrentUser.mockReturnValue({ uid: "firebase-uid-1" });
    mockGetUserIdToken.mockResolvedValue("firebase-token");
    mockLoginWithFirebase.mockResolvedValue({
      id: 1,
      firebase_uid: "firebase-uid-1",
      email: "teste@example.com",
      nome: "Usuário Teste",
    });
  });

  it("deduplicates backend sync during the first google sign-in", async () => {
    const firebaseUser = { uid: "firebase-uid-1" };
    let authStateChangeHandler:
      | ((user: typeof firebaseUser | null) => void | Promise<void>)
      | undefined;

    mockOnFirebaseAuthStateChanged.mockImplementation((callback) => {
      authStateChangeHandler = callback;
      return jest.fn();
    });

    mockSignInWithGoogleNative.mockImplementation(async () => {
      await authStateChangeHandler?.(firebaseUser);
    });

    const { getByText, getByTestId } = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.press(getByText("login-google"));
    });

    await waitFor(() => {
      expect(mockLoginWithFirebase).toHaveBeenCalledTimes(1);
    });

    expect(mockGetUserIdToken).toHaveBeenCalledWith(firebaseUser);
    expect(mockRegisterForPushNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(getByTestId("auth-state").props.children).toBe("authenticated");
  });

  it("unregisters current push token before signing out", async () => {
    mockGetCurrentUser.mockReturnValue({
      uid: "firebase-uid-1",
    });

    const { getByText } = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.press(getByText("logout"));
    });

    await waitFor(() => {
      expect(mockUnregisterPushToken).toHaveBeenCalledWith(
        "firebase-token",
        "push-token-1",
      );
    });
    expect(mockSignOutFirebase).toHaveBeenCalledTimes(1);
  });
});
