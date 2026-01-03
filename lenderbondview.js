document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navLinks = {
        'Dashboard': 'dashboard.html',
        'My Bonds': 'bondhistory.html',
        'Wallet': '#' // Placeholder
    };

    document.querySelectorAll('nav a, header nav a').forEach(link => {
        const text = link.textContent.trim();
        if (navLinks[text]) {
            link.href = navLinks[text];
        }
    });

    // Breadcrumbs
    const breadcrumbs = document.querySelectorAll('nav.flex a');
    breadcrumbs.forEach(link => {
        if (link.textContent.trim() === 'Dashboard') link.href = 'dashboard.html';
        if (link.textContent.trim() === 'My Bonds') link.href = 'bondhistory.html';
    });

    // Action buttons
    const extendBtn = document.querySelector('button span.material-symbols-outlined:contains("calendar_clock")')?.parentElement;
    // Note: :contains pseudo-selector acts weird in pure JS querySelector, using standard approach below

    const buttons = document.querySelectorAll('div.flex-wrap button');
    buttons.forEach(btn => {
        if (btn.textContent.includes('Extend Due Date')) {
            btn.addEventListener('click', () => {
                window.location.href = 'requestchange.html'; // Or a separate extend date page, but reusing request change makes sense
            });
        }
        if (btn.textContent.includes('Mark as Completed')) {
            btn.addEventListener('click', () => {
                if (confirm('Mark this bond as completed?')) {
                    alert('Bond marked as completed.');
                    window.location.href = 'dashboard.html';
                }
            });
        }
    });

    // View Profile link
    const profileLink = document.querySelector('a[href="#"]');
    if (profileLink && profileLink.textContent.includes('View Profile')) {
        profileLink.href = 'profile.html';
    }
});
