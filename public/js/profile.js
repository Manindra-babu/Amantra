import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc, collection, query, where, getCountFromServer, getDocs, limit, orderBy } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- VIEW LOGIC ---
    const updateProfileUI = async (user) => {
        // 1. User Details
        const userDocRef = doc(db, "users", user.uid);
        try {
            const userDoc = await getDoc(userDocRef);

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
                    const emailContainer = emailLabel.closest('.flex-col'); // Get parent
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
        } catch (e) {
            console.error("Error fetching user details:", e);
        }

        // 2. Stats (Counts)
        try {
            // Bonds Created (where user is the creator)
            const createdQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid));
            const createdSnapshot = await getCountFromServer(createdQuery);
            const createdCount = createdSnapshot.data().count;
            updateStat('Total Created', createdCount);

            // Bonds Received (where user is the counterparty)
            let receivedCount = 0;
            if (user.email) {
                const receivedQuery = query(collection(db, "contracts"), where("counterpartyEmail", "==", user.email));
                const receivedSnapshot = await getCountFromServer(receivedQuery);
                receivedCount = receivedSnapshot.data().count;
            }
            updateStat('Bonds Received', receivedCount);

            // Active Bonds (status is 'active' or 'pending')
            const activeCreatedQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid), where("status", "==", "active"));
            const pendingCreatedQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid), where("status", "==", "pending"));

            const activeCreatedSnap = await getCountFromServer(activeCreatedQuery);
            const pendingCreatedSnap = await getCountFromServer(pendingCreatedQuery);
            const activeCount = activeCreatedSnap.data().count + pendingCreatedSnap.data().count;
            updateStat('Active Bonds', activeCount);

            // Overdue
            const overdueCreatedQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid), where("status", "==", "overdue"));
            const overdueCreatedSnap = await getCountFromServer(overdueCreatedQuery);
            updateStat('Overdue', overdueCreatedSnap.data().count);

            // Completed
            const completedQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid), where("status", "==", "completed"));
            const completedSnap = await getCountFromServer(completedQuery);
            updateStat('Completed', completedSnap.data().count);


            // Recent Bonds List
            // Fetch recent 3 bonds created by the user
            const recentQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid), orderBy("createdAt", "desc"), limit(3));
            const recentSnapshot = await getDocs(recentQuery);
            const recentBonds = [];
            recentSnapshot.forEach(doc => recentBonds.push(doc.data()));
            renderRecentBonds(recentBonds);

        } catch (error) {
            console.error("Error updating stats:", error);
        }
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

    // Navigation Action
    const createBtn = document.querySelector('button span.truncate')?.parentElement;
    if (createBtn) {
        // Only add if text matches "Create Bond" logic if needed, but selector is specific enough
        createBtn.addEventListener('click', () => window.location.href = 'newbond.html');
    } else {
        // Fallback for button without span structure if it changed
        const btns = document.querySelectorAll('button');
        btns.forEach(btn => {
            if (btn.textContent.includes('Create Bond')) btn.addEventListener('click', () => window.location.href = 'newbond.html');
        })
    }


    // Profile Dropdown Logic
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
                window.location.href = 'signin.html';
            });
        }
    }

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
