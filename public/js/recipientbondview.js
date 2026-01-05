import { db, auth } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // Check Authentication
    auth.onAuthStateChanged(async (user) => {
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

        try {
            const docRef = doc(db, 'contracts', bondId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const bond = docSnap.data();
                updateUI(bond, bondId);
            } else {
                console.error("No such bond!");
                alert('Bond not found.');
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error("Error getting bond:", error);
            alert('Error loading bond details.');
        }
    });

    // Profile Dropdown Logic
    setupProfileDropdown();
});

function updateUI(bond, bondId) {
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val).replace('$', '');
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('bond-title', bond.title || 'Untitled Bond');
    setText('bond-amount', formatCurrency(bond.totalValue || 0));
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

function setupProfileDropdown() {
    const profileBtn = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });

        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                auth.signOut().then(() => {
                    window.location.href = 'signin.html';
                });
            });
        }
    }
}
