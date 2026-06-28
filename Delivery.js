document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id') || "UNKNOWN";
    document.getElementById('orderDisplay').innerText = orderId;

    const searchInput = document.getElementById("productSearch");
    const resultsContainer = document.getElementById("searchResults");
    const selectedBadge = document.getElementById("selectedProductBadge");
    const canvas = document.getElementById('signature-pad');

    let localInventoryCache = [];
    let chosenProductId = null;

    // Fetch the inventory directly from your backend endpoint on load to make search instant
    try {
        const response = await fetch('https://shopsphere-backend.onrender.com/api/products');
        if (response.ok) {
            localInventoryCache = await response.json();
        }
    } catch (err) {
        console.error("Could not fetch product catalog index list:", err);
    }

    // Input monitoring filter engine
    searchInput.addEventListener("input", () => {
        const text = searchInput.value.toLowerCase().trim();
        resultsContainer.innerHTML = "";
        
        if (!text) {
            resultsContainer.style.display = "none";
            return;
        }

        const matches = localInventoryCache.filter(item => 
            (item.name || item.title || "").toLowerCase().includes(text)
        );

        if (matches.length === 0) {
            resultsContainer.innerHTML = `<div class="search-item" style="color: #6b7280; cursor: default;">No matching items found</div>`;
        } else {
            matches.slice(0, 5).forEach(item => {
                const div = document.createElement("div");
                div.className = "search-item";
                const itemName = item.name || item.title;
                div.textContent = `${itemName} (KES ${item.price})`;
                
                div.addEventListener("click", () => {
                    chosenProductId = item._id || item.id;
                    searchInput.value = itemName;
                    resultsContainer.style.display = "none";
                    selectedBadge.textContent = `🎯 Bound ID: ${chosenProductId}`;
                    selectedBadge.style.display = "block";
                });
                resultsContainer.appendChild(div);
            });
        }
        resultsContainer.style.display = "block";
    });

    // Hide dropdown if clicked away
    document.addEventListener("click", (e) => {
        if (e.target !== searchInput) resultsContainer.style.display = "none";
    });

    // Canvas coordinate adjustments
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }

    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    document.getElementById('clear').addEventListener('click', () => signaturePad.clear());

    // Submit Action Bundle Handler
    document.getElementById('submit').addEventListener('click', async () => {
        const customerName = document.getElementById("customerName").value.trim();
        const deliveryCode = document.getElementById("deliveryCode").value.trim();

        if (!chosenProductId) return alert("Please select a valid item from the search lookup dropdown.");
        if (!customerName) return alert("Please enter the customer's name.");
        if (!deliveryCode) return alert("Please supply the security confirmation code.");
        if (signaturePad.isEmpty()) return alert("Customer signature confirmation is mandatory.");

        const submitBtn = document.getElementById('submit');
        submitBtn.disabled = true;
        submitBtn.innerText = "RECORDING DEPLOYMENT...";

        const payload = {
            orderId: orderId,
            productId: chosenProductId,
            customerName: customerName,
            deliveryCode: deliveryCode,
            signatureImg: signaturePad.toDataURL() // Sent as Base64 string to be moved onto Cloudinary
        };

        try {
            const response = await fetch('https://shopsphere-backend.onrender.com/api/proof/submit-proof', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`✅ Verification Complete!\nRecorded under asset marker: ${result.message}`);
                window.location.reload();
            } else {
                alert(`❌ Record Denied: ${result.error}`);
            }
        } catch (err) {
            alert("❌ Network request to tracking node instance dropped.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "COMPLETE DELIVERY";
        }
    });
});
