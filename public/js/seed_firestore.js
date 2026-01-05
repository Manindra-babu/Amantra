import { db, auth } from './firebase-config.js';
import { MOCK_DATA } from './mock_data.js';
import { collection, addDoc, writeBatch, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const seedBtn = document.getElementById('seed-btn');
const statusDiv = document.getElementById('status');

function updateStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.classList.remove('hidden');
    statusDiv.className = isError ? 'mt-4 text-sm text-red-600' : 'mt-4 text-sm text-green-600';
}

seedBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        updateStatus("You must be logged in to seed data.", true);
        return;
    }

    if (!MOCK_DATA) {
        updateStatus("Mock data not found.", true);
        return;
    }

    seedBtn.disabled = true;
    seedBtn.textContent = "Seeding...";
    updateStatus("Starting seed process...");

    try {
        const batch = writeBatch(db);
        let operationCount = 0;

        // 1. Seed Bonds (Created - Active & Overdue)
        if (MOCK_DATA.dashboard && MOCK_DATA.dashboard.created) {
            if (MOCK_DATA.dashboard.created.active) {
                for (const bond of MOCK_DATA.dashboard.created.active) {
                    const bondData = {
                        ...bond,
                        type: 'created',
                        statusCategory: 'active',
                        userId: user.uid,
                        role: 'lender',
                        createdAt: new Date().toISOString()
                    };
                    const docRef = doc(collection(db, "bonds"));
                    batch.set(docRef, bondData);
                    operationCount++;
                }
            }
            if (MOCK_DATA.dashboard.created.overdue) {
                for (const bond of MOCK_DATA.dashboard.created.overdue) {
                    const bondData = {
                        ...bond,
                        type: 'created',
                        statusCategory: 'overdue',
                        userId: user.uid,
                        role: 'lender',
                        createdAt: new Date().toISOString()
                    };
                    const docRef = doc(collection(db, "bonds"));
                    batch.set(docRef, bondData);
                    operationCount++;
                }
            }
        }

        // 2. Seed Bonds (Received - Active & Overdue)
        if (MOCK_DATA.dashboard && MOCK_DATA.dashboard.received) {
            if (MOCK_DATA.dashboard.received.active) {
                for (const bond of MOCK_DATA.dashboard.received.active) {
                    const bondData = {
                        ...bond,
                        type: 'received',
                        statusCategory: 'active',
                        userId: user.uid,
                        role: 'borrower',
                        createdAt: new Date().toISOString()
                    };
                    const docRef = doc(collection(db, "bonds"));
                    batch.set(docRef, bondData);
                    operationCount++;
                }
            }
            if (MOCK_DATA.dashboard.received.overdue) {
                for (const bond of MOCK_DATA.dashboard.received.overdue) {
                    const bondData = {
                        ...bond,
                        type: 'received',
                        statusCategory: 'overdue',
                        userId: user.uid,
                        role: 'borrower',
                        createdAt: new Date().toISOString()
                    };
                    const docRef = doc(collection(db, "bonds"));
                    batch.set(docRef, bondData);
                    operationCount++;
                }
            }
        }

        // 3. Seed Change Requests
        if (MOCK_DATA.dashboard && MOCK_DATA.dashboard.changeRequests) {
            for (const req of MOCK_DATA.dashboard.changeRequests) {
                const reqData = {
                    ...req,
                    userId: user.uid,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                const docRef = doc(collection(db, "requests"));
                batch.set(docRef, reqData);
                operationCount++;
            }
        }

        // 4. Seed Bond History
        if (MOCK_DATA.bondHistory) {
            for (const item of MOCK_DATA.bondHistory) {
                const historyData = {
                    ...item,
                    userId: user.uid,
                    collection: 'history',
                    timestamp: new Date().toISOString()
                };
                const docRef = doc(collection(db, "bond_history"));
                batch.set(docRef, historyData);
                operationCount++;
            }
        }

        await batch.commit();

        updateStatus(`Successfully seeded ${operationCount} documents!`);
        seedBtn.textContent = "Seeding Complete";

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);

    } catch (error) {
        console.error("Seeding error:", error);
        updateStatus("Error seeding data: " + error.message, true);
        seedBtn.disabled = false;
        seedBtn.textContent = "Seed Data";
    }
});
