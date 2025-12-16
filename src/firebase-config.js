// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCC8o2ZeNrbAOW_eRKQE4aqQeb-DcDj7Y",
  authDomain: "amantra-360.firebaseapp.com",
  projectId: "amantra-360",
  storageBucket: "amantra-360.firebasestorage.app",
  messagingSenderId: "831180557886",
  appId: "1:831180557886:web:f94fc61a4acf8934738b6f",
  measurementId: "G-1FCVRW87D1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;