import { state, saveData } from './state.js';


export function renderDashboard() {
    const agreementsList = document.getElementById("agreementsList");
    const btnCreateRequest = document.getElementById("btnCreateRequest");

    agreementsList.innerHTML = "";

    // Toggle Create Button
    if (state.currentUser.role === "Customer") {
        btnCreateRequest.classList.remove("hidden");
    } else {
        btnCreateRequest.classList.add("hidden");
    }

    // Update Dashboard Title
    const headerTitle = document.querySelector(".card-header h2");
    if (headerTitle) {
        if (state.currentUser.role === "Customer") {
            headerTitle.innerText = "My Requests";
        } else {
            headerTitle.innerText = "Vendor Dashboard";
        }
    }

    let allAgreements = state.currentUser.role === "Vendor"
        ? state.agreements
        : state.agreements.filter(a => a.createdBy === state.currentUser.username);

    let displayAgreements = [...allAgreements].reverse();

    if (state.currentTab === "active") {
        displayAgreements = displayAgreements.filter(a => a.status !== "Deal Ended" && a.deliveryStatus !== "Deal Ended");
    } else if (state.currentTab === "pending") {
        displayAgreements = displayAgreements.filter(a => a.status === "Deal Open" || a.status === "Pending");
    } else if (state.currentTab === "history") {
        displayAgreements = displayAgreements.filter(a => a.status === "Deal Ended" || a.deliveryStatus === "Deal Ended");
    } else if (state.currentTab === "calendar") {
        agreementsList.innerHTML = '<div style="text-align:center; padding:2rem; color:#666;">📅 Calendar View Placeholder<br>(Coming Soon)</div>';
        return;
    }

    if (displayAgreements.length === 0) {
        agreementsList.innerHTML = '<p class="empty-state">No agreements found in this category.</p>';
        return;
    }

    displayAgreements.forEach(agreement => {
        const item = document.createElement("div");
        item.className = "agreement-item";
        const creatorInfo = state.currentUser.role === "Vendor" ? `<br><small>By: ${agreement.createdBy}</small>` : "";

        item.innerHTML = `
            <div class="item-info">
                <h3>${agreement.product} (${agreement.quantity})</h3>
                <p>${agreement.id} • ${agreement.time}${creatorInfo}</p>
            </div>
            <span class="status-badge ${getBadgeClass(agreement.status)}">${agreement.status}</span>
        `;
        item.addEventListener("click", () => {
            state.currentAgreementId = agreement.id;
            saveData(); // Persist the ID
            window.location.href = "agreement.html";
        });
        agreementsList.appendChild(item);
    });
}

export function renderAgreementDetails(agreement) {
    document.getElementById("agreementId").innerText = agreement.id;
    document.getElementById("timestamp").innerText = agreement.time;
    updateStatusBadge(agreement.status);
    document.getElementById("qrCode").src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(agreement.id)}`;
}

export function updateRoadmap(status) {
    const steps = ["Deal Open", "In Progress", "Deal Confirmed", "Deal Ended"];

    // Find index
    const currentIndex = steps.indexOf(status);
    const validIndex = currentIndex === -1 ? 0 : currentIndex;

    const trackingItems = document.querySelectorAll(".tracking-item");

    trackingItems.forEach((item) => {
        const stepName = item.getAttribute("data-step");
        const stepIndex = steps.indexOf(stepName);

        item.classList.remove("active", "completed");

        if (stepIndex < validIndex) {
            item.classList.add("completed");
        } else if (stepIndex === validIndex) {
            item.classList.add("active");
        }
    });
}

export function updateAgreementStatus(newStatus) {
    const agreement = state.agreements.find(a => a.id === state.currentAgreementId);
    if (agreement) {
        agreement.status = newStatus;
        saveData();
        updateStatusBadge(newStatus);
    }
}

export function updateStatusBadge(status) {
    const statusBadge = document.getElementById("statusBadge");
    statusBadge.innerText = status;
    statusBadge.className = `status-badge ${getBadgeClass(status)}`;
}

function getBadgeClass(status) {
    if (status === "Deal Open" || status === "Pending") return "pending";
    if (status === "Confirmed" || status === "Deal Confirmed" || status === "Deal Ended") return "confirmed";
    if (status === "In Progress") return "progress";
    if (status === "Change Requested") return "change";
    return "pending";
}
