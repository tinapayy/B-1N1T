// src/lib/firebase.ts
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "ArasysBNnRhPsc2KEq4VgeaoRxRho76xKQTELxg",
  authDomain: "bantay-init.firebaseapp.com",
  databaseURL: "https://bantay-init-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bantay-init",
  storageBucket: "bantay-init.appspot.com",
  messagingSenderId: "377602346040",
  appId: "1:377602346040:web:2e91a97115cf158fc8aacd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };