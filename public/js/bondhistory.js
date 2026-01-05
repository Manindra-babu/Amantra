import { auth, db } from './firebase-config.js';
import { collection, query, where, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    const renderBondHistory = async (user) => {
        // Fetch Created
        const createdQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid));

        let allBonds = [];

        try {
            const createdSnap = await getDocs(createdQuery);
            createdSnap.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                data.isLending = true; // Created by user -> Lending
                allBonds.push(data);
            });

            // Fetch Received
            if (user.email) {
                const receivedQuery = query(collection(db, "contracts"), where("counterpartyEmail", "==", user.email));
                const receivedSnap = await getDocs(receivedQuery);
                receivedSnap.forEach(doc => {
                    const data = doc.data();
                    data.id = doc.id;
                    data.isLending = false; // Received -> Borrowing
                    // Dedupe
                    if (!allBonds.find(b => b.id === data.id)) {
                        allBonds.push(data);
                    }
                });
            }
        } catch (e) {
            console.error("Error fetching history:", e);
        }

        updateTable(allBonds);
        updateStats(allBonds);
    };

    const updateStats = (bonds) => {
        // 1. Total Active Value
        // Status 'active' or 'pending'
        const activeBonds = bonds.filter(b => {
            const s = (b.status || '').toLowerCase();
            return s === 'active' || s === 'pending';
        });

        const totalValue = activeBonds.reduce((sum, bond) => {
            const val = parseFloat((bond.totalValue || bond.amount || "0").replace(/[^0-9.-]+/g, ""));
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const totalValueLabel = Array.from(document.querySelectorAll('p')).find(el => el.textContent.trim() === 'Total Active Value');
        if (totalValueLabel && totalValueLabel.parentElement && totalValueLabel.parentElement.nextElementSibling) {
            totalValueLabel.parentElement.nextElementSibling.textContent = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        // 2. Upcoming Due Date
        const now = new Date();
        const futureBonds = activeBonds.filter(b => {
            const d = new Date(b.effectiveDate || b.dueDate);
            return !isNaN(d) && d > now;
        });

        futureBonds.sort((a, b) => new Date(a.effectiveDate || a.dueDate) - new Date(b.effectiveDate || b.dueDate));

        const upcomingLabel = Array.from(document.querySelectorAll('p')).find(el => el.textContent.trim() === 'Upcoming Due');
        if (upcomingLabel && upcomingLabel.parentElement && upcomingLabel.parentElement.nextElementSibling) {
            if (futureBonds.length > 0) {
                const nextDate = new Date(futureBonds[0].effectiveDate || futureBonds[0].dueDate);
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
                onclick="window.location.href='${!bond.isLending ? 'recipientbondview.html' : 'lenderbondview.html'}?id=${bond.id}'">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-white/10"
                                style="background-image: url('${bond.avatar || 'assets/default_avatar.png'}');">
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-bold text-text-main dark:text-white capitalize">${bond.title || bond.name || 'Untitled'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-text-main dark:text-white">${bond.counterpartyName || bond.creatorName || 'Unknown'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        ${bond.isLending ? 'Lending' : 'Borrowing'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                     <div class="text-sm font-bold text-text-main dark:text-white">${bond.totalValue || bond.amount}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    ${bond.effectiveDate || bond.dueDate}
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
