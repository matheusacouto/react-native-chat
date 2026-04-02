import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import Constants from "expo-constants";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const webClientId = Constants.expoConfig?.extra?.googleAuth?.webClientId;

GoogleSignin.configure({
  webClientId,
});

export async function signInWithEmail(email: string, password: string) {
  return auth().signInWithEmailAndPassword(email, password);
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

  const credential = auth.GoogleAuthProvider.credential(idToken);

  return auth().signInWithCredential(credential);
}

export async function signOutFirebase() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // O usuário pode não ter sessão Google ativa, e isso não deve impedir o logout do Firebase.
  }

  return auth().signOut();
}

export async function resetPassword(email: string) {
  return auth().sendPasswordResetEmail(email);
}

export function getCurrentUser() {
  return auth().currentUser;
}

export async function getIdToken() {
  const user = auth().currentUser;

  if (!user) {
    return null;
  }

  return user.getIdToken();
}

export function onFirebaseAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void,
) {
  return auth().onAuthStateChanged(callback);
}
