import { db, auth } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { setupProfileDropdown, formatCurrency, formatDate } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'signin.html';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const bondId = urlParams.get('id');

        if (!bondId) {
            alert('No bond ID provided.');
            window.location.href = 'dashboard.html';
            return;
        }

        const docRef = doc(db, 'contracts', bondId);
        onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const bond = docSnap.data();
                updateUI(bond, bondId);
            } else {
                console.error("No such bond!");
                alert('Bond not found.');
                window.location.href = 'dashboard.html';
            }
        }, (error) => {
            console.error("Error getting bond:", error);
            alert('Error loading bond details.');
        });
    });

    // Profile Dropdown Logic
    setupProfileDropdown(() => {
        signOut(auth).then(() => {
            window.location.href = 'signin.html';
        });
    });
});

function updateUI(bond, bondId) {
    // Local currency formatter strips '$' since it's added in HTML
    const fmtCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val).replace('$', '');

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('bond-title', bond.title || 'Untitled Bond');
    setText('bond-amount', fmtCurrency(bond.totalValue || 0));
    setText('bond-due-date', formatDate(bond.effectiveDate));

    // Status
    const statusText = document.getElementById('bond-status-text');
    if (statusText) statusText.textContent = bond.status || 'Pending';
    const statusIcon = document.getElementById('bond-status-icon');
    if (statusIcon) statusIcon.textContent = bond.status === 'active' ? 'check_circle' : 'pending';

    setText('bond-creator-name', bond.creatorName || 'Unknown Creator');
    setText('bond-type', (bond.type || 'Personal Loan').toUpperCase());
    setText('bond-purpose', bond.description || 'No description provided.');

    // ID
    setText('bond-display-id', bond.bondId || bondId || 'PENDING');

    // Terms
    const termsEl = document.getElementById('bond-terms-content');
    if (termsEl) {
        if (bond.terms) {
            termsEl.textContent = bond.terms;
        } else {
            // Fallback
            termsEl.innerHTML = `<ul class="list-disc pl-5 space-y-2"><li>Standard terms apply.</li></ul>`;
        }
    }
}
