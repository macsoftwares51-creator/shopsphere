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

    // Grab deep active index array directly from database endpoint
    try {
        const response = await fetch('https://shopsphere-backend.onrender.com/api/products');
        if (response.ok) {
            localInventoryCache = await response.json();
        }
    } catch (err) {
        console.error("Could not fetch product catalog index list:", err);
    }

    // Interactive Typing Suggestion Engine
    searchInput.addEventListener("input", () => {
        const text = searchInput.value.toLowerCase().trim();
        resultsContainer.innerHTML = "";
        
        if (!text) {
            resultsContainer.style.display = "none";
            return;
        }

        // Broad non-exact lookup matching any fragment typed
        const matches = localInventoryCache.filter(item => {
            const itemTitle = (item.name || item.title || "").toLowerCase();
            return itemTitle.includes(text);
        });

        if (matches.length === 0) {
            resultsContainer.innerHTML = `<div class="search-item" style="color: #6b7280; justify-content: center; cursor: default;">No items match "${searchInput.value}"</div>`;
        } else {
            // Display all matches inside the scroll container frame window
            matches.forEach(item => {
                const itemRow = document.createElement("div");
                itemRow.className = "search-item";
                
                const itemName = item.name || item.title;
                // Graceful check for different image key variants your schema might use
                const itemImgSrc = item.image || item.img || item.productImage || "logo3.1.png";

                // Build modern image rows dynamically
                itemRow.innerHTML = `
                    <img src="${itemImgSrc}" class="search-thumb" alt="" onerror="this.src='logo3.1.png'">
                    <div class="search-meta">
                        <span class="search-title">${itemName}</span>
                        <span class="search-price">KES ${item.price || '0'}</span>
                    </div>
                `;
                
                itemRow.addEventListener("click", () => {
                    chosenProductId = item._id || item.id;
                    searchInput.value = itemName;
                    resultsContainer.style.display = "none";
                    
                    selectedBadge.innerHTML = `🎯 Selected: <b>${itemName}</b><br><span style="font-size:10px; opacity:0.7;">ID: ${chosenProductId}</span>`;
                    selectedBadge.style.display = "block";
                });
                
                resultsContainer.appendChild(itemRow);
            });
        }
        resultsContainer.style.display = "block";
    });

    // Close window suggestion popups if clerk taps anywhere else on screen
    document.addEventListener("click", (e) => {
        if (e.target !== searchInput) resultsContainer.style.display = "none";
    });

    // Signature Canvas Resizer System
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

    // Submit payload routing event
    document.getElementById('submit').addEventListener('click', async () => {
        const customerName = document.getElementById("customerName").value.trim();
        const deliveryCode = document.getElementById("deliveryCode").value.trim();

        if (!chosenProductId) return alert("Please select a product from the suggestion scroll window.");
        if (!customerName) return alert("Please enter the customer's name.");
        if (!deliveryCode) return alert("Please enter the verification code.");
        if (signaturePad.isEmpty()) return alert("Customer signature confirmation is required.");

        const submitBtn = document.getElementById('submit');
        submitBtn.disabled = true;
        submitBtn.innerText = "SAVING VERIFICATION TRANSACTION...";

        const payload = {
            orderId: orderId,
            productId: chosenProductId,
            customerName: customerName,
            deliveryCode: deliveryCode,
            signatureImg: signaturePad.toDataURL()
        };

        try {
            const response = await fetch('https://shopsphere-backend.onrender.com/api/proof/submit-proof', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`✅ Delivery finalized successfully!\nReference key applied: ${result.message}`);
                window.location.reload();
            } else {
                alert(`❌ Upload Failure: ${result.error}`);
            }
        } catch (err) {
            alert("❌ Network drop: Server didn't respond.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "COMPLETE DELIVERY";
        }
    });
});
