document.addEventListener('DOMContentLoaded', () => {
    // Navigation Action
    const createBtn = document.querySelector('button span.truncate')?.parentElement;
    if (createBtn && createBtn.textContent.includes('Create Bond')) {
        createBtn.addEventListener('click', () => window.location.href = 'newbond.html');
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
