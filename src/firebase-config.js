// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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