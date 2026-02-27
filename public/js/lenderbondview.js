import { db, auth } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { setupProfileDropdown, formatDate } from './ui-utils.js';

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
    // Helper for formatting currency — uses $ in HTML so strip it from the formatted value
    const fmtCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val).replace('$', '');
    };

    // Helper for date — use the shared formatDate from ui-utils.js

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
    setText('bond-amount', fmtCurrency(bond.totalValue || 0));
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
