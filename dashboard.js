document.addEventListener('DOMContentLoaded', () => {
    // Navigation Action
    const buttons = {
        'button:contains("Create New Bond")': 'newbond.html',
        'button:contains("Bond History")': 'bondhistory.html',
        'button:contains("Calendar")': 'calendar.html',
        'a:contains("View all requests")': 'allrequests.html'
    };

    // Helper to find elements by text content since querySelector doesn't support :contains
    const findElementByText = (selector, text) => {
        const elements = document.querySelectorAll(selector);
        for (let el of elements) {
            if (el.textContent.includes(text)) return el;
        }
        return null;
    };

    // Link buttons
    const createBtn = findElementByText('button', 'Create New Bond');
    if (createBtn) createBtn.addEventListener('click', () => window.location.href = 'newbond.html');

    const historyBtn = findElementByText('button', 'Bond History');
    if (historyBtn) historyBtn.addEventListener('click', () => window.location.href = 'bondhistory.html');

    const calendarBtn = findElementByText('button', 'Calendar');
    if (calendarBtn) calendarBtn.addEventListener('click', () => window.location.href = 'calendar.html');

    const viewRequestsLink = document.querySelector('a[href="#"]');
    // Being specific as there might be multiple href="#"
    if (viewRequestsLink && viewRequestsLink.textContent.includes('View all requests')) {
        viewRequestsLink.href = 'allrequests.html';
    }

    // Interactive Cards Actions
    const reviewBtns = document.querySelectorAll('button');
    reviewBtns.forEach(btn => {
        if (btn.textContent.trim() === 'Review') {
            btn.addEventListener('click', () => window.location.href = 'reviewrequestchange.html');
        }
    });

    const declineBtns = document.querySelectorAll('button');
    declineBtns.forEach(btn => {
        if (btn.textContent.trim() === 'Decline') {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to decline this request?')) {
                    alert('Request declined.');
                    // Reload or remove element logic
                }
            });
        }
    });

    // Bond list items click to view details
    const bondCards = document.querySelectorAll('.group.relative.flex.flex-col');
    bondCards.forEach(card => {
        // Find the arrow button by iterating spans
        const spans = card.querySelectorAll('span.material-symbols-outlined');
        let arrowBtn = null;
        for (let span of spans) {
            if (span.textContent.includes('arrow_outward')) {
                arrowBtn = span.closest('div');
                break;
            }
        }

        if (arrowBtn) {
            arrowBtn.parentElement.addEventListener('click', () => {
                // Determine if it's a bond sent or received
                if (card.innerHTML.includes('To:')) {
                    window.location.href = 'lenderbondview.html';
                } else {
                    window.location.href = 'recipientbondview.html'; // Assuming this exists or falls back
                }
            });
        }
    });
});
