export function showView(viewId) {
    const views = [
        "loginSection",
        "homeSection",
        "registerSection",
        "registerSection",
        "profileSection",
        "customerSection",
        "vendorDashboard",
        "agreementSection",
        "deliverySection"
    ];

    // Hide all
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add("hidden");
            el.classList.remove("active-view");
        }
    });

    // Show target
    const activeEl = document.getElementById(viewId);
    if (activeEl) {
        activeEl.classList.remove("hidden");
        activeEl.classList.add("active-view");
    }

    // Toggle Nav
    const appNav = document.getElementById("appNav");
    if (appNav) {
        if (viewId === "loginSection" || viewId === "registerSection") {
            appNav.classList.add("hidden");
        } else {
            appNav.classList.remove("hidden");
        }
    }
}
