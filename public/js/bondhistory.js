import { auth, db } from './firebase-config.js';
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    const renderBondHistory = (user) => {
        // Use 'bonds' collection for consistency with Dashboard/Profile
        const q = query(collection(db, "bonds"), where("userId", "==", user.uid));

        onSnapshot(q, (snapshot) => {
            const bonds = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Normalize data structure if needed (ensure dates are comparable)
                bonds.push(data);
            });
            updateTable(bonds);
            updateStats(bonds);
        });
    };

    const updateStats = (bonds) => {
        // 1. Total Active Value
        const activeBonds = bonds.filter(b =>
            b.status.toLowerCase() === 'active' ||
            b.statusCategory === 'active'
        );

        const totalValue = activeBonds.reduce((sum, bond) => {
            // Remove non-numeric except . and -
            const val = parseFloat(bond.amount.replace(/[^0-9.-]+/g, ""));
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const totalValueLabel = Array.from(document.querySelectorAll('p')).find(el => el.textContent.trim() === 'Total Active Value');
        if (totalValueLabel && totalValueLabel.parentElement && totalValueLabel.parentElement.nextElementSibling) {
            totalValueLabel.parentElement.nextElementSibling.textContent = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        // 2. Upcoming Due Date
        // Filter active bonds with future dates
        const now = new Date();
        const futureBonds = activeBonds.filter(b => {
            const d = new Date(b.dueDate); // stored as YYYY-MM-DD or readable string?
            // Seed data uses YYYY-MM-DD usually, or standard string. JS Date parses most.
            return !isNaN(d) && d > now;
        });

        // Sort by date ascending
        futureBonds.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const upcomingLabel = Array.from(document.querySelectorAll('p')).find(el => el.textContent.trim() === 'Upcoming Due');
        if (upcomingLabel && upcomingLabel.parentElement && upcomingLabel.parentElement.nextElementSibling) {
            if (futureBonds.length > 0) {
                const nextDate = new Date(futureBonds[0].dueDate);
                // Format: Oct 24, 2024
                const options = { month: 'short', day: 'numeric', year: 'numeric' };
                upcomingLabel.parentElement.nextElementSibling.textContent = nextDate.toLocaleDateString('en-US', options);
            } else {
                upcomingLabel.parentElement.nextElementSibling.textContent = "No Upcoming";
            }
        }
    };

    const updateTable = (bonds) => {
        const tbody = document.getElementById('bond-history-body');
        if (!tbody) return;

        if (bonds.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-text-secondary">No bond history found.</td></tr>`;
            return;
        }

        tbody.innerHTML = bonds.map(bond => `
            <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-border-light dark:border-border-dark last:border-b-0 cursor-pointer" 
                onclick="window.location.href='${bond.type === 'received' ? 'recipientbondview.html' : 'lenderbondview.html'}'">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-white/10"
                                style="background-image: url('${bond.avatar || 'assets/default_avatar.png'}');">
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-bold text-text-main dark:text-white capitalize">${bond.name}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-text-main dark:text-white">${bond.counterparty || (bond.type === 'created' ? 'Recipient' : 'Sender')}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        ${bond.type === 'created' ? 'Lending' : 'Borrowing'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                     <div class="text-sm font-bold text-text-main dark:text-white">${bond.amount}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    ${bond.dueDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(bond.status)}">
                        ${bond.status}
                    </span>
                </td>

            </tr>
        `).join('');
    };

    const getStatusClass = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        const s = status.toLowerCase();
        if (s.includes('active')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        if (s.includes('completed') || s.includes('closed') || s.includes('paid')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        if (s.includes('overdue')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        if (s.includes('pending')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        return 'bg-gray-100 text-gray-800';
    };

    // Initialize Auth Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            renderBondHistory(user);
        }
    });

    // Navigation and Dropdown Logic (Preserved)
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
            signOutBtn.addEventListener('click', () => window.location.href = 'signin.html');
        }
    }
});
