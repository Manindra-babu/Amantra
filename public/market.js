"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // State
    const state = {
        currentUser: null,
        currentAgreementId: null,
        agreements: [],
        users: [],
        currentTab: "active" // active, history, calendar
    };

    // DOM Elements - Views
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const profileSection = document.getElementById("profileSection");
    const customerSection = document.getElementById("customerSection");
    const vendorDashboard = document.getElementById("vendorDashboard");
    const agreementSection = document.getElementById("agreementSection");
    const deliverySection = document.getElementById("deliverySection");

    // DOM Elements - Navigation
    const appNav = document.getElementById("appNav");
    const btnNavHome = document.getElementById("btnNavHome");
    const btnNavProfile = document.getElementById("btnNavProfile");
    const btnNavLogout = document.getElementById("btnNavLogout");

    const btnShowRegister = document.getElementById("btnShowRegister");
    const btnShowLogin = document.getElementById("btnShowLogin");

    // Forms & Inputs
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const requestForm = document.getElementById("requestForm");
    const profileForm = document.getElementById("profileForm");

    // Registration Fields
    const regFirstName = document.getElementById("regFirstName");
    const regLastName = document.getElementById("regLastName");
    const regPhone = document.getElementById("regPhone");
    const regEmail = document.getElementById("regEmail");
    const btnVerifyOTP = document.getElementById("btnVerifyOTP");


    // Back Buttons
    const btnBackToLoginFromDashboard = document.getElementById("btnBackToLoginFromDashboard");
    const btnBackToDashboard = document.getElementById("btnBackToDashboard");
    const btnBackToLogin = document.getElementById("btnBackToLogin");

    // Action Buttons
    const btnConfirm = document.getElementById("btnConfirm");
    const btnRequestChange = document.getElementById("btnRequestChange");
    const deliveryStatusSelect = document.getElementById("deliveryStatus");
    const btnReadAloud = document.getElementById("btnReadAloud");
    const btnCreateRequest = document.getElementById("btnCreateRequest");

    // Dashboard Tabs
    const tabBtns = document.querySelectorAll(".tab-btn");
    const agreementsList = document.getElementById("agreementsList");

    // Display Elements
    const agreementIdDisplay = document.getElementById("agreementId");
    const timestampDisplay = document.getElementById("timestamp");
    const statusBadge = document.getElementById("statusBadge");
    const vendorActions = document.getElementById("vendorActions");
    const qrCodeImg = document.getElementById("qrCode");

    // --- Initialization ---
    loadData();
    checkSession();

    // --- Navigation Functions ---

    function showView(viewElement) {
        // Hide all views first
        [loginSection, registerSection, profileSection, customerSection, vendorDashboard, agreementSection].forEach(el => {
            el.classList.add("hidden");
            el.classList.remove("active-view");
        });

        // Hide delivery section by default
        deliverySection.classList.add("hidden");

        // Show target view
        viewElement.classList.remove("hidden");
        viewElement.classList.add("active-view");

        // Toggle Nav Bar
        if (viewElement === loginSection || viewElement === registerSection) {
            appNav.classList.add("hidden");
        } else {
            appNav.classList.remove("hidden");
        }
    }

    // --- Data Persistence ---
    function loadData() {
        const storedAgreements = localStorage.getItem("marketAgreements");
        if (storedAgreements) state.agreements = JSON.parse(storedAgreements);

        const storedUsers = localStorage.getItem("marketUsers");
        if (storedUsers) state.users = JSON.parse(storedUsers);
    }
    function saveData() {
        localStorage.setItem("marketAgreements", JSON.stringify(state.agreements));
        localStorage.setItem("marketUsers", JSON.stringify(state.users));
    }
    function checkSession() {
        const sessionUser = localStorage.getItem("marketCurrentUser");
        if (sessionUser) {
            state.currentUser = JSON.parse(sessionUser);
            routeUser(state.currentUser);
        } else {
            showView(loginSection);
        }
    }
    function routeUser(user) {
        // Both roles go to Dashboard now
        renderDashboard();
        showView(vendorDashboard);
    }

    // --- Auth Logic ---
    function login(username, password) {
        const user = state.users.find(u => u.username === username && u.password === password);
        if (user) {
            state.currentUser = user;
            localStorage.setItem("marketCurrentUser", JSON.stringify(state.currentUser));
            routeUser(state.currentUser);
        } else {
            alert("Invalid credentials!");
        }
    }

    function register(username, password, role) {
        if (state.users.find(u => u.username === username)) {
            alert("Username already exists!");
            return;
        }
        const newUser = {
            username, password, role,
            firstName: regFirstName.value,
            lastName: regLastName.value,
            phone: regPhone.value,
            email: regEmail.value,
            address: "", pic: ""
        };
        state.users.push(newUser);
        saveData();
        alert("Registration successful! Please login.");
        showView(loginSection);
    }

    function logout() {
        state.currentUser = null;
        localStorage.removeItem("marketCurrentUser");
        showView(loginSection);
    }

    // --- OTP Sim ---
    if (btnVerifyOTP) {
        btnVerifyOTP.addEventListener("click", () => {
            const otp = Math.floor(1000 + Math.random() * 9000);
            alert(`OTP Sent to ${regPhone.value || "your phone"}: ${otp}\n\n(Simulation Verified)`);
            btnVerifyOTP.innerText = "✅ Verified";
            btnVerifyOTP.classList.remove("btn-secondary");
            btnVerifyOTP.classList.add("btn-primary");
        });
    }

    // --- Event Listeners ---
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        login(document.getElementById("loginUsername").value, document.getElementById("loginPassword").value);
    });

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        register(document.getElementById("regUsername").value, document.getElementById("regPassword").value, document.getElementById("regRole").value);
    });

    btnShowRegister.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("registerForm").reset(); showView(registerSection); });
    btnShowLogin.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("loginForm").reset(); showView(loginSection); });

    btnNavLogout.addEventListener("click", logout);
    btnNavHome.addEventListener("click", () => { if (state.currentUser) routeUser(state.currentUser); });

    btnNavProfile.addEventListener("click", () => {
        if (state.currentUser) {
            document.getElementById("profileUsername").value = state.currentUser.username;
            document.getElementById("profileRole").value = state.currentUser.role;

            // Populate Editable Fields
            document.getElementById("profileFirstName").value = state.currentUser.firstName || "";
            document.getElementById("profileLastName").value = state.currentUser.lastName || "";
            document.getElementById("profilePhone").value = state.currentUser.phone || "";
            document.getElementById("profileEmail").value = state.currentUser.email || "";
            document.getElementById("profileAddress").value = state.currentUser.address || "";
            document.getElementById("profilePicUrl").value = state.currentUser.pic || "";

            // Visual Update
            document.getElementById("profileAvatar").src = state.currentUser.pic || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
            document.getElementById("profilePassword").value = "";
            showView(profileSection);
        }
    });

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userIndex = state.users.findIndex(u => u.username === state.currentUser.username);
        if (userIndex !== -1) {
            // Update All Editable Fields
            state.users[userIndex].firstName = document.getElementById("profileFirstName").value;
            state.users[userIndex].lastName = document.getElementById("profileLastName").value;
            state.users[userIndex].phone = document.getElementById("profilePhone").value;
            state.users[userIndex].email = document.getElementById("profileEmail").value;
            state.users[userIndex].address = document.getElementById("profileAddress").value;
            state.users[userIndex].pic = document.getElementById("profilePicUrl").value;

            const newPass = document.getElementById("profilePassword").value;
            if (newPass) state.users[userIndex].password = newPass;

            state.currentUser = state.users[userIndex]; // Update current session
            localStorage.setItem("marketCurrentUser", JSON.stringify(state.currentUser));
            saveData();

            alert("Profile Updated Successfully!");
            document.getElementById("profileAvatar").src = state.currentUser.pic || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
            document.getElementById("profilePassword").value = "";
        }
    });

    // Create Request & Back Buttons logic
    if (btnCreateRequest) {
        btnCreateRequest.addEventListener("click", () => {
            // Clear form fields if desired
            showView(customerSection);
        });
    }

    btnBackToLogin.addEventListener("click", () => {
        // "Back" from Request Form now goes to Dashboard
        renderDashboard();
        showView(vendorDashboard);
    });

    btnBackToLoginFromDashboard.addEventListener("click", logout); // Switch Account

    btnBackToDashboard.addEventListener("click", () => {
        renderDashboard();
        showView(vendorDashboard);
    });

    // Dashboard Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.currentTab = btn.getAttribute("data-tab");
            renderDashboard();
        });
    });

    // Read Aloud Logic
    if (btnReadAloud) {
        btnReadAloud.addEventListener("click", () => {
            if ('speechSynthesis' in window) {
                const agreement = state.agreements.find(a => a.id === state.currentAgreementId);
                if (agreement) {
                    const text = `Agreement ID ${agreement.id}. Product is ${agreement.product}, quantity ${agreement.quantity}, price ${agreement.price}. Status is ${agreement.status}. Delivery status is ${agreement.deliveryStatus}.`;
                    const msg = new SpeechSynthesisUtterance(text);
                    window.speechSynthesis.speak(msg);
                }
            } else {
                alert("Text-to-speech not supported in this browser.");
            }
        });
    }

    requestForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const randomId = Math.floor(Math.random() * 100000);
        const newAgreement = {
            id: `AGMT-${randomId}`,
            time: new Date().toLocaleString(),
            status: "Deal Open",
            product: document.getElementById("product").value,
            quantity: document.getElementById("quantity").value,
            price: document.getElementById("price").value,
            location: document.getElementById("location").value,
            deliveryStatus: "Deal Open",
            createdBy: state.currentUser.username
        };
        state.agreements.push(newAgreement);
        saveData();

        state.currentAgreementId = newAgreement.id;
        renderAgreementDetails(newAgreement);
        showView(agreementSection);

        deliverySection.classList.remove("hidden");
        vendorActions.classList.add("hidden");
        // Customer View:
        btnBackToDashboard.classList.remove("hidden");
        btnBackToDashboard.innerText = "← Dashboard";

        updateRoadmap("Deal Open");
    });

    btnConfirm.addEventListener("click", () => updateAgreementStatus("Confirmed"));
    btnRequestChange.addEventListener("click", () => updateAgreementStatus("Change Requested"));

    deliveryStatusSelect.addEventListener("change", (e) => {
        const agreement = state.agreements.find(a => a.id === state.currentAgreementId);
        if (agreement) {
            agreement.deliveryStatus = e.target.value;
            saveData();
            updateRoadmap(agreement.deliveryStatus);
        }
    });


    // --- Core Helper Functions ---

    function getBadgeClass(status) {
        if (status === "Deal Open" || status === "Pending") return "pending";
        if (status === "Confirmed" || status === "Deal Confirmed" || status === "Deal Ended") return "confirmed";
        if (status === "In Progress") return "progress";
        if (status === "Change Requested") return "change";
        return "pending";
    }

    function updateStatusBadge(status) {
        statusBadge.innerText = status;
        statusBadge.className = `status-badge ${getBadgeClass(status)}`;
    }

    function updateRoadmap(status) {
        const steps = ["Deal Open", "In Progress", "Deal Confirmed", "Deal Ended"];
        const icons = ["🤝", "⏳", "✅", "🏁"];
        const currentIndex = steps.indexOf(status);
        const validIndex = currentIndex === -1 ? 0 : currentIndex;
        const progressWidth = (validIndex / (steps.length - 1)) * 100;

        document.getElementById("roadmapProgress").style.width = `${progressWidth}%`;
        document.querySelectorAll(".step").forEach((stepEl) => {
            const stepName = stepEl.getAttribute("data-step");
            const stepIndex = steps.indexOf(stepName);

            stepEl.classList.remove("active", "completed");

            if (stepIndex < validIndex) {
                stepEl.classList.add("completed");
                stepEl.querySelector(".step-circle").innerHTML = "✓";
            } else if (stepIndex === validIndex) {
                stepEl.classList.add("active");
                stepEl.querySelector(".step-circle").innerHTML = icons[stepIndex];
            } else {
                stepEl.querySelector(".step-circle").innerHTML = icons[stepIndex];
            }
        });
    }

    function renderAgreementDetails(agreement) {
        agreementIdDisplay.innerText = agreement.id;
        timestampDisplay.innerText = agreement.time;
        updateStatusBadge(agreement.status);
        qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(agreement.id)}`;
    }

    function updateAgreementStatus(newStatus) {
        const agreement = state.agreements.find(a => a.id === state.currentAgreementId);
        if (agreement) {
            agreement.status = newStatus;
            saveData();
            updateStatusBadge(newStatus);
        }
    }

    function renderDashboard() {
        agreementsList.innerHTML = "";

        // Toggle Create Button
        if (state.currentUser.role === "Customer") {
            btnCreateRequest.classList.remove("hidden");
        } else {
            btnCreateRequest.classList.add("hidden");
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
                renderAgreementDetails(agreement);
                showView(agreementSection);

                deliverySection.classList.remove("hidden");

                if (state.currentUser.role === "Vendor") {
                    vendorActions.classList.remove("hidden");
                    deliveryStatusSelect.disabled = false;
                    btnBackToDashboard.innerText = "← Dashboard";
                } else {
                    vendorActions.classList.add("hidden");
                    deliveryStatusSelect.disabled = true;
                    btnBackToDashboard.innerText = "← Dashboard";
                }
                btnBackToDashboard.classList.remove("hidden");

                deliveryStatusSelect.value = agreement.deliveryStatus || "Deal Open";
                updateRoadmap(agreement.deliveryStatus || "Deal Open");
            });
            agreementsList.appendChild(item);
        });
    }

});