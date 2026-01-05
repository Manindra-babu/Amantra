document.addEventListener('DOMContentLoaded', () => {
    // ---- Bond Summary Logic ----
    const amountInput = document.getElementById('bond-amount-input');
    const dateInput = document.getElementById('bond-date-input');
    const currencySelect = document.getElementById('bond-currency-select');

    // Display Elements
    const summaryBondValue = document.getElementById('summary-bond-value');
    const summaryPrincipal = document.getElementById('summary-principal');
    const summaryPlatformFee = document.getElementById('summary-platform-fee');
    const summaryTotalCost = document.getElementById('summary-total-cost');
    const summaryMaturityDate = document.getElementById('summary-maturity-date');

    // Fee Configuration (0.5%)
    const FEATURE_PLATFORM_FEE_PERCENT = 0.005;

    function formatCurrency(amount, currencyCode = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2
        }).format(amount);
    }

    function updateBondSummary() {
        const amount = parseFloat(amountInput.value) || 0;
        const currency = currencySelect.value || 'USD';

        // Calculate Fees
        const principal = amount;
        const platformFee = principal * FEATURE_PLATFORM_FEE_PERCENT;
        const totalCost = principal + platformFee;

        // Update UI Text
        // Bond Value usually refers to the Principal in this context (what the recipient gets or the face value)
        summaryBondValue.textContent = formatCurrency(principal, currency);
        summaryPrincipal.textContent = formatCurrency(principal, currency);
        summaryPlatformFee.textContent = formatCurrency(platformFee, currency);
        summaryTotalCost.textContent = formatCurrency(totalCost, currency);

        // Update Date
        const dateValue = dateInput.value;
        if (dateValue) {
            const dateObj = new Date(dateValue);
            // Format: MM/DD/YYYY
            const formattedDate = dateObj.toLocaleDateString('en-US');
            summaryMaturityDate.textContent = `Matures on: ${formattedDate}`;
        } else {
            summaryMaturityDate.textContent = 'Matures on: --/--/----';
        }
    }

    // Attach Listeners
    if (amountInput) {
        amountInput.addEventListener('input', updateBondSummary);
    }
    if (currencySelect) {
        currencySelect.addEventListener('change', updateBondSummary);
    }
    if (dateInput) {
        dateInput.addEventListener('change', updateBondSummary);
    }


    // ---- Existing Profile Dropdown Logic ----
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
