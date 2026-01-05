import { auth, db } from './firebase-config.js';
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    const renderAllRequests = (user) => {
        // Query both 'requests' and potentially 'bonds' if we want to show everything
        // For now let's just show 'requests' collection as per original scope
        const q = query(collection(db, "requests"), where("userId", "==", user.uid));

        onSnapshot(q, (snapshot) => {
            const requests = [];
            snapshot.forEach((doc) => {
                requests.push(doc.data());
            });
            updateTable(requests);
        });
    };

    const updateTable = (requests) => {
        const tbody = document.getElementById('all-requests-body');
        if (!tbody) return;

        if (requests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-text-secondary">No requests found.</td></tr>`;
            return;
        }

        tbody.innerHTML = requests.map(req => `
            <tr class="hover:bg-gray-50 dark:hover:bg-[#1f293a] transition-colors group cursor-pointer" onclick="window.location.href='reviewrequestchange.html'">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col">
                        <span class="text-xs text-text-secondary">REQ-${req.bondId}</span> 
                        <span class="text-sm font-bold text-text-main dark:text-white">${req.bonderName || 'Unknown'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                        <div class="size-8 rounded-full bg-cover bg-center" style='background-image: url("${req.bonderAvatar || ''}");'></div>
                        <span class="text-sm font-medium text-text-main dark:text-white">Me</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-text-main dark:text-gray-300">${new Date(req.createdAt).toLocaleDateString()}</span>
                </td>
                <td class="px-6 py-4">
                    <p class="text-sm text-text-secondary dark:text-gray-400 line-clamp-1 max-w-[200px]" title="Change Request">Requested: ${req.requestedAmount}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                     <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                        <span class="size-1.5 rounded-full bg-yellow-500"></span>
                        Pending
                    </span>
                </td>
            </tr>
        `).join('');
    };

    // Initialize Auth Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            renderAllRequests(user);
        }
    });

    // Navigation (Preserved)
    const setupNavigation = () => {
        // Top Navigation
        document.querySelectorAll('nav a, header a').forEach(link => {
            const text = link.textContent.trim();
            if (text === 'Dashboard') link.href = 'dashboard.html';
        });

        // Profile Dropdown Logic
        const profileBtn = document.getElementById('profile-menu-button');
        const profileDropdown = document.getElementById('profile-dropdown');

        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('hidden');
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.add('hidden');
                }
            });

            // Sign Out logic
            const signOutBtn = document.getElementById('sign-out-btn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', () => {
                    window.location.href = 'signin.html';
                });
            }
        }
    };

    setupNavigation();
});
