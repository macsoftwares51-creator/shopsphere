const API = "https://shopsphere-backend-wr5o.onrender.com/products";
const form = document.getElementById("form");
const productsDiv = document.getElementById("products");
const countSpan = document.getElementById("count");

// Modal Component Hooks
const specModal = document.getElementById("specModal");
const modalTitle = document.getElementById("modalTitle");
const specTextTextarea = document.getElementById("specTextTextarea");
const modalSaveBtn = document.getElementById("modalSaveBtn");

// Runtime pointer storage variable capturing the target update element scope
let activeProductId = null;

form.onsubmit = async (e)=>{
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
        if(res.ok) {
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

async function loadProducts(){
    const res = await fetch(API);
    const products = await res.json();
    countSpan.innerText = products.length;
    productsDiv.innerHTML = "";

    products.forEach(product=>{
        // Store technical description details cleanly into a data attribute
        const descriptionEscaped = (product.description || "").replace(/"/g, '&quot;');
        
        productsDiv.innerHTML += `
            <div class="card">
                <img src="${product.image}" />
                <h3>${product.name}</h3>
                <p class="price">KES ${Number(product.price).toLocaleString()}</p>
                <p>${product.category}</p>
                <div class="card-controls">
                    <button class="info-btn" onclick="openSpecModal('${product._id}', '${product.name}', '${descriptionEscaped}')">
                        Add/Edit Details
                    </button>
                    <button class="delete-btn" onclick="deleteProduct('${product._id}')">
                        Remove Product
                    </button>
                </div>
            </div>
        `;
    });
}

// Modal Interaction Actions
function openSpecModal(id, name, currentDesc) {
    activeProductId = id;
    modalTitle.innerText = `Edit Specs: ${name}`;
    specTextTextarea.value = currentDesc;
    specModal.classList.add("active");
}

function closeSpecModal() {
    specModal.classList.remove("active");
    activeProductId = null;
    specTextTextarea.value = "";
}

// Request dispatcher targeting our new server PUT endpoint route
modalSaveBtn.onclick = async () => {
    if (!activeProductId) return;
    
    modalSaveBtn.innerText = "Saving Data...";
    modalSaveBtn.disabled = true;

    try {
        const res = await fetch(`${API}/${activeProductId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: specTextTextarea.value })
        });

        if (res.ok) {
            closeSpecModal();
            loadProducts();
        } else {
            alert("Failed to preserve structural data fields.");
        }
    } catch (err) {
        console.error(err);
        alert("Communication failure connecting to deployment cluster.");
    } finally {
        modalSaveBtn.innerText = "Save Information";
        modalSaveBtn.disabled = false;
    }
};

async function deleteProduct(id){
    if(!confirm("Are you sure? This will remove the product from the public site immediately.")) return;
    await fetch(API + "/" + id, { method: "DELETE" });
    loadProducts();
}

loadProducts();
