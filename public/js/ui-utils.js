/**
 * Shared UI utilities for Amantra.
 * Centralises repeated helpers that were previously duplicated across page scripts.
 */

// ── Profile Dropdown ────────────────────────────────────────────────
/**
 * Wire up the profile-menu button, outside-click dismiss, and sign-out link.
 * Accepts an optional `onSignOut` callback; defaults to a simple redirect.
 */
export function setupProfileDropdown(onSignOut) {
    const profileBtn = document.getElementById('profile-menu-button');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileBtn && profileDropdown) {
        // Toggle Dropdown
        const toggleDropdown = () => {
            const isHidden = profileDropdown.classList.toggle('hidden');
            profileBtn.setAttribute('aria-expanded', !isHidden);
        };

        // Close Dropdown
        const closeDropdown = () => {
            if (!profileDropdown.classList.contains('hidden')) {
                profileDropdown.classList.add('hidden');
                profileBtn.setAttribute('aria-expanded', 'false');
            }
        };

        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                closeDropdown();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !profileDropdown.classList.contains('hidden')) {
                closeDropdown();
                profileBtn.focus();
            }
        });

        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                if (typeof onSignOut === 'function') {
                    onSignOut();
                } else {
                    window.location.href = 'signin.html';
                }
            });
        }
    }
}

// ── Formatting Helpers ──────────────────────────────────────────────
/**
 * Format a numeric value as a locale-aware currency string.
 */
export function formatCurrency(amount, currencyCode = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Format an ISO/parseable date string into a short locale string.
 */
export function formatDate(dateStr, options) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(
        'en-US',
        options || { year: 'numeric', month: 'short', day: 'numeric' }
    );
}

// ── Debounce ────────────────────────────────────────────────────────
/**
 * Returns a debounced version of `fn` that delays invocation until
 * `delay` ms have elapsed since the last call.
 */
export function debounce(fn, delay = 250) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
