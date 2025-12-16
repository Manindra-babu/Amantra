export const state = {
    currentUser: null,
    currentAgreementId: null,
    agreements: [],
    users: [],
    currentTab: "active" // active, history, calendar
};

export function loadData() {
    const storedAgreements = localStorage.getItem("marketAgreements");
    if (storedAgreements) state.agreements = JSON.parse(storedAgreements);

    const storedUsers = localStorage.getItem("marketUsers");
    if (storedUsers) state.users = JSON.parse(storedUsers);

    const storedAgreementId = localStorage.getItem("marketCurrentAgreementId");
    if (storedAgreementId) state.currentAgreementId = storedAgreementId;
}

export function saveData() {
    localStorage.setItem("marketAgreements", JSON.stringify(state.agreements));
    localStorage.setItem("marketUsers", JSON.stringify(state.users));
    if (state.currentAgreementId) localStorage.setItem("marketCurrentAgreementId", state.currentAgreementId);
}
