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
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// --- GLOBAL VARIABLES ---
let currentUser = null;
let currentMode = 'customer'; // or 'vendor'
let allContracts = [];
// This function saves a new log to your Firebase 'auditLogs' collection
async function createAuditLog(action, details) {
    if (!currentUser) return; // Don't do anything if no one is logged in
    try {
        await addDoc(collection(db, "auditLogs"), {
            timestamp: serverTimestamp(),
            userEmail: currentUser.email,
            userId: currentUser.uid,
            action: action,
            details: details
        });
    } catch (e) {
        console.error("Audit log failed:", e);
    }
}

// --- DROPDOWN LOGIC ---
const profileTrigger = document.getElementById('profileTrigger');
const profileDropdown = document.getElementById('profileDropdown');

if (profileTrigger) {
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close notification dropdown if open
        if (typeof notificationDropdown !== 'undefined' && notificationDropdown) {
            notificationDropdown.classList.remove('active');
        }
        profileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        const isProfile = profileTrigger.contains(e.target) || profileDropdown.contains(e.target);
        const isNotif = (typeof btnNotifications !== 'undefined' && btnNotifications && btnNotifications.contains(e.target)) ||
            (typeof notificationDropdown !== 'undefined' && notificationDropdown && notificationDropdown.contains(e.target));

        if (!isProfile) profileDropdown.classList.remove('active');
        // Notification logic handled in its own block but global click should overlap safely
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
const pendingSlidePanel = document.getElementById('pendingSlidePanel');

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
const closePendingPanel = document.getElementById('closePendingPanel');


// Make global for onclicks
window.requestLogPanel = requestLogPanel;
window.openPanel = openPanel;

function closeAllPanels() {
    [profileSlidePanel, newDealSlidePanel, calendarSlidePanel, viewContractPanel, requestLogPanel, notificationSlidePanel, historySlidePanel, pendingSlidePanel].forEach(p => { if (p) p.classList.remove('active') });
    slideOverlay.classList.remove('active');
}

function openPanel(panel) {
    closeAllPanels();
    if (!panel) return;
    panel.classList.add('active');
    slideOverlay.classList.add('active');
}

// Make globally available
window.downloadContractPDF = function () {
    // Find the visible paper-preview
    const previews = document.querySelectorAll('.paper-preview');
    let element = null;
    for (const p of previews) {
        if (p.offsetParent !== null) { // Check visibility
            element = p;
            break;
        }
    }

    // Fallback to the specific view panel if nothing else obvious (or first found)
    if (!element) element = document.querySelector('.paper-preview');
    if (!element) return;

    const opt = {
        margin: 1,
        filename: 'contract_agreement.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
};

window.sendContractEmail = function () {
    const title = document.getElementById('viewContractTitle')?.textContent || "Contract";
    const bodyText = document.getElementById('viewContractBody')?.textContent || "";

    // Construct email body with contract details
    const emailBody = encodeURIComponent(`
Hello,

Here is the contract agreement for: ${title}

---
${bodyText}
---

Please review and sign.
    `);

    window.location.href = `mailto:?subject=Contract Agreement: ${title}&body=${emailBody}`;
};
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
    const counterpartyName = document.getElementById('dealCounterpartyName').value;
    const creatorName = document.getElementById('profileName').value || "Creator"; // Fallback
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
            creatorName: creatorName,
            creatorRole: userRole === 'vendor' ? 'vender' : userRole, // Normalize to new spelling
            counterpartyEmail: counterpartyEmail,
            counterpartyName: counterpartyName,
            effectiveDate: effectiveDate,
            totalValue: totalValue,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        // Update Preview UI
        document.getElementById('previewTitle').textContent = title;
        document.getElementById('previewSender').textContent = creatorName;
        document.getElementById('previewCounterparty').textContent = counterpartyName;
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


const contractsState = {
    created: [],
    incoming: []
};

function setupRealtimeListener(uid, email) {
    // 1. Contracts Created by Me
    const qCreated = query(collection(db, "contracts"), where("creatorUid", "==", uid));
    onSnapshot(qCreated, (snapshot) => {
        contractsState.created = [];
        snapshot.forEach((doc) => {
            contractsState.created.push({ id: doc.id, ...doc.data() });
        });
        mergeAndUpdate();
    });

    // 2. Contracts Sent TO Me (Incoming)
    // Assumption: 'counterpartyEmail' matches the logged-in user's email
    if (email) {
        const qIncoming = query(collection(db, "contracts"), where("counterpartyEmail", "==", email));
        onSnapshot(qIncoming, (snapshot) => {
            contractsState.incoming = [];
            snapshot.forEach((doc) => {
                contractsState.incoming.push({ id: doc.id, ...doc.data() });
            });
            mergeAndUpdate();
        });
    }
}

function mergeAndUpdate() {
    // Merge datasets
    const all = [...contractsState.created, ...contractsState.incoming];
    // Deduplicate by ID
    const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
    allContracts = unique;
    updateDashboardUI();
    generateNotifications(); // Update notifications based on new data
}

async function acceptContract(contractId) {
    if (!confirm("Are you sure you want to accept this contract? This action is binding.")) return;

    try {
        const contractRef = doc(db, "contracts", contractId);
        await setDoc(contractRef, {
            status: 'active',
            acceptedAt: new Date().toISOString(),
            acceptedBy: currentUser.email,
            acceptedUid: currentUser.uid
        }, { merge: true });

        alert("Contract accepted successfully!");
        closeAllPanels();
    } catch (e) {
        console.error("Error accepting contract:", e);
        alert("Failed to accept: " + e.message);
    }
}
window.acceptContract = acceptContract;

function updateDashboardUI() {
    const filtered = allContracts;

    // Category sorting
    const active = [];
    const overdue = [];
    const pendingMyApproval = [];
    const pendingOthersApproval = [];

    // Filter based on Current Mode
    filtered.forEach(c => {
        const isCreator = (c.creatorUid === currentUser.uid);

        // STRICT LOGIC:
        // Customer Mode = RECEIVED (I am not the creator)
        // Vender Mode   = SENT     (I am the creator)

        let shouldInclude = false;

        if (currentMode === 'customer') {
            if (!isCreator) shouldInclude = true;
        } else {
            // Vender Mode
            if (isCreator) shouldInclude = true;
        }

        if (shouldInclude) {
            if (c.status === 'active') {
                active.push(c);
            } else if (c.status === 'pending') {
                if (isCreator) pendingOthersApproval.push(c);
                else pendingMyApproval.push(c);
            } else if (c.status === 'overdue') {
                overdue.push(c);
            }
        }
    });

    const allPending = [...pendingMyApproval, ...pendingOthersApproval];

    // Unified Dashboard Data Structure
    dashboardData = {
        active: {
            id: 'active',
            label: "Active Bonds",
            count: active.length,
            items: active,
            status: 'active'
        },
        overdue: {
            id: 'overdue',
            label: "Overdue Bonds",
            count: overdue.length,
            items: overdue,
            status: 'overdue'
        },
        pending: {
            id: 'pending',
            label: "Pending Approvals",
            count: allPending.length,
            items: allPending,
            status: 'pending'
        }
    };

    // Update Pending Badge in Dock
    const pendingBadge = document.getElementById('pendingBadge');
    if (pendingBadge) {
        if (allPending.length > 0) {
            pendingBadge.style.display = 'block';
            // Optional: pendingBadge.textContent = allPending.length;
        } else {
            pendingBadge.style.display = 'none';
        }
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
        if (key === 'pending') return; 

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
        
        // CLICK LOGIC (This records the action to your log)
        navItem.addEventListener('click', () => {
            updateSelection(key);
            createAuditLog("Navigation", `User viewed section: ${item.label}`);
        });

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

    stageContent.innerHTML = `
        <div class="stage-header">
          <div class="stage-title">${item.label}</div>
          <div class="stage-meta">${item.count} items</div>
        </div>
        <div class="stage-grid">
            ${item.items.length === 0 ? '<p style="padding:20px; color:#64748b;">No items found.</p>' : ''}
            ${item.items.map(c => {
        // Dynamic Hint Logic
        let actionHint = 'View Details';
        const isIncoming = (c.creatorUid !== currentUser.uid && c.status === 'pending');
        const isMyPending = (c.creatorUid === currentUser.uid && c.status === 'pending');

        if (isIncoming) actionHint = 'Review & Accept';
        if (isMyPending) actionHint = 'Waiting...';

        return `
                <div class="detail-card" data-id="${c.id}">
                  <div class="detail-name">${c.title}</div>
                  <div class="detail-desc">${c.type} • ${c.effectiveDate}</div>
                  <div class="click-hint">${actionHint}</div>
                </div>
            `}).join('')}
        </div>
    `;
}

// 4. Click Delegation for Cards
stageContent.addEventListener('click', (e) => {
    const card = e.target.closest('.detail-card');
    if (card && card.dataset.id) {
        openContractDetails(card.dataset.id);
    }
});

function openContractDetails(id) {
    const contract = allContracts.find(c => c.id === id);
    if (!contract) return;

    // Logic to decide which panel/state to show
    const isIncoming = (contract.creatorUid !== currentUser.uid && contract.status === 'pending');
    const isActive = (contract.status === 'active');

    // Populate View Panel
    document.getElementById('viewContractTitle').textContent = contract.title;
    document.getElementById('viewParty1').textContent = `${contract.creatorName || contract.creatorEmail} (${contract.creatorRole})`;
    document.getElementById('viewParty2').textContent = `${contract.counterpartyName || contract.counterpartyEmail} (You)`;

    // For body, we might want to store/fetch terms. For now using hardcoded or generic text if not in DB.
    document.getElementById('viewContractBody').innerHTML = `
        <strong>Type:</strong> ${contract.type}<br>
        <strong>Effective Date:</strong> ${contract.effectiveDate}<br>
        <strong>Value:</strong> ₹${contract.totalValue}<br><br>
        <em>(Full terms would be rendered here based on the contract template...)</em>
    `;

    // Configure Buttons based on state
    const reviewState = document.getElementById('reviewState');
    const acceptedState = document.getElementById('acceptedState');
    const requestChangeState = document.getElementById('requestChangeState');
    const requestSuccessState = document.getElementById('requestSuccessState');

    // Reset views
    reviewState.style.display = 'none';
    acceptedState.style.display = 'none';
    requestChangeState.style.display = 'none';
    requestSuccessState.style.display = 'none';

    if (isActive) {
        acceptedState.style.display = 'block';
        document.getElementById('officialTitle').textContent = contract.title;
        document.getElementById('officialP1').textContent = contract.creatorEmail;
        document.getElementById('officialP2').textContent = contract.counterpartyEmail;
        document.getElementById('officialTimestamp').textContent = new Date(contract.acceptedAt).toLocaleString();
        document.getElementById('officialAgmtId').textContent = `#AGT-${contract.id.substring(0, 6).toUpperCase()}`;
    } else if (isIncoming) {
        reviewState.style.display = 'block';
        // Ensure Accept button calls accept with ID
        const btnAccept = reviewState.querySelector('.btn-action.accept');
        // Remove old listeners involves cloning or simple onclick replace
        btnAccept.onclick = () => acceptContract(id);
    } else {
        // My Pending Deal -> Show generic info or "Waiting"
        reviewState.style.display = 'block';
        // Hide actions if it's my own pending deal
        const footer = reviewState.querySelector('.contract-actions-footer');
        if (footer) footer.style.display = 'none';

        document.getElementById('viewContractBody').innerHTML += `<br><br><strong style="color:#eab308;">Waiting for counterparty to accept.</strong>`;
    }

    openPanel(viewContractPanel);
}
window.openContractDetails = openContractDetails;

// --- PENDING PANEL LOGIC ---
function renderPendingInPanel() {
    const listContainer = document.getElementById('pendingListContainer');
    if (!listContainer) return;

    // Get all pending items (unified)
    const allPending = dashboardData.pending ? dashboardData.pending.items : [];

    listContainer.innerHTML = `
        <div class="stage-grid" style="grid-template-columns: 1fr;">
            ${allPending.length === 0 ? '<p style="padding:20px; color:#64748b;">No pending items.</p>' : ''}
            ${allPending.map(c => {
        let actionHint = 'View Details';
        const isIncoming = (c.creatorUid !== currentUser.uid && c.status === 'pending');
        const isMyPending = (c.creatorUid === currentUser.uid && c.status === 'pending');
        if (isIncoming) actionHint = 'Review & Accept';
        if (isMyPending) actionHint = 'Waiting...';

        return `
                 <div class="detail-card" onclick="openContractDetails('${c.id}')">
                   <div style="display:flex; justify-content:space-between;">
                     <div class="detail-name">${c.title}</div>
                     <div class="status-badge ${isIncoming ? 'info' : 'warning'}">${isIncoming ? 'Incoming' : 'Sent'}</div>
                   </div>
                   <div class="detail-desc">${c.type} • ${c.effectiveDate}</div>
                   <div class="click-hint">${actionHint}</div>
                 </div>
                 `;
    }).join('')}
        </div>
    `;
}

// --- WIRING UP BUTTONS ---
btnProfileDetails.addEventListener('click', (e) => { e.stopPropagation(); openPanel(profileSlidePanel); });
closeProfilePanel.addEventListener('click', closeAllPanels);

const btnPending = document.getElementById('btnPending');
if (btnPending) {
    btnPending.addEventListener('click', (e) => {
        // e.stopPropagation(); // Panels usually managed by openPanel
        renderPendingInPanel();
        openPanel(document.getElementById('pendingSlidePanel'));
    });
}
if (closePendingPanel) {
    closePendingPanel.addEventListener('click', closeAllPanels);
}

btnNewDeal.addEventListener('click', (e) => {
    e.stopPropagation();
    // Reset Panel State
    if (contractFormContainer && contractSuccessContainer) {
        contractFormContainer.style.display = 'block';
        contractSuccessContainer.style.display = 'none';
    }
    // Set default Effective Date to today
    const dateInput = document.getElementById('effectiveDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    openPanel(newDealSlidePanel);
});
closeNewDealPanel.addEventListener('click', closeAllPanels);

btnCalendar.addEventListener('click', (e) => { e.stopPropagation(); openPanel(calendarSlidePanel); });
closeCalendarPanel.addEventListener('click', closeAllPanels);

btnRequestLog.addEventListener('click', (e) => { e.stopPropagation(); openPanel(requestLogPanel); });
closeRequestLogPanel.addEventListener('click', closeAllPanels);

// Notification Dropdown Logic
const notificationDropdown = document.getElementById('notificationDropdown');
const dropdownNotifList = document.getElementById('dropdownNotifList');
const notifBadge = document.getElementById('notifBadge');

let currentNotifications = [];
let readNotificationIds = new Set(); // Track read notifications

function generateNotifications() {
    currentNotifications = [];

    allContracts.forEach(c => {
        // 1. New Bond (Incoming Request)
        if (c.status === 'pending' && c.creatorUid !== currentUser.uid) {
            currentNotifications.push({
                title: "New Contract Request",
                msg: `${c.creatorName || 'Someone'} sent you "${c.title}"`,
                time: c.createdAt || new Date().toISOString(),
                type: 'info', // Use for styling
                id: c.id
            });
        }

        // 2. Someone Accepted My Bond
        if (c.status === 'active' && c.creatorUid === currentUser.uid) {
            currentNotifications.push({
                title: "Contract Accepted",
                msg: `${c.counterpartyName || 'Counterparty'} accepted "${c.title}"`,
                time: c.acceptedAt || new Date().toISOString(),
                type: 'success',
                id: c.id
            });
        }

        // 3. Overdue Bond (or Active nearing maturity - simplified to 'overdue' status for now)
        if (c.status === 'overdue') {
            currentNotifications.push({
                title: "Overdue Contract",
                msg: `Action required: "${c.title}" is overdue.`,
                time: new Date().toISOString(),
                type: 'danger',
                id: c.id
            });
        }
    });

    // DUMMY NOTIFICATION FOR DEMO
    currentNotifications.push({
        title: "Welcome to Amantra",
        msg: "This is a sample notification to show functionality.",
        time: new Date().toISOString(),
        type: 'info',
        id: 'dummy-1'
    });

    // Sort by time (newest first)
    currentNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    updateNotificationBadge();
    // If dropdown is open, re-render
    if (notificationDropdown.classList.contains('active')) {
        renderNotifications();
    }
}

function updateNotificationBadge() {
    // Calculate unread count
    const unreadCount = currentNotifications.filter(n => !readNotificationIds.has(n.id)).length;

    if (unreadCount > 0) {
        if (notifBadge) {
            notifBadge.style.display = 'block';
            notifBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        }
    } else {
        if (notifBadge) notifBadge.style.display = 'none';
    }
}

function renderNotifications() {
    if (!dropdownNotifList) return;

    dropdownNotifList.innerHTML = '';

    if (currentNotifications.length === 0) {
        dropdownNotifList.innerHTML = `
            <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 0.9rem; font-style: italic;">
                No notifications
            </div>
        `;
        return;
    }

    currentNotifications.forEach(n => {
        const isRead = readNotificationIds.has(n.id);
        const item = document.createElement('div');
        item.className = 'notification-item'; // Use CSS class for hover and flex layout (ported from before.html)

        // Dim if read 
        if (isRead) {
            item.style.opacity = '0.6';
        }

        // Map types to icon classes and SVGs
        let iconType = 'info';
        if (n.type === 'success') iconType = 'success';
        else if (n.type === 'danger') iconType = 'danger';
        else if (n.type === 'warning') iconType = 'warning';

        // SVG logic matching before.html style
        let iconSvg = '';
        if (n.type === 'success') iconSvg = '<polyline points="20 6 9 17 4 12"></polyline>';
        else if (n.type === 'danger') iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
        else if (n.type === 'warning') iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line>';
        else iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line>'; // Info

        item.innerHTML = `
            <div class="notif-icon ${iconType}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>
            </div>
            <div class="notif-content">
                <div class="notif-text">${n.title}: ${n.msg}</div>
                <div class="notif-time">${new Date(n.time).toLocaleDateString()}</div>
            </div>
            ${!isRead ? '<div class="notif-unread"></div>' : ''}
        `;

        item.onclick = () => {
            // Mark as read
            readNotificationIds.add(n.id);
            updateNotificationBadge();

            // Open relevant contract if real ID
            if (n.id && n.id !== 'dummy-1') {
                openContractDetails(n.id);
                notificationDropdown.classList.remove('active');
                btnNotifications.classList.remove('active');
            } else {
                renderNotifications(); // checking logic
            }
        };

        dropdownNotifList.appendChild(item);
    });
}

btnNotifications.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllPanels();

    // Update notification content
    renderNotifications();

    // Close profile dropdown
    if (profileDropdown) profileDropdown.classList.remove('active');

    // Toggle Notification
    const isActive = notificationDropdown.classList.toggle('active');
    if (isActive) {
        btnNotifications.classList.add('active');
    } else {
        btnNotifications.classList.remove('active');
    }
});

// Global Click for Notification Dropdown
document.addEventListener('click', (e) => {
    if (notificationDropdown && !notificationDropdown.contains(e.target) && !btnNotifications.contains(e.target)) {
        notificationDropdown.classList.remove('active');
        btnNotifications.classList.remove('active');
    }
});

// Remove old panel listener
// closeNotificationPanel.addEventListener('click', closeAllPanels);

btnHistory.addEventListener('click', (e) => { e.stopPropagation(); openPanel(historySlidePanel); });
closeHistoryPanel.addEventListener('click', closeAllPanels);

closeViewContractPanel.addEventListener('click', closeAllPanels);
slideOverlay.addEventListener('click', closeAllPanels);

// --- CALENDAR LOGIC ---

// Dummy Events Data
// Dummy Events Data - CLEARED
const calendarEvents = [];

let currentCalendarDate = new Date(2025, 11, 1); // Start Dec 2025

function renderCalendar() {
    const monthTitle = document.getElementById('calendarMonthTitle');
    const datesGrid = document.getElementById('calendarDatesGrid');

    if (!monthTitle || !datesGrid) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    // Update Header
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthTitle.textContent = `${monthNames[month]} ${year}`;

    // Clear Grid
    datesGrid.innerHTML = '';

    // Calculate Days
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous Month Fillers
    for (let i = 0; i < firstDayIndex; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-date other-month';
        datesGrid.appendChild(div);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvent = calendarEvents.some(e => e.date === dateStr);

        const div = document.createElement('div');
        div.className = 'calendar-date';
        div.textContent = i;
        div.dataset.date = dateStr;

        if (hasEvent) {
            const dot = document.createElement('div');
            dot.className = 'calendar-dot';
            div.appendChild(dot);
        }

        div.onclick = () => selectCalendarDate(dateStr, div);
        datesGrid.appendChild(div);
    }

    // Default select today if in month, or first day
    // For demo, let's select Dec 24 if visible
    const targetDate = document.querySelector(`.calendar-date[data-date="2025-12-24"]`);
    if (targetDate) {
        selectCalendarDate('2025-12-24', targetDate);
    } else {
        // Select first day
        const first = datesGrid.querySelector('.calendar-date:not(.other-month)');
        if (first) selectCalendarDate(first.dataset.date, first);
    }
}

function selectCalendarDate(dateStr, el) {
    // Highlight
    document.querySelectorAll('.calendar-date').forEach(d => d.classList.remove('active'));
    if (el) el.classList.add('active');

    // Update Details
    const display = document.getElementById('selectedDateDisplay');
    const list = document.getElementById('calendarEventsList');

    // Format Display Date
    const d = new Date(dateStr);
    const dateOptions = { month: 'short', day: 'numeric' };
    if (display) display.textContent = d.toLocaleDateString('en-US', dateOptions);

    // Filter Events
    const events = calendarEvents.filter(e => e.date === dateStr);

    if (list) {
        if (events.length === 0) {
            list.innerHTML = `<p style="color:#94a3b8; font-size:0.8rem; font-style:italic;">No events scheduled.</p>`;
        } else {
            list.innerHTML = events.map(e => `
                <div class="event-detail-item">
                    <div class="event-time">${e.time}</div>
                    <div class="event-title">${e.title}</div>
                </div>
            `).join('');
        }
    }
}

// Nav Listeners
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

if (prevMonthBtn) {
    prevMonthBtn.onclick = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    };
}
if (nextMonthBtn) {
    nextMonthBtn.onclick = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    };
}

// Open Logic Update
window.markAsRead = (el) => {
    el.style.opacity = '0.5';
    el.querySelector('.notif-unread')?.remove();
    // Decrement badge
    const badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
};

// --- AUTH INIT ---
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "amantra.html";
    } else {
        currentUser = user;
        fetchUserProfile(user.uid);
        setupRealtimeListener(user.uid, user.email);
        // Initial Render of Calendar
        renderCalendar();
    }
});

// Sign Out 
const btnSignOut = document.getElementById('btnSignOut');
if (btnSignOut) {
    btnSignOut.addEventListener('click', async () => {
        // This line records the log before the logout happens
        await createAuditLog("Sign Out", "User manually signed out of the dashboard");

        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Sign Out Error:", error);
        }
    });
}

// --- HELPER WRAPPERS ---


// Mode Toggle
const btnCustomer = document.getElementById('btnCustomer');
const btnVender = document.getElementById('btnVender');

function updateFormLabels() {
    const lblCounterparty = document.getElementById('lblCounterparty');
    const inputCounterparty = document.getElementById('dealCounterparty');

    if (lblCounterparty && inputCounterparty) {
        if (currentMode === 'vender') {
            lblCounterparty.textContent = "Customer (Email/ID)";
            inputCounterparty.placeholder = "customer@example.com";
        } else {
            lblCounterparty.textContent = "Vender (Email/ID)";
            inputCounterparty.placeholder = "vender@example.com";
        }
    }
}

if (btnCustomer && btnVender) {
    // 1. Update the Customer button click
    btnCustomer.addEventListener('click', () => {
        currentMode = 'customer';
        btnCustomer.classList.add('active');
        btnVender.classList.remove('active');
        updateFormLabels();
        updateDashboardUI();
        currentActiveKey = 'active';

        // --- ADD THIS LINE BELOW ---
        createAuditLog("Mode Switch", "User switched to Customer mode");
    });

    // 2. Update the Vender button click
    btnVender.addEventListener('click', () => {
        currentMode = 'vender';
        btnVender.classList.add('active');
        btnCustomer.classList.remove('active');
        updateFormLabels();
        updateDashboardUI();
        currentActiveKey = 'active';

        // --- ADD THIS LINE BELOW ---
        createAuditLog("Mode Switch", "User switched to Vendor mode");
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

// PWA Install Prompt Logic
let deferredPrompt;
const installBtn = document.getElementById('btnInstallApp');

if (installBtn) {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        installBtn.style.display = 'flex'; // Using flex for dashboard dropdown item
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            // Hide the app provided install promotion
            installBtn.style.display = 'none';
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            createAuditLog("PWA Install", `User response: ${outcome}`);
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
        }
    });

    window.addEventListener('appinstalled', () => {
        // Hide the app-provided install promotion
        installBtn.style.display = 'none';
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
        console.log('PWA was installed');
    });
}

