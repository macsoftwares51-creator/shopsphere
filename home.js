// ==========================================
// CAROUSEL DATA SYNC LAYER START
// ==========================================
let products = [];
let carouselIndex = 0;

// Ensure execution waits until structural nodes populate completely
document.addEventListener("DOMContentLoaded", () => {
    const contentWrapper = document.getElementById('carousel-content');
    const imgEl = document.getElementById('carousel-img');
    const categoryEl = document.getElementById('carousel-category');
    const titleEl = document.getElementById('carousel-title');
    const descEl = document.getElementById('carousel-desc');
    const priceEl = document.getElementById('carousel-price');
    const dotsContainer = document.getElementById('carousel-dots');

    if (!contentWrapper || !dotsContainer) return;

    function updateCarousel(index) {
        if (products.length === 0) return;
        carouselIndex = index;
        const item = products[carouselIndex];

        // 1. Shift node layers into transient animation space
        contentWrapper.style.opacity = '0';
        contentWrapper.style.transform = 'translateX(-16px) scale(0.98)';

        // 2. Intercept data layer, re-hydrate nodes, restore layout state
        setTimeout(() => {
            imgEl.src = item.image || "https://via.placeholder.com/300";
            imgEl.alt = item.name;
            categoryEl.textContent = item.category || "General";
            titleEl.textContent = item.name;
            descEl.textContent = item.description || "Explore this exclusive item available now on Shopsphere.";
            priceEl.textContent = `$${item.price}`;

            // Sync visual active indices across dot elements array
            document.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
                if (idx === carouselIndex) {
                    dot.style.width = '24px';
                    dot.style.background = 'var(--accent)';
                } else {
                    dot.style.width = '8px';
                    dot.style.background = 'rgba(255, 255, 255, 0.2)';
                }
            });

            // Return presentation layers back to normal view space
            contentWrapper.style.opacity = '1';
            contentWrapper.style.transform = 'translateX(0) scale(1)';
        }, 300);
    }

    fetch('https://shopsphere-backend-wr5o.onrender.com/api/products')
        .then(res => res.json())
        .then(data => {
            products = data;
            if (products.length > 0) {
                // Dynamically build dot interface triggers 
                products.forEach((_, idx) => {
                    const dot = document.createElement('button');
                    dot.className = 'carousel-dot';
                    dot.style.cssText = `
                        height: 8px;
                        border-radius: 9999px;
                        border: none;
                        outline: none;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    `;
                    // Build initial layout configurations matching dynamic scale assignments
                    if (idx === 0) {
                        dot.style.width = '24px';
                        dot.style.background = 'var(--accent)';
                    } else {
                        dot.style.width = '8px';
                        dot.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                    
                    dot.addEventListener('click', () => updateCarousel(idx));
                    dotsContainer.appendChild(dot);
                });

                updateCarousel(0);

                // Auto-cycle rotation loop assignment
                setInterval(() => {
                    let nextIndex = (carouselIndex + 1) % products.length;
                    updateCarousel(nextIndex);
                }, 4500);
            }
        })
        .catch(err => console.error("Error loading showcase items:", err));
});
// ==========================================
// CAROUSEL DATA SYNC LAYER END
// ==========================================
