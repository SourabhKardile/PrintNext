// DOM Elements - Optimize selectors with variables to avoid repetitive DOM queries
// Wait for DOM to be fully ready before accessing elements
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollHandlers();
    setupContactForm();
    initCopyrightYear();
    
    // Initialize AOS if available (with performance optimization)
    if (typeof AOS !== 'undefined') {
        requestIdleCallback(() => {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true
            });
        });
    }
});

// Navigation initialization with event delegation for better performance
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('header');
    
    if (!hamburger || !navLinks || !header) return;
    
    // Toggle mobile menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open'); // Prevent background scrolling when menu is open
    });
    
    // Use event delegation for nav links instead of attaching event to each link
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Close menu when clicking outside of it - with passive event for performance
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    }, { passive: true });
}

// Scroll event handlers with debounce for performance
function initScrollHandlers() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    let ticking = false;
    
    // Throttle scroll events for better performance
    function throttleScroll() {
        lastScrollTop = window.pageYOffset;
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll(lastScrollTop);
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Handler for all scroll-based functionality
    function handleScroll(scrollPos) {
        // Header styling using CSS classes instead of inline styles
        if (header) {
            if (scrollPos > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Active nav highlighting
        updateActiveNavLinks(scrollPos);
    }
    
    // Update active navigation links based on scroll position
    function updateActiveNavLinks(scrollPos) {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        if (!sections.length || !navLinks.length) return;
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Add smooth scrolling through event delegation
    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('#')) {
            const targetId = e.target.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetPosition - headerOffset,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // Optimized scroll event
    window.addEventListener('scroll', throttleScroll, { passive: true });
}

// Work Slider Functions
// Optimized Contact Form Handler with improved validation and UX
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (!contactForm || !formStatus) return;
    
    // Form submission with throttling to prevent multiple submissions
    let isSubmitting = false;
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        isSubmitting = true;
        
        // Reset status
        formStatus.className = 'form-status';
        formStatus.textContent = 'Sending message...';
        
        // Validate form before submission
        if (!validateForm(contactForm)) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Please fill out all required fields correctly.';
            isSubmitting = false;
            return;
        }
        
        // Collect form data
        const formData = new FormData(contactForm);
        
        try {
            // Formspree API setup - using formspree's endpoint
            const response = await fetch('https://formspree.io/f/mzzagdzb', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const json = await response.json();
            
            if (response.ok) {
                // Success
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Thank you for your message! We will contact you soon.';
                contactForm.reset();
                
                // Track form submission success (for analytics)
                if (window.gtag) {
                    gtag('event', 'form_submission', {
                        'event_category': 'Contact',
                        'event_label': 'Contact Form Submission'
                    });
                }
            } else {
                // Error
                throw new Error(json.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.textContent = error.message;
            console.error('Form submission error:', error);
        } finally {
            isSubmitting = false;
        }
    });
    
    // Event delegation for form validation
    contactForm.addEventListener('blur', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            validateField(e.target);
        }
    }, true);
    
    // Real-time validation for email field
    const emailField = contactForm.querySelector('#email');
    if (emailField) {
        emailField.addEventListener('input', debounce(function() {
            validateField(this);
        }, 300));
    }
}

// Form validation helper functions
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    let isValid = true;
    
    // Clear previous validation state
    field.classList.remove('invalid', 'valid');
    
    // Check empty required fields
    if (field.hasAttribute('required') && !field.value.trim()) {
        field.classList.add('invalid');
        isValid = false;
    }
    // Email validation
    else if (field.type === 'email' && field.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(field.value)) {
            field.classList.add('invalid');
            isValid = false;
        } else {
            field.classList.add('valid');
        }
    }
    // Phone validation if needed
    else if (field.id === 'phone' && field.value.trim()) {
        const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phonePattern.test(field.value)) {
            field.classList.add('invalid');
            isValid = false;
        } else {
            field.classList.add('valid');
        }
    }
    // All other valid fields
    else if (field.value.trim()) {
        field.classList.add('valid');
    }
    
    return isValid;
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Update copyright year automatically
function initCopyrightYear() {
    const copyrightYearElement = document.getElementById('copyright-year');
    if (copyrightYearElement) {
        copyrightYearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize statistics counters - but only when the browser is idle
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => initStatCounters());
    } else {
        setTimeout(initStatCounters, 200);
    }
}

// Optimized Statistics counter animation with IntersectionObserver
function initStatCounters() {
    const statSection = document.getElementById('statistics');
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (!statSection || statNumbers.length === 0) return;
    
    // More efficient counter animation using requestAnimationFrame
    const animateCounters = () => {
        statNumbers.forEach(counter => {
            const targetValue = parseInt(counter.getAttribute('data-count') || '0');
            const suffix = counter.textContent.includes('+') ? '+' : '';
            let startTime = null;
            const duration = 2000; // 2 seconds
            let currentCount = 0;
            
            function updateCounter(timestamp) {
                if (!startTime) startTime = timestamp;
                
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const nextCount = Math.floor(progress * targetValue);
                
                if (nextCount !== currentCount) {
                    currentCount = nextCount;
                    counter.textContent = currentCount + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = targetValue + suffix;
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
    };
    
    // Use Intersection Observer to trigger counter animation when stats section is visible
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, { threshold: 0.2, rootMargin: '50px' });
        
        observer.observe(statSection);
    } else {
        // Fallback for browsers without IntersectionObserver
        window.addEventListener('scroll', function checkIfInView() {
            const rect = statSection.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                animateCounters();
                window.removeEventListener('scroll', checkIfInView);
            }
        });
    }
}
