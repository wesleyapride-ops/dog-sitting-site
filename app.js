// ============================================
// GenusPupClub — Frontend App
// Reads from dashboard localStorage (gpc_*)
// Wires booking form to dashboard bookings
// ============================================

const GPC_KEY = 'gpc_';
const gpcLoad = (key, fallback) => {
    try { const d = JSON.parse(localStorage.getItem(GPC_KEY + key)); return d !== null ? d : fallback; } catch { return fallback; }
};
const gpcSave = (key, data) => {
    localStorage.setItem(GPC_KEY + key, JSON.stringify(data));
    if (typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected()) {
        GPC_SUPABASE.save(key, data).catch(() => {});
    }
};
const gpcUid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ---- Nav ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', window.scrollY > 20));
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => navLinks?.classList.toggle('open'));
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks?.classList.remove('open')));

// ---- Photo map for service categories ----
const SERVICE_PHOTOS = {
    'Walking': 'images/dogs-hiking.jpg',
    'Visits': 'images/dog-poodle.jpg',
    'Daycare': 'images/dogs-pair.jpg',
    'Sitting': 'images/dogs-cozy.jpg',
    'Specialty': 'images/dogs-car.jpg',
    'Transport': 'images/dogs-car.jpg',
    'Grooming': 'images/dog-poodle.jpg',
    'Training': 'images/dogs-hiking.jpg',
    'Other': 'images/dogs-pair.jpg',
};
const getServicePhoto = (svc) => SERVICE_PHOTOS[svc.category] || 'images/dogs-pair.jpg';

// ---- Load Services from Dashboard ----
const renderDynamicPricing = () => {
    const services = gpcLoad('services', []);
    const packages = gpcLoad('packages', []);
    const settings = gpcLoad('settings', {});
    const activeServices = services.filter(s => s.active);

    // Services Grid (the "What We Do" section)
    const servicesGrid = document.getElementById('servicesGrid');
    if (servicesGrid) {
        if (activeServices.length) {
            // Group by category, show one card per category (or show all if <8)
            const toShow = activeServices.length <= 8 ? activeServices : (() => {
                const byCat = {};
                activeServices.forEach(s => { if (!byCat[s.category]) byCat[s.category] = s; });
                return Object.values(byCat);
            })();

            servicesGrid.innerHTML = toShow.map(s => {
                const isFeatured = s.name.includes('Walking') && s.duration <= 30;
                return `<div class="service-card ${isFeatured ? 'featured' : ''}">
                    ${isFeatured ? '<div class="service-badge">Most Popular</div>' : ''}
                    <img src="${getServicePhoto(s)}" alt="${s.name}" class="service-img" loading="lazy">
                    <h3>${s.name}</h3>
                    <p>${s.description || 'Professional care for your pup.'}</p>
                    <div style="margin-top:auto;padding-top:12px;display:flex;justify-content:space-between;align-items:center">
                        <strong style="color:var(--primary);font-family:var(--font-display);font-size:1.2rem">$${Math.floor(s.price)}</strong>
                        <span style="font-size:.8rem;color:var(--text-muted)">${s.duration > 0 ? s.duration + ' min' : 'Per trip'}</span>
                    </div>
                </div>`;
            }).join('');
        } else {
            // Fallback hardcoded if no dashboard data
            servicesGrid.innerHTML = `
                <div class="service-card"><img src="images/dogs-cozy.jpg" class="service-img" loading="lazy"><h3>In-Home Sitting</h3><p>Your dog stays home with our sitter. Zero stress.</p></div>
                <div class="service-card featured"><div class="service-badge">Most Popular</div><img src="images/dogs-hiking.jpg" class="service-img" loading="lazy"><h3>Dog Walking</h3><p>30 or 60-min GPS-tracked walks.</p></div>
                <div class="service-card"><img src="images/dogs-pair.jpg" class="service-img" loading="lazy"><h3>Daycare</h3><p>Full day of supervised play and enrichment.</p></div>
                <div class="service-card"><img src="images/dog-poodle.jpg" class="service-img" loading="lazy"><h3>Drop-In Visits</h3><p>30-min check-ins for potty breaks and feeding.</p></div>
            `;
        }
    }

    // Pricing Grid
    const grid = document.getElementById('pricingGrid');
    if (grid) {
        if (activeServices.length) {
            // Show top 4-6 services as pricing cards
            const featured = activeServices.slice(0, 6);
            grid.innerHTML = featured.map((s, i) => {
                const isBestValue = s.name.includes('Walking') && s.duration === 30;
                return `<div class="price-card ${isBestValue ? 'popular' : ''}">
                    ${isBestValue ? '<div class="popular-badge">Best Value</div>' : ''}
                    <h3>${s.name}</h3>
                    <div class="price">$${Math.floor(s.price)}<span>/${s.duration >= 600 ? 'day' : s.duration >= 300 ? 'half-day' : s.duration > 0 ? 'visit' : 'trip'}</span></div>
                    <p class="price-desc">${s.description}</p>
                    <ul>
                        <li>Photo updates included</li>
                        <li>GPS tracking</li>
                        <li>${s.duration > 0 ? s.duration + ' minutes' : 'Per trip'}</li>
                        <li>Report card after visit</li>
                    </ul>
                    <a href="#book" class="btn ${isBestValue ? 'btn-primary' : 'btn-outline'}">Book Now</a>
                </div>`;
            }).join('');
        } else {
            // Fallback if no dashboard data yet
            grid.innerHTML = `
                <div class="price-card"><h3>Drop-In Visit</h3><div class="price">$20<span>/visit</span></div><p class="price-desc">30-minute check-in</p><a href="#book" class="btn btn-outline">Book Now</a></div>
                <div class="price-card popular"><div class="popular-badge">Best Value</div><h3>Dog Walking</h3><div class="price">$25<span>/walk</span></div><p class="price-desc">30-min GPS-tracked walk</p><a href="#book" class="btn btn-primary">Book Now</a></div>
                <div class="price-card"><h3>Daycare</h3><div class="price">$40<span>/day</span></div><p class="price-desc">Full day (up to 10 hrs)</p><a href="#book" class="btn btn-outline">Book Now</a></div>
                <div class="price-card"><h3>Overnight</h3><div class="price">$55<span>/night</span></div><p class="price-desc">In your home, 12+ hrs</p><a href="#book" class="btn btn-outline">Book Now</a></div>
            `;
        }
    }

    // Pricing note with dynamic discounts
    const note = document.getElementById('pricingNote');
    if (note) {
        const multiDiscount = settings.multiDogDiscount || 10;
        const recurringDiscount = settings.recurringDiscount || 15;
        note.innerHTML = `<p class="pricing-note">Multi-dog discount: 2nd dog +$${multiDiscount}/service. Weekly recurring clients save ${recurringDiscount}%.</p>`;
    }

    // Packages section
    const pkgSection = document.getElementById('packagesSection');
    if (pkgSection && packages.length) {
        pkgSection.innerHTML = `
            <div style="margin-top:32px">
                <h3 style="text-align:center;font-family:var(--font-display);margin-bottom:16px">Save with Packages</h3>
                <div class="pricing-grid">
                    ${packages.map(p => {
                        const baseSvc = activeServices.find(s => s.name === p.services?.[0] || p.services?.includes(s.name));
                        const baseTotal = (baseSvc?.price || 25) * p.visits;
                        const discounted = baseTotal * (1 - p.discount / 100);
                        return `<div class="price-card">
                            <h3>${p.name}</h3>
                            <div class="price">$${Math.floor(discounted)}<span> <s style="font-size:.7rem;color:var(--text-muted)">$${Math.floor(baseTotal)}</s></span></div>
                            <p class="price-desc">${p.description || p.visits + ' visits — save ' + p.discount + '%'}</p>
                            <div style="display:inline-block;padding:4px 12px;border-radius:50px;background:rgba(0,184,148,0.1);color:var(--accent);font-size:.82rem;font-weight:600;margin-bottom:12px">${p.discount}% OFF</div>
                            <br><a href="#book" class="btn btn-outline">Get Package</a>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Booking form service dropdown
    const select = document.getElementById('bookingServiceSelect');
    if (select) {
        const opts = activeServices.length ? activeServices : [
            { name: 'Dog Walking', price: 25 }, { name: 'Drop-In Visit', price: 20 },
            { name: 'Daycare', price: 40 }, { name: 'Overnight Sitting', price: 55 },
            { name: 'Puppy Care', price: 30 }, { name: 'Pet Taxi — One Way', price: 15 },
            { name: 'Pet Taxi — Round Trip', price: 25 }, { name: 'Daycare Shuttle', price: 20 }
        ];
        select.innerHTML = '<option value="" disabled selected>Select Service</option>' +
            opts.map(s => `<option value="${s.name}">${s.name} ($${Math.floor(s.price)})</option>`).join('') +
            (packages.length ? '<optgroup label="Packages">' + packages.map(p => `<option value="PKG:${p.name}">${p.name} (${p.visits} visits, ${p.discount}% off)</option>`).join('') + '</optgroup>' : '');
    }
};

// ---- Booking Form → Dashboard ----
const bookingForm = document.getElementById('bookingForm');
bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('bookingName')?.value?.trim() || '';
    const email = document.getElementById('bookingEmail')?.value?.trim() || '';
    const phone = document.getElementById('bookingPhone')?.value?.trim() || '';
    const petName = document.getElementById('bookingPetName')?.value?.trim() || '';
    const date = document.getElementById('bookingDate')?.value || new Date().toISOString().split('T')[0];
    const notes = document.getElementById('bookingNotes')?.value?.trim() || '';
    const selectedService = document.getElementById('bookingServiceSelect')?.value || '';
    const numDogs = parseInt(document.getElementById('bookingNumDogs')?.value) || 1;
    const transportType = document.getElementById('bookingTransport')?.value || 'none';
    const pickupAddr = document.getElementById('bookingPickupAddr')?.value?.trim() || '';
    const dropoffAddr = document.getElementById('bookingDropoffAddr')?.value?.trim() || '';

    const services = gpcLoad('services', []);
    const svc = services.find(s => s.name === selectedService);

    const bookings = gpcLoad('bookings', []);
    const newBooking = {
        id: gpcUid(),
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        petName,
        service: selectedService.replace('PKG:', ''),
        amount: svc?.price || 0,
        date,
        time: '10:00',
        dropoffTime: '',
        pickupTime: '',
        zone: '',
        sitter: '',
        addons: [],
        extraDogs: Math.max(0, numDogs - 1),
        numDogs,
        transportType,
        pickupAddr,
        dropoffAddr,
        notes,
        status: 'pending',
        source: 'website'
    };
    bookings.push(newBooking);
    gpcSave('bookings', bookings);

    // Also save as client if new
    const clients = gpcLoad('clients', []);
    const existingClient = clients.find(c => c.email === email || c.name === name);
    if (!existingClient && name) {
        clients.push({
            id: gpcUid(),
            name,
            email,
            phone,
            address: '',
            source: 'Website Booking',
            notes: ''
        });
        gpcSave('clients', clients);
    }

    // Fire notifications
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.onNewBooking(newBooking);
    }

    // Success feedback
    const btn = bookingForm.querySelector('button[type="submit"]');
    btn.textContent = 'Booking Submitted!';
    btn.style.background = '#00B894';
    btn.disabled = true;

    // Show confirmation
    const confirm = document.createElement('div');
    confirm.style.cssText = 'background:rgba(0,184,148,0.1);border:1px solid #00B894;border-radius:12px;padding:16px;margin-top:16px;text-align:center;color:#00B894;font-weight:600;';
    confirm.innerHTML = `Booking received! We'll contact you within 2 hours to schedule your free meet & greet. Check your email at <strong>${email || 'your inbox'}</strong>.`;
    bookingForm.after(confirm);

    setTimeout(() => {
        btn.textContent = 'Book Free Meet & Greet';
        btn.style.background = '';
        btn.disabled = false;
        bookingForm.reset();
        confirm.remove();
        renderDynamicPricing(); // re-render dropdown
    }, 5000);
});

// ---- Scroll Animations ----
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .price-card, .review-card, .step, .about-feature, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
});

// Stagger
document.querySelectorAll('.services-grid, .pricing-grid, .reviews-grid').forEach(grid => {
    grid.querySelectorAll('.service-card, .price-card, .review-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.1}s`;
    });
});

// ---- Footer Services ----
const renderFooterServices = () => {
    const footerEl = document.getElementById('footerServices');
    if (!footerEl) return;
    const services = gpcLoad('services', []).filter(s => s.active);
    if (services.length) {
        footerEl.innerHTML = '<h4>Services</h4>' + services.map(s => `<a href="#services">${s.name}</a>`).join('');
    } else {
        footerEl.innerHTML = '<h4>Services</h4><a href="#services">Dog Walking</a><a href="#services">Drop-In Visits</a><a href="#services">Daycare</a><a href="#services">Overnight Sitting</a>';
    }
};

// ---- CMS: Apply site content from dashboard editor ----
const applyCMS = () => {
    const cms = gpcLoad('site_content', null);
    if (!cms) return; // No CMS data yet, use HTML defaults

    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
    const setHTML = (id, val) => { const el = document.getElementById(id); if (el && val) el.innerHTML = val; };

    // Hero
    set('cmsBadge', cms.heroBadge);
    if (cms.heroTitle) {
        const h1 = document.getElementById('cmsHeroH1');
        if (h1) h1.innerHTML = `${cms.heroTitle}<br><span class="highlight" id="cmsHeroHL">${cms.heroTitleHighlight || ''}</span>`;
    }
    set('cmsHeroSub', cms.heroSubtitle);
    const heroImg = document.getElementById('cmsHeroImg');
    if (heroImg && cms.heroImage) heroImg.src = cms.heroImage;

    // Trust stats
    set('cmsStat1', cms.trustStat1); set('cmsLabel1', cms.trustLabel1);
    set('cmsStat2', cms.trustStat2); set('cmsLabel2', cms.trustLabel2);
    set('cmsStat3', cms.trustStat3); set('cmsLabel3', cms.trustLabel3);

    // Services
    set('cmsSvcTitle', cms.servicesTitle);
    set('cmsSvcSub', cms.servicesSubtitle);

    // About
    if (cms.aboutTitle) {
        const aboutH2 = document.getElementById('cmsAboutTitle');
        if (aboutH2) aboutH2.innerHTML = `${cms.aboutTitle}<br>We're <span class="highlight" id="cmsAboutHL">${cms.aboutHighlight || ''}</span>`;
    }

    // Colors
    if (cms.primaryColor) document.documentElement.style.setProperty('--primary', cms.primaryColor);
    if (cms.secondaryColor) document.documentElement.style.setProperty('--secondary', cms.secondaryColor);
    if (cms.accentColor) document.documentElement.style.setProperty('--accent', cms.accentColor);
    if (cms.bgColor) document.documentElement.style.setProperty('--bg', cms.bgColor);
};

// ---- Transport Address Toggle ----
const transportSelect = document.getElementById('bookingTransport');
const transportRow = document.getElementById('transportAddressRow');
transportSelect?.addEventListener('change', () => {
    const val = transportSelect.value;
    if (transportRow) {
        transportRow.style.display = (val === 'pickup' || val === 'dropoff' || val === 'roundtrip') ? 'grid' : 'none';
    }
});

// ---- Init ----
applyCMS();
renderDynamicPricing();
renderFooterServices();

// Re-render pricing cards after they're added to DOM (for scroll animation)
setTimeout(() => {
    document.querySelectorAll('.price-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(el);
    });
}, 100);
