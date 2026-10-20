const API = "https://shopsphere-backend-wr5o.onrender.com/SellerRequest";

async function loadRequests(){
    try {
        const res = await fetch(API);
        const data = await res.json();
        const container = document.getElementById("SellerRequests");

        if(!data || data.length === 0){
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 100px 0;">
                    <h2 style="color: var(--text-dim);">Inbox Empty</h2>
                    <p>No pending seller requests at the moment.</p>
                </div>`;
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="card">
                <div class="img-container">
                    <img src="${item.image}" alt="product">
                    <div class="price-tag">KES ${Number(item.price).toLocaleString()}</div>
                </div>

                <div class="card-body">
                    <div class="status-area">
                        <span class="status-label">${item.status || 'Reviewing'}</span>
                        <a href="mailto:${item.email}" style="color:var(--accent); text-decoration:none; font-size:12px;">Contact Seller</a>
                    </div>
                    
                    <h3>${item.productName}</h3>

                    <div class="seller-info">
                        <div>Seller: <b>${item.name}</b></div>
                        <div>Email: <b>${item.email}</b></div>
                    </div>

                    <p class="description">${item.description}</p>

                    <div class="buttons">
                        <button class="btn btn-approve" onclick="approve('${item._id}')">
                            Verify & Post
                        </button>
                        <button class="btn btn-delete" onclick="removeRequest('${item._id}')">
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        `).join("");
    } catch (error) {
        document.getElementById("SellerRequests").innerHTML = "<p style='color:red; text-align:center;'>Failed to connect to Command Center.</p>";
    }
}

async function approve(id){
    try {
        const res = await fetch(API + "/" + id, { method: "PUT" });
        if(res.ok) {
            alert("✅ Product approved and moved to live store.");
            loadRequests(); // Corrected function call
        }
    } catch (err) {
        alert("Approval failed.");
    }
}

async function removeRequest(id){
    if(!confirm("Are you sure you want to REJECT this seller request? This cannot be undone.")) return;

    try {
        const res = await fetch(API + "/" + id, { method: "DELETE" });
        if(res.ok) loadRequests();
    } catch (err) {
        alert("Delete failed.");
    }
}

// Initial Load
loadRequests();
