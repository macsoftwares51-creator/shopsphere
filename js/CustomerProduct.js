let allProducts = [];

// Fetch Marketplace Items
fetch("https://shopsphere-backend-wr5o.onrender.com/SellerRequest/approved")
  .then(res => {
    if (!res.ok) throw new Error("404");
    return res.json();
  })
  .then(data => {
    allProducts = data;
    fillCategories(data);
    render(data);
  })
  .catch(err => {
    document.getElementById("products").innerHTML = `<p style="text-align:center; grid-column:1/-1; color: #ef4444;">Marketplace items couldn't be loaded. Try refreshing.</p>`;
  });

function render(products) {
    const box = document.getElementById("products");
    box.innerHTML = "";
    
    products.forEach((p, index) => {
        // EXACT MAPPING FROM YOUR BACKEND:
        const itemTitle = p.productName || "Unnamed Item";
        const itemPrice = p.price || 0;
        const itemDesc = p.description || "No description provided.";
        const itemImg = p.image || "https://via.placeholder.com/200";
        const sellerName = p.name || "Unknown Seller"; // This is the person's name

        const card = document.createElement('div');
        card.className = 'card';
        setTimeout(() => card.classList.add('reveal'), index * 50);

        card.innerHTML = `
            <img src="${itemImg}" onclick="openImage('${itemImg}')" alt="${itemTitle}">
            <em>Sold by: ${sellerName}</em>
            <h3 style="margin-top: 10px; color: white;">${itemTitle}</h3>
            <p style="font-size: 13px; color: var(--text-dim); margin: 10px 0; line-height: 1.4;">
                ${itemDesc}
            </p>
            <span class="price">Kshs ${itemPrice.toLocaleString()}</span>
            <button class="add-btn" onclick="addToCart('${itemTitle.replace(/'/g, "\\'")}', ${itemPrice})">
                Add to Cart
            </button>
        `;
        box.appendChild(card);
    });
}

// Global Cart Utils
function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(item => item.name === name);
    if (existing) { existing.qty++; } 
    else { cart.push({ name, price, qty: 1 }); }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const badge = document.getElementById("cart-badge");
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.innerText = totalItems;
    if (totalItems > 0) {
        badge.classList.add("badge-pop");
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

function fillCategories(products) {
    const select = document.getElementById("category");
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function openImage(src) {
    document.getElementById("modalImg").src = src;
    document.getElementById("imageModal").style.display = "flex";
}

// Filters
document.getElementById("search").oninput = 
document.getElementById("category").onchange = () => {
    const q = document.getElementById("search").value.toLowerCase();
    const cat = document.getElementById("category").value;
    
    const filtered = allProducts.filter(p => {
        // Matches against the Product Name instead of Seller Name
        const productNameMatch = (p.productName || "").toLowerCase().includes(q);
        const categoryMatch = !cat || p.category === cat;
        return productNameMatch && categoryMatch;
    });
    
    render(filtered);
};
// Start
updateCartBadge();
