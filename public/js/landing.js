document.addEventListener('DOMContentLoaded', () => {
    // Navigation Action
    const buttons = document.querySelectorAll('button');

    buttons.forEach(btn => {
        const text = btn.textContent.trim().toLowerCase();

        if (text.includes('join network') || text.includes('start your connection') || text.includes('get started now')) {
            btn.addEventListener('click', () => {
                window.location.href = 'signup.html';
            });
        } else if (text.includes('how it works')) {
            btn.addEventListener('click', () => {
                // Scroll to features section or similar
                const featuresSection = document.querySelector('section:nth-of-type(2)');
                if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

    // Mobile Menu Toggle (Simple implementation)
    const mobileMenuBtn = document.querySelector('button span.material-symbols-outlined')?.parentElement;
    if (mobileMenuBtn && mobileMenuBtn.textContent.includes('menu')) {
        mobileMenuBtn.addEventListener('click', () => {
            // For now, just alert or simple toggle if mobile menu existed
            // In a real implementation we would toggle a hidden div
            console.log('Mobile menu clicked');
        });
    }
});
