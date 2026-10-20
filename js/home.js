const PRODUCTS_API = "https://shopsphere-backend-wr5o.onrender.com/products";

window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if (preloader) setTimeout(() => preloader.classList.add("preloader-hidden"), 1000);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("reveal"), index * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll(".bento-item, .step-card").forEach((element) => observer.observe(element));

const hero = document.querySelector(".hero-showcase");
if (hero) {
    hero.addEventListener("mousemove", (event) => {
        const { left, top, width, height } = hero.getBoundingClientRect();
        const x = (event.clientX - left) / width - 0.5;
        const y = (event.clientY - top) / height - 0.5;
        hero.style.transform = `perspective(1400px) rotateY(${x * 2}deg) rotateX(${-y * 2}deg) translateY(-4px)`;
    });
    hero.addEventListener("mouseleave", () => {
        hero.style.transform = "perspective(1400px) rotateY(0deg) rotateX(0deg) translateY(0)";
    });
}

const orbitCards = document.getElementById("orbit-cards");
let products = [];
let orbitCardElements = [];
let orbitStartTime = 0;
let orbitFrame = null;
const orbitSlots = 5;
const orbitSpeed = 0.34;

function productId(product) {
    return product._id || product.id;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updateCardContent(card, product) {
    const image = product.image || "assets/logo3.1.png";
    card.dataset.productId = productId(product);
    card.innerHTML = `
        <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name || "Product")}" />
        <strong>${escapeHtml(product.name || "Featured product")}</strong>
        <span>KES ${Number(product.price || 0).toLocaleString()}</span>
    `;
}

function renderStoreProduct(product, badgeText = "") {
    const id = encodeURIComponent(productId(product));
    return `
        <article class="home-product-card">
            ${badgeText ? `<span class="home-product-badge">${escapeHtml(badgeText)}</span>` : ""}
            <a href="product-details.html?id=${id}">
                <img class="home-product-image" src="${escapeHtml(product.image || "assets/logo3.1.png")}" alt="${escapeHtml(product.name || "Product")}" />
                <h3>${escapeHtml(product.name || "Featured product")}</h3>
                <div class="home-product-meta">
                    <span class="home-product-category">${escapeHtml(product.category || "General")}</span>
                    <span class="home-product-price">KES ${Number(product.price || 0).toLocaleString()}</span>
                </div>
            </a>
        </article>
    `;
}

function renderStorefront() {
    const categoryRoot = document.getElementById("homeCategories");
    const arrivalsRoot = document.getElementById("newArrivals");
    const bestSellersRoot = document.getElementById("bestSellers");
    if (!categoryRoot || !arrivalsRoot || !bestSellersRoot) return;

    if (!products.length) {
        const empty = '<div class="store-empty">Our storefront is waiting for its first products.</div>';
        categoryRoot.innerHTML = empty;
        arrivalsRoot.innerHTML = empty;
        bestSellersRoot.innerHTML = empty;
        return;
    }

    const categoryMap = new Map();
    products.forEach((product) => {
        const name = (product.category || "General").trim() || "General";
        if (!categoryMap.has(name)) categoryMap.set(name, product);
    });
    categoryRoot.innerHTML = [...categoryMap.entries()].slice(0, 6).map(([name, product]) => `
        <a class="category-card" href="products.html?category=${encodeURIComponent(name)}" style="background-image:url('${escapeHtml(product.image || "assets/logo3.1.png")}')">
            <span><strong>${escapeHtml(name)}</strong><small>Shop collection →</small></span>
        </a>
    `).join("") || '<div class="store-empty">Categories will appear here soon.</div>';

    arrivalsRoot.innerHTML = products.slice(0, 5).map((product) => renderStoreProduct(product, "New")).join("");
    const bestSellers = [...products].sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0)).slice(0, 5);
    bestSellersRoot.innerHTML = bestSellers.map((product) => renderStoreProduct(product, "Popular")).join("");
}

function renderOrbitCards() {
    if (!orbitCards) return;
    if (!products.length) {
        orbitCards.innerHTML = '<div class="orbit-empty">Products will appear here soon.</div>';
        orbitCardElements = [];
        return;
    }

    orbitCards.innerHTML = Array.from({ length: Math.min(orbitSlots, products.length) }, (_, index) => `
        <button class="orbit-card" type="button" data-slot="${index}"></button>
    `).join("");

    orbitCardElements = [...orbitCards.querySelectorAll(".orbit-card")];
    orbitCardElements.forEach((card, index) => {
        updateCardContent(card, products[index % products.length]);
        card.addEventListener("click", () => {
            window.location.href = `product-details.html?id=${encodeURIComponent(card.dataset.productId)}`;
        });
    });
    orbitStartTime = performance.now();
    if (!orbitFrame) orbitFrame = requestAnimationFrame(animateOrbit);
}

function animateOrbit(timestamp) {
    if (!orbitCardElements.length || !orbitCards) {
        orbitFrame = null;
        return;
    }

    const { width, height } = orbitCards.getBoundingClientRect();
    const centerX = width * 0.5;
    const centerY = height * 0.42;
    const radiusX = Math.min(width * 0.42, 300);
    const radiusY = Math.max(height * 0.82, 300);
    const elapsed = (timestamp - orbitStartTime) / 1000;
    orbitCardElements.forEach((card, slotIndex) => {
        const startingAngle = Math.PI / 4 - (slotIndex * Math.PI * 2 / orbitCardElements.length);
        const angle = startingAngle - orbitSpeed * elapsed;
        const progress = startingAngle - angle;
        const bottomLeftAngle = -Math.PI * 5 / 4;
        const distanceToBottomLeft = ((startingAngle - bottomLeftAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const completedTransitions = progress < distanceToBottomLeft
            ? 0
            : 1 + Math.floor((progress - distanceToBottomLeft) / (Math.PI * 2));
        const rawProductIndex = (slotIndex + completedTransitions * orbitCardElements.length) % products.length;
        const nextProductIndex = (rawProductIndex + products.length) % products.length;

        const x = centerX + Math.cos(angle) * radiusX;
        const y = centerY + Math.sin(angle) * radiusY;
        const depth = Math.sin(angle);
        const verticalRatio = y / height;
        const edgeFade = verticalRatio > 0.82 ? Math.max(0, Math.min(1, (1 - verticalRatio) / 0.18)) : 1;

        // Swap only after the card is below the hero edge, so the content change is invisible.
        const productKey = `${completedTransitions}:${nextProductIndex}`;
        if (card.dataset.productKey !== productKey && verticalRatio > 0.96) {
            updateCardContent(card, products[nextProductIndex]);
            card.dataset.productKey = productKey;
        }

        const scale = 0.86 + Math.max(0, depth) * 0.14;

        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        card.style.opacity = edgeFade;
        card.style.zIndex = String(depth > 0 ? 5 : 1);
        card.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${Math.sin(angle) * 5}deg)`;
    });

    // Keep the animation continuous while allowing the browser to throttle it in background tabs.
    orbitFrame = requestAnimationFrame(animateOrbit);
}

async function loadOrbitProducts() {
    try {
        const response = await fetch(PRODUCTS_API);
        if (!response.ok) throw new Error(`Products request failed: ${response.status}`);
        const data = await response.json();
        products = Array.isArray(data) ? data : (data.products || []);
        renderStorefront();
        renderOrbitCards();
    } catch (error) {
        console.error("Error loading featured products:", error);
        if (orbitCards) orbitCards.innerHTML = '<div class="orbit-empty">Featured products are temporarily unavailable.</div>';
    }
}

loadOrbitProducts();
