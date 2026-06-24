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
