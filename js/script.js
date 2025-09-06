// RM Physiotherapy Website Scripts
const TEAMUP_KEY = "pt7vj7t3b2q1n991";

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeHeader();
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeTestimonialToggle();
    initializeServiceCards();
    initializeAccordions();
    initializeForms();
    initializeAppointmentForm();
    initializeCookieBanner();
    initializeNewsletterForm();
    initializeLazyLoading();
    initializeScrollAnimations();
});

// Header functionality
function initializeHeader() {
    const header = document.querySelector('.header');
    
    // Sticky header on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    // Return early if mobile menu elements don't exist
    if (!mobileMenuToggle || !navMenu) return;
    
    // Toggle mobile menu
    function toggleMenu() {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Update aria-expanded attribute
        const isExpanded = mobileMenuToggle.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
    }
    
    // Add click event to mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMenu);
    
    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                if (mobileMenuToggle.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });
    });
    
    // Handle dropdown menus on mobile
    const dropdowns = document.querySelectorAll('.dropdown > .nav-link');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = this.parentElement;
                parent.classList.toggle('active');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            navMenu.classList.contains('active') &&
            !e.target.closest('.nav-menu') && 
            !e.target.closest('.mobile-menu-toggle')) {
            toggleMenu();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset mobile menu state on desktop
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            body.classList.remove('menu-open');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            
            // Reset dropdowns
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

// Smooth scrolling functionality
function initializeSmoothScrolling() {
    // Handle smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just '#'
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                
                // Special handling for #top - go to very top
                if (href === '#top') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    return;
                }
                
                // Calculate offset for fixed header for other anchors
                const headerHeight = document.querySelector('.header').offsetHeight || 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Testimonials toggle functionality
function initializeTestimonialToggle() {
    const toggleButton = document.getElementById('testimonialsToggle');
    const toggleContainer = document.querySelector('.testimonials-toggle');
    const toggleText = toggleButton?.querySelector('.toggle-text');
    const toggleIcon = toggleButton?.querySelector('.toggle-icon');
    const hiddenTestimonials = document.querySelectorAll('.testimonial-hidden');
    
    if (!toggleButton || hiddenTestimonials.length === 0) return;
    
    let isExpanded = false;
    
    toggleButton.addEventListener('click', function() {
        if (isExpanded) {
            // Collapse testimonials
            hiddenTestimonials.forEach((testimonial, index) => {
                setTimeout(() => {
                    testimonial.style.animation = 'fadeOutDown 0.3s ease forwards';
                    setTimeout(() => {
                        testimonial.classList.add('testimonial-hidden');
                        testimonial.classList.remove('testimonial-visible');
                        testimonial.style.animation = '';
                    }, 300);
                }, index * 100);
            });
            
            // Update button text and icon
            setTimeout(() => {
                toggleText.textContent = 'View More';
                toggleContainer.classList.remove('expanded');
                isExpanded = false;
            }, 200);
            
        } else {
            // Expand testimonials
            hiddenTestimonials.forEach((testimonial, index) => {
                setTimeout(() => {
                    testimonial.classList.remove('testimonial-hidden');
                    testimonial.classList.add('testimonial-visible');
                }, index * 150);
            });
            
            // Update button text and icon
            toggleText.textContent = 'View Less';
            toggleContainer.classList.add('expanded');
            isExpanded = true;
        }
    });
}

// Service cards functionality
function initializeServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const header = card.querySelector('.service-header');
        const content = card.querySelector('.service-content');
        const arrow = card.querySelector('.expand-arrow');
        
        if (header && content && arrow) {
            header.addEventListener('click', function() {
                const isExpanded = card.classList.contains('expanded');
                
                // Toggle current card only
                card.classList.toggle('expanded');
                
                if (!isExpanded) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = '0px';
                }
            });
            
            // Keyboard accessibility
            header.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
            
            // Make header focusable
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');
            
            // Update aria-expanded when card is toggled
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'class') {
                        const isExpanded = card.classList.contains('expanded');
                        header.setAttribute('aria-expanded', isExpanded);
                    }
                });
            });
            observer.observe(card, { attributes: true });
        }
    });
}

// Accordion functionality
function initializeAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        const content = accordion.querySelector('.accordion-content');
        const icon = accordion.querySelector('.accordion-icon');
        
        if (header && content) {
            header.addEventListener('click', function() {
                const isActive = accordion.classList.contains('active');
                
                // Close all other accordions in the same container
                const container = accordion.parentElement;
                const otherAccordions = container.querySelectorAll('.accordion');
                otherAccordions.forEach(otherAccordion => {
                    if (otherAccordion !== accordion) {
                        otherAccordion.classList.remove('active');
                        const otherContent = otherAccordion.querySelector('.accordion-content');
                        if (otherContent) {
                            otherContent.style.maxHeight = '0px';
                        }
                    }
                });
                
                // Toggle current accordion
                accordion.classList.toggle('active');
                
                if (!isActive) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = '0px';
                }
            });
            
            // Keyboard accessibility
            header.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
            
            // Make header focusable
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');
            
            // Update aria-expanded when accordion is toggled
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'class') {
                        const isActive = accordion.classList.contains('active');
                        header.setAttribute('aria-expanded', isActive);
                    }
                });
            });
            observer.observe(accordion, { attributes: true });
        }
    });
}

// Form validation and handling
function initializeForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                handleFormSubmission(form);
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(input);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        }
    });
    
    // Phone validation
    const phoneFields = form.querySelectorAll('input[type="tel"]');
    phoneFields.forEach(field => {
        if (field.value && !isValidPhone(field.value)) {
            showFieldError(field, 'Please enter a valid phone number');
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    if (field.type === 'tel' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentElement.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

function handleFormSubmission(form) {
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual submission logic)
    setTimeout(() => {
        showFormSuccess(form);
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
}

function showFormSuccess(form) {
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.style.cssText = 'background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;';
    successMessage.textContent = 'Thank you! Your message has been sent. We\'ll get back to you soon.';
    successMessage.setAttribute('role', 'status');
    
    form.parentElement.insertBefore(successMessage, form);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Cookie banner functionality
function initializeCookieBanner() {
    const cookieBanner = document.querySelector('.cookie-banner');
    const acceptButton = document.querySelector('.cookie-accept');
    const declineButton = document.querySelector('.cookie-decline');
    
    if (!cookieBanner) return;
    
    // Check if user has already made a choice
    if (!localStorage.getItem('cookie-consent')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 2000);
    }
    
    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            localStorage.setItem('cookie-consent', 'accepted');
            cookieBanner.classList.remove('show');
            loadAnalytics();
        });
    }
    
    if (declineButton) {
        declineButton.addEventListener('click', function() {
            localStorage.setItem('cookie-consent', 'declined');
            cookieBanner.classList.remove('show');
        });
    }
}

function loadAnalytics() {
    // Load Google Analytics or other tracking scripts here
    // Only load if user has consented to cookies
    console.log('Analytics loaded after user consent');
}

// Newsletter form
function initializeNewsletterForm() {
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            if (isValidEmail(email)) {
                const button = form.querySelector('button');
                const originalText = button.textContent;
                button.textContent = 'Subscribing...';
                button.disabled = true;
                
                // Simulate subscription (replace with actual logic)
                setTimeout(() => {
                    button.textContent = 'Subscribed!';
                    form.querySelector('input').value = '';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.disabled = false;
                    }, 3000);
                }, 1000);
            }
        });
    });
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Scroll animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .scale-in');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => observer.observe(el));
    }
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Teamup calendar integration
function loadTeamupCalendar(containerId, view = 'a') {
    const container = document.getElementById(containerId);
    if (!container || !TEAMUP_KEY) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://teamup.com/ks/${TEAMUP_KEY}?view=${encodeURIComponent(view)}&showHeader=0&showProfileAndAuthentication=0`;
    iframe.style.cssText = 'width:100%;height:600px;border:0';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.setAttribute('title', 'RM Physiotherapy Appointment Slots');
    iframe.setAttribute('aria-label', 'Teamup agenda view showing available appointment slots');

    container.appendChild(iframe);
}

// Appointments page specific behavior (Condition → Other autofocus)
function initializeAppointmentForm() {
    const cond = document.getElementById('hvCondition');
    const desc = document.getElementById('hvDesc');
    if (cond && desc) {
        cond.addEventListener('change', () => {
            if (cond.value === 'other') {
                desc.focus();
                desc.setAttribute('aria-required', 'true');
            } else {
                desc.removeAttribute('aria-required');
            }
        });
    }

    // If a Teamup container exists, load agenda view
    const teamupContainer = document.getElementById('teamupAgenda');
    if (teamupContainer) {
        loadTeamupCalendar('teamupAgenda', 'a');
    }
    
    // FAQ Accordion functionality
    initAccordion();
    
    // Service card expand/collapse functionality
    initServiceCards();
    
    // Condition/Other field toggle
    initConditionToggle();
    
    // Cookie banner functionality
    initCookieBanner();
}

// Equal height cards
function equalizeCardHeights() {
    const cardContainers = document.querySelectorAll('.services-grid, .testimonials-grid, .info-grid');
    
    cardContainers.forEach(container => {
        const cards = container.children;
        let maxHeight = 0;
        
        // Reset heights
        Array.from(cards).forEach(card => {
            card.style.height = 'auto';
        });
        
        // Find max height
        Array.from(cards).forEach(card => {
            maxHeight = Math.max(maxHeight, card.offsetHeight);
        });
        
        // Apply max height
        Array.from(cards).forEach(card => {
            card.style.height = maxHeight + 'px';
        });
    });
}

// Run equalize heights on window resize
window.addEventListener('resize', debounce(equalizeCardHeights, 250));

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loading state management
function showLoading(element) {
    element.classList.add('loading');
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send error to monitoring service
});

// FAQ Accordion functionality
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordion = this.parentElement;
            const content = accordion.querySelector('.accordion-content');
            const icon = this.querySelector('.accordion-icon');
            
            // Close other accordions
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    const otherAccordion = otherHeader.parentElement;
                    const otherContent = otherAccordion.querySelector('.accordion-content');
                    const otherIcon = otherHeader.querySelector('.accordion-icon');
                    
                    otherAccordion.classList.remove('active');
                    otherContent.style.maxHeight = null;
                    if (otherIcon) otherIcon.textContent = '▼';
                }
            });
            
            // Toggle current accordion
            accordion.classList.toggle('active');
            
            if (accordion.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                if (icon) icon.textContent = '▲';
            } else {
                content.style.maxHeight = null;
                if (icon) icon.textContent = '▼';
            }
        });
    });
}

// Service card expand/collapse functionality
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const expandBtn = card.querySelector('.expand-btn');
        const collapsedContent = card.querySelector('.collapsed-content');
        const expandedContent = card.querySelector('.expanded-content');
        
        if (expandBtn && expandedContent) {
            expandBtn.addEventListener('click', function() {
                card.classList.toggle('expanded');
                
                if (card.classList.contains('expanded')) {
                    expandBtn.textContent = 'Show Less';
                    expandedContent.style.maxHeight = expandedContent.scrollHeight + 'px';
                } else {
                    expandBtn.textContent = 'Learn More';
                    expandedContent.style.maxHeight = '0';
                }
            });
        }
    });
}

// Condition/Other field toggle
function initConditionToggle() {
    const conditionSelect = document.getElementById('condition');
    const otherConditionDiv = document.getElementById('other-condition');
    const otherConditionText = document.getElementById('other-condition-text');
    
    if (conditionSelect && otherConditionDiv && otherConditionText) {
        conditionSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherConditionDiv.style.display = 'block';
                otherConditionText.focus();
                otherConditionText.required = true;
            } else {
                otherConditionDiv.style.display = 'none';
                otherConditionText.required = false;
            }
        });
    }
}

// Cookie banner functionality
function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');
    
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    
    if (!cookieChoice && cookieBanner) {
        cookieBanner.style.display = 'block';
    }
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            if (cookieBanner) cookieBanner.style.display = 'none';
            // Initialize analytics or other tracking
            initAnalytics();
        });
    }
    
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'declined');
            if (cookieBanner) cookieBanner.style.display = 'none';
        });
    }
}

// Analytics initialization (placeholder)
function initAnalytics() {
    // Initialize Google Analytics or other tracking services
    console.log('Analytics initialized (placeholder)');
}

// Page visibility API for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animations, videos, etc.
    } else {
        // Resume animations, videos, etc.
    }
});

// Back to top functionality
function initializeBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize back to top after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeBackToTop);

// Service worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for external use
window.RMPhysio = {
    loadTeamupCalendar,
    equalizeCardHeights,
    showLoading,
    hideLoading,
    validateForm
};