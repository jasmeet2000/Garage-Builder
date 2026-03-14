/*
  PeakCity Garages — main.js
  Handles: Mobile menu, sticky header, dropdowns, FAQ accordion,
           IntersectionObserver fade-up, counter animation, form validation
*/

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================
       MOBILE HAMBURGER TOGGLE
    ============================================ */
    const header = document.querySelector('.header');
    const container = header ? header.querySelector('.container') : null;
    const navMenu = document.querySelector('.nav-menu');

    if (container && navMenu) {
        const mobileToggle = document.createElement('div');
        mobileToggle.className = 'mobile-toggle';
        mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        mobileToggle.setAttribute('role', 'button');
        mobileToggle.setAttribute('tabindex', '0');
        mobileToggle.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(mobileToggle);

        function closeMobileMenu() {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                mobileToggle.classList.add('active');
                navMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });

        mobileToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                mobileToggle.click();
            }
        });

        // Close when clicking outside nav
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }

    /* ============================================
       STICKY HEADER SCROLL EFFECT
    ============================================ */
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    /* ============================================
       DROPDOWN TOGGLE
    ============================================ */
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        const dropdown = item.querySelector('.dropdown-content');
        if (dropdown && link) {
            link.addEventListener('click', (e) => {
                // Prevent navigation for the parent toggle link
                e.preventDefault();
                if (window.innerWidth <= 768) {
                    item.classList.toggle('active');
                    dropdown.style.display = item.classList.contains('active') ? 'block' : 'none';
                }
            });
        }
    });

    /* ============================================
       FAQ ACCORDION
    ============================================ */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all
            faqItems.forEach(other => other.classList.remove('active'));
            // Open clicked (if it wasn't already open)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    /* ============================================
       INTERSECTION OBSERVER — FADE-UP ANIMATIONS
    ============================================ */
    const fadeEls = document.querySelectorAll('.fade-up');
    if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });
        fadeEls.forEach(el => fadeObserver.observe(el));
    } else {
        // Fallback: show all
        fadeEls.forEach(el => el.classList.add('visible'));
    }

    /* ============================================
       ANIMATED COUNTER (Stats Bar)
    ============================================ */
    const counters = document.querySelectorAll('.counter');

    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const start = performance.now();

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString();
            }
        }
        requestAnimationFrame(step);
    }

    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => counterObserver.observe(c));
    } else {
        counters.forEach(c => { c.textContent = parseInt(c.dataset.target, 10).toLocaleString(); });
    }

    /* ============================================
       FORM VALIDATION
    ============================================ */
    const forms = document.querySelectorAll('form[id]');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            const required = form.querySelectorAll('[required]');

            required.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#E8A020';
                    field.style.boxShadow = '0 0 0 3px rgba(232,160,32,0.20)';
                } else {
                    field.style.borderColor = '';
                    field.style.boxShadow = '';
                }
            });

            // Reset error on input
            required.forEach(field => {
                field.addEventListener('input', () => {
                    if (field.value.trim()) {
                        field.style.borderColor = '';
                        field.style.boxShadow = '';
                    }
                }, { once: false });
            });

            if (isValid) {
                window.location.href = 'thank-you.html';
            }
        });
    });

});
