import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics & Messaging conditionally (they only work in the browser, not SSR)
let analytics;
let messaging;

if (typeof window !== "undefined") {
  isAnalyticsSupported().then((isSupported) => {
    if (isSupported) {
      analytics = getAnalytics(app);
    }
  });

  isMessagingSupported().then((isSupported) => {
    if (isSupported) {
      messaging = getMessaging(app);
      
      if ("serviceWorker" in navigator) {
        const swUrl = `/firebase-messaging-sw.js?apiKey=${firebaseConfig.apiKey}&projectId=${firebaseConfig.projectId}&messagingSenderId=${firebaseConfig.messagingSenderId}&appId=${firebaseConfig.appId}`;
        navigator.serviceWorker.register(swUrl).then((registration) => {
          console.log("[Firebase] Service Worker registered with scope:", registration.scope);
        }).catch((err) => {
          console.error("[Firebase] Service Worker registration failed:", err);
        });
      }
    }
  });
}

export const requestNotificationPermission = async () => {
  if (typeof window !== "undefined" && "Notification" in window) {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      // Note: to get the actual FCM token, you'd call:
      // import { getToken } from "firebase/messaging";
      // return getToken(messaging, { vapidKey: "YOUR_VAPID_KEY_HERE" });
      return true;
    } else {
      console.log("Unable to get permission to notify.");
      return false;
    }
  }
  return false;
};

export { app, analytics, messaging };
