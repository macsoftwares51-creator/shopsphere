// Preloader Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('preloader-hidden');
    }, 1000);
});

// Scroll Reveal Logic
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('reveal');
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.bento-item, .step-card').forEach(el => observer.observe(el));

// Magnetic Hero Effect
const hero = document.querySelector('.hero-tile');
hero.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = hero.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    hero.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-8px)`;
});

hero.addEventListener('mouseleave', () => {
    hero.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)`;
});

// ==========================================
// CAROUSEL DATA SYNC LAYER START
// ==========================================
let products = [];
let carouselIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    const contentWrapper = document.getElementById('carousel-content');
    const imgEl = document.getElementById('carousel-img');
    const categoryEl = document.getElementById('carousel-category');
    const titleEl = document.getElementById('carousel-title');
    const descEl = document.getElementById('carousel-desc');
    const priceEl = document.getElementById('carousel-price');
    const dotsContainer = document.getElementById('carousel-dots');
    
    // Target the view button to restore its clickable state
    const viewBtn = document.querySelector('.carousel-tile button');

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
            // Safely alter image references without triggering connection blocks
            if (item.image) {
                imgEl.src = item.image;
            } else {
                imgEl.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='100%' height='100%' fill='%23111827'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'>ShopSphere</text></svg>";
            }
            
            imgEl.alt = item.name || "Product Showcase";
            categoryEl.textContent = item.category || "Trending Now";
            titleEl.textContent = item.name || "Premium Product";
            descEl.textContent ="Explore this exclusive item available now on Shopsphere.";
            
            // Format currency strings smoothly
            if (item.price) {
                priceEl.textContent = typeof item.price === 'number' ? `KES ${item.price}` : item.price;
            } else {
                priceEl.textContent = "";
            }

            // Unlock and style the button once data connects completely
            if (viewBtn) {
                viewBtn.removeAttribute('disabled');
                viewBtn.style.cursor = 'pointer';
                viewBtn.style.background = 'white';
                viewBtn.style.color = 'black';
                viewBtn.textContent = 'View Details';
                
                viewBtn.onclick = () => {
                    if (item._id || item.id) {
                        window.location.href = `product-details.html?id=${item._id || item.id}`;
                    }
                };
            } 

            // Sync visual active indices across dot elements array
document.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
    // Map index using modulo 8 so dot indicators cycle cleanly when items > 8
    const activeDotIndex = carouselIndex % Math.min(products.length, 8);

    if (idx === activeDotIndex) {
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

    fetch('https://shopsphere-backend-wr5o.onrender.com/products')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            // Handle both object-array mappings or direct arrays safely
            products = Array.isArray(data) ? data : (data.products || []);
            
            if (products.length > 0) {
                dotsContainer.innerHTML = ''; // Clear fallback states
                
                // Dynamically build dot interface triggers 
                // AFTER: Cap dot generation at 8 items
products.slice(0, 8).forEach((_, idx) => {
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
        .catch(err => {
            console.error("Error loading showcase items:", err);
            titleEl.textContent = "ShopSphere Favorites";
            descEl.textContent = "Browse our premium listings live directly from the products dashboard catalog page.";
        });
});
// ==========================================
// CAROUSEL DATA SYNC LAYER END
// ==========================================
