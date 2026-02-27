import { setupProfileDropdown } from './ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navLinks = {
        'Dashboard': 'dashboard.html',
        'Calendar': 'calendar.html',
        'My Bonds': 'bondhistory.html',
        'Wallet': '#'
    };

    document.querySelectorAll('nav a').forEach(link => {
        const text = link.textContent.trim();
        if (navLinks[text]) {
            link.href = navLinks[text];
        }
    });

    // Interactive Calendar Elements (Placeholders)
    const calendarDays = document.querySelectorAll('.grid > div');
    const sidebarTitle = document.querySelector('.bg-white h3');

    // Track the currently selected day to avoid re-querying the DOM
    let selectedDay = null;
    const selectedClasses = ['ring-2', 'ring-inset', 'ring-primary', 'bg-blue-50/50'];

    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            // Deselect previously selected day (O(1) instead of querying all .ring-2 elements)
            if (selectedDay) {
                selectedDay.classList.remove(...selectedClasses);
                selectedDay.classList.add('hover:bg-gray-50');
                selectedDay = null;
            }

            // Add selected state (visual only for now)
            if (!day.classList.contains('text-gray-300')) { // Ignore previous/next month days
                day.classList.add(...selectedClasses);
                day.classList.remove('hover:bg-gray-50');
                selectedDay = day;

                // Update sidebar date
                const dateNum = day.querySelector('span')?.textContent;
                if (sidebarTitle && dateNum) {
                    sidebarTitle.textContent = `Tuesday, Oct ${dateNum}`;
                }
            }
        });
    });

    // Create New Bond
    const createBtn = document.querySelector('button.border-dashed');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            window.location.href = 'newbond.html';
        });
    }

    // Profile Dropdown Logic
    setupProfileDropdown();
});
