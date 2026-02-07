import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

let analytics = null;
isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
});
const db = getFirestore(app);

// Enable offline persistence only on non-native platforms for now to avoid hangs
import { Capacitor } from '@capacitor/core';
if (!Capacitor.isNativePlatform()) {
    enableIndexedDbPersistence(db).catch((err) => {
        console.warn('Persistence failed', err.code);
    });
} else {
    console.log("Skipping IndexedDbPersistence on Native Platform");
}
const auth = getAuth(app);

export { db, analytics, auth };
