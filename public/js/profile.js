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


    // QR Code Modal Logic
    const qrTrigger = document.getElementById('digital-bond-qr');
    const qrModal = document.getElementById('qr-modal');
    const qrContent = document.getElementById('qr-modal-content');
    const closeQrBtn = document.getElementById('close-qr-modal');

    if (qrTrigger && qrModal && qrContent) {
        const openModal = () => {
            qrModal.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                qrModal.classList.remove('opacity-0');
                qrContent.classList.remove('scale-95');
                qrContent.classList.add('scale-100');
            }, 10);
        };

        const closeModal = () => {
            qrModal.classList.add('opacity-0');
            qrContent.classList.remove('scale-100');
            qrContent.classList.add('scale-95');
            setTimeout(() => {
                qrModal.classList.add('hidden');
            }, 300);
        };

        qrTrigger.addEventListener('click', openModal);

        if (closeQrBtn) {
            closeQrBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal();
            });
        }

        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !qrModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
});
