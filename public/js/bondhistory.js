document.addEventListener('DOMContentLoaded', () => {
    // Render Mock Data
    const renderBondHistory = () => {
        if (typeof MOCK_DATA === 'undefined') return;
        const tbody = document.getElementById('bond-history-body');
        if (!tbody || !MOCK_DATA.bondHistory) return;

        tbody.innerHTML = MOCK_DATA.bondHistory.map(bond => `
            <tr class="group hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                <td class="whitespace-nowrap px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg ${bond.bgClass || 'bg-primary/10'} ${bond.textClass || 'text-primary'}">
                            <span class="material-symbols-outlined">${bond.icon}</span>
                        </div>
                        <div>
                            <p class="font-bold text-accent-dark dark:text-white">${bond.name}</p>
                            <p class="text-xs text-secondary dark:text-gray-400">${bond.bondId}</p>
                        </div>
                    </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-8 w-8 rounded-full bg-cover bg-center" style='background-image: url("${bond.avatar}");'></div>
                        <span class="text-sm font-medium text-accent-dark dark:text-white">${bond.counterparty}</span>
                    </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                    <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${bond.typeClass}">${bond.type}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right">
                    <span class="font-bold text-accent-dark dark:text-white text-base">${bond.amount}</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                    <div class="flex flex-col">
                        <span class="text-sm text-accent-dark dark:text-white">${bond.date}</span>
                        ${bond.timeLeft ? `<span class="text-xs text-secondary dark:text-gray-400">${bond.timeLeft}</span>` : ''}
                    </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${bond.statusClass} ${bond.status.includes('Overdue') ? 'bg-red-50 text-red-700 ring-red-600/20' : ''}">
                        ${bond.statusIcon ? `<span class="material-symbols-outlined text-[14px]">${bond.statusIcon}</span>` : '<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>'}
                        ${bond.status}
                    </span>
                </td>
            </tr>
        `).join('');
    };

    renderBondHistory();
    // Navigation Action
    const createBtn = document.getElementById('create-bond-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            window.location.href = 'newbond.html';
        });
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
    // Bond Row Click Navigation
    const bondRows = document.querySelectorAll('tbody tr');
    bondRows.forEach(row => {
        row.style.cursor = 'pointer';

        row.addEventListener('click', (e) => {
            // Prevent if clicking an interactive element like a button or link
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }

            // The 'Type' is in the 3rd column (index 2)
            const typeCell = row.cells[2];
            if (typeCell) {
                const typeText = typeCell.textContent.trim().toLowerCase();
                if (typeText.includes('lending')) {
                    window.location.href = 'lenderbondview.html';
                } else if (typeText.includes('borrowing')) {
                    window.location.href = 'recipientbondview.html';
                }
            }
        });
    });
});

