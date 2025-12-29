import { db } from './firebase-config.js'; 
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";

const logBody = document.getElementById('audit-log-body');

async function loadLogs() {
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    logBody.innerHTML = ''; // Clear loader
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = `<tr>
            <td>${data.timestamp?.toDate().toLocaleString() || 'N/A'}</td>
            <td>${data.userEmail}</td>
            <td>${data.action}</td>
            <td>${data.details}</td>
        </tr>`;
        logBody.innerHTML += row;
    });
}

loadLogs();