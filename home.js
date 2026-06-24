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
// Shopsphere Product Cycling Carousel Logic
// ==========================================
let products = [];
let carouselIndex = 0;

const contentWrapper = document.getElementById('carousel-content');
const imgEl = document.getElementById('carousel-img');
const categoryEl = document.getElementById('carousel-category');
const titleEl = document.getElementById('carousel-title');
const descEl = document.getElementById('carousel-desc');
const priceEl = document.getElementById('carousel-price');
const dotsContainer = document.getElementById('carousel-dots');

// Function to update visual content with transition effects
function updateCarousel(index) {
    if (products.length === 0) return;
    carouselIndex = index;
    const item = products[carouselIndex];

    // 1. Trigger the out-animation classes
    contentWrapper.classList.replace('opacity-100', 'opacity-0');
    contentWrapper.classList.add('-translate-x-4', 'scale-95', 'blur-sm');

    // 2. Wait 300ms for element to vanish, swap text, then reveal it back
    setTimeout(() => {
        imgEl.src = item.image || "https://via.placeholder.com/300";
        imgEl.alt = item.name;
        categoryEl.textContent = item.category || "General";
        titleEl.textContent = item.name;
        descEl.textContent = item.description || "Explore this exclusive item available now on Shopsphere.";
        priceEl.textContent = `$${item.price}`;

        // Update Dots
        document.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
            if (idx === carouselIndex) {
                dot.classList.replace('w-2', 'w-6');
                dot.classList.replace('bg-slate-300', 'bg-indigo-600');
            } else {
                dot.classList.replace('w-6', 'w-2');
                dot.classList.replace('bg-indigo-600', 'bg-slate-300');
            }
        });

        // Clear out-animation classes to bring it back into view smoothly
        contentWrapper.classList.replace('opacity-0', 'opacity-100');
        contentWrapper.classList.remove('-translate-x-4', 'scale-95', 'blur-sm');
    }, 300);
}

// Fetch products from your database API
fetch('https://shopsphere-backend-wr5o.onrender.com/api/products')
    .then(res => res.json())
    .then(data => {
        products = data;
        if (products.length > 0) {
            // Build navigation dots
            products.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.className = `carousel-dot h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300'}`;
                dot.addEventListener('click', () => updateCarousel(idx));
                dotsContainer.appendChild(dot);
            });

            // Set the first product
            updateCarousel(0);

            // Auto-cycle rotation every 4.5 seconds
            setInterval(() => {
                let nextIndex = (carouselIndex + 1) % products.length;
                updateCarousel(nextIndex);
            }, 4500);
        }
    })
    .catch(err => console.error("Error loading showcase items:", err));
