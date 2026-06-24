        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        function renderCart() {
            const list = document.getElementById("cart-items-list");
            const summary = document.getElementById("cart-summary");
            const empty = document.getElementById("empty-state");
            const subtotalDisplay = document.getElementById("subtotal-display");
            const deliveryDisplay = document.getElementById("delivery-display");
            const deliveryNote = document.getElementById("delivery-note");
            const totalDisplay = document.getElementById("total-display");

            list.innerHTML = "";
            let subtotal = 0;

            if (cart.length === 0) {
                summary.style.display = "none";
                empty.style.display = "block";
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

            // Delivery Logic
            let deliveryFee = 200;
            let note = "Delivery is Kes 200 for orders under Kes 1,000";
            
            if (subtotal >= 2000) {
                deliveryFee = 0;
                note = "🎉 FREE Delivery applied!";
            } else if (subtotal >= 1000) {
                deliveryFee = 100;
                note = "Delivery reduced to Kes 100 (Order > 1,000)";
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
            
            window.open(`https://wa.me/254111803422?text=${msg}`, "_blank");
        }

        renderCart();
