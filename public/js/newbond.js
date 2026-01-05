import { auth, db } from '/js/firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // ---- Bond Summary Logic ----
    const bondNameInput = document.getElementById('bond-name-input');
    const bondTypeSelect = document.getElementById('bond-type-select');
    const recipientInput = document.getElementById('bond-recipient-input');
    const amountInput = document.getElementById('bond-amount-input');
    const dateInput = document.getElementById('bond-date-input');
    const currencySelect = document.getElementById('bond-currency-select');
    const createBondBtn = document.getElementById('create-bond-btn');

    // Display Elements
    const summaryBondValue = document.getElementById('summary-bond-value');
    const summaryPrincipal = document.getElementById('summary-principal');
    const summaryPlatformFee = document.getElementById('summary-platform-fee');
    const summaryTotalCost = document.getElementById('summary-total-cost');
    const summaryMaturityDate = document.getElementById('summary-maturity-date');

    // Fee Configuration (0.5%)
    const FEATURE_PLATFORM_FEE_PERCENT = 0.005;

    let currentUser = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
        } else {
            // Optional: Redirect to login if sensitive
            // window.location.href = 'signin.html';
        }
    });

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
        if (summaryBondValue) summaryBondValue.textContent = formatCurrency(principal, currency);
        if (summaryPrincipal) summaryPrincipal.textContent = formatCurrency(principal, currency);
        if (summaryPlatformFee) summaryPlatformFee.textContent = formatCurrency(platformFee, currency);
        if (summaryTotalCost) summaryTotalCost.textContent = formatCurrency(totalCost, currency);

        // Update Date
        const dateValue = dateInput.value;
        if (summaryMaturityDate) {
            if (dateValue) {
                const dateObj = new Date(dateValue);
                // Format: MM/DD/YYYY
                const formattedDate = dateObj.toLocaleDateString('en-US');
                summaryMaturityDate.textContent = `Matures on: ${formattedDate}`;
            } else {
                summaryMaturityDate.textContent = 'Matures on: --/--/----';
            }
        }
    }

    // Attach Listeners for Summary
    if (amountInput) amountInput.addEventListener('input', updateBondSummary);
    if (currencySelect) currencySelect.addEventListener('change', updateBondSummary);
    if (dateInput) dateInput.addEventListener('change', updateBondSummary);


    // Templates
    const TEMPLATES = {
        personal: "STANDARD PERSONAL LOAN AGREEMENT\n\n1. PARTIES: This Loan Agreement is made today by and between the Lender (Creator) and the Borrower (Recipient).\n2. LOAN AMOUNT: The Lender agrees to loan the Borrower the Principal sum of {amount} {currency}.\n3. REPAYMENT: The Borrower agrees to repay the full amount by {date}.\n4. INTEREST: No interest shall accrue if paid by the Due Date. Default interest of 5% applies thereafter.\n5. JURISDICTION: This agreement is governed by the laws of the jurisdiction of the Lender.",
        iou: "IOU ACKNOWLEDGMENT\n\nI, the undersigned Recipient (Borrower), acknowledge that I owe the Creator (Lender) the sum of {amount} {currency}. I promise to repay this amount in full by {date}. This IOU is legally binding and admissible in court.",
        service: "SERVICE AGREEMENT\n\n1. SERVICES: The Provider agrees to deliver the agreed services as described in the Purpose section.\n2. PAYMENT: The Client agrees to pay the total sum of {amount} {currency} upon completion or by {date}.\n3. CANCELLATION: Cancellations within 24 hours of the due date may incur a 10% fee.",
        gift: "GIFT DEED\n\nI, the Creator, hereby voluntarily transfer the amount of {amount} {currency} to the Recipient as a gift. This transfer is made without any expectation of repayment or future service. This gift is irrevocable once accepted.",
        other: "GENERAL FINANCIAL AGREEMENT\n\nThe parties agree to the transfer of {amount} {currency} under the terms mutually agreed upon. Repayment or service delivery is expected by {date}."
    };

    // ---- Create Bond Logic ----
    if (createBondBtn) {
        createBondBtn.addEventListener('click', async () => {
            if (!currentUser) {
                alert("Please sign in to create a bond.");
                return;
            }

            // Validation
            const name = bondNameInput?.value.trim();
            const type = bondTypeSelect?.value;
            const recipient = recipientInput?.value.trim();
            const amount = parseFloat(amountInput?.value);
            const currency = currencySelect?.value || 'USD';
            const date = dateInput?.value;
            const description = document.getElementById('bond-desc-textarea')?.value.trim();
            const isStandardTerms = document.getElementById('terms-standard')?.checked;

            if (!name) return alert("Please enter a bond name.");
            if (!type) return alert("Please select a bond type.");
            if (!recipient) return alert("Please enter a recipient.");
            if (!amount || amount <= 0) return alert("Please enter a valid amount.");
            if (!date) return alert("Please select a due date.");

            // Generate Display ID (B-XXXX-YYYY)
            const randomId = Math.floor(1000 + Math.random() * 9000);
            const year = new Date().getFullYear();
            const displayId = `B-${randomId}-${year}`;

            // Generate Terms
            let termsContent = '';
            if (isStandardTerms && TEMPLATES[type]) {
                termsContent = TEMPLATES[type]
                    .replace(/{amount}/g, formatCurrency(amount, currency))
                    .replace(/{currency}/g, currency)
                    .replace(/{date}/g, new Date(date).toLocaleDateString())
                    .replace(/{lender}/g, currentUser.displayName || 'Lender')
                    .replace(/{borrower}/g, recipient);
            } else {
                // Custom terms: use description or default placeholder
                termsContent = description || "Custom terms as agreed between parties.";
            }

            // Disable button
            const originalText = createBondBtn.innerHTML;
            createBondBtn.disabled = true;
            createBondBtn.textContent = 'Creating...';

            try {
                // Fee Calc
                const platformFee = amount * FEATURE_PLATFORM_FEE_PERCENT;

                const bondData = {
                    creatorUid: currentUser.uid,
                    creatorName: currentUser.displayName || currentUser.email.split('@')[0] || 'User',
                    creatorEmail: currentUser.email,
                    creatorRole: 'lender', // Assuming creator is lending
                    bondId: displayId, // Human readable ID
                    title: name,
                    type: type,
                    counterpartyName: recipient,
                    counterpartyEmail: '',
                    totalValue: String(amount),
                    currency: currency,
                    effectiveDate: date,
                    createdAt: new Date().toISOString(),
                    status: 'pending',
                    description: description || '',
                    terms: termsContent, // Save generated terms
                    platformFee: String(platformFee)
                };

                await addDoc(collection(db, "contracts"), bondData);

                alert(`Bond ${displayId} created successfully!`);
                window.location.href = 'dashboard.html';

            } catch (error) {
                console.error("Error creating bond:", error);
                alert("Failed to create bond. Please try again.");
                createBondBtn.disabled = false;
                createBondBtn.innerHTML = originalText;
            }
        });
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
