import { getApp } from "@react-native-firebase/app";
import {
  FirebaseAuthTypes,
  getAuth,
  getIdToken as getFirebaseIdToken,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "@react-native-firebase/auth";
import Constants from "expo-constants";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const webClientId = Constants.expoConfig?.extra?.googleAuth?.webClientId;
const firebaseAuth = getAuth(getApp());

GoogleSignin.configure({
  webClientId,
});

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signInWithGoogleNative() {
  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await GoogleSignin.signIn();

  if (response.type !== "success") {
    throw new Error("Login com Google cancelado.");
  }

  const idToken = response.data.idToken;

  if (!idToken) {
    throw new Error("Google não retornou idToken.");
  }

  const credential = GoogleAuthProvider.credential(idToken);

  return signInWithCredential(firebaseAuth, credential);
}

export async function signOutFirebase() {
  const googleUser = GoogleSignin.getCurrentUser();

  try {
    await signOut(firebaseAuth);
  } finally {
    if (!googleUser) {
      return;
    }

    try {
      await GoogleSignin.revokeAccess();
    } catch {
      // A revogação pode falhar por conectividade ou estado local, mas não deve bloquear o logout.
    }

    try {
      await GoogleSignin.signOut();
    } catch {
      // O usuário pode não ter sessão Google ativa localmente, e isso não deve impedir o logout.
    }
  }
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(firebaseAuth, email);
}

export function getCurrentUser() {
  return firebaseAuth.currentUser;
}

export async function getIdToken() {
  const user = firebaseAuth.currentUser;

  if (!user) {
    return null;
  }

  return getFirebaseIdToken(user);
}

export async function getUserIdToken(user: FirebaseAuthTypes.User) {
  return getFirebaseIdToken(user);
}

export function onFirebaseAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void,
) {
  return onAuthStateChanged(firebaseAuth, callback);
}
