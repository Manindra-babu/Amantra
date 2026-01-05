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

    const viewRequestsLink = document.getElementById('view-all-requests-link');
    if (viewRequestsLink) {
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

    // Tab Switching Logic
    const setupTabs = (prefix) => {
        const activeTab = document.getElementById(`tab-${prefix}-active`);
        const overdueTab = document.getElementById(`tab-${prefix}-overdue`);
        const activeList = document.getElementById(`list-${prefix}-active`);
        const overdueList = document.getElementById(`list-${prefix}-overdue`);

        // Common styles for active/inactive tabs
        const activeClass = ['relative', 'text-brand-blue', 'dark:text-blue-300'];
        const inactiveClass = ['text-text-secondary', 'hover:text-brand-dark', 'dark:text-gray-400', 'dark:hover:text-white'];
        const indicatorHTML = '<span class="absolute bottom-[-17px] left-0 h-[3px] w-full bg-brand-blue dark:bg-blue-300 rounded-t-sm"></span>';

        const switchTab = (isOverdue) => {
            if (isOverdue) {
                // Set Overdue Active
                overdueTab.className = `pb-1 text-sm font-bold ${activeClass.join(' ')}`;
                overdueTab.innerHTML = `Overdue ${indicatorHTML}`;
                activeTab.className = `pb-1 text-sm font-bold ${inactiveClass.join(' ')}`;
                activeTab.innerHTML = 'Active';

                activeList.classList.add('hidden');
                overdueList.classList.remove('hidden');
            } else {
                // Set Active Active
                activeTab.className = `pb-1 text-sm font-bold ${activeClass.join(' ')}`;
                activeTab.innerHTML = `Active ${indicatorHTML}`;
                overdueTab.className = `pb-1 text-sm font-bold ${inactiveClass.join(' ')}`;
                overdueTab.innerHTML = 'Overdue';

                overdueList.classList.add('hidden');
                activeList.classList.remove('hidden');
            }
        };

        if (activeTab && overdueTab) {
            activeTab.addEventListener('click', () => switchTab(false));
            overdueTab.addEventListener('click', () => switchTab(true));
        }
    };

    setupTabs('created');
    setupTabs('received');

    // Profile Dropdown Logic
    const profileBtn = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });

        // Sign Out logic
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                window.location.href = 'signin.html';
            });
        }
    }
});
