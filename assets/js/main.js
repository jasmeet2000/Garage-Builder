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
       ACTIVE NAV ITEM HIGHLIGHT
    ============================================ */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu .nav-item > a, .dropdown-content a');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            // Add active to the item itself
            link.classList.add('active');
            // If it's a direct child of .nav-item, add active to .nav-item
            if (link.parentElement.classList.contains('nav-item')) {
                link.parentElement.classList.add('active');
            }
            // If it's inside dropdown-content, add active to the parent nav-item
            if (link.parentElement.classList.contains('dropdown-content')) {
                const parentNavItem = link.parentElement.closest('.nav-item');
                if (parentNavItem) parentNavItem.classList.add('active');
            }
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
       FORM VALIDATION & EMAILJS
    ============================================ */
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init("bxB7gh1jwQrNXwRZ3"); // Public Key
    }

    const forms = document.querySelectorAll('form[id]');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Basic validation
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            const submitBtn = form.querySelector('[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#e53e3e';
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!isValid) {
                console.warn('Form validation failed.');
                return;
            }

            // Check reCAPTCHA if it exists on the page
            const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
            if (document.querySelector('.g-recaptcha') && !recaptchaResponse) {
                alert('Please complete the reCAPTCHA verification to submit.');
                return;
            }

            // EmailJS Sending
            if (typeof emailjs !== 'undefined') {
                try {
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '⏳ Sending...';
                    }

                    // Prepare template parameters
                    const formData = new FormData(form);
                    const templateParams = {
                        from_name: formData.get('name') || 'Not specified',
                        name: formData.get('name') || 'Not specified',             // Added for {{name}} in Auto-Reply
                        from_email: formData.get('email') || 'Not specified',
                        to_email: formData.get('email') || 'Not specified',        // Customer's email for Auto-Reply
                        from_phone: formData.get('phone') || 'Not specified',
                        service_type: formData.get('service') || formData.get('type') || 'Not specified',
                        title: 'Quote Request for ' + (formData.get('service') || formData.get('type') || 'Garage'), // Added for {{title}}
                        property_address: formData.get('address') || 'Not specified',
                        message: formData.get('message') || 'Not specified',
                        lead_source: formData.get('source') || 'Direct',
                        business_email: 'constructyyc@gmail.com',
                        'g-recaptcha-response': typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : ''
                    };

                    const templateID = 'template_gl0tx58';

                    const result = await emailjs.send('service_d4bggik', templateID, templateParams);
                    
                    // Show success
                    if (document.getElementById('form-success')) {
                        form.style.display = 'none';
                        document.getElementById('form-success').style.display = 'block';
                    } else {
                        window.location.href = 'thank-you.html';
                    }
                } catch (error) {
                    console.error('EmailJS Error:', error);
                    if (document.getElementById('form-error')) {
                        document.getElementById('form-error').style.display = 'block';
                    } else {
                        alert('Something went wrong. Please call us at +1 (587) 439-7703');
                    }
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                }
            } else {
                console.error('EmailJS library not loaded.');
                window.location.href = 'thank-you.html';
            }
        });
    });

    /* ============================================
       PRICING BLUR - ENSURE PERMANENT IF LOCKED
    ============================================ */
    if (localStorage.getItem('peakcity_pricing_unlocked') !== 'true') {
        const blurWrappers = document.querySelectorAll('.price-blur-wrapper');
        blurWrappers.forEach(w => {
            w.style.cursor = 'default';
            w.style.pointerEvents = 'none';
        });
    }

    // ===== DYNAMIC EXIT INTENT POPUP =====
    if (!sessionStorage.getItem('peakcity_exit_intent_shown')) {
        // Create popup elements
        const exitPopup = document.createElement('div');
        exitPopup.id = 'exit-intent-popup';
        exitPopup.className = 'exit-popup-overlay';
        exitPopup.style.display = 'none';
        
        exitPopup.innerHTML = `
            <div class="exit-popup-card">
                <button class="exit-popup-close" aria-label="Close popup">&times;</button>
                <div class="exit-popup-content">
                    <span class="exit-popup-badge">Wait! Before You Go...</span>
                    <h3>Get $1,000 Off Your Custom Garage Build</h3>
                    <p>Claim your early-booking voucher and get our Free 2026 Custom Garage Planning Checklist delivered to your inbox instantly.</p>
                    <form class="exit-popup-form" id="exit-popup-form">
                        <input type="text" id="exit-name" placeholder="Your Name" required>
                        <input type="email" id="exit-email" placeholder="Your Email Address" required>
                        <button type="submit" class="btn btn-primary">🎯 Send My Discount &amp; Checklist</button>
                    </form>
                    <p class="exit-popup-footer">No obligation. 100% spam-free. Valid for all 2026 builds.</p>
                </div>
            </div>
        `;
        document.body.appendChild(exitPopup);

        // Track cursor leaving viewport
        let exitTriggered = false;
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 20 && !exitTriggered) {
                exitTriggered = true;
                sessionStorage.setItem('peakcity_exit_intent_shown', 'true');
                exitPopup.style.display = 'flex';
                // Trigger CSS transitions
                setTimeout(() => { exitPopup.classList.add('show'); }, 10);
            }
        });

        // Close function
        const closePopup = () => {
            exitPopup.classList.remove('show');
            setTimeout(() => { exitPopup.style.display = 'none'; }, 300);
        };

        exitPopup.querySelector('.exit-popup-close').addEventListener('click', closePopup);
        exitPopup.addEventListener('click', (e) => { if (e.target === exitPopup) closePopup(); });

        // Handle submission
        const exitForm = document.getElementById('exit-popup-form');
        if (exitForm) {
            exitForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('exit-name').value;
                const email = document.getElementById('exit-email').value;
                const submitBtn = exitForm.querySelector('button');

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'Sending...';
                }

                if (typeof emailjs !== 'undefined') {
                    try {
                        const templateParams = {
                            from_name: name,
                            name: name,
                            from_email: email,
                            to_email: 'constructyyc@gmail.com',
                            service_type: 'Exit Intent Lead',
                            title: 'Exit Intent Lead: ' + name,
                            message: 'User claimed the exit-intent discount and checklist on peakcitygarages.ca. Name: ' + name + ', Email: ' + email,
                            business_email: 'constructyyc@gmail.com'
                        };
                        await emailjs.send('service_d4bggik', 'template_gl0tx58', templateParams);
                    } catch (err) {
                        console.error('Error sending lead via EmailJS:', err);
                    }
                }

                // Redirect to thank you
                window.location.href = 'thank-you.html';
            });
        }
    }

});
