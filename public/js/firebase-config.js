import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyC0ow5Z61mcAV8GxhJM9ZQGMZbIiLYmQnk",
    authDomain: "amantra-359.firebaseapp.com",
    projectId: "amantra-359",
    storageBucket: "amantra-359.firebasestorage.app",
    messagingSenderId: "823735987342",
    appId: "1:823735987342:web:5c13fcc0148af4eb7d2ddf",
    measurementId: "G-X0X7GKQEWR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
