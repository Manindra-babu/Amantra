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

        // Action buttons
        const actionButtons = document.querySelectorAll('td button');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const status = row.querySelector('span.rounded-full').textContent.trim();

                if (status.includes('Pending Review')) {
                    // Navigate to review request page
                    window.location.href = 'reviewrequestchange.html';
                } else {
                    console.log('View details for:', status);
                    // Could navigate to detail view if it existed
                }
            });
        });
    };

    setupNavigation();
});
