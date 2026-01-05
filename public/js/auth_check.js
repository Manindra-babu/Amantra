import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const publicPages = ['signin.html', 'signup.html', 'landing.html', 'index.html'];

onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    if (user) {
        // User is signed in
        console.log('User is signed in:', user.uid);
        if (page === 'signin.html' || page === 'signup.html') {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out
        console.log('User is signed out');
        if (!publicPages.includes(page) && page !== '') {
            window.location.href = 'signin.html';
        }
    }
});

window.logout = async () => {
    try {
        await signOut(auth);
        console.log('User signed out');
        window.location.href = 'signin.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};

// Attack listener to sign out buttons if they exist
document.addEventListener('DOMContentLoaded', () => {
    const signOutBtns = document.querySelectorAll('#sign-out-btn');
    signOutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.logout();
        });
    });
});
