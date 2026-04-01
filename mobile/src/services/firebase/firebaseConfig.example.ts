import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.firebasestorage.app",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id",
  measurementId: "your_measurement_id",
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
