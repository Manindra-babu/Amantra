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

                // Security Check: Only Creator (Lender) can view here? 
                // Actually lenderbondview is usually for the creator.
                if (bond.creatorUid !== user.uid) {
                    // Optionally redirect if not the creator? 
                    // Only strictly enforce if rules don't already. 
                    // Rules allow read if creator or counterparty. 
                    // If counterparty views this page, it might look slightly wrong (e.g. "You created...") 
                    // but functionally ok.
                }

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

    // Profile Dropdown Logic (Copied/Shared)
    setupProfileDropdown();
});

function updateUI(bond, bondId) {
    // Helper for formatting currency
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val).replace('$', ''); // we add $ manually in HTML
    };

    // Helper for date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Calculate remaining days
    const calculateDaysRemaining = (dueDateStr) => {
        if (!dueDateStr) return 0;
        const due = new Date(dueDateStr);
        const now = new Date();
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Update Elements
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('bond-title', bond.title || 'Untitled Bond');
    setText('bond-description', bond.description || 'No description provided.');
    setText('bond-amount', formatCurrency(bond.totalValue || 0));
    setText('bond-due-date', formatDate(bond.effectiveDate));

    // Status Badge
    const statusBadge = document.getElementById('bond-status-badge');
    if (statusBadge) {
        statusBadge.className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bond.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
            bond.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`;
        statusBadge.innerHTML = `<span class="material-symbols-outlined text-[14px]">
            ${bond.status === 'active' ? 'check_circle' : bond.status === 'overdue' ? 'warning' : 'pending'}
        </span> ${bond.status || 'Pending'}`;
    }

    // Remaining Days
    const days = calculateDaysRemaining(bond.effectiveDate);
    const remainingEl = document.getElementById('bond-remaining-days');
    if (remainingEl) {
        if (days < 0) {
            remainingEl.innerHTML = `<span class="material-symbols-outlined text-[14px]">error</span> Overdue by ${Math.abs(days)} days`;
            remainingEl.className = "text-xs font-medium text-red-600 dark:text-red-400 mt-1 flex items-center gap-1";
        } else {
            remainingEl.innerHTML = `<span class="material-symbols-outlined text-[14px]">schedule</span> ${days} Days Remaining`;
            remainingEl.className = "text-xs font-medium text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1";
        }
    }

    setText('bond-recipient-name', bond.counterpartyName || bond.recipientName || 'Unknown Recipient');
    setText('bond-type', (bond.type || 'Personal Loan').toUpperCase()); // e.g. PERSONAL
    setText('bond-purpose-full', bond.description || 'No additional details provided.');
    setText('bond-created-at', new Date(bond.createdAt).toLocaleString());

    // ID
    setText('bond-display-id', `ID: ${bond.bondId || bondId || 'PENDING'}`);

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
            // Import signOut if needed or just use auth
            signOutBtn.addEventListener('click', () => {
                auth.signOut().then(() => {
                    window.location.href = 'signin.html';
                });
            });
        }
    }
}
