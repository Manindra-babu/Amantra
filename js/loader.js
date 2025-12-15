export async function loadComponents() {
    const components = [
        { id: "header-container", url: "components/layout/header.html" },
        { id: "homeSection", url: "components/views/home.html" },
        { id: "loginSection", url: "components/views/login.html" },
        { id: "registerSection", url: "components/views/register.html" },
        { id: "profileSection", url: "components/views/profile.html" },
        { id: "customerSection", url: "components/views/customer.html" },
        { id: "vendorDashboard", url: "components/views/dashboard.html" },
        { id: "agreementSection", url: "components/views/agreement.html" },
        { id: "deliverySection", url: "components/views/delivery.html" }
    ];

    const loadPromises = components.map(async (comp) => {
        const container = document.getElementById(comp.id);
        if (container) {
            try {
                const response = await fetch(comp.url);
                if (!response.ok) throw new Error(`Failed to load ${comp.url}`);
                const html = await response.text();
                container.innerHTML = html;
            } catch (error) {
                console.error(error);
                container.innerHTML = `<p style="color:red">Error loading ${comp.url}</p>`;
            }
        }
    });

    await Promise.all(loadPromises);
}
