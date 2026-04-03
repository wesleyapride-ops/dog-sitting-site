// ============================================
// GenusPupClub Dashboard — Full Platform
// Ultra-customizable services, pricing, packages
// ============================================

const DB_KEY = 'gpc_';
const load = (key, fallback) => { try { const d = JSON.parse(localStorage.getItem(DB_KEY + key)); return d !== null ? d : fallback; } catch { return fallback; } };
const save = (key, data) => {
    localStorage.setItem(DB_KEY + key, JSON.stringify(data));
    // Cloud sync — fire-and-forget (non-blocking)
    if (typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected()) {
        GPC_SUPABASE.save(key, data).catch(() => {});
    }
};
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
    { id: 'taxi', name: 'Pet Taxi — One Way', price: 15, duration: 0, category: 'Transport', description: 'One-way transport to vet/groomer/daycare (per trip)', active: true },
    { id: 'taxiround', name: 'Pet Taxi — Round Trip', price: 25, duration: 0, category: 'Transport', description: 'Pickup from home + drop at destination + return home', active: true },
    { id: 'taxiwait', name: 'Pet Taxi + Wait', price: 35, duration: 0, category: 'Transport', description: 'Transport + wait at appointment + return home', active: true },
    { id: 'taxidaycare', name: 'Daycare Shuttle', price: 20, duration: 0, category: 'Transport', description: 'Daily pickup & dropoff for daycare (round trip)', active: true },
    { id: 'taxiweekly', name: 'Weekly Shuttle Pass', price: 75, duration: 0, category: 'Transport', description: '5-day daycare shuttle pass (Mon-Fri pickup & dropoff)', active: true },
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

    const views = { overview: renderOverview, bookings: renderBookings, clients: renderClients, pets: renderPets, schedule: renderSchedule, revenue: renderRevenue, payments: renderPaymentsAdmin, reviews: renderReviews, sitters: renderSitters, properties: renderProperties, checkin: renderCheckIn, gallery: renderGallery, messages: renderMessages, loyalty: renderLoyalty, waivers: renderWaivers, infamy: renderInfamy, website: renderWebsiteEditor, settings: renderSettings };
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
                        <div class="schedule-info"><h4>${escHTML(b.clientName)} — ${escHTML(b.petName)}</h4><p>${escHTML(b.service)} ${b.dropoffTime ? `<span style="font-size:.78rem;color:var(--text-muted)">Drop: ${b.dropoffTime}</span>` : ''} ${b.pickupTime ? `<span style="font-size:.78rem;color:var(--text-muted)">Pick: ${b.pickupTime}</span>` : ''} ${b.addons?.length ? `+ ${b.addons.length} add-on${b.addons.length > 1 ? 's' : ''}` : ''} <span class="badge badge-${b.status}">${b.status}</span> <strong>${fmt(calcBookingTotal(b))}</strong></p></div>
                    </div>
                `).join('') : '<div class="empty"><div class="empty-icon">📅</div><p>No bookings today</p></div>'}
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">Recent Reviews</span></div>
                ${reviews.slice(0, 3).map(r => `<div class="review-item"><div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div><div class="review-text">"${escHTML(r.text)}"</div><div class="review-author">${escHTML(r.name)} — ${escHTML(r.pet)}</div></div>`).join('')}
            </div>
        </div>
        <!-- Quick Actions -->
        <div class="card" style="margin-bottom:16px">
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-primary btn-sm" onclick="showModal('booking')">+ New Booking</button>
                <button class="btn btn-sm btn-ghost" onclick="showModal('checkin')">+ Check In Dog</button>
                <a href="report-card.html" target="_blank" class="btn btn-sm btn-ghost" style="text-decoration:none">+ Report Card</a>
                <button class="btn btn-sm btn-ghost" onclick="showModal('manual_payment')">+ Record Payment</button>
                <a href="waiver.html" target="_blank" class="btn btn-sm btn-ghost" style="text-decoration:none">Send Waiver</a>
                <button class="btn btn-sm btn-ghost" onclick="showModal('recurring')">+ Recurring Booking</button>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">Upcoming Bookings</span></div>
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
        <thead><tr><th>Dates</th><th>Time</th><th>Drop-Off</th><th>Pick-Up</th><th>Client</th><th>Pet</th><th>Service</th><th>Add-ons</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>${items.length ? items.map(b => `<tr>
            <td>${b.date}${b.endDate ? `<br><span style="font-size:.72rem;color:var(--text-muted)">→ ${b.endDate}</span>` : ''}</td><td>${b.time || '—'}</td><td style="font-size:.82rem">${b.dropoffTime ? b.dropoffTime.replace('T', '<br>') : '—'}</td><td style="font-size:.82rem">${b.pickupTime ? b.pickupTime.replace('T', '<br>') : '—'}</td><td>${escHTML(b.clientName)}</td><td>${escHTML(b.petName)}</td>
            <td>${escHTML(b.service)}${b.pickupAddr ? `<br><span style="font-size:.72rem;color:var(--text-muted)">From: ${escHTML(b.pickupAddr)}</span>` : ''}</td>
            <td>${b.addons?.length ? b.addons.map(a => `<span class="badge badge-completed">${escHTML(a)}</span>`).join(' ') : '—'}</td>
            <td><strong>${fmt(calcBookingTotal(b))}</strong></td>
            <td><span class="badge badge-${b.status}">${b.status}</span></td>
            <td style="white-space:nowrap">
                ${b.status === 'pending' ? `<button class="btn btn-ghost btn-sm" onclick="updateBooking('${b.id}','confirmed')">✓</button>` : ''}
                ${b.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" onclick="updateBooking('${b.id}','completed')">Done</button>` : ''}
                <button class="btn btn-ghost btn-sm" onclick="editBooking('${b.id}')">✎</button>
                <button class="btn btn-ghost btn-sm" onclick="deleteItem('bookings','${b.id}')">✕</button>
            </td>
        </tr>`).join('') : '<tr><td colspan="11" class="empty">No bookings</td></tr>'}</tbody>
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
                        <td style="display:flex;align-items:center;gap:8px">${c.photo ? `<img src="${c.photo}" style="width:32px;height:32px;object-fit:cover;border-radius:50%;flex-shrink:0">` : `<div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;flex-shrink:0">${(c.name || '?').charAt(0)}</div>`}<strong>${escHTML(c.name)}</strong></td><td>${escHTML(c.email)}</td><td>${escHTML(c.phone)}</td><td>${escHTML(c.address)}</td>
                        <td>${cPets.length ? cPets.map(p => `<span class="badge badge-confirmed">${escHTML(p.name)}</span>`).join(' ') : '—'} <span style="font-size:.72rem;color:var(--text-muted)">(${cPets.length})</span></td><td>${cBookings.length}</td><td><strong>${fmt(spent)}</strong></td>
                        <td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" title="Add pet for this client" onclick="addPetForClient('${c.id}','${escHTML(c.name)}')">+🐕</button> <button class="btn btn-ghost btn-sm" onclick="editClient('${c.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deleteItem('clients','${c.id}')">✕</button></td>
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
                <div class="pet-avatar">${p.photo ? `<img src="${p.photo}" style="width:48px;height:48px;object-fit:cover;border-radius:50%">` : '🐕'}</div>
                <div class="pet-info" style="flex:1">
                    <h4>${escHTML(p.name)} <span style="float:right"><button class="btn btn-ghost btn-sm" onclick="editPet('${p.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deleteItem('pets','${p.id}')">✕</button></span></h4>
                    <p>${escHTML(p.breed || '?')} · ${escHTML(p.age || '?')} · ${escHTML(p.weight || '?')} · ${p.gender === 'Female' ? '♀' : '♂'} ${escHTML(p.gender || '?')} · ${p.fixed === 'Yes' ? '✓ Fixed' : '✗ Intact'}</p>
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
                    <div class="schedule-info"><h4>${escHTML(b.clientName)} — ${escHTML(b.petName)}</h4><p>${escHTML(b.service)} ${b.dropoffTime ? `<span style="font-size:.78rem;color:var(--text-muted)">Drop: ${b.dropoffTime}</span>` : ''} ${b.pickupTime ? `<span style="font-size:.78rem;color:var(--text-muted)">Pick: ${b.pickupTime}</span>` : ''} <span class="badge badge-${b.status}">${b.status}</span> <strong>${fmt(calcBookingTotal(b))}</strong></p></div></div>
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
            ${reviews.map(r => `<div class="review-item"><div style="display:flex;justify-content:space-between"><div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div><span style="font-size:.78rem;color:var(--text-muted)">${r.date || ''} · ${escHTML(r.service || '')}</span></div><div class="review-text">"${escHTML(r.text)}"</div><div class="review-author">${escHTML(r.name)} — ${escHTML(r.pet)} <button class="btn btn-ghost btn-sm" onclick="editReview('${r.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deleteItem('reviews','${r.id}')">✕</button></div></div>`).join('') || '<div class="empty">No reviews</div>'}
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
                            <h4 style="margin-bottom:4px">${escHTML(c.petName)} <span style="font-size:.82rem;color:var(--text-muted)">(${escHTML(c.ownerName)})</span> ${c.walkIn ? '<span class="badge badge-pending">Walk-In</span>' : '<span class="badge badge-confirmed">Booked</span>'}</h4>
                            <div style="font-size:.82rem;color:var(--text-light)">Drop-off: ${c.dropoffTime || c.checkInTime} on ${c.checkInDate}${c.expectedPickup ? ` · Expected pick-up: ${c.expectedPickup}` : ''}</div>
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
    // Mark linked booking as completed
    if (c.bookingId) {
        const bk = bookings.find(x => x.id === c.bookingId);
        if (bk) { bk.status = 'completed'; save('bookings', bookings); }
    }
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
// LOYALTY & REFERRALS (Admin)
// ============================================
const renderLoyalty = () => {
    if (typeof GPC_LOYALTY !== 'undefined') {
        el.innerHTML = GPC_LOYALTY.renderAdminPanel();
    } else {
        el.innerHTML = '<div class="card"><div class="empty"><p>Loyalty module not loaded</p></div></div>';
    }
};

// ============================================
// WAIVERS (Admin View)
// ============================================
const renderWaivers = () => {
    const waivers = load('waivers', []);
    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card green"><div class="stat-label">Signed Waivers</div><div class="stat-value">${waivers.length}</div></div>
        </div>
        <div class="card" style="margin-bottom:12px">
            <div class="card-header">
                <span class="card-title">Waiver Link</span>
            </div>
            <div style="padding:12px;background:rgba(255,107,53,.05);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
                <code style="font-size:.88rem">genuspupclub.com/waiver.html</code>
                <button class="btn btn-sm btn-primary" onclick="navigator.clipboard?.writeText(window.location.origin+'/waiver.html');alert('Link copied!')">Copy Link</button>
            </div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-top:8px">Send this link to new clients before their first visit. They fill in pet info, acknowledge terms, and sign digitally.</p>
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">Signed Waivers (${waivers.length})</span></div>
            ${waivers.length ? `<div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Owner</th><th>Dog</th><th>Breed</th><th>Vax</th><th>Photo OK</th><th>Email</th><th>Phone</th></tr></thead>
                <tbody>${waivers.slice().reverse().map(w => `<tr>
                    <td>${w.signedDate}</td>
                    <td><strong>${escHTML(w.ownerName)}</strong><br><span style="font-size:.72rem;color:var(--text-muted)">Signed: ${escHTML(w.signature)}</span></td>
                    <td><strong>${escHTML(w.dogName)}</strong></td>
                    <td>${escHTML(w.breed)}</td>
                    <td><span class="badge badge-${w.vaccination === 'Up to date' ? 'confirmed' : 'pending'}">${escHTML(w.vaccination)}</span></td>
                    <td>${w.photoConsent ? '<span class="badge badge-confirmed">Yes</span>' : '<span class="badge badge-cancelled">No</span>'}</td>
                    <td style="font-size:.82rem">${escHTML(w.email)}</td>
                    <td style="font-size:.82rem">${escHTML(w.phone)}</td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty"><p>No waivers signed yet. Send the waiver link to clients.</p></div>'}
        </div>
    `;
};

// ============================================
// INFAMY HALL (Problem Dogs & Incidents)
// ============================================
const renderInfamy = () => {
    let infamy = load('infamy', []);
    const severityColors = { low: 'var(--warning)', medium: '#E17055', high: 'var(--danger)', banned: '#1a1a1a' };
    const severityLabels = { low: 'Caution', medium: 'Problem', high: 'Serious', banned: 'BANNED' };

    el.innerHTML = `
        <div class="card" style="margin-bottom:16px;border-left:4px solid var(--danger)">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div class="card-title">⚠️ Infamy Hall — Problem Dogs & Incidents</div>
                    <p style="font-size:.82rem;color:var(--text-muted);margin-top:4px">Track dogs with behavioral issues, incidents, owner problems. Keeps the team safe.</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="showModal('infamy')">+ Add Entry</button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card" style="border-left-color:var(--warning)"><div class="stat-label">Caution</div><div class="stat-value">${infamy.filter(i => i.severity === 'low').length}</div></div>
            <div class="stat-card" style="border-left-color:#E17055"><div class="stat-label">Problem</div><div class="stat-value">${infamy.filter(i => i.severity === 'medium').length}</div></div>
            <div class="stat-card" style="border-left-color:var(--danger)"><div class="stat-label">Serious</div><div class="stat-value">${infamy.filter(i => i.severity === 'high').length}</div></div>
            <div class="stat-card" style="border-left-color:#1a1a1a"><div class="stat-label">Banned</div><div class="stat-value">${infamy.filter(i => i.severity === 'banned').length}</div></div>
        </div>

        ${infamy.length ? infamy.sort((a, b) => { const order = {banned:0,high:1,medium:2,low:3}; return (order[a.severity]||4) - (order[b.severity]||4); }).map(i => `
            <div class="card" style="margin-bottom:12px;border-left:4px solid ${severityColors[i.severity] || 'var(--border)'}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <h3 style="font-family:var(--font-display);font-size:1.05rem;margin-bottom:4px">🐕 ${escHTML(i.dogName)} <span class="badge" style="background:${severityColors[i.severity]}20;color:${severityColors[i.severity]}">${severityLabels[i.severity] || i.severity}</span></h3>
                        <div style="font-size:.85rem;color:var(--text-light)">Owner: <strong>${escHTML(i.ownerName)}</strong> · Breed: ${escHTML(i.breed || '?')}</div>
                    </div>
                    <div style="display:flex;gap:4px">
                        <button class="btn btn-ghost btn-sm" onclick="editInfamy('${i.id}')">✎</button>
                        <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteInfamy('${i.id}')">✕</button>
                    </div>
                </div>
                <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.85rem">
                    <div><strong>Issue Type:</strong> ${escHTML(i.issueType || '—')}</div>
                    <div><strong>Date Reported:</strong> ${i.dateReported || '—'}</div>
                </div>
                <div style="margin-top:8px;padding:10px;background:rgba(225,112,85,.03);border-radius:8px;font-size:.88rem;color:var(--text-light)">${escHTML(i.description)}</div>
                ${i.incidents?.length ? `<div style="margin-top:8px"><strong style="font-size:.82rem">Incident Log:</strong>${i.incidents.map(inc => `<div style="padding:4px 0;font-size:.82rem;color:var(--text-muted);border-bottom:1px solid rgba(0,0,0,.03)">${inc.date} — ${escHTML(inc.note)}</div>`).join('')}</div>` : ''}
                ${i.actionTaken ? `<div style="margin-top:6px;font-size:.82rem"><strong>Action Taken:</strong> ${escHTML(i.actionTaken)}</div>` : ''}
                ${i.staffNotes ? `<div style="margin-top:4px;font-size:.82rem;color:var(--text-muted)"><strong>Staff Notes:</strong> ${escHTML(i.staffNotes)}</div>` : ''}
                <div style="margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="addIncident('${i.id}')">+ Add Incident</button></div>
            </div>
        `).join('') : '<div class="card"><div class="empty"><div class="empty-icon">✓</div><p>No problem dogs! All good boys and girls.</p></div></div>'}
    `;
};

const deleteInfamy = (id) => { if (!confirm('Remove from infamy hall?')) return; let infamy = load('infamy', []); infamy = infamy.filter(x => x.id !== id); save('infamy', infamy); renderTab(); };

const addIncident = (id) => {
    const note = prompt('Describe the incident:');
    if (!note) return;
    const infamy = load('infamy', []);
    const entry = infamy.find(x => x.id === id);
    if (entry) {
        if (!entry.incidents) entry.incidents = [];
        entry.incidents.push({ date: todayStr(), note });
        save('infamy', infamy); renderTab();
    }
};

const editInfamy = (id) => {
    const infamy = load('infamy', []);
    const i = infamy.find(x => x.id === id); if (!i) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit: ${escHTML(i.dogName)}</div>
        <div class="form-row"><div class="form-group"><label class="form-label">Dog Name</label><input class="form-input" id="eiDog" value="${escHTML(i.dogName)}"></div><div class="form-group"><label class="form-label">Owner</label><input class="form-input" id="eiOwner" value="${escHTML(i.ownerName)}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Breed</label><input class="form-input" id="eiBreed" value="${escHTML(i.breed || '')}"></div><div class="form-group"><label class="form-label">Severity</label><select class="form-select" id="eiSeverity"><option ${i.severity==='low'?'selected':''} value="low">Caution</option><option ${i.severity==='medium'?'selected':''} value="medium">Problem</option><option ${i.severity==='high'?'selected':''} value="high">Serious</option><option ${i.severity==='banned'?'selected':''} value="banned">BANNED</option></select></div></div>
        <div class="form-group"><label class="form-label">Issue Type</label><input class="form-input" id="eiType" value="${escHTML(i.issueType || '')}"></div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="eiDesc" rows="3">${escHTML(i.description || '')}</textarea></div>
        <div class="form-group"><label class="form-label">Action Taken</label><input class="form-input" id="eiAction" value="${escHTML(i.actionTaken || '')}"></div>
        <div class="form-group"><label class="form-label">Staff Notes</label><textarea class="form-textarea" id="eiNotes" rows="2">${escHTML(i.staffNotes || '')}</textarea></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditInfamy('${i.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};

const saveEditInfamy = (id) => {
    const infamy = load('infamy', []);
    const i = infamy.find(x => x.id === id); if (!i) return;
    i.dogName = document.getElementById('eiDog')?.value?.trim() || i.dogName;
    i.ownerName = document.getElementById('eiOwner')?.value?.trim() || i.ownerName;
    i.breed = document.getElementById('eiBreed')?.value?.trim() || '';
    i.severity = document.getElementById('eiSeverity')?.value || i.severity;
    i.issueType = document.getElementById('eiType')?.value?.trim() || '';
    i.description = document.getElementById('eiDesc')?.value?.trim() || '';
    i.actionTaken = document.getElementById('eiAction')?.value?.trim() || '';
    i.staffNotes = document.getElementById('eiNotes')?.value?.trim() || '';
    save('infamy', infamy); closeModal(); renderTab();
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

        <!-- Payment Handles -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Payment Handles</div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">These are shown to clients when they pay. Update anytime.</p>
            <div class="form-row">
                <div class="form-group"><label class="form-label">CashApp Tag</label><input class="form-input" id="sPayCashApp" value="${escHTML(businessSettings.cashAppHandle || '$m3lop3z')}"></div>
                <div class="form-group"><label class="form-label">Venmo Username</label><input class="form-input" id="sPayVenmo" value="${escHTML(businessSettings.venmoHandle || '@GenusPupClub')}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Zelle (email or phone)</label><input class="form-input" id="sPayZelle" value="${escHTML(businessSettings.zelleHandle || 'Genuspupclub@gmail.com')}"></div>
                <div class="form-group"><label class="form-label">Apple Pay (phone)</label><input class="form-input" id="sPayApple" value="${escHTML(businessSettings.applePayHandle || '(804) 258-3830')}"></div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="savePaymentHandles()">Save Payment Handles</button>
        </div>

        <!-- Staff Accounts -->
        <div class="card">
            <div class="card-header"><span class="card-title">Staff / Admin Accounts</span><button class="btn btn-primary btn-sm" onclick="showModal('staff_account')">+ Create Staff Login</button></div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">Master admin + employee logins. Employees access the dashboard with their assigned permissions.</p>
            <div class="table-wrap"><table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Linked Sitter</th><th>Permissions</th><th>Status</th><th></th></tr></thead>
                <tbody>
                    ${(() => {
                        const staffAccounts = load('staff_accounts', [{ id: 'master', name: 'Wesley (Owner)', email: 'genuspupclub@gmail.com', role: 'master', linkedSitter: 'Wesley', permissions: 'all', status: 'active', password: 'GenusPup2026!' }]);
                        if (!localStorage.getItem(DB_KEY + 'staff_accounts')) save('staff_accounts', staffAccounts);
                        return staffAccounts.map(sa => `<tr>
                            <td><strong>${escHTML(sa.name)}</strong>${sa.role === 'master' ? ' <span class="badge badge-confirmed">OWNER</span>' : ''}</td>
                            <td style="font-size:.85rem">${escHTML(sa.email)}</td>
                            <td><span class="badge badge-${sa.role === 'master' ? 'confirmed' : sa.role === 'admin' ? 'completed' : 'pending'}">${sa.role}</span></td>
                            <td>${escHTML(sa.linkedSitter || '—')}</td>
                            <td style="font-size:.78rem;max-width:150px;overflow:hidden;text-overflow:ellipsis">${sa.permissions === 'all' ? 'Full access' : escHTML(sa.permissions)}</td>
                            <td><span class="badge badge-${sa.status === 'active' ? 'confirmed' : 'cancelled'}">${sa.status}</span></td>
                            <td>
                                <button class="btn btn-ghost btn-sm" onclick="editStaffAccount('${sa.id}')">✎</button>
                                <button class="btn btn-ghost btn-sm" onclick="showStaffCreds('${sa.id}')">🔑</button>
                                ${sa.role !== 'master' ? `<button class="btn btn-ghost btn-sm" onclick="toggleStaffStatus('${sa.id}')">${sa.status === 'active' ? 'Disable' : 'Enable'}</button>
                                <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteStaffAccount('${sa.id}')">✕</button>` : ''}
                            </td>
                        </tr>`).join('');
                    })()}
                </tbody>
            </table></div>
        </div>

        <!-- Cloud Database (Supabase) -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Cloud Database (Supabase)</div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">Syncs all data across devices in real time. Without this, data only lives on this browser.</p>
            ${(() => {
                const sbCfg = typeof GPC_SUPABASE !== 'undefined' ? GPC_SUPABASE.getConfig() : {};
                const isConn = typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected();
                return `
                <div style="margin-bottom:12px;padding:12px;border-radius:8px;background:${isConn ? 'rgba(0,184,148,.06);border:1px solid rgba(0,184,148,.2)' : 'rgba(225,112,85,.06);border:1px solid rgba(225,112,85,.2)'}">
                    <strong style="color:${isConn ? 'var(--accent)' : 'var(--danger)'}">${isConn ? '✓ Connected to Supabase — data syncs across all devices' : '✕ Not connected — data only on this device (localStorage)'}</strong>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Supabase Project URL</label><input class="form-input" id="sSbUrl" value="${escHTML(sbCfg.url || '')}" placeholder="https://abc123.supabase.co"></div>
                    <div class="form-group"><label class="form-label">Anon (Public) Key</label><input class="form-input" id="sSbKey" value="${escHTML(sbCfg.anonKey || '')}" placeholder="eyJhbG..."></div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
                    <button class="btn btn-primary btn-sm" onclick="saveSupabaseConfig()">Save & Connect</button>
                    <button class="btn btn-sm btn-ghost" onclick="testSupabase()">Test Connection</button>
                    <button class="btn btn-sm btn-ghost" onclick="pushToCloud()">Push Local → Cloud</button>
                    <button class="btn btn-sm btn-ghost" onclick="pullFromCloud()">Pull Cloud → Local</button>
                    <button class="btn btn-sm btn-ghost" onclick="smartSyncCloud()">Smart Merge (First-Time Only)</button>
                </div>
                <div style="margin-top:12px;padding:10px;background:rgba(139,92,246,.04);border-radius:8px;font-size:.82rem;color:var(--text-muted)">
                    <strong>Setup:</strong> 1) Go to <a href="https://supabase.com" target="_blank" style="color:var(--primary)">supabase.com</a> → Create free project. 2) Go to SQL Editor → paste contents of <code>supabase-schema.sql</code> → Run. 3) Go to Settings → API → copy Project URL and anon public key here. 4) Click "Push Local → Cloud" to upload your existing data.
                </div>`;
            })()}
        </div>

        <!-- Email Configuration -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Email System (EmailJS)</div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">Sends real emails for bookings, confirmations, receipts, and messages. Free: 200 emails/month.</p>
            ${(() => {
                const emailCfg = load('email_config', { enabled: false, serviceId: '', publicKey: '', adminEmail: 'Genuspupclub@gmail.com', sendToAdmin: true, sendToClient: true });
                return `
                <div style="margin-bottom:12px;padding:12px;border-radius:8px;background:${emailCfg.enabled ? 'rgba(0,184,148,.06);border:1px solid rgba(0,184,148,.2)' : 'rgba(225,112,85,.06);border:1px solid rgba(225,112,85,.2)'}">
                    <strong style="color:${emailCfg.enabled ? 'var(--accent)' : 'var(--danger)'}">${emailCfg.enabled ? '✓ Email is ACTIVE' : '✕ Email is OFF — emails only logged to console'}</strong>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Enabled</label><select class="form-select" id="sEmailEnabled"><option value="true" ${emailCfg.enabled ? 'selected' : ''}>ON — Send real emails</option><option value="false" ${!emailCfg.enabled ? 'selected' : ''}>OFF — Console log only</option></select></div>
                    <div class="form-group"><label class="form-label">Admin Email (gets copies)</label><input class="form-input" id="sEmailAdmin" value="${escHTML(emailCfg.adminEmail || '')}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">EmailJS Service ID</label><input class="form-input" id="sEmailServiceId" value="${escHTML(emailCfg.serviceId || '')}" placeholder="e.g. service_abc123"></div>
                    <div class="form-group"><label class="form-label">EmailJS Public Key</label><input class="form-input" id="sEmailPublicKey" value="${escHTML(emailCfg.publicKey || '')}" placeholder="e.g. user_abc123xyz"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Send to Client</label><select class="form-select" id="sEmailClient"><option value="true" ${emailCfg.sendToClient !== false ? 'selected' : ''}>Yes</option><option value="false" ${emailCfg.sendToClient === false ? 'selected' : ''}>No</option></select></div>
                    <div class="form-group"><label class="form-label">Send Admin Copy</label><select class="form-select" id="sEmailAdminCopy"><option value="true" ${emailCfg.sendToAdmin !== false ? 'selected' : ''}>Yes</option><option value="false" ${emailCfg.sendToAdmin === false ? 'selected' : ''}>No</option></select></div>
                </div>
                <div style="display:flex;gap:8px;margin-top:8px">
                    <button class="btn btn-primary btn-sm" onclick="saveEmailConfig()">Save Email Config</button>
                    <button class="btn btn-sm btn-ghost" onclick="testEmail()">Send Test Email</button>
                </div>
                <div style="margin-top:12px;padding:10px;background:rgba(139,92,246,.04);border-radius:8px;font-size:.82rem;color:var(--text-muted)">
                    <strong>Setup:</strong> 1) Go to <a href="https://www.emailjs.com" target="_blank" style="color:var(--primary)">emailjs.com</a> → Sign up free. 2) Add an Email Service (connect your Gmail). 3) Create a template with variables: {{to_name}}, {{to_email}}, {{subject}}, {{message}}. Use "default_service" as template ID. 4) Copy your Service ID and Public Key here.
                </div>`;
            })()}
            ${(() => {
                const emailLog = load('email_log', []).slice(-20).reverse();
                return emailLog.length ? `
                <div style="margin-top:16px"><div style="font-size:.88rem;font-weight:600;margin-bottom:8px">Recent Emails (${emailLog.length})</div>
                <div class="table-wrap"><table>
                    <thead><tr><th>Date</th><th>Time</th><th>To</th><th>Subject</th><th>Status</th></tr></thead>
                    <tbody>${emailLog.map(e => `<tr>
                        <td style="font-size:.82rem">${e.date}</td><td style="font-size:.82rem">${e.time}</td>
                        <td style="font-size:.82rem">${escHTML(e.to)}</td>
                        <td style="font-size:.82rem">${escHTML(e.subject || '').substring(0,40)}</td>
                        <td><span class="badge badge-${e.status === 'sent' ? 'confirmed' : 'cancelled'}">${e.status}</span></td>
                    </tr>`).join('')}</tbody>
                </table></div></div>` : '';
            })()}
        </div>

        <!-- Manage Client Accounts -->
        <div class="card">
            <div class="card-header"><span class="card-title">Client Accounts (${load('users',[]).length})</span><button class="btn btn-primary btn-sm" onclick="showModal('client_account')">+ Create Account</button></div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">View, edit, and reset client login credentials. Passwords visible to admin for support purposes.</p>
            <div class="table-wrap"><table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Password</th><th>Joined</th><th>Pets</th><th></th></tr></thead>
                <tbody>${load('users',[]).map(u => {
                    const userPets = pets.filter(p => p.clientId === u.id);
                    return `<tr>
                    <td><strong>${escHTML(u.name)}</strong></td>
                    <td>${escHTML(u.email)}</td>
                    <td>${escHTML(u.phone || '—')}</td>
                    <td>
                        <span id="pass-${u.id}" style="font-family:monospace;font-size:.82rem;background:var(--bg-alt);padding:2px 8px;border-radius:4px">${u.plainPassword ? '••••••' : '<em style="color:var(--text-muted)">hashed</em>'}</span>
                        ${u.plainPassword ? `<button class="btn btn-ghost btn-sm" style="font-size:.7rem;padding:2px 6px" onclick="const el=document.getElementById('pass-${u.id}');el.textContent=el.textContent==='••••••'?'${escHTML(u.plainPassword)}':'••••••'">Show</button>` : ''}
                    </td>
                    <td style="font-size:.78rem;color:var(--text-muted)">${u.createdAt ? u.createdAt.substring(0,10) : '—'}</td>
                    <td>${userPets.length ? userPets.map(p => `<span class="badge badge-confirmed">${escHTML(p.name)}</span>`).join(' ') : '—'}</td>
                    <td style="white-space:nowrap">
                        <button class="btn btn-ghost btn-sm" onclick="editClientAccount('${u.id}')">✎</button>
                        <button class="btn btn-ghost btn-sm" onclick="resetClientPassword('${u.id}','${escHTML(u.name)}')">🔑</button>
                        <button class="btn btn-ghost btn-sm" onclick="emailClientCreds('${u.id}')">📧</button>
                        <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteClientAccount('${u.id}','${escHTML(u.name)}')">✕</button>
                    </td>
                </tr>`; }).join('') || '<tr><td colspan="7" class="empty">No client accounts</td></tr>'}</tbody>
            </table></div>
        </div>

        <!-- Data Management -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Data Management</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-sm btn-ghost" onclick="exportAllData()">Export All Data (JSON)</button>
                <button class="btn btn-sm btn-ghost" onclick="document.getElementById('importFile').click()">Import Data (JSON)</button>
                <input type="file" id="importFile" accept=".json" style="display:none" onchange="importData(this)">
                <button class="btn btn-sm btn-ghost" onclick="exportFinances()">Export Finances (CSV)</button>
            </div>
        </div>

        <!-- Excel / CSV Bulk Import -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Bulk Import (Excel / CSV)</div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">Upload a spreadsheet to bulk-add clients, pets, or bookings. Supports <strong>.csv</strong> and <strong>.xlsx</strong> files.</p>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">What are you importing?</label>
                    <select class="form-select" id="bulkImportType">
                        <option value="clients">Clients</option>
                        <option value="pets">Pets</option>
                        <option value="bookings">Bookings</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Upload File</label>
                    <input type="file" id="bulkImportFile" accept=".csv,.xlsx,.xls" class="form-input" style="padding:8px">
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn btn-primary btn-sm" onclick="processBulkImport()">Import</button>
                <button class="btn btn-sm btn-ghost" onclick="downloadTemplate()">Download Template</button>
            </div>
            <div id="bulkImportPreview" style="margin-top:12px"></div>
            <div style="margin-top:12px;padding:10px;background:rgba(139,92,246,.04);border-radius:8px;font-size:.82rem;color:var(--text-muted)">
                <strong>Column headers for Clients:</strong> name, email, phone, address, notes<br>
                <strong>Column headers for Pets:</strong> name, breed, age, weight, gender, fixed, ownerEmail, vet, allergies, medications, feeding, notes<br>
                <strong>Column headers for Bookings:</strong> clientName, clientEmail, petName, service, date, endDate, time, notes
            </div>
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
                    <td><button class="btn btn-ghost btn-sm" onclick="editAddon('${a.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deleteAddon('${a.id}')">✕</button></td>
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
                    <button class="btn btn-ghost btn-sm" onclick="editPackage('${p.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deletePackage('${p.id}')">✕</button>
                </div>`;
            }).join('') || '<div class="empty">No packages</div>'}
        </div>

        <!-- Service Zones -->
        <div class="card">
            <div class="card-header"><span class="card-title">Service Zones (${zones.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('zone')">+ Add Zone</button></div>
            ${zones.map(z => `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
                <div><strong>${escHTML(z.name)}</strong><br><span style="font-size:.82rem;color:var(--text-muted)">${escHTML(z.areas)}</span></div>
                <div style="text-align:right"><span style="font-weight:700;color:${z.surcharge > 0 ? 'var(--primary)' : 'var(--accent)'}">${z.surcharge > 0 ? '+' + fmt(z.surcharge) : 'No surcharge'}</span></div>
                <button class="btn btn-ghost btn-sm" onclick="editZone('${z.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deleteZone('${z.id}')">✕</button>
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
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Saved', 'Business settings updated', 'success');
};

const savePaymentHandles = () => {
    const v = (id) => document.getElementById(id)?.value || '';
    businessSettings.cashAppHandle = v('sPayCashApp');
    businessSettings.venmoHandle = v('sPayVenmo');
    businessSettings.zelleHandle = v('sPayZelle');
    businessSettings.applePayHandle = v('sPayApple');
    save('settings', businessSettings);
    // Also update the notification system handles
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.PAYMENT_HANDLES.cashapp.handle = v('sPayCashApp');
        GPC_NOTIFY.PAYMENT_HANDLES.cashapp.instructions = `Send to ${v('sPayCashApp')} on CashApp`;
        GPC_NOTIFY.PAYMENT_HANDLES.venmo.handle = v('sPayVenmo');
        GPC_NOTIFY.PAYMENT_HANDLES.venmo.instructions = `Send to ${v('sPayVenmo')} on Venmo`;
        GPC_NOTIFY.PAYMENT_HANDLES.zelle.handle = v('sPayZelle');
        GPC_NOTIFY.PAYMENT_HANDLES.zelle.instructions = `Send to ${v('sPayZelle')} via Zelle`;
        GPC_NOTIFY.PAYMENT_HANDLES.applepay.handle = v('sPayApple');
        GPC_NOTIFY.PAYMENT_HANDLES.applepay.instructions = `Apple Pay to ${v('sPayApple')}`;
    }
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Saved', 'Payment handles updated', 'success');
};

const saveAdminCreds = () => {
    const email = document.getElementById('sAdminEmail')?.value?.trim();
    const pass = document.getElementById('sAdminPass')?.value;
    if (!email || !pass) { alert('Email and password required'); return; }
    save('admin_creds', { email, password: pass });
    // Also update master staff account
    const staff = load('staff_accounts', []);
    const master = staff.find(s => s.role === 'master');
    if (master) { master.email = email; master.password = pass; save('staff_accounts', staff); }
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Saved', 'Admin credentials updated.', 'success');
};

// ---- Staff Account Management ----
const showStaffCreds = (id) => {
    const staff = load('staff_accounts', []);
    const sa = staff.find(s => s.id === id); if (!sa) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal" style="max-width:420px">
        <div class="modal-title">Login Credentials: ${escHTML(sa.name)}</div>
        <div style="background:#F8F9FA;border-radius:10px;padding:20px;text-align:center;margin-bottom:16px">
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px">Login Page</div>
            <div style="font-size:.88rem;font-weight:600;margin-bottom:12px">genuspupclub.com/admin-login.html</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px">Email</div>
            <div style="font-size:1rem;font-weight:700;margin-bottom:12px;font-family:monospace">${escHTML(sa.email)}</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px">Password</div>
            <div style="font-size:1rem;font-weight:700;font-family:monospace">${escHTML(sa.password)}</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:center">
            <button class="btn btn-sm btn-primary" onclick="navigator.clipboard?.writeText('Login: ${sa.email} / Password: ${sa.password} / URL: genuspupclub.com/admin-login.html');alert('Copied!')">Copy All</button>
            <button class="btn btn-sm btn-ghost" onclick="closeModal()">Close</button>
        </div>
    </div>`; overlay.classList.add('open');
};

const editStaffAccount = (id) => {
    const staff = load('staff_accounts', []);
    const sa = staff.find(s => s.id === id); if (!sa) return;
    const sitterOpts = sitters.map(s => `<option value="${escHTML(s.name)}" ${sa.linkedSitter === s.name ? 'selected' : ''}>${escHTML(s.name)}</option>`).join('');
    const perms = (sa.permissions === 'all') ? ['View Bookings','Edit Bookings','View Clients','View Pets','Check In/Out','Report Cards','View Schedule','Messages','View Payments','Photos'] : (sa.permissions || '').split(',').map(p => p.trim());
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit: ${escHTML(sa.name)}</div>
        <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="esaName" value="${escHTML(sa.name)}"></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="esaEmail" value="${escHTML(sa.email)}"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="esaPass" value="${escHTML(sa.password)}" style="font-family:monospace"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Role</label><select class="form-select" id="esaRole"><option value="employee" ${sa.role==='employee'?'selected':''}>Employee</option><option value="admin" ${sa.role==='admin'?'selected':''}>Admin</option><option value="viewer" ${sa.role==='viewer'?'selected':''}>Viewer</option>${sa.role==='master'?'<option value="master" selected>Master (Owner)</option>':''}</select></div><div class="form-group"><label class="form-label">Link to Sitter</label><select class="form-select" id="esaSitter"><option value="">None</option>${sitterOpts}</select></div></div>
        <div class="form-group"><label class="form-label">Permissions</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${['View Bookings','Edit Bookings','View Clients','View Pets','Check In/Out','Report Cards','View Schedule','Messages','View Payments','Photos'].map(p => `<label style="display:flex;gap:4px;align-items:center;font-size:.85rem"><input type="checkbox" class="esa-perm" value="${p}" ${perms.includes(p) ? 'checked' : ''}> ${p}</label>`).join('')}</div></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditStaff('${sa.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};

const saveEditStaff = (id) => {
    const staff = load('staff_accounts', []);
    const sa = staff.find(s => s.id === id); if (!sa) return;
    sa.name = document.getElementById('esaName')?.value?.trim() || sa.name;
    sa.email = document.getElementById('esaEmail')?.value?.trim() || sa.email;
    sa.password = document.getElementById('esaPass')?.value || sa.password;
    sa.role = document.getElementById('esaRole')?.value || sa.role;
    sa.linkedSitter = document.getElementById('esaSitter')?.value || '';
    const perms = [...document.querySelectorAll('.esa-perm:checked')].map(c => c.value);
    sa.permissions = sa.role === 'master' || sa.role === 'admin' ? 'all' : perms.join(', ');
    save('staff_accounts', staff);
    // Update admin_creds if master
    if (sa.role === 'master') save('admin_creds', { email: sa.email, password: sa.password });
    closeModal(); renderTab();
};

const toggleStaffStatus = (id) => {
    const staff = load('staff_accounts', []);
    const sa = staff.find(s => s.id === id); if (!sa) return;
    sa.status = sa.status === 'active' ? 'disabled' : 'active';
    save('staff_accounts', staff); renderTab();
};

const deleteStaffAccount = (id) => {
    if (!confirm('Delete this staff account?')) return;
    let staff = load('staff_accounts', []);
    staff = staff.filter(s => s.id !== id);
    save('staff_accounts', staff); renderTab();
};

// Simple hash matching auth.js
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
    return 'h_' + Math.abs(hash).toString(36);
};

// ============================================
// SUPABASE ACTIONS
// ============================================
const saveSupabaseConfig = () => {
    const url = document.getElementById('sSbUrl')?.value?.trim() || '';
    const anonKey = document.getElementById('sSbKey')?.value?.trim() || '';
    if (!url || !anonKey) { alert('Both URL and Anon Key are required'); return; }
    if (typeof GPC_SUPABASE !== 'undefined') {
        GPC_SUPABASE.saveConfig({ url, anonKey });
        // Re-init
        const ok = GPC_SUPABASE.init();
        if (ok) {
            GPC_SUPABASE.startRealtime((key) => { if (typeof renderTab === 'function') renderTab(); });
            if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Connected', 'Supabase connected! Data will sync across devices.', 'success');
        } else {
            if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Failed', 'Could not connect. Check URL and key.', 'error');
        }
        renderTab();
    }
};

const testSupabase = async () => {
    if (typeof GPC_SUPABASE === 'undefined' || !GPC_SUPABASE.isConnected()) {
        alert('Not connected. Save your config first.'); return;
    }
    const result = await GPC_SUPABASE.testConnection();
    if (result.success) {
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Success', 'Supabase connection working!', 'success');
    } else {
        alert('Connection test failed: ' + result.error);
    }
};

const pushToCloud = async () => {
    if (!confirm('Push ALL local data to the cloud? This will overwrite cloud data with what is on THIS device.')) return;
    if (typeof GPC_SUPABASE === 'undefined' || !GPC_SUPABASE.isConnected()) {
        alert('Not connected to Supabase.'); return;
    }
    const result = await GPC_SUPABASE.pushAll();
    if (result.success) {
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Pushed', `${result.pushed} data keys sent to cloud`, 'success');
    } else {
        alert('Push failed: ' + (result.error || 'Unknown error'));
    }
};

const pullFromCloud = async () => {
    if (!confirm('Pull ALL cloud data to this device? This will overwrite local data with what is in the cloud.')) return;
    if (typeof GPC_SUPABASE === 'undefined' || !GPC_SUPABASE.isConnected()) {
        alert('Not connected to Supabase.'); return;
    }
    const result = await GPC_SUPABASE.pullAll();
    if (result.success) {
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Pulled', `${result.pulled} data keys received from cloud`, 'success');
        renderTab();
    } else {
        alert('Pull failed: ' + (result.error || 'Unknown error'));
    }
};

const smartSyncCloud = async () => {
    if (typeof GPC_SUPABASE === 'undefined' || !GPC_SUPABASE.isConnected()) {
        alert('Not connected to Supabase.'); return;
    }
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Syncing...', 'Merging data from all devices', 'info');
    const result = await GPC_SUPABASE.smartSync();
    if (result.success) {
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Synced', `Merged: ${result.merged}, Pushed: ${result.pushed}, Pulled: ${result.pulled}`, 'success');
        renderTab();
    } else {
        alert('Sync failed: ' + (result.error || 'Unknown error'));
    }
};

// ============================================
// EMAIL ACTIONS
// ============================================
const saveEmailConfig = () => {
    const cfg = {
        enabled: document.getElementById('sEmailEnabled')?.value === 'true',
        serviceId: document.getElementById('sEmailServiceId')?.value?.trim() || '',
        publicKey: document.getElementById('sEmailPublicKey')?.value?.trim() || '',
        adminEmail: document.getElementById('sEmailAdmin')?.value?.trim() || '',
        sendToClient: document.getElementById('sEmailClient')?.value === 'true',
        sendToAdmin: document.getElementById('sEmailAdminCopy')?.value === 'true'
    };
    save('email_config', cfg);
    // Re-init EmailJS with new key
    if (cfg.publicKey && typeof emailjs !== 'undefined') {
        emailjs.init(cfg.publicKey);
    }
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Saved', 'Email configuration updated', 'success');
    renderTab();
};

const testEmail = () => {
    const cfg = load('email_config', {});
    const adminEmail = document.getElementById('sEmailAdmin')?.value?.trim() || cfg.adminEmail || '';
    if (!adminEmail) { alert('Enter an admin email first'); return; }
    if (!cfg.enabled) { alert('Email is OFF. Turn it ON and save first.'); return; }
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.sendDirectEmail(adminEmail, 'GenusPupClub Admin', 'Test Email from GenusPupClub', 'This is a test email from your GenusPupClub dashboard.\n\nIf you received this, your email system is working correctly!\n\nSent: ' + new Date().toLocaleString());
    }
};

const resetClientPassword = (userId, name) => {
    const newPass = prompt(`New password for ${name}:`);
    if (!newPass || newPass.length < 6) { alert('Password must be 6+ characters'); return; }
    const users = load('users', []);
    const user = users.find(u => u.id === userId);
    if (user) {
        user.passwordHash = simpleHash(newPass);
        user.plainPassword = newPass;
        user.passwordChangedAt = new Date().toISOString();
        save('users', users);
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Password Reset', `${name}'s password has been changed`, 'success');
        // Send password reset email if email system is active
        if (typeof GPC_NOTIFY !== 'undefined') {
            GPC_NOTIFY.sendEmail('password_reset', { name: user.name, email: user.email, clientEmail: user.email, newPassword: newPass });
        }
        renderTab();
    }
};

const editClientAccount = (userId) => {
    const users = load('users', []);
    const u = users.find(x => x.id === userId);
    if (!u) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit Account: ${escHTML(u.name)}</div>
        <div class="form-row"><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="euName" value="${escHTML(u.name)}"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="euEmail" type="email" value="${escHTML(u.email)}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="euPhone" value="${escHTML(u.phone || '')}"></div><div class="form-group"><label class="form-label">New Password (leave blank to keep)</label><input class="form-input" id="euPass" type="text" placeholder="Enter new password or leave blank" value="${escHTML(u.plainPassword || '')}"></div></div>
        <div style="margin-top:8px;padding:10px;background:rgba(255,107,53,.04);border-radius:8px;font-size:.82rem;color:var(--text-muted)">
            <strong>Account ID:</strong> ${u.id}<br>
            <strong>Created:</strong> ${u.createdAt || '—'}<br>
            <strong>Password Hash:</strong> <code>${u.passwordHash || '—'}</code><br>
            <strong>Last Password Change:</strong> ${u.passwordChangedAt ? u.passwordChangedAt.substring(0,10) : 'Never'}
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditClientAccount('${u.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};

const saveEditClientAccount = (userId) => {
    const users = load('users', []);
    const u = users.find(x => x.id === userId);
    if (!u) return;
    const newName = document.getElementById('euName')?.value?.trim();
    const newEmail = document.getElementById('euEmail')?.value?.trim();
    const newPhone = document.getElementById('euPhone')?.value?.trim();
    const newPass = document.getElementById('euPass')?.value;

    if (newName) u.name = newName;
    if (newEmail) u.email = newEmail.toLowerCase();
    if (newPhone !== undefined) u.phone = newPhone;
    if (newPass && newPass.length >= 6) {
        u.passwordHash = simpleHash(newPass);
        u.plainPassword = newPass;
        u.passwordChangedAt = new Date().toISOString();
    }
    save('users', users);

    // Also sync with clients table
    const allClients = load('clients', []);
    const client = allClients.find(c => c.id === userId);
    if (client) {
        if (newName) client.name = newName;
        if (newEmail) client.email = newEmail.toLowerCase();
        if (newPhone !== undefined) client.phone = newPhone;
        save('clients', allClients);
    }

    closeModal();
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Updated', `${newName}'s account has been updated`, 'success');
    renderTab();
};

const emailClientCreds = (userId) => {
    const users = load('users', []);
    const u = users.find(x => x.id === userId);
    if (!u) return;
    if (!u.plainPassword) { alert('Password not available (was set before plaintext storage). Reset it first.'); return; }
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.sendDirectEmail(u.email, u.name,
            'Your GenusPupClub Login Credentials',
            `Hi ${u.name}!\n\nHere are your GenusPupClub login details:\n\nEmail: ${u.email}\nPassword: ${u.plainPassword}\n\nLog in at your client portal anytime.\n\nIf you have questions, call us at (804) 258-3830.\n\n— GenusPupClub`
        );
    }
};

const deleteClientAccount = (userId, name) => {
    if (!confirm(`Delete ${name}'s account? This removes their login but keeps their booking/pet data.`)) return;
    let users = load('users', []);
    users = users.filter(u => u.id !== userId);
    save('users', users);
    renderTab();
};

const exportAllData = () => {
    const allData = {};
    Object.keys(localStorage).filter(k => k.startsWith('gpc_')).forEach(k => {
        try { allData[k] = JSON.parse(localStorage.getItem(k)); } catch { allData[k] = localStorage.getItem(k); }
    });
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `genuspupclub-backup-${todayStr()}.json`;
    a.click();
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Exported', 'Full data backup downloaded', 'success');
};

const importData = (input) => {
    if (!input.files?.[0]) return;
    if (!confirm('Import data? This will MERGE with existing data (not replace).')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            Object.entries(data).forEach(([k, v]) => {
                const key = k.startsWith('gpc_') ? k.replace('gpc_', '') : k;
                const val = typeof v === 'string' ? (() => { try { return JSON.parse(v); } catch { return v; } })() : v;
                save(key, val);
            });
            if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Imported', `${Object.keys(data).length} data keys imported & synced to cloud`, 'success');
            renderTab();
        } catch (err) { alert('Invalid JSON file'); }
    };
    reader.readAsText(input.files[0]);
};

// ============================================
// BULK IMPORT (Excel / CSV)
// ============================================
const parseCSV = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    return lines.slice(1).map(line => {
        const vals = [];
        let current = '';
        let inQuotes = false;
        for (const ch of line) {
            if (ch === '"') { inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { vals.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        vals.push(current.trim());
        const row = {};
        headers.forEach((h, i) => { row[h] = (vals[i] || '').replace(/^["']|["']$/g, ''); });
        return row;
    });
};

const parseXLSX = (arrayBuffer) => {
    // Lightweight XLSX parser — reads first sheet, returns array of objects
    try {
        const data = new Uint8Array(arrayBuffer);
        // XLSX files are ZIP archives. We'll use a minimal approach:
        // Convert to text and try CSV-like parsing of the shared strings + sheet data
        // For full XLSX support, we'd need a library. Let's check if it's actually CSV renamed.
        const text = new TextDecoder().decode(data);
        if (text.includes(',') && !text.includes('PK')) {
            // It's actually a CSV file with wrong extension
            return parseCSV(text);
        }
        // For real XLSX, tell user to save as CSV
        return null;
    } catch {
        return null;
    }
};

const processBulkImport = () => {
    const fileInput = document.getElementById('bulkImportFile');
    const type = document.getElementById('bulkImportType')?.value;
    if (!fileInput?.files?.[0]) { alert('Select a file first'); return; }

    const file = fileInput.files[0];
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const preview = document.getElementById('bulkImportPreview');

    const processRows = (rows) => {
        if (!rows || rows.length === 0) {
            alert('No data found. For .xlsx files, please save as .csv first (File → Save As → CSV).');
            return;
        }

        let added = 0;
        let skipped = 0;

        if (type === 'clients') {
            const existing = load('clients', []);
            rows.forEach(r => {
                if (!r.name) { skipped++; return; }
                if (existing.find(c => c.email === r.email && r.email)) { skipped++; return; }
                existing.push({
                    id: uid(), name: r.name, email: r.email || '', phone: r.phone || '',
                    address: r.address || '', source: 'Bulk Import', notes: r.notes || ''
                });
                added++;
            });
            save('clients', existing);

        } else if (type === 'pets') {
            const existing = load('pets', []);
            const allClients = load('clients', []);
            rows.forEach(r => {
                if (!r.name) { skipped++; return; }
                // Match owner by email
                const owner = r.owneremail ? allClients.find(c => c.email?.toLowerCase() === r.owneremail.toLowerCase()) : null;
                existing.push({
                    id: uid(), name: r.name, breed: r.breed || '', age: r.age || '',
                    weight: r.weight || '', gender: r.gender || '', fixed: r.fixed || '',
                    clientId: owner?.id || '', vet: r.vet || '', allergies: r.allergies || '',
                    medications: r.medications || '', feedingSchedule: r.feeding || '',
                    tags: '', notes: r.notes || ''
                });
                added++;
            });
            save('pets', existing);

        } else if (type === 'bookings') {
            const existing = load('bookings', []);
            const allClients = load('clients', []);
            const allServices = load('services', []);
            rows.forEach(r => {
                if (!r.clientname && !r.clientemail) { skipped++; return; }
                const client = r.clientemail ? allClients.find(c => c.email?.toLowerCase() === r.clientemail.toLowerCase()) : null;
                const svc = allServices.find(s => s.name.toLowerCase().includes((r.service || '').toLowerCase()));
                existing.push({
                    id: uid(), clientId: client?.id || '', clientName: r.clientname || client?.name || '',
                    clientEmail: r.clientemail || client?.email || '', petName: r.petname || '',
                    service: svc?.name || r.service || '', amount: svc?.price || 0,
                    date: r.date || '', endDate: r.enddate || '', time: r.time || '10:00',
                    dropoffTime: '', pickupTime: '', zone: '', sitter: '',
                    addons: [], extraDogs: 0, notes: r.notes || '',
                    status: 'pending', source: 'Bulk Import'
                });
                added++;
            });
            save('bookings', existing);
        }

        if (preview) {
            preview.innerHTML = `
                <div style="padding:12px;background:rgba(0,184,148,.06);border:1px solid rgba(0,184,148,.2);border-radius:8px">
                    <strong style="color:var(--accent)">Import Complete</strong><br>
                    <span style="font-size:.88rem">${added} ${type} added, ${skipped} skipped (duplicates or missing name)</span>
                </div>
            `;
        }
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Imported', `${added} ${type} added from spreadsheet`, 'success');
        fileInput.value = '';
        renderTab();
    };

    if (isCSV) {
        const reader = new FileReader();
        reader.onload = (e) => processRows(parseCSV(e.target.result));
        reader.readAsText(file);
    } else {
        // Try reading as text first (some .xlsx are really CSV)
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = parseXLSX(e.target.result);
            if (result) {
                processRows(result);
            } else {
                alert('For .xlsx files, please save as .csv first:\nExcel → File → Save As → choose "CSV (Comma delimited)"');
            }
        };
        reader.readAsArrayBuffer(file);
    }
};

const downloadTemplate = () => {
    const type = document.getElementById('bulkImportType')?.value || 'clients';
    const templates = {
        clients: 'name,email,phone,address,notes\nJohn Smith,john@email.com,(804) 555-1234,123 Main St Richmond VA,Referred by Sarah\nJane Doe,jane@email.com,(804) 555-5678,456 Oak Ave Richmond VA,Has 2 dogs',
        pets: 'name,breed,age,weight,gender,fixed,ownerEmail,vet,allergies,medications,feeding,notes\nBuddy,Golden Retriever,3 years,65 lbs,Male,Yes,john@email.com,Dr. Smith (804) 555-9999,None,Heartworm monthly,1 cup AM 1 cup PM,Loves tennis balls\nLuna,Labrador Mix,2 years,45 lbs,Female,Yes,jane@email.com,VCA Emergency,Chicken,None,1.5 cups twice daily,Anxious with strangers',
        bookings: 'clientName,clientEmail,petName,service,date,endDate,time,notes\nJohn Smith,john@email.com,Buddy,Dog Walking (30 min),2026-04-10,,10:00,Needs gentle leash\nJane Doe,jane@email.com,Luna,Overnight Sitting,2026-04-15,2026-04-18,18:00,Medication at 8pm'
    };
    const blob = new Blob([templates[type]], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `genuspupclub-${type}-template.csv`;
    a.click();
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
const editAddon = (id) => {
    const a = addons.find(x => x.id === id); if (!a) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit Add-on: ${escHTML(a.name)}</div>
        <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="eaName" value="${escHTML(a.name)}"></div>
        <div class="form-group"><label class="form-label">Price ($)</label><input class="form-input" id="eaPrice" type="number" step="0.01" value="${a.price}"></div>
        <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="eaDesc" value="${escHTML(a.description || '')}"></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditAddon('${a.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};
const saveEditAddon = (id) => {
    const a = addons.find(x => x.id === id); if (!a) return;
    a.name = document.getElementById('eaName')?.value?.trim() || a.name;
    a.price = parseFloat(document.getElementById('eaPrice')?.value) ?? a.price;
    a.description = document.getElementById('eaDesc')?.value?.trim() || '';
    save('addons', addons); closeModal(); renderTab();
};

const deletePackage = (id) => { if (!confirm('Delete package?')) return; packages = packages.filter(x => x.id !== id); save('packages', packages); renderTab(); };
const editPackage = (id) => {
    const p = packages.find(x => x.id === id); if (!p) return;
    const svcOptions = services.filter(s => s.active).map(s => `<option value="${escHTML(s.name)}" ${(p.services || []).includes(s.name) ? 'selected' : ''}>${escHTML(s.name)}</option>`).join('');
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit Package: ${escHTML(p.name)}</div>
        <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="epkName" value="${escHTML(p.name)}"></div>
        <div class="form-row"><div class="form-group"><label class="form-label"># Visits</label><input class="form-input" id="epkVisits" type="number" value="${p.visits}"></div><div class="form-group"><label class="form-label">Discount (%)</label><input class="form-input" id="epkDiscount" type="number" value="${p.discount}"></div></div>
        <div class="form-group"><label class="form-label">Base Service</label><select class="form-select" id="epkService">${svcOptions}</select></div>
        <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="epkDesc" value="${escHTML(p.description || '')}"></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditPackage('${p.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};
const saveEditPackage = (id) => {
    const p = packages.find(x => x.id === id); if (!p) return;
    p.name = document.getElementById('epkName')?.value?.trim() || p.name;
    p.visits = parseInt(document.getElementById('epkVisits')?.value) || p.visits;
    p.discount = parseInt(document.getElementById('epkDiscount')?.value) ?? p.discount;
    p.services = [document.getElementById('epkService')?.value || p.services?.[0]];
    p.description = document.getElementById('epkDesc')?.value?.trim() || '';
    save('packages', packages); closeModal(); renderTab();
};

const deleteZone = (id) => { if (!confirm('Delete zone?')) return; zones = zones.filter(x => x.id !== id); save('zones', zones); renderTab(); };
const editZone = (id) => {
    const z = zones.find(x => x.id === id); if (!z) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit Zone: ${escHTML(z.name)}</div>
        <div class="form-group"><label class="form-label">Zone Name</label><input class="form-input" id="ezName" value="${escHTML(z.name)}"></div>
        <div class="form-group"><label class="form-label">Areas</label><input class="form-input" id="ezAreas" value="${escHTML(z.areas || '')}"></div>
        <div class="form-group"><label class="form-label">Surcharge ($)</label><input class="form-input" id="ezSurcharge" type="number" step="0.01" value="${z.surcharge}"></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditZone('${z.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};
const saveEditZone = (id) => {
    const z = zones.find(x => x.id === id); if (!z) return;
    z.name = document.getElementById('ezName')?.value?.trim() || z.name;
    z.areas = document.getElementById('ezAreas')?.value?.trim() || '';
    z.surcharge = parseFloat(document.getElementById('ezSurcharge')?.value) ?? z.surcharge;
    save('zones', zones); closeModal(); renderTab();
};

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
        booking: { title: 'New Booking', body: (() => {
            const propOptions = properties.map(p => `<option value="${escHTML(p.address)}">${escHTML(p.name)} — ${escHTML(p.address)}</option>`).join('');
            const clientAddrOptions = clients.filter(c => c.address).map(c => `<option value="${escHTML(c.address)}">${escHTML(c.name)} — ${escHTML(c.address)}</option>`).join('');
            return `
            <div class="form-row"><div class="form-group"><label class="form-label">Client</label><select class="form-select" id="mClient" onchange="autofillClient(this.value)"><option value="">Select or type below</option>${clientOptions}</select></div><div class="form-group"><label class="form-label">Client Name</label><input class="form-input" id="mClientName"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mPetName"></div><div class="form-group"><label class="form-label">Extra Dogs</label><input class="form-input" id="mExtraDogs" type="number" value="0" min="0"></div></div>
            <div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService" onchange="updateBookingPrice()">${svcOptions}</select></div>
            <div class="form-group"><label class="form-label">Add-ons</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px" id="mAddons">${addonChecks}</div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Start Date</label><input class="form-input" id="mDate" type="date" value="${todayStr()}"></div><div class="form-group"><label class="form-label">End Date</label><input class="form-input" id="mEndDate" type="date"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Time</label><input class="form-input" id="mTime" type="time" value="10:00"></div><div class="form-group"><label class="form-label">Sitter</label><select class="form-select" id="mSitter"><option value="">Auto-assign</option>${sitterOptions}</select></div></div>
            <div style="margin:8px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Drop-Off & Pick-Up</div>
            <div class="form-row"><div class="form-group"><label class="form-label">Drop-Off Date & Time</label><input class="form-input" id="mDropoff" type="datetime-local"></div><div class="form-group"><label class="form-label">Pick-Up Date & Time</label><input class="form-input" id="mPickup" type="datetime-local"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Zone</label><select class="form-select" id="mZone"><option value="">No zone</option>${zoneOptions}</select></div></div>
            <div style="margin:8px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Transport</div>
            <div class="form-group"><label class="form-label">Pickup Address</label><select class="form-select" id="mPickupAddr" onchange="if(this.value==='custom'){this.style.display='none';document.getElementById('mPickupAddrCustom').style.display='block'}"><option value="">Select address</option><optgroup label="Client Addresses">${clientAddrOptions}</optgroup><option value="custom">Enter custom address...</option></select><input class="form-input" id="mPickupAddrCustom" style="display:none;margin-top:4px" placeholder="Enter pickup address"></div>
            <div class="form-group"><label class="form-label">Dropoff Address</label><select class="form-select" id="mDropoffAddr" onchange="if(this.value==='custom'){this.style.display='none';document.getElementById('mDropoffAddrCustom').style.display='block'}"><option value="">Select address</option><optgroup label="Our Locations">${propOptions}</optgroup><optgroup label="Client Addresses">${clientAddrOptions}</optgroup><option value="custom">Enter custom address...</option></select><input class="form-input" id="mDropoffAddrCustom" style="display:none;margin-top:4px" placeholder="Enter dropoff address (vet, groomer, etc.)"></div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="mNotes" rows="2"></textarea></div>
            <div style="background:rgba(255,107,53,0.05);padding:12px;border-radius:8px;text-align:right"><span style="font-size:.85rem;color:var(--text-muted)">Estimated Total:</span> <strong style="font-size:1.3rem;color:var(--primary)" id="mPricePreview">${fmt(services[0]?.price || 0)}</strong></div>
        `; })() },
        client: { title: 'Add Client', body: `
            <div class="form-group"><label class="form-label">Photo</label><input type="file" id="mClientPhoto" accept="image/*" class="form-input" style="padding:8px" onchange="previewProfilePic(this,'mClientPhotoPreview')"><div id="mClientPhotoPreview" style="margin-top:6px"></div><input type="hidden" id="mClientPhotoData"></div>
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="mName"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="mEmail" type="email"></div><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="mPhone" type="tel"></div></div>
            <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="mAddress"></div>
            <div class="form-group"><label class="form-label">How did they find us?</label><select class="form-select" id="mSource"><option>Google</option><option>Instagram</option><option>Facebook</option><option>Referral</option><option>Nextdoor</option><option>Walk-in</option><option>Other</option></select></div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="mNotes" rows="2"></textarea></div>
        ` },
        pet: { title: 'Add Pet', body: `
            <div class="form-group"><label class="form-label">Photo</label><input type="file" id="mPhoto" accept="image/*" class="form-input" style="padding:8px" onchange="previewProfilePic(this,'mPhotoPreview')"><div id="mPhotoPreview" style="margin-top:6px"></div><input type="hidden" id="mPhotoData"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mName"></div><div class="form-group"><label class="form-label">Breed</label>${typeof breedSelectHTML === 'function' ? breedSelectHTML('mBreed') : '<input class="form-input" id="mBreed">'}</div></div>
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
        infamy: { title: 'Add to Infamy Hall', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Dog Name</label><input class="form-input" id="mDogName"></div><div class="form-group"><label class="form-label">Owner Name</label><input class="form-input" id="mOwnerName"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Breed</label><input class="form-input" id="mBreed"></div><div class="form-group"><label class="form-label">Severity</label><select class="form-select" id="mSeverity"><option value="low">Caution — minor issues</option><option value="medium">Problem — recurring issues</option><option value="high">Serious — safety risk</option><option value="banned">BANNED — do not accept</option></select></div></div>
            <div class="form-group"><label class="form-label">Issue Type</label><select class="form-select" id="mIssueType"><option>Aggression (dog)</option><option>Aggression (human)</option><option>Biting</option><option>Escape Artist</option><option>Destruction</option><option>Excessive Barking</option><option>Resource Guarding</option><option>Separation Anxiety (extreme)</option><option>Not Housebroken</option><option>Medical Issues (undisclosed)</option><option>Owner Problems</option><option>Unpaid Balance</option><option>Other</option></select></div>
            <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="mDescription" rows="3" placeholder="What happened? Be specific for safety."></textarea></div>
            <div class="form-group"><label class="form-label">Action Taken</label><input class="form-input" id="mAction" placeholder="e.g. Warned owner, extra sitter required, banned"></div>
            <div class="form-group"><label class="form-label">Staff Notes</label><textarea class="form-textarea" id="mStaffNotes" rows="2" placeholder="Internal notes for the team"></textarea></div>
        ` },
        client_account: { title: 'Create Client Account', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="mCAName"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="mCAEmail" type="email"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="mCAPhone" type="tel"></div><div class="form-group"><label class="form-label">Password</label><input class="form-input" id="mCAPass" value="${'Pup' + Math.random().toString(36).substring(2, 8)}" style="font-family:monospace"></div></div>
            <div class="form-group"><label class="form-label">Dog's Name (optional)</label><input class="form-input" id="mCADog" placeholder="Will create a pet profile"></div>
            <div style="margin-top:8px"><label style="display:flex;gap:6px;align-items:center;font-size:.88rem"><input type="checkbox" id="mCASendEmail" checked> Send login credentials via email</label></div>
        ` },
        staff_account: { title: 'Create Staff Login', body: `
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="mStaffName"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Login Email</label><input class="form-input" id="mStaffEmail" type="email" placeholder="employee@genuspupclub.com"></div>
                <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="mStaffPass" value="${'GPC' + Math.random().toString(36).substring(2, 8).toUpperCase()}" style="font-family:monospace"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Role</label><select class="form-select" id="mStaffRole"><option value="employee">Employee (limited)</option><option value="admin">Admin (full access)</option><option value="viewer">Viewer (read only)</option></select></div>
                <div class="form-group"><label class="form-label">Link to Sitter</label><select class="form-select" id="mStaffSitter"><option value="">None</option>${sitterOptions}</select></div>
            </div>
            <div class="form-group"><label class="form-label">Permissions</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                    ${['View Bookings', 'Edit Bookings', 'View Clients', 'View Pets', 'Check In/Out', 'Report Cards', 'View Schedule', 'Messages', 'View Payments', 'Photos'].map(p => `<label style="display:flex;gap:4px;align-items:center;font-size:.85rem"><input type="checkbox" class="staff-perm" value="${p}" checked> ${p}</label>`).join('')}
                </div>
            </div>
            <div style="padding:12px;background:rgba(255,107,53,.05);border-radius:8px;margin-top:8px;font-size:.82rem;color:var(--text-muted)">
                The employee will use the <strong>Admin Login</strong> page with their email and password. Their access is limited to the permissions you select above.
            </div>
        ` },
        recurring: { title: 'Set Up Recurring Booking', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Client</label><select class="form-select" id="mClient" onchange="autofillClient(this.value)"><option value="">Select</option>${clientOptions}</select></div><div class="form-group"><label class="form-label">Client Name</label><input class="form-input" id="mClientName"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mPetName"></div><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div></div>
            <div class="form-group"><label class="form-label">Frequency</label><select class="form-select" id="mFreq"><option>Weekly</option><option>Twice a Week</option><option>3x a Week</option><option>Daily (Mon-Fri)</option><option>Every Other Week</option><option>Monthly</option></select></div>
            <div class="form-group"><label class="form-label">Days</label><div style="display:flex;gap:6px;flex-wrap:wrap">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<label style="display:flex;gap:4px;align-items:center;font-size:.88rem"><input type="checkbox" class="rec-day" value="${d}"> ${d}</label>`).join('')}</div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Time</label><input class="form-input" id="mTime" type="time" value="10:00"></div><div class="form-group"><label class="form-label">Sitter</label><select class="form-select" id="mSitter"><option value="">Auto</option>${sitterOptions}</select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Start Date</label><input class="form-input" id="mStartDate" type="date" value="${todayStr()}"></div><div class="form-group"><label class="form-label">Weeks to Generate</label><input class="form-input" id="mWeeks" type="number" value="4" min="1" max="52"></div></div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="mNotes" rows="2"></textarea></div>
            <div style="padding:10px;background:rgba(0,184,148,.05);border-radius:8px;font-size:.82rem;color:var(--text-muted)">This will auto-generate individual bookings for the selected days over the specified number of weeks. Recurring discount (${businessSettings.recurringDiscount || 15}%) applied automatically.</div>
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
        checkin: { title: 'Check In Dog', body: (() => {
            const todayBkgs = bookings.filter(b => b.date === todayStr() && b.status !== 'cancelled' && b.status !== 'completed');
            const bkgOptions = todayBkgs.map(b => `<option value="${b.id}">${escHTML(b.clientName)} — ${escHTML(b.petName)} (${escHTML(b.service)}, ${b.time || '?'})</option>`).join('');
            return `
            <div class="form-group"><label class="form-label">Select Booking</label><select class="form-select" id="mBookingId" onchange="autofillCheckin(this.value)"><option value="">-- Walk-In (no booking) --</option>${bkgOptions}</select></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mPetName"></div><div class="form-group"><label class="form-label">Owner</label><select class="form-select" id="mOwnerSelect" onchange="autofillCheckinOwner(this.value)"><option value="">Select or type below</option>${clientOptions}</select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Owner Name</label><input class="form-input" id="mOwnerName"></div><div class="form-group"><label class="form-label">Owner Phone</label><input class="form-input" id="mPhone" type="tel"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div><div class="form-group"><label class="form-label">Drop-Off Time</label><input class="form-input" id="mDropoffTime" type="time" value="${new Date().toTimeString().slice(0,5)}"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Expected Pick-Up</label><input class="form-input" id="mPickupTime" type="time"></div><div class="form-group"><label class="form-label">Assigned Sitter</label><select class="form-select" id="mSitter"><option value="">Auto</option>${sitterOptions}</select></div></div>
            <div class="form-group"><label class="form-label">Location</label><select class="form-select" id="mProperty">${(load('properties',[])).map(p => `<option>${escHTML(p.name)} — ${escHTML(p.address)}</option>`).join('')}</select></div>`;
        })() + `
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
            <div class="form-row"><div class="form-group"><label class="form-label">From</label><input class="form-input" id="mFrom" value="GenusPupClub"></div><div class="form-group"><label class="form-label">To (Owner)</label><select class="form-select" id="mTo" onchange="autofillMsgPets(this.value)"><option value="">Select owner</option>${clientOptions}</select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Regarding Pet</label><select class="form-select" id="mPet"><option value="">Select pet</option></select></div><div class="form-group"><label class="form-label">Type</label><select class="form-select" id="mType"><option value="update">Visit Update</option><option value="booking">Booking</option><option value="reminder">Reminder</option><option value="general">General</option></select></div></div>
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
        // Autofill pickup address from client profile
        const pickupSelect = document.getElementById('mPickupAddr');
        if (pickupSelect && c.address) {
            // Check if their address is in the dropdown
            const match = [...pickupSelect.options].find(o => o.value === c.address);
            if (match) { pickupSelect.value = c.address; }
            else {
                // Show custom input with their address
                pickupSelect.style.display = 'none';
                const custom = document.getElementById('mPickupAddrCustom');
                if (custom) { custom.style.display = 'block'; custom.value = c.address; }
            }
        }
        const clientPets = pets.filter(p => p.clientId === c.id);
        const petNameInput = document.getElementById('mPetName');
        if (clientPets.length === 1) {
            petNameInput.value = clientPets[0].name;
        } else if (clientPets.length > 1) {
            // Replace text input with a multi-select checklist
            const wrapper = petNameInput.parentElement;
            wrapper.innerHTML = `<label class="form-label">Select Pets (${clientPets.length})</label>
                <div id="mPetChecklist" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
                    ${clientPets.map(p => `<label style="display:flex;gap:4px;align-items:center;font-size:.88rem;cursor:pointer;background:var(--bg-alt);padding:4px 10px;border-radius:6px;border:1px solid var(--border)"><input type="checkbox" class="pet-select-cb" value="${escHTML(p.name)}" checked> ${escHTML(p.name)}</label>`).join('')}
                </div>
                <input type="hidden" id="mPetName" value="${clientPets.map(p => p.name).join(', ')}">`;
            wrapper.querySelectorAll('.pet-select-cb').forEach(cb => {
                cb.addEventListener('change', () => {
                    const selected = [...wrapper.querySelectorAll('.pet-select-cb:checked')].map(c => c.value);
                    document.getElementById('mPetName').value = selected.join(', ');
                    // Update extra dogs count
                    const extraField = document.getElementById('mExtraDogs');
                    if (extraField) extraField.value = Math.max(0, selected.length - 1);
                });
            });
            // Auto-set extra dogs
            const extraField = document.getElementById('mExtraDogs');
            if (extraField) extraField.value = Math.max(0, clientPets.length - 1);
        }
    }
};

const autofillCheckin = (bookingId) => {
    if (!bookingId) return; // walk-in
    const b = bookings.find(x => x.id === bookingId);
    if (!b) return;
    const petField = document.getElementById('mPetName');
    const ownerField = document.getElementById('mOwnerName');
    const phoneField = document.getElementById('mPhone');
    const svcField = document.getElementById('mService');
    const pickupField = document.getElementById('mPickupTime');
    if (petField) petField.value = b.petName || '';
    if (ownerField) ownerField.value = b.clientName || '';
    if (svcField) svcField.value = b.service || '';
    if (pickupField && b.pickupTime) pickupField.value = b.pickupTime;
    // Try to find client phone
    const client = clients.find(c => c.id === b.clientId || c.name === b.clientName);
    if (client && phoneField) phoneField.value = client.phone || '';
    if (client) {
        const ownerSelect = document.getElementById('mOwnerSelect');
        if (ownerSelect) ownerSelect.value = client.id;
    }
};

const autofillCheckinOwner = (clientId) => {
    const c = clients.find(x => x.id === clientId);
    if (!c) return;
    const ownerField = document.getElementById('mOwnerName');
    const phoneField = document.getElementById('mPhone');
    if (ownerField) ownerField.value = c.name;
    if (phoneField) phoneField.value = c.phone || '';
    // Populate pet field with first pet
    const clientPets = pets.filter(p => p.clientId === c.id);
    const petField = document.getElementById('mPetName');
    if (petField && clientPets.length === 1) petField.value = clientPets[0].name;
    else if (petField && clientPets.length > 1) petField.value = clientPets.map(p => p.name).join(', ');
};

const autofillMsgPets = (clientId) => {
    const petSelect = document.getElementById('mPet');
    if (!petSelect) return;
    const clientPets = pets.filter(p => p.clientId === clientId);
    petSelect.innerHTML = '<option value="">Select pet</option>' + clientPets.map(p => `<option value="${escHTML(p.name)}">${escHTML(p.name)}</option>`).join('');
    if (clientPets.length === 1) petSelect.value = clientPets[0].name;
};

const addPetForClient = (clientId, clientName) => {
    showModal('pet');
    setTimeout(() => {
        const ownerSelect = document.getElementById('mOwner');
        if (ownerSelect) ownerSelect.value = clientId;
    }, 50);
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
        const pickupAddr = v('mPickupAddrCustom') || v('mPickupAddr');
        const dropoffAddr = v('mDropoffAddrCustom') || v('mDropoffAddr');
        bookings.push({ id: uid(), clientId, clientName: v('mClientName'), petName: v('mPetName'), service: v('mService'), amount: svc?.price || 0, addons: selectedAddons, extraDogs: parseInt(v('mExtraDogs')) || 0, date: v('mDate'), endDate: v('mEndDate'), time: v('mTime'), dropoffTime: v('mDropoff'), pickupTime: v('mPickup'), pickupAddr, dropoffAddr, zone: v('mZone'), sitter: v('mSitter'), notes: v('mNotes'), status: 'pending' });
        save('bookings', bookings);
    } else if (type === 'client') {
        const clientEmail = v('mEmail');
        const clientName = v('mName');
        const clientPhone = v('mPhone');
        clients.push({ id: uid(), name: clientName, email: clientEmail, phone: clientPhone, photo: v('mClientPhotoData'), address: v('mAddress'), source: v('mSource'), notes: v('mNotes') });
        save('clients', clients);
        // Auto-send signup invite if email provided
        if (clientEmail && typeof GPC_NOTIFY !== 'undefined') {
            GPC_NOTIFY.sendDirectEmail(clientEmail, clientName,
                'Welcome to GenusPupClub — Create Your Account',
                `Hi ${clientName}!\n\nYou've been added to GenusPupClub — Richmond's #1 dog care service.\n\nCreate your free account to:\n• Book walks, daycare, sitting, and grooming\n• Get real-time photo updates of your pup\n• View report cards and invoices\n• Manage your pet profiles\n\nSign up here: ${window.location.origin}/login.html\n\nOr call us at (804) 258-3830 to book your first visit.\n\nWe can't wait to meet your pup!\n— GenusPupClub`
            );
            GPC_NOTIFY.showToast('Invite Sent', `Signup invite emailed to ${clientEmail}`, 'success');
        }
        // SMS link if phone provided
        if (clientPhone && !clientEmail) {
            const smsBody = encodeURIComponent(`Hi ${clientName}! You've been added to GenusPupClub. Create your account at ${window.location.origin}/login.html to book services and manage your pup's profile. — GenusPupClub`);
            window.open(`sms:${clientPhone}?body=${smsBody}`, '_blank');
        }
    } else if (type === 'pet') {
        pets.push({ id: uid(), name: v('mName'), breed: v('mBreed'), age: v('mAge'), weight: v('mWeight'), gender: v('mGender'), fixed: v('mFixed'), clientId: v('mOwner'), photo: v('mPhotoData'), vet: v('mVet'), allergies: v('mAllergies'), medications: v('mMeds'), feedingSchedule: v('mFeeding'), tags: v('mTags'), notes: v('mNotes'), preferredSitter: v('mPreferredSitter'), coatType: v('mCoat'), groomFrequency: v('mGroomFreq'), shampoo: v('mShampoo'), groomNotes: v('mGroomNotes') });
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
    } else if (type === 'infamy') {
        let infamy = load('infamy', []);
        infamy.push({ id: uid(), dogName: v('mDogName'), ownerName: v('mOwnerName'), breed: v('mBreed'), severity: v('mSeverity'), issueType: v('mIssueType'), description: v('mDescription'), actionTaken: v('mAction'), staffNotes: v('mStaffNotes'), dateReported: todayStr(), incidents: [] });
        save('infamy', infamy);
    } else if (type === 'client_account') {
        const name = v('mCAName');
        const email = v('mCAEmail').toLowerCase();
        const phone = v('mCAPhone');
        const pass = v('mCAPass');
        const dog = v('mCADog');
        const sendCreds = document.getElementById('mCASendEmail')?.checked;

        if (!name || !email || !pass) { alert('Name, email, and password required'); return; }
        if (pass.length < 6) { alert('Password must be 6+ characters'); return; }

        const users = load('users', []);
        if (users.find(u => u.email === email)) { alert('Account with this email already exists'); return; }

        const userId = uid();
        users.push({
            id: userId, name, email, phone,
            passwordHash: simpleHash(pass), plainPassword: pass,
            createdAt: new Date().toISOString(), role: 'client'
        });
        save('users', users);

        // Also add as client
        if (!clients.find(c => c.email === email)) {
            clients.push({ id: userId, name, email, phone, address: '', source: 'Admin Created', notes: '' });
            save('clients', clients);
        }

        // Add pet if provided
        if (dog) {
            pets.push({ id: uid(), name: dog, breed: '', age: '', weight: '', gender: '', fixed: '', clientId: userId, tags: '', notes: '' });
            save('pets', pets);
        }

        // Send welcome email with credentials
        if (sendCreds && typeof GPC_NOTIFY !== 'undefined') {
            GPC_NOTIFY.sendDirectEmail(email, name,
                'Welcome to GenusPupClub — Your Login Credentials',
                `Hi ${name}!\n\nWelcome to GenusPupClub! An account has been created for you.\n\nEmail: ${email}\nPassword: ${pass}\n\nLog in at your client portal to book services, manage your pets, and more.\n\nQuestions? Call us at (804) 258-3830.\n\n— GenusPupClub`
            );
        }
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Account Created', `${name} can now log in`, 'success');
    } else if (type === 'staff_account') {
        const perms = [...document.querySelectorAll('.staff-perm:checked')].map(c => c.value);
        const role = v('mStaffRole');
        const staff = load('staff_accounts', []);
        staff.push({
            id: uid(), name: v('mStaffName'), email: v('mStaffEmail'), password: v('mStaffPass'),
            role, linkedSitter: v('mStaffSitter'), permissions: role === 'admin' ? 'all' : perms.join(', '),
            status: 'active', createdAt: todayStr()
        });
        save('staff_accounts', staff);
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Account Created', `${v('mStaffName')} can now log in`, 'success');
    } else if (type === 'recurring') {
        const days = [...document.querySelectorAll('.rec-day:checked')].map(cb => cb.value);
        const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
        const weeks = parseInt(v('mWeeks')) || 4;
        const startDate = new Date(v('mStartDate') + 'T12:00:00');
        const svc = services.find(s => s.name === v('mService'));
        const discount = businessSettings.recurringDiscount || 15;
        const price = svc ? svc.price * (1 - discount / 100) : 0;
        let generated = 0;

        for (let w = 0; w < weeks; w++) {
            for (const day of days) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + (w * 7) + ((dayMap[day] - d.getDay() + 7) % 7));
                if (d < startDate && w === 0) d.setDate(d.getDate() + 7);
                const dateStr = d.toISOString().split('T')[0];
                bookings.push({
                    id: uid(), clientId: v('mClient') || null, clientName: v('mClientName'), petName: v('mPetName'),
                    service: v('mService'), amount: price, addons: [], extraDogs: 0,
                    date: dateStr, time: v('mTime'), zone: '', sitter: v('mSitter'),
                    notes: v('mNotes') + ` [Recurring: ${v('mFreq')} — ${discount}% off]`, status: 'confirmed',
                    source: 'recurring', recurring: true
                });
                generated++;
            }
        }
        save('bookings', bookings);
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Recurring Created', `${generated} bookings generated over ${weeks} weeks`, 'success');
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
        const linkedBookingId = v('mBookingId') || null;
        checkins.push({
            id: uid(), bookingId: linkedBookingId, walkIn: !linkedBookingId,
            petName: v('mPetName'), ownerName: v('mOwnerName'), ownerPhone: v('mPhone'),
            service: v('mService'), property: v('mProperty'), sitter: v('mSitter'),
            dropoffTime: v('mDropoffTime'), expectedPickup: v('mPickupTime'),
            checklist, belongings: v('mBelongings'),
            specialInstructions: v('mInstructions'), ownerNotes: v('mNotes'),
            checkInDate: todayStr(), checkInTime: v('mDropoffTime') || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            checkedOut: false
        });
        // Update linked booking status to confirmed
        if (linkedBookingId) {
            const bk = bookings.find(x => x.id === linkedBookingId);
            if (bk && bk.status === 'pending') { bk.status = 'confirmed'; save('bookings', bookings); }
        }
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
        const toClientId = v('mTo');
        const toClient = clients.find(c => c.id === toClientId);
        messages.push({
            id: uid(), from: v('mFrom'), to: toClient?.name || toClientId, toClientId,
            pet: v('mPet'), type: v('mType'), text: v('mText'),
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

// Profile picture preview & data URL capture
const previewProfilePic = (input, previewId) => {
    const preview = document.getElementById(previewId);
    if (!input.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        // Resize to 200x200 to keep storage manageable
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 200;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const scale = Math.max(size / img.width, size / img.height);
            const x = (size - img.width * scale) / 2;
            const y = (size - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            if (preview) preview.innerHTML = `<img src="${dataUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:50%">`;
            // Store in hidden field
            const hiddenId = previewId.replace('Preview', 'Data');
            const hidden = document.getElementById(hiddenId);
            if (hidden) hidden.value = dataUrl;
        };
        img.src = e.target.result;
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
const editClient = (id) => {
    const c = clients.find(x => x.id === id); if (!c) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit: ${escHTML(c.name)}</div>
        <div class="form-group"><label class="form-label">Photo</label>${c.photo ? `<img src="${c.photo}" style="width:60px;height:60px;object-fit:cover;border-radius:50%;margin-bottom:6px;display:block">` : ''}<input type="file" id="ecPhoto" accept="image/*" class="form-input" style="padding:8px" onchange="previewProfilePic(this,'ecPhotoPreview')"><div id="ecPhotoPreview" style="margin-top:6px"></div><input type="hidden" id="ecPhotoData" value="${c.photo || ''}"></div>
        <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="ecName" value="${escHTML(c.name)}"></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="ecEmail" value="${escHTML(c.email || '')}"></div><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="ecPhone" value="${escHTML(c.phone || '')}"></div></div>
        <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="ecAddr" value="${escHTML(c.address || '')}"></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="ecNotes" rows="2">${escHTML(c.notes || '')}</textarea></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditClient('${c.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};
const saveEditClient = (id) => {
    const c = clients.find(x => x.id === id); if (!c) return;
    c.name = document.getElementById('ecName')?.value?.trim() || c.name;
    c.email = document.getElementById('ecEmail')?.value?.trim() || '';
    c.phone = document.getElementById('ecPhone')?.value?.trim() || '';
    c.address = document.getElementById('ecAddr')?.value?.trim() || '';
    c.notes = document.getElementById('ecNotes')?.value?.trim() || '';
    const newPhoto = document.getElementById('ecPhotoData')?.value;
    if (newPhoto) c.photo = newPhoto;
    save('clients', clients); closeModal(); renderTab();
};

const editPet = (id) => {
    const p = pets.find(x => x.id === id); if (!p) return;
    const clientOpts = clients.map(c => `<option value="${c.id}" ${p.clientId === c.id ? 'selected' : ''}>${escHTML(c.name)}</option>`).join('');
    const sitterOpts = sitters.map(s => `<option value="${escHTML(s.name)}" ${p.preferredSitter === s.name ? 'selected' : ''}>${escHTML(s.name)}</option>`).join('');
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    const genderOpts = ['Male', 'Female'].map(g => `<option ${p.gender === g ? 'selected' : ''}>${g}</option>`).join('');
    const fixedOpts = ['Yes', 'No'].map(f => `<option ${p.fixed === f ? 'selected' : ''}>${f}</option>`).join('');
    const coatOpts = ['Short', 'Medium', 'Long', 'Wire/Rough', 'Curly', 'Double Coat', 'Hairless'].map(c => `<option ${p.coatType === c ? 'selected' : ''}>${c}</option>`).join('');
    const groomFreqOpts = ['Monthly', 'Every 2 weeks', 'Weekly', 'Every 6 weeks', 'As needed'].map(f => `<option ${p.groomFrequency === f ? 'selected' : ''}>${f}</option>`).join('');
    const shampooOpts = ['Standard', 'Hypoallergenic', 'Oatmeal', 'Medicated', 'De-shedding', 'Whitening', 'Owner provides'].map(s => `<option ${p.shampoo === s ? 'selected' : ''}>${s}</option>`).join('');
    const breedOpts = typeof DOG_BREEDS !== 'undefined' ? DOG_BREEDS.map(b => `<option value="${b}" ${p.breed === b ? 'selected' : ''}>${b}</option>`).join('') : '';
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit: ${escHTML(p.name)}</div>
        <div class="form-group"><label class="form-label">Photo</label>${p.photo ? `<img src="${p.photo}" style="width:60px;height:60px;object-fit:cover;border-radius:50%;margin-bottom:6px;display:block">` : ''}<input type="file" id="epPhoto" accept="image/*" class="form-input" style="padding:8px" onchange="previewProfilePic(this,'epPhotoPreview')"><div id="epPhotoPreview" style="margin-top:6px"></div><input type="hidden" id="epPhotoData" value="${p.photo || ''}"></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="epName" value="${escHTML(p.name)}"></div><div class="form-group"><label class="form-label">Breed</label><select class="form-select" id="epBreed"><option value="">Select breed</option>${breedOpts}</select></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Age</label><input class="form-input" id="epAge" value="${escHTML(p.age || '')}"></div><div class="form-group"><label class="form-label">Weight</label><input class="form-input" id="epWeight" value="${escHTML(p.weight || '')}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Gender</label><select class="form-select" id="epGender">${genderOpts}</select></div><div class="form-group"><label class="form-label">Spayed/Neutered</label><select class="form-select" id="epFixed">${fixedOpts}</select></div></div>
        <div class="form-group"><label class="form-label">Owner</label><select class="form-select" id="epOwner"><option value="">None</option>${clientOpts}</select></div>
        <div class="form-group"><label class="form-label">Preferred Sitter</label><select class="form-select" id="epSitter"><option value="">No preference</option>${sitterOpts}</select></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Vet</label><input class="form-input" id="epVet" value="${escHTML(p.vet || '')}"></div><div class="form-group"><label class="form-label">Allergies</label><input class="form-input" id="epAllergies" value="${escHTML(p.allergies || '')}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Medications</label><input class="form-input" id="epMeds" value="${escHTML(p.medications || '')}"></div><div class="form-group"><label class="form-label">Feeding</label><input class="form-input" id="epFeed" value="${escHTML(p.feedingSchedule || '')}"></div></div>
        <div class="form-group"><label class="form-label">Tags</label><input class="form-input" id="epTags" value="${escHTML(p.tags || '')}"></div>
        <div style="margin:12px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Grooming Preferences</div>
        <div class="form-row"><div class="form-group"><label class="form-label">Coat Type</label><select class="form-select" id="epCoat">${coatOpts}</select></div><div class="form-group"><label class="form-label">Grooming Frequency</label><select class="form-select" id="epGroomFreq">${groomFreqOpts}</select></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Shampoo Preference</label><select class="form-select" id="epShampoo">${shampooOpts}</select></div><div class="form-group"><label class="form-label">Grooming Notes</label><input class="form-input" id="epGroomNotes" value="${escHTML(p.groomNotes || '')}"></div></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="epNotes" rows="2">${escHTML(p.notes || '')}</textarea></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditPet('${p.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};
const saveEditPet = (id) => {
    const p = pets.find(x => x.id === id); if (!p) return;
    p.name = document.getElementById('epName')?.value?.trim() || p.name;
    p.breed = document.getElementById('epBreed')?.value || '';
    const newPhoto = document.getElementById('epPhotoData')?.value;
    if (newPhoto) p.photo = newPhoto;
    p.age = document.getElementById('epAge')?.value?.trim() || '';
    p.weight = document.getElementById('epWeight')?.value?.trim() || '';
    p.gender = document.getElementById('epGender')?.value || '';
    p.fixed = document.getElementById('epFixed')?.value || '';
    p.clientId = document.getElementById('epOwner')?.value || '';
    p.preferredSitter = document.getElementById('epSitter')?.value || '';
    p.vet = document.getElementById('epVet')?.value?.trim() || '';
    p.allergies = document.getElementById('epAllergies')?.value?.trim() || '';
    p.medications = document.getElementById('epMeds')?.value?.trim() || '';
    p.feedingSchedule = document.getElementById('epFeed')?.value?.trim() || '';
    p.tags = document.getElementById('epTags')?.value?.trim() || '';
    p.coatType = document.getElementById('epCoat')?.value || '';
    p.groomFrequency = document.getElementById('epGroomFreq')?.value || '';
    p.shampoo = document.getElementById('epShampoo')?.value || '';
    p.groomNotes = document.getElementById('epGroomNotes')?.value?.trim() || '';
    p.notes = document.getElementById('epNotes')?.value?.trim() || '';
    save('pets', pets); closeModal(); renderTab();
};

const editBooking = (id) => {
    const b = bookings.find(x => x.id === id); if (!b) return;
    const svcOpts = services.map(s => `<option value="${escHTML(s.name)}" ${b.service === s.name ? 'selected' : ''}>${escHTML(s.name)} (${fmt(s.price)})</option>`).join('');
    const sitterOpts = sitters.map(s => `<option value="${escHTML(s.name)}" ${b.sitter === s.name ? 'selected' : ''}>${escHTML(s.name)}</option>`).join('');
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    const ebPropOptions = properties.map(p => `<option value="${escHTML(p.address)}" ${b.dropoffAddr === p.address ? 'selected' : ''}>${escHTML(p.name)} — ${escHTML(p.address)}</option>`).join('');
    const ebClientAddrs = clients.filter(c => c.address).map(c => `<option value="${escHTML(c.address)}" ${b.pickupAddr === c.address || b.dropoffAddr === c.address ? 'selected' : ''}>${escHTML(c.name)} — ${escHTML(c.address)}</option>`).join('');
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit Booking</div>
        <div class="form-row"><div class="form-group"><label class="form-label">Client</label><input class="form-input" id="ebClient" value="${escHTML(b.clientName || '')}"></div><div class="form-group"><label class="form-label">Pet</label><input class="form-input" id="ebPet" value="${escHTML(b.petName || '')}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="ebService">${svcOpts}</select></div><div class="form-group"><label class="form-label">Amount ($)</label><input class="form-input" id="ebAmount" type="number" step="0.01" value="${b.amount || 0}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Start Date</label><input class="form-input" id="ebDate" type="date" value="${b.date || ''}"></div><div class="form-group"><label class="form-label">End Date</label><input class="form-input" id="ebEndDate" type="date" value="${b.endDate || ''}"></div></div>
        <div class="form-group"><label class="form-label">Time</label><input class="form-input" id="ebTime" type="time" value="${b.time || ''}"></div>
        <div style="margin:8px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Drop-Off & Pick-Up</div>
        <div class="form-row"><div class="form-group"><label class="form-label">Drop-Off Date & Time</label><input class="form-input" id="ebDropoff" type="datetime-local" value="${b.dropoffTime || ''}"></div><div class="form-group"><label class="form-label">Pick-Up Date & Time</label><input class="form-input" id="ebPickup" type="datetime-local" value="${b.pickupTime || ''}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Sitter</label><select class="form-select" id="ebSitter"><option value="">Unassigned</option>${sitterOpts}</select></div><div class="form-group"><label class="form-label">Status</label><select class="form-select" id="ebStatus">${statuses.map(s => `<option ${b.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div></div>
        <div style="margin:8px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Transport</div>
        <div class="form-row"><div class="form-group"><label class="form-label">Pickup Address</label><select class="form-select" id="ebPickupAddr"><option value="">None</option><optgroup label="Client Addresses">${ebClientAddrs}</optgroup><option value="${escHTML(b.pickupAddr || '')}" selected>${escHTML(b.pickupAddr || 'None')}</option></select></div><div class="form-group"><label class="form-label">Dropoff Address</label><select class="form-select" id="ebDropoffAddr"><option value="">None</option><optgroup label="Our Locations">${ebPropOptions}</optgroup><optgroup label="Client Addresses">${ebClientAddrs}</optgroup><option value="${escHTML(b.dropoffAddr || '')}" selected>${escHTML(b.dropoffAddr || 'None')}</option></select></div></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="ebNotes" rows="2">${escHTML(b.notes || '')}</textarea></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditBooking('${b.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};
const saveEditBooking = (id) => {
    const b = bookings.find(x => x.id === id); if (!b) return;
    b.clientName = document.getElementById('ebClient')?.value?.trim() || b.clientName;
    b.petName = document.getElementById('ebPet')?.value?.trim() || b.petName;
    b.service = document.getElementById('ebService')?.value || b.service;
    b.amount = parseFloat(document.getElementById('ebAmount')?.value) ?? b.amount;
    b.date = document.getElementById('ebDate')?.value || b.date;
    b.time = document.getElementById('ebTime')?.value || b.time;
    b.dropoffTime = document.getElementById('ebDropoff')?.value || '';
    b.endDate = document.getElementById('ebEndDate')?.value || '';
    b.pickupTime = document.getElementById('ebPickup')?.value || '';
    b.pickupAddr = document.getElementById('ebPickupAddr')?.value || '';
    b.dropoffAddr = document.getElementById('ebDropoffAddr')?.value || '';
    b.sitter = document.getElementById('ebSitter')?.value || '';
    b.status = document.getElementById('ebStatus')?.value || b.status;
    b.notes = document.getElementById('ebNotes')?.value?.trim() || '';
    save('bookings', bookings); closeModal(); renderTab();
};

const editReview = (id) => {
    const r = reviews.find(x => x.id === id); if (!r) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit Review</div>
        <div class="form-row"><div class="form-group"><label class="form-label">Client</label><input class="form-input" id="erName" value="${escHTML(r.name || '')}"></div><div class="form-group"><label class="form-label">Pet</label><input class="form-input" id="erPet" value="${escHTML(r.pet || '')}"></div></div>
        <div class="form-group"><label class="form-label">Stars</label><select class="form-select" id="erStars">${[5,4,3,2,1].map(s => `<option ${r.stars === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Review</label><textarea class="form-textarea" id="erText" rows="3">${escHTML(r.text || '')}</textarea></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditReview('${r.id}')">Save</button></div>
    </div>`; overlay.classList.add('open');
};
const saveEditReview = (id) => {
    const r = reviews.find(x => x.id === id); if (!r) return;
    r.name = document.getElementById('erName')?.value?.trim() || r.name;
    r.pet = document.getElementById('erPet')?.value?.trim() || '';
    r.stars = parseInt(document.getElementById('erStars')?.value) || r.stars;
    r.text = document.getElementById('erText')?.value?.trim() || '';
    save('reviews', reviews); closeModal(); renderTab();
};

// Init
renderTab();
// Notification bell
if (typeof GPC_NOTIFY !== 'undefined') {
    GPC_NOTIFY.renderBell('notifBell', 'admin');
    setInterval(() => GPC_NOTIFY.renderBell('notifBell', 'admin'), 10000);
}
