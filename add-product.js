const API = "https://shopsphere-backend-wr5o.onrender.com/products";
const form = document.getElementById("form");
const productsDiv = document.getElementById("products");
const countSpan = document.getElementById("count");

// UI Input Nodes for Markup Utility logic
const rawPriceInput = document.getElementById("rawPrice");
const productPriceInput = document.getElementById("productPrice");

// Runtime pointer storage variable capturing the target update element scope
let activeProductId = null;

// AUTOMATIC MARKUP DETECTOR EVENT LISTENERS
if (rawPriceInput && productPriceInput) {
    rawPriceInput.addEventListener("input", () => {
        const valueStr = rawPriceInput.value.trim();
        
        if (valueStr === "") {
            productPriceInput.value = "";
            return;
        }

        const baseNum = parseFloat(valueStr);
        if (!isNaN(baseNum)) {
            // Apply 1.3 markup factor multiplier and round to nearest tenth
         const computedPrice = Math.round(baseNum * 1.3);
            productPriceInput.value = computedPrice;
        }
    });
}

// Form Submission (Add Product) Logic
if (form) {
    form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerText = "Processing...";
        btn.disabled = true;

        const formData = new FormData(form);

        try {
            const res = await fetch(API, {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                form.reset();
                loadProducts();
            }
        } catch (err) {
            alert("Upload failed. Check console.");
        } finally {
            btn.innerText = "Publish to Store";
            btn.disabled = false;
        }
    };
}

// Main Load Function to Hydrate UI Grid Data
async function loadProducts() {
    try {
        const res = await fetch(API);
        const products = await res.json();
        if (countSpan) countSpan.innerText = products.length;
        if (!productsDiv) return;
        
        productsDiv.innerHTML = "";

        products.forEach(product => {
            // Cleanly format text values to hide break spaces or quote characters inside parameters
            const descriptionEscaped = (product.description || "")
                .replace(/&/g, "&amp;")
                .replace(/'/g, "\\'")
                .replace(/"/g, "&quot;");

            productsDiv.innerHTML += `
                <div class="card">
                    <img src="${product.image}" alt="${product.name || 'Product'}" />
                    <h3>${product.name}</h3>
                    <p class="price">KES ${Number(product.price).toLocaleString()}</p>
                    <p>${product.category}</p>
                    <div class="card-controls">
                        <button class="info-btn" onclick="openSpecModal('${product._id}', '${product.name.replace(/'/g, "\\'")}', '${descriptionEscaped}')">
                            Add/Edit Details
                        </button>
                        <button class="delete-btn" onclick="deleteProduct('${product._id}')">
                            Remove Product
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error populating system inventory cards:", err);
    }
}

// Expose Modal Actions globally so your inline HTML card buttons can click them instantly
window.openSpecModal = function(id, name, currentDesc) {
    activeProductId = id;
    
    const modalTitle = document.getElementById("modalTitle");
    const specTextTextarea = document.getElementById("specTextTextarea");
    const specModal = document.getElementById("specModal");

    if (modalTitle) modalTitle.innerText = `Edit Specs: ${name}`;
    if (specTextTextarea) specTextTextarea.value = currentDesc;
    if (specModal) specModal.classList.add("active");
};

window.closeSpecModal = function() {
    const specModal = document.getElementById("specModal");
    const specTextTextarea = document.getElementById("specTextTextarea");

    if (specModal) specModal.classList.remove("active");
    if (specTextTextarea) specTextTextarea.value = "";
    activeProductId = null;
};

// Global Window Function to handle Save Operations instantly from the HTML onclick listener
window.handleSaveInformation = async function() {
    if (!activeProductId) {
        alert("Error: No product element reference selected.");
        return;
    }

    const modalSaveBtn = document.getElementById("modalSaveBtn");
    const specTextTextarea = document.getElementById("specTextTextarea");

    if (modalSaveBtn) {
        modalSaveBtn.innerText = "Saving Data...";
        modalSaveBtn.disabled = true;
    }

    const updatePayload = {
        description: specTextTextarea ? specTextTextarea.value : ""
    };

    try {
        // Request dispatcher targeting our live backend update route
        const res = await fetch(`${API}/${activeProductId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload)
        });

        if (res.ok) {
            window.closeSpecModal();
            loadProducts(); // Instantly refresh layout state data fields
        } else {
            alert("Failed to preserve structural data fields.");
        }
    } catch (err) {
        console.error(err);
        alert("Communication failure connecting to deployment cluster.");
    } finally {
        if (modalSaveBtn) {
            modalSaveBtn.innerText = "Save Information";
            modalSaveBtn.disabled = false;
        }
    }
};

// Delete Execution Loop Hook
async function deleteProduct(id) {
    if (!confirm("Are you sure? This will remove the product from the public site immediately.")) return;
    await fetch(API + "/" + id, { method: "DELETE" });
    loadProducts();
}

// Initial Boot Trigger
loadProducts();
