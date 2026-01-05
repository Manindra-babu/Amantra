document.addEventListener('DOMContentLoaded', () => {
    // Render Mock Data
    const renderAllRequests = () => {
        if (typeof MOCK_DATA === 'undefined') return;
        const tbody = document.getElementById('all-requests-body');
        if (!tbody || !MOCK_DATA.allRequests) return;

        tbody.innerHTML = MOCK_DATA.allRequests.map(req => `
            <tr class="hover:bg-gray-50 dark:hover:bg-[#1f293a] transition-colors group">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col">
                        <span class="text-xs text-text-secondary">${req.reqId}</span>
                        <span class="text-sm font-bold text-text-main dark:text-white">${req.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                        <div class="size-8 rounded-full bg-cover bg-center" style='background-image: url("${req.avatar}");'></div>
                        <span class="text-sm font-medium text-text-main dark:text-white">${req.requester}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-text-main dark:text-gray-300">${req.date}</span>
                </td>
                <td class="px-6 py-4">
                    <p class="text-sm text-text-secondary dark:text-gray-400 line-clamp-1 max-w-[200px]" title="${req.details}">${req.details}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-${req.statusColor}-100 text-${req.statusColor}-800 dark:bg-${req.statusColor}-900/40 dark:text-${req.statusColor}-300 border border-${req.statusColor}-200 dark:border-${req.statusColor}-800">
                        <span class="size-1.5 rounded-full bg-${req.statusColor}-500"></span>
                        ${req.status}
                    </span>
                </td>
            </tr>
        `).join('');
    };

    renderAllRequests();
    // Navigation handling
    const setupNavigation = () => {
        const links = {
            'Dashboard': 'dashboard.html',
            'Bonds': 'bondhistory.html', // Assuming bondhistory is the bonds page
            'Requests': 'allrequests.html',
            'Profile': 'profile.html',
            'Home': 'dashboard.html'
        };

        // Top Navigation
        document.querySelectorAll('nav a, header a').forEach(link => {
            const text = link.textContent.trim();
            if (links[text]) {
                link.href = links[text];
            }
        });

        // Breadcrumb
        const breadcrumbHome = document.querySelector('nav[aria-label="Breadcrumb"] a');
        if (breadcrumbHome) breadcrumbHome.href = 'dashboard.html';

        // Filters and Sort (Placeholder for now)
        const filterButtons = document.querySelectorAll('.group button');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Filter clicked:', btn.textContent.trim());
            });
        });



        // Row Click Navigation
        const requestRows = document.querySelectorAll('tbody tr');
        requestRows.forEach(row => {
            row.style.cursor = 'pointer';
            row.addEventListener('click', (e) => {
                // Prevent if clicking an interactive element
                if (e.target.closest('button') || e.target.closest('a')) return;

                const statusElement = row.querySelector('span.rounded-full');
                const status = statusElement ? statusElement.textContent.trim() : '';

                if (status.includes('Pending')) {
                    window.location.href = 'reviewrequestchange.html';
                } else {
                    // Default view for other states (Completed, Rejected, etc.)
                    // Mapping to a generic view or back to 'requestchange.html' as a placeholder
                    // or maybe 'lenderbondview.html' if it's just a bond
                    // Given the context, 'reviewrequestchange.html' is for incoming requests
                    // 'requestchange.html' is for creating requests.
                    // Let's default to reviewrequestchange.html for now as a viewer or 
                    // stick to the user's specific flow if known. 
                    // For "Accepted" or "Rejected", viewing the bond details might be better.
                    // But for "Requests", let's assume review view is the detail view.
                    window.location.href = 'reviewrequestchange.html';
                }
            });
        });
    };

    setupNavigation();

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
});
