const API = "https://shopsphere-backend-wr5o.onrender.com/products";
const form = document.getElementById("form");
const productsDiv = document.getElementById("products");
const countSpan = document.getElementById("count");

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
        productsDiv.innerHTML += `
            <div class="card">
                <img src="${product.image}" />
                <h3>${product.name}</h3>
                <p class="price">KES ${Number(product.price).toLocaleString()}</p>
                <p>${product.category}</p>
                <button class="delete-btn" onclick="deleteProduct('${product._id}')">
                    Remove Product
                </button>
            </div>
        `;
    });
}

async function deleteProduct(id){
    if(!confirm("Are you sure? This will remove the product from the public site immediately.")) return;
    await fetch(API + "/" + id, { method: "DELETE" });
    loadProducts();
}

loadProducts();
