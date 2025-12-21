import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// --- GLOBAL VARIABLES ---
let currentUser = null;
let currentMode = 'customer'; // or 'vendor'
let allContracts = [];

// --- DROPDOWN LOGIC ---
const profileTrigger = document.getElementById('profileTrigger');
const profileDropdown = document.getElementById('profileDropdown');

if (profileTrigger) {
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });
}

// Dropdown Items Interactivity
const dropdownIds = ['btnAccountSettings', 'btnBilling', 'btnPrivacy', 'btnShareProfile', 'btnEvents', 'btnHelp'];
dropdownIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', () => {
            alert(`Feature '${btn.innerText.trim()}' is coming soon!`);
            profileDropdown.classList.remove('active');
        });
    }
});


// --- MODAL PANEL LOGIC ---
const slideOverlay = document.getElementById('slideOverlay');

// Panels
const profileSlidePanel = document.getElementById('profileSlidePanel');
const newDealSlidePanel = document.getElementById('newDealSlidePanel');
const calendarSlidePanel = document.getElementById('calendarSlidePanel');
const viewContractPanel = document.getElementById('viewContractPanel');
const requestLogPanel = document.getElementById('requestLogPanel');
const notificationSlidePanel = document.getElementById('notificationSlidePanel');
const historySlidePanel = document.getElementById('historySlidePanel');

// Triggers
const btnProfileDetails = document.getElementById('btnProfileDetails');
const btnNewDeal = document.getElementById('btnNewDeal');
const btnCalendar = document.getElementById('btnCalendar');
const btnRequestLog = document.getElementById('btnRequestLog');
const btnNotifications = document.getElementById('btnNotifications');
const btnHistory = document.getElementById('btnHistory');

// Close Buttons
const closeProfilePanel = document.getElementById('closeProfilePanel');
const closeNewDealPanel = document.getElementById('closeNewDealPanel');
const closeCalendarPanel = document.getElementById('closeCalendarPanel');
const closeViewContractPanel = document.getElementById('closeViewContractPanel');
const closeRequestLogPanel = document.getElementById('closeRequestLogPanel');
const closeNotificationPanel = document.getElementById('closeNotificationPanel');
const closeHistoryPanel = document.getElementById('closeHistoryPanel');


// Make global for onclicks
window.requestLogPanel = requestLogPanel;
window.openPanel = openPanel;

function closeAllPanels() {
    [profileSlidePanel, newDealSlidePanel, calendarSlidePanel, viewContractPanel, requestLogPanel, notificationSlidePanel, historySlidePanel].forEach(p => p.classList.remove('active'));
    slideOverlay.classList.remove('active');
}

function openPanel(panel) {
    closeAllPanels();
    panel.classList.add('active');
    slideOverlay.classList.add('active');
    profileDropdown.classList.remove('active');
}

// --- PROFILE LOGIC ---
async function fetchUserProfile(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

            // User Summary
            document.getElementById('heroNameDisplay').textContent = fullName || "User";

            // Personal Info
            document.getElementById('profileName').value = fullName || "";
            document.getElementById('profileEmail').value = userData.email || auth.currentUser.email;
            document.getElementById('profilePhone').value = userData.phone || "";

            // Address
            document.getElementById('profileStreet').value = userData.addressStreet || "";
            document.getElementById('profileCity').value = userData.addressCity || "";
            document.getElementById('profileZip').value = userData.addressZip || "";

            // System Info
            document.getElementById('profileKYC').value = userData.kycStatus || "Not Verified";
            // Generate a fake member ID if not exists, based on UID substring
            document.getElementById('profileMemberID').value = userData.memberId || `AM-${uid.substring(0, 6).toUpperCase()}`;

        }
    } catch (e) {
        console.error("Error fetching profile:", e);
    }
}

// Edit Profile
window.enableProfileEdit = function () {
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input:not([id="profileEmail"]):not([id="profileKYC"]):not([id="profileMemberID"])'); // Keep email/system info disabled

    inputs.forEach(input => {
        input.disabled = false;
        input.classList.add('editable'); // Optional styling hook
    });

    document.getElementById('saveProfileBtn').style.display = 'block';
    document.getElementById('avatarEditBtn').style.display = 'flex';
    document.getElementById('btnEnableEdit').style.display = 'none';
};

// Save Profile
window.handleProfileSave = async function (e) {
    e.preventDefault();
    if (!currentUser) return;

    const fullNameInput = document.getElementById('profileName').value;
    const phone = document.getElementById('profilePhone').value;
    const street = document.getElementById('profileStreet').value;
    const city = document.getElementById('profileCity').value;
    const zip = document.getElementById('profileZip').value;

    // Split Name Logic
    const nameParts = fullNameInput.trim().split(' ');
    // Handle cases like "John" (last name empty) or "John Doe Smith" (multi-word last name)
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(' ') || "";

    try {
        await setDoc(doc(db, "users", currentUser.uid), {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            addressStreet: street,
            addressCity: city,
            addressZip: zip,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        alert("Profile updated successfully!");

        // Update UI immediately (Hero Name)
        document.getElementById('heroNameDisplay').textContent = fullNameInput;

        // Reset UI
        const inputs = document.querySelectorAll('#profileForm input');
        inputs.forEach(input => input.disabled = true);
        document.getElementById('saveProfileBtn').style.display = 'none';
        document.getElementById('avatarEditBtn').style.display = 'none';
        document.getElementById('btnEnableEdit').style.display = 'block';

    } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to update profile: " + err.message);
    }
};

// --- NEW CONTRACT LOGIC (FIRESTORE) ---
const contractFormContainer = document.getElementById('contractFormContainer');
const contractSuccessContainer = document.getElementById('contractSuccessContainer');

async function handleContractSubmit(e) {
    e.preventDefault();

    if (!currentUser) return;

    const title = document.getElementById('dealTitleInput').value;
    const counterpartyEmail = document.getElementById('dealCounterparty').value;
    const type = document.getElementById('contractType').value;
    const effectiveDate = document.getElementById('effectiveDate').value;
    const totalValue = document.querySelector('#financeSection input[type="number"]')?.value || "0";
    const userRole = currentMode;

    try {
        await addDoc(collection(db, "contracts"), {
            title: title,
            type: type,
            creatorUid: currentUser.uid,
            creatorEmail: currentUser.email,
            creatorRole: userRole,
            counterpartyEmail: counterpartyEmail,
            effectiveDate: effectiveDate,
            totalValue: totalValue,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        // Update Preview UI
        document.getElementById('previewTitle').textContent = title;
        document.getElementById('previewSender').textContent = currentUser.email;
        document.getElementById('previewCounterparty').textContent = counterpartyEmail;
        document.getElementById('previewDate').textContent = effectiveDate;

        // Show Success
        contractFormContainer.style.display = 'none';
        contractSuccessContainer.style.display = 'block';

    } catch (err) {
        console.error("Error creating contract:", err);
        alert("Failed to create contract: " + err.message);
    }
}
window.handleContractSubmit = handleContractSubmit;

// --- DASHBOARD DATA FETCHING (FIRESTORE) ---
const navPanel = document.getElementById('navPanel');
const stageContent = document.getElementById('stageContent');
let currentActiveKey = 'active';
let dashboardData = {}; // GLOBAL DATA STATE


function setupRealtimeListener(uid) {
    const q = query(collection(db, "contracts"), where("creatorUid", "==", uid));

    onSnapshot(q, (snapshot) => {
        allContracts = [];
        snapshot.forEach((doc) => {
            allContracts.push({ id: doc.id, ...doc.data() });
        });
        updateDashboardUI();
    });
}

function updateDashboardUI() {
    // Filter by current mode. 
    // Assumption: 'creatorRole' field in firestore matches 'customer' or 'vendor'
    const filtered = allContracts.filter(c => c.creatorRole === currentMode);

    const active = filtered.filter(c => c.status === 'active');
    const pending = filtered.filter(c => c.status === 'pending');
    const overdue = filtered.filter(c => c.status === 'overdue');

    // Update Global Data based on Mode
    if (currentMode === 'vendor') {
        dashboardData = {
            active: {
                id: 'active',
                label: "Active Bonds", // Matching before.html label
                count: active.length,
                items: active,
                status: 'active'
            },
            incoming: { // Changed from pending to match before.html
                id: 'incoming',
                label: "Incoming Requests",
                count: pending.length,
                items: pending, // Mapping pending contracts to incoming for now
                status: 'pending'
            }
        };
    } else {
        // Customer Mode
        dashboardData = {
            active: {
                id: 'active',
                label: "Active Bonds",
                count: active.length,
                items: active,
                status: 'active'
            },
            pending: {
                id: 'pending',
                label: "Pending Approvals",
                count: pending.length,
                items: pending,
                status: 'pending'
            },
            overdue: {
                id: 'overdue',
                label: "Overdue Bonds",
                count: overdue.length,
                items: overdue,
                status: 'overdue'
            }
        };
    }

    renderNav();
}

function renderNav() {
    navPanel.innerHTML = '';
    const keys = Object.keys(dashboardData);

    // Default to first if current is invalid
    if (!keys.includes(currentActiveKey)) {
        currentActiveKey = keys[0];
    }

    keys.forEach(key => {
        const item = dashboardData[key];
        const navItem = document.createElement('div');
        navItem.className = `nav-item ${key === currentActiveKey ? 'active' : ''}`;
        navItem.dataset.status = item.status || 'active';
        navItem.dataset.key = key;

        navItem.innerHTML = `
            <div class="nav-label">${item.label}</div>
            <div class="nav-amount">${item.count}</div>
        `;

        // HOVER EFFECT LOGIC
        navItem.addEventListener('mouseenter', () => updateSelection(key));
        navItem.addEventListener('click', () => updateSelection(key));

        navPanel.appendChild(navItem);
    });

    forceStageUpdate(currentActiveKey);
}

function updateSelection(key) {
    if (key === currentActiveKey && stageContent.classList.contains('visible')) return;
    currentActiveKey = key;

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.key === key);
    });

    stageContent.classList.remove('visible');

    setTimeout(() => {
        renderStageContent(key);
        stageContent.classList.add('visible');
    }, 150);
}

function forceStageUpdate(key) {
    if (!key) return;
    renderStageContent(key);
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.key === key);
    });
    stageContent.classList.remove('visible');
    setTimeout(() => stageContent.classList.add('visible'), 50);
}

function renderStageContent(key) {
    const item = dashboardData[key];
    if (!item) return;

    // determine actions based on key (simulating the logic from before.html)
    // In before.html: key === 'pending' || key === 'incoming' (vendor)
    // Here we use the key directly or status
    const showActions = (key === 'pending');

    stageContent.innerHTML = `
        <div class="stage-header">
          <div class="stage-title">${item.label}</div>
          <div class="stage-meta">${item.count} items</div>
        </div>
        <div class="stage-grid">
            ${item.items.length === 0 ? '<p style="padding:20px; color:#64748b;">No items found.</p>' : ''}
            ${item.items.map(c => `
                <div class="detail-card">
                  <div class="detail-name">${c.title}</div>
                  <div class="detail-desc">${c.type} • ${c.effectiveDate}</div>
                  <div class="click-hint">${showActions ? 'Review & Act' : 'View Details'}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// --- WIRING UP BUTTONS ---
btnProfileDetails.addEventListener('click', (e) => { e.stopPropagation(); openPanel(profileSlidePanel); });
closeProfilePanel.addEventListener('click', closeAllPanels);

btnNewDeal.addEventListener('click', (e) => { e.stopPropagation(); openPanel(newDealSlidePanel); });
closeNewDealPanel.addEventListener('click', closeAllPanels);

btnCalendar.addEventListener('click', (e) => { e.stopPropagation(); openPanel(calendarSlidePanel); });
closeCalendarPanel.addEventListener('click', closeAllPanels);

btnRequestLog.addEventListener('click', (e) => { e.stopPropagation(); openPanel(requestLogPanel); });
closeRequestLogPanel.addEventListener('click', closeAllPanels);

btnNotifications.addEventListener('click', (e) => { e.stopPropagation(); openPanel(notificationSlidePanel); });
closeNotificationPanel.addEventListener('click', closeAllPanels);

btnHistory.addEventListener('click', (e) => { e.stopPropagation(); openPanel(historySlidePanel); });
closeHistoryPanel.addEventListener('click', closeAllPanels);

closeViewContractPanel.addEventListener('click', closeAllPanels);
slideOverlay.addEventListener('click', closeAllPanels);

// --- AUTH INIT ---
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "amantra.html";
    } else {
        currentUser = user;
        fetchUserProfile(user.uid);
        setupRealtimeListener(user.uid);
    }
});

// Sign Out
const btnSignOut = document.getElementById('btnSignOut');
if (btnSignOut) {
    btnSignOut.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign Out Error:", error);
        }
    });
}

// --- HELPER WRAPPERS ---
window.copyToClipboard = function () {
    alert("Copied!");
};

// Mode Toggle
// Mode Toggle
const btnCustomer = document.getElementById('btnCustomer');
const btnVendor = document.getElementById('btnVendor');

function updateFormLabels() {
    const lblCounterparty = document.getElementById('lblCounterparty');
    const inputCounterparty = document.getElementById('dealCounterparty');

    if (lblCounterparty && inputCounterparty) {
        if (currentMode === 'vendor') {
            lblCounterparty.textContent = "Customer (Email/ID)";
            inputCounterparty.placeholder = "customer@example.com";
        } else {
            lblCounterparty.textContent = "Vendor (Email/ID)";
            inputCounterparty.placeholder = "vendor@example.com";
        }
    }
}

if (btnCustomer && btnVendor) {
    btnCustomer.addEventListener('click', () => {
        currentMode = 'customer';
        btnCustomer.classList.add('active');
        btnVendor.classList.remove('active');
        updateFormLabels();
        updateDashboardUI();
        currentActiveKey = 'active'; // Reset to default tab
    });
    btnVendor.addEventListener('click', () => {
        currentMode = 'vendor';
        btnVendor.classList.add('active');
        btnCustomer.classList.remove('active');
        updateFormLabels();
        updateDashboardUI();
        currentActiveKey = 'active'; // Reset to default tab
    });
}

// Contract Form Config
const contractTypeSelect = document.getElementById('contractType');
const termsInput = document.getElementById('termsInput');
const financeSection = document.getElementById('financeSection');

const CONTRACT_CONFIG = {
    'Service Agreement': { hasFinance: true, placeholder: "Service obligations..." },
    'Non-Disclosure (NDA)': { hasFinance: false, placeholder: "Confidentiality terms..." },
    'Employment Contract': { hasFinance: true, placeholder: "Employment terms..." },
    'Sales of Goods': { hasFinance: true, placeholder: "Sales terms..." },
    'Loan / Bond': { hasFinance: true, placeholder: "Loan terms..." }
};

function renderContractFields(type) {
    const config = CONTRACT_CONFIG[type];
    if (!config) return;
    if (termsInput) termsInput.placeholder = config.placeholder;
    if (financeSection) financeSection.style.display = config.hasFinance ? 'block' : 'none';
}

if (contractTypeSelect) {
    contractTypeSelect.addEventListener('change', (e) => renderContractFields(e.target.value));
    renderContractFields('Service Agreement');
}
