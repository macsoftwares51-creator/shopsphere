// 1. Correct the API URL (Remove '/approved' from the end)
const API = "https://shopsphere-backend-wr5o.onrender.com";

async function loadReviews() {
    // We add ?cb=1 to "bust" the cache
    const res = await fetch("https://shopsphere-backend-wr5o.onrender.com/Review?cb=1");
    
    if (!res.ok) {
        console.error("HTTP Error:", res.status);
        return;
    }

    const reviews = await res.json();
    const container = document.getElementById("reviews-list");
    
    if (!container) return;
    container.innerHTML = "";

    reviews.forEach(r => {
        container.innerHTML += `
            <div class="review-card">
                <strong>${r.name}</strong>
                <p>${"⭐".repeat(r.rating)}</p>
                <p>${r.comment}</p>
            </div>
        `;
    });
}
        async function submitReview() {
            const name = document.getElementById("revName").value;
            const rating = document.getElementById("revRating").value;
            const comment = document.getElementById("revComment").value;
            const msg = document.getElementById("msg");

            if(!name || !comment) return alert("Please fill all fields");

            const res = await fetch(API + "/Review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, rating, comment })
            });

            if(res.ok) {
                msg.style.color = "#22c55e";
                msg.innerText = "Review submitted! It will appear once approved by admin. ✅";
                document.getElementById("revName").value = "";
                document.getElementById("revComment").value = "";
            } else {
                msg.style.color = "#ef4444";
                msg.innerText = "Error submitting review.";
            }
        }

        loadReviews();
