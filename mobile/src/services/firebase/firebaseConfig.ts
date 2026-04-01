import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDili1QRKBAnFhNXrRDzAfMac_ksmNnZH4",
  authDomain: "react-native-chat-76724.firebaseapp.com",
  projectId: "react-native-chat-76724",
  storageBucket: "react-native-chat-76724.firebasestorage.app",
  messagingSenderId: "62212837130",
  appId: "1:62212837130:web:82d82f87f736bd0a3df4f3",
  measurementId: "G-EHJJJ3YKCZ",
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
