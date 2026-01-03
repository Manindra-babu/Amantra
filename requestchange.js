document.addEventListener('DOMContentLoaded', () => {
    // Back link
    const backLink = document.querySelector('a[href="#"]');
    if (backLink && backLink.textContent.includes('Back to Bond')) {
        backLink.href = 'lenderbondview.html'; // Assuming going back to bond view
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

    // Form Interactions
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');

    // Cancel Button
    const cancelButton = document.querySelector('button.border-border-light');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Submit Button
    const submitButton = document.querySelector('button.bg-primary');
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            // Basic validation
            if (!amountInput.value && !dateInput.value) {
                alert('Please propose at least one change (Amount or Date).');
                return;
            }
            const reason = document.getElementById('justification').value;
            if (!reason) {
                alert('Please provide a reason for the change.');
                return;
            }

            console.log('Submitting request:', {
                amount: amountInput.value,
                date: dateInput.value,
                reason: reason
            });
            alert('Change request submitted successfully!');
            window.location.href = 'lenderbondview.html';
        });
    }
});
