document.addEventListener('DOMContentLoaded', () => {
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

