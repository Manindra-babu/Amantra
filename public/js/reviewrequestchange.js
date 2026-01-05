document.addEventListener('DOMContentLoaded', () => {
    // Back link
    const backLink = document.querySelector('a[href="#"]');
    if (backLink && backLink.textContent.includes('Back to Bond')) {
        backLink.href = 'lenderbondview.html';
    }

    // Navigation
    const navLinks = {
        'Dashboard': 'dashboard.html',
        'My Bonds': 'bondhistory.html',
        'Profile': 'profile.html'
    };

    document.querySelectorAll('nav a').forEach(link => {
        const text = link.textContent.trim();
        if (navLinks[text]) {
            link.href = navLinks[text];
        }
    });

    // Action Buttons
    const rejectBtn = document.querySelector('button.text-red-600');
    const clarifyBtn = document.querySelector('button.text-text-main');
    const acceptBtn = document.querySelector('button.bg-primary');

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reject these changes?')) {
                alert('Changes rejected.');
                window.location.href = 'allrequests.html';
            }
        });
    }

    if (clarifyBtn) {
        clarifyBtn.addEventListener('click', () => {
            alert('Opening chat for clarification...');
            // Implement chat logic or navigation here
        });
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to accept these changes? This will update the bond terms.')) {
                alert('Changes accepted and bond updated.');
                window.location.href = 'lenderbondview.html';
            }
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
});
