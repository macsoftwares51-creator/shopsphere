let allProducts = [];

// Initialize Page
fetch("https://shopsphere-backend-wr5o.onrender.com/products")
    .then(res => res.json())
    .then(data => {
        allProducts = data;
        fillCategories(data);
        render(data);
    })
    .catch(err => console.error("Error:", err));

// Render Products
function render(products) {
    const box = document.getElementById("products");
    box.innerHTML = "";
    
    products.forEach((p, index) => {
        const id = p._id; // Unique MongoDB Product ID
        const name = p.name || "Unnamed Item";
        const category = p.category || "General";
        const price = Number(p.price) || 0;
        const image = p.image || "https://via.placeholder.com/200";
        
        const card = document.createElement('div');
        card.className = 'card';
        
        // Remove padding from the card base style dynamically so the link hits the absolute edges
        card.style.padding = "0";
        card.style.overflow = "hidden";
        card.style.display = "flex";
        card.style.flexDirection = "column";

        // Staggered reveal animation
        setTimeout(() => card.classList.add('reveal'), index * 60);

        card.innerHTML = `
            <a href="product-details.html?id=${id}" style="text-decoration: none; color: inherit; display: block; padding: 20px; flex-grow: 1;">
                <img src="${image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 20px;">
                <h3>${name}</h3>
                <p style="color: var(--text-dim); font-size: 13px; margin-bottom: 15px; text-transform: uppercase;">${category}</p>
                <span class="price" style="color: var(--accent); font-size: 20px; font-weight: 800; display: block;">Kshs ${price}</span>
            </a>
            
            <div style="padding: 0 20px 20px 20px;">
                <button class="add-btn" onclick="addToCart('${name.replace(/'/g, "\\'")}', ${price})">
                    Add to Cart
                </button>
            </div>
        `;
        box.appendChild(card);
    });
}
// Cart Logic
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

// Initial badge check
updateCartBadge();

// --- Utilities ---
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

async function sendRequest() {
    const btn = document.querySelector(".btn-gold");
    const name = document.getElementById("reqName").value;
    const email = document.getElementById("reqEmail").value;
    const product = document.getElementById("reqProduct").value;

    if (!name || !email || !product) {
        document.getElementById("reqMessage").innerText = "Fill all fields.";
        return;
    }

    btn.innerText = "Sending...";
    try {
        const response = await fetch("https://shopsphere-backend-wr5o.onrender.com/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, product })
        });
        const data = await response.json();
        document.getElementById("reqMessage").innerText = data.success ? "Sent! We'll be in touch. ✅" : "Error.";
    } catch {
        document.getElementById("reqMessage").innerText = "Check your connection.";
    } finally {
        btn.innerText = "Send Request";
    }
}

// Search & Filter Listeners
document.getElementById("search").oninput = 
document.getElementById("category").onchange = () => {
    const q = document.getElementById("search").value.toLowerCase();
    const cat = document.getElementById("category").value;
    render(allProducts.filter(p => 
        (p.name || "").toLowerCase().includes(q) && 
        (!cat || p.category === cat)
    ));
};
