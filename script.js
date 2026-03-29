// ========================================
// View Toggle (Site / Dashboard)
// ========================================
const viewToggle = document.getElementById('viewToggle');
const toggleBtns = viewToggle.querySelectorAll('.toggle-btn');

const setView = (view) => {
    toggleBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));

    if (view === 'dashboard') {
        // Check if logged in
        if (typeof AUTH !== 'undefined' && !AUTH.restore()) {
            // Not logged in — show login screen
            if (typeof showLogin === 'function') showLogin();
            return;
        }
        document.body.classList.add('dashboard-active');
        localStorage.setItem('pawsView', 'dashboard');
        window.scrollTo(0, 0);
        if (typeof initDashboard === 'function') initDashboard();
    } else {
        document.body.classList.remove('dashboard-active');
        localStorage.setItem('pawsView', 'site');
    }
};

// Restore saved view on load — but only if already authenticated
const savedView = localStorage.getItem('pawsView') || 'site';
if (savedView === 'dashboard' && typeof AUTH !== 'undefined' && AUTH.restore()) {
    setView('dashboard');
} else {
    setView('site');
}

toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
});

// ========================================
// Navigation
// ========================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ========================================
// Scroll Animations
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .testimonial-card, .pricing-card, .gallery-item, .about-content, .contact-layout').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ========================================
// Contact Form → Creates Pending Booking
// ========================================
const contactForm = document.getElementById('contactForm');
const successModal = document.getElementById('successModal');
const modalClose = document.getElementById('modalClose');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    if (!data.ownerName || !data.email || !data.dogName || !data.service) {
        highlightEmptyFields();
        return;
    }

    if (typeof window.createBookingFromForm === 'function') {
        window.createBookingFromForm(data);
    }

    successModal.classList.add('active');
    contactForm.reset();
});

modalClose.addEventListener('click', () => {
    successModal.classList.remove('active');
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

const highlightEmptyFields = () => {
    contactForm.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--color-accent)';
            field.addEventListener('input', function handler() {
                field.style.borderColor = '';
                field.removeEventListener('input', handler);
            });
        }
    });
};

// ========================================
// Set min date on date inputs
// ========================================
const today = new Date().toISOString().split('T')[0];
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');

if (startDate) startDate.min = today;
if (endDate) endDate.min = today;

startDate?.addEventListener('change', () => {
    if (endDate) endDate.min = startDate.value;
});

// ========================================
// Smooth scroll for anchor links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
