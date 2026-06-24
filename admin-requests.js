const API_URL = "https://shopsphere-backend-wr5o.onrender.com/requests";

async function loadRequests() {
    try {
        const response = await fetch(API_URL);
        const requests = await response.json();

        const container = document.getElementById("requests");
        container.innerHTML = requests.length ? "" : "<p style='text-align:center;'>No active requests. You're all caught up!</p>";

        requests.forEach(r => {
            const isAdded = r.status?.toLowerCase() === 'added';
            
            container.innerHTML += `
                <div class="request-item">
                    <div class="info">
                        <h3>${r.product}</h3>
                        <p>Requested by: <b>${r.name}</b></p>
                        <p>Email: <b>${r.email}</b></p>
                        <span class="status-pill ${isAdded ? 'status-added' : 'status-pending'}">
                            ${r.status || 'Pending'}
                        </span>
                    </div>
                    <div class="actions">
                        ${!isAdded ? `<button class="btn btn-add" onclick="markAdded('${r._id}')">Mark as Added</button>` : ''}
                        <button class="btn btn-del" onclick="deleteRequest('${r._id}')">Remove</button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        document.getElementById("requests").innerHTML = "<p style='color:red;'>Failed to load requests.</p>";
    }
}

async function deleteRequest(id) {
    if(!confirm("Permanently delete this request?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadRequests();
}

async function markAdded(id) {
    // Note: Assuming your backend PUT route updates the status to "Added"
    await fetch(`${API_URL}/${id}`, { method: "PUT" });
    loadRequests();
}

loadRequests();
