let cart = JSON.parse(localStorage.getItem("cart")) || [];
let celebrationTriggered = false; // Prevents animation loops spamming memory loop hooks

// --- CANVAS CONFETTI ENGINE STRUCTURE ---
const canvas = document.getElementById("celebration-canvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function spawnConfettiStrips() {
    particles = [];
    const colors = ["#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ef4444", "#f43f5e"];
    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height - 20,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            width: Math.random() * 6 + 4,
            length: Math.random() * 15 + 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 4 + 3,
            speedX: (Math.random() - 0.5) * 2
        });
    }
}

function animateStrips() {
    if (particles.length === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.length / 2, p.width, p.length);
        ctx.restore();

        // Remove item if tracking out of visual window view
        if (p.y > canvas.height) particles.splice(idx, 1);
    });

    requestAnimationFrame(animateStrips);
}

// --- MAIN CART RENDER ROUTINE ---
function renderCart() {
    const list = document.getElementById("cart-items-list");
    const summary = document.getElementById("cart-summary");
    const empty = document.getElementById("empty-state");
    const subtotalDisplay = document.getElementById("subtotal-display");
    const deliveryDisplay = document.getElementById("delivery-display");
    const deliveryNote = document.getElementById("delivery-note");
    const totalDisplay = document.getElementById("total-display");

    // Hanging sign sub-elements target hooks
    const signText = document.getElementById("sign-main-text");
    const rowUnder1k = document.getElementById("cond-under-1k");
    const rowUnder2k = document.getElementById("cond-under-2k");
    const rowFree = document.getElementById("cond-free");

    list.innerHTML = "";
    let subtotal = 0;

    if (cart.length === 0) {
        summary.style.display = "none";
        empty.style.display = "block";
        celebrationTriggered = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = [];
        return;
    }

    summary.style.display = "block";
    empty.style.display = "none";

    cart.forEach((item, index) => {
        subtotal += (item.price * item.qty);
        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";
        itemEl.innerHTML = `
            <div class="item-info">
                <b>${item.name}</b>
                <span>Kes ${item.price.toLocaleString()} x ${item.qty}</span>
            </div>
            <div class="controls">
                <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                <button onclick="removeItem(${index})" style="background:none; border:none; color:var(--danger); cursor:pointer; font-weight:bold;">✕</button>
            </div>
        `;
        list.appendChild(itemEl);
    });

    // Delivery Logic Engine Core
    let deliveryFee = 200;
    let note = "Delivery is Kes 200 for orders under Kes 1,000";
    
    // Clear dynamic indicator selection states
    rowUnder1k.classList.remove("active");
    rowUnder2k.classList.remove("active");
    rowFree.classList.remove("active");

    if (subtotal >= 2000) {
        deliveryFee = 0;
        note = "🎉 FREE Delivery applied!";
        rowFree.classList.add("active");
        signText.innerHTML = "🎉 Free Shipping Unlocked!";

        // Run celebration if hitting threshold target limit
        if (!celebrationTriggered) {
            celebrationTriggered = true;
            spawnConfettiStrips();
            animateStrips();
        }
    } else if (subtotal >= 1000) {
        deliveryFee = 100;
        note = "Delivery reduced to Kes 100 (Order > 1,000)";
        rowUnder2k.classList.add("active");
        signText.innerHTML = `Add KES ${(2000 - subtotal).toLocaleString()} more for Free Delivery!`;
        celebrationTriggered = false; // reset hook tracker parameters
    } else {
        deliveryFee = 200;
        rowUnder1k.classList.add("active");
        signText.innerHTML = "Free Delivery for orders KES 2,000 & up!";
        celebrationTriggered = false;
    }

    subtotalDisplay.innerText = "Kes " + subtotal.toLocaleString();
    deliveryDisplay.innerText = deliveryFee === 0 ? "FREE" : "Kes " + deliveryFee.toLocaleString();
    deliveryNote.innerText = note;
    totalDisplay.innerText = "Total: Kes " + (subtotal + deliveryFee).toLocaleString();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveAndRefresh();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveAndRefresh();
}

function clearCart() {
    if(confirm("Empty your cart?")) { cart = []; saveAndRefresh(); }
}

function saveAndRefresh() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function placeOrder() {
    const name = document.getElementById("customerName").value.trim();
    if (!name) return alert("Please enter your name");

    const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    let delivery = subtotal >= 2000 ? 0 : (subtotal >= 1000 ? 100 : 200);
    
    let msg = `*ShopSphere Order*%0A*Customer:* ${name}%0A%0A`;
    cart.forEach(i => msg += `• ${i.name} (x${i.qty}) - Kes ${i.price * i.qty}%0A`);
    msg += `%0A*Subtotal:* Kes ${subtotal}%0A*Delivery:* ${delivery}%0A*Total:* Kes ${subtotal + delivery}`;
    
    window.open(`https://wa.me/254705779593?text=${msg}`, "_blank");
}

renderCart();
