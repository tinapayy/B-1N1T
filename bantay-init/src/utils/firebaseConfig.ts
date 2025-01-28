import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNnRhPsc2KEg4VgeaoRxRho70xKQTELxg",
  authDomain: "bantay-init.firebaseapp.com",
  databaseURL: "https://bantay-init-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bantay-init",
  storageBucket: "bantay-init.firebasestorage.app",
  messagingSenderId: "377602346040",
  appId: "1:377602346040:web:2e91a97115cf158fc8aacd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Realtime Database instance
export const db = getDatabase(app);
