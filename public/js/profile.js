import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, onSnapshot, collection, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { setupProfileDropdown } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- VIEW LOGIC ---
    const updateProfileUI = (user) => {
        // 1. User Details - Real-time listener
        const userDocRef = doc(db, "users", user.uid);
        onSnapshot(userDocRef, (userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Update Name and Handle
                const nameEl = document.querySelector('h2.text-text-main');
                if (nameEl) nameEl.textContent = userData.username || 'User';

                const handleEl = document.querySelector('p.text-text-secondary.text-sm.font-medium');
                if (handleEl) handleEl.textContent = `@${userData.username?.toLowerCase().replace(/\s/g, '_') || 'user'}`;

                // Update Email
                const emailLabel = findElementByText('span', 'Email Address');
                if (emailLabel) {
                    const emailContainer = emailLabel.closest('.flex-col');
                    if (emailContainer) {
                        const emailValue = emailContainer.querySelector('.text-text-main');
                        if (emailValue) emailValue.textContent = user.email;
                    }
                }

                // Update Aadhaar (Masked)
                const aadhaarLabel = findElementByText('span', 'Aadhaar Number');
                if (aadhaarLabel) {
                    const aadhaarContainer = aadhaarLabel.closest('.flex-col');
                    if (aadhaarContainer) {
                        const aadhaarValue = aadhaarContainer.querySelector('.text-text-main');
                        if (aadhaarValue) {
                            const aadhaar = userData.aadhaar || '000000000000';
                            aadhaarValue.textContent = `xxxx-xxxx-${aadhaar.slice(-4)}`;
                        }
                    }
                }
            }
        }, (e) => {
            console.error("Error fetching user details:", e);
        });

        // 2. Stats - Real-time listeners on contract queries
        // Bonds Created
        const createdQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid));
        onSnapshot(createdQuery, (snapshot) => {
            const createdCount = snapshot.size;
            updateStat('Total Created', createdCount);

            // Active Bonds (status is 'active' or 'pending')
            let activeCount = 0;
            let overdueCount = 0;
            let completedCount = 0;
            snapshot.forEach(doc => {
                const status = doc.data().status;
                if (status === 'active' || status === 'pending') activeCount++;
                else if (status === 'overdue') overdueCount++;
                else if (status === 'completed') completedCount++;
            });
            updateStat('Active Bonds', activeCount);
            updateStat('Overdue', overdueCount);
            updateStat('Completed', completedCount);
        }, (error) => {
            console.error("Error updating created stats:", error);
        });

        // Bonds Received
        if (user.email) {
            const receivedQuery = query(collection(db, "contracts"), where("counterpartyEmail", "==", user.email));
            onSnapshot(receivedQuery, (snapshot) => {
                updateStat('Bonds Received', snapshot.size);
            }, (error) => {
                console.error("Error updating received stats:", error);
            });
        }

        // Recent Bonds List - Real-time listener
        const recentQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid), orderBy("createdAt", "desc"), limit(3));
        onSnapshot(recentQuery, (snapshot) => {
            const recentBonds = [];
            snapshot.forEach(doc => recentBonds.push(doc.data()));
            renderRecentBonds(recentBonds);
        }, (error) => {
            console.error("Error updating recent bonds:", error);
        });
    };


    const updateStat = (label, value) => {
        // Find the card with this label
        const labelEl = findElementByText('p', label);
        if (labelEl && labelEl.nextElementSibling) {
            labelEl.nextElementSibling.textContent = value;
        }
    };

    const renderRecentBonds = (bonds) => {
        const listContainer = document.getElementById('recent-bonds-list');
        if (!listContainer) return;

        if (bonds.length === 0) {
            listContainer.innerHTML = '<div class="p-4 text-center text-text-secondary text-sm">No recent bonds found.</div>';
            return;
        }

        listContainer.innerHTML = bonds.map(bond => `
            <div class="p-4 flex items-center justify-between hover:bg-background-light dark:hover:bg-background-dark transition-colors cursor-pointer group">
                <div class="flex items-center gap-4">
                    <div class="bg-blue-100 dark:bg-blue-900/30 text-primary p-2 rounded-full h-10 w-10 flex items-center justify-center">
                        <span class="material-symbols-outlined">request_quote</span>
                    </div>
                    <div>
                        <p class="text-text-main dark:text-white font-bold text-sm group-hover:text-primary transition-colors">
                            ${bond.title || bond.name || 'Bond Transaction'}
                        </p>
                        <p class="text-text-secondary text-xs">Created on ${bond.createdAt ? new Date(bond.createdAt).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-text-main dark:text-white font-bold text-sm">${bond.totalValue || bond.amount}</p>
                    <p class="${(bond.status === 'active' || bond.status === 'pending') ? 'text-green-600 dark:text-green-400' : 'text-text-secondary'} text-xs font-medium">${bond.status}</p>
                </div>
            </div>
        `).join('');
    };


    const findElementByText = (selector, text) => {
        const elements = document.querySelectorAll(selector);
        for (let el of elements) {
            if (el.textContent.trim() === text) return el;
        }
        return null;
    };


    // Initialize Auth Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateProfileUI(user);
        }
    });

    // --- INTERACTION LOGIC (Preserved) ---
    // ... (Keep existing nav/modal logic)

    // Navigation Action – prefer ID, then specific selector, then text fallback
    const createBtn = document.getElementById('btn-create-bond')
        || document.querySelector('button span.truncate')?.parentElement;
    if (createBtn) {
        createBtn.addEventListener('click', () => window.location.href = 'newbond.html');
    } else {
        // Fallback: find by text content (runs only once at init)
        for (const btn of document.querySelectorAll('button')) {
            if (btn.textContent.includes('Create Bond')) {
                btn.addEventListener('click', () => window.location.href = 'newbond.html');
                break;  // Stop after first match
            }
        }
    }


    // Profile Dropdown Logic
    setupProfileDropdown(() => {
        signOut(auth).then(() => {
            window.location.href = 'signin.html';
        });
    });

    // QR Code Modal Logic
    const qrTrigger = document.getElementById('digital-bond-qr');
    const qrModal = document.getElementById('qr-modal');
    const qrContent = document.getElementById('qr-modal-content');
    const closeQrBtn = document.getElementById('close-qr-modal');

    if (qrTrigger && qrModal && qrContent) {
        const openModal = () => {
            qrModal.classList.remove('hidden');
            setTimeout(() => {
                qrModal.classList.remove('opacity-0');
                qrContent.classList.remove('scale-95');
                qrContent.classList.add('scale-100');
            }, 10);
        };

        const closeModal = () => {
            qrModal.classList.add('opacity-0');
            qrContent.classList.remove('scale-100');
            qrContent.classList.add('scale-95');
            setTimeout(() => {
                qrModal.classList.add('hidden');
            }, 300);
        };

        qrTrigger.addEventListener('click', openModal);

        if (closeQrBtn) {
            closeQrBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal();
            });
        }

        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !qrModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
});
