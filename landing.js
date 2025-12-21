import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

/*
  FIREBASE INITIALIZATION:
  The 'auth' object imported above is already initialized in 'firebase-config.js'.
  That file calls initializeApp() with your keys.
*/

const toggle = document.getElementById('authToggle');
const btnSignIn = document.getElementById('btnSignIn');
const btnSignUp = document.getElementById('btnSignUp');
const formSignIn = document.getElementById('formSignIn');
const formSignUp = document.getElementById('formSignUp');
const linkToSignUp = document.getElementById('linkToSignUp');
const linkToSignIn = document.getElementById('linkToSignIn');

// Flag to prevent race condition between onAuthStateChanged and setDoc
let isSigningUp = false;

// UI Toggle Functions
function showSignIn() {
    toggle.classList.remove('ind-signup');
    btnSignIn.classList.add('active');
    btnSignUp.classList.remove('active');
    formSignIn.classList.add('active');
    formSignUp.classList.remove('active');
    document.getElementById('login').scrollIntoView({ behavior: 'smooth' });
}

function showSignUp() {
    toggle.classList.add('ind-signup');
    btnSignIn.classList.remove('active');
    btnSignUp.classList.add('active');
    formSignIn.classList.remove('active');
    formSignUp.classList.add('active');
    document.getElementById('login').scrollIntoView({ behavior: 'smooth' });
}

// Event Listeners for UI
if (btnSignIn) btnSignIn.addEventListener('click', showSignIn);
if (btnSignUp) btnSignUp.addEventListener('click', showSignUp);
if (linkToSignUp) linkToSignUp.addEventListener('click', function (e) { e.preventDefault(); showSignUp(); });
if (linkToSignIn) linkToSignIn.addEventListener('click', function (e) { e.preventDefault(); showSignIn(); });

// Nav Interactions (Login Link & Get Started Button)
const navLoginLink = document.querySelector('.nav-links a[href="#login"]');
if (navLoginLink) {
    navLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSignIn();
    });
}

const navGetStartedBtn = document.querySelector('.nav-cta');
if (navGetStartedBtn) {
    // Remove the inline onclick attribute which might have been hardcoded in HTML
    navGetStartedBtn.removeAttribute('onclick');
    navGetStartedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSignUp();
    });
}

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user && !isSigningUp) {
        // Only redirect if we are NOT currently in the middle of a sign-up flow.
        console.log("User detected, redirecting...");
        window.location.href = "dashboard.html";
    }
});

// Sign In Handler
const signInSubmitBtn = document.querySelector('#formSignIn .auth-btn');

if (signInSubmitBtn) {
    signInSubmitBtn.removeAttribute('onclick');

    signInSubmitBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        // Loading State
        const originalText = signInSubmitBtn.innerText;
        signInSubmitBtn.innerText = "Signing in...";
        signInSubmitBtn.disabled = true;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect handled by onAuthStateChanged
            // We don't revert text here immediately because redirect is happening.
        } catch (error) {
            alert("Sign In Error: " + error.message);
            console.error(error);
            // Revert Loading State on Error
            signInSubmitBtn.innerText = originalText;
            signInSubmitBtn.disabled = false;
        }
    });
}


// Sign Up Handler
const signUpSubmitBtn = document.querySelector('#formSignUp .auth-btn');
if (signUpSubmitBtn) {
    signUpSubmitBtn.addEventListener('click', async () => {
        isSigningUp = true; // Set flag

        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm');

        const firstNameInput = document.getElementById('signup-first-name');
        const lastNameInput = document.getElementById('signup-last-name');
        const phoneInput = document.getElementById('signup-phone');

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirm = confirmInput ? confirmInput.value : '';

        const firstName = firstNameInput ? firstNameInput.value : '';
        const lastName = lastNameInput ? lastNameInput.value : '';
        const phone = phoneInput ? phoneInput.value : '';

        if (!email || !password || !confirm) {
            alert("Please fill in all required fields.");
            isSigningUp = false;
            return;
        }

        if (password !== confirm) {
            alert("Passwords do not match!");
            isSigningUp = false;
            return;
        }

        // Loading State
        const originalText = signUpSubmitBtn.innerText;
        signUpSubmitBtn.innerText = "Creating Account...";
        signUpSubmitBtn.disabled = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User created:", user);

            // Save additional user info to Firestore
            try {
                await setDoc(doc(db, "users", user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    uid: user.uid,
                    createdAt: new Date().toISOString()
                });
                console.log("User profile document created");
            } catch (dbError) {
                console.error("Error creating user profile:", dbError);
                alert("Account created, but failed to save profile details. specific error: " + dbError.message);
            }

            // NOW we manually redirect
            window.location.href = "dashboard.html";

        } catch (error) {
            alert("Sign Up Error: " + error.message);
            console.error(error);
            isSigningUp = false;
            // Revert Loading State on Error
            signUpSubmitBtn.innerText = originalText;
            signUpSubmitBtn.disabled = false;
        }
    });
}

// Global exposure
window.showSignIn = showSignIn;
window.showSignUp = showSignUp;
