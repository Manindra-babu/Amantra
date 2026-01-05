import { auth, db } from './firebase-config.js';
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    const renderDashboard = (user) => {
        // Change Requests Listener
        const requestsQuery = query(collection(db, "requests"), where("userId", "==", user.uid));
        onSnapshot(requestsQuery, (snapshot) => {
            const requests = [];
            snapshot.forEach((doc) => {
                requests.push(doc.data());
            });
            renderChangeRequests(requests);
        });

        const contractsQuery = query(collection(db, "contracts")); // Fetch all and filter client side for complex OR logic across creator/counterparty
        // OR better, use two queries as before if composite indexes are an issue, but let's try a simple approach first or keep existing structure if we can matches.
        // Actually, to match "creatorUid == user.uid" OR "counterpartyEmail == user.email", it's complex.
        // Let's stick to just creator for now as per the user's "Create" flow focus, or try to support both if possible.
        // Given the rules I wrote allow read if creator or counterparty, a simple query(collection(db, "contracts")) will fail due to rules if we don't filter?
        // Actually, rules filter what you CAN read. But client SDK needs a query that matches constraints.
        // Let's query where creatorUid == uid.

        const createdQuery = query(collection(db, "contracts"), where("creatorUid", "==", user.uid));

        onSnapshot(createdQuery, (snapshot) => {
            processSnapshot(snapshot, user, 'created');
        });

        // We ideally need a second query for received bonds (where counterpartyEmail == user.email).
        // Assuming email is available on user object.
        if (user.email) {
            const receivedQuery = query(collection(db, "contracts"), where("counterpartyEmail", "==", user.email));
            onSnapshot(receivedQuery, (snapshot) => {
                processSnapshot(snapshot, user, 'received');
            });
        }
    };

    let allCreated = [];
    let allReceived = [];

    const processSnapshot = (snapshot, user, source) => {
        const bonds = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id; // Keep ID
            // Map fields for UI consistency
            data.name = data.title; // title -> name
            data.amount = data.totalValue; // totalValue -> amount
            data.dueDate = data.effectiveDate; // effectiveDate -> dueDate
            // Infer category
            data.statusCategory = (data.status === 'pending' || data.status === 'active') ? 'active' : 'overdue'; // Simplified logic
            bonds.push(data);
        });

        if (source === 'created') allCreated = bonds;
        else allReceived = bonds;

        updateDashboardLists();
    }

    const updateDashboardLists = () => {
        const createdActive = allCreated.filter(b => b.statusCategory === 'active');
        const createdOverdue = allCreated.filter(b => b.statusCategory === 'overdue');
        const receivedActive = allReceived.filter(b => b.statusCategory === 'active');
        const receivedOverdue = allReceived.filter(b => b.statusCategory === 'overdue');

        renderBondList('created-active', createdActive, false, 'lenderbondview.html');
        renderBondList('created-overdue', createdOverdue, true, 'lenderbondview.html');
        renderBondList('received-active', receivedActive, false, 'recipientbondview.html');
        renderBondList('received-overdue', receivedOverdue, true, 'recipientbondview.html');
    }

    const renderChangeRequests = (requests) => {
        const section = document.getElementById('change-requests-section');
        const container = document.getElementById('change-requests-container');
        if (!section || !container) return;

        if (requests.length > 0) {
            section.classList.remove('hidden');
            container.innerHTML = requests.map(req => `
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-xl bg-white p-6 shadow-sm border border-amber-100 dark:bg-white/5 dark:border-white/10">
                    <div class="flex items-center gap-5">
                        <div class="relative">
                            <div class="h-14 w-14 rounded-full bg-brand-light bg-cover bg-center ring-2 ring-white shadow-sm dark:ring-white/10"
                                style="background-image: url('${req.bonderAvatar}');">
                            </div>
                            <div class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#1E1E1E]">
                                <span class="material-symbols-outlined text-white" style="font-size: 14px;">edit</span>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-brand-dark dark:text-white">${req.bonderName}</h3>
                            <p class="text-sm font-medium text-text-secondary">Proposed new terms for <span class="text-brand-blue font-bold dark:text-blue-300">Bond ${req.bondId}</span></p>
                        </div>
                    </div>
                    <div class="flex-1 lg:max-w-xl">
                        <div class="flex items-center gap-4 rounded-xl bg-background-light px-5 py-4 border border-border-light dark:bg-white/5 dark:border-white/10">
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">Current Amount</p>
                                <p class="text-sm font-bold text-brand-grey line-through">${req.currentAmount}</p>
                            </div>
                            <div class="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600 mx-2 relative top-[2px]"></div>
                            <span class="material-symbols-outlined text-amber-500" style="font-size: 20px;">arrow_forward</span>
                            <div class="flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600 mx-2 relative top-[2px]"></div>
                            <div class="text-right">
                                <p class="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">Requested</p>
                                <p class="text-xl font-extrabold text-brand-dark dark:text-white">${req.requestedAmount}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 w-full lg:w-auto">
                        <button class="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 transition-all hover:bg-brand-dark hover:scale-105 active:scale-95 transition-button" onclick="window.location.href='reviewrequestchange.html'">Review</button>
                        <button class="flex-1 lg:flex-none rounded-xl border border-border-light bg-white px-5 py-3 text-sm font-bold text-text-secondary hover:bg-gray-50 dark:bg-transparent dark:border-white/10 dark:text-white dark:hover:bg-white/5 transition-button">Decline</button>
                    </div>
                </div>
            `).join('');
        } else {
            section.classList.add('hidden');
        }
    };

    const renderBondList = (elementIdSuffix, bonds, isOverdue, href) => {
        const element = document.getElementById(`list-${elementIdSuffix}`);
        if (!element) return;

        element.innerHTML = bonds.map(bond => `
            <div class="group relative flex flex-col gap-4 rounded-2xl border ${isOverdue ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10' : 'border-border-light bg-white dark:border-white/10 dark:bg-white/5'} p-6 shadow-sm transition-all hover:shadow-md cursor-pointer" onclick="window.location.href='${href}?id=${bond.id}'">
                ${isOverdue ? `<div class="absolute right-0 top-0 rounded-bl-xl rounded-tr-xl bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:bg-red-900/50 dark:text-red-300">Action Required</div>` : ''}
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4">
                        <div class="h-12 w-12 rounded-full bg-cover bg-center ${isOverdue ? 'ring-2 ring-red-100 dark:ring-red-900/30' : 'rounded-full bg-brand-light ring-2 ring-white dark:ring-white/10'}" style="background-image: url('${bond.avatar || 'assets/default_avatar.png'}');"></div>
                        <div>
                            <p class="text-base font-bold text-brand-dark dark:text-white">${bond.name ? (href.includes('lender') ? 'To: ' : 'From: ') + (bond.counterpartyName || bond.name) : 'Untitled Bond'}</p>
                            <p class="text-xs font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-text-secondary'} uppercase tracking-wider">${isOverdue ? 'Overdue Status' : 'Created ' + (bond.createdAt ? bond.createdAt.split('T')[0] : 'Unknown')}</p>
                        </div>
                    </div>
                </div>
                <div class="flex items-end justify-between border-t ${isOverdue ? 'border-red-200 dark:border-red-900/30' : 'border-border-light dark:border-white/10'} pt-4 mt-2">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Amount</p>
                        <p class="text-2xl font-extrabold text-brand-dark dark:text-white">${bond.amount}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-medium text-text-secondary mb-1">${isOverdue ? 'Status' : 'Due Date'}</p>
                        <div class="inline-flex items-center rounded-md ${isOverdue ? 'bg-white px-3 py-1 text-xs font-bold text-red-600 shadow-sm ring-1 ring-red-100 dark:bg-red-900/40 dark:text-red-400 dark:ring-0' : 'bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}">
                            ${!isOverdue && (bond.status || '').includes('Due') ? '<span class="material-symbols-outlined mr-1" style="font-size: 14px;">warning</span>' : ''}
                            ${bond.status}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // Initialize Auth Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            renderDashboard(user);
        }
    });

    // --- UI INTERACTION LOGIC ---

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

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
    }

    // Link buttons (Fixed to use direct IDs if available or simple text match)
    const findElementByText = (selector, text) => {
        const elements = document.querySelectorAll(selector);
        for (let el of elements) {
            if (el.textContent.includes(text)) return el;
        }
        return null;
    };

    const createBtn = findElementByText('button', 'Create New Bond');
    if (createBtn) createBtn.addEventListener('click', () => window.location.href = 'newbond.html');

    const historyBtn = findElementByText('button', 'Bond History');
    if (historyBtn) historyBtn.addEventListener('click', () => window.location.href = 'bondhistory.html');

    const calendarBtn = findElementByText('button', 'Calendar');
    if (calendarBtn) calendarBtn.addEventListener('click', () => window.location.href = 'calendar.html');
});
