document.addEventListener('DOMContentLoaded', () => {
    // --- GSAP Registration ---
    gsap.registerPlugin(ScrollTrigger);

    // --- Header Scroll Effect ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Progress Bar ---
    gsap.to('.progress-bar', {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3
        }
    });

    // --- Binary Scramble Effect ---
    const scrambleElements = document.querySelectorAll('.bin-reveal');
    
    function startBinaryScramble(el, customDuration) {
        const finalContent = el.getAttribute('data-text');
        const duration = customDuration || 1000; // Change default to 1 second
        const characters = '01';
        let startTime = null;

        function update(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            let result = '';
            for (let i = 0; i < finalContent.length; i++) {
                if (finalContent[i] === ' ') {
                    result += ' ';
                    continue;
                }
                
                // More gradual reveal: Starts at 30% and finishes at 100%
                if (progress > (i / finalContent.length) * 0.7 + 0.3) {
                    result += finalContent[i];
                } else {
                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                }
            }

            el.innerText = result;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // --- Title Rotation Logic ---
    const mainTitle = document.querySelector('.main-title.bin-reveal');
    if (mainTitle) {
        const titles = JSON.parse(mainTitle.getAttribute('data-titles'));
        let currentTitleIndex = 0;

        setInterval(() => {
            currentTitleIndex = (currentTitleIndex + 1) % titles.length;
            mainTitle.setAttribute('data-text', titles[currentTitleIndex]);
            startBinaryScramble(mainTitle, 1000); // 1s scramble
        }, 4000); // Change every 4 seconds
    }

    // --- Hover Binary Scramble for Links ---
    const allLinks = document.querySelectorAll('.nav-link, .mobile-link');
    allLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            startBinaryScramble(link, 1000);
        });
    });

    // Removed initial on-load scramble to prevent visual 'disturbance'

    // --- Hero Entrance Animations ---
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.5 } });

    // Force buttons/layout to base state before animation starts
    gsap.set('.hero-cta, .hero-cta .btn', { opacity: 1, visibility: 'visible' });

    heroTl.from('.sub-title', { y: 20, opacity: 0, delay: 0.5 })
          .from('.hero-cta .btn', { y: 20, opacity: 0, stagger: 0.2 }, '-=1')
          .from('.profile-parallax-wrapper', { x: 50, opacity: 0, duration: 1.5 }, '-=1.2')
          .from('.scroll-indicator', { opacity: 0, y: -20 }, '-=0.5');


    // --- Robust Dynamic Parallax (Mouse vs Gyroscope Detection) ---
    const profileFrame = document.querySelector('.profile-frame');
    let hasGyro = false;

    function updateProfileParallax(x, y) {
        if (!profileFrame) return;
        gsap.to(profileFrame, {
            rotationY: -15 + x,
            rotationX: 5 - y,
            x: x * 0.5,
            y: y * 0.5,
            duration: 0.8,
            ease: 'power2.out'
        });
    }

    // 1. Mouse Logic (Default / Fallback)
    window.addEventListener('mousemove', (e) => {
        // Jika gyro sudah terdeteksi dan aktif, matikan fungsi mouse agar tidak bentrok
        if (hasGyro) return; 

        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 40;
        const yPos = (clientY / window.innerHeight - 0.5) * 40;
        updateProfileParallax(xPos, yPos);
    });

    // 2. Gyroscope Detection & Logic
    function handleOrientation(e) {
        // Pastikan sensor memberikan data yang valid (bukan null atau undefined)
        if (e.beta !== null && e.gamma !== null) {
            hasGyro = true; // Konfirmasi perangkat memiliki sensor gyro fungsional
            
            // Konversi kemiringan menjadi posisi rotasi
            const xPos = Math.max(-20, Math.min(20, e.gamma)); 
            const yPos = Math.max(-20, Math.min(20, e.beta - 45)); 
            updateProfileParallax(xPos, yPos);
        }
    }

    // 3. Permission & Activation
    async function initSensor() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                // Spesifik untuk iOS 13+
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            } catch (error) {
                console.warn("Sensor access denied or restricted.");
            }
        } else {
            // Android atau browser lain: coba dengarkan langsung
            window.addEventListener('deviceorientation', handleOrientation);
        }
    }

    // Trigger inisialisasi pada interaksi pertama (syarat umum browser mobile)
    const sensorTriggers = ['touchstart', 'click'];
    sensorTriggers.forEach(trigger => {
        document.addEventListener(trigger, initSensor, { once: true });
    });

    // --- Section Titles Reveal ---
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // --- Dual Grid Skills Animation & Parallax ---
    const skillsGrid = document.querySelector('.dual-skills-grid');
    if (skillsGrid) {
        // Entrance Animations (Existing)
        gsap.from('.software-column', {
            scrollTrigger: {
                trigger: '.dual-skills-grid',
                start: 'top 95%'
            },
            x: -30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });

        gsap.from('.tech-column', {
            scrollTrigger: {
                trigger: '.dual-skills-grid',
                start: 'top 95%'
            },
            x: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });

        gsap.from('.skill-item', {
            scrollTrigger: {
                trigger: '.dual-skills-grid',
                start: 'top 90%'
            },
            y: 15,
            opacity: 0,
            stagger: 0.03,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all'
        });

        // Parallax Effect on Scroll
        gsap.to('.software-column', {
            y: -50,
            ease: 'none',
            scrollTrigger: {
                trigger: '.dual-skills-grid',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5
            }
        });

        gsap.to('.tech-column', {
            y: 50,
            ease: 'none',
            scrollTrigger: {
                trigger: '.dual-skills-grid',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5
            }
        });

        // Subtle Item-Level Parallax Offsets
        const items = document.querySelectorAll('.skill-item');
        items.forEach((item, index) => {
            const movement = (index % 2 === 0) ? -20 : 20;
            gsap.to(item, {
                y: movement,
                ease: 'none',
                scrollTrigger: {
                    trigger: item,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });
    }

    // --- Interactive Tilt for Skill Columns ---
    document.querySelectorAll('.skills-column').forEach(column => {
        column.addEventListener('mousemove', (e) => {
            const rect = column.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            gsap.to(column, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: 'power2.out'
            });
        });

        column.addEventListener('mouseleave', () => {
            gsap.to(column, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });

    // ══════════════════════════════════════
    // ROLE PANELS HOVER EFFECTS
    // ══════════════════════════════════════
    const rolePanels = document.querySelectorAll('.role-panel');
    
    rolePanels.forEach(panel => {
        const accent = panel.dataset.accent || '#ffffff';
        
        // Prepare target elements
        const fill = panel.querySelector('.rp-fill');
        const num = panel.querySelector('.rp-num');
        const line = panel.querySelector('.rp-line');
        const icon = panel.querySelector('.rp-icon');
        const tags = panel.querySelectorAll('.rp-tags span');

        // Initial setup for the CSS variable
        fill.style.setProperty('--panel-accent', accent);

        // Entrance animation on scroll
        gsap.from(panel, {
            scrollTrigger: {
                trigger: '.role-panels',
                start: 'top 85%'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.15
        });

        let flipTimer;

        // Hover events
        panel.addEventListener('mouseenter', () => {
            gsap.to(panel, { scale: 1.03, y: -10, borderColor: `${accent}40`, duration: 0.4, ease: 'power2.out' });
            gsap.to(fill, { opacity: 1, duration: 0.4, ease: 'power2.out' });
            gsap.to(num, { x: -10, color: `${accent}15`, duration: 0.4, ease: 'power2.out' });
            gsap.to(line, { backgroundColor: accent, duration: 0.4, ease: 'power2.out' });
            gsap.to(icon, { color: accent, y: -5, duration: 0.4, ease: 'power2.out' });
            gsap.to(tags, { 
                borderColor: `${accent}60`, 
                color: '#ffffff',
                backgroundColor: `${accent}10`,
                duration: 0.3, 
                stagger: 0.05, 
                ease: 'power2.out' 
            });

            // Flip after cursor stays for 800ms
            flipTimer = setTimeout(() => {
                panel.classList.add('is-flipped');
            }, 800);
        });

        panel.addEventListener('mouseleave', () => {
            clearTimeout(flipTimer);
            panel.classList.remove('is-flipped');
            
            gsap.to(panel, { scale: 1, y: 0, borderColor: 'rgba(255,255,255,0.08)', duration: 0.4, ease: 'power2.inOut' });
            gsap.to(fill, { opacity: 0, duration: 0.4, ease: 'power2.inOut' });
            gsap.to(num, { x: 0, color: 'rgba(255,255,255,0.03)', duration: 0.4, ease: 'power2.inOut' });
            gsap.to(line, { backgroundColor: 'rgba(255,255,255,0.1)', duration: 0.4, ease: 'power2.inOut' });
            gsap.to(icon, { color: 'rgba(255,255,255,0.5)', y: 0, duration: 0.4, ease: 'power2.inOut' });
            gsap.to(tags, { 
                borderColor: 'rgba(255,255,255,0.08)', 
                color: 'rgba(255,255,255,0.4)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                duration: 0.3, 
                stagger: 0.05, 
                ease: 'power2.inOut' 
            });
        });
    });

    // ══════════════════════════════════════
    // CONTACT SECTION GSAP ANIMATIONS
    // ══════════════════════════════════════
    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
        // Glowing Background Orbs Parallax
        gsap.to('.contact-glow.glow-1', {
            y: 100, x: 50,
            ease: 'none',
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });

        gsap.to('.contact-glow.glow-2', {
            y: -100, x: -50,
            ease: 'none',
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });

        // Glass Panel Entrance
        gsap.from('.glass-panel', {
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 80%'
            },
            y: 60,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
        });

        // Contact Info Reveal
        gsap.from('.contact-info > *', {
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 75%'
            },
            x: -40,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out'
        });

        // Form Elements Stagger Reveal
        gsap.from('.gs-reveal', {
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 75%'
            },
            x: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out'
        });
    }

    // --- Form Interaction ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            // Artificial delay for futuristic feedback
            btn.innerHTML = 'TRANSMITTING... <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = 'MESSAGE SECURED! <i class="fa-solid fa-check"></i>';
                btn.classList.add('success');
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.opacity = '1';
                    btn.disabled = false;
                    btn.classList.remove('success');
                }, 3000);
            }, 1500);
        });
    }

    // --- Scroll to Top Button ---
    const scrollTop = document.querySelector('.footer-scroll-top');
    scrollTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Navbar Active State on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileOverlay) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : 'auto';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }
});
