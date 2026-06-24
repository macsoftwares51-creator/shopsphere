const API = "https://shopsphere-backend-wr5o.onrender.com";

    async function loadAdminReviews() {
        try {
            const res = await fetch(`${API}/Review/admin/all`);
            if (!res.ok) throw new Error("Failed to load");
            
            const reviews = await res.json();
            const list = document.getElementById("adminReviewList");
            list.innerHTML = "";

            if(reviews.length === 0) {
                list.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No reviews found.</td></tr>";
                return;
            }

            reviews.forEach(r => {
                list.innerHTML += `
                    <tr>
                        <td><strong>${r.name}</strong></td>
                        <td>${r.comment}</td>
                        <td>${"⭐".repeat(r.rating)}</td>
                        <td>
                            <span class="status-badge ${r.approved ? 'live' : 'pending'}">
                                ${r.approved ? 'LIVE' : 'PENDING'}
                            </span>
                        </td>
                        <td>
                            ${!r.approved ? `<button class="btn btn-approve" onclick="approveReview('${r._id}')">Approve</button>` : ''}
                            <button class="btn btn-delete" onclick="deleteReview('${r._id}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
        } catch (err) {
            console.error("Load Error:", err);
        }
    }

    async function approveReview(id) {
        if(!confirm("Push this review live?")) return;

        try {
            const res = await fetch(`${API}/Review/approve/${id}`, { 
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (data.success) {
                alert("✅ Review is now visible on the frontend!");
                loadAdminReviews(); // Refresh the table
            } else {
                alert("❌ Approval failed. Check server logs.");
            }
        } catch (err) {
            alert("⚠️ Connection error. Make sure your Backend is redeployed with PATCH allowed.");
        }
    }

    async function deleteReview(id) {
        if(!confirm("Delete this review forever?")) return;
        
        try {
            const res = await fetch(`${API}/Review/${id}`, { method: "DELETE" });
            if(res.ok) loadAdminReviews();
        } catch (err) {
            alert("Delete failed.");
        }
    }

    loadAdminReviews();
