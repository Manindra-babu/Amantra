// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Your web app's Firebase configuration
// REPLACE these values with your actual Firebase project configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
