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
    { id: uid(), name: 'Wesley P.', phone: '(804) 701-6631', email: 'wesley@genuspupclub.com', rate: 25, status: 'active', specialty: 'All breeds', bio: 'Founder & lead sitter. 3+ years experience with all breeds.', certifications: 'Pet First Aid, CPR', maxDogs: 3, availability: 'Mon-Sun' }
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
save('sitters', sitters);
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

    const views = { overview: renderOverview, bookings: renderBookings, clients: renderClients, pets: renderPets, schedule: renderSchedule, revenue: renderRevenue, payments: renderPaymentsAdmin, reviews: renderReviews, sitters: renderSitters, checkin: renderCheckIn, gallery: renderGallery, messages: renderMessages, settings: renderSettings };
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
// PAYMENTS (Admin View)
// ============================================
const renderPaymentsAdmin = () => {
    const allPayments = load('payments', []);
    const pending = allPayments.filter(p => p.status === 'pending');
    const paid = allPayments.filter(p => p.status === 'paid');
    const totalPaid = paid.reduce((s, p) => s + (parseFloat(p.amount) || 0) + (parseFloat(p.tip) || 0), 0);
    const totalPending = pending.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const totalTips = allPayments.reduce((s, p) => s + (parseFloat(p.tip) || 0), 0);
    const byMethod = {};
    allPayments.forEach(p => { byMethod[p.method || 'unknown'] = (byMethod[p.method || 'unknown'] || 0) + (parseFloat(p.amount) || 0) + (parseFloat(p.tip) || 0); });

    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card green"><div class="stat-label">Total Received</div><div class="stat-value">${fmt(totalPaid)}</div><div class="stat-sub">${paid.length} payments</div></div>
            <div class="stat-card yellow"><div class="stat-label">Pending</div><div class="stat-value">${fmt(totalPending)}</div><div class="stat-sub">${pending.length} awaiting</div></div>
            <div class="stat-card"><div class="stat-label">Total Tips</div><div class="stat-value">${fmt(totalTips)}</div></div>
            <div class="stat-card blue"><div class="stat-label">By Method</div><div class="stat-value" style="font-size:1rem">${Object.entries(byMethod).map(([m, v]) => `${m}: ${fmt(v)}`).join('<br>') || '—'}</div></div>
        </div>

        ${pending.length ? `<div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Pending Payments (${pending.length})</span></div>
            <div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Amount</th><th>Method</th><th>Tip</th><th></th></tr></thead>
                <tbody>${pending.map(p => {
                    const client = load('users', []).find(u => u.id === p.clientId);
                    return `<tr>
                        <td>${p.date}</td><td>${escHTML(client?.name || '—')}</td><td>${escHTML(p.service)}</td>
                        <td><strong>${fmt(p.amount)}</strong></td>
                        <td><span class="badge badge-pending">${p.method}</span></td>
                        <td>${p.tip ? fmt(p.tip) : '—'}</td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="confirmPayment('${p.id}')">Confirm Received</button>
                            <button class="btn btn-ghost btn-sm" onclick="deletePayment('${p.id}')">✕</button>
                        </td>
                    </tr>`;
                }).join('')}</tbody>
            </table></div>
        </div>` : ''}

        <div class="card">
            <div class="card-header"><span class="card-title">All Payments (${allPayments.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('manual_payment')">+ Record Cash Payment</button></div>
            ${allPayments.length ? `<div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Amount</th><th>Tip</th><th>Method</th><th>Status</th></tr></thead>
                <tbody>${allPayments.slice().reverse().map(p => {
                    const client = load('users', []).find(u => u.id === p.clientId);
                    return `<tr>
                        <td>${p.date}</td><td>${escHTML(client?.name || p.clientId || '—')}</td><td>${escHTML(p.service || '—')}</td>
                        <td>${fmt(p.amount)}</td><td>${p.tip ? fmt(p.tip) : '—'}</td>
                        <td><span class="badge badge-completed">${p.method}</span></td>
                        <td><span class="badge badge-${p.status === 'paid' ? 'confirmed' : 'pending'}">${p.status}</span></td>
                    </tr>`;
                }).join('')}</tbody>
            </table></div>` : '<div class="empty"><p>No payments recorded yet</p></div>'}
        </div>
    `;
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
// SITTERS
// ============================================
const renderSitters = () => {
    el.innerHTML = `
        <div class="card">
            <div class="card-header"><span class="card-title">Sitters (${sitters.length})</span><button class="btn btn-primary btn-sm" onclick="showModal('sitter')">+ Add Sitter</button></div>
            ${sitters.map(s => {
                const sBookings = bookings.filter(b => b.sitter === s.name);
                const sRevenue = sBookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + calcBookingTotal(b), 0);
                return `<div style="display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--border);align-items:flex-start">
                    <div style="width:48px;height:48px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;flex-shrink:0">${s.name.split(' ').map(n => n[0]).join('')}</div>
                    <div style="flex:1">
                        <div style="display:flex;justify-content:space-between"><strong>${escHTML(s.name)}</strong><span class="badge badge-confirmed">${s.status}</span></div>
                        <div style="font-size:.85rem;color:var(--text-light);margin:4px 0">${escHTML(s.phone || '')} · ${escHTML(s.email || '')} · ${fmt(s.rate)}/hr</div>
                        <div style="font-size:.82rem;color:var(--text-muted)">Specialty: ${escHTML(s.specialty)} · Max ${s.maxDogs || 3} dogs · ${escHTML(s.availability || 'Flexible')}</div>
                        ${s.certifications ? `<div style="font-size:.78rem;color:var(--accent);margin-top:2px">${escHTML(s.certifications)}</div>` : ''}
                        ${s.bio ? `<div style="font-size:.82rem;color:var(--text-muted);margin-top:4px;font-style:italic">${escHTML(s.bio)}</div>` : ''}
                        <div style="font-size:.82rem;margin-top:6px"><strong>${sBookings.length}</strong> bookings · <strong>${fmt(sRevenue)}</strong> revenue</div>
                    </div>
                    <button class="btn btn-ghost btn-sm" onclick="deleteItem('sitters','${s.id}')">✕</button>
                </div>`;
            }).join('')}
        </div>
    `;
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
                    <td><button class="btn btn-ghost btn-sm" onclick="deleteService('${s.id}')">✕</button></td>
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
        manual_payment: { title: 'Record Cash/Manual Payment', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Client Name</label><input class="form-input" id="mClientName"></div><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Amount</label><input class="form-input" id="mAmount" type="number" step="0.01"></div><div class="form-group"><label class="form-label">Tip</label><input class="form-input" id="mTip" type="number" step="0.01" value="0"></div></div>
            <div class="form-group"><label class="form-label">Payment Method</label><select class="form-select" id="mMethod"><option>Cash</option><option>Venmo</option><option>Zelle</option><option>CashApp</option><option>Check</option><option>Card (manual)</option></select></div>
            <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="mDate" type="date" value="${todayStr()}"></div>
        ` },
        checkin: { title: 'Check In Dog', body: `
            <div class="form-row"><div class="form-group"><label class="form-label">Pet Name</label><input class="form-input" id="mPetName"></div><div class="form-group"><label class="form-label">Owner Name</label><input class="form-input" id="mOwnerName"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Service</label><select class="form-select" id="mService">${svcOptions}</select></div><div class="form-group"><label class="form-label">Owner Phone</label><input class="form-input" id="mPhone" type="tel"></div></div>
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
        pets.push({ id: uid(), name: v('mName'), breed: v('mBreed'), age: v('mAge'), weight: v('mWeight'), gender: v('mGender'), fixed: v('mFixed'), clientId: v('mOwner'), vet: v('mVet'), allergies: v('mAllergies'), medications: v('mMeds'), feedingSchedule: v('mFeeding'), tags: v('mTags'), notes: v('mNotes') });
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
            service: v('mService'), checklist, belongings: v('mBelongings'),
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

const updateBooking = (id, status) => { const b = bookings.find(x => x.id === id); if (b) { b.status = status; save('bookings', bookings); renderTab(); } };
const deleteItem = (col, id) => { if (!confirm('Delete?')) return; const map = { bookings, clients, pets, reviews, sitters, messages }; map[col] = map[col].filter(x => x.id !== id); if (col === 'bookings') bookings = map[col]; else if (col === 'clients') clients = map[col]; else if (col === 'pets') pets = map[col]; else if (col === 'reviews') reviews = map[col]; else if (col === 'sitters') sitters = map[col]; save(col, map[col]); renderTab(); };
const editClient = (id) => { /* TODO: edit modal */ };

// Init
renderTab();
// Notification bell
if (typeof GPC_NOTIFY !== 'undefined') {
    GPC_NOTIFY.renderBell('notifBell', 'admin');
    setInterval(() => GPC_NOTIFY.renderBell('notifBell', 'admin'), 10000);
}
