import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const signinForm = document.getElementById('signin-form');
const errorDiv = document.getElementById('signin-error');

if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';

        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("User signed in");
            // Redirection is handled by auth_check.js
        } catch (error) {
            console.error("Signin error:", error);
            errorDiv.textContent = "Invalid email or password.";
            errorDiv.classList.remove('hidden');
        }
    });
}
