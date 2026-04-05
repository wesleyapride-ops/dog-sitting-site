// ============================================
// GenusPupClub Dashboard — Full Platform
// Ultra-customizable services, pricing, packages
// ============================================

// ---- Auth Guard ----
const _adminSession = JSON.parse(sessionStorage.getItem('gpc_admin_auth') || 'null');
if (!_adminSession || !_adminSession.email) { window.location.href = 'admin-login.html'; }

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

// Global helper: toggle custom text input when "__custom" is selected in a dropdown
window.handleCustomSelect = (selectEl, customInputId) => {
    const customInput = document.getElementById(customInputId);
    if (!customInput) return;
    if (selectEl.value === '__custom') { customInput.style.display = 'block'; customInput.focus(); }
    else { customInput.style.display = 'none'; customInput.value = ''; }
};
// Helper to resolve dropdown value — returns custom input value if "__custom" selected
window.resolveDropdown = (selectId, customId) => {
    const sel = document.getElementById(selectId)?.value?.trim() || '';
    const custom = document.getElementById(customId)?.value?.trim() || '';
    return (sel === '__custom' || sel === '') ? custom : sel;
};

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
    address: 'Richmond, VA', taxRate: 0, extraDogFee: 10, recurringDiscount: 15, pickupFee: 10, dropoffFee: 10,
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

    const views = { overview: renderOverview, bookings: renderBookings, clients: renderClients, pets: renderPets, schedule: renderSchedule, revenue: renderRevenue, payments: renderPaymentsAdmin, reviews: renderReviews, sitters: renderSitters, properties: renderProperties, checkin: renderCheckIn, gallery: renderGallery, messages: renderMessages, emails: renderEmailCenter, loyalty: renderLoyalty, waivers: renderWaivers, infamy: renderInfamy, approvals: renderApprovals, satisfaction: renderSatisfaction, feedback: renderFeedback, website: renderWebsiteEditor, settings: renderSettings };
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
    const todayBookings = getBookingsForDate(todayStr());
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
                    <div class="schedule-item" style="cursor:pointer" onclick="editBooking('${b.id}')">
                        <div class="schedule-time">${b.time || '—'}</div>
                        <div class="schedule-info"><h4>${escHTML(b.clientName)} — ${escHTML(b.petName)}</h4><p>${escHTML(b.service)} ${b.sitter ? `<span style="font-size:.78rem;color:#8B5CF6">🧑 ${escHTML(b.sitter)}</span>` : ''} ${b.dropoffTime ? `<span style="font-size:.78rem;color:var(--text-muted)">Drop: ${b.dropoffTime}</span>` : ''} ${b.pickupTime ? `<span style="font-size:.78rem;color:var(--text-muted)">Pick: ${b.pickupTime}</span>` : ''} ${b.addons?.length ? `+ ${b.addons.length} add-on${b.addons.length > 1 ? 's' : ''}` : ''} <span class="badge badge-${b.status}">${b.status}</span> <strong>${fmt(calcBookingTotal(b))}</strong></p></div>
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
                <button class="btn btn-sm btn-ghost" onclick="sendTomorrowReminders()">📧 Send Tomorrow's Reminders</button>
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
    else if (filter === 'unpaid') filtered = filtered.filter(b => b.status === 'completed' && b.paymentStatus !== 'paid');
    filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    el.innerHTML = `
        <div class="card" style="margin-bottom:16px;padding:12px 20px;display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                ${['all', 'today', 'upcoming', 'pending', 'completed', 'unpaid'].map(f => `<button class="btn btn-sm ${f === 'all' ? 'btn-primary' : 'btn-ghost'}" onclick="this.parentElement.querySelectorAll('.btn').forEach(b=>{b.className='btn btn-sm btn-ghost'});this.className='btn btn-sm btn-primary';document.querySelector('.booking-filter-active')?.classList.remove('booking-filter-active');this.classList.add('booking-filter-active');this.dataset.filter='${f}';renderTab()">${f.charAt(0).toUpperCase() + f.slice(1)}</button>`).join('')}
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
        <thead><tr><th>Drop-Off</th><th>Pick-Up</th><th>Client</th><th>Pet</th><th>Service</th><th>Add-ons</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>${items.length ? items.map(b => {
            const fmtDT = (dt) => { if (!dt) return '—'; const [d, t] = dt.split('T'); if (!t) return d; const [h, m] = t.split(':'); const hr = parseInt(h); const ampm = hr >= 12 ? 'PM' : 'AM'; const h12 = hr % 12 || 12; return d + '<br><span style="font-size:.78rem;color:var(--text-muted)">' + h12 + ':' + m + ' ' + ampm + '</span>'; };
            const days = b.dropoffTime && b.pickupTime ? calcDays(b.dropoffTime.split('T')[0], b.pickupTime.split('T')[0]) : 0;
            const dayLabel = days > 0 ? ` <span style="font-size:.72rem;color:var(--primary)">(${days} day${days > 1 ? 's' : ''})</span>` : '';
            return `<tr>
            <td style="font-size:.85rem">${fmtDT(b.dropoffTime)}</td><td style="font-size:.85rem">${fmtDT(b.pickupTime)}${dayLabel}</td><td>${escHTML(b.clientName)}</td><td>${escHTML(b.petName)}</td>
            <td>${escHTML(b.service)}${b.pickupAddr ? `<br><span style="font-size:.72rem;color:var(--text-muted)">From: ${escHTML(b.pickupAddr)}</span>` : ''}</td>
            <td>${b.addons?.length ? b.addons.map(a => `<span class="badge badge-completed">${escHTML(a)}</span>`).join(' ') : '—'}</td>
            <td><strong>${fmt(calcBookingTotal(b))}</strong></td>
            <td><span class="badge badge-${b.status}">${b.status}</span>${b.status === 'completed' ? ` <span class="badge badge-${b.paymentStatus === 'paid' ? 'confirmed' : 'pending'}" style="font-size:.68rem">${b.paymentStatus === 'paid' ? 'paid' : 'unpaid'}</span>` : ''}</td>
            <td style="white-space:nowrap">
                ${b.status === 'pending' ? `<button class="btn btn-ghost btn-sm" onclick="updateBooking('${b.id}','confirmed')">✓</button>` : ''}
                ${b.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" onclick="updateBooking('${b.id}','completed')">Done</button>` : ''}
                ${b.status === 'completed' && b.paymentStatus !== 'paid' ? `<button class="btn btn-ghost btn-sm" style="color:var(--primary);font-weight:600" onclick="showPaymentFlow('${b.id}')">Pay</button>` : ''}
                <button class="btn btn-ghost btn-sm" onclick="editBooking('${b.id}')">✎</button>
                <button class="btn btn-ghost btn-sm" onclick="deleteItem('bookings','${b.id}')">✕</button>
            </td>
        </tr>`; }).join('') : '<tr><td colspan="9" class="empty">No bookings</td></tr>'}</tbody>
    </table></div>
`;

const calcDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    const diff = Math.round((e - s) / 86400000);
    return diff > 0 ? diff : 1;
};

const calcBookingTotal = (b) => {
    const baseRate = parseFloat(b.amount) || 0;
    const days = calcDays(b.date, b.endDate);
    const numDogs = b.numDogs || ((b.extraDogs || 0) + 1);
    // Charge full base rate per dog per day
    let total = baseRate * numDogs * days;
    // Add-ons (flat, once per booking)
    if (b.addons?.length) {
        b.addons.forEach(aName => {
            const addon = addons.find(a => a.name === aName);
            if (addon) total += addon.price;
        });
    }
    // Zone surcharge (once per booking)
    if (b.zone) {
        const zone = zones.find(z => z.name === b.zone);
        if (zone) total += zone.surcharge;
    }
    // Pickup/dropoff fees
    if (b.pickupAddr) total += parseFloat(businessSettings.pickupFee) || 0;
    if (b.dropoffAddr) total += parseFloat(businessSettings.dropoffFee) || 0;
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
                <div class="pet-avatar" style="cursor:pointer" onclick="showPetHistory('${p.id}')">${p.photo ? `<img src="${p.photo}" style="width:48px;height:48px;object-fit:cover;border-radius:50%">` : '🐕'}</div>
                <div class="pet-info" style="flex:1">
                    <h4><span style="cursor:pointer;text-decoration:underline dotted" onclick="showPetHistory('${p.id}')">${escHTML(p.name)}</span> <span style="float:right"><button class="btn btn-ghost btn-sm" onclick="showPetHistory('${p.id}')">📋</button> <button class="btn btn-ghost btn-sm" onclick="editPet('${p.id}')">✎</button> <button class="btn btn-ghost btn-sm" onclick="deleteItem('pets','${p.id}')">✕</button></span></h4>
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

// ---- Pet History Modal (Enhanced Full Profile) ----
const showPetHistory = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    const owner = clients.find(c => c.id === pet.clientId);
    const petBookings = bookings.filter(b => b.petName === pet.name || (b.petName && b.petName.includes(pet.name))).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const petCheckins = (load('checkins', []) || []).filter(c => c.petName === pet.name).sort((a, b) => (b.checkInDate || '').localeCompare(a.checkInDate || ''));
    const petInfamy = (load('infamy', []) || []).filter(i => i.dogName === pet.name);
    const totalSpent = petBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + calcBookingTotal(b), 0);

    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal" style="max-width:800px;max-height:90vh;overflow-y:auto">
        <div style="text-align:center;padding:16px;background:var(--bg);border-radius:8px;margin-bottom:16px">
            ${pet.photo ? `<img src="${pet.photo}" style="width:140px;height:140px;object-fit:cover;border-radius:50%;border:3px solid var(--primary);margin-bottom:12px">` : '<div style="font-size:80px;margin-bottom:12px">🐕</div>'}
            <div class="modal-title" style="margin:0;font-size:1.6rem">${escHTML(pet.name)}</div>
            <div style="font-size:.95rem;color:var(--text-muted);margin-top:4px">${escHTML(pet.breed || '?')} · ${escHTML(pet.age || '?')} old · ${escHTML(pet.weight || '?')} · ${pet.gender === 'Female' ? '♀' : '♂'} · ${pet.fixed === 'Yes' ? '✓ Fixed' : '✗ Intact'}</div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
            <div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px">
                <div style="font-size:1.3rem;font-weight:700;color:var(--primary)">${petBookings.length}</div>
                <div style="font-size:.75rem;color:var(--text-muted)">Bookings</div>
            </div>
            <div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px">
                <div style="font-size:1.3rem;font-weight:700;color:var(--success)">${petCheckins.length}</div>
                <div style="font-size:.75rem;color:var(--text-muted)">Check-Ins</div>
            </div>
            <div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px">
                <div style="font-size:1.3rem;font-weight:700;color:var(--info)">${fmt(totalSpent)}</div>
                <div style="font-size:.75rem;color:var(--text-muted)">Total Spent</div>
            </div>
            <div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px">
                <div style="font-size:1.3rem;font-weight:700">${petInfamy.length}</div>
                <div style="font-size:.75rem;color:var(--text-muted)">Infamy Flags</div>
            </div>
        </div>

        <div style="background:var(--bg);padding:12px;border-radius:8px;margin-bottom:14px">
            <div style="font-weight:600;margin-bottom:8px;font-size:.9rem">Owner Information</div>
            <div style="font-size:.85rem;display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div><strong>Name:</strong> ${escHTML(owner?.name || '—')}</div>
                <div><strong>Phone:</strong> ${escHTML(owner?.phone || '—')}</div>
                <div style="grid-column:1/-1"><strong>Email:</strong> ${escHTML(owner?.email || '—')}</div>
            </div>
        </div>

        <div style="background:var(--bg);padding:12px;border-radius:8px;margin-bottom:14px">
            <div style="font-weight:600;margin-bottom:8px;font-size:.9rem">Medical & Care Info</div>
            <div style="font-size:.85rem;display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div><strong>Vet:</strong> ${escHTML(pet.vet || '—')}</div>
                <div><strong>Feeding Schedule:</strong> ${escHTML(pet.feedingSchedule || '—')}</div>
                ${pet.allergies ? `<div style="grid-column:1/-1;color:var(--danger)"><strong>Allergies:</strong> ${escHTML(pet.allergies)}</div>` : '<div style="grid-column:1/-1"><strong>Allergies:</strong> None</div>'}
                ${pet.medications ? `<div style="grid-column:1/-1;color:var(--info)"><strong>Medications:</strong> ${escHTML(pet.medications)}</div>` : '<div style="grid-column:1/-1"><strong>Medications:</strong> None</div>'}
            </div>
        </div>

        <div style="background:var(--bg);padding:12px;border-radius:8px;margin-bottom:14px">
            <div style="font-weight:600;margin-bottom:8px;font-size:.9rem">Temperament & Preferences</div>
            <div style="font-size:.85rem;display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div><strong>Preferred Sitter:</strong> ${escHTML(pet.preferredSitter || '—')}</div>
                <div><strong>Coat Type:</strong> ${escHTML(pet.coatType || '—')}</div>
                <div><strong>Groom Frequency:</strong> ${escHTML(pet.groomFrequency || '—')}</div>
                <div><strong>Shampoo:</strong> ${escHTML(pet.shampoo || '—')}</div>
            </div>
            ${pet.tags ? `<div style="margin-top:8px"><strong>Tags:</strong> ${(pet.tags || '').split(',').filter(t => t.trim()).map(t => `<span class="pet-tag">${escHTML(t.trim())}</span>`).join('')}</div>` : ''}
            ${pet.groomNotes ? `<div style="margin-top:8px"><strong>Grooming Notes:</strong> ${escHTML(pet.groomNotes)}</div>` : ''}
        </div>

        ${pet.notes ? `<div style="background:var(--bg);padding:12px;border-radius:8px;margin-bottom:14px">
            <div style="font-weight:600;margin-bottom:8px;font-size:.9rem">Special Notes</div>
            <div style="font-size:.85rem">${escHTML(pet.notes)}</div>
        </div>` : ''}

        ${petInfamy.length ? `<div style="padding:10px;background:rgba(225,112,85,.1);border-left:3px solid var(--danger);border-radius:4px;margin-bottom:14px;font-size:.85rem">
            <strong>⚠️ Infamy Flags:</strong>
            <div style="margin-top:6px">${petInfamy.map(i => `<div>• ${escHTML(i.issueType)} (${i.severity}): ${escHTML(i.notes || '')}</div>`).join('')}</div>
        </div>` : ''}

        <div style="font-weight:600;margin-bottom:8px;font-size:.9rem">Booking History (${petBookings.length})</div>
        <div style="max-height:250px;overflow-y:auto;margin-bottom:14px;border:1px solid var(--border);border-radius:6px">
            ${petBookings.length ? petBookings.slice(0, 20).map(b => `<div style="padding:10px;border-bottom:1px solid var(--border);font-size:.83rem;display:flex;justify-content:space-between">
                <div><strong>${b.date || '—'}</strong> ${b.time || ''} · ${escHTML(b.service)} <span class="badge badge-${b.status}" style="font-size:.7rem">${b.status}</span></div>
                <div style="text-align:right"><strong>${fmt(calcBookingTotal(b))}</strong>${b.sitter ? '<br><span style="font-size:.7rem;color:var(--text-muted)">Sitter: ' + escHTML(b.sitter) + '</span>' : ''}</div>
            </div>`).join('') : '<div style="padding:10px;font-size:.83rem;color:var(--text-muted);text-align:center">No bookings yet</div>'}
        </div>

        ${petCheckins.length ? `<div>
            <div style="font-weight:600;margin-bottom:8px;font-size:.9rem">Check-In History (${petCheckins.length})</div>
            <div style="max-height:200px;overflow-y:auto;margin-bottom:14px;border:1px solid var(--border);border-radius:6px">
                ${petCheckins.slice(0, 20).map(c => `<div style="padding:10px;border-bottom:1px solid var(--border);font-size:.82rem">
                    ${c.checkInDate} ${c.checkInTime || ''} → ${c.checkedOut ? c.checkOutDate + ' ' + (c.checkOutTime || '') : '<span style="color:var(--primary)">Still checked in</span>'} · ${escHTML(c.service)} · ${escHTML(c.property || '')}
                </div>`).join('')}
            </div>
        </div>` : ''}

        <div class="modal-footer" style="display:flex;gap:8px;justify-content:space-between">
            <div style="display:flex;gap:6px">
                <button class="btn btn-primary btn-sm" onclick="editPet('${petId}')">Edit Pet</button>
                <button class="btn btn-secondary btn-sm" onclick="addQuickBooking('${petId}')">Add Booking</button>
                ${petInfamy.length ? `<button class="btn btn-ghost btn-sm" onclick="viewPetInfamy('${petId}')">View Infamy</button>` : `<button class="btn btn-ghost btn-sm" onclick="sendToInfamy('${petId}')">Report Issue</button>`}
            </div>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    </div>`;
    overlay.classList.add('open');
};

// Quick action functions for pet profile
const addQuickBooking = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
        closeModal();
        activeTab = 'bookings';
        renderTab();
        setTimeout(() => {
            document.getElementById('addBookingForm')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
};

const sendToInfamy = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    const severity = prompt('Issue severity (low/medium/high):');
    if (!severity) return;
    const issueType = prompt('Issue type (e.g., Aggression, Anxiety, Biting):');
    if (!issueType) return;
    const notes = prompt('Brief notes:');
    const infamy = load('infamy', []);
    infamy.push({ id: uid(), dogName: pet.name, severity: severity.toLowerCase(), issueType: issueType, notes: notes || '', dateReported: todayStr() });
    save('infamy', infamy);
    alert('Issue reported to infamy list');
    showPetHistory(petId);
};

const viewPetInfamy = (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    const infamy = load('infamy', []);
    const petInfamy = infamy.filter(i => i.dogName === pet.name);
    if (petInfamy.length === 0) { alert('No infamy records'); return; }
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal">
        <div class="modal-title">Infamy Records — ${escHTML(pet.name)}</div>
        ${petInfamy.map((inf, idx) => `
            <div style="padding:10px;background:var(--bg);border-radius:6px;margin-bottom:10px">
                <div><strong>${escHTML(inf.issueType)}</strong> <span style="color:var(--danger);font-weight:600">${inf.severity.toUpperCase()}</span></div>
                <div style="font-size:.85rem;margin-top:4px">${escHTML(inf.notes || inf.description || '')}</div>
                <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px">Reported: ${inf.dateReported || 'N/A'}</div>
                <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="editInfamy('${inf.id}')">Edit</button>
            </div>
        `).join('')}
        <div class="modal-footer"><button class="btn btn-primary" onclick="closeModal()">Close</button></div>
    </div>`;
    overlay.classList.add('open');
};

// ============================================
// SCHEDULE
// ============================================
// ---- Calendar State ----
let calView = 'month'; // 'month' or 'week'
let calDate = new Date(); // Current viewed month/week anchor

const getBookingsForDate = (dateStr) => bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    if (b.date === dateStr) return true;
    if (b.date && b.endDate && b.date <= dateStr && b.endDate >= dateStr) return true;
    return false;
}).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

const calNav = (dir) => {
    if (calView === 'month') calDate.setMonth(calDate.getMonth() + dir);
    else calDate.setDate(calDate.getDate() + (dir * 7));
    renderSchedule();
};
const calToday = () => { calDate = new Date(); renderSchedule(); };
const calSetView = (v) => { calView = v; renderSchedule(); };
const calShowDay = (dateStr) => {
    const dayBkgs = getBookingsForDate(dateStr);
    const label = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const dayRev = dayBkgs.reduce((s, b) => s + calcBookingTotal(b), 0);
    const checkins = load('checkins', []).filter(c => c.checkInDate === dateStr);

    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal" style="max-width:600px">
        <div class="modal-title">${label}</div>
        <div style="display:flex;gap:12px;margin-bottom:12px">
            <div style="flex:1;padding:10px;background:var(--bg-alt);border-radius:8px;text-align:center"><div style="font-size:1.2rem;font-weight:700">${dayBkgs.length}</div><div style="font-size:.75rem;color:var(--text-muted)">Bookings</div></div>
            <div style="flex:1;padding:10px;background:var(--bg-alt);border-radius:8px;text-align:center"><div style="font-size:1.2rem;font-weight:700">${checkins.length}</div><div style="font-size:.75rem;color:var(--text-muted)">Check-ins</div></div>
            <div style="flex:1;padding:10px;background:var(--bg-alt);border-radius:8px;text-align:center"><div style="font-size:1.2rem;font-weight:700;color:var(--primary)">${fmt(dayRev)}</div><div style="font-size:.75rem;color:var(--text-muted)">Revenue</div></div>
        </div>
        ${dayBkgs.length ? `<div style="max-height:350px;overflow-y:auto">${dayBkgs.map(b => `
            <div style="padding:10px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:flex-start;cursor:pointer" onclick="closeModal();editBooking('${b.id}')">
                <div style="min-width:50px;font-weight:600;color:var(--primary);font-size:.9rem">${b.time || '—'}</div>
                <div style="flex:1">
                    <div style="font-weight:600;font-size:.9rem">${escHTML(b.clientName)} — ${escHTML(b.petName)}</div>
                    <div style="font-size:.82rem;color:var(--text-muted)">${escHTML(b.service)} ${b.sitter ? '· 🧑 ' + escHTML(b.sitter) : ''}</div>
                    <div style="margin-top:4px"><span class="badge badge-${b.status}">${b.status}</span> <strong style="font-size:.85rem">${fmt(calcBookingTotal(b))}</strong></div>
                </div>
            </div>
        `).join('')}</div>` : '<div class="empty" style="padding:20px">No bookings this day</div>'}
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">Close</button>
            <button class="btn btn-primary" onclick="closeModal();showModal('booking')">+ New Booking</button>
        </div>
    </div>`;
    overlay.classList.add('open');
};

// Make calendar nav functions global
window.calNav = calNav;
window.calToday = calToday;
window.calSetView = calSetView;
window.calShowDay = calShowDay;

const renderSchedule = () => {
    const today = todayStr();

    // Stats for next 7 days
    const upcoming7 = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        const key = d.toISOString().split('T')[0];
        upcoming7.push({ date: key, count: getBookingsForDate(key).length, revenue: getBookingsForDate(key).reduce((s, b) => s + calcBookingTotal(b), 0) });
    }
    const totalWeekBookings = upcoming7.reduce((s, d) => s + d.count, 0);
    const totalWeekRevenue = upcoming7.reduce((s, d) => s + d.revenue, 0);
    const todayBkgs = getBookingsForDate(today);
    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    // Sitter workload for week
    const sitterLoad = {};
    upcoming7.forEach(d => getBookingsForDate(d.date).forEach(b => { if (b.sitter) sitterLoad[b.sitter] = (sitterLoad[b.sitter] || 0) + 1; }));

    let calendarHTML = '';

    if (calView === 'month') {
        // ---- MONTH VIEW ----
        const year = calDate.getFullYear(), month = calDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthLabel = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        let cells = '';
        // Empty cells for days before first
        for (let i = 0; i < firstDay; i++) cells += '<div style="min-height:80px"></div>';

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayBkgs = getBookingsForDate(dateStr);
            const isToday = dateStr === today;
            const isPast = dateStr < today;
            const statusColors = { pending: '#FDCB6E', confirmed: '#00B894', completed: '#6C5CE7' };

            cells += `<div style="min-height:80px;padding:4px;border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:all .15s;${isToday ? 'background:rgba(255,107,53,.06);border-color:var(--primary)' : isPast ? 'opacity:.6' : 'background:var(--card-bg)'}" onclick="calShowDay('${dateStr}')" onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 2px 8px rgba(0,0,0,.08)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="font-size:.78rem;font-weight:${isToday ? '700' : '600'};color:${isToday ? 'var(--primary)' : 'var(--text)'};margin-bottom:2px">${d}${isToday ? ' <span style="font-size:.65rem;background:var(--primary);color:#fff;padding:1px 5px;border-radius:4px;vertical-align:middle">TODAY</span>' : ''}</div>
                ${dayBkgs.slice(0, 3).map(b => `<div style="font-size:.65rem;padding:2px 4px;margin-bottom:1px;border-radius:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:${statusColors[b.status] || '#ddd'}20;border-left:2px solid ${statusColors[b.status] || '#aaa'};color:var(--text)">${b.time ? b.time.substring(0, 5) + ' ' : ''}${escHTML(b.petName)}</div>`).join('')}
                ${dayBkgs.length > 3 ? `<div style="font-size:.6rem;color:var(--text-muted);text-align:center">+${dayBkgs.length - 3} more</div>` : ''}
                ${dayBkgs.length === 0 ? '' : `<div style="font-size:.6rem;color:var(--text-muted);text-align:right;margin-top:1px">${fmt(dayBkgs.reduce((s, b) => s + calcBookingTotal(b), 0))}</div>`}
            </div>`;
        }

        calendarHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <div style="display:flex;align-items:center;gap:8px">
                    <button class="btn btn-ghost btn-sm" onclick="calNav(-1)" style="font-size:1.1rem;padding:4px 10px">←</button>
                    <h3 style="margin:0;font-size:1.15rem;min-width:180px;text-align:center">${monthLabel}</h3>
                    <button class="btn btn-ghost btn-sm" onclick="calNav(1)" style="font-size:1.1rem;padding:4px 10px">→</button>
                    <button class="btn btn-ghost btn-sm" onclick="calToday()" style="font-size:.8rem">Today</button>
                </div>
                <div style="display:flex;gap:4px">
                    <button class="btn btn-sm ${calView === 'month' ? 'btn-primary' : 'btn-ghost'}" onclick="calSetView('month')">Month</button>
                    <button class="btn btn-sm ${calView === 'week' ? 'btn-primary' : 'btn-ghost'}" onclick="calSetView('week')">Week</button>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;margin-bottom:4px">
                ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div style="text-align:center;font-size:.75rem;font-weight:600;color:var(--text-muted);padding:6px 0">${d}</div>`).join('')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${cells}</div>
        `;
    } else {
        // ---- WEEK VIEW ----
        const startOfWeek = new Date(calDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const weekLabel = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' — ' + new Date(startOfWeek.getTime() + 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let weekDays = '';
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek); d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayBkgs = getBookingsForDate(dateStr);
            const isToday = dateStr === today;
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const dayRevenue = dayBkgs.reduce((s, b) => s + calcBookingTotal(b), 0);

            weekDays += `
                <div style="margin-bottom:16px;${isToday ? 'background:rgba(255,107,53,.04);padding:12px;border-radius:8px;border-left:3px solid var(--primary)' : 'padding:12px 0;border-bottom:1px solid var(--border)'}">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        <div style="font-weight:600;font-size:.95rem;${isToday ? 'color:var(--primary)' : ''}">${dayLabel}${isToday ? ' (Today)' : ''}</div>
                        <div style="font-size:.82rem;color:var(--text-muted)">${dayBkgs.length} bookings · ${fmt(dayRevenue)}</div>
                    </div>
                    ${dayBkgs.length ? dayBkgs.map(b => `
                        <div class="schedule-item" style="cursor:pointer" onclick="editBooking('${b.id}')">
                            <div class="schedule-time">${b.time || '—'}</div>
                            <div class="schedule-info">
                                <h4>${escHTML(b.clientName)} — ${escHTML(b.petName)}</h4>
                                <p>${escHTML(b.service)} ${b.sitter ? `<span style="font-size:.78rem;color:#8B5CF6">🧑 ${escHTML(b.sitter)}</span>` : ''} ${b.dropoffTime ? `<span style="font-size:.78rem;color:var(--text-muted)">Drop: ${b.dropoffTime}</span>` : ''} ${b.pickupTime ? `<span style="font-size:.78rem;color:var(--text-muted)">Pick: ${b.pickupTime}</span>` : ''} <span class="badge badge-${b.status}">${b.status}</span> <strong>${fmt(calcBookingTotal(b))}</strong></p>
                            </div>
                        </div>
                    `).join('') : '<div style="font-size:.85rem;color:var(--text-muted);padding:4px 0">No bookings</div>'}
                </div>`;
        }

        calendarHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <div style="display:flex;align-items:center;gap:8px">
                    <button class="btn btn-ghost btn-sm" onclick="calNav(-1)" style="font-size:1.1rem;padding:4px 10px">←</button>
                    <h3 style="margin:0;font-size:1.05rem;min-width:220px;text-align:center">${weekLabel}</h3>
                    <button class="btn btn-ghost btn-sm" onclick="calNav(1)" style="font-size:1.1rem;padding:4px 10px">→</button>
                    <button class="btn btn-ghost btn-sm" onclick="calToday()" style="font-size:.8rem">Today</button>
                </div>
                <div style="display:flex;gap:4px">
                    <button class="btn btn-sm ${calView === 'month' ? 'btn-primary' : 'btn-ghost'}" onclick="calSetView('month')">Month</button>
                    <button class="btn btn-sm ${calView === 'week' ? 'btn-primary' : 'btn-ghost'}" onclick="calSetView('week')">Week</button>
                </div>
            </div>
            ${weekDays}
        `;
    }

    el.innerHTML = `
        <div class="stats-grid" style="margin-bottom:16px">
            <div class="stat-card"><div class="stat-label">Today</div><div class="stat-value">${todayBkgs.length}</div><div class="stat-sub">${fmt(todayBkgs.reduce((s, b) => s + calcBookingTotal(b), 0))}</div></div>
            <div class="stat-card blue"><div class="stat-label">This Week</div><div class="stat-value">${totalWeekBookings}</div><div class="stat-sub">${fmt(totalWeekRevenue)}</div></div>
            <div class="stat-card yellow"><div class="stat-label">Pending</div><div class="stat-value">${pendingCount}</div><div class="stat-sub">need confirmation</div></div>
            <div class="stat-card green"><div class="stat-label">Active Sitters</div><div class="stat-value">${Object.keys(sitterLoad).length}</div><div class="stat-sub">${Object.entries(sitterLoad).map(([n, c]) => escHTML(n) + ': ' + c).join(', ') || 'none assigned'}</div></div>
        </div>

        <div class="card" style="padding:16px">${calendarHTML}</div>

        ${todayBkgs.length ? `
        <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">Today's Schedule (${todayBkgs.length})</span></div>
            ${todayBkgs.map(b => `
                <div class="schedule-item" style="cursor:pointer" onclick="editBooking('${b.id}')">
                    <div class="schedule-time">${b.time || '—'}</div>
                    <div class="schedule-info"><h4>${escHTML(b.clientName)} — ${escHTML(b.petName)}</h4><p>${escHTML(b.service)} ${b.sitter ? `<span style="font-size:.78rem;color:#8B5CF6">🧑 ${escHTML(b.sitter)}</span>` : ''} <span class="badge badge-${b.status}">${b.status}</span> <strong>${fmt(calcBookingTotal(b))}</strong></p></div>
                </div>
            `).join('')}
        </div>` : ''}
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
    const totalTips = paid.reduce((s, p) => s + (parseFloat(p.tip) || 0), 0);
    const totalPending = pending.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

    // Tax calculations — tips are taxable income, expenses are deductible
    const taxRate = parseFloat(businessSettings.taxRate) || 0;
    const taxableIncome = grossIncome + totalTips;
    const taxableProfit = Math.max(0, taxableIncome - totalExpenses);
    const taxOwed = taxableProfit * (taxRate / 100);
    const netIncome = taxableIncome - totalExpenses - taxOwed;

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
    const quarterIncome = quarterMonths.reduce((s, m) => s + (monthlyData[m]?.income || 0) + (monthlyData[m]?.tips || 0), 0);
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
            <div class="stat-card"><div class="stat-label">Profit Margin</div><div class="stat-value">${taxableIncome > 0 ? Math.round((netIncome / taxableIncome) * 100) : 0}%</div></div>
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
                    const tax = (d.income + d.tips) * (taxRate / 100);
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
                    ${s.photo ? `<img src="${s.photo}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;flex-shrink:0">` : `<div style="width:56px;height:56px;border-radius:50%;background:${s.status === 'active' ? 'var(--primary)' : '#6B7280'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.2rem;flex-shrink:0">${s.name.split(' ').map(n => n[0]).join('')}</div>`}
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

window.previewSitterPhoto = (input, targetId) => {
    if (!input.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        document.getElementById(targetId).value = dataUrl;
        // Show visual preview
        let preview = input.parentElement.querySelector('.photo-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'photo-preview';
            preview.style.cssText = 'margin-top:8px;text-align:center';
            input.parentElement.appendChild(preview);
        }
        preview.innerHTML = `<img src="${dataUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--primary)">`;
    };
    reader.readAsDataURL(input.files[0]);
};

const editSitter = (id) => {
    const s = sitters.find(x => x.id === id);
    if (!s) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal">
        <div class="modal-title">Edit: ${escHTML(s.name)}</div>
        ${s.photo ? `<div style="text-align:center;margin-bottom:12px"><img src="${s.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover"></div>` : ''}
        <div class="form-group"><label class="form-label">Photo</label><input type="file" accept="image/*" class="form-input" id="esSitterPhoto" onchange="previewSitterPhoto(this,'esSitterPhotoData')"><input type="hidden" id="esSitterPhotoData" value="${s.photo || ''}"></div>
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
    const newPhoto = document.getElementById('esSitterPhotoData')?.value;
    if (newPhoto) s.photo = newPhoto;
    save('sitters', sitters);
    closeModal(); renderTab();
};

const paySitter = (id, name, owed) => {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }

    // Build payment method options from configured handles
    const paymentMethods = ['Cash', 'Direct Deposit'];
    if (businessSettings.cashAppHandle) paymentMethods.push('CashApp');
    if (businessSettings.venmoHandle) paymentMethods.push('Venmo');
    if (businessSettings.zelleHandle) paymentMethods.push('Zelle');
    if (businessSettings.checkPayable) paymentMethods.push('Check');
    if (businessSettings.paypalHandle) paymentMethods.push('PayPal');
    if (businessSettings.googlePayHandle) paymentMethods.push('Google Pay');
    if (businessSettings.applePayHandle) paymentMethods.push('Apple Pay');
    if (businessSettings.stripeHandle) paymentMethods.push('Stripe');
    const methodOptions = paymentMethods.map(m => `<option>${m}</option>`).join('');

    overlay.innerHTML = `<div class="modal">
        <div class="modal-title">Pay: ${escHTML(name)}</div>
        ${owed > 0 ? `<div style="padding:12px;background:rgba(255,107,53,.05);border-radius:8px;margin-bottom:12px;font-size:.9rem"><strong>Owed:</strong> <span style="color:var(--primary);font-weight:700">${fmt(owed)}</span></div>` : '<div style="padding:12px;background:rgba(0,184,148,.05);border-radius:8px;margin-bottom:12px;font-size:.9rem;color:var(--success)">All settled up!</div>'}
        <div class="form-row"><div class="form-group"><label class="form-label">Amount</label><input class="form-input" id="spAmount" type="number" step="0.01" value="${owed > 0 ? owed.toFixed(2) : ''}"></div><div class="form-group"><label class="form-label">Date</label><input class="form-input" id="spDate" type="date" value="${todayStr()}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Method</label><select class="form-select" id="spMethod">${methodOptions}</select></div><div class="form-group"><label class="form-label">Period</label><input class="form-input" id="spPeriod" placeholder="e.g. Week of Mar 28"></div></div>
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
                        <button class="btn btn-ghost btn-sm" onclick="sendReportCardEmail('${c.id}')" style="margin-left:4px">📧 Report Card</button>
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
                                <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">
                                    <button class="btn btn-ghost btn-sm" onclick="sendPhotoToOwner('${p.id}','sms')" title="Text to owner">📱 Text</button>
                                    <button class="btn btn-ghost btn-sm" onclick="sendPhotoToOwner('${p.id}','email')" title="Email to owner">📧 Email</button>
                                    <button class="btn btn-ghost btn-sm" onclick="deletePhoto('${p.id}')">✕</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('') : '<div class="card"><div class="empty"><div class="empty-icon">📸</div><p>No photos yet. Add photos during or after visits.</p></div></div>'}
    `;
};

const deletePhoto = (id) => { photos = photos.filter(p => p.id !== id); save('photos', photos); renderTab(); };

const sendPhotoToOwner = (photoId, method) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    // Find pet -> client
    const pet = pets.find(p => p.name === photo.petName);
    const client = pet?.clientId ? clients.find(c => c.id === pet.clientId) : null;
    const caption = photo.caption || photo.petName + ' — visit photo';

    if (method === 'sms') {
        const phone = client?.phone || prompt('Enter phone number to text:');
        if (!phone) return;
        const smsMsg = encodeURIComponent(`${caption}\n\nView ${photo.petName}'s photos at genuspupclub.com/portal.html\n\n— GenusPupClub`);
        window.open(`sms:${phone.replace(/\D/g, '')}?body=${smsMsg}`, '_blank');
    } else if (method === 'email') {
        const email = client?.email || prompt('Enter email address:');
        if (!email) return;
        if (typeof GPC_NOTIFY !== 'undefined') {
            GPC_NOTIFY.sendDirectEmail(email, client?.name || '', `📸 Photo of ${photo.petName} — GenusPupClub`, `Here's a photo of ${photo.petName} from their visit!\n\n${caption}\n\nView all photos in your portal: genuspupclub.com/portal.html`);
        }
    }
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Sent!', `Photo sent via ${method.toUpperCase()}`, 'success');
};

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
                    ${m.sendMethod === 'sms' ? '<span class="badge" style="background:rgba(0,184,148,0.1);color:#00b894">📱 SMS</span>' : m.sendMethod === 'both' ? '<span class="badge" style="background:rgba(0,184,148,0.1);color:#00b894">📱 SMS + 📧 Email</span>' : m.sendMethod === 'email' ? '<span class="badge" style="background:rgba(108,92,231,0.1);color:#6c5ce7">📧 Email</span>' : ''}
                    <button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="deleteItem('messages','${m.id}')">✕</button>
                </div>
            `).join('') : '<div class="empty"><div class="empty-icon">💬</div><p>No messages yet. Send updates to owners during visits.</p></div>'}
        </div>
    `;
};

// ============================================
// EMAIL CENTER
// ============================================
const renderEmailCenter = () => {
    const emailLog = load('email_log', []).slice().reverse();
    const templates = load('email_templates_custom', {});
    const autoSettings = load('email_auto_settings', {
        onBooking: true, onConfirm: true, onComplete: true, onCancel: true,
        onPayment: true, onWelcome: true, onPasswordReset: true, onInvoice: true,
        onReminder: false, onReportCard: false
    });
    const clientOptions = clients.map(c => `<option value="${c.id}" data-email="${escHTML(c.email || '')}">${escHTML(c.name)}${c.email ? ' (' + escHTML(c.email) + ')' : ''}</option>`).join('');

    // Default template names
    const templateNames = {
        booking_confirmation: 'Booking Confirmation',
        booking_confirmed: 'Booking Confirmed',
        visit_complete: 'Visit Complete',
        payment_receipt: 'Payment Receipt',
        invoice: 'Invoice',
        reminder: 'Day-Before Reminder',
        report_card: 'Report Card',
        message: 'Direct Message',
        welcome: 'Welcome / Signup Invite',
        password_reset: 'Password Reset',
        waitlist: 'Waitlist Spot Available'
    };

    el.innerHTML = `
        <!-- Compose Email -->
        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Compose Email</span></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">To</label><select class="form-select" id="emTo" onchange="const o=this.selectedOptions[0];document.getElementById('emToEmail').value=o?.dataset?.email||''"><option value="">Select client</option>${clientOptions}</select></div>
                <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" id="emToEmail" placeholder="or type email directly"></div>
            </div>
            <div class="form-group"><label class="form-label">Subject</label><input class="form-input" id="emSubject" placeholder="Email subject line"></div>
            <div class="form-group"><label class="form-label">Message</label><textarea class="form-textarea" id="emBody" rows="6" placeholder="Write your email..."></textarea></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
                <span style="font-size:.82rem;color:var(--text-muted);line-height:2">Quick templates:</span>
                <button class="btn btn-ghost btn-sm" onclick="fillEmailTemplate('visit_update')">Visit Update</button>
                <button class="btn btn-ghost btn-sm" onclick="fillEmailTemplate('booking_reminder')">Booking Reminder</button>
                <button class="btn btn-ghost btn-sm" onclick="fillEmailTemplate('checkout_ready')">Checkout Ready</button>
                <button class="btn btn-ghost btn-sm" onclick="fillEmailTemplate('payment_request')">Payment Request</button>
                <button class="btn btn-ghost btn-sm" onclick="fillEmailTemplate('thank_you')">Thank You</button>
                <button class="btn btn-ghost btn-sm" onclick="fillEmailTemplate('promo')">Promo / Offer</button>
            </div>
            <button class="btn btn-primary" onclick="sendComposeEmail()">Send Email</button>
        </div>

        <!-- Auto-Send Settings -->
        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Auto-Send Settings</span></div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">Toggle which emails are sent automatically. Turn off to send manually from here instead.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                ${Object.entries(autoSettings).map(([key, val]) => {
                    const label = key.replace('on', '').replace(/([A-Z])/g, ' $1').trim();
                    return `<label style="display:flex;gap:6px;align-items:center;font-size:.88rem;cursor:pointer;padding:8px;border-radius:8px;border:1px solid var(--border);background:${val ? 'rgba(0,184,148,.04)' : 'transparent'}">
                        <input type="checkbox" class="auto-email-toggle" data-key="${key}" ${val ? 'checked' : ''}>
                        <span>${label}</span>
                        <span style="margin-left:auto;font-size:.72rem;color:${val ? 'var(--accent)' : 'var(--text-muted)'}">${val ? 'AUTO' : 'MANUAL'}</span>
                    </label>`;
                }).join('')}
            </div>
            <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="saveAutoEmailSettings()">Save Auto-Send Settings</button>
        </div>

        <!-- Edit Templates -->
        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Email Templates</span></div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">Each template comes pre-filled and ready to use. Edit the subject and body to customize, or use as-is. Variables like {{clientName}}, {{petName}}, etc. are auto-replaced when sent.</p>
            <div class="form-group"><label class="form-label">Select Template</label><select class="form-select" id="emTemplateSelect" onchange="loadTemplateForEdit()">
                ${Object.entries(templateNames).map(([key, name]) => `<option value="${key}">${name}</option>`).join('')}
            </select></div>
            <div class="form-group"><label class="form-label">Subject</label><input class="form-input" id="emTemplateSubject" placeholder="Email subject line"></div>
            <div class="form-group"><label class="form-label">Body</label><textarea class="form-textarea" id="emTemplateBody" rows="8" placeholder="Email body — use {{clientName}}, {{petName}}, {{service}}, {{date}}, {{amount}}, {{time}}"></textarea></div>
            <div style="display:flex;gap:8px">
                <button class="btn btn-primary btn-sm" onclick="saveCustomTemplate()">Save Template</button>
                <button class="btn btn-ghost btn-sm" onclick="resetTemplate()">Reset to Default</button>
                <button class="btn btn-ghost btn-sm" onclick="previewTemplate()">Preview</button>
            </div>
            <div id="emTemplatePreview" style="margin-top:12px"></div>
        </div>

        <!-- Sent Email Log -->
        <div class="card">
            <div class="card-header"><span class="card-title">Sent Emails (${emailLog.length})</span><button class="btn btn-ghost btn-sm" onclick="clearEmailLog()">Clear Log</button></div>
            ${emailLog.length ? `<div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Time</th><th>To</th><th>Subject</th><th>Template</th><th>Status</th><th></th></tr></thead>
                <tbody>${emailLog.slice(0, 50).map(e => `<tr>
                    <td style="font-size:.82rem">${e.date || ''}</td>
                    <td style="font-size:.82rem">${e.time || ''}</td>
                    <td style="font-size:.82rem">${escHTML(e.to || '')}</td>
                    <td style="font-size:.82rem;max-width:200px;overflow:hidden;text-overflow:ellipsis">${escHTML((e.subject || '').substring(0, 50))}</td>
                    <td><span class="badge badge-completed">${escHTML(e.template || 'direct')}</span></td>
                    <td><span class="badge badge-${e.status === 'sent' ? 'confirmed' : 'cancelled'}">${e.status || '?'}</span></td>
                    <td><button class="btn btn-ghost btn-sm" onclick="resendEmail('${e.id}')">Resend</button></td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty"><div class="empty-icon">📧</div><p>No emails sent yet. Compose one above or enable auto-send.</p></div>'}
        </div>
    `;

    // Load first template
    loadTemplateForEdit();
};

// Compose email quick templates
const fillEmailTemplate = (type) => {
    const templates = {
        visit_update: { subject: 'Visit Update — Your Pup is Having a Great Time!', body: 'Just wanted to send a quick update — your pup is having a wonderful time! They ate well, got plenty of exercise, and are in great spirits.\n\nWe\'ll send photos shortly!' },
        booking_reminder: { subject: 'Reminder: Your Booking is Tomorrow!', body: 'Just a friendly reminder — your booking is tomorrow!\n\nPlease have your pup ready with their leash, food, and any medications.\n\nSee you soon!' },
        checkout_ready: { subject: 'Your Pup is Ready for Pickup!', body: 'Your pup is all checked out and ready for pickup! Everything went great today.\n\nSee you next time!' },
        payment_request: { subject: 'Payment Request — GenusPupClub', body: 'This is a friendly reminder about your outstanding balance.\n\nYou can pay via:\n• Venmo: @GenusPupClub\n• Zelle: Genuspupclub@gmail.com\n• CashApp: $m3lop3z\n• Apple Pay: (804) 258-3830' },
        thank_you: { subject: 'Thank You for Choosing GenusPupClub!', body: 'Thank you for trusting us with your pup! We loved every minute.\n\nIf you had a great experience, we\'d love a review — it helps other dog parents find us.\n\nSee you next time!' },
        promo: { subject: 'Special Offer from GenusPupClub!', body: 'We have a special offer just for you:\n\n[DESCRIBE YOUR OFFER HERE]\n\nBook now through your portal or call us at (804) 258-3830.\n\nLimited spots available!' }
    };
    const t = templates[type];
    if (t) {
        document.getElementById('emSubject').value = t.subject;
        document.getElementById('emBody').value = t.body;
    }
};

// Send composed email
const sendComposeEmail = () => {
    const clientId = document.getElementById('emTo')?.value;
    const toEmail = document.getElementById('emToEmail')?.value?.trim();
    const subject = document.getElementById('emSubject')?.value?.trim();
    const body = document.getElementById('emBody')?.value?.trim();

    if (!toEmail) { alert('Enter a recipient email address'); return; }
    if (!subject) { alert('Enter a subject line'); return; }
    if (!body) { alert('Write a message'); return; }

    const client = clientId ? clients.find(c => c.id === clientId) : null;

    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.sendDirectEmail(toEmail, client?.name || '', subject, body);
    }

    // Also save as message
    messages.push({
        id: uid(), from: 'GenusPupClub', to: client?.name || toEmail, toClientId: clientId || '',
        pet: '', type: 'email', text: `[${subject}]\n\n${body}`,
        date: todayStr(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    save('messages', messages);

    document.getElementById('emSubject').value = '';
    document.getElementById('emBody').value = '';
    document.getElementById('emTo').value = '';
    document.getElementById('emToEmail').value = '';
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Sent', `Email sent to ${toEmail}`, 'success');
};

// Auto-send settings
const saveAutoEmailSettings = () => {
    const settings = {};
    document.querySelectorAll('.auto-email-toggle').forEach(cb => {
        settings[cb.dataset.key] = cb.checked;
    });
    save('email_auto_settings', settings);
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Saved', 'Auto-send settings updated', 'success');
    renderTab();
};

// Template editing
const DEFAULT_EMAIL_TEMPLATES = {
    booking_confirmation: { subject: 'Booking Confirmed — GenusPupClub', body: 'Your booking has been confirmed:\n\nService: {{service}}\nPet: {{petName}}\nDate: {{date}}\nTotal: ${{amount}}\n\nPayment options:\n• Venmo: @GenusPupClub\n• Zelle: Genuspupclub@gmail.com\n• CashApp: $m3lop3z\n• Apple Pay: (804) 258-3830\n\nWe can\'t wait to see your pup!' },
    booking_confirmed: { subject: 'You\'re All Set — {{petName}}\'s Visit is Confirmed!', body: 'Great news — your booking for {{petName}} is confirmed!\n\nService: {{service}}\nDate: {{date}}\n\nPlease have your pup ready with their leash, food, and any medications.\n\nSee you soon!' },
    visit_complete: { subject: 'Visit Complete — {{petName}} Had a Great Day!', body: '{{petName}}\'s visit is complete! They had an amazing time.\n\nService: {{service}}\nDate: {{date}}\n\nWe\'ll share photos shortly.\n\nIf you loved the experience, we\'d appreciate a review — it helps other dog parents find us.' },
    payment_receipt: { subject: 'Payment Received — Thank You!', body: 'We\'ve received your payment of ${{amount}}.\n\nService: {{service}}\nPet: {{petName}}\nDate: {{date}}\n\nYour receipt is on file. See you next time!' },
    invoice: { subject: 'Invoice from GenusPupClub — ${{amount}}', body: 'Here\'s your invoice:\n\nService: {{service}}\nPet: {{petName}}\nDate: {{date}}\nAmount Due: ${{amount}}\n\nPayment options:\n• Venmo: @GenusPupClub\n• Zelle: Genuspupclub@gmail.com\n• CashApp: $m3lop3z\n• Apple Pay: (804) 258-3830\n\nPlease submit payment at your earliest convenience.' },
    reminder: { subject: 'Reminder — {{petName}}\'s Booking is Tomorrow!', body: 'Just a friendly reminder — {{petName}}\'s booking is tomorrow!\n\nService: {{service}}\nDate: {{date}}\nTime: {{time}}\n\nPlease have your pup ready with their leash, food, and any medications.\n\nSee you soon!' },
    report_card: { subject: '{{petName}}\'s Report Card — GenusPupClub', body: 'Here\'s {{petName}}\'s report card from today:\n\nService: {{service}}\nDate: {{date}}\n\n[BEHAVIOR & NOTES GO HERE]\n\nOverall: ⭐⭐⭐⭐⭐ Great day!\n\nPhotos are available in your portal at genuspupclub.com/portal.html' },
    message: { subject: 'Message from GenusPupClub', body: '[YOUR MESSAGE HERE]' },
    welcome: { subject: 'Welcome to GenusPupClub — Create Your Account!', body: 'Welcome to GenusPupClub — Richmond\'s #1 dog care service!\n\nCreate your free account to:\n• Book walks, daycare, sitting, and grooming\n• Get real-time photo updates of your pup\n• View report cards and invoices\n• Manage your pet profiles\n\nSign up here: genuspupclub.com/login.html\n\nOr call us at (804) 258-3830 to book your first visit.\n\nWe can\'t wait to meet your pup!' },
    password_reset: { subject: 'Password Reset — GenusPupClub', body: 'We received a request to reset your password. Your temporary password is:\n\n[TEMP PASSWORD]\n\nPlease log in and change it right away at genuspupclub.com/login.html\n\nIf you didn\'t request this, please ignore this email.' },
    waitlist: { subject: 'A Spot Just Opened Up — {{service}}!', body: 'Great news — a spot just opened up for {{service}} on {{date}}!\n\nBook now through your portal or call us at (804) 258-3830 before it fills up.' }
};

const loadTemplateForEdit = () => {
    const key = document.getElementById('emTemplateSelect')?.value;
    if (!key) return;
    const customs = load('email_templates_custom', {});
    const custom = customs[key];
    const defaults = DEFAULT_EMAIL_TEMPLATES[key] || { subject: '', body: '' };
    document.getElementById('emTemplateSubject').value = custom?.subject || defaults.subject;
    document.getElementById('emTemplateBody').value = custom?.body || defaults.body;
};

const saveCustomTemplate = () => {
    const key = document.getElementById('emTemplateSelect')?.value;
    if (!key) return;
    const subject = document.getElementById('emTemplateSubject')?.value?.trim();
    const body = document.getElementById('emTemplateBody')?.value?.trim();
    const customs = load('email_templates_custom', {});
    if (subject || body) {
        customs[key] = { subject, body };
    } else {
        delete customs[key];
    }
    save('email_templates_custom', customs);
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Saved', 'Email template updated', 'success');
};

const resetTemplate = () => {
    const key = document.getElementById('emTemplateSelect')?.value;
    if (!key) return;
    const customs = load('email_templates_custom', {});
    delete customs[key];
    save('email_templates_custom', customs);
    document.getElementById('emTemplateSubject').value = '';
    document.getElementById('emTemplateBody').value = '';
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Reset', 'Template reset to default', 'info');
};

const previewTemplate = () => {
    const key = document.getElementById('emTemplateSelect')?.value;
    const customSubject = document.getElementById('emTemplateSubject')?.value?.trim();
    const customBody = document.getElementById('emTemplateBody')?.value?.trim();
    const preview = document.getElementById('emTemplatePreview');
    if (!preview) return;

    // Show what the email would look like with sample data
    const sampleData = { clientName: 'John Smith', petName: 'Buddy', service: 'Dog Walking (30 min)', date: todayStr(), amount: '25.00', time: '10:00 AM' };
    const defaults = DEFAULT_EMAIL_TEMPLATES[key] || { subject: '', body: '' };
    let subject = customSubject || defaults.subject || `[No template for ${key}]`;
    let body = customBody || defaults.body || `[No template body for ${key}]`;

    // Replace variables
    Object.entries(sampleData).forEach(([k, v]) => {
        subject = subject.replace(new RegExp(`{{${k}}}`, 'gi'), v);
        body = body.replace(new RegExp(`{{${k}}}`, 'gi'), v);
    });

    preview.innerHTML = `
        <div style="padding:16px;border:1px solid var(--border);border-radius:8px;background:var(--bg-alt)">
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px">PREVIEW (sample data)</div>
            <div style="font-weight:600;margin-bottom:8px">${escHTML(subject)}</div>
            <div style="font-size:.88rem;white-space:pre-wrap;color:var(--text-light)">${escHTML(body)}</div>
        </div>
    `;
};

const resendEmail = (logId) => {
    const log = load('email_log', []);
    const entry = log.find(e => e.id === logId);
    if (!entry) return;
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.sendDirectEmail(entry.to, '', entry.subject, '(Resent) — check original email for full content');
    }
};

const clearEmailLog = () => {
    if (!confirm('Clear all email logs?')) return;
    save('email_log', []);
    renderTab();
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

window.fillInfamyFromPet = (petId) => {
    if (!petId) return;
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    const owner = clients.find(c => c.id === pet.clientId);
    // Set dropdowns if the value exists as an option, otherwise show custom input
    const dogNameEl = document.getElementById('mDogName');
    const ownerNameEl = document.getElementById('mOwnerName');
    const breedEl = document.getElementById('mBreed');
    if (dogNameEl) { dogNameEl.value = pet.name || ''; if (!dogNameEl.value && pet.name) { dogNameEl.value = '__custom'; const c = document.getElementById('mDogNameCustom'); if (c) { c.style.display = 'block'; c.value = pet.name; } } }
    if (ownerNameEl && owner) { ownerNameEl.value = owner.name || ''; if (!ownerNameEl.value && owner.name) { ownerNameEl.value = '__custom'; const c = document.getElementById('mOwnerNameCustom'); if (c) { c.style.display = 'block'; c.value = owner.name; } } }
    if (breedEl && pet.breed) { breedEl.value = pet.breed || ''; if (!breedEl.value) { breedEl.value = '__custom'; const c = document.getElementById('mBreedCustom'); if (c) { c.style.display = 'block'; c.value = pet.breed; } } }
};

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

// ============================================
// PHOTO UPLOAD HANDLERS — Drag-and-Drop Support
// ============================================
window.handlePhotoDrop = (event, inputId, zoneId) => {
    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    processPhotoFile(file, inputId, zoneId);
};

window.handlePhotoSelect = (input, inputId, zoneId) => {
    const file = input.files[0];
    if (!file) return;
    processPhotoFile(file, inputId, zoneId);
};

const processPhotoFile = (file, inputId, zoneId) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        document.getElementById(inputId).value = dataUrl;
        const zone = document.getElementById(zoneId);
        if (zone) {
            zone.innerHTML = '<img src="' + dataUrl + '" style="width:120px;height:120px;object-fit:cover;border-radius:12px"><div style="font-size:.78rem;color:var(--text-muted);margin-top:4px">Click or drag to replace</div>';
        }
    };
    reader.readAsDataURL(file);
};

window.clearPhoto = (inputId, zoneId) => {
    document.getElementById(inputId).value = '';
    const zone = document.getElementById(zoneId);
    if (zone) {
        zone.innerHTML = '<div style="font-size:2rem">📸</div><div style="font-size:.88rem;color:var(--text-muted)">Drag & drop image here or click to upload</div>';
    }
};

// Gallery handlers for multiple images
window.handleGalleryDrop = (event, zoneId) => {
    event.preventDefault();
    event.currentTarget.style.borderColor = 'var(--border)';
    event.currentTarget.style.background = 'var(--bg-alt)';
    const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    processGalleryFiles(files, zoneId);
};

window.handleGallerySelect = (input, zoneId) => {
    const files = Array.from(input.files).filter(f => f.type.startsWith('image/'));
    processGalleryFiles(files, zoneId);
};

const processGalleryFiles = (files, zoneId) => {
    const currentValue = document.getElementById('cmsGalleryImages')?.value || '';
    let gallery = currentValue ? JSON.parse(currentValue) : [];
    let processed = 0;

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            gallery.push(e.target.result);
            processed++;
            if (processed === files.length) {
                document.getElementById('cmsGalleryImages').value = JSON.stringify(gallery);
                renderGalleryPreview(gallery, zoneId);
            }
        };
        reader.readAsDataURL(file);
    });
};

const renderGalleryPreview = (gallery, zoneId) => {
    const zone = document.getElementById(zoneId);
    if (!zone) return;
    const previews = gallery.map((img, idx) => `
        <div style="position:relative;display:inline-block;margin:4px">
            <img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border)">
            <button type="button" onclick="removeGalleryImage(${idx})" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;padding:0;border-radius:50%;background:var(--danger);color:white;border:none;cursor:pointer;font-size:.75rem">✕</button>
        </div>
    `).join('');
    zone.innerHTML = `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px">${previews}</div>`;
};

window.removeGalleryImage = (idx) => {
    const currentValue = document.getElementById('cmsGalleryImages')?.value || '';
    let gallery = currentValue ? JSON.parse(currentValue) : [];
    gallery.splice(idx, 1);
    document.getElementById('cmsGalleryImages').value = JSON.stringify(gallery);
    renderGalleryPreview(gallery, 'cmsGalleryZone');
};

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
            <div class="form-group">
                <label class="form-label">Hero Image</label>
                <div id="cmsHeroImgZone" class="photo-drop-zone" style="border:2px dashed var(--border);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--bg-alt)"
                     ondragover="event.preventDefault();this.style.borderColor='var(--primary)';this.style.background='rgba(255,107,53,.05)'"
                     ondragleave="this.style.borderColor='var(--border)';this.style.background='var(--bg-alt)'"
                     ondrop="event.preventDefault();this.style.borderColor='var(--border)';this.style.background='var(--bg-alt)';handlePhotoDrop(event,'cmsHeroImg','cmsHeroImgZone')"
                     onclick="document.getElementById('cmsHeroImgFile').click()">
                    ${sc.heroImage ? '<img src="' + escHTML(sc.heroImage) + '" style="width:120px;height:120px;object-fit:cover;border-radius:12px"><div style="font-size:.78rem;color:var(--text-muted);margin-top:4px">Click or drag to replace</div>' : '<div style="font-size:2rem">📸</div><div style="font-size:.88rem;color:var(--text-muted)">Drag & drop image here or click to upload</div>'}
                </div>
                <input type="file" id="cmsHeroImgFile" accept="image/*" style="display:none" onchange="handlePhotoSelect(this,'cmsHeroImg','cmsHeroImgZone')">
                <input type="hidden" id="cmsHeroImg" value="${escHTML(sc.heroImage)}">
                ${sc.heroImage ? '<button type="button" class="btn btn-sm btn-ghost" style="margin-top:8px;color:var(--danger)" onclick="clearPhoto(\'cmsHeroImg\',\'cmsHeroImgZone\')">✕ Remove image</button>' : ''}
            </div>
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
            <div class="form-group">
                <label class="form-label">About Image</label>
                <div id="cmsAboutImgZone" class="photo-drop-zone" style="border:2px dashed var(--border);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--bg-alt)"
                     ondragover="event.preventDefault();this.style.borderColor='var(--primary)';this.style.background='rgba(255,107,53,.05)'"
                     ondragleave="this.style.borderColor='var(--border)';this.style.background='var(--bg-alt)'"
                     ondrop="event.preventDefault();this.style.borderColor='var(--border)';this.style.background='var(--bg-alt)';handlePhotoDrop(event,'cmsAboutImg','cmsAboutImgZone')"
                     onclick="document.getElementById('cmsAboutImgFile').click()">
                    ${sc.aboutImage ? '<img src="' + escHTML(sc.aboutImage) + '" style="width:120px;height:120px;object-fit:cover;border-radius:12px"><div style="font-size:.78rem;color:var(--text-muted);margin-top:4px">Click or drag to replace</div>' : '<div style="font-size:2rem">📸</div><div style="font-size:.88rem;color:var(--text-muted)">Drag & drop image here or click to upload</div>'}
                </div>
                <input type="file" id="cmsAboutImgFile" accept="image/*" style="display:none" onchange="handlePhotoSelect(this,'cmsAboutImg','cmsAboutImgZone')">
                <input type="hidden" id="cmsAboutImg" value="${escHTML(sc.aboutImage)}">
                ${sc.aboutImage ? '<button type="button" class="btn btn-sm btn-ghost" style="margin-top:8px;color:var(--danger)" onclick="clearPhoto(\'cmsAboutImg\',\'cmsAboutImgZone\')">✕ Remove image</button>' : ''}
            </div>
            <div class="form-group"><label class="form-label">Quote</label><input class="form-input" id="cmsAboutQuote" value="${escHTML(sc.aboutQuote)}"></div>
        </div>

        <!-- GALLERY SECTION -->
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Photo Gallery</div>
            <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">Manage your photo gallery. Drag and drop multiple images at once, or click to select.</p>
            <div id="cmsGalleryZone" class="photo-drop-zone" style="border:2px dashed var(--border);border-radius:12px;padding:30px;text-align:center;cursor:pointer;transition:all .2s;min-height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:var(--bg-alt)"
                 ondragover="event.preventDefault();this.style.borderColor='var(--primary)';this.style.background='rgba(255,107,53,.05)'"
                 ondragleave="this.style.borderColor='var(--border)';this.style.background='var(--bg-alt)'"
                 ondrop="handleGalleryDrop(event,'cmsGalleryZone')"
                 onclick="document.getElementById('cmsGalleryFile').click()">
                <div style="font-size:2.5rem">🖼️</div>
                <div style="font-size:.95rem;font-weight:500">Drop images or click to upload</div>
                <div style="font-size:.78rem;color:var(--text-muted);margin-top:4px">Upload multiple images at once</div>
            </div>
            <input type="file" id="cmsGalleryFile" accept="image/*" multiple style="display:none" onchange="handleGallerySelect(this,'cmsGalleryZone')">
            <input type="hidden" id="cmsGalleryImages" value="${escHTML(JSON.stringify(sc.galleryImages || []))}">
            <div id="cmsGalleryPreview" style="margin-top:16px">
                ${sc.galleryImages && sc.galleryImages.length > 0 ? `
                    <div style="display:flex;gap:12px;flex-wrap:wrap">
                        ${sc.galleryImages.map((img, idx) => `
                            <div style="position:relative;display:inline-block">
                                <img src="${img}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border)">
                                <button type="button" onclick="removeGalleryImage(${idx})" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;padding:0;border-radius:50%;background:var(--danger);color:white;border:none;cursor:pointer;font-size:.75rem">✕</button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
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
    const getGalleryImages = () => {
        try {
            const val = document.getElementById('cmsGalleryImages')?.value || '[]';
            return JSON.parse(val);
        } catch {
            return [];
        }
    };
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
        footerText: v('cmsFooter'),
        galleryImages: getGalleryImages()
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
                <div class="form-group"><label class="form-label">Extra Dog Fee ($)</label><input class="form-input" id="sExtraDogFee" type="number" step="0.01" value="${businessSettings.extraDogFee || 0}"></div>
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
            <div class="form-row">
                <div class="form-group"><label class="form-label">Pickup Fee ($)</label><input class="form-input" id="sPickupFee" type="number" step="0.01" value="${businessSettings.pickupFee || 0}"></div>
                <div class="form-group"><label class="form-label">Dropoff Fee ($)</label><input class="form-input" id="sDropoffFee" type="number" step="0.01" value="${businessSettings.dropoffFee || 0}"></div>
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
            <div class="form-row">
                <div class="form-group"><label class="form-label">PayPal (email or username)</label><input class="form-input" id="sPayPayPal" value="${escHTML(businessSettings.paypalHandle || '')}"></div>
                <div class="form-group"><label class="form-label">Google Pay (email or phone)</label><input class="form-input" id="sPayGooglePay" value="${escHTML(businessSettings.googlePayHandle || '')}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Stripe Link</label><input class="form-input" id="sPayStripe" value="${escHTML(businessSettings.stripeHandle || '')}"></div>
                <div class="form-group"><label class="form-label">Check (Payable to)</label><input class="form-input" id="sPayCheck" value="${escHTML(businessSettings.checkPayable || '')}"></div>
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
                const baseService = services.find(s => (p.services || []).includes(s.name) || s.id === p.services?.[0]);
                const perVisit = p.price > 0 ? p.price / p.visits : (baseService?.price || 0);
                const basePrice = perVisit * (p.visits || 1);
                const discounted = p.price > 0 ? p.price : basePrice * (1 - (p.discount || 0) / 100);
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
                    <div><strong>${escHTML(p.name)}</strong>${baseService ? `<br><span style="font-size:.78rem;color:var(--text-muted)">Base: ${escHTML(baseService.name)}</span>` : ''}<br><span style="font-size:.82rem;color:var(--text-muted)">${escHTML(p.description || '')}</span></div>
                    <div style="text-align:right"><div style="font-size:1.1rem;font-weight:700;color:var(--primary)">${fmt(discounted)}</div>${basePrice > discounted ? `<div style="font-size:.78rem;color:var(--text-muted);text-decoration:line-through">${fmt(basePrice)}</div>` : ''}<div style="font-size:.72rem;color:var(--accent)">${p.discount ? p.discount + '% off · ' : ''}${p.visits} visits</div></div>
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
    businessSettings = { ...businessSettings, name: v('sName'), phone: v('sPhone'), email: v('sEmail'), address: v('sAddress'), operatingHours: v('sHours'), operatingDays: v('sDays'), acceptedPayments: v('sPayments'), emergencyVet: v('sVet'), extraDogFee: parseFloat(v('sExtraDogFee')) || 0, recurringDiscount: parseInt(v('sRecurring')) || 0, cancellationHours: parseInt(v('sCancel')) || 24, cancellationFee: parseInt(v('sCancelFee')) || 50, taxRate: parseFloat(v('sTax')) || 0, maxBookingsPerDay: parseInt(v('sMaxBookings')) || 8, pickupFee: parseFloat(v('sPickupFee')) || 0, dropoffFee: parseFloat(v('sDropoffFee')) || 0 };
    save('settings', businessSettings);
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Saved', 'Business settings updated', 'success');
};

const savePaymentHandles = () => {
    const v = (id) => document.getElementById(id)?.value || '';
    businessSettings.cashAppHandle = v('sPayCashApp');
    businessSettings.venmoHandle = v('sPayVenmo');
    businessSettings.zelleHandle = v('sPayZelle');
    businessSettings.applePayHandle = v('sPayApple');
    businessSettings.paypalHandle = v('sPayPayPal');
    businessSettings.googlePayHandle = v('sPayGooglePay');
    businessSettings.stripeHandle = v('sPayStripe');
    businessSettings.checkPayable = v('sPayCheck');
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
            `Here are your GenusPupClub login details:\n\nEmail: ${u.email}\nPassword: ${u.plainPassword}\n\nLog in at your client portal anytime.\n\nIf you have questions, call us at (804) 258-3830.`
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
        <div class="form-group"><label class="form-label">Fixed Price (optional — overrides discount calc)</label><input class="form-input" id="epkPrice" type="number" step="0.01" value="${p.price || ''}"></div>
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
    p.price = parseFloat(document.getElementById('epkPrice')?.value) || 0;
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
    const clientNameOptions = clients.map(c => `<option value="${escHTML(c.name)}">${escHTML(c.name)}${c.email ? ' (' + escHTML(c.email) + ')' : ''}</option>`).join('');
    const petOptions = pets.map(p => { const o = clients.find(c => c.id === p.clientId); return `<option value="${escHTML(p.name)}">${escHTML(p.name)}${o ? ' (' + escHTML(o.name) + ')' : ''}${p.breed ? ' — ' + escHTML(p.breed) : ''}</option>`; }).join('');
    const sitterOptions = sitters.map(s => `<option value="${escHTML(s.name)}">${escHTML(s.name)}</option>`).join('');
    const catOptions = ['Walking', 'Visits', 'Daycare', 'Sitting', 'Specialty', 'Transport', 'Grooming', 'Training', 'Other'].map(c => `<option>${c}</option>`).join('');

    const modals = {
        booking: { title: 'New Booking', body: (() => {
            const propOptions = properties.map(p => `<option value="${escHTML(p.address)}">${escHTML(p.name)} — ${escHTML(p.address)}</option>`).join('');
            const clientAddrOptions = clients.filter(c => c.address).map(c => `<option value="${escHTML(c.address)}">${escHTML(c.name)} — ${escHTML(c.address)}</option>`).join('');
            return `
            <div class="form-row"><div class="form-group"><label class="form-label">Client</label><select class="form-select" id="mClient" onchange="autofillClient(this.value)"><option value="">Select or type below</option>${clientOptions}</select></div><div class="form-group"><label class="form-label">Client Name</label><input class="form-input" id="mClientName"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><select class="form-select" id="mPetName" onchange="if(this.value==='__custom'){this.style.display='none';document.getElementById('mPetNameCustom').style.display='block';document.getElementById('mPetNameCustom').focus();}"><option value="">— Select pet —</option>${petOptions}<option value="__custom">Other (type name)...</option></select><input class="form-input" id="mPetNameCustom" style="display:none;margin-top:4px" placeholder="Type pet name"></div><div class="form-group"><label class="form-label">Extra Dogs</label><input class="form-input" id="mExtraDogs" type="number" value="0" min="0"></div></div>
            <div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService" onchange="updateBookingPrice()">${svcOptions}</select></div>
            <div class="form-group"><label class="form-label">Add-ons</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px" id="mAddons">${addonChecks}</div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Drop-Off Date & Time</label><input class="form-input" id="mDropoff" type="datetime-local"></div><div class="form-group"><label class="form-label">Pick-Up Date & Time</label><input class="form-input" id="mPickup" type="datetime-local"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Sitter</label><select class="form-select" id="mSitter"><option value="">Auto-assign</option>${sitterOptions}</select></div></div>
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
            <div class="form-row"><div class="form-group"><label class="form-label">Client Name</label><select class="form-select" id="mName" onchange="if(this.value==='__custom'){this.style.display='none';document.getElementById('mNameCustom').style.display='block';document.getElementById('mNameCustom').focus();}"><option value="">— Select client —</option>${clientNameOptions}<option value="__custom">Other (type name)...</option></select><input class="form-input" id="mNameCustom" style="display:none;margin-top:4px" placeholder="Type client name"></div><div class="form-group"><label class="form-label">Pet Name</label><select class="form-select" id="mPet" onchange="if(this.value==='__custom'){this.style.display='none';document.getElementById('mPetCustom').style.display='block';document.getElementById('mPetCustom').focus();}"><option value="">— Select pet —</option>${petOptions}<option value="__custom">Other (type name)...</option></select><input class="form-input" id="mPetCustom" style="display:none;margin-top:4px" placeholder="Type pet name"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Stars</label><select class="form-select" id="mStars"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div></div>
            <div class="form-group"><label class="form-label">Review</label><textarea class="form-textarea" id="mText" rows="3"></textarea></div>
        ` },
        sitter: { title: 'Add Sitter', body: `
            <div class="form-group"><label class="form-label">Photo</label><input type="file" accept="image/*" class="form-input" id="mSitterPhoto" onchange="previewSitterPhoto(this,'mSitterPhotoData')"><input type="hidden" id="mSitterPhotoData"></div>
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
            <div class="form-group"><label class="form-label">Base Service</label><select class="form-select" id="mBaseService">${svcOptions}</select></div>
            <div class="form-row"><div class="form-group"><label class="form-label"># Visits</label><input class="form-input" id="mVisits" type="number" value="5"></div><div class="form-group"><label class="form-label">Discount (%)</label><input class="form-input" id="mDiscount" type="number" value="10"></div></div>
            <div class="form-group"><label class="form-label">Fixed Price (optional — overrides discount calc)</label><input class="form-input" id="mPrice" type="number" step="0.01" placeholder="Leave blank to auto-calculate from discount"></div>
            <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="mDesc"></div>
        ` },
        zone: { title: 'Add Zone', body: `
            <div class="form-group"><label class="form-label">Zone Name</label><input class="form-input" id="mName" placeholder="e.g. Zone 4 — Far West"></div>
            <div class="form-group"><label class="form-label">Areas Covered</label><input class="form-input" id="mAreas" placeholder="e.g. Goochland, Powhatan"></div>
            <div class="form-group"><label class="form-label">Surcharge ($)</label><input class="form-input" id="mSurcharge" type="number" step="0.01" value="0"></div>
        ` },
        infamy: { title: 'Add to Infamy Hall', body: `
            <div class="form-group"><label class="form-label">Select Existing Pet (optional)</label><select class="form-select" id="mSelectPet" onchange="fillInfamyFromPet(this.value)"><option value="">— Type manually or pick a pet —</option>${pets.map(p => { const owner = clients.find(c => c.id === p.clientId); return '<option value=\x27' + p.id + '\x27>' + escHTML(p.name) + (owner ? ' (' + escHTML(owner.name) + ')' : '') + '</option>'; }).join('')}</select></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Dog Name</label><select class="form-select" id="mDogName" onchange="handleCustomSelect(this,'mDogNameCustom')"><option value="">— Select pet —</option>${petOptions}<option value="__custom">Other (type name)...</option></select><input class="form-input" id="mDogNameCustom" style="display:none;margin-top:4px" placeholder="Type dog name"></div><div class="form-group"><label class="form-label">Owner Name</label><select class="form-select" id="mOwnerName" onchange="handleCustomSelect(this,'mOwnerNameCustom')"><option value="">— Select client —</option>${clientNameOptions}<option value="__custom">Other (type name)...</option></select><input class="form-input" id="mOwnerNameCustom" style="display:none;margin-top:4px" placeholder="Type owner name"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Breed</label><select class="form-select" id="mBreed" onchange="handleCustomSelect(this,'mBreedCustom')"><option value="">— Select —</option>${[...new Set(pets.map(p => p.breed).filter(Boolean))].sort().map(b => '<option>' + escHTML(b) + '</option>').join('')}<option value="__custom">Other...</option></select><input class="form-input" id="mBreedCustom" style="display:none;margin-top:4px" placeholder="Type breed"></div><div class="form-group"><label class="form-label">Severity</label><select class="form-select" id="mSeverity"><option value="low">Caution — minor issues</option><option value="medium">Problem — recurring issues</option><option value="high">Serious — safety risk</option><option value="banned">BANNED — do not accept</option></select></div></div>
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
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><select class="form-select" id="mPetName" onchange="if(this.value==='__custom'){this.style.display='none';document.getElementById('mPetNameCustom').style.display='block';document.getElementById('mPetNameCustom').focus();}"><option value="">— Select pet —</option>${petOptions}<option value="__custom">Other (type name)...</option></select><input class="form-input" id="mPetNameCustom" style="display:none;margin-top:4px" placeholder="Type pet name"></div><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div></div>
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
        manual_payment: { title: 'Record Cash/Manual Payment', body: (() => {
            const paymentMethods = ['Cash', 'Card (manual)'];
            if (businessSettings.cashAppHandle) paymentMethods.push('CashApp');
            if (businessSettings.venmoHandle) paymentMethods.push('Venmo');
            if (businessSettings.zelleHandle) paymentMethods.push('Zelle');
            if (businessSettings.checkPayable) paymentMethods.push('Check');
            if (businessSettings.paypalHandle) paymentMethods.push('PayPal');
            if (businessSettings.googlePayHandle) paymentMethods.push('Google Pay');
            if (businessSettings.applePayHandle) paymentMethods.push('Apple Pay');
            if (businessSettings.stripeHandle) paymentMethods.push('Stripe');
            const methodOptions = paymentMethods.map(m => `<option>${m}</option>`).join('');
            return `
            <div class="form-row"><div class="form-group"><label class="form-label">Client Name</label><select class="form-select" id="mClientName" onchange="if(this.value==='__custom'){this.style.display='none';document.getElementById('mClientNameCustom').style.display='block';document.getElementById('mClientNameCustom').focus();}"><option value="">— Select client —</option>${clientNameOptions}<option value="__custom">Other (type name)...</option></select><input class="form-input" id="mClientNameCustom" style="display:none;margin-top:4px" placeholder="Type client name"></div><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Amount</label><input class="form-input" id="mAmount" type="number" step="0.01"></div><div class="form-group"><label class="form-label">Tip</label><input class="form-input" id="mTip" type="number" step="0.01" value="0"></div></div>
            <div class="form-group"><label class="form-label">Payment Method</label><select class="form-select" id="mMethod">${methodOptions}</select></div>
            <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="mDate" type="date" value="${todayStr()}"></div>
            `;
        })() },
        checkin: { title: 'Check In Dog', body: (() => {
            const today = todayStr();
            const todayBkgs = bookings.filter(b => {
                if (b.status === 'cancelled' || b.status === 'completed') return false;
                // Include if booking date is today
                if (b.date === today) return true;
                // Include multi-day bookings where today falls within the range
                if (b.date && b.endDate && b.date <= today && b.endDate >= today) return true;
                // Include confirmed bookings from recent days (in case date was yesterday but not yet checked in)
                if (b.status === 'confirmed' && b.date && b.date >= new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]) return true;
                return false;
            });
            const bkgOptions = todayBkgs.map(b => `<option value="${b.id}">${escHTML(b.clientName)} — ${escHTML(b.petName)} (${escHTML(b.service)}, ${b.date} ${b.time || '?'}) [${b.status}]</option>`).join('');
            return `
            <div class="form-group"><label class="form-label">Select Booking</label><select class="form-select" id="mBookingId" onchange="autofillCheckin(this.value)"><option value="">-- Walk-In (no booking) --</option>${bkgOptions}</select></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><select class="form-select" id="mPetName" onchange="autofillCheckinPet(this.value)"><option value="">— Select pet or type below —</option>${pets.map(p => { const o = clients.find(c => c.id === p.clientId); return '<option value="' + escHTML(p.name) + '" data-client-id="' + (p.clientId || '') + '">' + escHTML(p.name) + (o ? ' (' + escHTML(o.name) + ')' : '') + (p.breed ? ' — ' + escHTML(p.breed) : '') + '</option>'; }).join('')}<option value="__custom">Other (walk-in)...</option></select><input class="form-input" id="mPetNameCustom" style="display:none;margin-top:6px" placeholder="Type pet name"></div><div class="form-group"><label class="form-label">Owner</label><select class="form-select" id="mOwnerSelect" onchange="autofillCheckinOwner(this.value)"><option value="">Select or type below</option>${clientOptions}</select></div></div>
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
        photo: { title: 'Add Photo', body: (() => {
            const allPets = load('pets', []);
            const petOptions = allPets.map(p => `<option value="${escHTML(p.name)}" data-client="${p.clientId || ''}">${escHTML(p.name)}${p.breed ? ' (' + escHTML(p.breed) + ')' : ''}</option>`).join('');
            return `
            <div class="form-group"><label class="form-label">Pet Name</label><select class="form-select" id="mPetName" onchange="autofillPhotoClient(this)"><option value="">Select pet</option>${petOptions}<option value="__custom">Other (type in)...</option></select></div>
            <div class="form-group" id="mPetNameCustomGroup" style="display:none"><label class="form-label">Pet Name (custom)</label><input class="form-input" id="mPetNameCustom" placeholder="Type pet name"></div>
            <div class="form-group"><label class="form-label">Photo URL (or paste image link)</label><input class="form-input" id="mUrl" placeholder="https://... or local file path"></div>
            <div class="form-group"><label class="form-label">Or upload from device</label><input type="file" id="mFile" accept="image/*" class="form-input" onchange="previewUpload(this)"></div>
            <div id="mPreview" style="margin:8px 0;text-align:center"></div>
            <div class="form-group"><label class="form-label">Caption</label><input class="form-input" id="mCaption" placeholder="e.g. Max enjoying his walk!"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Activity</label><select class="form-select" id="mActivity"><option>Walk</option><option>Play</option><option>Nap</option><option>Eating</option><option>Training</option><option>Cuddle</option><option>Outdoor</option><option>Grooming</option><option>Other</option></select></div>
                <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="mPhotoDate" type="date" value="${todayStr()}"></div>
            </div>
            <div style="margin:12px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Send to Client</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Send Photo Via</label><select class="form-select" id="mPhotoSend"><option value="none">Don't send (save only)</option><option value="sms">Text to Phone</option><option value="email">Email to Client</option><option value="both">Both Text & Email</option></select></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Client Phone</label><input class="form-input" id="mPhotoPhone" type="tel" placeholder="(804) 555-1234"></div>
                <div class="form-group"><label class="form-label">Client Email</label><input class="form-input" id="mPhotoEmail" type="email" placeholder="client@email.com"></div>
            </div>
        `; })() },
        message: { title: 'Send Message', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">From</label><input class="form-input" id="mFrom" value="GenusPupClub"></div><div class="form-group"><label class="form-label">To (Owner)</label><select class="form-select" id="mTo" onchange="autofillMsgPets(this.value); autofillMsgContact(this.value)"><option value="">Select owner</option>${clientOptions}</select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Regarding Pet</label><select class="form-select" id="mPet"><option value="">Select pet</option></select></div><div class="form-group"><label class="form-label">Type</label><select class="form-select" id="mType"><option value="update">Visit Update</option><option value="booking">Booking</option><option value="reminder">Reminder</option><option value="general">General</option></select></div></div>
            <div style="margin:8px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Send Via</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Method</label><select class="form-select" id="mSendMethod" onchange="toggleMsgMethod()"><option value="email">Email</option><option value="sms">Text Message (SMS)</option><option value="both">Both Email & Text</option></select></div>
            </div>
            <div class="form-row">
                <div class="form-group" id="mEmailGroup"><label class="form-label">Email Address</label><input class="form-input" id="mEmail" type="email" placeholder="client@email.com"></div>
                <div class="form-group" id="mPhoneGroup" style="display:none"><label class="form-label">Cell Phone Number</label><input class="form-input" id="mPhone" type="tel" placeholder="(804) 555-1234"></div>
            </div>
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

const autofillCheckinPet = (petName) => {
    const customInput = document.getElementById('mPetNameCustom');
    if (petName === '__custom') { if (customInput) customInput.style.display = 'block'; return; }
    if (customInput) customInput.style.display = 'none';
    if (!petName) return;
    const pet = pets.find(p => p.name === petName);
    if (pet?.clientId) {
        const client = clients.find(c => c.id === pet.clientId);
        if (client) {
            const ownerField = document.getElementById('mOwnerName');
            const phoneField = document.getElementById('mPhone');
            const ownerSelect = document.getElementById('mOwnerSelect');
            if (ownerField) ownerField.value = client.name;
            if (phoneField) phoneField.value = client.phone || '';
            if (ownerSelect) ownerSelect.value = client.id;
        }
    }
};

const autofillCheckinOwner = (clientId) => {
    const c = clients.find(x => x.id === clientId);
    if (!c) return;
    const ownerField = document.getElementById('mOwnerName');
    const phoneField = document.getElementById('mPhone');
    if (ownerField) ownerField.value = c.name;
    if (phoneField) phoneField.value = c.phone || '';
    // Set pet dropdown to first matching pet for this client
    const clientPets = pets.filter(p => p.clientId === c.id);
    const petField = document.getElementById('mPetName');
    if (petField && clientPets.length >= 1) petField.value = clientPets[0].name;
};

const autofillMsgPets = (clientId) => {
    const petSelect = document.getElementById('mPet');
    if (!petSelect) return;
    const clientPets = pets.filter(p => p.clientId === clientId);
    petSelect.innerHTML = '<option value="">Select pet</option>' + clientPets.map(p => `<option value="${escHTML(p.name)}">${escHTML(p.name)}</option>`).join('');
    if (clientPets.length === 1) petSelect.value = clientPets[0].name;
};

const autofillMsgContact = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const emailInput = document.getElementById('mEmail');
    const phoneInput = document.getElementById('mPhone');
    if (emailInput && client.email) emailInput.value = client.email;
    if (phoneInput && client.phone) phoneInput.value = client.phone;
};

const toggleMsgMethod = () => {
    const method = document.getElementById('mSendMethod')?.value;
    const emailGroup = document.getElementById('mEmailGroup');
    const phoneGroup = document.getElementById('mPhoneGroup');
    if (emailGroup) emailGroup.style.display = (method === 'sms') ? 'none' : '';
    if (phoneGroup) phoneGroup.style.display = (method === 'email') ? 'none' : '';
};

const autofillPhotoClient = (select) => {
    const petName = select.value;
    const customGroup = document.getElementById('mPetNameCustomGroup');
    if (customGroup) customGroup.style.display = petName === '__custom' ? '' : 'none';
    if (petName === '__custom' || !petName) return;
    // Find pet -> client -> autofill phone/email
    const pet = pets.find(p => p.name === petName);
    if (pet?.clientId) {
        const client = clients.find(c => c.id === pet.clientId);
        if (client) {
            const phoneInput = document.getElementById('mPhotoPhone');
            const emailInput = document.getElementById('mPhotoEmail');
            if (phoneInput && client.phone) phoneInput.value = client.phone;
            if (emailInput && client.email) emailInput.value = client.email;
        }
    }
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
    const baseRate = svc?.price || 0;
    const dropoffDT = document.getElementById('mDropoff')?.value || '';
    const pickupDT = document.getElementById('mPickup')?.value || '';
    const startDate = dropoffDT ? dropoffDT.split('T')[0] : '';
    const endDate = pickupDT ? pickupDT.split('T')[0] : '';
    const days = calcDays(startDate, endDate);
    const extraDogs = parseInt(document.getElementById('mExtraDogs')?.value) || 0;
    const hasPickup = document.getElementById('mPickupAddr')?.value || document.getElementById('mPickupAddrCustom')?.value;
    const hasDropoff = document.getElementById('mDropoffAddr')?.value || document.getElementById('mDropoffAddrCustom')?.value;
    const pickupFee = hasPickup ? (parseFloat(businessSettings.pickupFee) || 0) : 0;
    const dropoffFee = hasDropoff ? (parseFloat(businessSettings.dropoffFee) || 0) : 0;
    const selectedZone = document.getElementById('mZone')?.value || '';
    const zoneObj = selectedZone ? zones.find(z => z.name === selectedZone) : null;
    const zoneSurcharge = zoneObj?.surcharge || 0;

    const numDogs = extraDogs + 1;
    let total = baseRate * numDogs * days;
    document.querySelectorAll('.addon-check:checked').forEach(cb => { total += parseFloat(cb.dataset.price) || 0; });
    total += zoneSurcharge + pickupFee + dropoffFee;

    const parts = [];
    if (numDogs > 1) parts.push(`${numDogs} dogs × ${fmt(baseRate)}`);
    if (days > 1) parts.push(`${days} days`);
    if (zoneSurcharge > 0) parts.push(`zone +${fmt(zoneSurcharge)}`);
    if (pickupFee > 0) parts.push(`pickup ${fmt(pickupFee)}`);
    if (dropoffFee > 0) parts.push(`dropoff ${fmt(dropoffFee)}`);

    const preview = document.getElementById('mPricePreview');
    if (preview) preview.textContent = `${fmt(total)}${parts.length ? ' (' + parts.join(' + ') + ')' : ''}`;
};

// Wire addon checkboxes + date changes to price update
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('addon-check')) updateBookingPrice();
    if (['mDropoff', 'mPickup', 'mExtraDogs', 'mPickupAddr', 'mDropoffAddr', 'mService', 'mZone'].includes(e.target.id)) updateBookingPrice();
});

const saveModal = (type) => {
    const v = (id) => document.getElementById(id)?.value?.trim() || '';

    if (type === 'booking') {
        const selectedAddons = [...document.querySelectorAll('.addon-check:checked')].map(cb => cb.value);
        const svc = services.find(s => s.name === v('mService'));
        const clientId = v('mClient') || null;
        const pickupAddr = v('mPickupAddrCustom') || v('mPickupAddr');
        const dropoffAddr = v('mDropoffAddrCustom') || v('mDropoffAddr');
        const dropoffDT = v('mDropoff');
        const pickupDT = v('mPickup');
        const derivedDate = dropoffDT ? dropoffDT.split('T')[0] : todayStr();
        const derivedTime = dropoffDT ? dropoffDT.split('T')[1]?.substring(0,5) || '' : '';
        const derivedEndDate = pickupDT ? pickupDT.split('T')[0] : '';
        const numDogsVal = (parseInt(v('mExtraDogs')) || 0) + 1;
        const petNameVal = v('mPetName') === '__custom' ? v('mPetNameCustom') : (v('mPetNameCustom') || v('mPetName'));
        bookings.push({ id: uid(), clientId, clientName: v('mClientName'), petName: petNameVal, service: v('mService'), amount: svc?.price || 0, addons: selectedAddons, extraDogs: parseInt(v('mExtraDogs')) || 0, numDogs: numDogsVal, date: derivedDate, endDate: derivedEndDate, time: derivedTime, dropoffTime: dropoffDT, pickupTime: pickupDT, pickupAddr, dropoffAddr, zone: v('mZone'), sitter: v('mSitter'), notes: v('mNotes'), status: 'pending' });
        save('bookings', bookings);
    } else if (type === 'client') {
        const clientEmail = v('mEmail');
        const clientName = v('mName');
        const clientPhone = v('mPhone');
        const clientId = uid();
        clients.push({ id: clientId, name: clientName, email: clientEmail, phone: clientPhone, photo: v('mClientPhotoData'), address: v('mAddress'), source: v('mSource'), notes: v('mNotes') });
        save('clients', clients);

        // Auto-create user account with temp password
        if (clientEmail) {
            const tempPass = 'Password123';
            const users = load('users', []);
            const existingUser = users.find(u => u.email === clientEmail);
            if (!existingUser) {
                users.push({ id: uid(), email: clientEmail, name: clientName, passwordHash: simpleHash(tempPass), plainPassword: tempPass, role: 'client', clientId, createdAt: new Date().toISOString() });
                save('users', users);
            }

            // Send welcome email with login credentials
            if (typeof GPC_NOTIFY !== 'undefined') {
                GPC_NOTIFY.sendDirectEmail(clientEmail, clientName,
                    'Welcome to GenusPupClub — Your Login Credentials',
                    `Welcome to GenusPupClub — Richmond's #1 dog care service!\n\nYour account is ready. Here are your login details:\n\nEmail: ${clientEmail}\nPassword: ${tempPass}\n\nLog in here: ${window.location.origin}/login.html\n\nOnce logged in you can:\n• Book walks, daycare, sitting, and grooming\n• Get real-time photo updates of your pup\n• View report cards and invoices\n• Manage your pet profiles\n\nPlease change your password after your first login.\n\nOr call us at (804) 258-3830 to book your first visit.\n\nWe can't wait to meet your pup!`
                );
                GPC_NOTIFY.showToast('Account Created', `Login credentials emailed to ${clientEmail}`, 'success');
            }
        }
        // SMS link if phone provided and no email
        if (clientPhone && !clientEmail) {
            const smsBody = encodeURIComponent(`Hi ${clientName}! You've been added to GenusPupClub. Create your account at ${window.location.origin}/login.html to book services and manage your pup's profile. — GenusPupClub`);
            window.open(`sms:${clientPhone}?body=${smsBody}`, '_blank');
        }
    } else if (type === 'pet') {
        pets.push({ id: uid(), name: v('mName'), breed: v('mBreed'), age: v('mAge'), weight: v('mWeight'), gender: v('mGender'), fixed: v('mFixed'), clientId: v('mOwner'), photo: v('mPhotoData'), vet: v('mVet'), allergies: v('mAllergies'), medications: v('mMeds'), feedingSchedule: v('mFeeding'), tags: v('mTags'), notes: v('mNotes'), preferredSitter: v('mPreferredSitter'), coatType: v('mCoat'), groomFrequency: v('mGroomFreq'), shampoo: v('mShampoo'), groomNotes: v('mGroomNotes') });
        save('pets', pets);
    } else if (type === 'review') {
        const reviewName = v('mName') === '__custom' ? v('mNameCustom') : (v('mNameCustom') || v('mName'));
        const reviewPet = v('mPet') === '__custom' ? v('mPetCustom') : (v('mPetCustom') || v('mPet'));
        reviews.push({ id: uid(), name: reviewName, pet: reviewPet, stars: parseInt(v('mStars')) || 5, text: v('mText'), service: v('mService'), date: todayStr() });
        save('reviews', reviews);
    } else if (type === 'sitter') {
        sitters.push({ id: uid(), name: v('mName'), phone: v('mPhone'), email: v('mEmail'), rate: parseFloat(v('mRate')) || 25, maxDogs: parseInt(v('mMaxDogs')) || 3, specialty: v('mSpecialty'), certifications: v('mCerts'), availability: v('mAvail'), bio: v('mBio'), photo: v('mSitterPhotoData'), status: 'active' });
        save('sitters', sitters);
    } else if (type === 'service') {
        services.push({ id: uid(), name: v('mName'), price: parseFloat(v('mPrice')) || 0, duration: parseInt(v('mDuration')) || 0, category: v('mCategory'), description: v('mDesc'), active: true });
        save('services', services);
    } else if (type === 'addon') {
        addons.push({ id: uid(), name: v('mName'), price: parseFloat(v('mPrice')) || 0, description: v('mDesc') });
        save('addons', addons);
    } else if (type === 'package') {
        packages.push({ id: uid(), name: v('mName'), services: [v('mBaseService')], visits: parseInt(v('mVisits')) || 5, discount: parseInt(v('mDiscount')) || 10, price: parseFloat(v('mPrice')) || 0, description: v('mDesc') });
        save('packages', packages);
    } else if (type === 'zone') {
        zones.push({ id: uid(), name: v('mName'), areas: v('mAreas'), surcharge: parseFloat(v('mSurcharge')) || 0 });
        save('zones', zones);
    } else if (type === 'infamy') {
        let infamy = load('infamy', []);
        infamy.push({ id: uid(), dogName: resolveDropdown('mDogName','mDogNameCustom'), ownerName: resolveDropdown('mOwnerName','mOwnerNameCustom'), breed: resolveDropdown('mBreed','mBreedCustom'), severity: v('mSeverity'), issueType: v('mIssueType'), description: v('mDescription'), actionTaken: v('mAction'), staffNotes: v('mStaffNotes'), dateReported: todayStr(), incidents: [] });
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
                `Welcome to GenusPupClub! An account has been created for you.\n\nEmail: ${email}\nPassword: ${pass}\n\nLog in at your client portal to book services, manage your pets, and more.\n\nQuestions? Call us at (804) 258-3830.`
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
        const mpClientName = v('mClientName') === '__custom' ? v('mClientNameCustom') : (v('mClientNameCustom') || v('mClientName'));
        const mpClient = clients.find(c => c.name === mpClientName);
        payments.push({
            id: uid(), clientId: mpClient?.id || '', clientName: mpClientName, service: v('mService'),
            amount: parseFloat(v('mAmount')) || 0, tip: parseFloat(v('mTip')) || 0,
            method: v('mMethod'), status: 'paid', date: v('mDate'), bookingId: ''
        });
        save('payments', payments);
    } else if (type === 'checkin') {
        const checklist = {};
        document.querySelectorAll('.checklist-item').forEach(cb => { checklist[cb.value] = cb.checked; });
        const linkedBookingId = v('mBookingId') || null;
        const petNameVal = v('mPetName') === '__custom' ? v('mPetNameCustom') : v('mPetName');
        checkins.push({
            id: uid(), bookingId: linkedBookingId, walkIn: !linkedBookingId,
            petName: petNameVal, ownerName: v('mOwnerName'), ownerPhone: v('mPhone'),
            service: v('mService'), property: v('mProperty'), sitter: v('mSitter'),
            dropoffTime: v('mDropoffTime'), expectedPickup: v('mPickupTime'),
            checklist, belongings: v('mBelongings'),
            specialInstructions: v('mInstructions'), ownerNotes: v('mNotes'),
            checkInDate: todayStr(), checkInTime: v('mDropoffTime') || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            checkedOut: false
        });
        // Update linked booking status to confirmed (regardless of current status)
        if (linkedBookingId) {
            const bk = bookings.find(x => x.id === linkedBookingId);
            if (bk && bk.status !== 'completed' && bk.status !== 'cancelled') { bk.status = 'confirmed'; save('bookings', bookings); }
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
        const photoPetName = v('mPetName') === '__custom' ? v('mPetNameCustom') : v('mPetName');
        const photoDate = v('mPhotoDate') || todayStr();
        photos.push({ id: uid(), petName: photoPetName, url, caption: v('mCaption'), activity: v('mActivity'), date: photoDate });
        save('photos', photos);

        // Send photo to client if requested
        const photoSend = v('mPhotoSend') || 'none';
        const photoPhone = v('mPhotoPhone');
        const photoEmail = v('mPhotoEmail');
        const photoCaption = v('mCaption') || photoPetName + ' — visit photo';

        if ((photoSend === 'sms' || photoSend === 'both') && photoPhone) {
            const smsMsg = encodeURIComponent(`${photoCaption}\n\nView your pup's photos at genuspupclub.com/portal.html\n\n— GenusPupClub`);
            const cleanPhone = photoPhone.replace(/\D/g, '');
            window.open(`sms:${cleanPhone}?body=${smsMsg}`, '_blank');
        }
        if ((photoSend === 'email' || photoSend === 'both') && photoEmail && typeof GPC_NOTIFY !== 'undefined') {
            GPC_NOTIFY.sendDirectEmail(photoEmail, '', `📸 New Photo of ${photoPetName} — GenusPupClub`, `We just took a photo of ${photoPetName} during their visit!\n\n${photoCaption}\n\nView all photos in your portal: genuspupclub.com/portal.html`);
        }
    } else if (type === 'message') {
        const toClientId = v('mTo');
        const toClient = clients.find(c => c.id === toClientId);
        const msgText = v('mText');
        const msgPet = v('mPet');
        const sendMethod = v('mSendMethod') || 'email';
        const msgEmail = v('mEmail') || toClient?.email || '';
        const msgPhone = v('mPhone') || toClient?.phone || '';
        messages.push({
            id: uid(), from: v('mFrom'), to: toClient?.name || toClientId, toClientId,
            pet: msgPet, type: v('mType'), text: msgText, sendMethod, email: msgEmail, phone: msgPhone,
            date: todayStr(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
        save('messages', messages);
        // Send email to client
        if ((sendMethod === 'email' || sendMethod === 'both') && msgEmail && typeof GPC_NOTIFY !== 'undefined') {
            GPC_NOTIFY.sendEmail('message', { to: toClient?.name || '', clientEmail: msgEmail, pet: msgPet, text: msgText });
            GPC_NOTIFY.onNewMessage({ from: 'GenusPupClub', to: toClient?.name || msgEmail, text: msgText });
        }
        // Send SMS via sms: link (opens user's SMS app with pre-filled message)
        if ((sendMethod === 'sms' || sendMethod === 'both') && msgPhone) {
            const smsBody = encodeURIComponent(msgText);
            const cleanPhone = msgPhone.replace(/\D/g, '');
            window.open(`sms:${cleanPhone}?body=${smsBody}`, '_blank');
        }
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

    // Ensure booking has clientEmail for notifications
    if (!b.clientEmail && b.clientId) {
        const client = clients.find(c => c.id === b.clientId);
        if (client) b.clientEmail = client.email;
    }
    if (!b.clientEmail && b.clientName) {
        const client = clients.find(c => c.name === b.clientName);
        if (client) b.clientEmail = client.email;
    }
    save('bookings', bookings);

    // Fire notifications + emails
    if (typeof GPC_NOTIFY !== 'undefined') {
        if (status === 'confirmed') GPC_NOTIFY.onBookingConfirmed(b);
        // completed notification is fired inside saveCompletionFlow after invoice is created
        if (status === 'cancelled') GPC_NOTIFY.onBookingCancelled(b);
    }

    // On complete: show completion flow (invoice + report card, no payment yet)
    if (status === 'completed') {
        showCompletionFlow(b);
    } else {
        renderTab();
    }
};

const showCompletionFlow = (booking) => {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }

    const amt = parseFloat(booking.amount) || 0;
    const days = calcDays(booking.date, booking.endDate);
    const total = calcBookingTotal(booking);

    overlay.innerHTML = `<div class="modal" style="max-width:500px">
        <div class="modal-title" style="color:var(--success)">✓ Complete Visit</div>
        <div style="padding:12px;background:rgba(0,184,148,.05);border-radius:8px;margin-bottom:16px">
            <strong>${escHTML(booking.petName)}</strong> — ${escHTML(booking.service)} on ${booking.date}${days > 1 ? ' to ' + (booking.endDate || booking.date) : ''}<br>
            <span style="font-size:.88rem;color:var(--text-muted)">Client: ${escHTML(booking.clientName)} · Sitter: ${escHTML(booking.sitter || 'Unassigned')}</span><br>
            <span style="font-size:.92rem;font-weight:600;color:var(--primary)">Total: ${fmt(total)}</span>
        </div>

        <div style="padding:10px;background:rgba(59,130,246,.05);border-radius:8px;margin-bottom:16px;font-size:.85rem;color:#3B82F6">
            An invoice for ${fmt(total)} will be emailed to the client. Payment can be recorded later.
        </div>

        <div style="font-size:.92rem;font-weight:600;margin-bottom:8px">Report Card</div>
        <div style="display:flex;gap:4px;margin-bottom:8px" id="cfStars">
            ${[1,2,3,4,5].map(s => `<button type="button" style="font-size:1.8rem;background:none;border:none;cursor:pointer;color:#ddd;transition:color .15s" onclick="setCFStars(${s})" data-star="${s}">★</button>`).join('')}
        </div>
        <input type="hidden" id="cfRating" value="5">

        <div class="form-group"><label class="form-label">Behavior & Notes</label><textarea class="form-textarea" id="cfReportNotes" rows="3" placeholder="How did the visit go? Energy level, eating, potty, behavior..."></textarea></div>
        <div class="form-group"><label class="form-label">Review (optional — visible to client)</label><textarea class="form-textarea" id="cfReview" rows="2" placeholder="A short review for the client's portal"></textarea></div>

        <div class="form-group" style="margin-top:8px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:.88rem">
                <input type="checkbox" id="cfSendReport" checked> Send report card email to client
            </label>
        </div>

        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal();renderTab()">Cancel</button>
            <button class="btn btn-primary" onclick="saveCompletionFlow('${booking.id}')">Complete & Send Invoice</button>
        </div>
    </div>`;
    overlay.classList.add('open');
    setCFStars(5);
};

// ============================================
// PAYMENT FLOW (separate from completion)
// ============================================
const showPaymentFlow = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }

    const tipPercents = [0, 15, 18, 20, 25, 30];
    const total = calcBookingTotal(booking);

    overlay.innerHTML = `<div class="modal" style="max-width:500px">
        <div class="modal-title" style="color:var(--primary)">Record Payment</div>
        <div style="padding:12px;background:rgba(0,184,148,.05);border-radius:8px;margin-bottom:16px">
            <strong>${escHTML(booking.petName)}</strong> — ${escHTML(booking.service)} on ${booking.date}<br>
            <span style="font-size:.88rem;color:var(--text-muted)">Client: ${escHTML(booking.clientName)}</span><br>
            <span style="font-size:.92rem;font-weight:600;color:var(--primary)">Invoice Total: ${fmt(total)}</span>
        </div>

        <div style="font-size:.92rem;font-weight:600;margin-bottom:8px">Payment Method</div>
        <div class="form-group">
            <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${['Card', 'CashApp', 'Venmo', 'Zelle', 'Cash', 'Prepaid/Package'].map(m => `<button type="button" class="btn btn-sm btn-ghost pf-method" onclick="document.querySelectorAll('.pf-method').forEach(b=>{b.style.borderColor='';b.style.color=''});this.style.borderColor='var(--primary)';this.style.color='var(--primary)';document.getElementById('pfMethod').value='${m}'">${m}</button>`).join('')}
            </div>
            <input type="hidden" id="pfMethod" value="Cash">
        </div>

        <div style="font-size:.92rem;font-weight:600;margin:12px 0 8px">Tip</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            ${tipPercents.map(p => `<button type="button" class="btn btn-sm btn-ghost pf-tip" onclick="document.querySelectorAll('.pf-tip').forEach(b=>{b.style.borderColor='';b.style.color=''});this.style.borderColor='var(--primary)';this.style.color='var(--primary)';document.getElementById('pfTip').value='${(total * p / 100).toFixed(2)}';document.getElementById('pfTipCustom').value='';updatePFTotal(${total})">${p === 0 ? 'No tip' : p + '% (' + fmt(total * p / 100) + ')'}</button>`).join('')}
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
            <span style="font-size:.85rem">Custom:</span>
            <input type="number" id="pfTipCustom" step="0.01" min="0" placeholder="$0.00" class="form-input" style="width:100px" oninput="document.getElementById('pfTip').value=this.value;document.querySelectorAll('.pf-tip').forEach(b=>{b.style.borderColor='';b.style.color=''});updatePFTotal(${total})">
        </div>
        <input type="hidden" id="pfTip" value="0">
        <div style="padding:12px;background:rgba(255,107,53,.05);border-radius:8px;text-align:right;margin-bottom:16px">
            <span style="font-size:.88rem;color:var(--text-muted)">Service: ${fmt(total)} + Tip: <strong id="pfTipDisplay">$0.00</strong> = </span>
            <strong style="font-size:1.3rem;color:var(--primary)" id="pfTotalDisplay">${fmt(total)}</strong>
        </div>

        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal();renderTab()">Cancel</button>
            <button class="btn btn-primary" onclick="savePaymentFlow('${booking.id}')">Mark Paid</button>
        </div>
    </div>`;
    overlay.classList.add('open');
};

window.updatePFTotal = (amt) => {
    const tip = parseFloat(document.getElementById('pfTip')?.value) || 0;
    document.getElementById('pfTipDisplay').textContent = fmt(tip);
    document.getElementById('pfTotalDisplay').textContent = fmt(amt + tip);
};

const savePaymentFlow = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) { closeModal(); renderTab(); return; }
    const method = document.getElementById('pfMethod')?.value || 'Cash';
    const tip = parseFloat(document.getElementById('pfTip')?.value) || 0;
    const total = calcBookingTotal(booking);

    // Create payment record
    const payments = load('payments', []);
    payments.push({ id: uid(), clientId: booking.clientId, clientName: booking.clientName, bookingId, amount: total, tip, method, status: 'paid', service: booking.service, date: todayStr() });
    save('payments', payments);

    // Update booking payment status
    booking.paymentStatus = 'paid';
    booking.paymentMethod = method;
    booking.paymentTip = tip;
    booking.paymentDate = todayStr();
    save('bookings', bookings);

    // Update matching invoice status
    const invoices = load('invoices', []);
    const inv = invoices.find(i => i.bookingId === bookingId);
    if (inv) {
        inv.status = 'paid';
        inv.method = method;
        inv.tip = tip;
        inv.total = total + tip;
        inv.paidDate = todayStr();
        save('invoices', invoices);
    }

    // Send payment notification
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.onPaymentReceived({ ...booking, amount: total, tip, method, clientName: booking.clientName });
    }

    closeModal(); renderTab();
};

window.setCFStars = (n) => {
    document.getElementById('cfRating').value = n;
    document.querySelectorAll('#cfStars button').forEach(b => {
        b.style.color = parseInt(b.dataset.star) <= n ? '#FDCB6E' : '#ddd';
    });
};

const saveCompletionFlow = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) { closeModal(); renderTab(); return; }
    const rating = parseInt(document.getElementById('cfRating')?.value) || 5;
    const reportNotes = document.getElementById('cfReportNotes')?.value?.trim() || '';
    const reviewText = document.getElementById('cfReview')?.value?.trim() || '';
    const sendReport = document.getElementById('cfSendReport')?.checked;
    const amt = parseFloat(booking.amount) || 0;

    // Mark booking as completed but UNPAID
    booking.paymentStatus = 'unpaid';
    save('bookings', bookings);

    // Save review if provided
    if (reviewText || rating) {
        const allReviews = load('reviews', []);
        allReviews.push({ id: uid(), name: booking.clientName, pet: booking.petName, stars: rating, text: reviewText || `Great ${booking.service} experience!`, service: booking.service, sitter: booking.sitter, date: todayStr() });
        save('reviews', allReviews);
    }

    // Calculate invoice total — must match calcBookingTotal exactly
    const total = calcBookingTotal(booking);
    const days = calcDays(booking.date, booking.endDate);
    const numDogs = booking.numDogs || ((booking.extraDogs || 0) + 1);
    const baseSubtotal = amt * numDogs * days;
    const addonTotal = (booking.addons || []).reduce((s, aName) => { const a = addons.find(x => x.name === aName); return s + (a?.price || 0); }, 0);
    const zoneSurcharge = booking.zone ? (zones.find(z => z.name === booking.zone)?.surcharge || 0) : 0;
    const pickupFee = booking.pickupAddr ? (parseFloat(businessSettings.pickupFee) || 0) : 0;
    const dropoffFee = booking.dropoffAddr ? (parseFloat(businessSettings.dropoffFee) || 0) : 0;
    const lineItems = [
        `${booking.service}: ${fmt(amt)}${numDogs > 1 ? ` × ${numDogs} dogs` : ''}${days > 1 ? ` × ${days} days` : ''}${(numDogs > 1 || days > 1) ? ` = ${fmt(baseSubtotal)}` : ''}`,
        addonTotal > 0 ? `Add-ons: ${fmt(addonTotal)}` : null,
        zoneSurcharge > 0 ? `Zone surcharge: ${fmt(zoneSurcharge)}` : null,
        pickupFee > 0 ? `Pickup fee: ${fmt(pickupFee)}` : null,
        dropoffFee > 0 ? `Dropoff fee: ${fmt(dropoffFee)}` : null
    ].filter(Boolean).join('\n');

    // Create invoice with UNPAID status
    const invoiceId = 'INV-' + Date.now().toString(36).toUpperCase();
    const invoices = load('invoices', []);
    invoices.push({ id: invoiceId, bookingId, clientId: booking.clientId, clientName: booking.clientName, clientEmail: booking.clientEmail || '', petName: booking.petName, service: booking.service, date: todayStr(), startDate: booking.date, endDate: booking.endDate, days, baseRate: amt, numDogs, extraDogs: booking.extraDogs || 0, addons: booking.addons, addonTotal, zoneSurcharge, pickupFee, dropoffFee, tip: 0, subtotal: total, total, method: '', status: 'unpaid' });
    save('invoices', invoices);

    if (typeof GPC_NOTIFY !== 'undefined') {
        // Send invoice email
        GPC_NOTIFY.sendEmail('invoice', { clientName: booking.clientName, clientEmail: booking.clientEmail, clientId: booking.clientId, invoiceId, date: todayStr(), service: booking.service, petName: booking.petName, days, startDate: booking.date, endDate: booking.endDate || booking.date, lineItems, total });

        // Send report card email if checked
        if (sendReport) {
            const reportDetails = reportNotes || 'Your pup had a wonderful visit!';
            GPC_NOTIFY.sendEmail('report_card', { clientName: booking.clientName, clientEmail: booking.clientEmail, clientId: booking.clientId, petName: booking.petName, date: booking.date, service: booking.service, reportDetails, overallRating: '★'.repeat(rating) + '☆'.repeat(5 - rating), notes: reviewText });
        }

        // Visit complete notification (no payment notification)
        GPC_NOTIFY.onBookingCompleted(booking);
        GPC_NOTIFY.showToast('Visit Completed', `Invoice sent to ${booking.clientName} — payment pending`, 'success');
        if (reviewText) GPC_NOTIFY.showToast('New Review', `${rating}★ from ${booking.clientName}`, 'success');
    }
    closeModal(); renderTab();
};

const sendTomorrowReminders = () => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const tomorrowBookings = bookings.filter(b => b.date === tomorrowStr && b.status === 'confirmed');
    if (tomorrowBookings.length === 0) { if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('No Reminders', 'No confirmed bookings for tomorrow', 'info'); return; }
    let sent = 0;
    tomorrowBookings.forEach(b => {
        if (!b.clientEmail && b.clientId) { const c = clients.find(x => x.id === b.clientId); if (c) b.clientEmail = c.email; }
        if (!b.clientEmail && b.clientName) { const c = clients.find(x => x.name === b.clientName); if (c) b.clientEmail = c.email; }
        if (typeof GPC_NOTIFY !== 'undefined') { GPC_NOTIFY.sendEmail('reminder', { clientName: b.clientName, clientEmail: b.clientEmail, clientId: b.clientId, petName: b.petName, service: b.service, date: b.date, time: b.time, dropoffTime: b.dropoffTime, pickupTime: b.pickupTime }); GPC_NOTIFY.notify('reminder', 'Reminder Sent', `Reminder sent to ${b.clientName} for ${b.service} tomorrow`, 'admin'); sent++; }
    });
    save('bookings', bookings);
    if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Reminders Sent', `${sent} reminder(s) sent for tomorrow's bookings`, 'success');
};

const sendReportCardEmail = (checkinId) => {
    const c = checkins.find(x => x.id === checkinId); if (!c) return;
    const client = clients.find(x => x.name === c.ownerName) || {};
    const details = [`Behavior: ${c.behavior || 'Great'}`, `Energy Level: ${c.energy || 'Normal'}`, `Appetite: ${c.appetite || 'Good'}`, `Mood: ${c.mood || 'Happy'}`, c.exercise ? `Exercise: ${c.exercise}` : null, c.specialInstructions ? `Special Instructions Followed: Yes` : null].filter(Boolean).join('\n');
    if (typeof GPC_NOTIFY !== 'undefined') { GPC_NOTIFY.sendEmail('report_card', { clientName: c.ownerName, clientEmail: client.email, clientId: client.id, petName: c.petName, service: c.service, date: c.checkInDate, reportDetails: details, overallRating: '⭐⭐⭐⭐⭐', notes: c.ownerNotes || '' }); GPC_NOTIFY.showToast('Report Card Sent', `Emailed to ${c.ownerName}`, 'success'); }
};

const checkWaitlist = (date) => { const maxPerDay = businessSettings.maxBookingsPerDay || 8; return bookings.filter(b => b.date === date && b.status !== 'cancelled').length >= maxPerDay; };
const addToWaitlist = (clientName, clientEmail, service, date, petName) => { const waitlist = load('waitlist', []); waitlist.push({ id: uid(), clientName, clientEmail, service, date, petName, addedAt: todayStr(), notified: false }); save('waitlist', waitlist); if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Waitlisted', `${clientName} added to waitlist for ${date}`, 'info'); };
const notifyWaitlist = (date) => { const waitlist = load('waitlist', []); const waiting = waitlist.filter(w => w.date === date && !w.notified); waiting.forEach(w => { if (typeof GPC_NOTIFY !== 'undefined') { GPC_NOTIFY.sendEmail('waitlist', { clientName: w.clientName, clientEmail: w.clientEmail, date: w.date, service: w.service }); w.notified = true; } }); save('waitlist', waitlist); if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Waitlist Notified', `${waiting.length} people notified about ${date}`, 'success'); };
const deleteItem = (col, id) => { if (!confirm('Delete?')) return; const map = { bookings, clients, pets, reviews, sitters, messages }; map[col] = map[col].filter(x => x.id !== id); if (col === 'bookings') bookings = map[col]; else if (col === 'clients') clients = map[col]; else if (col === 'pets') pets = map[col]; else if (col === 'reviews') reviews = map[col]; else if (col === 'sitters') sitters = map[col]; save(col, map[col]); renderTab(); };

const editClient = (id) => { const c = clients.find(x => x.id === id); if (!c) return; let overlay = document.getElementById('modalOverlay'); if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); } overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit: ${escHTML(c.name)}</div><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="ecName" value="${escHTML(c.name)}"></div><div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="ecEmail" value="${escHTML(c.email || '')}"></div><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="ecPhone" value="${escHTML(c.phone || '')}"></div></div><div class="form-group"><label class="form-label">Address</label><input class="form-input" id="ecAddr" value="${escHTML(c.address || '')}"></div><div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="ecNotes" rows="2">${escHTML(c.notes || '')}</textarea></div><div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditClient('${c.id}')">Save</button></div></div>`; overlay.classList.add('open'); };
const saveEditClient = (id) => { const c = clients.find(x => x.id === id); if (!c) return; c.name = document.getElementById('ecName')?.value?.trim() || c.name; c.email = document.getElementById('ecEmail')?.value?.trim() || ''; c.phone = document.getElementById('ecPhone')?.value?.trim() || ''; c.address = document.getElementById('ecAddr')?.value?.trim() || ''; c.notes = document.getElementById('ecNotes')?.value?.trim() || ''; save('clients', clients); closeModal(); renderTab(); };

const editBooking = (id) => { const b = bookings.find(x => x.id === id); if (!b) return; const svcOpts = services.map(s => `<option value="${escHTML(s.name)}" ${b.service === s.name ? 'selected' : ''}>${escHTML(s.name)} (${fmt(s.price)})</option>`).join(''); const sitterOpts = sitters.map(s => `<option value="${escHTML(s.name)}" ${b.sitter === s.name ? 'selected' : ''}>${escHTML(s.name)}</option>`).join(''); const ebClientOpts = clients.map(c => `<option value="${escHTML(c.name)}" ${(b.clientName||'') === c.name ? 'selected' : ''}>${escHTML(c.name)}</option>`).join(''); const ebPetOpts = pets.map(p => `<option value="${escHTML(p.name)}" ${(b.petName||'') === p.name ? 'selected' : ''}>${escHTML(p.name)}${p.breed ? ' — ' + escHTML(p.breed) : ''}</option>`).join(''); const statuses = ['pending','confirmed','completed','cancelled']; let overlay = document.getElementById('modalOverlay'); if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); } overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit Booking</div><div class="form-row"><div class="form-group"><label class="form-label">Client</label><select class="form-select" id="ebClient" onchange="handleCustomSelect(this,'ebClientCustom')"><option value="">— Select —</option>${ebClientOpts}<option value="__custom">Other...</option></select><input class="form-input" id="ebClientCustom" style="display:${clients.find(c=>c.name===b.clientName)?'none':'block'};margin-top:4px" value="${escHTML(b.clientName||'')}" placeholder="Type client name"></div><div class="form-group"><label class="form-label">Pet</label><select class="form-select" id="ebPet" onchange="handleCustomSelect(this,'ebPetCustom')"><option value="">— Select —</option>${ebPetOpts}<option value="__custom">Other...</option></select><input class="form-input" id="ebPetCustom" style="display:${pets.find(p=>p.name===b.petName)?'none':'block'};margin-top:4px" value="${escHTML(b.petName||'')}" placeholder="Type pet name"></div></div><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="ebService">${svcOpts}</select></div><div class="form-row"><div class="form-group"><label class="form-label">Drop-Off</label><input class="form-input" id="ebDropoff" type="datetime-local" value="${b.dropoffTime||''}"></div><div class="form-group"><label class="form-label">Pick-Up</label><input class="form-input" id="ebPickup" type="datetime-local" value="${b.pickupTime||''}"></div></div><div class="form-row"><div class="form-group"><label class="form-label">Sitter</label><select class="form-select" id="ebSitter"><option value="">Unassigned</option>${sitterOpts}</select></div><div class="form-group"><label class="form-label">Status</label><select class="form-select" id="ebStatus">${statuses.map(s=>`<option ${b.status===s?'selected':''}>${s}</option>`).join('')}</select></div></div><div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="ebNotes" rows="2">${escHTML(b.notes||'')}</textarea></div><div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditBooking('${b.id}')">Save</button></div></div>`; overlay.classList.add('open'); };
const saveEditBooking = (id) => { const b = bookings.find(x => x.id === id); if (!b) return; const ebcVal = document.getElementById('ebClient')?.value?.trim(); b.clientName = (ebcVal === '__custom' || ebcVal === '') ? (document.getElementById('ebClientCustom')?.value?.trim() || b.clientName) : ebcVal; const ebpVal = document.getElementById('ebPet')?.value?.trim(); b.petName = (ebpVal === '__custom' || ebpVal === '') ? (document.getElementById('ebPetCustom')?.value?.trim() || b.petName) : ebpVal; b.service = document.getElementById('ebService')?.value || b.service; b.dropoffTime = document.getElementById('ebDropoff')?.value || ''; b.pickupTime = document.getElementById('ebPickup')?.value || ''; b.date = b.dropoffTime ? b.dropoffTime.split('T')[0] : b.date; b.endDate = b.pickupTime ? b.pickupTime.split('T')[0] : b.endDate; b.time = b.dropoffTime ? b.dropoffTime.split('T')[1]?.substring(0,5) : b.time; b.sitter = document.getElementById('ebSitter')?.value || ''; b.status = document.getElementById('ebStatus')?.value || b.status; b.notes = document.getElementById('ebNotes')?.value?.trim() || ''; save('bookings', bookings); closeModal(); renderTab(); };

const editReview = (id) => { const r = reviews.find(x => x.id === id); if (!r) return; const erClientOpts = clients.map(c => `<option value="${escHTML(c.name)}" ${(r.name||'') === c.name ? 'selected' : ''}>${escHTML(c.name)}</option>`).join(''); const erPetOpts = pets.map(p => `<option value="${escHTML(p.name)}" ${(r.pet||'') === p.name ? 'selected' : ''}>${escHTML(p.name)}</option>`).join(''); let overlay = document.getElementById('modalOverlay'); if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); } overlay.innerHTML = `<div class="modal"><div class="modal-title">Edit Review</div><div class="form-row"><div class="form-group"><label class="form-label">Client</label><select class="form-select" id="erName" onchange="handleCustomSelect(this,'erNameCustom')"><option value="">— Select —</option>${erClientOpts}<option value="__custom">Other...</option></select><input class="form-input" id="erNameCustom" style="display:${clients.find(c=>c.name===r.name)?'none':'block'};margin-top:4px" value="${escHTML(r.name||'')}" placeholder="Type client name"></div><div class="form-group"><label class="form-label">Pet</label><select class="form-select" id="erPet" onchange="handleCustomSelect(this,'erPetCustom')"><option value="">— Select —</option>${erPetOpts}<option value="__custom">Other...</option></select><input class="form-input" id="erPetCustom" style="display:${pets.find(p=>p.name===r.pet)?'none':'block'};margin-top:4px" value="${escHTML(r.pet||'')}" placeholder="Type pet name"></div></div><div class="form-group"><label class="form-label">Stars</label><select class="form-select" id="erStars">${[5,4,3,2,1].map(s=>`<option ${r.stars===s?'selected':''}>${s}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">Review</label><textarea class="form-textarea" id="erText" rows="3">${escHTML(r.text||'')}</textarea></div><div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditReview('${r.id}')">Save</button></div></div>`; overlay.classList.add('open'); };
const saveEditReview = (id) => { const r = reviews.find(x => x.id === id); if (!r) return; r.name = resolveDropdown('erName','erNameCustom') || r.name; r.pet = resolveDropdown('erPet','erPetCustom') || ''; r.stars = parseInt(document.getElementById('erStars')?.value) || r.stars; r.text = document.getElementById('erText')?.value?.trim() || ''; save('reviews', reviews); closeModal(); renderTab(); };

const editPet = (id) => {
    const p = pets.find(x => x.id === id);
    if (!p) return;
    const clientOpts = clients.map(c => `<option value="${c.id}" ${p.clientId === c.id ? 'selected' : ''}>${escHTML(c.name)}</option>`).join('');
    const sitterOptions = sitters.filter(s => s.status === 'active').map(s => `<option value="${escHTML(s.name)}" ${p.preferredSitter === s.name ? 'selected' : ''}>${escHTML(s.name)}</option>`).join('');
    const genderOpts = ['Male', 'Female'].map(g => `<option ${(p.gender || '') === g ? 'selected' : ''}>${g}</option>`).join('');
    const fixedOpts = ['Yes', 'No'].map(f => `<option ${(p.fixed || '') === f ? 'selected' : ''}>${f}</option>`).join('');
    const coatOpts = ['Short', 'Medium', 'Long', 'Wire/Rough', 'Curly', 'Double Coat', 'Hairless'].map(c => `<option ${(p.coatType || '') === c ? 'selected' : ''}>${c}</option>`).join('');
    const groomFreqOpts = ['Monthly', 'Every 2 weeks', 'Weekly', 'Every 6 weeks', 'As needed'].map(f => `<option ${(p.groomFrequency || '') === f ? 'selected' : ''}>${f}</option>`).join('');
    const shampooOpts = ['Standard', 'Hypoallergenic', 'Oatmeal', 'Medicated', 'De-shedding', 'Whitening', 'Owner provides'].map(s => `<option ${(p.shampoo || '') === s ? 'selected' : ''}>${s}</option>`).join('');
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal" style="max-width:560px">
        <div class="modal-title">Edit: ${escHTML(p.name)}</div>
        ${p.photo ? `<div style="text-align:center;margin-bottom:12px"><img src="${p.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover"></div>` : ''}
        <div class="form-group"><label class="form-label">Photo</label><input type="file" accept="image/*" class="form-input" id="epPhoto" onchange="previewEditPetPhoto(this)"><input type="hidden" id="epPhotoData" value="${p.photo || ''}"></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="epName" value="${escHTML(p.name)}"></div><div class="form-group"><label class="form-label">Breed</label>${typeof breedSelectHTML === 'function' ? breedSelectHTML('epBreed', p.breed || '') : `<input class="form-input" id="epBreed" value="${escHTML(p.breed || '')}">`}</div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Age</label><input class="form-input" id="epAge" value="${escHTML(p.age || '')}" placeholder="e.g. 3 years"></div><div class="form-group"><label class="form-label">Weight</label><input class="form-input" id="epWeight" value="${escHTML(p.weight || '')}" placeholder="e.g. 45 lbs"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Gender</label><select class="form-select" id="epGender">${genderOpts}</select></div><div class="form-group"><label class="form-label">Spayed/Neutered</label><select class="form-select" id="epFixed">${fixedOpts}</select></div></div>
        <div class="form-group"><label class="form-label">Owner</label><select class="form-select" id="epOwner"><option value="">None</option>${clientOpts}</select></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Vet Name & Phone</label><input class="form-input" id="epVet" value="${escHTML(p.vet || '')}"></div><div class="form-group"><label class="form-label">Allergies</label><input class="form-input" id="epAllergies" value="${escHTML(p.allergies || '')}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Medications</label><input class="form-input" id="epMeds" value="${escHTML(p.medications || '')}"></div><div class="form-group"><label class="form-label">Feeding Schedule</label><input class="form-input" id="epFeeding" value="${escHTML(p.feedingSchedule || '')}" placeholder="e.g. 1 cup AM, 1 cup PM"></div></div>
        <div class="form-group"><label class="form-label">Temperament Tags</label><input class="form-input" id="epTags" value="${escHTML(p.tags || '')}" placeholder="e.g. friendly, leash reactive, food motivated"></div>
        <div class="form-group"><label class="form-label">Preferred Sitter</label><select class="form-select" id="epPreferredSitter"><option value="">No preference</option>${sitterOptions}</select></div>
        <div style="margin:12px 0 6px;font-size:.88rem;font-weight:600;color:var(--primary)">Grooming Preferences</div>
        <div class="form-row"><div class="form-group"><label class="form-label">Coat Type</label><select class="form-select" id="epCoat">${coatOpts}</select></div><div class="form-group"><label class="form-label">Grooming Frequency</label><select class="form-select" id="epGroomFreq">${groomFreqOpts}</select></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Shampoo Preference</label><select class="form-select" id="epShampoo">${shampooOpts}</select></div><div class="form-group"><label class="form-label">Grooming Notes</label><input class="form-input" id="epGroomNotes" value="${escHTML(p.groomNotes || '')}" placeholder="e.g. Sensitive ears, hates dryer"></div></div>
        <div class="form-group"><label class="form-label">Special Notes</label><textarea class="form-textarea" id="epNotes" rows="2">${escHTML(p.notes || '')}</textarea></div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditPet('${p.id}')">Save</button></div>
    </div>`;
    overlay.classList.add('open');
};
window.previewEditPetPhoto = (input) => {
    if (!input.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => { document.getElementById('epPhotoData').value = e.target.result; };
    reader.readAsDataURL(input.files[0]);
};
const saveEditPet = (id) => {
    const p = pets.find(x => x.id === id); if (!p) return;
    p.name = document.getElementById('epName')?.value?.trim() || p.name;
    p.breed = document.getElementById('epBreed')?.value?.trim() || '';
    p.age = document.getElementById('epAge')?.value?.trim() || '';
    p.weight = document.getElementById('epWeight')?.value?.trim() || '';
    p.gender = document.getElementById('epGender')?.value || '';
    p.fixed = document.getElementById('epFixed')?.value || '';
    p.clientId = document.getElementById('epOwner')?.value || '';
    p.vet = document.getElementById('epVet')?.value?.trim() || '';
    p.allergies = document.getElementById('epAllergies')?.value?.trim() || '';
    p.medications = document.getElementById('epMeds')?.value?.trim() || '';
    p.feedingSchedule = document.getElementById('epFeeding')?.value?.trim() || '';
    p.tags = document.getElementById('epTags')?.value?.trim() || '';
    p.preferredSitter = document.getElementById('epPreferredSitter')?.value || '';
    p.coatType = document.getElementById('epCoat')?.value || '';
    p.groomFrequency = document.getElementById('epGroomFreq')?.value || '';
    p.shampoo = document.getElementById('epShampoo')?.value || '';
    p.groomNotes = document.getElementById('epGroomNotes')?.value?.trim() || '';
    p.notes = document.getElementById('epNotes')?.value?.trim() || '';
    const newPhoto = document.getElementById('epPhotoData')?.value;
    if (newPhoto) p.photo = newPhoto;
    save('pets', pets); closeModal(); renderTab();
};

// ============================================
// APPROVALS — Client Edit Requests
// ============================================
const renderApprovals = () => {
    const editRequests = load('edit_requests', []);
    const pending = editRequests.filter(r => r.status === 'pending');
    const resolved = editRequests.filter(r => r.status !== 'pending');

    el.innerHTML = `
    <div class="stats-grid">
        <div class="stat-card" style="border-left-color:var(--warning)"><div class="stat-label">Pending Requests</div><div class="stat-value">${pending.length}</div><div class="stat-sub">Need your review</div></div>
        <div class="stat-card green"><div class="stat-label">Approved</div><div class="stat-value">${editRequests.filter(r => r.status === 'approved').length}</div></div>
        <div class="stat-card" style="border-left-color:var(--danger)"><div class="stat-label">Denied</div><div class="stat-value">${editRequests.filter(r => r.status === 'denied').length}</div></div>
        <div class="stat-card blue"><div class="stat-label">Total Requests</div><div class="stat-value">${editRequests.length}</div></div>
    </div>

    <!-- PENDING -->
    <div class="card">
        <div class="card-header"><span class="card-title">⏳ Pending Edit Requests (${pending.length})</span></div>
        ${pending.length === 0 ? '<div class="empty"><div class="empty-icon">✅</div><p>No pending requests — all clear!</p></div>' : `
        ${pending.map(r => {
            const b = bookings.find(x => x.id === r.bookingId);
            const changes = r.requestedChanges || {};
            return `<div style="padding:16px;border:2px solid var(--warning);border-radius:var(--radius);margin-bottom:12px;background:rgba(253,203,110,.04)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
                    <div>
                        <strong style="font-size:1rem">${escHTML(r.clientName)}</strong>
                        <span style="font-size:.82rem;color:var(--text-muted);margin-left:8px">${r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <span class="badge badge-pending">Pending</span>
                </div>

                ${b ? `<div style="background:var(--bg);padding:10px;border-radius:8px;margin-bottom:10px;font-size:.85rem">
                    <strong>Current booking:</strong> ${escHTML(b.service)} for ${escHTML(b.petName)} on ${b.date}${b.endDate ? ' → ' + b.endDate : ''} — ${fmt(calcBookingTotal(b))}
                </div>` : '<div style="font-size:.85rem;color:var(--danger);margin-bottom:10px">Original booking not found</div>'}

                <div style="font-size:.88rem;margin-bottom:10px">
                    <strong>Requested changes:</strong>
                    <ul style="margin:6px 0 0 20px;line-height:1.8">
                        ${changes.service ? `<li><strong>Service:</strong> ${escHTML(changes.service)}</li>` : ''}
                        ${changes.date ? `<li><strong>Start Date:</strong> ${changes.date}</li>` : ''}
                        ${changes.endDate ? `<li><strong>End Date:</strong> ${changes.endDate}</li>` : ''}
                        ${changes.dropoffTime ? `<li><strong>Drop-Off:</strong> ${new Date(changes.dropoffTime).toLocaleString()}</li>` : ''}
                        ${changes.pickupTime ? `<li><strong>Pick-Up:</strong> ${new Date(changes.pickupTime).toLocaleString()}</li>` : ''}
                        ${changes.addons?.length ? `<li><strong>Add-ons:</strong> ${changes.addons.join(', ')}</li>` : ''}
                    </ul>
                </div>

                <div style="font-size:.88rem;margin-bottom:12px;padding:10px;background:rgba(108,92,231,.04);border-radius:6px">
                    <strong>Reason:</strong> ${escHTML(r.reason)}
                </div>

                <div class="form-group"><label class="form-label">Admin Response (optional — client sees this)</label><textarea class="form-textarea" id="arResponse_${r.id}" rows="2" placeholder="e.g. Approved — updated your booking! / Sorry, that date is fully booked."></textarea></div>

                <div style="display:flex;gap:8px">
                    <button class="btn btn-success" onclick="resolveEditRequest('${r.id}','approved')">✅ Approve & Apply</button>
                    <button class="btn btn-danger" onclick="resolveEditRequest('${r.id}','denied')">❌ Deny</button>
                </div>
            </div>`;
        }).join('')}
        `}
    </div>

    <!-- HISTORY -->
    ${resolved.length > 0 ? `<div class="card">
        <div class="card-header"><span class="card-title">History (${resolved.length})</span></div>
        <div class="table-wrap"><table>
            <thead><tr><th>Client</th><th>Booking</th><th>Changes</th><th>Reason</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>${resolved.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(r => {
                const b2 = bookings.find(x => x.id === r.bookingId);
                const changes = r.requestedChanges || {};
                const changeSummary = [changes.service, changes.date, changes.addons?.length ? changes.addons.length + ' addons' : ''].filter(Boolean).join(', ') || 'See details';
                return `<tr>
                    <td>${escHTML(r.clientName)}</td>
                    <td style="font-size:.85rem">${b2 ? escHTML(b2.service) + ' — ' + escHTML(b2.petName) : 'N/A'}</td>
                    <td style="font-size:.85rem">${escHTML(changeSummary)}</td>
                    <td style="font-size:.85rem;max-width:200px">${escHTML(r.reason)}</td>
                    <td><span class="badge ${r.status === 'approved' ? 'badge-confirmed' : 'badge-cancelled'}">${r.status}</span></td>
                    <td style="font-size:.82rem">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                </tr>`;
            }).join('')}</tbody>
        </table></div>
    </div>` : ''}`;
};

const resolveEditRequest = (reqId, decision) => {
    const editRequests = load('edit_requests', []);
    const req = editRequests.find(r => r.id === reqId);
    if (!req) return;

    req.status = decision;
    req.adminResponse = document.getElementById('arResponse_' + reqId)?.value?.trim() || '';
    req.resolvedAt = new Date().toISOString();

    // If approved, apply changes to the booking
    if (decision === 'approved') {
        const changes = req.requestedChanges || {};
        const b = bookings.find(x => x.id === req.bookingId);
        if (b) {
            if (changes.service) {
                b.service = changes.service;
                const svc = services.find(s => s.name === changes.service);
                if (svc) b.amount = svc.price;
            }
            if (changes.date) b.date = changes.date;
            if (changes.endDate) b.endDate = changes.endDate;
            if (changes.dropoffTime) b.dropoffTime = changes.dropoffTime;
            if (changes.pickupTime) b.pickupTime = changes.pickupTime;
            if (changes.addons) b.addons = changes.addons;
            save('bookings', bookings);
        }
    }

    save('edit_requests', editRequests);

    // Notify client
    if (typeof GPC_NOTIFY !== 'undefined') {
        const emoji = decision === 'approved' ? '✅' : '❌';
        GPC_NOTIFY.create({ type: 'edit_response', title: `${emoji} Edit Request ${decision === 'approved' ? 'Approved' : 'Denied'}`, body: req.adminResponse || `Your booking change was ${decision}.`, audience: 'client', clientId: req.clientId, createdAt: new Date().toISOString() });
        // Email notification
        if (req.clientEmail) {
            GPC_NOTIFY.sendDirectEmail(req.clientEmail, req.clientName,
                `GenusPupClub — Booking Edit ${decision === 'approved' ? 'Approved' : 'Denied'}`,
                `Hi ${req.clientName},\n\nYour booking change request has been ${decision}.\n\n${req.adminResponse ? 'Message from admin: ' + req.adminResponse + '\n\n' : ''}Log in to your portal to see the details: ${window.location.origin}/portal.html\n\n— GenusPupClub`
            );
        }
    }

    renderApprovals();
};

// ============================================
// SATISFACTION SURVEYS — Admin View
// ============================================
const renderSatisfaction = () => {
    const surveys = load('satisfaction_surveys', []);
    const avgRating = surveys.length ? (surveys.reduce((s, sv) => s + (sv.rating || 0), 0) / surveys.length).toFixed(1) : '—';
    const wouldBookAgain = surveys.filter(s => s.bookAgain === 'Definitely' || s.bookAgain === 'Probably').length;
    const needsAttention = surveys.filter(s => s.rating <= 3 || s.whatToImprove).length;

    // Aggregate sub-ratings
    const subRatingTotals = {};
    const subRatingCounts = {};
    surveys.forEach(sv => {
        if (sv.subRatings) {
            Object.entries(sv.subRatings).forEach(([area, val]) => {
                subRatingTotals[area] = (subRatingTotals[area] || 0) + val;
                subRatingCounts[area] = (subRatingCounts[area] || 0) + 1;
            });
        }
    });

    el.innerHTML = `
    <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Avg Rating</div><div class="stat-value">${avgRating} ⭐</div><div class="stat-sub">${surveys.length} surveys</div></div>
        <div class="stat-card green"><div class="stat-label">Would Book Again</div><div class="stat-value">${surveys.length ? Math.round(wouldBookAgain / surveys.length * 100) : 0}%</div><div class="stat-sub">${wouldBookAgain} of ${surveys.length}</div></div>
        <div class="stat-card" style="border-left-color:var(--danger)"><div class="stat-label">Needs Attention</div><div class="stat-value">${needsAttention}</div><div class="stat-sub">Low rating or improvement noted</div></div>
        <div class="stat-card blue"><div class="stat-label">Total Surveys</div><div class="stat-value">${surveys.length}</div></div>
    </div>

    <!-- SUB-RATING BREAKDOWN -->
    ${Object.keys(subRatingTotals).length > 0 ? `<div class="card">
        <div class="card-title" style="margin-bottom:14px">Area Breakdown</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
            ${Object.entries(subRatingTotals).map(([area, total]) => {
                const avg = (total / subRatingCounts[area]).toFixed(1);
                const pct = (avg / 5 * 100).toFixed(0);
                const color = avg >= 4 ? 'var(--success)' : avg >= 3 ? 'var(--warning)' : 'var(--danger)';
                return `<div style="padding:12px;background:var(--bg);border-radius:8px">
                    <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:4px">${escHTML(area)}</div>
                    <div style="display:flex;align-items:center;gap:8px">
                        <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${color};border-radius:4px"></div></div>
                        <strong style="font-size:.88rem;color:${color}">${avg}</strong>
                    </div>
                </div>`;
            }).join('')}
        </div>
    </div>` : ''}

    <!-- INDIVIDUAL SURVEYS -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">All Surveys (${surveys.length})</span>
            <button class="btn btn-sm btn-ghost" onclick="exportSurveysForAI()">🤖 Copy for AI</button>
        </div>
        ${surveys.length === 0 ? '<div class="empty"><div class="empty-icon">📊</div><p>No surveys yet. Clients can rate completed bookings from their portal.</p></div>' : `
        ${[...surveys].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(sv => {
            const b = bookings.find(x => x.id === sv.bookingId);
            const stars = '⭐'.repeat(sv.rating || 0);
            const isLow = sv.rating <= 3;
            return `<div style="padding:14px;border-bottom:1px solid var(--border);${isLow ? 'background:rgba(225,112,85,.04);border-left:3px solid var(--danger)' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <strong>${escHTML(sv.clientName)}</strong>
                        <span style="margin-left:8px;font-size:1rem">${stars}</span>
                        ${sv.petMood ? `<span class="badge" style="background:rgba(0,184,148,.1);color:var(--success);margin-left:8px">${escHTML(sv.petMood)}</span>` : ''}
                        ${sv.bookAgain ? `<span class="badge" style="background:rgba(116,185,255,.1);color:var(--info);margin-left:4px">${escHTML(sv.bookAgain)}</span>` : ''}
                    </div>
                    <span style="font-size:.78rem;color:var(--text-muted)">${sv.createdAt ? new Date(sv.createdAt).toLocaleDateString() : '—'}</span>
                </div>
                ${b ? `<div style="font-size:.82rem;color:var(--text-muted);margin-top:4px">${escHTML(b.service)} for ${escHTML(b.petName)} on ${b.date}</div>` : ''}
                ${sv.whatWentWell ? `<div style="font-size:.88rem;margin-top:8px;color:var(--success)"><strong>What went well:</strong> ${escHTML(sv.whatWentWell)}</div>` : ''}
                ${sv.whatToImprove ? `<div style="font-size:.88rem;margin-top:4px;color:var(--danger)"><strong>To improve:</strong> ${escHTML(sv.whatToImprove)}</div>` : ''}
                ${sv.subRatings ? `<div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">${Object.entries(sv.subRatings).map(([area, val]) => `<span style="font-size:.75rem;padding:2px 8px;border-radius:4px;background:${val >= 4 ? 'rgba(0,184,148,.08)' : val >= 3 ? 'rgba(253,203,110,.15)' : 'rgba(225,112,85,.08)'}">${area}: ${val}/5</span>`).join('')}</div>` : ''}
            </div>`;
        }).join('')}
        `}
    </div>`;
};

const exportSurveysForAI = () => {
    const surveys = load('satisfaction_surveys', []);
    if (surveys.length === 0) { alert('No surveys to export.'); return; }
    const text = `# GenusPupClub — Client Satisfaction Surveys (${surveys.length})\nExported: ${new Date().toLocaleString()}\n\n` +
        surveys.map((sv, i) => {
            const b = bookings.find(x => x.id === sv.bookingId);
            return [
                `## ${i + 1}. ${sv.clientName} — ${'⭐'.repeat(sv.rating || 0)}`,
                b ? `Service: ${b.service} for ${b.petName} on ${b.date}` : '',
                sv.petMood ? `Pet mood at pickup: ${sv.petMood}` : '',
                sv.bookAgain ? `Would book again: ${sv.bookAgain}` : '',
                sv.whatWentWell ? `What went well: ${sv.whatWentWell}` : '',
                sv.whatToImprove ? `To improve: ${sv.whatToImprove}` : '',
                sv.subRatings ? `Sub-ratings: ${Object.entries(sv.subRatings).map(([a, v]) => `${a}=${v}/5`).join(', ')}` : ''
            ].filter(Boolean).join('\n');
        }).join('\n\n---\n\n');
    navigator.clipboard.writeText(text).then(() => alert(`Copied ${surveys.length} survey(s) to clipboard!`));
};

// ============================================
// FEEDBACK BOX — Suggestions, Complaints & Fix Requests
// ============================================
const FEEDBACK_CATEGORIES = [
    { value: 'suggestion', label: 'Suggestion', icon: '💡', color: '#00B894' },
    { value: 'complaint', label: 'Complaint', icon: '😤', color: '#E17055' },
    { value: 'bug', label: 'Bug / Fix Needed', icon: '🐛', color: '#D63031' },
    { value: 'feature', label: 'Feature Request', icon: '🚀', color: '#6C5CE7' },
    { value: 'compliment', label: 'Compliment', icon: '🌟', color: '#FDCB6E' },
    { value: 'safety', label: 'Safety Concern', icon: '⚠️', color: '#E17055' },
    { value: 'pricing', label: 'Pricing Feedback', icon: '💲', color: '#00B894' },
    { value: 'scheduling', label: 'Scheduling Issue', icon: '📅', color: '#74B9FF' },
    { value: 'staff', label: 'Staff Feedback', icon: '🧑‍🤝‍🧑', color: '#A29BFE' },
    { value: 'other', label: 'Other', icon: '📝', color: '#636E72' }
];
const FEEDBACK_PRIORITIES = [
    { value: 'low', label: 'Low', color: '#00B894' },
    { value: 'medium', label: 'Medium', color: '#FDCB6E' },
    { value: 'high', label: 'High', color: '#E17055' },
    { value: 'urgent', label: 'Urgent', color: '#D63031' }
];
const FEEDBACK_STATUSES = [
    { value: 'new', label: 'New', color: '#74B9FF' },
    { value: 'reviewed', label: 'Reviewed', color: '#A29BFE' },
    { value: 'in_progress', label: 'In Progress', color: '#FDCB6E' },
    { value: 'implemented', label: 'Implemented', color: '#00B894' },
    { value: 'wont_fix', label: "Won't Fix", color: '#636E72' },
    { value: 'duplicate', label: 'Duplicate', color: '#B2BEC3' }
];

const getFeedbackCat = (val) => FEEDBACK_CATEGORIES.find(c => c.value === val) || FEEDBACK_CATEGORIES[9];
const getFeedbackPri = (val) => FEEDBACK_PRIORITIES.find(p => p.value === val) || FEEDBACK_PRIORITIES[0];
const getFeedbackStatus = (val) => FEEDBACK_STATUSES.find(s => s.value === val) || FEEDBACK_STATUSES[0];

let feedbackFilter = { category: 'all', priority: 'all', status: 'all', search: '' };

const renderFeedback = () => {
    const feedback = load('feedback', []);
    const totalNew = feedback.filter(f => f.status === 'new').length;
    const totalOpen = feedback.filter(f => ['new', 'reviewed', 'in_progress'].includes(f.status)).length;
    const totalImplemented = feedback.filter(f => f.status === 'implemented').length;
    const totalComplaints = feedback.filter(f => f.category === 'complaint' || f.category === 'safety').length;
    const totalBugs = feedback.filter(f => f.category === 'bug').length;

    // Apply filters
    let filtered = [...feedback];
    if (feedbackFilter.category !== 'all') filtered = filtered.filter(f => f.category === feedbackFilter.category);
    if (feedbackFilter.priority !== 'all') filtered = filtered.filter(f => f.priority === feedbackFilter.priority);
    if (feedbackFilter.status !== 'all') filtered = filtered.filter(f => f.status === feedbackFilter.status);
    if (feedbackFilter.search) {
        const q = feedbackFilter.search.toLowerCase();
        filtered = filtered.filter(f => (f.summary || '').toLowerCase().includes(q) || (f.details || '').toLowerCase().includes(q) || (f.clientName || '').toLowerCase().includes(q));
    }
    filtered.sort((a, b) => {
        const priOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        if (priOrder[a.priority] !== priOrder[b.priority]) return (priOrder[a.priority] ?? 3) - (priOrder[b.priority] ?? 3);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    const catOpts = FEEDBACK_CATEGORIES.map(c => `<option value="${c.value}" ${feedbackFilter.category === c.value ? 'selected' : ''}>${c.icon} ${c.label}</option>`).join('');
    const priOpts = FEEDBACK_PRIORITIES.map(p => `<option value="${p.value}" ${feedbackFilter.priority === p.value ? 'selected' : ''}>${p.label}</option>`).join('');
    const statusOpts = FEEDBACK_STATUSES.map(s => `<option value="${s.value}" ${feedbackFilter.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('');
    const clientOpts = clients.map(c => `<option value="${c.id}">${escHTML(c.name)}</option>`).join('');

    el.innerHTML = `
    <!-- STAT CARDS -->
    <div class="stats-grid">
        <div class="stat-card blue"><div class="stat-label">New / Unread</div><div class="stat-value">${totalNew}</div><div class="stat-sub">Awaiting review</div></div>
        <div class="stat-card yellow"><div class="stat-label">Open Items</div><div class="stat-value">${totalOpen}</div><div class="stat-sub">New + Reviewed + In Progress</div></div>
        <div class="stat-card green"><div class="stat-label">Implemented</div><div class="stat-value">${totalImplemented}</div><div class="stat-sub">Changes shipped</div></div>
        <div class="stat-card" style="border-left-color:var(--danger)"><div class="stat-label">Complaints + Bugs</div><div class="stat-value">${totalComplaints + totalBugs}</div><div class="stat-sub">${totalComplaints} complaints, ${totalBugs} bugs</div></div>
    </div>

    <!-- QUICK ADD -->
    <div class="card" id="fbQuickAdd">
        <div class="card-header">
            <span class="card-title">📬 Quick Add — Drop-Off Feedback</span>
            <button class="btn btn-ghost btn-sm" onclick="document.getElementById('fbQuickBody').style.display = document.getElementById('fbQuickBody').style.display==='none' ? 'block' : 'none'">Toggle ▾</button>
        </div>
        <div id="fbQuickBody">
            <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:14px">Client says something at drop-off? Log it in 10 seconds. You'll review later and hand it to your AI.</p>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Client (optional)</label>
                    <select class="form-select" id="fbClient"><option value="">— Walk-in / Anonymous —</option>${clientOpts}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-select" id="fbCategory">
                        ${FEEDBACK_CATEGORIES.map(c => `<option value="${c.value}">${c.icon} ${c.label}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-select" id="fbPriority">
                        ${FEEDBACK_PRIORITIES.map(p => `<option value="${p.value}" ${p.value === 'medium' ? 'selected' : ''}>${p.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Affects (area of site/service)</label>
                    <select class="form-select" id="fbAffects">
                        <option value="">— Select area —</option>
                        <option value="website">Website / Landing Page</option>
                        <option value="portal">Client Portal</option>
                        <option value="booking">Booking System</option>
                        <option value="dashboard">Admin Dashboard</option>
                        <option value="pricing">Pricing / Invoicing</option>
                        <option value="scheduling">Scheduling / Calendar</option>
                        <option value="communication">Communication (Email/SMS)</option>
                        <option value="photos">Photo Gallery / Updates</option>
                        <option value="report_cards">Report Cards</option>
                        <option value="waivers">Waivers / Forms</option>
                        <option value="walking">Dog Walking Service</option>
                        <option value="daycare">Daycare Service</option>
                        <option value="grooming">Grooming Service</option>
                        <option value="transport">Pet Taxi / Transport</option>
                        <option value="sitting">Overnight Sitting</option>
                        <option value="general">General / Other</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Summary (what they said — keep it short)</label>
                <input class="form-input" id="fbSummary" placeholder="e.g. 'Wants text updates not just email' or 'Calendar won't load on her phone'">
            </div>
            <div class="form-group">
                <label class="form-label">Details (optional — full context, exact words, specifics)</label>
                <textarea class="form-textarea" id="fbDetails" rows="3" placeholder="Any extra context... what page, what happened, what they expected, mood, urgency, etc."></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">📸 Screenshot / Photo (optional)</label>
                <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:6px">Snap a photo of the issue on their phone, a note they wrote, the screen showing the bug — anything visual helps your AI fix it faster.</p>
                <input type="file" id="fbScreenshot" accept="image/*" multiple onchange="previewFeedbackScreenshots(this)" style="font-size:.88rem">
                <div id="fbScreenshotPreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:12px">
                <button class="btn btn-primary" onclick="submitQuickFeedback()">📬 Log Feedback</button>
                <span style="font-size:.82rem;color:var(--text-muted)">Saved locally — review anytime, export to AI when ready</span>
            </div>
        </div>
    </div>

    <!-- FILTERS & ACTIONS -->
    <div class="card">
        <div class="card-header">
            <span class="card-title">All Feedback (${filtered.length} of ${feedback.length})</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn btn-sm btn-primary" onclick="exportFeedbackForAI()">🤖 Copy All for AI</button>
                <button class="btn btn-sm btn-success" onclick="exportFeedbackForAI('open')">📋 Copy Open Only</button>
                <button class="btn btn-sm btn-ghost" onclick="exportFeedbackCSV()">📊 Export CSV</button>
            </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">
            <select class="form-select" style="width:auto;min-width:140px" onchange="feedbackFilter.category=this.value;renderFeedback()">
                <option value="all">All Categories</option>${catOpts}
            </select>
            <select class="form-select" style="width:auto;min-width:120px" onchange="feedbackFilter.priority=this.value;renderFeedback()">
                <option value="all">All Priorities</option>${priOpts}
            </select>
            <select class="form-select" style="width:auto;min-width:120px" onchange="feedbackFilter.status=this.value;renderFeedback()">
                <option value="all">All Statuses</option>${statusOpts}
            </select>
            <input class="form-input" style="width:auto;min-width:200px;flex:1" placeholder="🔍 Search feedback..." value="${escHTML(feedbackFilter.search)}" oninput="feedbackFilter.search=this.value;renderFeedback()">
        </div>

        ${filtered.length === 0 ? `
            <div class="empty">
                <div class="empty-icon">📬</div>
                <p>No feedback yet. Log your first one above!</p>
                <p style="font-size:.82rem;color:var(--text-muted);margin-top:8px">When a client mentions something at drop-off — a suggestion, complaint, bug, anything — log it here.<br>Later, copy it all and hand it to your AI to implement.</p>
            </div>
        ` : `
            <!-- BULK ACTIONS -->
            <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">
                <label style="font-size:.82rem;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" id="fbSelectAll" onchange="toggleAllFeedback(this.checked)"> Select All</label>
                <button class="btn btn-sm btn-ghost" onclick="bulkUpdateFeedbackStatus('reviewed')">Mark Reviewed</button>
                <button class="btn btn-sm btn-ghost" onclick="bulkUpdateFeedbackStatus('in_progress')">Mark In Progress</button>
                <button class="btn btn-sm btn-ghost" style="color:var(--success)" onclick="bulkUpdateFeedbackStatus('implemented')">Mark Done</button>
                <button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="bulkDeleteFeedback()">Delete Selected</button>
            </div>

            <div class="table-wrap">
                <table>
                    <thead><tr>
                        <th style="width:30px"></th>
                        <th>Category</th>
                        <th>Summary</th>
                        <th>Client</th>
                        <th>Area</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>📎</th>
                        <th>Actions</th>
                    </tr></thead>
                    <tbody>
                        ${filtered.map(f => {
                            const cat = getFeedbackCat(f.category);
                            const pri = getFeedbackPri(f.priority);
                            const st = getFeedbackStatus(f.status);
                            const clientObj = f.clientId ? clients.find(c => c.id === f.clientId) : null;
                            const hasScreenshots = f.screenshots && f.screenshots.length > 0;
                            const dateStr = f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                            return `<tr style="${f.status === 'new' ? 'background:rgba(116,185,255,0.04);font-weight:500' : ''}">
                                <td><input type="checkbox" class="fb-check" value="${f.id}"></td>
                                <td><span style="font-size:.95rem" title="${escHTML(cat.label)}">${cat.icon}</span> <span style="font-size:.82rem">${escHTML(cat.label)}</span></td>
                                <td style="max-width:260px">
                                    <div style="font-size:.9rem;${f.status === 'new' ? 'font-weight:600' : ''}">${escHTML(f.summary || '(no summary)')}</div>
                                    ${f.details ? `<div style="font-size:.78rem;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px">${escHTML(f.details)}</div>` : ''}
                                </td>
                                <td style="font-size:.85rem">${clientObj ? escHTML(clientObj.name) : (f.clientName ? escHTML(f.clientName) : '<span style="color:var(--text-muted)">Anon</span>')}</td>
                                <td style="font-size:.82rem">${escHTML(f.affects || '—')}</td>
                                <td><span class="badge" style="background:${pri.color}20;color:${pri.color}">${pri.label}</span></td>
                                <td>
                                    <select class="form-select" style="padding:4px 8px;font-size:.78rem;width:auto;border-color:${st.color}" onchange="updateFeedbackStatus('${f.id}',this.value)">
                                        ${FEEDBACK_STATUSES.map(s => `<option value="${s.value}" ${f.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
                                    </select>
                                </td>
                                <td style="font-size:.82rem;white-space:nowrap">${dateStr}</td>
                                <td>${hasScreenshots ? `<span title="${f.screenshots.length} screenshot(s)" style="cursor:pointer" onclick="viewFeedbackScreenshots('${f.id}')">📸${f.screenshots.length > 1 ? f.screenshots.length : ''}</span>` : ''}</td>
                                <td style="white-space:nowrap">
                                    <button class="btn btn-sm btn-ghost" onclick="viewFeedbackDetail('${f.id}')" title="View details">👁️</button>
                                    <button class="btn btn-sm btn-ghost" onclick="editFeedbackItem('${f.id}')" title="Edit">✏️</button>
                                    <button class="btn btn-sm btn-ghost" onclick="copyFeedbackItem('${f.id}')" title="Copy for AI">🤖</button>
                                    <button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteFeedbackItem('${f.id}')" title="Delete">🗑️</button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `}
    </div>

    <!-- AI EXPORT GUIDE -->
    <div class="card" style="border-left:4px solid #6C5CE7">
        <div class="card-header">
            <span class="card-title">🤖 How to Use This with Your AI</span>
        </div>
        <div style="font-size:.88rem;color:var(--text-light);line-height:1.7">
            <ol style="padding-left:20px">
                <li><strong>Log feedback</strong> at drop-off using the Quick Add form above — takes 10 seconds</li>
                <li><strong>Attach screenshots</strong> of the issue (phone photo, screen capture, client's phone) — visuals help the AI understand exactly what's wrong</li>
                <li><strong>Click "🤖 Copy All for AI"</strong> to copy every open item to your clipboard as a formatted list</li>
                <li><strong>Paste it into Claude</strong> (or your AI of choice) and say: <em>"Here's client feedback for my dog care website. Implement these changes."</em></li>
                <li><strong>Mark items as "Implemented"</strong> after your AI builds the fix — keeps your queue clean</li>
            </ol>
            <div style="margin-top:12px;padding:12px;background:rgba(108,92,231,0.06);border-radius:8px">
                <strong>Pro tip:</strong> Use the "Copy Open Only" button for a focused list. The export includes category, priority, area affected, client name, and full details — everything your AI needs to understand the request and build the fix without you having to re-explain.
            </div>
        </div>
    </div>`;
};

// ---- Screenshot preview for quick-add form ----
let _fbPendingScreenshots = [];
const previewFeedbackScreenshots = (input) => {
    const preview = document.getElementById('fbScreenshotPreview');
    if (!preview) return;
    const files = Array.from(input.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            _fbPendingScreenshots.push({ name: file.name, data: e.target.result, addedAt: new Date().toISOString() });
            renderScreenshotPreviews();
        };
        reader.readAsDataURL(file);
    });
};
const renderScreenshotPreviews = () => {
    const preview = document.getElementById('fbScreenshotPreview');
    if (!preview) return;
    preview.innerHTML = _fbPendingScreenshots.map((s, i) => `
        <div class="fb-screenshot-thumb" style="position:relative;width:80px;height:80px;border-radius:8px;overflow:hidden;border:2px solid var(--border);cursor:pointer" onclick="viewScreenshotFull('${escHTML(s.data)}')">
            <img src="${s.data}" style="width:100%;height:100%;object-fit:cover">
            <button onclick="event.stopPropagation();removePendingScreenshot(${i})" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
        </div>
    `).join('');
};
const removePendingScreenshot = (idx) => {
    _fbPendingScreenshots.splice(idx, 1);
    renderScreenshotPreviews();
};
const viewScreenshotFull = (src) => {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal" style="max-width:90vw;max-height:90vh;padding:12px;text-align:center">
        <img src="${src}" style="max-width:100%;max-height:80vh;border-radius:8px">
        <div style="margin-top:12px"><button class="btn btn-ghost" onclick="closeModal()">Close</button></div>
    </div>`;
    overlay.classList.add('open');
};

// ---- Submit quick feedback ----
const submitQuickFeedback = () => {
    const summary = document.getElementById('fbSummary')?.value?.trim();
    if (!summary) { alert('Please enter a summary of what the client said.'); return; }
    const clientId = document.getElementById('fbClient')?.value || '';
    const clientObj = clientId ? clients.find(c => c.id === clientId) : null;
    const feedback = load('feedback', []);
    feedback.push({
        id: uid(),
        category: document.getElementById('fbCategory')?.value || 'suggestion',
        priority: document.getElementById('fbPriority')?.value || 'medium',
        affects: document.getElementById('fbAffects')?.value || '',
        summary,
        details: document.getElementById('fbDetails')?.value?.trim() || '',
        clientId: clientId || null,
        clientName: clientObj?.name || null,
        screenshots: [..._fbPendingScreenshots],
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        loggedBy: _adminSession?.email || 'admin',
        adminNotes: ''
    });
    save('feedback', feedback);
    _fbPendingScreenshots = [];
    renderFeedback();
    // Flash success
    const card = document.getElementById('fbQuickAdd');
    if (card) { card.style.boxShadow = '0 0 0 3px var(--success)'; setTimeout(() => card.style.boxShadow = '', 1200); }
};

// ---- Status update (inline dropdown) ----
const updateFeedbackStatus = (id, newStatus) => {
    const feedback = load('feedback', []);
    const item = feedback.find(f => f.id === id);
    if (item) { item.status = newStatus; item.updatedAt = new Date().toISOString(); save('feedback', feedback); renderFeedback(); }
};

// ---- View detail modal ----
const viewFeedbackDetail = (id) => {
    const feedback = load('feedback', []);
    const f = feedback.find(x => x.id === id);
    if (!f) return;
    const cat = getFeedbackCat(f.category);
    const pri = getFeedbackPri(f.priority);
    const st = getFeedbackStatus(f.status);
    const clientObj = f.clientId ? clients.find(c => c.id === f.clientId) : null;

    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }

    const screenshotHTML = f.screenshots && f.screenshots.length > 0
        ? `<div style="margin-top:12px"><strong style="font-size:.85rem">📸 Screenshots (${f.screenshots.length}):</strong><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${f.screenshots.map(s => `
            <div style="width:120px;height:120px;border-radius:8px;overflow:hidden;border:2px solid var(--border);cursor:pointer" onclick="viewScreenshotFull('${escHTML(s.data)}')">
                <img src="${s.data}" style="width:100%;height:100%;object-fit:cover">
            </div>`).join('')}</div></div>`
        : '';

    overlay.innerHTML = `<div class="modal" style="max-width:600px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
            <div>
                <div style="font-size:1.3rem;margin-bottom:4px">${cat.icon} <span style="font-family:var(--font-display)">${escHTML(f.summary)}</span></div>
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                    <span class="badge" style="background:${cat.color}20;color:${cat.color}">${cat.label}</span>
                    <span class="badge" style="background:${pri.color}20;color:${pri.color}">${pri.label} Priority</span>
                    <span class="badge" style="background:${st.color}20;color:${st.color}">${st.label}</span>
                </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="closeModal()" style="font-size:1.2rem">✕</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
            <div style="font-size:.85rem"><strong>Client:</strong> ${clientObj ? escHTML(clientObj.name) : (f.clientName || 'Anonymous')}</div>
            <div style="font-size:.85rem"><strong>Area:</strong> ${escHTML(f.affects || 'Not specified')}</div>
            <div style="font-size:.85rem"><strong>Logged:</strong> ${f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}</div>
            <div style="font-size:.85rem"><strong>By:</strong> ${escHTML(f.loggedBy || 'admin')}</div>
        </div>

        ${f.details ? `<div style="background:var(--bg);padding:14px;border-radius:8px;margin-bottom:12px">
            <strong style="font-size:.82rem;color:var(--text-muted)">Full Details:</strong>
            <p style="font-size:.9rem;margin-top:6px;white-space:pre-wrap;line-height:1.6">${escHTML(f.details)}</p>
        </div>` : ''}

        ${screenshotHTML}

        <div style="margin-top:14px">
            <label class="form-label">Admin Notes (internal — not shared with client)</label>
            <textarea class="form-textarea" id="fbAdminNotes" rows="2" placeholder="Your notes... what action to take, who to assign, etc.">${escHTML(f.adminNotes || '')}</textarea>
        </div>

        <div style="margin-top:14px">
            <label class="form-label">Update Status</label>
            <select class="form-select" id="fbDetailStatus">
                ${FEEDBACK_STATUSES.map(s => `<option value="${s.value}" ${f.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
        </div>

        <div class="modal-footer" style="flex-wrap:wrap">
            <button class="btn btn-ghost" onclick="copyFeedbackItem('${f.id}');closeModal()">🤖 Copy for AI</button>
            <button class="btn btn-ghost" onclick="editFeedbackItem('${f.id}');closeModal()">✏️ Edit</button>
            <button class="btn btn-primary" onclick="saveFeedbackDetail('${f.id}')">💾 Save & Close</button>
        </div>
    </div>`;
    overlay.classList.add('open');
    // Mark as reviewed if it was new
    if (f.status === 'new') { f.status = 'reviewed'; f.updatedAt = new Date().toISOString(); save('feedback', feedback); }
};

const saveFeedbackDetail = (id) => {
    const feedback = load('feedback', []);
    const f = feedback.find(x => x.id === id);
    if (!f) return;
    f.adminNotes = document.getElementById('fbAdminNotes')?.value?.trim() || '';
    f.status = document.getElementById('fbDetailStatus')?.value || f.status;
    f.updatedAt = new Date().toISOString();
    save('feedback', feedback);
    closeModal();
    renderFeedback();
};

// ---- Edit feedback item (full modal) ----
const editFeedbackItem = (id) => {
    const feedback = load('feedback', []);
    const f = feedback.find(x => x.id === id);
    if (!f) return;
    const clientOpts = clients.map(c => `<option value="${c.id}" ${f.clientId === c.id ? 'selected' : ''}>${escHTML(c.name)}</option>`).join('');

    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }

    overlay.innerHTML = `<div class="modal" style="max-width:550px">
        <div class="modal-title">✏️ Edit Feedback</div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Client</label><select class="form-select" id="efClient"><option value="">Anonymous</option>${clientOpts}</select></div>
            <div class="form-group"><label class="form-label">Category</label><select class="form-select" id="efCategory">${FEEDBACK_CATEGORIES.map(c => `<option value="${c.value}" ${f.category === c.value ? 'selected' : ''}>${c.icon} ${c.label}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="efPriority">${FEEDBACK_PRIORITIES.map(p => `<option value="${p.value}" ${f.priority === p.value ? 'selected' : ''}>${p.label}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">Area Affected</label><select class="form-select" id="efAffects">
                <option value="">— Select —</option>
                ${['website','portal','booking','dashboard','pricing','scheduling','communication','photos','report_cards','waivers','walking','daycare','grooming','transport','sitting','general'].map(a => `<option value="${a}" ${f.affects === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select></div>
        </div>
        <div class="form-group"><label class="form-label">Summary</label><input class="form-input" id="efSummary" value="${escHTML(f.summary || '')}"></div>
        <div class="form-group"><label class="form-label">Details</label><textarea class="form-textarea" id="efDetails" rows="4">${escHTML(f.details || '')}</textarea></div>
        <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="efStatus">${FEEDBACK_STATUSES.map(s => `<option value="${s.value}" ${f.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Admin Notes</label><textarea class="form-textarea" id="efNotes" rows="2">${escHTML(f.adminNotes || '')}</textarea></div>
        <div class="form-group">
            <label class="form-label">📸 Add More Screenshots</label>
            <input type="file" id="efScreenshot" accept="image/*" multiple style="font-size:.88rem">
            ${f.screenshots && f.screenshots.length > 0 ? `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${f.screenshots.map((s, i) => `
                <div style="position:relative;width:70px;height:70px;border-radius:6px;overflow:hidden;border:1px solid var(--border)">
                    <img src="${s.data}" style="width:100%;height:100%;object-fit:cover">
                    <button onclick="removeEditScreenshot('${f.id}',${i})" style="position:absolute;top:1px;right:1px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:.65rem;cursor:pointer">✕</button>
                </div>`).join('')}</div>` : ''}
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="saveEditFeedback('${f.id}')">💾 Save Changes</button>
        </div>
    </div>`;
    overlay.classList.add('open');
};

const saveEditFeedback = (id) => {
    const feedback = load('feedback', []);
    const f = feedback.find(x => x.id === id);
    if (!f) return;
    const clientId = document.getElementById('efClient')?.value || '';
    const clientObj = clientId ? clients.find(c => c.id === clientId) : null;
    f.category = document.getElementById('efCategory')?.value || f.category;
    f.priority = document.getElementById('efPriority')?.value || f.priority;
    f.affects = document.getElementById('efAffects')?.value || '';
    f.summary = document.getElementById('efSummary')?.value?.trim() || f.summary;
    f.details = document.getElementById('efDetails')?.value?.trim() || '';
    f.status = document.getElementById('efStatus')?.value || f.status;
    f.adminNotes = document.getElementById('efNotes')?.value?.trim() || '';
    f.clientId = clientId || null;
    f.clientName = clientObj?.name || null;
    f.updatedAt = new Date().toISOString();
    // Handle new screenshots
    const fileInput = document.getElementById('efScreenshot');
    if (fileInput?.files?.length) {
        const files = Array.from(fileInput.files);
        let remaining = files.length;
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!f.screenshots) f.screenshots = [];
                f.screenshots.push({ name: file.name, data: e.target.result, addedAt: new Date().toISOString() });
                remaining--;
                if (remaining === 0) { save('feedback', feedback); closeModal(); renderFeedback(); }
            };
            reader.readAsDataURL(file);
        });
    } else {
        save('feedback', feedback);
        closeModal();
        renderFeedback();
    }
};

const removeEditScreenshot = (id, idx) => {
    const feedback = load('feedback', []);
    const f = feedback.find(x => x.id === id);
    if (f?.screenshots) { f.screenshots.splice(idx, 1); save('feedback', feedback); editFeedbackItem(id); }
};

// ---- Delete ----
const deleteFeedbackItem = (id) => {
    if (!confirm('Delete this feedback item?')) return;
    let feedback = load('feedback', []);
    feedback = feedback.filter(f => f.id !== id);
    save('feedback', feedback);
    renderFeedback();
};

// ---- View screenshots modal ----
const viewFeedbackScreenshots = (id) => {
    const feedback = load('feedback', []);
    const f = feedback.find(x => x.id === id);
    if (!f?.screenshots?.length) return;
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'modalOverlay'; overlay.className = 'modal-overlay'; overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); }); document.body.appendChild(overlay); }
    overlay.innerHTML = `<div class="modal" style="max-width:700px">
        <div class="modal-title">📸 Screenshots — ${escHTML(f.summary)}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
            ${f.screenshots.map(s => `
                <div style="border-radius:8px;overflow:hidden;border:2px solid var(--border);cursor:pointer" onclick="viewScreenshotFull('${escHTML(s.data)}')">
                    <img src="${s.data}" style="width:100%;height:180px;object-fit:cover">
                    <div style="padding:6px;font-size:.75rem;color:var(--text-muted)">${escHTML(s.name || 'Screenshot')}</div>
                </div>
            `).join('')}
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Close</button></div>
    </div>`;
    overlay.classList.add('open');
};

// ---- Copy single item for AI ----
const copyFeedbackItem = (id) => {
    const feedback = load('feedback', []);
    const f = feedback.find(x => x.id === id);
    if (!f) return;
    const cat = getFeedbackCat(f.category);
    const pri = getFeedbackPri(f.priority);
    const clientObj = f.clientId ? clients.find(c => c.id === f.clientId) : null;
    const text = [
        `[${cat.label.toUpperCase()}] ${f.summary}`,
        `Priority: ${pri.label} | Area: ${f.affects || 'General'} | Client: ${clientObj?.name || f.clientName || 'Anonymous'}`,
        f.details ? `Details: ${f.details}` : '',
        f.adminNotes ? `Admin Notes: ${f.adminNotes}` : '',
        f.screenshots?.length ? `[${f.screenshots.length} screenshot(s) attached — see dashboard]` : ''
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard! Paste it into your AI.');
    });
};

// ---- Export all/open for AI ----
const exportFeedbackForAI = (filter) => {
    const feedback = load('feedback', []);
    let items = feedback;
    if (filter === 'open') items = feedback.filter(f => ['new', 'reviewed', 'in_progress'].includes(f.status));

    if (items.length === 0) { alert('No feedback items to export.'); return; }

    const header = `# GenusPupClub — Client Feedback (${items.length} items)\nExported: ${new Date().toLocaleString()}\nSource: Admin Dashboard → Feedback Box\n\nPlease review and implement the following client feedback for our dog care website/service:\n`;

    const body = items.map((f, i) => {
        const cat = getFeedbackCat(f.category);
        const pri = getFeedbackPri(f.priority);
        const clientObj = f.clientId ? clients.find(c => c.id === f.clientId) : null;
        return [
            `---`,
            `## ${i + 1}. [${cat.label.toUpperCase()}] ${f.summary}`,
            `- **Priority:** ${pri.label}`,
            `- **Area:** ${f.affects || 'General'}`,
            `- **Client:** ${clientObj?.name || f.clientName || 'Anonymous'}`,
            `- **Status:** ${getFeedbackStatus(f.status).label}`,
            `- **Logged:** ${f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}`,
            f.details ? `- **Details:** ${f.details}` : '',
            f.adminNotes ? `- **Admin Notes:** ${f.adminNotes}` : '',
            f.screenshots?.length ? `- **Screenshots:** ${f.screenshots.length} attached (see dashboard for images)` : ''
        ].filter(Boolean).join('\n');
    }).join('\n\n');

    const fullText = header + '\n' + body + '\n\n---\nEnd of feedback export.';
    navigator.clipboard.writeText(fullText).then(() => {
        alert(`Copied ${items.length} feedback item(s) to clipboard!\n\nPaste into your AI and say:\n"Here's client feedback for my dog care website. Implement these changes."`);
    });
};

// ---- Export CSV ----
const exportFeedbackCSV = () => {
    const feedback = load('feedback', []);
    if (feedback.length === 0) { alert('No feedback to export.'); return; }
    const rows = [['Category', 'Priority', 'Status', 'Summary', 'Details', 'Client', 'Area', 'Date', 'Screenshots', 'Admin Notes']];
    feedback.forEach(f => {
        const clientObj = f.clientId ? clients.find(c => c.id === f.clientId) : null;
        rows.push([
            getFeedbackCat(f.category).label, getFeedbackPri(f.priority).label, getFeedbackStatus(f.status).label,
            `"${(f.summary || '').replace(/"/g, '""')}"`, `"${(f.details || '').replace(/"/g, '""')}"`,
            clientObj?.name || f.clientName || 'Anonymous', f.affects || '', f.createdAt || '',
            f.screenshots?.length || 0, `"${(f.adminNotes || '').replace(/"/g, '""')}"`
        ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `genuspupclub-feedback-${todayStr()}.csv`; a.click();
    URL.revokeObjectURL(url);
};

// ---- Bulk actions ----
const toggleAllFeedback = (checked) => {
    document.querySelectorAll('.fb-check').forEach(cb => cb.checked = checked);
};
const getSelectedFeedbackIds = () => Array.from(document.querySelectorAll('.fb-check:checked')).map(cb => cb.value);
const bulkUpdateFeedbackStatus = (newStatus) => {
    const ids = getSelectedFeedbackIds();
    if (ids.length === 0) { alert('Select at least one item.'); return; }
    const feedback = load('feedback', []);
    ids.forEach(id => {
        const f = feedback.find(x => x.id === id);
        if (f) { f.status = newStatus; f.updatedAt = new Date().toISOString(); }
    });
    save('feedback', feedback);
    renderFeedback();
};
const bulkDeleteFeedback = () => {
    const ids = getSelectedFeedbackIds();
    if (ids.length === 0) { alert('Select at least one item.'); return; }
    if (!confirm(`Delete ${ids.length} feedback item(s)?`)) return;
    let feedback = load('feedback', []);
    feedback = feedback.filter(f => !ids.includes(f.id));
    save('feedback', feedback);
    renderFeedback();
};

// Init
renderTab();
if (typeof GPC_NOTIFY !== 'undefined') {
    GPC_NOTIFY.renderBell('notifBell', 'admin');
    setInterval(() => GPC_NOTIFY.renderBell('notifBell', 'admin'), 10000);
}