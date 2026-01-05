import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const signupForm = document.getElementById('signup-form');
const errorDiv = document.getElementById('signup-error');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';

        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const aadhaar = document.getElementById('signup-aadhaar').value;

        if (password !== confirmPassword) {
            errorDiv.textContent = "Passwords do not match.";
            errorDiv.classList.remove('hidden');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                aadhaar: aadhaar,
                uid: user.uid,
                createdAt: new Date().toISOString()
            });

            console.log("User created:", user.uid);
            // Redirection is handled by auth_check.js
        } catch (error) {
            console.error("Signup error:", error);
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
}
