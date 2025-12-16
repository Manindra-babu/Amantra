import { state, loadData, saveData } from './state.js';
import { login, logout, register } from './auth.js';
import { renderDashboard, renderAgreementDetails, updateRoadmap, updateAgreementStatus } from './render.js';
import { loadComponents } from './loader.js';

document.addEventListener("DOMContentLoaded", async () => {

    // --- 1. Global Setup (Loads Header) ---
    await loadComponents();
    loadData();

    // --- 2. Identify Current Page ---
    const path = window.location.pathname;
    const page = path.split("/").pop(); // e.g., "login.html" or "login"

    // --- 3. Session Check (Global Guard) ---
    // Allow login.html, register.html, and index.html (which will redirect) to be accessed without session
    // Also allow "login", "register" for clean URLs
    const publicPages = ["login.html", "register.html", "index.html", "", "login", "register"];
    const sessionUser = localStorage.getItem("marketCurrentUser");

    if (sessionUser) {
        state.currentUser = JSON.parse(sessionUser);
        // If user is on login/register but already logged in, send to Home
        if (publicPages.includes(page) && page !== "") {
            // For index.html, we just want to redirect
            window.location.href = "home.html";
            return;
        }
    } else {
        // If no user:
        // 1. If trying to access private page -> Redirect Login
        // 2. If on index.html or root -> Redirect Login
        if (!publicPages.includes(page) || page === "index.html" || page === "index" || page === "") {
            window.location.href = "login.html";
            return;
        }
    }

    // --- 4. Shared Navigation Listeners (Header) ---
    // These are injected by loadComponents, so we need to wait or check
    const btnNavLogout = document.getElementById("btnNavLogout");
    const btnNavHome = document.getElementById("btnNavHome");
    const btnNavProfile = document.getElementById("btnNavProfile");
    const appNav = document.getElementById("appNav");

    if (state.currentUser && appNav) {
        appNav.classList.remove("hidden");
    }

    if (btnNavLogout) {
        btnNavLogout.addEventListener("click", () => {
            logout();
            window.location.href = "login.html";
        });
    }

    if (btnNavHome) {
        btnNavHome.addEventListener("click", () => {
            window.location.href = "home.html";
        });
    }

    if (btnNavProfile) {
        btnNavProfile.addEventListener("click", () => {
            window.location.href = "profile.html";
        });
    }

    // --- 5. Page Specific Logic ---

    // === LOGIN PAGE ===
    const loginForm = document.getElementById("loginForm");
    const btnShowRegister = document.getElementById("btnShowRegister");

    if (loginForm) {
        // We are on login.html or the section is present
        // (Note: In MPA, login.html only contains loginSection)
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const u = document.getElementById("loginUsername").value;
            const p = document.getElementById("loginPassword").value;
            const user = login(u, p);
            if (user) {
                window.location.href = "home.html";
            } else {
                alert("Invalid credentials!");
            }
        });

        if (btnShowRegister) {
            btnShowRegister.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = "register.html";
            });
        }
    }

    // === REGISTER PAGE ===
    const registerForm = document.getElementById("registerForm");
    const btnShowLogin = document.getElementById("btnShowLogin");

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const res = register({
                username: document.getElementById("regUsername").value,
                password: document.getElementById("regPassword").value,
                role: document.getElementById("regRole").value,
                firstName: document.getElementById("regFirstName").value,
                lastName: document.getElementById("regLastName").value,
                phone: document.getElementById("regPhone").value,
                email: document.getElementById("regEmail").value
            });
            if (res.success) {
                alert("Registration successful! Please login.");
                window.location.href = "login.html";
            } else {
                alert(res.message);
            }
        });

        if (btnShowLogin) {
            btnShowLogin.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = "login.html";
            });
        }
    }

    // === HOME HUB ===
    const btnHomeCustomer = document.getElementById("btnHomeCustomer");
    const btnHomeVendor = document.getElementById("btnHomeVendor");
    const btnHomeProfile = document.getElementById("btnHomeProfile");
    const btnHomeLogout = document.getElementById("btnHomeLogout");

    if (document.getElementById("homeSection")) {
        // Logic for Home Hub
        const setRoleAndStart = (role) => {
            if (state.currentUser) {
                state.currentUser.role = role;
                localStorage.setItem("marketCurrentUser", JSON.stringify(state.currentUser));
                window.location.href = "dashboard.html";
            }
        };

        if (btnHomeCustomer) btnHomeCustomer.addEventListener("click", () => setRoleAndStart("Customer"));
        if (btnHomeVendor) btnHomeVendor.addEventListener("click", () => setRoleAndStart("Vendor"));

        if (btnHomeProfile) btnHomeProfile.addEventListener("click", () => window.location.href = "profile.html");

        if (btnHomeLogout) {
            btnHomeLogout.addEventListener("click", () => {
                logout();
                window.location.href = "login.html";
            });
        }
    }

    // === DASHBOARD ===
    const btnCreateRequest = document.getElementById("btnCreateRequest");
    const agreementsList = document.getElementById("agreementsList");
    const tabBtns = document.querySelectorAll(".tab-btn");

    if (document.getElementById("vendorDashboard")) {
        renderDashboard();

        if (btnCreateRequest) {
            btnCreateRequest.addEventListener("click", () => {
                window.location.href = "request.html"; // New Request Page
            });
        }

        tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                tabBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                state.currentTab = btn.getAttribute("data-tab");
                renderDashboard();
            });
        });
    }

    // === CREATE REQUEST (Customer) ===
    const requestForm = document.getElementById("requestForm");
    const btnBackToDashboard = document.getElementById("btnBackToDashboard"); // Shared ID, might need check

    if (requestForm) {
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

            // Go to the details of the created agreement or back to dashboard
            state.currentAgreementId = newAgreement.id;
            saveData();
            window.location.href = "agreement.html";
        });

        // Handle back button specifically for Request page if it exists there
        const backBtn = document.querySelector("#customerSection #btnBackToDashboard");
        if (backBtn) {
            backBtn.addEventListener("click", () => window.location.href = "dashboard.html");
        }
    }

    // === AGREEMENT DETAIL & DELIVERY ===
    const agreementSection = document.getElementById("agreementSection");
    if (agreementSection) {
        // Load the specific agreement
        const agreement = state.agreements.find(a => a.id === state.currentAgreementId);
        if (agreement) {
            // === ACCESS CONTROL ===
            if (state.currentUser.role === "Customer" && agreement.createdBy !== state.currentUser.username) {
                alert("Unauthorized Access: You cannot view this agreement.");
                window.location.href = "dashboard.html";
                return; // Stop execution
            }

            renderAgreementDetails(agreement);

            // Logic for Delivery Section (now on same page)
            const deliverySection = document.getElementById("deliverySection");
            const vendorActions = document.getElementById("vendorActions");
            const deliveryStatusSelect = document.getElementById("deliveryStatus");
            const btnConfirm = document.getElementById("btnConfirm");
            const btnRequestChange = document.getElementById("btnRequestChange");
            const btnReadAloud = document.getElementById("btnReadAloud");

            // Setup View based on Role
            if (state.currentUser.role === "Vendor") {
                if (vendorActions) vendorActions.classList.remove("hidden");
                if (deliveryStatusSelect) deliveryStatusSelect.disabled = false;
            } else {
                if (vendorActions) vendorActions.classList.add("hidden");
                if (deliveryStatusSelect) deliveryStatusSelect.disabled = true;
            }

            if (deliveryStatusSelect) {
                deliveryStatusSelect.value = agreement.deliveryStatus || "Deal Open";
                updateRoadmap(agreement.deliveryStatus || "Deal Open");

                deliveryStatusSelect.addEventListener("change", (e) => {
                    agreement.deliveryStatus = e.target.value;
                    saveData();
                    updateRoadmap(agreement.deliveryStatus);
                });
            }

            if (btnConfirm) btnConfirm.addEventListener("click", () => updateAgreementStatus("Confirmed"));
            if (btnRequestChange) btnRequestChange.addEventListener("click", () => updateAgreementStatus("Change Requested"));

            // Read Aloud
            if (btnReadAloud) {
                btnReadAloud.addEventListener("click", () => {
                    if ('speechSynthesis' in window) {
                        const text = `Agreement ID ${agreement.id}. Product is ${agreement.product}, quantity ${agreement.quantity}, price ${agreement.price}. Status is ${agreement.status}. Delivery status is ${agreement.deliveryStatus}.`;
                        const msg = new SpeechSynthesisUtterance(text);
                        window.speechSynthesis.speak(msg);
                    } else {
                        alert("Text-to-speech not supported in this browser.");
                    }
                });
            }

        } else {
            agreementSection.innerHTML = "<p>Agreement not found. Please return to dashboard.</p>";
        }

        const backBtns = document.querySelectorAll("#btnBackToDashboard");
        backBtns.forEach(btn => btn.addEventListener("click", () => window.location.href = "dashboard.html"));
    }

    // === PROFILE ===
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
        // Load Profile Data
        if (state.currentUser) {
            document.getElementById("profileUsername").value = state.currentUser.username;
            document.getElementById("profileRole").value = state.currentUser.role || "Not Set";
            document.getElementById("profileFirstName").value = state.currentUser.firstName || "";
            document.getElementById("profileLastName").value = state.currentUser.lastName || "";
            document.getElementById("profilePhone").value = state.currentUser.phone || "";
            document.getElementById("profileEmail").value = state.currentUser.email || "";
            document.getElementById("profileAddress").value = state.currentUser.address || "";
            document.getElementById("profilePicUrl").value = state.currentUser.pic || "";
            document.getElementById("profileAvatar").src = state.currentUser.pic || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
        }

        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const userIndex = state.users.findIndex(u => u.username === state.currentUser.username);
            if (userIndex !== -1) {
                state.users[userIndex].firstName = document.getElementById("profileFirstName").value;
                state.users[userIndex].lastName = document.getElementById("profileLastName").value;
                state.users[userIndex].phone = document.getElementById("profilePhone").value;
                state.users[userIndex].email = document.getElementById("profileEmail").value;
                state.users[userIndex].address = document.getElementById("profileAddress").value;
                state.users[userIndex].pic = document.getElementById("profilePicUrl").value;

                // Password change now handled separately

                state.currentUser = state.users[userIndex];
                localStorage.setItem("marketCurrentUser", JSON.stringify(state.currentUser));
                saveData();

                alert("Profile Updated Successfully!");
                window.location.reload();
            }
        });

        // Switch Account Logic
        const btnSwitchAccount = document.getElementById("btnSwitchAccount");
        if (btnSwitchAccount) {
            btnSwitchAccount.addEventListener("click", () => {
                logout();
                window.location.href = "login.html";
            });
        }

        // OTP Password Change
        const btnChangePassword = document.getElementById("btnChangePassword");
        if (btnChangePassword) {
            btnChangePassword.addEventListener("click", () => {
                const email = state.currentUser.email || "your registered email";
                const otp = Math.floor(1000 + Math.random() * 9000);

                alert(`(Simulation) Verification Code sent to ${email}: ${otp}`);

                const inputIdx = prompt("Enter the verification code sent to your email:");
                if (inputIdx === String(otp)) {
                    const newPass = prompt("Enter your new password:");
                    if (newPass && newPass.length > 0) {
                        // Update
                        const userIndex = state.users.findIndex(u => u.username === state.currentUser.username);
                        if (userIndex !== -1) {
                            state.users[userIndex].password = newPass;
                            state.currentUser.password = newPass;
                            saveData();
                            localStorage.setItem("marketCurrentUser", JSON.stringify(state.currentUser));
                            alert("Password changed successfully!");
                        }
                    } else {
                        alert("Password cannot be empty.");
                    }
                } else {
                    alert("Incorrect verification code.");
                }
            });
        }
    }

    // === OTP (Might be on Register) ===
    const btnVerifyOTP = document.getElementById("btnVerifyOTP");
    if (btnVerifyOTP) {
        btnVerifyOTP.addEventListener("click", () => {
            const otp = Math.floor(1000 + Math.random() * 9000);
            alert(`OTP Sent: ${otp}`);
            btnVerifyOTP.innerText = "✅ Verified";
            btnVerifyOTP.classList.remove("btn-secondary");
            btnVerifyOTP.classList.add("btn-primary");
        });
    }
});
