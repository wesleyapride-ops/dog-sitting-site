// ============================================
// GenusPupClub Dashboard — Full Platform
// Ultra-customizable services, pricing, packages
// ============================================

const DB_KEY = 'gpc_';
const load = (key, fallback) => { try { const d = JSON.parse(localStorage.getItem(DB_KEY + key)); return d !== null ? d : fallback; } catch { return fallback; } };
const save = (key, data) => localStorage.setItem(DB_KEY + key, JSON.stringify(data));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = (n) => '$' + Number(n || 0).toFixed(2);
const todayStr = () => new Date().toISOString().split('T')[0];
const escHTML = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ---- Default Data ----
const DEFAULT_SERVICES = [
    { id: 'walk30', name: 'Dog Walking (30 min)', price: 25, duration: 30, category: 'Walking', description: 'Solo GPS-tracked walk with post-walk report', active: true },
    { id: 'walk60', name: 'Dog Walking (60 min)', price: 40, duration: 60, category: 'Walking', description: 'Extended walk for high-energy pups', active: true },
    { id: 'dropin', name: 'Drop-In Visit', price: 20, duration: 30, category: 'Visits', description: 'Check-in: feeding, potty break, playtime', active: true },
    { id: 'dropin60', name: 'Extended Drop-In', price: 30, duration: 60, category: 'Visits', description: 'Longer visit with walks and play', active: true },
    { id: 'daycare', name: 'Doggy Daycare', price: 40, duration: 600, category: 'Daycare', description: 'Full day supervised play (up to 10 hrs)', active: true },
    { id: 'halfdaycare', name: 'Half-Day Daycare', price: 25, duration: 300, category: 'Daycare', description: 'Half day (up to 5 hrs)', active: true },
    { id: 'overnight', name: 'Overnight Sitting', price: 55, duration: 720, category: 'Sitting', description: 'In-home overnight (12+ hrs, evening & morning walk)', active: true },
    { id: 'weekend', name: 'Weekend Package', price: 100, duration: 0, category: 'Sitting', description: 'Friday evening through Sunday evening', active: true },
    { id: 'puppy', name: 'Puppy Care', price: 30, duration: 60, category: 'Specialty', description: 'Under 1 year: extra potty breaks, training reinforcement', active: true },
    { id: 'senior', name: 'Senior Dog Care', price: 25, duration: 30, category: 'Specialty', description: 'Gentle care for older dogs, medication admin', active: true },
    { id: 'taxi', name: 'Pet Taxi', price: 15, duration: 0, category: 'Transport', description: 'One-way vet/groomer transport (per trip)', active: true },
    { id: 'taxiwait', name: 'Pet Taxi + Wait', price: 35, duration: 0, category: 'Transport', description: 'Transport + wait at appointment + return', active: true },
    { id: 'bath', name: 'Bath & Brush', price: 35, duration: 45, category: 'Grooming', description: 'Full bath, shampoo, blow dry, brush out', active: true },
    { id: 'fullgroom', name: 'Full Grooming', price: 60, duration: 90, category: 'Grooming', description: 'Bath, brush, nail trim, ear clean, sanitary trim', active: true },
    { id: 'nailonly', name: 'Nail Trim', price: 15, duration: 15, category: 'Grooming', description: 'Quick nail clip or Dremel grind', active: true },
    { id: 'teethclean', name: 'Teeth Brushing', price: 10, duration: 10, category: 'Grooming', description: 'Dental hygiene brushing with dog-safe paste', active: true },
    { id: 'deshed', name: 'De-Shedding Treatment', price: 45, duration: 60, category: 'Grooming', description: 'Deep de-shedding shampoo, blow out, undercoat removal', active: true },
    { id: 'pawcare', name: 'Paw & Pad Care', price: 15, duration: 15, category: 'Grooming', description: 'Paw pad moisturizing, nail trim, fur trim between pads', active: true },
];

const DEFAULT_ADDONS = [
    { id: 'extra_dog', name: 'Additional Dog', price: 10, description: 'Per extra dog on same visit' },
    { id: 'meds', name: 'Medication Admin', price: 5, description: 'Pill, liquid, or injection' },
    { id: 'bath', name: 'Basic Bath', price: 20, description: 'Shampoo, rinse, towel dry' },
    { id: 'nailclip', name: 'Nail Trim', price: 10, description: 'Quick trim, no grinding' },
    { id: 'photos', name: 'Photo Package', price: 0, description: '5+ photos per visit (included free)' },
    { id: 'gps', name: 'GPS Tracking', price: 0, description: 'Real-time walk tracking (included free)' },
    { id: 'report', name: 'Report Card', price: 0, description: 'Post-visit summary (included free)' },
    { id: 'training', name: 'Training Reinforcement', price: 10, description: 'Basic commands practice during visit' },
    { id: 'grooming', name: 'Brush Out', price: 10, description: 'Thorough brushing session' },
    { id: 'holiday', name: 'Holiday Surcharge', price: 15, description: 'Major holidays premium' },
    { id: 'flea', name: 'Flea Treatment', price: 15, description: 'Topical flea/tick treatment' },
    { id: 'cologne', name: 'Dog Cologne/Spritz', price: 5, description: 'Fresh scent after bath' },
    { id: 'bandana', name: 'Bandana', price: 5, description: 'Fresh bandana after grooming' },
    { id: 'toothbrush', name: 'Teeth Brushing Add-on', price: 8, description: 'Add to any grooming service' },
    { id: 'earclean', name: 'Ear Cleaning', price: 8, description: 'Gentle ear cleaning with solution' },
    { id: 'pawbalm', name: 'Paw Balm', price: 5, description: 'Moisturizing paw pad treatment' },
];

const DEFAULT_PACKAGES = [
    { id: 'pkg_weekly5', name: 'Weekly Walker', services: ['walk30'], visits: 5, discount: 15, price: 0, description: '5 walks/week — save 15%' },
    { id: 'pkg_weekly3', name: 'Midweek Pack', services: ['walk30'], visits: 3, discount: 10, price: 0, description: '3 walks/week — save 10%' },
    { id: 'pkg_daycare10', name: 'Daycare 10-Pack', services: ['daycare'], visits: 10, discount: 20, price: 0, description: '10 daycare days — save 20%' },
    { id: 'pkg_vacation', name: 'Vacation Package', services: ['overnight'], visits: 7, discount: 15, price: 0, description: '7-night sitting — save 15%' },
    { id: 'pkg_puppy', name: 'New Puppy Starter', services: ['puppy', 'dropin'], visits: 10, discount: 10, price: 0, description: '10 puppy visits — save 10%' },
];

const DEFAULT_ZONES = [
    { id: 'z1', name: 'Zone 1 — Downtown RVA', areas: 'Fan District, Carytown, Church Hill, Scott\'s Addition, Museum District', surcharge: 0 },
    { id: 'z2', name: 'Zone 2 — Inner Suburbs', areas: 'Short Pump, Glen Allen, Lakeside, Bon Air, Tuckahoe', surcharge: 5 },
    { id: 'z3', name: 'Zone 3 — Outer Ring', areas: 'Midlothian, Henrico, Mechanicsville, Chesterfield', surcharge: 10 },
];

// ---- Load State ----
let activeTab = 'overview';
let bookings = load('bookings', []);
let clients = load('clients', []);
let pets = load('pets', []);
let services = load('services', DEFAULT_SERVICES);
let addons = load('addons', DEFAULT_ADDONS);
let packages = load('packages', DEFAULT_PACKAGES);
let zones = load('zones', DEFAULT_ZONES);
let sitters = load('sitters', [
    { id: 'wesley', name: 'Wesley', phone: '(804) 258-3830', email: 'Genuspupclub@gmail.com', rate: 25, status: 'active', specialty: 'All breeds', bio: 'Founder & lead sitter. All breeds, all sizes.', certifications: 'Pet First Aid, CPR', maxDogs: 4, availability: 'Mon-Sun' },
    { id: 'maria', name: 'Maria', phone: '', email: '', rate: 20, status: 'active', specialty: 'Small & medium breeds', bio: 'Experienced sitter, great with anxious dogs.', certifications: '', maxDogs: 3, availability: 'Mon-Fri' },
    { id: 'aj', name: 'AJ', phone: '', email: '', rate: 20, status: 'active', specialty: 'Large breeds, high energy', bio: 'Active sitter, loves long walks and playtime.', certifications: '', maxDogs: 3, availability: 'Mon-Sun' }
]);
let properties = load('properties', [
    { id: 'prop1', name: 'Penobscot House', address: '8216 Penobscot Rd, Richmond, VA', capacity: 6, features: 'Fenced yard, large living room, 2 crates', assignedSitters: ['Wesley', 'Maria'], notes: 'Primary location' },
    { id: 'prop2', name: 'Tuxedo House', address: '3208 Tuxedo Blvd, Richmond, VA', capacity: 4, features: 'Backyard, quiet neighborhood', assignedSitters: ['AJ'], notes: 'Secondary location' }
]);
let reviews = load('reviews', [
    { id: uid(), name: 'Sarah M.', pet: 'Luna', stars: 5, text: 'My anxious rescue dog actually gets EXCITED when he sees the sitter pull up.', date: '2026-03-28', service: 'Dog Walking' },
    { id: uid(), name: 'James T.', pet: 'Max', stars: 5, text: 'The photo updates during walks are my favorite part of the workday.', date: '2026-03-25', service: 'Dog Walking' },
    { id: uid(), name: 'Patricia L.', pet: 'Buddy', stars: 5, text: 'My senior dog needs medication twice a day. They follow the routine perfectly every time.', date: '2026-03-20', service: 'Senior Dog Care' }
]);
let messages = load('messages', []);
let businessSettings = load('settings', {
    name: 'GenusPupClub', phone: '(804) 555-1234', email: 'hello@genuspupclub.com',
    address: 'Richmond, VA', taxRate: 0, multiDogDiscount: 10, recurringDiscount: 15,
    cancellationHours: 24, cancellationFee: 50, maxBookingsPerDay: 8,
    operatingHours: '7:00 AM - 8:00 PM', operatingDays: 'Mon-Sun',
    acceptedPayments: 'Credit/Debit, Venmo, Zelle, CashApp, Apple Pay',
    emergencyVet: 'VCA Emergency - (804) 555-9911'
});

// Save defaults on first load
if (!localStorage.getItem(DB_KEY + 'services')) save('services', services);
if (!localStorage.getItem(DB_KEY + 'addons')) save('addons', addons);
if (!localStorage.getItem(DB_KEY + 'packages')) save('packages', packages);
if (!localStorage.getItem(DB_KEY + 'zones')) save('zones', zones);
if (!localStorage.getItem(DB_KEY + 'settings')) save('settings', businessSettings);
if (!localStorage.getItem(DB_KEY + 'sitters')) save('sitters', sitters);
if (!localStorage.getItem(DB_KEY + 'properties')) save('properties', properties);
save('reviews', reviews);

// ---- Date Header ----
document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// ---- Nav ----
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        activeTab = item.dataset.tab;
        document.getElementById('pageTitle').textContent = item.textContent.trim();
        renderTab();
        document.getElementById('sidebar').classList.remove('open');
    });
});
document.getElementById('menuToggle')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

const el = document.getElementById('content');

const renderTab = () => {
    bookings = load('bookings', []); clients = load('clients', []); pets = load('pets', []);
    services = load('services', DEFAULT_SERVICES); addons = load('addons', DEFAULT_ADDONS);
    packages = load('packages', DEFAULT_PACKAGES); zones = load('zones', DEFAULT_ZONES);
    sitters = load('sitters', sitters); reviews = load('reviews', reviews);
    messages = load('messages', []); businessSettings = load('settings', businessSettings);

    const views = { overview: renderOverview, bookings: renderBookings, clients: renderClients, pets: renderPets, schedule: renderSchedule, revenue: renderRevenue, payments: renderPaymentsAdmin, reviews: renderReviews, sitters: renderSitters, properties: renderProperties, checkin: renderCheckIn, gallery: renderGallery, messages: renderMessages, website: renderWebsiteEditor, settings: renderSettings };
    (views[activeTab] || renderOverview)();
};

// ============================================
// OVERVIEW
// ============================================
const renderOverview = () => {
    const thisMonth = todayStr().substring(0, 7);
    const monthBookings = bookings.filter(b => (b.date || '').startsWith(thisMonth));
    const revenue = monthBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + calcBookingTotal(b), 0);
    const pending = bookings.filter(b => b.status === 'pending').length;
    const todayBookings = bookings.filter(b => b.date === todayStr()).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const activeClients = new Set(bookings.filter(b => (b.date || '') >= new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]).map(b => b.clientId)).size;

    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Clients</div><div class="stat-value">${clients.length}</div><div class="stat-sub">${activeClients} active (30 days) | ${pets.length} pets</div></div>
            <div class="stat-card green"><div class="stat-label">Month Revenue</div><div class="stat-value">${fmt(revenue)}</div><div class="stat-sub">${monthBookings.length} bookings | ${monthBookings.filter(b => b.status === 'completed').length} completed</div></div>
            <div class="stat-card blue"><div class="stat-label">Today</div><div class="stat-value">${todayBookings.length} bookings</div><div class="stat-sub">${pending} pending confirmations</div></div>
            <div class="stat-card yellow"><div class="stat-label">Rating</div><div class="stat-value">${reviews.length ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : '—'} ★</div><div class="stat-sub">${reviews.length} reviews</div></div>
        </div>
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">Today's Schedule</span></div>
                ${todayBookings.length ? todayBookings.map(b => `
                    <div class="schedule-item">
                        <div class="schedule-time">${b.time || '—'}</div>
                        <div class="schedule-info"><h4>${escHTML(b.clientName)} — ${escHTML(b.petName)}</h4><p>${escHTML(b.service)} ${b.addons?.length ? `+ ${b.addons.length} add-on${b.addons.length > 1 ? 's' : ''}` : ''} <span class="badge badge-${b.status}">${b.status}</span> <strong>${fmt(calcBookingTotal(b))}</strong></p></div>
                    </div>
                `).join('') : '<div class="empty"><div class="empty-icon">📅</div><p>No bookings today</p></div>'}
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">Recent Reviews</span></div>
                ${reviews.slice(0, 3).map(r => `<div class="review-item"><div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div><div class="review-text">"${escHTML(r.text)}"</div><div class="review-author">${escHTML(r.name)} — ${escHTML(r.pet)}</div></div>`).join('')}
            </div>
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">Upcoming Bookings</span><button class="btn btn-primary btn-sm" onclick="showModal('booking')">+ New Booking</button></div>
            ${renderBookingTable(bookings.filter(b => b.date >= todayStr() && b.status !== 'cancelled').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10))}
        </div>
    `;
};

// ============================================
// BOOKINGS
// ============================================
const renderBookings = () => {
    const filter = document.querySelector('.booking-filter-active')?.dataset?.filter || 'all';
    let filtered = [...bookings];
    if (filter === 'today') filtered = filtered.filter(b => b.date === todayStr());
    else if (filter === 'upcoming') filtered = filtered.filter(b => b.date >= todayStr());
    else if (filter === 'pending') filtered = filtered.filter(b => b.status === 'pending');
    else if (filter === 'completed') filtered = filtered.filter(b => b.status === 'completed');
    filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    el.innerHTML = `
        <div class="card" style="margin-bottom:16px;padding:12px 20px;display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                ${['all', 'today', 'upcoming', 'pending', 'completed'].map(f => `<button class="btn btn-sm ${f === 'all' ? 'btn-primary' : 'btn-ghost'}" onclick="this.parentElement.querySelectorAll('.btn').forEach(b=>{b.className='btn btn-sm btn-ghost'});this.className='btn btn-sm btn-primary';document.querySelector('.booking-filter-active')?.classList.remove('booking-filter-active');this.classList.add('booking-filter-active');this.dataset.filter='${f}';renderTab()">${f.charAt(0).toUpperCase() + f.slice(1)}</button>`).join('')}
            </div>
            <button class="btn btn-primary btn-sm" onclick="showModal('booking')">+ New Booking</button>
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">${filtered.length} Bookings</span></div>
            ${renderBookingTable(filtered)}
        </div>
    `;
};

const renderBookingTable = (items) => `
    <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Pet</th><th>Service</th><th>Add-ons</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>${items.length ? items.map(b => `<tr>
            <td>${b.date}</td><td>${b.time || '—'}</td><td>${escHTML(b.clientName)}</td><td>${escHTML(b.petName)}</td>
            <td>${escHTML(b.service)}</td>
            <td>${b.addons?.length ? b.addons.map(a => `<span class="badge badge-completed">${escHTML(a)}</span>`).join(' ') : '—'}</td>
            <td><strong>${fmt(calcBookingTotal(b))}</strong></td>
            <td><span class="badge badge-${b.status}">${b.status}</span></td>
            <td style="white-space:nowrap">
                ${b.status === 'pending' ? `<button class="btn btn-ghost btn-sm" onclick="updateBooking('${b.id}','confirmed')">✓</button>` : ''}
                ${b.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" onclick="updateBooking('${b.id}','completed')">Done</button>` : ''}
                <button class="btn btn-ghost btn-sm" onclick="deleteItem('bookings','${b.id}')">✕</button>
            </td>
        </tr>`).join('') : '<tr><td colspan="9" class="empty">No bookings</td></tr>'}</tbody>
    </table></div>
`;

const calcBookingTotal = (b) => {
    let total = parseFloat(b.amount) || 0;
    if (b.addons?.length) {
        b.addons.forEach(aName => {
            const addon = addons.find(a => a.name === aName);
            if (addon) total += addon.price;
        });
    }
    if (b.zone) {
        const zone = zones.find(z => z.name === b.zone);
        if (zone) total += zone.surcharge;
    }
    if (b.extraDogs) total += (b.extraDogs * (businessSettings.multiDogDiscount || 10));
    return total;
};

// ============================================
// CLIENTS
// ============================================
const renderClients = () => {
    el.innerHTML = `
        <div class="card">
            <div class="card-header"><span class="card-title">Clients (${clients.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('client')">+ Add Client</button></div>
            <div class="table-wrap"><table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Pets</th><th>Bookings</th><th>Total Spent</th><th></th></tr></thead>
                <tbody>${clients.length ? clients.map(c => {
                    const cPets = pets.filter(p => p.clientId === c.id);
                    const cBookings = bookings.filter(b => b.clientId === c.id);
                    const spent = cBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + calcBookingTotal(b), 0);
                    return `<tr>
                        <td><strong>${escHTML(c.name)}</strong></td><td>${escHTML(c.email)}</td><td>${escHTML(c.phone)}</td><td>${escHTML(c.address)}</td>
                        <td>${cPets.map(p => escHTML(p.name)).join(', ') || '—'}</td><td>${cBookings.length}</td><td><strong>${fmt(spent)}</strong></td>
                        <td><button class="btn btn-ghost btn-sm" onclick="editClient('${c.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deleteItem('clients','${c.id}')">✕</button></td>
                    </tr>`;
                }).join('') : '<tr><td colspan="8" class="empty">No clients yet</td></tr>'}</tbody>
            </table></div>
        </div>
    `;
};

// ============================================
// PETS
// ============================================
const renderPets = () => {
    el.innerHTML = `
        <div class="card" style="margin-bottom:16px"><div class="card-header"><span class="card-title">Pet Profiles (${pets.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('pet')">+ Add Pet</button></div></div>
        <div class="stats-grid">${pets.length ? pets.map(p => {
            const owner = clients.find(c => c.id === p.clientId);
            return `<div class="pet-card">
                <div class="pet-avatar">🐕</div>
                <div class="pet-info" style="flex:1">
                    <h4>${escHTML(p.name)} <button class="btn btn-ghost btn-sm" style="float:right" onclick="deleteItem('pets','${p.id}')">✕</button></h4>
                    <p>${escHTML(p.breed || '?')} · ${escHTML(p.age || '?')} · ${escHTML(p.weight || '?')} · ${escHTML(p.gender || '?')}</p>
                    <p style="font-size:.8rem">Owner: <strong>${escHTML(owner?.name || '—')}</strong></p>
                    ${p.vet ? `<p style="font-size:.78rem;color:var(--text-muted)">Vet: ${escHTML(p.vet)}</p>` : ''}
                    ${p.allergies ? `<p style="font-size:.78rem;color:var(--danger)">Allergies: ${escHTML(p.allergies)}</p>` : ''}
                    ${p.medications ? `<p style="font-size:.78rem;color:var(--info)">Meds: ${escHTML(p.medications)}</p>` : ''}
                    ${p.feedingSchedule ? `<p style="font-size:.78rem">Feeding: ${escHTML(p.feedingSchedule)}</p>` : ''}
                    <div class="pet-tags">${(p.tags || '').split(',').filter(t => t.trim()).map(t => `<span class="pet-tag">${escHTML(t.trim())}</span>`).join('')}</div>
                    ${p.notes ? `<p style="font-size:.78rem;margin-top:4px;color:var(--text-muted)">${escHTML(p.notes)}</p>` : ''}
                </div>
            </div>`;
        }).join('') : '<div class="card"><div class="empty"><div class="empty-icon">🐕</div><p>No pets yet</p></div></div>'}</div>
    `;
};

// ============================================
// SCHEDULE
// ============================================
const renderSchedule = () => {
    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        const key = d.toISOString().split('T')[0];
        week.push({ date: key, label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), bookings: bookings.filter(b => b.date === key && b.status !== 'cancelled').sort((a, b) => (a.time || '').localeCompare(b.time || '')), isToday: i === 0 });
    }
    const dailyRevenue = week.map(d => d.bookings.reduce((s, b) => s + calcBookingTotal(b), 0));

    el.innerHTML = `
        <div class="stats-grid" style="margin-bottom:16px">
            ${week.slice(0, 4).map((d, i) => `<div class="stat-card ${d.isToday ? '' : i === 1 ? 'blue' : i === 2 ? 'green' : 'yellow'}">
                <div class="stat-label">${d.label}</div><div class="stat-value">${d.bookings.length}</div><div class="stat-sub">${fmt(dailyRevenue[i])} revenue</div>
            </div>`).join('')}
        </div>
        <div class="card">${week.map(d => `
            <div style="margin-bottom:20px;${d.isToday ? 'background:rgba(255,107,53,0.03);padding:14px;border-radius:8px;border-left:3px solid var(--primary)' : ''}">
                <div style="font-weight:600;font-size:.95rem;margin-bottom:8px;display:flex;justify-content:space-between;${d.isToday ? 'color:var(--primary)' : ''}">
                    <span>${d.label}${d.isToday ? ' (Today)' : ''}</span>
                    <span style="font-size:.82rem;color:var(--text-muted)">${d.bookings.length} bookings · ${fmt(d.bookings.reduce((s, b) => s + calcBookingTotal(b), 0))}</span>
                </div>
                ${d.bookings.length ? d.bookings.map(b => `
                    <div class="schedule-item"><div class="schedule-time">${b.time || '—'}</div>
                    <div class="schedule-info"><h4>${escHTML(b.clientName)} — ${escHTML(b.petName)}</h4><p>${escHTML(b.service)} <span class="badge badge-${b.status}">${b.status}</span> <strong>${fmt(calcBookingTotal(b))}</strong></p></div></div>
                `).join('') : '<div style="font-size:.85rem;color:var(--text-muted);padding:4px 0">No bookings</div>'}
            </div>
        `).join('')}</div>
    `;
};

// ============================================
// PAYMENTS (Admin View — Full Financial Dashboard)
// ============================================
let expenses = load('expenses', []);

const renderPaymentsAdmin = () => {
    const allPayments = load('payments', []);
    expenses = load('expenses', []);
    const pending = allPayments.filter(p => p.status === 'pending');
    const paid = allPayments.filter(p => p.status === 'paid');

    // Revenue calculations
    const grossIncome = paid.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const totalTips = allPayments.reduce((s, p) => s + (parseFloat(p.tip) || 0), 0);
    const totalPending = pending.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    // Tax calculations
    const taxRate = parseFloat(businessSettings.taxRate) || 0;
    const taxOwed = grossIncome * (taxRate / 100);
    const netIncome = grossIncome - totalExpenses - taxOwed;

    // By method
    const byMethod = {};
    paid.forEach(p => { byMethod[p.method || 'unknown'] = (byMethod[p.method || 'unknown'] || 0) + (parseFloat(p.amount) || 0); });

    // Monthly breakdown
    const monthlyData = {};
    paid.forEach(p => {
        const m = (p.date || '').substring(0, 7);
        if (!m) return;
        if (!monthlyData[m]) monthlyData[m] = { income: 0, tips: 0, expenses: 0, count: 0 };
        monthlyData[m].income += parseFloat(p.amount) || 0;
        monthlyData[m].tips += parseFloat(p.tip) || 0;
        monthlyData[m].count++;
    });
    expenses.forEach(e => {
        const m = (e.date || '').substring(0, 7);
        if (!m) return;
        if (!monthlyData[m]) monthlyData[m] = { income: 0, tips: 0, expenses: 0, count: 0 };
        monthlyData[m].expenses += parseFloat(e.amount) || 0;
    });

    // Quarterly estimate
    const thisQuarter = Math.floor(new Date().getMonth() / 3);
    const quarterMonths = [thisQuarter * 3, thisQuarter * 3 + 1, thisQuarter * 3 + 2].map(m => {
        const d = new Date(); d.setMonth(m); return d.toISOString().substring(0, 7);
    });
    const quarterIncome = quarterMonths.reduce((s, m) => s + (monthlyData[m]?.income || 0), 0);
    const quarterTax = quarterIncome * (taxRate / 100);

    // Expense categories
    const expByCat = {};
    expenses.forEach(e => { expByCat[e.category || 'Other'] = (expByCat[e.category || 'Other'] || 0) + (parseFloat(e.amount) || 0); });

    el.innerHTML = `
        <!-- Financial Overview -->
        <div class="stats-grid">
            <div class="stat-card green"><div class="stat-label">Gross Income</div><div class="stat-value">${fmt(grossIncome)}</div><div class="stat-sub">${paid.length} payments received</div></div>
            <div class="stat-card"><div class="stat-label">Tips</div><div class="stat-value">${fmt(totalTips)}</div><div class="stat-sub">Avg ${paid.length ? fmt(totalTips / paid.length) : '$0'}/visit</div></div>
            <div class="stat-card yellow"><div class="stat-label">Pending</div><div class="stat-value">${fmt(totalPending)}</div><div class="stat-sub">${pending.length} awaiting</div></div>
            <div class="stat-card blue"><div class="stat-label">Expenses</div><div class="stat-value">${fmt(totalExpenses)}</div><div class="stat-sub">${expenses.length} items</div></div>
        </div>
        <div class="stats-grid" style="margin-top:-8px">
            <div class="stat-card" style="border-left-color:${netIncome >= 0 ? '#00B894' : '#E17055'}"><div class="stat-label">Net Profit</div><div class="stat-value" style="color:${netIncome >= 0 ? '#00B894' : '#E17055'}">${fmt(netIncome)}</div><div class="stat-sub">After expenses & tax</div></div>
            <div class="stat-card" style="border-left-color:#E17055"><div class="stat-label">Tax Owed (${taxRate}%)</div><div class="stat-value">${fmt(taxOwed)}</div><div class="stat-sub">Set rate in Settings</div></div>
            <div class="stat-card" style="border-left-color:#8B5CF6"><div class="stat-label">Q${thisQuarter + 1} Estimated Tax</div><div class="stat-value">${fmt(quarterTax)}</div><div class="stat-sub">Quarterly estimate</div></div>
            <div class="stat-card"><div class="stat-label">Profit Margin</div><div class="stat-value">${grossIncome > 0 ? Math.round((netIncome / grossIncome) * 100) : 0}%</div></div>
        </div>

        <div class="grid-2">
            <!-- Payment Method Breakdown -->
            <div class="card">
                <div class="card-title" style="margin-bottom:12px">Income by Payment Method</div>
                ${Object.entries(byMethod).sort((a, b) => b[1] - a[1]).map(([m, v]) => {
                    const pct = grossIncome > 0 ? Math.round(v / grossIncome * 100) : 0;
                    return `<div style="margin-bottom:10px">
                        <div style="display:flex;justify-content:space-between;font-size:.88rem;margin-bottom:4px"><span>${escHTML(m)}</span><strong>${fmt(v)} (${pct}%)</strong></div>
                        <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:var(--primary);border-radius:3px"></div></div>
                    </div>`;
                }).join('') || '<div class="empty">No data</div>'}
            </div>

            <!-- Expense Breakdown -->
            <div class="card">
                <div class="card-header"><span class="card-title">Expenses by Category</span><button class="btn btn-primary btn-sm" onclick="showModal('expense')">+ Add Expense</button></div>
                ${Object.entries(expByCat).sort((a, b) => b[1] - a[1]).map(([c, v]) => {
                    const pct = totalExpenses > 0 ? Math.round(v / totalExpenses * 100) : 0;
                    return `<div style="margin-bottom:10px">
                        <div style="display:flex;justify-content:space-between;font-size:.88rem;margin-bottom:4px"><span>${escHTML(c)}</span><strong>${fmt(v)} (${pct}%)</strong></div>
                        <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:#8B5CF6;border-radius:3px"></div></div>
                    </div>`;
                }).join('') || '<div class="empty">No expenses tracked</div>'}
            </div>
        </div>

        <!-- Monthly P&L -->
        <div class="card">
            <div class="card-header"><span class="card-title">Monthly Profit & Loss</span></div>
            <div class="table-wrap"><table>
                <thead><tr><th>Month</th><th>Income</th><th>Tips</th><th>Expenses</th><th>Tax (${taxRate}%)</th><th>Net Profit</th><th>Visits</th></tr></thead>
                <tbody>${Object.entries(monthlyData).sort().reverse().map(([m, d]) => {
                    const tax = d.income * (taxRate / 100);
                    const net = d.income + d.tips - d.expenses - tax;
                    return `<tr>
                        <td><strong>${m}</strong></td><td>${fmt(d.income)}</td><td>${fmt(d.tips)}</td>
                        <td style="color:var(--danger)">${fmt(d.expenses)}</td><td style="color:var(--danger)">${fmt(tax)}</td>
                        <td style="color:${net >= 0 ? 'var(--success)' : 'var(--danger)'}"><strong>${fmt(net)}</strong></td>
                        <td>${d.count}</td>
                    </tr>`;
                }).join('') || '<tr><td colspan="7" class="empty">No data yet</td></tr>'}</tbody>
            </table></div>
        </div>

        <!-- Pending Payments -->
        ${pending.length ? `<div class="card">
            <div class="card-header"><span class="card-title">Pending Payments (${pending.length})</span></div>
            <div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Amount</th><th>Method</th><th>Tip</th><th></th></tr></thead>
                <tbody>${pending.map(p => `<tr>
                    <td>${p.date}</td><td>${escHTML(p.clientName || '—')}</td><td>${escHTML(p.service)}</td>
                    <td><strong>${fmt(p.amount)}</strong></td><td><span class="badge badge-pending">${p.method}</span></td>
                    <td>${p.tip ? fmt(p.tip) : '—'}</td>
                    <td><button class="btn btn-success btn-sm" onclick="confirmPayment('${p.id}')">Confirm</button> <button class="btn btn-ghost btn-sm" onclick="deletePayment('${p.id}')">✕</button></td>
                </tr>`).join('')}</tbody>
            </table></div>
        </div>` : ''}

        <!-- All Payments -->
        <div class="card">
            <div class="card-header"><span class="card-title">All Transactions (${allPayments.length + expenses.length})</span>
                <div style="display:flex;gap:6px">
                    <button class="btn btn-primary btn-sm" onclick="showModal('manual_payment')">+ Record Payment</button>
                    <button class="btn btn-sm btn-ghost" onclick="showModal('expense')">+ Expense</button>
                    <button class="btn btn-sm btn-ghost" onclick="exportFinances()">Export CSV</button>
                </div>
            </div>
            <div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Tip</th><th>Method</th><th>Status</th><th></th></tr></thead>
                <tbody>
                    ${allPayments.slice().reverse().map(p => `<tr>
                        <td>${p.date}</td><td><span class="badge badge-confirmed">Income</span></td>
                        <td>${escHTML(p.clientName || '')} — ${escHTML(p.service || '')}</td>
                        <td style="color:var(--success)">+${fmt(p.amount)}</td><td>${p.tip ? fmt(p.tip) : '—'}</td>
                        <td>${p.method || '—'}</td><td><span class="badge badge-${p.status === 'paid' ? 'confirmed' : 'pending'}">${p.status}</span></td>
                        <td><button class="btn btn-ghost btn-sm" onclick="deletePayment('${p.id}')">✕</button></td>
                    </tr>`).join('')}
                    ${expenses.slice().reverse().map(e => `<tr style="background:rgba(225,112,85,.02)">
                        <td>${e.date}</td><td><span class="badge badge-cancelled">Expense</span></td>
                        <td>${escHTML(e.description || '')} <span style="font-size:.72rem;color:var(--text-muted)">(${escHTML(e.category || '')})</span></td>
                        <td style="color:var(--danger)">-${fmt(e.amount)}</td><td>—</td>
                        <td>${escHTML(e.method || '—')}</td><td>—</td>
                        <td><button class="btn btn-ghost btn-sm" onclick="deleteExpense('${e.id}')">✕</button></td>
                    </tr>`).join('')}
                </tbody>
            </table></div>
        </div>

        <!-- Tax Summary -->
        <div class="card">
            <div class="card-header"><span class="card-title">Tax Summary (${new Date().getFullYear()})</span></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div>
                    <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:4px">Gross Income (taxable)</div>
                    <div style="font-size:1.3rem;font-weight:700">${fmt(grossIncome + totalTips)}</div>
                </div>
                <div>
                    <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:4px">Deductible Expenses</div>
                    <div style="font-size:1.3rem;font-weight:700;color:var(--success)">-${fmt(totalExpenses)}</div>
                </div>
                <div>
                    <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:4px">Taxable Income</div>
                    <div style="font-size:1.3rem;font-weight:700">${fmt(grossIncome + totalTips - totalExpenses)}</div>
                </div>
                <div>
                    <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:4px">Estimated Tax (${taxRate}%)</div>
                    <div style="font-size:1.3rem;font-weight:700;color:var(--danger)">${fmt((grossIncome + totalTips - totalExpenses) * (taxRate / 100))}</div>
                </div>
            </div>
            <div style="margin-top:12px;padding:12px;background:rgba(139,92,246,.05);border-radius:8px;font-size:.82rem;color:var(--text-muted)">
                <strong>Reminder:</strong> Estimated quarterly taxes due: Jan 15, Apr 15, Jun 15, Sep 15. Self-employment tax is ~15.3% + income tax bracket. Track all expenses — gas, supplies, insurance, phone — they're deductible. Set your tax rate in Settings → Policies.
            </div>
        </div>
    `;
};

// Expense management
const deleteExpense = (id) => {
    if (!confirm('Delete expense?')) return;
    expenses = expenses.filter(x => x.id !== id);
    save('expenses', expenses);
    renderTab();
};

// CSV Export
const exportFinances = () => {
    const allPayments = load('payments', []);
    expenses = load('expenses', []);
    let csv = 'Date,Type,Description,Amount,Tip,Method,Status\n';
    allPayments.forEach(p => { csv += `${p.date},Income,"${p.clientName || ''} - ${p.service || ''}",${p.amount || 0},${p.tip || 0},${p.method || ''},${p.status}\n`; });
    expenses.forEach(e => { csv += `${e.date},Expense,"${e.description || ''} (${e.category || ''})",-${e.amount || 0},0,${e.method || ''},paid\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `genuspupclub-finances-${todayStr()}.csv`;
    a.click();
};

const confirmPayment = (id) => {
    const payments = load('payments', []);
    const p = payments.find(x => x.id === id);
    if (p) { p.status = 'paid'; save('payments', payments); renderTab(); }
};

const deletePayment = (id) => {
    if (!confirm('Delete payment?')) return;
    let payments = load('payments', []);
    payments = payments.filter(x => x.id !== id);
    save('payments', payments);
    renderTab();
};

// ============================================
// REVENUE
// ============================================
const renderRevenue = () => {
    const completed = bookings.filter(b => b.status !== 'cancelled');
    const months = {}; const byService = {}; const bySitter = {};
    completed.forEach(b => {
        const total = calcBookingTotal(b);
        const m = (b.date || '').substring(0, 7);
        if (m) months[m] = (months[m] || 0) + total;
        byService[b.service || 'Other'] = (byService[b.service || 'Other'] || 0) + total;
        bySitter[b.sitter || 'Unassigned'] = (bySitter[b.sitter || 'Unassigned'] || 0) + total;
    });
    const total = Object.values(months).reduce((s, v) => s + v, 0);
    const thisMonthRev = months[todayStr().substring(0, 7)] || 0;
    const avgPerBooking = completed.length ? total / completed.length : 0;

    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card green"><div class="stat-label">Total Revenue</div><div class="stat-value">${fmt(total)}</div><div class="stat-sub">${completed.length} bookings</div></div>
            <div class="stat-card"><div class="stat-label">This Month</div><div class="stat-value">${fmt(thisMonthRev)}</div></div>
            <div class="stat-card blue"><div class="stat-label">Avg / Booking</div><div class="stat-value">${fmt(avgPerBooking)}</div></div>
            <div class="stat-card yellow"><div class="stat-label">Active Services</div><div class="stat-value">${services.filter(s => s.active).length}</div><div class="stat-sub">${packages.length} packages</div></div>
        </div>
        <div class="grid-3">
            <div class="card"><div class="card-title" style="margin-bottom:12px">By Month</div>${Object.entries(months).sort().reverse().map(([m, v]) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span>${m}</span><strong>${fmt(v)}</strong></div>`).join('') || '<div class="empty">No data</div>'}</div>
            <div class="card"><div class="card-title" style="margin-bottom:12px">By Service</div>${Object.entries(byService).sort((a, b) => b[1] - a[1]).map(([s, v]) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span>${escHTML(s)}</span><strong>${fmt(v)}</strong></div>`).join('') || '<div class="empty">No data</div>'}</div>
            <div class="card"><div class="card-title" style="margin-bottom:12px">By Sitter</div>${Object.entries(bySitter).sort((a, b) => b[1] - a[1]).map(([s, v]) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span>${escHTML(s)}</span><strong>${fmt(v)}</strong></div>`).join('') || '<div class="empty">No data</div>'}</div>
        </div>
    `;
};

// ============================================
// REVIEWS
// ============================================
const renderReviews = () => {
    const avg = reviews.length ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : '0';
    const dist = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: reviews.filter(r => r.stars === s).length }));

    el.innerHTML = `
        <div class="grid-2" style="margin-bottom:16px">
            <div class="card" style="text-align:center"><div style="font-size:3rem;font-weight:700;color:var(--warning)">${avg}</div><div style="color:var(--warning);font-size:1.2rem;letter-spacing:2px">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5 - Math.round(avg))}</div><div style="color:var(--text-muted);margin-top:4px">${reviews.length} reviews</div></div>
            <div class="card">${dist.map(d => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="min-width:20px;font-size:.85rem">${d.stars}★</span><div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:${reviews.length ? (d.count / reviews.length * 100) : 0}%;background:var(--warning);border-radius:4px"></div></div><span style="min-width:24px;font-size:.82rem;color:var(--text-muted)">${d.count}</span></div>`).join('')}</div>
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">All Reviews</span><button class="btn btn-primary btn-sm" onclick="showModal('review')">+ Add Review</button></div>
            ${reviews.map(r => `<div class="review-item"><div style="display:flex;justify-content:space-between"><div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div><span style="font-size:.78rem;color:var(--text-muted)">${r.date || ''} · ${escHTML(r.service || '')}</span></div><div class="review-text">"${escHTML(r.text)}"</div><div class="review-author">${escHTML(r.name)} — ${escHTML(r.pet)} <button class="btn btn-ghost btn-sm" onclick="deleteItem('reviews','${r.id}')">✕</button></div></div>`).join('') || '<div class="empty">No reviews</div>'}
        </div>
    `;
};

// ============================================
// SITTERS / EMPLOYEES (Full Management)
// ============================================
let sitterPayroll = load('sitter_payroll', []);
let sitterMessages = load('sitter_messages', []);

const renderSitters = () => {
    sitterPayroll = load('sitter_payroll', []);
    sitterMessages = load('sitter_messages', []);

    // Calculate stats per sitter
    const sitterStats = sitters.map(s => {
        const sBookings = bookings.filter(b => b.sitter === s.name);
        const completed = sBookings.filter(b => b.status === 'completed');
        const revenue = completed.reduce((sum, b) => sum + calcBookingTotal(b), 0);
        const payRecords = sitterPayroll.filter(p => p.sitterId === s.id);
        const totalPaid = payRecords.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const hoursWorked = completed.reduce((sum, b) => {
            const svc = services.find(sv => sv.name === b.service);
            return sum + ((svc?.duration || 30) / 60);
        }, 0);
        const owed = (hoursWorked * (s.rate || 25)) - totalPaid;
        const upcoming = sBookings.filter(b => b.date >= todayStr() && b.status !== 'cancelled');
        const msgs = sitterMessages.filter(m => m.sitterId === s.id);
        return { ...s, sBookings, completed, revenue, totalPaid, hoursWorked, owed, upcoming, msgs, payRecords };
    });

    const totalOwed = sitterStats.reduce((s, x) => s + Math.max(0, x.owed), 0);
    const totalPaidOut = sitterPayroll.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

    el.innerHTML = `
        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Sitters</div><div class="stat-value">${sitters.length}</div><div class="stat-sub">${sitters.filter(s => s.status === 'active').length} active</div></div>
            <div class="stat-card green"><div class="stat-label">Total Paid Out</div><div class="stat-value">${fmt(totalPaidOut)}</div></div>
            <div class="stat-card yellow"><div class="stat-label">Currently Owed</div><div class="stat-value">${fmt(totalOwed)}</div></div>
            <div class="stat-card blue"><div class="stat-label">Total Visits Done</div><div class="stat-value">${sitterStats.reduce((s, x) => s + x.completed.length, 0)}</div></div>
        </div>

        <!-- Sitter Cards -->
        ${sitterStats.map(s => `
            <div class="card" style="margin-bottom:12px">
                <div style="display:flex;gap:16px;align-items:flex-start">
                    <div style="width:56px;height:56px;border-radius:50%;background:${s.status === 'active' ? 'var(--primary)' : '#6B7280'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.2rem;flex-shrink:0">${s.name.split(' ').map(n => n[0]).join('')}</div>
                    <div style="flex:1">
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <div>
                                <strong style="font-size:1.05rem">${escHTML(s.name)}</strong>
                                <span class="badge badge-${s.status === 'active' ? 'confirmed' : 'cancelled'}" style="margin-left:8px">${s.status}</span>
                            </div>
                            <div style="display:flex;gap:6px">
                                <button class="btn btn-sm btn-ghost" onclick="editSitter('${s.id}')">✎ Edit</button>
                                <button class="btn btn-sm btn-ghost" onclick="messageSitter('${s.id}','${escHTML(s.name)}')">💬</button>
                                <button class="btn btn-sm btn-ghost" onclick="paySitter('${s.id}','${escHTML(s.name)}',${s.owed > 0 ? s.owed.toFixed(2) : 0})">💰 Pay</button>
                                <button class="btn btn-sm btn-ghost" onclick="toggleSitterStatus('${s.id}')">${s.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                                <button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteItem('sitters','${s.id}')">✕</button>
                            </div>
                        </div>
                        <div style="font-size:.85rem;color:var(--text-light);margin:6px 0">${escHTML(s.phone || '')} · ${escHTML(s.email || '')} · ${fmt(s.rate)}/hr · Max ${s.maxDogs || 3} dogs</div>
                        ${s.specialty ? `<div style="font-size:.82rem;color:var(--text-muted)">Specialty: ${escHTML(s.specialty)}</div>` : ''}
                        ${s.certifications ? `<div style="font-size:.78rem;color:var(--accent)">Certs: ${escHTML(s.certifications)}</div>` : ''}
                        ${s.availability ? `<div style="font-size:.78rem;color:var(--text-muted)">Schedule: ${escHTML(s.availability)}</div>` : ''}
                        ${s.bio ? `<div style="font-size:.82rem;color:var(--text-muted);margin-top:4px;font-style:italic">"${escHTML(s.bio)}"</div>` : ''}

                        <!-- Performance Stats -->
                        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
                            <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700">${s.completed.length}</div><div style="font-size:.7rem;color:var(--text-muted)">Visits Done</div></div>
                            <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700">${s.hoursWorked.toFixed(1)}</div><div style="font-size:.7rem;color:var(--text-muted)">Hours</div></div>
                            <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700">${fmt(s.revenue)}</div><div style="font-size:.7rem;color:var(--text-muted)">Revenue</div></div>
                            <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700;color:var(--success)">${fmt(s.totalPaid)}</div><div style="font-size:.7rem;color:var(--text-muted)">Paid</div></div>
                            <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700;color:${s.owed > 0 ? 'var(--danger)' : 'var(--success)'}">${s.owed > 0 ? fmt(s.owed) : 'Settled'}</div><div style="font-size:.7rem;color:var(--text-muted)">Owed</div></div>
                        </div>

                        <!-- Upcoming -->
                        ${s.upcoming.length ? `<div style="margin-top:10px"><div style="font-size:.78rem;font-weight:600;color:var(--primary);margin-bottom:4px">Upcoming (${s.upcoming.length}):</div>${s.upcoming.slice(0, 3).map(b => `<div style="font-size:.78rem;color:var(--text-muted);padding:2px 0">${b.date} ${b.time || ''} — ${escHTML(b.petName)} (${escHTML(b.service)})</div>`).join('')}</div>` : ''}

                        <!-- Recent Messages -->
                        ${s.msgs.length ? `<div style="margin-top:10px"><div style="font-size:.78rem;font-weight:600;color:#8B5CF6;margin-bottom:4px">Recent Messages:</div>${s.msgs.slice(-2).reverse().map(m => `<div style="font-size:.78rem;color:var(--text-muted);padding:2px 0"><strong>${escHTML(m.from)}:</strong> ${escHTML(m.text).substring(0, 80)}${m.text.length > 80 ? '...' : ''} <span style="opacity:.4">${m.date}</span></div>`).join('')}</div>` : ''}

                        <!-- Pay History -->
                        ${s.payRecords.length ? `<div style="margin-top:10px"><div style="font-size:.78rem;font-weight:600;color:var(--success);margin-bottom:4px">Pay History:</div>${s.payRecords.slice(-3).reverse().map(p => `<div style="font-size:.78rem;color:var(--text-muted);padding:2px 0">${p.date} — ${fmt(p.amount)} via ${p.method} ${p.notes ? '(' + escHTML(p.notes) + ')' : ''}</div>`).join('')}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('')}

        <div style="text-align:center;margin-top:12px">
            <button class="btn btn-primary" onclick="showModal('sitter')">+ Add New Sitter/Employee</button>
        </div>
    `;
};

const toggleSitterStatus = (id) => {
    const s = sitters.find(x => x.id === id);
    if (s) { s.status = s.status === 'active' ? 'inactive' : 'active'; save('sitters', sitters); renderTab(); }
};

const editSitter = (id) => {
    const s = sitters.find(x => x.id === id);
    if (!s) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal">
        <div class="modal-title">Edit: ${escHTML(s.name)}</div>
        <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="esName" value="${escHTML(s.name)}"></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="esPhone" value="${escHTML(s.phone || '')}"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="esEmail" value="${escHTML(s.email || '')}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Rate ($/hr)</label><input class="form-input" id="esRate" type="number" value="${s.rate || 25}"></div><div class="form-group"><label class="form-label">Max Dogs</label><input class="form-input" id="esMax" type="number" value="${s.maxDogs || 3}"></div></div>
        <div class="form-group"><label class="form-label">Specialty</label><input class="form-input" id="esSpec" value="${escHTML(s.specialty || '')}"></div>
        <div class="form-group"><label class="form-label">Certifications</label><input class="form-input" id="esCerts" value="${escHTML(s.certifications || '')}"></div>
        <div class="form-group"><label class="form-label">Availability</label><input class="form-input" id="esAvail" value="${escHTML(s.availability || '')}"></div>
        <div class="form-group"><label class="form-label">Bio</label><textarea class="form-textarea" id="esBio" rows="2">${escHTML(s.bio || '')}</textarea></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditSitter('${s.id}')">Save</button></div>
    </div>`;
    overlay.classList.add('open');
};

const saveEditSitter = (id) => {
    const s = sitters.find(x => x.id === id);
    if (!s) return;
    s.name = document.getElementById('esName')?.value?.trim() || s.name;
    s.phone = document.getElementById('esPhone')?.value?.trim() || '';
    s.email = document.getElementById('esEmail')?.value?.trim() || '';
    s.rate = parseFloat(document.getElementById('esRate')?.value) || s.rate;
    s.maxDogs = parseInt(document.getElementById('esMax')?.value) || 3;
    s.specialty = document.getElementById('esSpec')?.value?.trim() || '';
    s.certifications = document.getElementById('esCerts')?.value?.trim() || '';
    s.availability = document.getElementById('esAvail')?.value?.trim() || '';
    s.bio = document.getElementById('esBio')?.value?.trim() || '';
    save('sitters', sitters);
    closeModal(); renderTab();
};

const paySitter = (id, name, owed) => {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal">
        <div class="modal-title">Pay: ${escHTML(name)}</div>
        ${owed > 0 ? `<div style="padding:12px;background:rgba(255,107,53,.05);border-radius:8px;margin-bottom:12px;font-size:.9rem"><strong>Owed:</strong> <span style="color:var(--primary);font-weight:700">${fmt(owed)}</span></div>` : '<div style="padding:12px;background:rgba(0,184,148,.05);border-radius:8px;margin-bottom:12px;font-size:.9rem;color:var(--success)">All settled up!</div>'}
        <div class="form-row"><div class="form-group"><label class="form-label">Amount</label><input class="form-input" id="spAmount" type="number" step="0.01" value="${owed > 0 ? owed.toFixed(2) : ''}"></div><div class="form-group"><label class="form-label">Date</label><input class="form-input" id="spDate" type="date" value="${todayStr()}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Method</label><select class="form-select" id="spMethod"><option>Cash</option><option>CashApp</option><option>Venmo</option><option>Zelle</option><option>Check</option><option>Direct Deposit</option></select></div><div class="form-group"><label class="form-label">Period</label><input class="form-input" id="spPeriod" placeholder="e.g. Week of Mar 28"></div></div>
        <div class="form-group"><label class="form-label">Notes</label><input class="form-input" id="spNotes" placeholder="e.g. Includes bonus for holiday shifts"></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveSitterPay('${id}')">Record Payment</button></div>
    </div>`;
    overlay.classList.add('open');
};

const saveSitterPay = (sitterId) => {
    const v = (id) => document.getElementById(id)?.value?.trim() || '';
    sitterPayroll = load('sitter_payroll', []);
    sitterPayroll.push({ id: uid(), sitterId, amount: parseFloat(v('spAmount')) || 0, date: v('spDate'), method: v('spMethod'), period: v('spPeriod'), notes: v('spNotes') });
    save('sitter_payroll', sitterPayroll);
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Payment Recorded', `${fmt(parseFloat(v('spAmount')))} paid to sitter`, 'payment');
    closeModal(); renderTab();
};

const messageSitter = (sitterId, name) => {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }

    const history = (load('sitter_messages', []) || []).filter(m => m.sitterId === sitterId).slice(-10);

    overlay.innerHTML = `<div class="modal" style="max-width:550px">
        <div class="modal-title">Message: ${escHTML(name)}</div>
        ${history.length ? `<div style="max-height:200px;overflow-y:auto;margin-bottom:12px;border:1px solid var(--border);border-radius:8px;padding:8px">${history.map(m => `<div style="padding:6px 0;border-bottom:1px solid rgba(0,0,0,.03);font-size:.85rem"><strong style="color:${m.from === 'Admin' ? 'var(--primary)' : 'var(--text)'}">${escHTML(m.from)}</strong> <span style="font-size:.7rem;color:var(--text-muted)">${m.date} ${m.time || ''}</span><br>${escHTML(m.text)}</div>`).join('')}</div>` : ''}
        <div class="form-group"><label class="form-label">Message</label><textarea class="form-textarea" id="smText" rows="3" placeholder="Type your message to ${escHTML(name)}..."></textarea></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('smText').value='Hey! You have a new booking assigned. Check the schedule for details.'">New Booking</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('smText').value='Great job today! Client left a positive review.'">Great Job</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('smText').value='Reminder: You have visits scheduled tomorrow. Please confirm availability.'">Schedule Reminder</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('smText').value='Your pay for this period has been sent. Check your ${name.includes('Wesley') ? 'account' : 'CashApp/Venmo'}.'">Pay Sent</button>
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Close</button><button class="btn btn-primary" onclick="sendSitterMsg('${sitterId}','${escHTML(name)}')">Send</button></div>
    </div>`;
    overlay.classList.add('open');
};

const sendSitterMsg = (sitterId, name) => {
    const text = document.getElementById('smText')?.value?.trim();
    if (!text) return;
    sitterMessages = load('sitter_messages', []);
    sitterMessages.push({ id: uid(), sitterId, from: 'Admin', to: name, text, date: todayStr(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) });
    save('sitter_messages', sitterMessages);
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Message Sent', `To ${name}`, 'message');
    closeModal(); renderTab();
};

// ============================================
// PROPERTIES (Locations)
// ============================================
const renderProperties = () => {
    properties = load('properties', []);
    const checkins = load('checkins', []).filter(c => !c.checkedOut);

    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Properties</div><div class="stat-value">${properties.length}</div></div>
            <div class="stat-card green"><div class="stat-label">Total Capacity</div><div class="stat-value">${properties.reduce((s, p) => s + (p.capacity || 0), 0)} dogs</div></div>
            <div class="stat-card blue"><div class="stat-label">Currently Checked In</div><div class="stat-value">${checkins.length}</div></div>
        </div>

        ${properties.map(p => {
            const pCheckins = checkins.filter(c => c.property === p.name);
            const assignedSitters = p.assignedSitters || [];
            return `<div class="card" style="margin-bottom:16px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <h3 style="font-family:var(--font-display);margin-bottom:4px">${escHTML(p.name)}</h3>
                        <div style="font-size:.88rem;color:var(--text-light)">${escHTML(p.address)}</div>
                    </div>
                    <div style="display:flex;gap:6px">
                        <button class="btn btn-sm btn-ghost" onclick="editProperty('${p.id}')">✎ Edit</button>
                        <button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteProperty('${p.id}')">✕</button>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
                    <div style="text-align:center"><div style="font-size:1.3rem;font-weight:700">${p.capacity || '?'}</div><div style="font-size:.72rem;color:var(--text-muted)">Max Dogs</div></div>
                    <div style="text-align:center"><div style="font-size:1.3rem;font-weight:700;color:var(--primary)">${pCheckins.length}</div><div style="font-size:.72rem;color:var(--text-muted)">Current</div></div>
                    <div style="text-align:center"><div style="font-size:1.3rem;font-weight:700">${p.capacity - pCheckins.length}</div><div style="font-size:.72rem;color:var(--text-muted)">Available</div></div>
                    <div style="text-align:center"><div style="font-size:1.3rem;font-weight:700">${assignedSitters.length}</div><div style="font-size:.72rem;color:var(--text-muted)">Sitters</div></div>
                </div>

                <div style="margin-top:12px">
                    <div style="font-size:.82rem;font-weight:600;margin-bottom:6px">Assigned Sitters:</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                        ${assignedSitters.map(s => `<span style="padding:4px 12px;border-radius:50px;background:rgba(255,107,53,.08);color:var(--primary);font-size:.82rem;font-weight:600">${escHTML(s)}</span>`).join('') || '<span style="font-size:.82rem;color:var(--text-muted)">None assigned</span>'}
                    </div>
                </div>

                ${p.features ? `<div style="margin-top:8px;font-size:.82rem;color:var(--text-muted)"><strong>Features:</strong> ${escHTML(p.features)}</div>` : ''}
                ${p.notes ? `<div style="font-size:.82rem;color:var(--text-muted)"><strong>Notes:</strong> ${escHTML(p.notes)}</div>` : ''}

                ${pCheckins.length ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
                    <div style="font-size:.82rem;font-weight:600;margin-bottom:6px">Dogs Currently Here:</div>
                    ${pCheckins.map(c => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem"><span>🐕 <strong>${escHTML(c.petName)}</strong> (${escHTML(c.ownerName)})</span><span style="color:var(--text-muted)">${c.checkInTime}</span></div>`).join('')}
                </div>` : ''}
            </div>`;
        }).join('')}

        <div style="text-align:center;margin-top:12px">
            <button class="btn btn-primary" onclick="showModal('property')">+ Add Property</button>
        </div>
    `;
};

const editProperty = (id) => {
    const p = properties.find(x => x.id === id);
    if (!p) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal">
        <div class="modal-title">Edit: ${escHTML(p.name)}</div>
        <div class="form-group"><label class="form-label">Property Name</label><input class="form-input" id="epName" value="${escHTML(p.name)}"></div>
        <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="epAddr" value="${escHTML(p.address)}"></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Max Dogs</label><input class="form-input" id="epCap" type="number" value="${p.capacity || 4}"></div><div class="form-group"><label class="form-label">Features</label><input class="form-input" id="epFeat" value="${escHTML(p.features || '')}"></div></div>
        <div class="form-group"><label class="form-label">Assigned Sitters</label><div style="display:flex;gap:6px;flex-wrap:wrap">${sitters.map(s => `<label style="display:flex;gap:4px;align-items:center;font-size:.88rem"><input type="checkbox" class="ep-sitter" value="${escHTML(s.name)}" ${(p.assignedSitters || []).includes(s.name) ? 'checked' : ''}> ${escHTML(s.name)}</label>`).join('')}</div></div>
        <div class="form-group"><label class="form-label">Notes</label><input class="form-input" id="epNotes" value="${escHTML(p.notes || '')}"></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditProperty('${p.id}')">Save</button></div>
    </div>`;
    overlay.classList.add('open');
};

const saveEditProperty = (id) => {
    const p = properties.find(x => x.id === id);
    if (!p) return;
    p.name = document.getElementById('epName')?.value?.trim() || p.name;
    p.address = document.getElementById('epAddr')?.value?.trim() || p.address;
    p.capacity = parseInt(document.getElementById('epCap')?.value) || p.capacity;
    p.features = document.getElementById('epFeat')?.value?.trim() || '';
    p.notes = document.getElementById('epNotes')?.value?.trim() || '';
    p.assignedSitters = [...document.querySelectorAll('.ep-sitter:checked')].map(cb => cb.value);
    save('properties', properties);
    closeModal(); renderTab();
};

const deleteProperty = (id) => {
    if (!confirm('Delete property?')) return;
    properties = properties.filter(x => x.id !== id);
    save('properties', properties);
    renderTab();
};

// ============================================
// CHECK-IN / CHECK-OUT (Drop-off Checklist)
// ============================================
let checkins = load('checkins', []);

const renderCheckIn = () => {
    checkins = load('checkins', []);
    const active = checkins.filter(c => !c.checkedOut);
    const history = checkins.filter(c => c.checkedOut).slice(-20).reverse();

    el.innerHTML = `
        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Currently Checked In (${active.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('checkin')">+ Check In Dog</button></div>
            ${active.length ? active.map(c => `
                <div style="padding:16px 0;border-bottom:1px solid var(--border)">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <div>
                            <h4 style="margin-bottom:4px">${escHTML(c.petName)} <span style="font-size:.82rem;color:var(--text-muted)">(${escHTML(c.ownerName)})</span></h4>
                            <div style="font-size:.82rem;color:var(--text-light)">Checked in: ${c.checkInTime} on ${c.checkInDate}</div>
                            <div style="font-size:.82rem;color:var(--text-light)">Service: ${escHTML(c.service)}</div>
                        </div>
                        <button class="btn btn-success btn-sm" onclick="checkOutDog('${c.id}')">Check Out</button>
                    </div>
                    <div style="margin-top:8px">
                        <div style="font-size:.82rem;font-weight:600;margin-bottom:4px">Drop-off Checklist:</div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:4px;font-size:.82rem">
                            ${c.checklist ? Object.entries(c.checklist).map(([k, v]) => `<div style="display:flex;gap:6px;align-items:center"><span style="color:${v ? 'var(--success)' : 'var(--danger)'}">${v ? '✓' : '✕'}</span> ${escHTML(k)}</div>`).join('') : '<span style="color:var(--text-muted)">No checklist</span>'}
                        </div>
                    </div>
                    ${c.belongings ? `<div style="margin-top:6px;font-size:.82rem"><strong>Belongings:</strong> ${escHTML(c.belongings)}</div>` : ''}
                    ${c.specialInstructions ? `<div style="margin-top:4px;font-size:.82rem;color:var(--primary)"><strong>Instructions:</strong> ${escHTML(c.specialInstructions)}</div>` : ''}
                    ${c.ownerNotes ? `<div style="margin-top:4px;font-size:.82rem;color:var(--text-muted)"><strong>Notes:</strong> ${escHTML(c.ownerNotes)}</div>` : ''}
                </div>
            `).join('') : '<div class="empty"><div class="empty-icon">📋</div><p>No dogs currently checked in</p></div>'}
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">Check-Out History</span></div>
            ${history.length ? `<div class="table-wrap"><table>
                <thead><tr><th>Pet</th><th>Owner</th><th>Check In</th><th>Check Out</th><th>Service</th><th>Belongings</th></tr></thead>
                <tbody>${history.map(c => `<tr>
                    <td><strong>${escHTML(c.petName)}</strong></td>
                    <td>${escHTML(c.ownerName)}</td>
                    <td>${c.checkInDate} ${c.checkInTime}</td>
                    <td>${c.checkOutDate || ''} ${c.checkOutTime || ''}</td>
                    <td>${escHTML(c.service)}</td>
                    <td style="font-size:.82rem">${escHTML(c.belongings || '—')}</td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty">No history yet</div>'}
        </div>
    `;
};

const checkOutDog = (id) => {
    const c = checkins.find(x => x.id === id);
    if (!c) return;
    c.checkedOut = true;
    c.checkOutDate = todayStr();
    c.checkOutTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    save('checkins', checkins);
    renderTab();
};

// ============================================
// PHOTO GALLERY
// ============================================
let photos = load('photos', []);

const renderGallery = () => {
    photos = load('photos', []);
    const byPet = {};
    photos.forEach(p => { const key = p.petName || 'Unknown'; if (!byPet[key]) byPet[key] = []; byPet[key].push(p); });

    el.innerHTML = `
        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Photo Gallery (${photos.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('photo')">+ Add Photo</button></div>
            <p style="font-size:.85rem;color:var(--text-muted)">Document each visit with photos. Owners love seeing their pups!</p>
        </div>
        ${Object.keys(byPet).length ? Object.entries(byPet).map(([pet, pics]) => `
            <div class="card" style="margin-bottom:12px">
                <div class="card-header"><span class="card-title">🐕 ${escHTML(pet)} (${pics.length} photos)</span></div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
                    ${pics.map(p => `
                        <div style="background:var(--bg);border-radius:8px;overflow:hidden;border:1px solid var(--border)">
                            ${p.url ? `<img src="${escHTML(p.url)}" style="width:100%;height:150px;object-fit:cover" alt="${escHTML(p.caption || pet)}">` : `<div style="height:150px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:rgba(255,107,53,0.05)">📸</div>`}
                            <div style="padding:8px">
                                <div style="font-size:.82rem;font-weight:600">${escHTML(p.caption || 'Visit photo')}</div>
                                <div style="font-size:.72rem;color:var(--text-muted)">${p.date || ''} ${p.activity ? '· ' + escHTML(p.activity) : ''}</div>
                                <button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="deletePhoto('${p.id}')">✕ Remove</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('') : '<div class="card"><div class="empty"><div class="empty-icon">📸</div><p>No photos yet. Add photos during or after visits.</p></div></div>'}
    `;
};

const deletePhoto = (id) => { photos = photos.filter(p => p.id !== id); save('photos', photos); renderTab(); };

// ============================================
// MESSAGES (Enhanced — Owner Communication)
// ============================================
const renderMessages = () => {
    messages = load('messages', []);
    el.innerHTML = `
        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Messages (${messages.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('message')">+ New Message</button></div>
        </div>
        <div class="card">
            ${messages.length ? messages.slice().reverse().map(m => `
                <div style="padding:14px 0;border-bottom:1px solid var(--border)">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <div>
                            <strong>${escHTML(m.from)}</strong> → <strong>${escHTML(m.to)}</strong>
                            ${m.pet ? `<span style="font-size:.78rem;color:var(--text-muted)"> re: ${escHTML(m.pet)}</span>` : ''}
                        </div>
                        <span style="font-size:.78rem;color:var(--text-muted)">${m.date || ''} ${m.time || ''}</span>
                    </div>
                    <p style="font-size:.9rem;color:var(--text-light);margin-top:6px;white-space:pre-wrap">${escHTML(m.text)}</p>
                    ${m.type === 'update' ? '<span class="badge badge-completed">Visit Update</span>' : m.type === 'booking' ? '<span class="badge badge-pending">Booking</span>' : ''}
                    <button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="deleteItem('messages','${m.id}')">✕</button>
                </div>
            `).join('') : '<div class="empty"><div class="empty-icon">💬</div><p>No messages yet. Send updates to owners during visits.</p></div>'}
        </div>
    `;
};

// ============================================
// WEBSITE EDITOR (CMS)
// ============================================
let siteContent = load('site_content', {
    heroTitle: 'Your Pup Deserves',
    heroTitleHighlight: 'Five-Star Care',
    heroSubtitle: "Professional dog sitting, walking, and daycare — because your fur baby deserves someone who treats them like family.",
    heroBadge: "Richmond, VA's #1 Dog Sitter",
    heroImage: 'images/dogs-car.jpg',
    trustStat1: '500+', trustLabel1: 'Happy Pups',
    trustStat2: '4.9', trustLabel2: 'Star Rating',
    trustStat3: '3+', trustLabel3: 'Years Serving RVA',
    servicesTitle: 'Tail-Wagging Services',
    servicesSubtitle: "From quick check-ins to overnight stays, we've got your pup covered.",
    aboutTitle: "We're Not Just Sitters.",
    aboutHighlight: 'Family.',
    aboutText1: "GenusPupClub was born from a simple belief: every dog deserves the same love and attention they get from their owner — even when their owner isn't there.",
    aboutText2: "We're fully insured, pet first-aid certified, and obsessively dedicated to your dog's happiness. Every sitter goes through background checks and a hands-on training program before they ever meet your pup.",
    aboutImage: 'images/dogs-hiking.jpg',
    aboutQuote: "Your dog's tail should never stop wagging.",
    pricingTitle: 'Fair Rates, No Surprises',
    pricingSubtitle: 'All services include photo updates, GPS tracking, and our happiness guarantee.',
    ctaTitle: 'Ready to Give Your Pup',
    ctaHighlight: 'the Best Care in RVA?',
    ctaSubtitle: "Book your first visit today. No commitment — just see why 500+ dogs love GenusPupClub.",
    primaryColor: '#FF6B35',
    secondaryColor: '#2D3436',
    accentColor: '#00B894',
    bgColor: '#FFFAF5',
    footerText: "Richmond, VA's premium dog sitting service. Insured, certified, and obsessively dedicated to your pup's happiness."
});
if (!localStorage.getItem(DB_KEY + 'site_content')) save('site_content', siteContent);

const renderWebsiteEditor = () => {
    siteContent = load('site_content', siteContent);
    const sc = siteContent;

    el.innerHTML = `
        <div class="card" style="margin-bottom:16px;padding:16px;background:rgba(255,107,53,.03);border-left:4px solid var(--primary)">
            <strong>Website Editor</strong> — Change any text, image, or color below and click Save. Changes appear on the homepage instantly.
            <div style="margin-top:8px"><a href="index.html" target="_blank" class="btn btn-sm btn-ghost">Preview Site →</a></div>
        </div>

        <!-- HERO SECTION -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Hero Section</div>
            <div class="form-group"><label class="form-label">Badge Text</label><input class="form-input" id="cmsBadge" value="${escHTML(sc.heroBadge)}"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Hero Title (line 1)</label><input class="form-input" id="cmsHeroTitle" value="${escHTML(sc.heroTitle)}"></div>
                <div class="form-group"><label class="form-label">Hero Title (highlight)</label><input class="form-input" id="cmsHeroHighlight" value="${escHTML(sc.heroTitleHighlight)}" style="color:var(--primary);font-weight:700"></div>
            </div>
            <div class="form-group"><label class="form-label">Subtitle</label><textarea class="form-textarea" id="cmsHeroSub" rows="2">${escHTML(sc.heroSubtitle)}</textarea></div>
            <div class="form-group"><label class="form-label">Hero Image URL</label><input class="form-input" id="cmsHeroImg" value="${escHTML(sc.heroImage)}"><div style="margin-top:4px;font-size:.75rem;color:var(--text-muted)">Use: images/dogs-car.jpg, images/dogs-hiking.jpg, images/dogs-pair.jpg, images/dogs-cozy.jpg, images/dog-poodle.jpg — or paste any URL</div></div>
            ${sc.heroImage ? `<img src="${escHTML(sc.heroImage)}" style="width:120px;height:120px;object-fit:cover;border-radius:50%;margin-top:8px" onerror="this.style.display='none'">` : ''}
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px">
                <div class="form-group"><label class="form-label">Stat 1 Number</label><input class="form-input" id="cmsStat1" value="${escHTML(sc.trustStat1)}"></div>
                <div class="form-group"><label class="form-label">Stat 2 Number</label><input class="form-input" id="cmsStat2" value="${escHTML(sc.trustStat2)}"></div>
                <div class="form-group"><label class="form-label">Stat 3 Number</label><input class="form-input" id="cmsStat3" value="${escHTML(sc.trustStat3)}"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
                <div class="form-group"><label class="form-label">Stat 1 Label</label><input class="form-input" id="cmsLabel1" value="${escHTML(sc.trustLabel1)}"></div>
                <div class="form-group"><label class="form-label">Stat 2 Label</label><input class="form-input" id="cmsLabel2" value="${escHTML(sc.trustLabel2)}"></div>
                <div class="form-group"><label class="form-label">Stat 3 Label</label><input class="form-input" id="cmsLabel3" value="${escHTML(sc.trustLabel3)}"></div>
            </div>
        </div>

        <!-- SERVICES SECTION -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Services Section</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Section Title</label><input class="form-input" id="cmsSvcTitle" value="${escHTML(sc.servicesTitle)}"></div>
                <div class="form-group"><label class="form-label">Section Subtitle</label><input class="form-input" id="cmsSvcSub" value="${escHTML(sc.servicesSubtitle)}"></div>
            </div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-top:4px">Service cards are auto-generated from your Services list in Settings. Turn them on/off there.</p>
        </div>

        <!-- ABOUT SECTION -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">About Section</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="cmsAboutTitle" value="${escHTML(sc.aboutTitle)}"></div>
                <div class="form-group"><label class="form-label">Highlight Word</label><input class="form-input" id="cmsAboutHL" value="${escHTML(sc.aboutHighlight)}" style="color:var(--primary);font-weight:700"></div>
            </div>
            <div class="form-group"><label class="form-label">Paragraph 1</label><textarea class="form-textarea" id="cmsAbout1" rows="2">${escHTML(sc.aboutText1)}</textarea></div>
            <div class="form-group"><label class="form-label">Paragraph 2</label><textarea class="form-textarea" id="cmsAbout2" rows="2">${escHTML(sc.aboutText2)}</textarea></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">About Image</label><input class="form-input" id="cmsAboutImg" value="${escHTML(sc.aboutImage)}"></div>
                <div class="form-group"><label class="form-label">Quote</label><input class="form-input" id="cmsAboutQuote" value="${escHTML(sc.aboutQuote)}"></div>
            </div>
        </div>

        <!-- PRICING SECTION -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Pricing Section</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="cmsPriceTitle" value="${escHTML(sc.pricingTitle)}"></div>
                <div class="form-group"><label class="form-label">Subtitle</label><input class="form-input" id="cmsPriceSub" value="${escHTML(sc.pricingSubtitle)}"></div>
            </div>
        </div>

        <!-- CTA / BOOKING SECTION -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Booking Section (CTA)</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="cmsCtaTitle" value="${escHTML(sc.ctaTitle)}"></div>
                <div class="form-group"><label class="form-label">Highlight</label><input class="form-input" id="cmsCtaHL" value="${escHTML(sc.ctaHighlight)}"></div>
            </div>
            <div class="form-group"><label class="form-label">Subtitle</label><input class="form-input" id="cmsCtaSub" value="${escHTML(sc.ctaSubtitle)}"></div>
        </div>

        <!-- COLORS -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Brand Colors</div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">
                <div class="form-group"><label class="form-label">Primary</label><input type="color" id="cmsColor1" value="${sc.primaryColor}" style="width:100%;height:40px;border:none;cursor:pointer;border-radius:8px"></div>
                <div class="form-group"><label class="form-label">Secondary</label><input type="color" id="cmsColor2" value="${sc.secondaryColor}" style="width:100%;height:40px;border:none;cursor:pointer;border-radius:8px"></div>
                <div class="form-group"><label class="form-label">Accent</label><input type="color" id="cmsColor3" value="${sc.accentColor}" style="width:100%;height:40px;border:none;cursor:pointer;border-radius:8px"></div>
                <div class="form-group"><label class="form-label">Background</label><input type="color" id="cmsColor4" value="${sc.bgColor}" style="width:100%;height:40px;border:none;cursor:pointer;border-radius:8px"></div>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Footer</div>
            <div class="form-group"><label class="form-label">Footer Description</label><textarea class="form-textarea" id="cmsFooter" rows="2">${escHTML(sc.footerText)}</textarea></div>
        </div>

        <div style="position:sticky;bottom:16px;background:var(--card-bg);padding:16px;border-radius:12px;box-shadow:0 -4px 20px rgba(0,0,0,.1);display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:.88rem;color:var(--text-muted)">Changes save to localStorage and appear on the homepage instantly.</span>
            <div style="display:flex;gap:8px">
                <button class="btn btn-ghost" onclick="resetSiteContent()">Reset to Defaults</button>
                <button class="btn btn-primary" onclick="saveSiteContent()">Save All Changes</button>
            </div>
        </div>
    `;
};

const saveSiteContent = () => {
    const v = (id) => document.getElementById(id)?.value || '';
    siteContent = {
        heroBadge: v('cmsBadge'), heroTitle: v('cmsHeroTitle'), heroTitleHighlight: v('cmsHeroHighlight'),
        heroSubtitle: v('cmsHeroSub'), heroImage: v('cmsHeroImg'),
        trustStat1: v('cmsStat1'), trustLabel1: v('cmsLabel1'),
        trustStat2: v('cmsStat2'), trustLabel2: v('cmsLabel2'),
        trustStat3: v('cmsStat3'), trustLabel3: v('cmsLabel3'),
        servicesTitle: v('cmsSvcTitle'), servicesSubtitle: v('cmsSvcSub'),
        aboutTitle: v('cmsAboutTitle'), aboutHighlight: v('cmsAboutHL'),
        aboutText1: v('cmsAbout1'), aboutText2: v('cmsAbout2'),
        aboutImage: v('cmsAboutImg'), aboutQuote: v('cmsAboutQuote'),
        pricingTitle: v('cmsPriceTitle'), pricingSubtitle: v('cmsPriceSub'),
        ctaTitle: v('cmsCtaTitle'), ctaHighlight: v('cmsCtaHL'), ctaSubtitle: v('cmsCtaSub'),
        primaryColor: v('cmsColor1'), secondaryColor: v('cmsColor2'),
        accentColor: v('cmsColor3'), bgColor: v('cmsColor4'),
        footerText: v('cmsFooter')
    };
    save('site_content', siteContent);
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Website Updated', 'Changes saved! Visit the homepage to see them.', 'success');
};

const resetSiteContent = () => {
    if (!confirm('Reset all website content to defaults?')) return;
    localStorage.removeItem(DB_KEY + 'site_content');
    renderTab();
};

// ============================================
// SETTINGS — Ultra Customizable
// ============================================
const renderSettings = () => {
    el.innerHTML = `
        <!-- Business Info -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Business Information</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Business Name</label><input class="form-input" id="sName" value="${escHTML(businessSettings.name)}"></div>
                <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="sPhone" value="${escHTML(businessSettings.phone)}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="sEmail" value="${escHTML(businessSettings.email)}"></div>
                <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="sAddress" value="${escHTML(businessSettings.address)}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Operating Hours</label><input class="form-input" id="sHours" value="${escHTML(businessSettings.operatingHours)}"></div>
                <div class="form-group"><label class="form-label">Operating Days</label><input class="form-input" id="sDays" value="${escHTML(businessSettings.operatingDays)}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Accepted Payments</label><input class="form-input" id="sPayments" value="${escHTML(businessSettings.acceptedPayments)}"></div>
                <div class="form-group"><label class="form-label">Emergency Vet</label><input class="form-input" id="sVet" value="${escHTML(businessSettings.emergencyVet)}"></div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="saveSettings()">Save Business Info</button>
        </div>

        <!-- Policies -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Policies & Discounts</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Multi-Dog Discount (%)</label><input class="form-input" id="sMultiDog" type="number" value="${businessSettings.multiDogDiscount}"></div>
                <div class="form-group"><label class="form-label">Recurring Client Discount (%)</label><input class="form-input" id="sRecurring" type="number" value="${businessSettings.recurringDiscount}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Cancellation Window (hours)</label><input class="form-input" id="sCancel" type="number" value="${businessSettings.cancellationHours}"></div>
                <div class="form-group"><label class="form-label">Late Cancel Fee (%)</label><input class="form-input" id="sCancelFee" type="number" value="${businessSettings.cancellationFee}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Tax Rate (%)</label><input class="form-input" id="sTax" type="number" value="${businessSettings.taxRate}"></div>
                <div class="form-group"><label class="form-label">Max Bookings/Day</label><input class="form-input" id="sMaxBookings" type="number" value="${businessSettings.maxBookingsPerDay}"></div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="saveSettings()">Save Policies</button>
        </div>

        <!-- Services Builder -->
        <div class="card">
            <div class="card-header"><span class="card-title">Services (${services.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('service')">+ Add Service</button></div>
            <div class="table-wrap"><table>
                <thead><tr><th>Service</th><th>Category</th><th>Price</th><th>Duration</th><th>Active</th><th></th></tr></thead>
                <tbody>${services.map(s => `<tr>
                    <td><strong>${escHTML(s.name)}</strong><br><span style="font-size:.78rem;color:var(--text-muted)">${escHTML(s.description)}</span></td>
                    <td><span class="badge badge-completed">${escHTML(s.category)}</span></td>
                    <td><strong>${fmt(s.price)}</strong></td>
                    <td>${s.duration ? s.duration + ' min' : '—'}</td>
                    <td><button class="btn btn-sm ${s.active ? 'btn-success' : 'btn-ghost'}" onclick="toggleService('${s.id}')">${s.active ? 'ON' : 'OFF'}</button></td>
                    <td><button class="btn btn-ghost btn-sm" onclick="editService('${s.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deleteService('${s.id}')">✕</button></td>
                </tr>`).join('')}</tbody>
            </table></div>
        </div>

        <!-- Add-ons Builder -->
        <div class="card">
            <div class="card-header"><span class="card-title">Add-ons (${addons.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('addon')">+ Add Add-on</button></div>
            <div class="table-wrap"><table>
                <thead><tr><th>Add-on</th><th>Price</th><th>Description</th><th></th></tr></thead>
                <tbody>${addons.map(a => `<tr>
                    <td><strong>${escHTML(a.name)}</strong></td>
                    <td>${a.price > 0 ? fmt(a.price) : '<span style="color:var(--accent)">Free</span>'}</td>
                    <td style="font-size:.85rem;color:var(--text-muted)">${escHTML(a.description)}</td>
                    <td><button class="btn btn-ghost btn-sm" onclick="deleteAddon('${a.id}')">✕</button></td>
                </tr>`).join('')}</tbody>
            </table></div>
        </div>

        <!-- Packages Builder -->
        <div class="card">
            <div class="card-header"><span class="card-title">Packages (${packages.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('package')">+ Add Package</button></div>
            ${packages.map(p => {
                const baseService = services.find(s => s.id === p.services?.[0] || p.services?.includes(s.id));
                const basePrice = baseService ? baseService.price * p.visits : 0;
                const discounted = basePrice * (1 - p.discount / 100);
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
                    <div><strong>${escHTML(p.name)}</strong><br><span style="font-size:.82rem;color:var(--text-muted)">${escHTML(p.description)}</span></div>
                    <div style="text-align:right"><div style="font-size:1.1rem;font-weight:700;color:var(--primary)">${fmt(discounted)}</div><div style="font-size:.78rem;color:var(--text-muted);text-decoration:line-through">${fmt(basePrice)}</div><div style="font-size:.72rem;color:var(--accent)">${p.discount}% off · ${p.visits} visits</div></div>
                    <button class="btn btn-ghost btn-sm" onclick="deletePackage('${p.id}')">✕</button>
                </div>`;
            }).join('') || '<div class="empty">No packages</div>'}
        </div>

        <!-- Service Zones -->
        <div class="card">
            <div class="card-header"><span class="card-title">Service Zones (${zones.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('zone')">+ Add Zone</button></div>
            ${zones.map(z => `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
                <div><strong>${escHTML(z.name)}</strong><br><span style="font-size:.82rem;color:var(--text-muted)">${escHTML(z.areas)}</span></div>
                <div style="text-align:right"><span style="font-weight:700;color:${z.surcharge > 0 ? 'var(--primary)' : 'var(--accent)'}">${z.surcharge > 0 ? '+' + fmt(z.surcharge) : 'No surcharge'}</span></div>
                <button class="btn btn-ghost btn-sm" onclick="deleteZone('${z.id}')">✕</button>
            </div>`).join('')}
        </div>

        <!-- Danger -->
        <div class="card">
            <div class="card-title" style="margin-bottom:12px;color:var(--danger)">Danger Zone</div>
            <button class="btn btn-danger" onclick="if(confirm('Reset ALL data? This cannot be undone.')){Object.keys(localStorage).filter(k=>k.startsWith('gpc_')).forEach(k=>localStorage.removeItem(k));location.reload();}">Reset All Data</button>
        </div>
    `;
};

// ============================================
// SETTINGS ACTIONS
// ============================================
const saveSettings = () => {
    const v = (id) => document.getElementById(id)?.value || '';
    businessSettings = { ...businessSettings, name: v('sName'), phone: v('sPhone'), email: v('sEmail'), address: v('sAddress'), operatingHours: v('sHours'), operatingDays: v('sDays'), acceptedPayments: v('sPayments'), emergencyVet: v('sVet'), multiDogDiscount: parseInt(v('sMultiDog')) || 0, recurringDiscount: parseInt(v('sRecurring')) || 0, cancellationHours: parseInt(v('sCancel')) || 24, cancellationFee: parseInt(v('sCancelFee')) || 50, taxRate: parseFloat(v('sTax')) || 0, maxBookingsPerDay: parseInt(v('sMaxBookings')) || 8 };
    save('settings', businessSettings);
    alert('Settings saved!');
};

const toggleService = (id) => { const s = services.find(x => x.id === id); if (s) { s.active = !s.active; save('services', services); renderTab(); } };
const editService = (id) => {
    const s = services.find(x => x.id === id);
    if (!s) return;
    const cats = ['Walking', 'Visits', 'Daycare', 'Sitting', 'Specialty', 'Transport', 'Grooming', 'Training', 'Other'];
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal">
        <div class="modal-title">Edit Service: ${escHTML(s.name)}</div>
        <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="esName" value="${escHTML(s.name)}"></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Price ($)</label><input class="form-input" id="esPrice" type="number" step="0.01" value="${s.price}"></div><div class="form-group"><label class="form-label">Duration (min)</label><input class="form-input" id="esDuration" type="number" value="${s.duration || ''}"></div></div>
        <div class="form-group"><label class="form-label">Category</label><select class="form-select" id="esCat">${cats.map(c => `<option ${s.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="esDesc" value="${escHTML(s.description || '')}"></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditService('${s.id}')">Save</button></div>
    </div>`;
    overlay.classList.add('open');
};
const saveEditService = (id) => {
    const s = services.find(x => x.id === id);
    if (!s) return;
    s.name = document.getElementById('esName')?.value?.trim() || s.name;
    s.price = parseFloat(document.getElementById('esPrice')?.value) || s.price;
    s.duration = parseInt(document.getElementById('esDuration')?.value) || s.duration;
    s.category = document.getElementById('esCat')?.value || s.category;
    s.description = document.getElementById('esDesc')?.value?.trim() || s.description;
    save('services', services);
    closeModal();
    renderTab();
};
const deleteService = (id) => { if (!confirm('Delete service?')) return; services = services.filter(x => x.id !== id); save('services', services); renderTab(); };
const deleteAddon = (id) => { if (!confirm('Delete add-on?')) return; addons = addons.filter(x => x.id !== id); save('addons', addons); renderTab(); };
const deletePackage = (id) => { if (!confirm('Delete package?')) return; packages = packages.filter(x => x.id !== id); save('packages', packages); renderTab(); };
const deleteZone = (id) => { if (!confirm('Delete zone?')) return; zones = zones.filter(x => x.id !== id); save('zones', zones); renderTab(); };

// ============================================
// MODAL SYSTEM
// ============================================
const showModal = (type) => {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }

    const svcOptions = services.filter(s => s.active).map(s => `<option value="${escHTML(s.name)}" data-price="${s.price}">${escHTML(s.name)} (${fmt(s.price)})</option>`).join('');
    const addonChecks = addons.map(a => `<label style="display:flex;gap:6px;align-items:center;font-size:.88rem;cursor:pointer"><input type="checkbox" class="addon-check" value="${escHTML(a.name)}" data-price="${a.price}"> ${escHTML(a.name)} ${a.price > 0 ? fmt(a.price) : '(free)'}</label>`).join('');
    const zoneOptions = zones.map(z => `<option value="${escHTML(z.name)}">${escHTML(z.name)} ${z.surcharge > 0 ? '(+' + fmt(z.surcharge) + ')' : ''}</option>`).join('');
    const clientOptions = clients.map(c => `<option value="${c.id}">${escHTML(c.name)}</option>`).join('');
    const sitterOptions = sitters.map(s => `<option value="${escHTML(s.name)}">${escHTML(s.name)}</option>`).join('');
    const catOptions = ['Walking', 'Visits', 'Daycare', 'Sitting', 'Specialty', 'Transport', 'Grooming', 'Training', 'Other'].map(c => `<option>${c}</option>`).join('');

    const modals = {
        booking: { title: 'New Booking', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Client</label><select class="form-select" id="mClient" onchange="autofillClient(this.value)"><option value="">Select or type below</option>${clientOptions}</select></div><div class="form-group"><label class="form-label">Client Name</label><input class="form-input" id="mClientName"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mPetName"></div><div class="form-group"><label class="form-label">Extra Dogs</label><input class="form-input" id="mExtraDogs" type="number" value="0" min="0"></div></div>
            <div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService" onchange="updateBookingPrice()">${svcOptions}</select></div>
            <div class="form-group"><label class="form-label">Add-ons</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px" id="mAddons">${addonChecks}</div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Date</label><input class="form-input" id="mDate" type="date" value="${todayStr()}"></div><div class="form-group"><label class="form-label">Time</label><input class="form-input" id="mTime" type="time" value="10:00"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Zone</label><select class="form-select" id="mZone"><option value="">No zone</option>${zoneOptions}</select></div><div class="form-group"><label class="form-label">Sitter</label><select class="form-select" id="mSitter"><option value="">Auto-assign</option>${sitterOptions}</select></div></div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="mNotes" rows="2"></textarea></div>
            <div style="background:rgba(255,107,53,0.05);padding:12px;border-radius:8px;text-align:right"><span style="font-size:.85rem;color:var(--text-muted)">Estimated Total:</span> <strong style="font-size:1.3rem;color:var(--primary)" id="mPricePreview">${fmt(services[0]?.price || 0)}</strong></div>
        ` },
        client: { title: 'Add Client', body: `
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="mName"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="mEmail" type="email"></div><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="mPhone" type="tel"></div></div>
            <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="mAddress"></div>
            <div class="form-group"><label class="form-label">How did they find us?</label><select class="form-select" id="mSource"><option>Google</option><option>Instagram</option><option>Facebook</option><option>Referral</option><option>Nextdoor</option><option>Walk-in</option><option>Other</option></select></div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="mNotes" rows="2"></textarea></div>
        ` },
        pet: { title: 'Add Pet', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mName"></div><div class="form-group"><label class="form-label">Breed</label><input class="form-input" id="mBreed"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Age</label><input class="form-input" id="mAge" placeholder="e.g. 3 years"></div><div class="form-group"><label class="form-label">Weight</label><input class="form-input" id="mWeight" placeholder="e.g. 45 lbs"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Gender</label><select class="form-select" id="mGender"><option>Male</option><option>Female</option></select></div><div class="form-group"><label class="form-label">Spayed/Neutered</label><select class="form-select" id="mFixed"><option>Yes</option><option>No</option></select></div></div>
            <div class="form-group"><label class="form-label">Owner</label><select class="form-select" id="mOwner"><option value="">Select</option>${clientOptions}</select></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Vet Name & Phone</label><input class="form-input" id="mVet"></div><div class="form-group"><label class="form-label">Allergies</label><input class="form-input" id="mAllergies"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Medications</label><input class="form-input" id="mMeds"></div><div class="form-group"><label class="form-label">Feeding Schedule</label><input class="form-input" id="mFeeding" placeholder="e.g. 1 cup AM, 1 cup PM"></div></div>
            <div class="form-group"><label class="form-label">Temperament Tags</label><input class="form-input" id="mTags" placeholder="e.g. friendly, leash reactive, food motivated"></div>
            <div class="form-group"><label class="form-label">Preferred Sitter</label><select class="form-select" id="mPreferredSitter"><option value="">No preference</option>${sitterOptions}</select></div>
            <div style="margin:12px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Grooming Preferences</div>
            <div class="form-row"><div class="form-group"><label class="form-label">Coat Type</label><select class="form-select" id="mCoat"><option>Short</option><option>Medium</option><option>Long</option><option>Wire/Rough</option><option>Curly</option><option>Double Coat</option><option>Hairless</option></select></div><div class="form-group"><label class="form-label">Grooming Frequency</label><select class="form-select" id="mGroomFreq"><option>Monthly</option><option>Every 2 weeks</option><option>Weekly</option><option>Every 6 weeks</option><option>As needed</option></select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Shampoo Preference</label><select class="form-select" id="mShampoo"><option>Standard</option><option>Hypoallergenic</option><option>Oatmeal</option><option>Medicated</option><option>De-shedding</option><option>Whitening</option><option>Owner provides</option></select></div><div class="form-group"><label class="form-label">Grooming Notes</label><input class="form-input" id="mGroomNotes" placeholder="e.g. Sensitive ears, hates dryer, matting prone"></div></div>
            <div class="form-group"><label class="form-label">Special Notes</label><textarea class="form-textarea" id="mNotes" rows="2" placeholder="Fears, quirks, commands they know..."></textarea></div>
        ` },
        review: { title: 'Add Review', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Client Name</label><input class="form-input" id="mName"></div><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mPet"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Stars</label><select class="form-select" id="mStars"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div></div>
            <div class="form-group"><label class="form-label">Review</label><textarea class="form-textarea" id="mText" rows="3"></textarea></div>
        ` },
        sitter: { title: 'Add Sitter', body: `
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="mName"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="mPhone"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="mEmail"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Rate ($/hr)</label><input class="form-input" id="mRate" type="number" value="25"></div><div class="form-group"><label class="form-label">Max Dogs</label><input class="form-input" id="mMaxDogs" type="number" value="3"></div></div>
            <div class="form-group"><label class="form-label">Specialty</label><input class="form-input" id="mSpecialty" placeholder="e.g. Large breeds, puppies, senior dogs"></div>
            <div class="form-group"><label class="form-label">Certifications</label><input class="form-input" id="mCerts" placeholder="e.g. Pet First Aid, CPR"></div>
            <div class="form-group"><label class="form-label">Availability</label><input class="form-input" id="mAvail" value="Mon-Sun"></div>
            <div class="form-group"><label class="form-label">Bio</label><textarea class="form-textarea" id="mBio" rows="2"></textarea></div>
        ` },
        service: { title: 'Add Service', body: `
            <div class="form-group"><label class="form-label">Service Name</label><input class="form-input" id="mName"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Price ($)</label><input class="form-input" id="mPrice" type="number" step="0.01"></div><div class="form-group"><label class="form-label">Duration (min)</label><input class="form-input" id="mDuration" type="number"></div></div>
            <div class="form-group"><label class="form-label">Category</label><select class="form-select" id="mCategory">${catOptions}</select></div>
            <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="mDesc"></div>
        ` },
        addon: { title: 'Add Add-on', body: `
            <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="mName"></div>
            <div class="form-group"><label class="form-label">Price (0 = free)</label><input class="form-input" id="mPrice" type="number" step="0.01" value="0"></div>
            <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="mDesc"></div>
        ` },
        package: { title: 'Add Package', body: `
            <div class="form-group"><label class="form-label">Package Name</label><input class="form-input" id="mName"></div>
            <div class="form-row"><div class="form-group"><label class="form-label"># Visits</label><input class="form-input" id="mVisits" type="number" value="5"></div><div class="form-group"><label class="form-label">Discount (%)</label><input class="form-input" id="mDiscount" type="number" value="10"></div></div>
            <div class="form-group"><label class="form-label">Base Service</label><select class="form-select" id="mBaseService">${svcOptions}</select></div>
            <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="mDesc"></div>
        ` },
        zone: { title: 'Add Zone', body: `
            <div class="form-group"><label class="form-label">Zone Name</label><input class="form-input" id="mName" placeholder="e.g. Zone 4 — Far West"></div>
            <div class="form-group"><label class="form-label">Areas Covered</label><input class="form-input" id="mAreas" placeholder="e.g. Goochland, Powhatan"></div>
            <div class="form-group"><label class="form-label">Surcharge ($)</label><input class="form-input" id="mSurcharge" type="number" step="0.01" value="0"></div>
        ` },
        property: { title: 'Add Property', body: `
            <div class="form-group"><label class="form-label">Property Name</label><input class="form-input" id="mName" placeholder="e.g. Main House"></div>
            <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="mAddress" placeholder="Full address"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Max Dogs</label><input class="form-input" id="mCapacity" type="number" value="4"></div><div class="form-group"><label class="form-label">Features</label><input class="form-input" id="mFeatures" placeholder="e.g. Fenced yard, crates"></div></div>
            <div class="form-group"><label class="form-label">Assigned Sitters</label><div style="display:flex;gap:6px;flex-wrap:wrap">${sitters.map(s => `<label style="display:flex;gap:4px;align-items:center;font-size:.88rem"><input type="checkbox" class="prop-sitter" value="${escHTML(s.name)}"> ${escHTML(s.name)}</label>`).join('')}</div></div>
            <div class="form-group"><label class="form-label">Notes</label><input class="form-input" id="mNotes"></div>
        ` },
        expense: { title: 'Add Business Expense', body: `
            <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="mDesc" placeholder="e.g. Dog treats, gas, leashes"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Amount</label><input class="form-input" id="mAmount" type="number" step="0.01"></div><div class="form-group"><label class="form-label">Date</label><input class="form-input" id="mDate" type="date" value="${todayStr()}"></div></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Category</label><select class="form-select" id="mCategory"><option>Supplies</option><option>Gas/Mileage</option><option>Insurance</option><option>Phone/Internet</option><option>Marketing</option><option>Equipment</option><option>Food/Treats</option><option>Vet/Medical</option><option>Software</option><option>Training</option><option>Uniforms</option><option>Vehicle</option><option>Office</option><option>Other</option></select></div>
                <div class="form-group"><label class="form-label">Payment Method</label><select class="form-select" id="mMethod"><option>Cash</option><option>Debit</option><option>Credit</option><option>Venmo</option><option>Zelle</option></select></div>
            </div>
            <div class="form-group"><label class="form-label">Notes / Receipt #</label><input class="form-input" id="mNotes" placeholder="Optional"></div>
            <div style="padding:10px;background:rgba(0,184,148,.05);border-radius:8px;font-size:.82rem;color:var(--text-muted);margin-top:8px">Track all business expenses for tax deductions. Gas, supplies, insurance, phone — all deductible for self-employed dog sitters.</div>
        ` },
        manual_payment: { title: 'Record Cash/Manual Payment', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Client Name</label><input class="form-input" id="mClientName"></div><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Amount</label><input class="form-input" id="mAmount" type="number" step="0.01"></div><div class="form-group"><label class="form-label">Tip</label><input class="form-input" id="mTip" type="number" step="0.01" value="0"></div></div>
            <div class="form-group"><label class="form-label">Payment Method</label><select class="form-select" id="mMethod"><option>Cash</option><option>Venmo</option><option>Zelle</option><option>CashApp</option><option>Check</option><option>Card (manual)</option></select></div>
            <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="mDate" type="date" value="${todayStr()}"></div>
        ` },
        checkin: { title: 'Check In Dog', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mPetName"></div><div class="form-group"><label class="form-label">Owner Name</label><input class="form-input" id="mOwnerName"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div><div class="form-group"><label class="form-label">Owner Phone</label><input class="form-input" id="mPhone" type="tel"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Location</label><select class="form-select" id="mProperty">${(load('properties',[])).map(p => `<option>${escHTML(p.name)} — ${escHTML(p.address)}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">Assigned Sitter</label><select class="form-select" id="mSitter"><option value="">Auto</option>${sitterOptions}</select></div></div>
            <div style="margin:12px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Drop-Off Checklist</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px" id="mChecklist">
                ${['Leash', 'Collar with ID', 'Food (bag/container)', 'Food bowl', 'Water bowl', 'Treats', 'Medications', 'Favorite toy', 'Bed/blanket', 'Crate', 'Harness', 'Poop bags', 'Jacket/sweater', 'Vaccination records'].map(item => `<label style="display:flex;gap:6px;align-items:center;font-size:.85rem;cursor:pointer"><input type="checkbox" class="checklist-item" value="${item}"> ${item}</label>`).join('')}
            </div>
            <div class="form-group"><label class="form-label">Other Belongings</label><input class="form-input" id="mBelongings" placeholder="e.g. Kong toy, blue leash, medication in ziplock"></div>
            <div class="form-group"><label class="form-label">Special Instructions</label><textarea class="form-textarea" id="mInstructions" rows="2" placeholder="e.g. Takes medication at 2pm with food, afraid of thunder..."></textarea></div>
            <div class="form-group"><label class="form-label">Owner Notes</label><textarea class="form-textarea" id="mNotes" rows="2" placeholder="Anything else the owner mentioned..."></textarea></div>
        ` },
        photo: { title: 'Add Photo', body: `
            <div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mPetName" placeholder="Which dog?"></div>
            <div class="form-group"><label class="form-label">Photo URL (or paste image link)</label><input class="form-input" id="mUrl" placeholder="https://... or local file path"></div>
            <div class="form-group"><label class="form-label">Or upload from device</label><input type="file" id="mFile" accept="image/*" class="form-input" onchange="previewUpload(this)"></div>
            <div id="mPreview" style="margin:8px 0;text-align:center"></div>
            <div class="form-group"><label class="form-label">Caption</label><input class="form-input" id="mCaption" placeholder="e.g. Max enjoying his walk!"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Activity</label><select class="form-select" id="mActivity"><option>Walk</option><option>Play</option><option>Nap</option><option>Eating</option><option>Training</option><option>Cuddle</option><option>Outdoor</option><option>Grooming</option><option>Other</option></select></div>
                <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="mDate" type="date" value="${todayStr()}"></div>
            </div>
        ` },
        message: { title: 'Send Message', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">From</label><input class="form-input" id="mFrom" value="GenusPupClub"></div><div class="form-group"><label class="form-label">To (Owner Name)</label><input class="form-input" id="mTo"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Regarding Pet</label><input class="form-input" id="mPet"></div><div class="form-group"><label class="form-label">Type</label><select class="form-select" id="mType"><option value="update">Visit Update</option><option value="booking">Booking</option><option value="reminder">Reminder</option><option value="general">General</option></select></div></div>
            <div class="form-group"><label class="form-label">Message</label><textarea class="form-textarea" id="mText" rows="4" placeholder="Hi! Just wanted to let you know..."></textarea></div>
            <div style="margin-top:8px">
                <div style="font-size:.82rem;font-weight:600;margin-bottom:6px">Quick Templates:</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('mText').value='Hi! Just wanted to send a quick update — your pup is having a great time! They ate well, got plenty of exercise, and are in great spirits. Will send photos shortly!'">Visit Update</button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('mText').value='Hi! This is a reminder about your upcoming booking tomorrow. Please have your pup ready with their leash, food, and any medications. See you soon!'">Booking Reminder</button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('mText').value='Your pup is all checked out and ready for pickup! Everything went great today. See you next time!'">Check-Out Ready</button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('mText').value='Hi! Just a heads up — your pup had a wonderful walk today. We covered about 1.5 miles and they were very well-behaved. Photos attached!'">Walk Complete</button>
                </div>
            </div>
        ` },
    };

    const m = modals[type];
    if (!m) return;
    overlay.innerHTML = `<div class="modal"><div class="modal-title">${m.title}</div>${m.body}<div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveModal('${type}')">Save</button></div></div>`;
    overlay.classList.add('open');
};

const closeModal = () => { document.getElementById('modalOverlay')?.classList.remove('open'); };

const autofillClient = (clientId) => {
    const c = clients.find(x => x.id === clientId);
    if (c) {
        document.getElementById('mClientName').value = c.name;
        const pet = pets.find(p => p.clientId === c.id);
        if (pet) document.getElementById('mPetName').value = pet.name;
    }
};

const updateBookingPrice = () => {
    const svc = services.find(s => s.name === document.getElementById('mService')?.value);
    let total = svc?.price || 0;
    document.querySelectorAll('.addon-check:checked').forEach(cb => { total += parseFloat(cb.dataset.price) || 0; });
    const preview = document.getElementById('mPricePreview');
    if (preview) preview.textContent = fmt(total);
};

// Wire addon checkboxes to price update
document.addEventListener('change', (e) => { if (e.target.classList.contains('addon-check')) updateBookingPrice(); });

const saveModal = (type) => {
    const v = (id) => document.getElementById(id)?.value?.trim() || '';

    if (type === 'booking') {
        const selectedAddons = [...document.querySelectorAll('.addon-check:checked')].map(cb => cb.value);
        const svc = services.find(s => s.name === v('mService'));
        const clientId = v('mClient') || null;
        bookings.push({ id: uid(), clientId, clientName: v('mClientName'), petName: v('mPetName'), service: v('mService'), amount: svc?.price || 0, addons: selectedAddons, extraDogs: parseInt(v('mExtraDogs')) || 0, date: v('mDate'), time: v('mTime'), zone: v('mZone'), sitter: v('mSitter'), notes: v('mNotes'), status: 'pending' });
        save('bookings', bookings);
    } else if (type === 'client') {
        clients.push({ id: uid(), name: v('mName'), email: v('mEmail'), phone: v('mPhone'), address: v('mAddress'), source: v('mSource'), notes: v('mNotes') });
        save('clients', clients);
    } else if (type === 'pet') {
        pets.push({ id: uid(), name: v('mName'), breed: v('mBreed'), age: v('mAge'), weight: v('mWeight'), gender: v('mGender'), fixed: v('mFixed'), clientId: v('mOwner'), vet: v('mVet'), allergies: v('mAllergies'), medications: v('mMeds'), feedingSchedule: v('mFeeding'), tags: v('mTags'), notes: v('mNotes'), preferredSitter: v('mPreferredSitter'), coatType: v('mCoat'), groomFrequency: v('mGroomFreq'), shampoo: v('mShampoo'), groomNotes: v('mGroomNotes') });
        save('pets', pets);
    } else if (type === 'review') {
        reviews.push({ id: uid(), name: v('mName'), pet: v('mPet'), stars: parseInt(v('mStars')) || 5, text: v('mText'), service: v('mService'), date: todayStr() });
        save('reviews', reviews);
    } else if (type === 'sitter') {
        sitters.push({ id: uid(), name: v('mName'), phone: v('mPhone'), email: v('mEmail'), rate: parseFloat(v('mRate')) || 25, maxDogs: parseInt(v('mMaxDogs')) || 3, specialty: v('mSpecialty'), certifications: v('mCerts'), availability: v('mAvail'), bio: v('mBio'), status: 'active' });
        save('sitters', sitters);
    } else if (type === 'service') {
        services.push({ id: uid(), name: v('mName'), price: parseFloat(v('mPrice')) || 0, duration: parseInt(v('mDuration')) || 0, category: v('mCategory'), description: v('mDesc'), active: true });
        save('services', services);
    } else if (type === 'addon') {
        addons.push({ id: uid(), name: v('mName'), price: parseFloat(v('mPrice')) || 0, description: v('mDesc') });
        save('addons', addons);
    } else if (type === 'package') {
        packages.push({ id: uid(), name: v('mName'), services: [v('mBaseService')], visits: parseInt(v('mVisits')) || 5, discount: parseInt(v('mDiscount')) || 10, description: v('mDesc') });
        save('packages', packages);
    } else if (type === 'zone') {
        zones.push({ id: uid(), name: v('mName'), areas: v('mAreas'), surcharge: parseFloat(v('mSurcharge')) || 0 });
        save('zones', zones);
    } else if (type === 'property') {
        properties = load('properties', []);
        properties.push({ id: uid(), name: v('mName'), address: v('mAddress'), capacity: parseInt(v('mCapacity')) || 4, features: v('mFeatures'), notes: v('mNotes'), assignedSitters: [...document.querySelectorAll('.prop-sitter:checked')].map(cb => cb.value) });
        save('properties', properties);
    } else if (type === 'expense') {
        expenses = load('expenses', []);
        expenses.push({ id: uid(), description: v('mDesc'), amount: parseFloat(v('mAmount')) || 0, date: v('mDate'), category: v('mCategory'), method: v('mMethod'), notes: v('mNotes') });
        save('expenses', expenses);
    } else if (type === 'manual_payment') {
        const payments = load('payments', []);
        payments.push({
            id: uid(), clientId: '', clientName: v('mClientName'), service: v('mService'),
            amount: parseFloat(v('mAmount')) || 0, tip: parseFloat(v('mTip')) || 0,
            method: v('mMethod'), status: 'paid', date: v('mDate'), bookingId: ''
        });
        save('payments', payments);
    } else if (type === 'checkin') {
        const checklist = {};
        document.querySelectorAll('.checklist-item').forEach(cb => { checklist[cb.value] = cb.checked; });
        checkins.push({
            id: uid(), petName: v('mPetName'), ownerName: v('mOwnerName'), ownerPhone: v('mPhone'),
            service: v('mService'), property: v('mProperty'), sitter: v('mSitter'),
            checklist, belongings: v('mBelongings'),
            specialInstructions: v('mInstructions'), ownerNotes: v('mNotes'),
            checkInDate: todayStr(), checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            checkedOut: false
        });
        save('checkins', checkins);
    } else if (type === 'photo') {
        const fileInput = document.getElementById('mFile');
        let url = v('mUrl');
        // If file uploaded, use data URL
        if (!url && fileInput?.files?.[0]) {
            // File was handled by previewUpload, get from preview img
            const previewImg = document.querySelector('#mPreview img');
            if (previewImg) url = previewImg.src;
        }
        photos.push({ id: uid(), petName: v('mPetName'), url, caption: v('mCaption'), activity: v('mActivity'), date: v('mDate') });
        save('photos', photos);
    } else if (type === 'message') {
        messages.push({
            id: uid(), from: v('mFrom'), to: v('mTo'), pet: v('mPet'),
            type: v('mType'), text: v('mText'),
            date: todayStr(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
        save('messages', messages);
    }
    closeModal();
    renderTab();
};

// Photo upload preview
const previewUpload = (input) => {
    const preview = document.getElementById('mPreview');
    if (!preview || !input.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:200px;border-radius:8px">`;
        // Also set URL field to data URL
        const urlField = document.getElementById('mUrl');
        if (urlField) urlField.value = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
};

const updateBooking = (id, status) => {
    const b = bookings.find(x => x.id === id);
    if (!b) return;
    b.status = status;
    save('bookings', bookings);

    // Fire notifications
    if (typeof GPC_NOTIFY !== 'undefined') {
        if (status === 'confirmed') GPC_NOTIFY.onBookingConfirmed(b);
        if (status === 'completed') GPC_NOTIFY.onBookingCompleted(b);
    }

    // On complete: prompt for invoice + tip + rating
    if (status === 'completed') {
        showCompletionFlow(b);
    } else {
        renderTab();
    }
};

const showCompletionFlow = (booking) => {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }

    const tipPercents = [0, 15, 18, 20, 25, 30];
    const amt = parseFloat(booking.amount) || 0;

    overlay.innerHTML = `<div class="modal" style="max-width:500px">
        <div class="modal-title" style="color:var(--success)">✓ Visit Complete!</div>
        <div style="padding:12px;background:rgba(0,184,148,.05);border-radius:8px;margin-bottom:16px">
            <strong>${escHTML(booking.petName)}</strong> — ${escHTML(booking.service)} on ${booking.date}<br>
            <span style="font-size:.88rem;color:var(--text-muted)">Client: ${escHTML(booking.clientName)} · Sitter: ${escHTML(booking.sitter || 'Unassigned')}</span>
        </div>

        <div style="font-size:.92rem;font-weight:600;margin-bottom:8px">Payment (${fmt(amt)})</div>
        <div class="form-group"><label class="form-label">Payment Method</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${['Card', 'CashApp', 'Venmo', 'Zelle', 'Cash', 'Prepaid/Package'].map(m => `<button type="button" class="btn btn-sm btn-ghost cf-method" onclick="document.querySelectorAll('.cf-method').forEach(b=>{b.style.borderColor='';b.style.color=''});this.style.borderColor='var(--primary)';this.style.color='var(--primary)';document.getElementById('cfMethod').value='${m}'">${m}</button>`).join('')}
            </div>
            <input type="hidden" id="cfMethod" value="Cash">
        </div>

        <div style="font-size:.92rem;font-weight:600;margin:12px 0 8px">Tip</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            ${tipPercents.map(p => `<button type="button" class="btn btn-sm btn-ghost cf-tip" onclick="document.querySelectorAll('.cf-tip').forEach(b=>{b.style.borderColor='';b.style.color=''});this.style.borderColor='var(--primary)';this.style.color='var(--primary)';document.getElementById('cfTip').value='${(amt * p / 100).toFixed(2)}';document.getElementById('cfTipCustom').value='';updateCFTotal(${amt})">${p === 0 ? 'No tip' : p + '% (' + fmt(amt * p / 100) + ')'}</button>`).join('')}
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
            <span style="font-size:.85rem">Custom:</span>
            <input type="number" id="cfTipCustom" step="0.01" min="0" placeholder="$0.00" class="form-input" style="width:100px" oninput="document.getElementById('cfTip').value=this.value;document.querySelectorAll('.cf-tip').forEach(b=>{b.style.borderColor='';b.style.color=''});updateCFTotal(${amt})">
        </div>
        <input type="hidden" id="cfTip" value="0">
        <div style="padding:12px;background:rgba(255,107,53,.05);border-radius:8px;text-align:right;margin-bottom:16px">
            <span style="font-size:.88rem;color:var(--text-muted)">Service: ${fmt(amt)} + Tip: <strong id="cfTipDisplay">$0.00</strong> = </span>
            <strong style="font-size:1.3rem;color:var(--primary)" id="cfTotalDisplay">${fmt(amt)}</strong>
        </div>

        <div style="font-size:.92rem;font-weight:600;margin-bottom:8px">Client Rating</div>
        <div style="display:flex;gap:4px;margin-bottom:8px" id="cfStars">
            ${[1,2,3,4,5].map(s => `<button type="button" style="font-size:1.8rem;background:none;border:none;cursor:pointer;color:#ddd;transition:color .15s" onclick="setCFStars(${s})" data-star="${s}">★</button>`).join('')}
        </div>
        <input type="hidden" id="cfRating" value="5">
        <div class="form-group"><label class="form-label">Review (optional)</label><textarea class="form-textarea" id="cfReview" rows="2" placeholder="How was the visit?"></textarea></div>

        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal();renderTab()">Skip</button>
            <button class="btn btn-primary" onclick="saveCompletionFlow('${booking.id}')">Save & Close</button>
        </div>
    </div>`;
    overlay.classList.add('open');

    // Default to 5 stars
    setCFStars(5);
};

window.setCFStars = (n) => {
    document.getElementById('cfRating').value = n;
    document.querySelectorAll('#cfStars button').forEach(b => {
        b.style.color = parseInt(b.dataset.star) <= n ? '#FDCB6E' : '#ddd';
    });
};

window.updateCFTotal = (amt) => {
    const tip = parseFloat(document.getElementById('cfTip')?.value) || 0;
    document.getElementById('cfTipDisplay').textContent = fmt(tip);
    document.getElementById('cfTotalDisplay').textContent = fmt(amt + tip);
};

const saveCompletionFlow = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) { closeModal(); renderTab(); return; }

    const method = document.getElementById('cfMethod')?.value || 'Cash';
    const tip = parseFloat(document.getElementById('cfTip')?.value) || 0;
    const rating = parseInt(document.getElementById('cfRating')?.value) || 5;
    const reviewText = document.getElementById('cfReview')?.value?.trim() || '';
    const amt = parseFloat(booking.amount) || 0;

    // Record payment
    const payments = load('payments', []);
    payments.push({
        id: uid(), clientId: booking.clientId, clientName: booking.clientName, bookingId,
        amount: amt, tip, method, status: method === 'Cash' || method === 'Card' ? 'paid' : 'pending',
        service: booking.service, date: todayStr()
    });
    save('payments', payments);

    // Record review if provided
    if (reviewText || rating) {
        const allReviews = load('reviews', []);
        allReviews.push({ id: uid(), name: booking.clientName, pet: booking.petName, stars: rating, text: reviewText || `Great ${booking.service} experience!`, service: booking.service, sitter: booking.sitter, date: todayStr() });
        save('reviews', allReviews);
    }

    // Notify
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.onPaymentReceived({ ...booking, amount: amt, tip, method, clientName: booking.clientName });
        if (reviewText) GPC_NOTIFY.showToast('New Review', `${rating}★ from ${booking.clientName}`, 'success');
    }

    closeModal();
    renderTab();
};
const deleteItem = (col, id) => { if (!confirm('Delete?')) return; const map = { bookings, clients, pets, reviews, sitters, messages }; map[col] = map[col].filter(x => x.id !== id); if (col === 'bookings') bookings = map[col]; else if (col === 'clients') clients = map[col]; else if (col === 'pets') pets = map[col]; else if (col === 'reviews') reviews = map[col]; else if (col === 'sitters') sitters = map[col]; save(col, map[col]); renderTab(); };
const editClient = (id) => { /* TODO: edit modal */ };

// Init
renderTab();
// Notification bell
if (typeof GPC_NOTIFY !== 'undefined') {
    GPC_NOTIFY.renderBell('notifBell', 'admin');
    setInterval(() => GPC_NOTIFY.renderBell('notifBell', 'admin'), 10000);
}
