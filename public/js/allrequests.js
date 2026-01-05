document.addEventListener('DOMContentLoaded', () => {
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
