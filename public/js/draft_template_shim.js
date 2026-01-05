window.draftTemplate = function () {
    console.log("Auto-drafting template...");

    // Get form values (assuming standard IDs from original implementation)
    const amount = document.getElementById('amount')?.value || '[Amount]';
    const borrower = document.getElementById('borrower')?.value || '[Borrower Name]';
    const lender = document.getElementById('lender')?.value || '[Lender Name]';
    const date = new Date().toLocaleDateString();

    const termsTextarea = document.getElementById('terms_conditions') || document.querySelector('textarea');

    if (termsTextarea) {
        const template = `Loan Agreement\n\nDate: ${date}\n\nThis agreement is made between ${lender} (Lender) and ${borrower} (Borrower).\n\n1. The Lender agrees to loan the Borrower the sum of ${amount}.\n2. The Borrower agrees to repay the loan in full by [Due Date].\n3. No interest shall be charged provided repayment is made on time.\n4. Both parties agree to these terms.`;

        termsTextarea.value = template;

        // Optional: Highlight or show success message
        alert('Template drafted successfully!');
    } else {
        console.error('Terms textarea not found');
        alert('Could not find terms field to draft template.');
    }
};
