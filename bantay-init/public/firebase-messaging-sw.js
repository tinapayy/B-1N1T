importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBNnRhPsc2KEg4VgeaoRxRho70xKQTELxg",
    authDomain: "bantay-init.firebaseapp.com",
    databaseURL: "bantay-init-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bantay-init",
    storageBucket: "bantay-init.firebasestorage.app",
    messagingSenderId: "377602346040",
    appId: "1:377602346040:web:2e91a97115cf158fc8aacd",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("[firebase-messaging-sw.js] Received background message", payload);
  
  const notificationTitle = payload.notification.title || "Heat Alert";
  const notificationOptions = {
    body: payload.notification.body || "Check current heat index readings.",
    icon: "/logo.png",
    badge: "/badge-icon.png", 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
