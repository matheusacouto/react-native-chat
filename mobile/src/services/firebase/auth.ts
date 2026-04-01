import Constants from "expo-constants";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { firebaseApp } from "./firebaseConfig";

const auth = getAuth(firebaseApp);
const webClientId = Constants.expoConfig?.extra?.googleAuth?.webClientId;

GoogleSignin.configure({
  webClientId,
});

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
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

  return signInWithCredential(auth, credential);
}

export async function signOutFirebase() {
  await GoogleSignin.signOut();
  return signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function getIdToken() {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  return user.getIdToken();
}

export function onFirebaseAuthStateChanged(
  callback: (user: typeof auth.currentUser) => void,
) {
  return onAuthStateChanged(auth, callback);
}
