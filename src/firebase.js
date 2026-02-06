import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBVgqwFQu3AlSqc7Khmwg05bUdKIDd8WrI",
    authDomain: "ledgerapp-4f04a.firebaseapp.com",
    projectId: "ledgerapp-4f04a",
    storageBucket: "ledgerapp-4f04a.firebasestorage.app",
    messagingSenderId: "227637983990",
    appId: "1:227637983990:web:3e28c3f97d795740594ad7",
    measurementId: "G-4T9V56HLY1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, analytics, auth };
