// RM Physiotherapy site behaviour
document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileMenu();
    initTestimonials();
    initServiceCards();
    initAccordions();
    initForms();
    initCookieBanner();
    initBackToTop();
    openServiceFromHash();
});

const MOBILE_BREAKPOINT = 768;
const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });
}

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
        toggle.classList.toggle('active', open);
        menu.classList.toggle('active', open);
        document.body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () {
        setOpen(!menu.classList.contains('active'));
    });

    // On mobile the first tap on a dropdown parent opens its submenu
    document.querySelectorAll('.dropdown > .nav-link').forEach(function (link) {
        link.addEventListener('click', function (e) {
            if (!isMobile()) return;
            const parent = link.parentElement;
            if (!parent.classList.contains('active')) {
                e.preventDefault();
                parent.classList.add('active');
            }
        });
    });

    document.addEventListener('click', function (e) {
        if (isMobile() && menu.classList.contains('active') &&
            !e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
            setOpen(false);
        }
    });

    window.addEventListener('resize', function () {
        if (!isMobile()) {
            setOpen(false);
            document.querySelectorAll('.dropdown.active').forEach(function (d) { d.classList.remove('active'); });
        }
    });
}

function initTestimonials() {
    const button = document.getElementById('testimonialsToggle');
    if (!button) return;
    const container = button.closest('.testimonials-toggle');
    const hidden = document.querySelectorAll('.testimonial-hidden');
    const text = button.querySelector('.toggle-text');
    if (!hidden.length) {
        container.style.display = 'none';
        return;
    }

    button.addEventListener('click', function () {
        const expanded = container.classList.toggle('expanded');
        hidden.forEach(function (t) { t.classList.toggle('testimonial-hidden', !expanded); });
        text.textContent = expanded ? 'Show fewer reviews' : 'View more reviews';
        button.setAttribute('aria-expanded', String(expanded));
    });
}

function setCardOpen(card, open) {
    const content = card.querySelector('.service-content');
    const header = card.querySelector('.service-header');
    card.classList.toggle('expanded', open);
    header.setAttribute('aria-expanded', String(open));
    content.style.maxHeight = open ? content.scrollHeight + 'px' : '0px';
}

function initServiceCards() {
    document.querySelectorAll('.service-card').forEach(function (card) {
        const header = card.querySelector('.service-header');
        if (!header || !card.querySelector('.service-content')) return;
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'false');
        header.addEventListener('click', function () {
            setCardOpen(card, !card.classList.contains('expanded'));
        });
        header.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCardOpen(card, !card.classList.contains('expanded'));
            }
        });
    });
}

// Links like services.html#home-visits open that card
function openServiceFromHash() {
    function openHash() {
        if (!location.hash) return;
        const card = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (card && card.classList.contains('service-card')) {
            setCardOpen(card, true);
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    openHash();
    window.addEventListener('hashchange', openHash);
}

function initAccordions() {
    document.querySelectorAll('.accordion').forEach(function (accordion) {
        const header = accordion.querySelector('.accordion-header');
        if (!header) return;
        header.addEventListener('click', function () {
            const open = accordion.classList.toggle('active');
            header.setAttribute('aria-expanded', String(open));
        });
    });
}

// ---------- Forms ----------
function initForms() {
    document.querySelectorAll('form').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (validateForm(form)) handleFormSubmission(form);
        });
        form.querySelectorAll('input, textarea, select').forEach(function (field) {
            field.addEventListener('blur', function () { validateField(field); });
            field.addEventListener('input', function () { clearFieldError(field); });
            field.addEventListener('change', function () { clearFieldError(field); });
        });
    });
}

function validateForm(form) {
    let valid = true;
    let first = null;
    form.querySelectorAll('input, textarea, select').forEach(function (field) {
        if (!validateField(field)) {
            valid = false;
            first = first || field;
        }
    });
    if (first) first.focus();
    return valid;
}

function validateField(field) {
    const value = (field.value || '').trim();

    if (field.type === 'checkbox') {
        if (field.required && !field.checked) {
            showFieldError(field, 'Please tick this box to continue');
            return false;
        }
    } else if (field.required && !value) {
        showFieldError(field, 'This field is required');
        return false;
    } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    } else if (field.type === 'tel' && value && !/^\+?\d{9,15}$/.test(value.replace(/[\s\-()]/g, ''))) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }

    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    const holder = field.closest('.form-group') || field.parentElement;
    let error = holder.querySelector('.form-error');
    if (!error) {
        error = document.createElement('div');
        error.className = 'form-error';
        error.setAttribute('role', 'alert');
        holder.appendChild(error);
    }
    error.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    const holder = field.closest('.form-group') || field.parentElement;
    const error = holder.querySelector('.form-error');
    if (error) error.remove();
}

// There is no server, so booking requests go to the practice via WhatsApp
function handleFormSubmission(form) {
    const number = form.dataset.whatsapp;
    if (!number) return;

    const lines = ['Hello RM Physiotherapy, I would like to book a session.'];
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
        if (field.type === 'checkbox' || !field.name) return;
        const value = field.value.trim();
        if (value) lines.push(field.name + ': ' + value);
    });

    const url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
    showFormSuccess(form, url);
}

function showFormSuccess(form, url) {
    const previous = form.parentElement.querySelector('.form-success');
    if (previous) previous.remove();

    const message = document.createElement('div');
    message.className = 'form-success';
    message.setAttribute('role', 'status');
    message.innerHTML = 'WhatsApp should have opened with your details. Press <strong>send</strong> there and we\'ll confirm your booking. ' +
        'Nothing opened? <a href="' + url + '" target="_blank" rel="noopener">Open WhatsApp</a> or call <a href="tel:+27646533690">064 653 3690</a>.';
    form.parentElement.insertBefore(message, form);
    message.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---------- Cookie banner ----------
function readConsent() {
    try { return localStorage.getItem('cookie-consent'); } catch (e) { return null; }
}

function saveConsent(value) {
    try { localStorage.setItem('cookie-consent', value); } catch (e) { /* storage unavailable */ }
}

function initCookieBanner() {
    const banner = document.querySelector('.cookie-banner');
    if (!banner || readConsent()) return;
    setTimeout(function () { banner.classList.add('show'); }, 1500);
    banner.querySelectorAll('.cookie-accept, .cookie-decline').forEach(function (button) {
        button.addEventListener('click', function () {
            saveConsent(button.classList.contains('cookie-accept') ? 'accepted' : 'declined');
            banner.classList.remove('show');
        });
    });
}

function initBackToTop() {
    const button = document.querySelector('.back-to-top');
    if (!button) return;
    window.addEventListener('scroll', function () {
        button.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
