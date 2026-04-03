// ========================================
// View Toggle (Site / Dashboard)
// ========================================
const viewToggle = document.getElementById('viewToggle');
const toggleBtns = viewToggle.querySelectorAll('.toggle-btn');

const setView = (view) => {
    toggleBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));

    if (view === 'dashboard') {
        if (typeof AUTH !== 'undefined' && !AUTH.restore()) {
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
        // Re-render dynamic sections when switching back to site
        renderPublicSite();
    }
};

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

function observeElements() {
    document.querySelectorAll('.service-card, .testimonial-card, .pricing-card, .gallery-item, .about-content, .contact-layout, .faq-item, .message-form').forEach(el => {
        if (!el.classList.contains('visible')) {
            el.classList.add('fade-in');
            observer.observe(el);
        }
    });
};

// ========================================
// Render Public Site (Dynamic Sections)
// ========================================
function renderPublicSite() {
    renderPublicServices();
    renderPublicPricing();
    renderPublicTestimonials();
    renderPublicFaq();
    renderPublicGallery();
    renderContactServiceDropdown();
    renderContactBreedDropdown();
    renderContactAddons();
    observeElements();
}

// Default testimonials fallback
const DEFAULT_TESTIMONIALS = [
    {
        rating: 5,
        text: "We were so nervous leaving our anxious rescue for the first time. Within an hour we got a photo of him snoozing on the couch. He came home wagging his tail. We've been coming back every month since!",
        name: 'Sarah M.',
        detail: "Benny's mom — Repeat client"
    },
    {
        rating: 5,
        text: "The daily photo updates are amazing. It's clear our dog is having the time of his life. The attention to detail with his medication schedule gave us total peace of mind on vacation.",
        name: 'James & Lily K.',
        detail: "Max's parents — 2 years running"
    },
    {
        rating: 5,
        text: "I've tried three other sitters and none compare. My dog actually gets excited when we pull into the driveway. That says it all. Wouldn't trust anyone else with our girl.",
        name: 'Rachel T.',
        detail: "Daisy's mom — Weekly daycare"
    }
];

// ========================================
// Dynamic Services Section
// ========================================
function renderPublicServices() {
    const grid = document.getElementById('publicServicesGrid');
    if (!grid) return;

    const services = typeof Store !== 'undefined' ? Store.getEnabledServices() : [];

    if (services.length === 0) {
        grid.innerHTML = '<p class="empty-state">Services coming soon!</p>';
        return;
    }

    grid.innerHTML = services.map(s => `
        <div class="service-card">
            <div class="service-icon">${s.icon || '🐾'}</div>
            <h3>${escapeHtml(s.name)}</h3>
            <p>${escapeHtml(s.description || '')}</p>
            <ul class="service-includes">
                ${(s.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}
            </ul>
        </div>
    `).join('');
};

// ========================================
// Dynamic Pricing Section
// ========================================
function renderPublicPricing() {
    const grid = document.getElementById('publicPricingGrid');
    if (!grid) return;

    const services = typeof Store !== 'undefined' ? Store.getEnabledServices() : [];

    if (services.length === 0) {
        grid.innerHTML = '<p class="empty-state">Pricing coming soon!</p>';
        return;
    }

    // Mark the 2nd service as featured (most popular) if there are 2+ services
    grid.innerHTML = services.map((s, i) => {
        const isFeatured = services.length >= 2 && i === 1;
        return `
            <div class="pricing-card ${isFeatured ? 'featured' : ''}">
                ${isFeatured ? '<div class="popular-badge">Most Popular</div>' : ''}
                <h3>${escapeHtml(s.name)}</h3>
                <div class="price">$${s.price}<span>/${s.unit}</span></div>
                <ul class="pricing-features">
                    ${(s.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                </ul>
                <a href="#contact" class="btn btn-primary">Book Now</a>
            </div>
        `;
    }).join('');

    // Add-ons pricing section
    const addonsContainer = document.getElementById('publicAddonsPricing');
    if (addonsContainer) {
        const addons = typeof Store !== 'undefined' ? Store.getEnabledAddons() : [];
        if (addons.length > 0) {
            addonsContainer.innerHTML = `
                <div class="addons-section">
                    <h3>Grooming & Bathing Add-Ons</h3>
                    <div class="addons-grid">
                        ${addons.map(a => `
                            <div class="addon-card">
                                <span class="addon-icon">${a.icon}</span>
                                <strong>${escapeHtml(a.name)}</strong>
                                <span class="addon-price">+$${a.price}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            addonsContainer.innerHTML = '';
        }
    }
};

// ========================================
// Dynamic Testimonials Section
// ========================================
function renderPublicTestimonials() {
    const grid = document.getElementById('publicTestimonialsGrid');
    if (!grid) return;

    let reviews = [];
    if (typeof Store !== 'undefined') {
        reviews = Store.getFeaturedReviews();
    }

    // Fall back to defaults if no featured reviews
    if (reviews.length === 0) {
        grid.innerHTML = DEFAULT_TESTIMONIALS.map(t => `
            <div class="testimonial-card">
                <div class="stars">${'★'.repeat(t.rating)}</div>
                <p class="testimonial-text">"${escapeHtml(t.text)}"</p>
                <div class="testimonial-author">
                    <div class="author-avatar">${t.name.charAt(0)}</div>
                    <div>
                        <strong>${escapeHtml(t.name)}</strong>
                        <span>${escapeHtml(t.detail)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        return;
    }

    grid.innerHTML = reviews.map(r => {
        const client = Store.getById('clients', r.clientId);
        const pet = Store.getById('dogs', r.petId);
        const name = client?.name || 'Happy Client';
        const petInfo = pet ? `${pet.name}'s parent` : 'Valued client';
        return `
            <div class="testimonial-card">
                <div class="stars">${'★'.repeat(r.rating || 5)}</div>
                <p class="testimonial-text">"${escapeHtml(r.text)}"</p>
                <div class="testimonial-author">
                    <div class="author-avatar">${name.charAt(0)}</div>
                    <div>
                        <strong>${escapeHtml(name)}</strong>
                        <span>${escapeHtml(petInfo)}</span>
                    </div>
                </div>
                ${r.response ? `<div class="review-owner-response"><strong>Owner:</strong> ${escapeHtml(r.response)}</div>` : ''}
            </div>
        `;
    }).join('');
};

// ========================================
// Dynamic FAQ Section
// ========================================
function renderPublicFaq() {
    const list = document.getElementById('publicFaqList');
    if (!list) return;

    const faq = typeof Store !== 'undefined' ? (Store.data.settings.faq || []) : [];

    if (faq.length === 0) return;

    list.innerHTML = faq.map((item, i) => `
        <div class="faq-item">
            <button class="faq-question" aria-expanded="false" data-index="${i}">
                <span>${escapeHtml(item.q)}</span>
                <span class="faq-icon">+</span>
            </button>
            <div class="faq-answer">
                <p>${escapeHtml(item.a)}</p>
            </div>
        </div>
    `).join('');

    // Accordion behavior
    list.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isOpen = item.classList.contains('open');

            // Close all others
            list.querySelectorAll('.faq-item.open').forEach(el => {
                el.classList.remove('open');
                el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current
            if (!isOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
};

// ========================================
// Dynamic Gallery (pet photos + placeholders)
// ========================================
function renderPublicGallery() {
    const grid = document.getElementById('publicGalleryGrid');
    if (!grid) return;

    // Collect public pet photos
    let photos = [];
    if (typeof Store !== 'undefined') {
        const dogs = Store.getAll('dogs');
        dogs.forEach(d => {
            if (d.photos && d.photos.length > 0) {
                const publicIndices = d.publicPhotos || [];
                d.photos.forEach((p, i) => {
                    if (publicIndices.includes(i) || publicIndices.length === 0) {
                        photos.push({ src: p, name: d.name, petType: d.petType });
                    }
                });
            }
        });
    }

    // Show photos if we have them, otherwise show placeholders
    const placeholders = [
        { emoji: '🐕', label: 'Photo 1' },
        { emoji: '🐶', label: 'Photo 2' },
        { emoji: '🐾', label: 'Photo 3' },
        { emoji: '🐱', label: 'Photo 4' },
        { emoji: '🐕‍🦺', label: 'Photo 5' },
        { emoji: '🐩', label: 'Photo 6' }
    ];

    if (photos.length > 0) {
        // Show real photos (up to 6)
        const displayPhotos = photos.slice(0, 6);
        const remaining = 6 - displayPhotos.length;

        grid.innerHTML = displayPhotos.map(p => `
            <div class="gallery-item">
                <img src="${p.src}" alt="${escapeHtml(p.name)}" class="gallery-photo">
                <div class="gallery-overlay">${escapeHtml(p.name)}</div>
            </div>
        `).join('');

        // Fill remaining with placeholders
        for (let i = 0; i < remaining; i++) {
            const ph = placeholders[displayPhotos.length + i];
            grid.innerHTML += `
                <div class="gallery-item">
                    <div class="gallery-placeholder">
                        <span>${ph.emoji}</span>
                        <p>${ph.label}</p>
                    </div>
                </div>
            `;
        }
    } else {
        grid.innerHTML = placeholders.map(ph => `
            <div class="gallery-item">
                <div class="gallery-placeholder">
                    <span>${ph.emoji}</span>
                    <p>${ph.label}</p>
                </div>
            </div>
        `).join('');
    }
};

// ========================================
// Contact Form — Dynamic Dropdowns
// ========================================
function renderContactServiceDropdown() {
    const sel = document.getElementById('contactService');
    if (!sel) return;

    const services = typeof Store !== 'undefined' ? Store.getEnabledServices() : [];
    sel.innerHTML = '<option value="" disabled selected>Select a service</option>';
    services.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.icon} ${s.name}`;
        sel.appendChild(opt);
    });
};

function renderContactBreedDropdown() {
    const petTypeSelect = document.getElementById('contactPetType');
    const breedSelect = document.getElementById('contactBreed');
    if (!breedSelect) return;

    const populateBreeds = (type) => {
        const breeds = type === 'cat'
            ? (typeof CAT_BREEDS !== 'undefined' ? CAT_BREEDS : ['Domestic Shorthair', 'Siamese', 'Persian', 'Maine Coon', 'Other'])
            : (typeof DOG_BREEDS !== 'undefined' ? DOG_BREEDS : ['Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Other']);

        breedSelect.innerHTML = '<option value="" disabled selected>Select breed</option>';
        breeds.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            breedSelect.appendChild(opt);
        });
    };

    populateBreeds(petTypeSelect?.value || 'dog');

    petTypeSelect?.addEventListener('change', () => {
        populateBreeds(petTypeSelect.value);
    });
};

// ========================================
// Contact Form — Add-Ons & Live Cost Estimate
// ========================================
function renderContactAddons() {
    const container = document.getElementById('contactAddons');
    if (!container || typeof Store === 'undefined') return;
    const addons = Store.getEnabledAddons();
    if (addons.length === 0) {
        container.closest('.form-group').style.display = 'none';
        return;
    }
    container.innerHTML = addons.map(a => `
        <label class="contact-addon-label">
            <input type="checkbox" name="contactAddon" value="${a.id}" class="contact-addon-cb">
            <span class="contact-addon-info">
                <span class="contact-addon-icon">${a.icon}</span>
                <span>${escapeHtml(a.name)}</span>
            </span>
            <span class="contact-addon-price">+$${a.price}</span>
        </label>
    `).join('');

    container.querySelectorAll('.contact-addon-cb').forEach(cb => {
        cb.addEventListener('change', updateCostEstimate);
    });
}

function updateCostEstimate() {
    const estimateEl = document.getElementById('costEstimate');
    const breakdownEl = document.getElementById('costBreakdown');
    const totalEl = document.getElementById('costTotalAmount');
    if (!estimateEl || !breakdownEl || !totalEl) return;
    if (typeof Store === 'undefined' || typeof calcAmount === 'undefined') return;

    const serviceId = document.getElementById('contactService')?.value;
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;

    if (!serviceId) {
        estimateEl.style.display = 'none';
        return;
    }

    const svc = Store.getServiceById(serviceId);
    if (!svc) {
        estimateEl.style.display = 'none';
        return;
    }

    estimateEl.style.display = 'block';

    // Gather all form inputs for the smart estimator
    const petSize = document.getElementById('contactPetSize')?.value || 'medium';
    const petBreed = document.getElementById('contactBreed')?.value || '';
    const numPets = parseInt(document.getElementById('numPets')?.value) || 1;
    const discountCode = document.getElementById('discountCode')?.value?.trim() || '';
    const selectedAddons = Array.from(document.querySelectorAll('#contactAddons .contact-addon-cb:checked')).map(cb => cb.value);

    // Use the full calcAmount engine
    const result = calcAmount(serviceId, startDate || '', endDate || '', selectedAddons, {
        petSize,
        petBreed,
        isPuppy: false,
        numPets,
        discountCode
    });

    breakdownEl.innerHTML = result.breakdown.map(l => `
        <div class="cost-line ${l.isDiscount ? 'discount' : ''}">
            <span>${l.label}</span>
            <span>${l.isDiscount ? '-' : ''}$${Math.abs(l.amount).toFixed(2)}</span>
        </div>
    `).join('');

    totalEl.textContent = `$${result.total.toFixed(2)}`;
}

// ========================================
// Contact Form -> Creates Pending Booking
// ========================================
const contactForm = document.getElementById('contactForm');
const successModal = document.getElementById('successModal');
const modalClose = document.getElementById('modalClose');

// Wire up live cost estimate updates
document.getElementById('contactService')?.addEventListener('change', updateCostEstimate);
document.getElementById('startDate')?.addEventListener('change', updateCostEstimate);
document.getElementById('endDate')?.addEventListener('change', updateCostEstimate);
document.getElementById('contactPetSize')?.addEventListener('change', updateCostEstimate);
document.getElementById('contactBreed')?.addEventListener('change', updateCostEstimate);
document.getElementById('numPets')?.addEventListener('change', updateCostEstimate);
document.getElementById('discountCode')?.addEventListener('input', () => {
    clearTimeout(window._discountDebounce);
    window._discountDebounce = setTimeout(updateCostEstimate, 500);
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    if (!data.ownerName || !data.email || !data.petName || !data.service) {
        highlightEmptyFields(contactForm);
        return;
    }

    // Map service select value to serviceId
    data.serviceId = data.service;

    // Include selected add-ons
    data.addons = Array.from(document.querySelectorAll('#contactAddons .contact-addon-cb:checked')).map(cb => cb.value);
    data.numPets = document.getElementById('numPets')?.value || '1';
    data.referralCode = document.getElementById('referralCode')?.value?.trim() || '';
    data.discountCode = document.getElementById('discountCode')?.value?.trim() || '';

    if (typeof window.createBookingFromForm === 'function') {
        window.createBookingFromForm(data);
    }

    successModal.classList.add('active');
    contactForm.reset();
    document.getElementById('costEstimate').style.display = 'none';
});

modalClose.addEventListener('click', () => {
    successModal.classList.remove('active');
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

// ========================================
// Message Form
// ========================================
const publicMessageForm = document.getElementById('publicMessageForm');
const messageSuccessModal = document.getElementById('messageSuccessModal');

if (publicMessageForm) {
    publicMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(publicMessageForm);
        const data = Object.fromEntries(formData);

        if (!data.name || !data.email || !data.message) {
            highlightEmptyFields(publicMessageForm);
            return;
        }

        if (typeof window.createMessageFromForm === 'function') {
            window.createMessageFromForm(data);
        }

        messageSuccessModal.classList.add('active');
        publicMessageForm.reset();
    });
}

document.getElementById('messageModalClose')?.addEventListener('click', () => {
    messageSuccessModal.classList.remove('active');
});

messageSuccessModal?.addEventListener('click', (e) => {
    if (e.target === messageSuccessModal) {
        messageSuccessModal.classList.remove('active');
    }
});

// ========================================
// Form Helpers
// ========================================
const highlightEmptyFields = (form) => {
    form.querySelectorAll('[required]').forEach(field => {
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

// ========================================
// Init public site rendering
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const savedView = localStorage.getItem('pawsView') || 'site';
    if (savedView === 'dashboard' && typeof AUTH !== 'undefined' && AUTH.restore()) {
        setView('dashboard');
    } else {
        setView('site');
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => setView(btn.dataset.view));
    });
});
