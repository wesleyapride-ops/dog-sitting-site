// ============================================
// GenusPupClub — Client Portal
// Logged-in client view: bookings, pets, payments, messages
// ============================================

const GPC = 'gpc_';
const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(GPC + key)) || fb; } catch { return fb; } };
const save = (key, d) => localStorage.setItem(GPC + key, JSON.stringify(d));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = (n) => '$' + Number(n || 0).toFixed(2);
const todayStr = () => new Date().toISOString().split('T')[0];
const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ---- Auth Check ----
const session = JSON.parse(sessionStorage.getItem('gpc_client_auth') || 'null');
if (!session || !session.id) { window.location.href = 'login.html'; }

const userId = session?.id;
const userName = session?.name || 'Client';

// ---- State ----
let activeTab = 'dashboard';
let myBookings = [];
let myPets = [];
let myPayments = [];
let myMessages = [];

const refreshData = () => {
    const allBookings = load('bookings', []);
    const allPets = load('pets', []);
    const allPayments = load('payments', []);
    const allMessages = load('messages', []);
    // Filter to this client
    myBookings = allBookings.filter(b => b.clientId === userId || (b.clientName || '').toLowerCase() === userName.toLowerCase());
    myPets = allPets.filter(p => p.clientId === userId);
    myPayments = allPayments.filter(p => p.clientId === userId);
    myMessages = allMessages.filter(m => m.to === userName || m.from === userName);
};

// ---- UI ----
document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
document.getElementById('portalWelcome').innerHTML = `<h3>Welcome, ${esc(userName)}</h3><p>${esc(session?.email || '')}</p>`;

const el = document.getElementById('content');

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

const renderTab = () => {
    refreshData();
    const views = { dashboard: renderDashboard, mybookings: renderMyBookings, mypets: renderMyPets, payments: renderPayments, mymessages: renderMyMessages, newbooking: renderNewBooking, profile: renderProfile };
    (views[activeTab] || renderDashboard)();
};

const logout = () => { sessionStorage.removeItem('gpc_client_auth'); window.location.href = 'login.html'; };

// ============================================
// DASHBOARD
// ============================================
const renderDashboard = () => {
    const upcoming = myBookings.filter(b => b.date >= todayStr() && b.status !== 'cancelled');
    const totalSpent = myBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const paidAmount = myPayments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const owed = totalSpent - paidAmount;

    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Upcoming Bookings</div><div class="stat-value">${upcoming.length}</div></div>
            <div class="stat-card green"><div class="stat-label">My Pets</div><div class="stat-value">${myPets.length}</div></div>
            <div class="stat-card blue"><div class="stat-label">Total Visits</div><div class="stat-value">${myBookings.length}</div></div>
            <div class="stat-card ${owed > 0 ? 'yellow' : 'green'}"><div class="stat-label">Balance</div><div class="stat-value">${owed > 0 ? fmt(owed) + ' due' : 'Paid up!'}</div></div>
        </div>
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><span class="card-title">Upcoming</span></div>
                ${upcoming.length ? upcoming.slice(0, 5).map(b => `
                    <div class="schedule-item"><div class="schedule-time">${b.date}<br>${b.time || ''}</div>
                    <div class="schedule-info"><h4>${esc(b.petName)} — ${esc(b.service)}</h4><p><span class="badge badge-${b.status}">${b.status}</span> ${fmt(b.amount)}</p></div></div>
                `).join('') : '<div class="empty"><p>No upcoming bookings. <a href="#" onclick="document.querySelector(\'[data-tab=newbooking]\').click()">Book now</a></p></div>'}
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">My Pets</span></div>
                ${myPets.length ? myPets.map(p => `
                    <div class="pet-card" style="margin-bottom:8px"><div class="pet-avatar">🐕</div><div class="pet-info"><h4>${esc(p.name)}</h4><p>${esc(p.breed || '?')} · ${esc(p.age || '?')}</p></div></div>
                `).join('') : '<div class="empty"><p>No pets registered. <a href="#" onclick="document.querySelector(\'[data-tab=mypets]\').click()">Add your pup</a></p></div>'}
            </div>
        </div>
    `;
};

// ============================================
// MY BOOKINGS
// ============================================
const renderMyBookings = () => {
    const sorted = [...myBookings].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    el.innerHTML = `
        <div class="card">
            <div class="card-header"><span class="card-title">My Bookings (${sorted.length})</span></div>
            ${sorted.length ? `<div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Time</th><th>Pet</th><th>Service</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                <tbody>${sorted.map(b => `<tr>
                    <td>${b.date}</td><td>${b.time || '—'}</td><td>${esc(b.petName)}</td><td>${esc(b.service)}</td>
                    <td>${fmt(b.amount)}</td><td><span class="badge badge-${b.status}">${b.status}</span></td>
                    <td>${b.status === 'pending' ? `<button class="btn btn-ghost btn-sm" onclick="cancelBooking('${b.id}')">Cancel</button>` : ''}</td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty"><p>No bookings yet</p></div>'}
        </div>
    `;
};

const cancelBooking = (id) => {
    if (!confirm('Cancel this booking?')) return;
    const all = load('bookings', []);
    const b = all.find(x => x.id === id);
    if (b) { b.status = 'cancelled'; save('bookings', all); renderTab(); }
};

// ============================================
// MY PETS
// ============================================
const renderMyPets = () => {
    el.innerHTML = `
        <div class="card" style="margin-bottom:16px"><div class="card-header"><span class="card-title">My Pets (${myPets.length})</span><button class="btn btn-primary btn-sm" onclick="showAddPet()">+ Add Pet</button></div></div>
        <div class="stats-grid">${myPets.length ? myPets.map(p => `
            <div class="pet-card"><div class="pet-avatar">🐕</div><div class="pet-info" style="flex:1">
                <h4>${esc(p.name)}</h4>
                <p>${esc(p.breed || '?')} · ${esc(p.age || '?')} · ${esc(p.weight || '?')}</p>
                ${p.allergies ? `<p style="font-size:.78rem;color:var(--danger)">Allergies: ${esc(p.allergies)}</p>` : ''}
                ${p.medications ? `<p style="font-size:.78rem;color:var(--info)">Meds: ${esc(p.medications)}</p>` : ''}
                ${p.notes ? `<p style="font-size:.78rem;color:var(--text-muted)">${esc(p.notes)}</p>` : ''}
            </div></div>
        `).join('') : '<div class="card"><div class="empty"><p>Add your pup to get started</p></div></div>'}</div>
    `;
};

const showAddPet = () => {
    el.innerHTML += `
        <div class="card" style="margin-top:16px" id="addPetForm">
            <div class="card-title" style="margin-bottom:12px">Add a Pet</div>
            <div class="form-row"><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="pName"></div><div class="form-group"><label class="form-label">Breed</label><input class="form-input" id="pBreed"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Age</label><input class="form-input" id="pAge"></div><div class="form-group"><label class="form-label">Weight</label><input class="form-input" id="pWeight"></div></div>
            <div class="form-group"><label class="form-label">Allergies</label><input class="form-input" id="pAllergies"></div>
            <div class="form-group"><label class="form-label">Medications</label><input class="form-input" id="pMeds"></div>
            <div class="form-group"><label class="form-label">Special Notes</label><textarea class="form-textarea" id="pNotes" rows="2"></textarea></div>
            <button class="btn btn-primary" onclick="savePet()">Save Pet</button>
        </div>
    `;
};

const savePet = () => {
    const v = (id) => document.getElementById(id)?.value?.trim() || '';
    if (!v('pName')) { alert('Pet name required'); return; }
    const pets = load('pets', []);
    pets.push({ id: uid(), name: v('pName'), breed: v('pBreed'), age: v('pAge'), weight: v('pWeight'), allergies: v('pAllergies'), medications: v('pMeds'), notes: v('pNotes'), clientId: userId });
    save('pets', pets);
    renderTab();
};

// ============================================
// PAYMENTS
// ============================================
const renderPayments = () => {
    myPayments = load('payments', []).filter(p => p.clientId === userId);
    const totalBilled = myBookings.filter(b => b.status === 'completed').reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const totalPaid = myPayments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const balance = totalBilled - totalPaid;

    // Unpaid bookings
    const unpaid = myBookings.filter(b => b.status === 'completed' && !myPayments.find(p => p.bookingId === b.id));

    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Billed</div><div class="stat-value">${fmt(totalBilled)}</div></div>
            <div class="stat-card green"><div class="stat-label">Total Paid</div><div class="stat-value">${fmt(totalPaid)}</div></div>
            <div class="stat-card ${balance > 0 ? 'yellow' : 'green'}"><div class="stat-label">Balance Due</div><div class="stat-value">${balance > 0 ? fmt(balance) : 'Paid!'}</div></div>
        </div>

        ${unpaid.length ? `
            <div class="card" style="margin-bottom:16px">
                <div class="card-title" style="margin-bottom:12px">Outstanding Invoices</div>
                ${unpaid.map(b => `
                    <div class="invoice-card">
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <div>
                                <strong>${b.date} — ${esc(b.service)}</strong>
                                <div style="font-size:.82rem;color:var(--text-muted)">${esc(b.petName)}</div>
                            </div>
                            <div style="text-align:right">
                                <div style="font-size:1.2rem;font-weight:700;color:var(--primary)">${fmt(b.amount)}</div>
                                <div class="payment-methods">
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${b.amount}, 'card')">💳 Card</button>
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${b.amount}, 'venmo')">Venmo</button>
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${b.amount}, 'zelle')">Zelle</button>
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${b.amount}, 'cash')">Cash</button>
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${b.amount}, 'cashapp')">CashApp</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div class="card">
            <div class="card-title" style="margin-bottom:12px">Payment History</div>
            ${myPayments.length ? `<div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Service</th><th>Amount</th><th>Method</th><th>Status</th><th>Tip</th></tr></thead>
                <tbody>${myPayments.map(p => `<tr>
                    <td>${p.date}</td><td>${esc(p.service || '—')}</td><td>${fmt(p.amount)}</td>
                    <td><span class="badge badge-completed">${p.method}</span></td>
                    <td><span class="badge badge-confirmed">Paid</span></td>
                    <td>${p.tip ? fmt(p.tip) : '—'}</td>
                </tr>`).join('')}</tbody>
            </table></div>` : '<div class="empty"><p>No payments yet</p></div>'}
        </div>

        <div class="card">
            <div style="font-size:.85rem;color:var(--text-muted)">
                <strong>Payment Methods Accepted:</strong><br>
                💳 Credit/Debit Card (coming soon) · Venmo (@GenusPupClub) · Zelle (Genuspupclub@gmail.com) · CashApp ($m3lop3z) · Apple Pay · Cash/Tips
            </div>
        </div>
    `;
};

const makePayment = (bookingId, amount, method) => {
    if (method === 'card') {
        // Stripe checkout would go here in production
        // For now, simulate
        const tip = prompt('Add a tip? (Enter amount or 0)');
        const tipAmt = parseFloat(tip) || 0;
        if (!confirm(`Pay ${fmt(amount + tipAmt)} via card${tipAmt > 0 ? ' (includes ' + fmt(tipAmt) + ' tip)' : ''}?`)) return;
        recordPayment(bookingId, amount, method, tipAmt);
    } else if (method === 'cash') {
        const tip = prompt('Cash tip amount? (Enter amount or 0)');
        const tipAmt = parseFloat(tip) || 0;
        recordPayment(bookingId, amount, method, tipAmt);
        alert('Cash payment recorded. Hand cash to your sitter at your next visit.');
    } else {
        // Venmo/Zelle/CashApp
        const handles = { venmo: '@GenusPupClub', zelle: 'Genuspupclub@gmail.com', cashapp: '$m3lop3z' };
        const tip = prompt(`Send ${fmt(amount)} to ${handles[method]}. Add a tip? (Enter amount or 0)`);
        const tipAmt = parseFloat(tip) || 0;
        recordPayment(bookingId, amount, method, tipAmt);
        alert(`Send ${fmt(amount + tipAmt)} to ${handles[method]}. Payment marked as pending — will confirm when received.`);
    }
};

const recordPayment = (bookingId, amount, method, tip = 0) => {
    const booking = myBookings.find(b => b.id === bookingId);
    const payments = load('payments', []);
    payments.push({
        id: uid(), clientId: userId, bookingId, amount: parseFloat(amount),
        tip: tip, method, status: method === 'card' ? 'paid' : 'pending',
        service: booking?.service || '', date: todayStr()
    });
    save('payments', payments);
    renderTab();
};

// ============================================
// MESSAGES
// ============================================
const renderMyMessages = () => {
    myMessages = load('messages', []).filter(m => m.to === userName || m.from === userName);

    el.innerHTML = `
        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Messages</span><button class="btn btn-primary btn-sm" onclick="showSendMessage()">+ Send Message</button></div>
        </div>
        <div class="card">
            ${myMessages.length ? myMessages.slice().reverse().map(m => `
                <div style="padding:12px 0;border-bottom:1px solid var(--border)">
                    <div style="display:flex;justify-content:space-between">
                        <div><strong style="color:${m.from === userName ? 'var(--primary)' : 'var(--text)'}">${esc(m.from)}</strong> → ${esc(m.to)} ${m.pet ? `(re: ${esc(m.pet)})` : ''}</div>
                        <span style="font-size:.78rem;color:var(--text-muted)">${m.date || ''} ${m.time || ''}</span>
                    </div>
                    <p style="margin-top:6px;font-size:.9rem;color:var(--text-light);white-space:pre-wrap">${esc(m.text)}</p>
                </div>
            `).join('') : '<div class="empty"><p>No messages yet</p></div>'}
        </div>
    `;
};

const showSendMessage = () => {
    el.innerHTML += `
        <div class="card" style="margin-top:16px">
            <div class="card-title" style="margin-bottom:12px">Send Message to GenusPupClub</div>
            <div class="form-group"><label class="form-label">Subject</label><select class="form-select" id="msgSubject"><option>General Question</option><option>Booking Inquiry</option><option>Pet Update</option><option>Billing Question</option><option>Feedback</option></select></div>
            <div class="form-group"><label class="form-label">Message</label><textarea class="form-textarea" id="msgText" rows="4" placeholder="Type your message..."></textarea></div>
            <button class="btn btn-primary" onclick="sendMessage()">Send</button>
        </div>
    `;
};

const sendMessage = () => {
    const text = document.getElementById('msgText')?.value?.trim();
    const subject = document.getElementById('msgSubject')?.value;
    if (!text) { alert('Please type a message'); return; }
    const messages = load('messages', []);
    messages.push({
        id: uid(), from: userName, to: 'GenusPupClub', pet: '',
        type: 'general', text: `[${subject}] ${text}`,
        date: todayStr(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    save('messages', messages);
    renderTab();
};

// ============================================
// NEW BOOKING
// ============================================
const renderNewBooking = () => {
    const services = load('services', []).filter(s => s.active);
    const addons = load('addons', []);

    el.innerHTML = `
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">Book a Service</div>
            <div class="form-group"><label class="form-label">Pet</label><select class="form-select" id="nbPet"><option value="">Select your pet</option>${myPets.map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">Service</label><select class="form-select" id="nbService" onchange="updateNBPrice()">
                ${services.map(s => `<option value="${esc(s.name)}" data-price="${s.price}">${esc(s.name)} — ${fmt(s.price)}</option>`).join('')}
            </select></div>
            <div class="form-group"><label class="form-label">Add-ons</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${addons.map(a => `<label style="display:flex;gap:6px;align-items:center;font-size:.88rem;cursor:pointer"><input type="checkbox" class="nb-addon" value="${esc(a.name)}" data-price="${a.price}"> ${esc(a.name)} ${a.price > 0 ? fmt(a.price) : '(free)'}</label>`).join('')}</div></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Date</label><input class="form-input" type="date" id="nbDate" value="${todayStr()}"></div>
                <div class="form-group"><label class="form-label">Preferred Time</label><select class="form-select" id="nbTime"><option>8:00 AM</option><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option><option>1:00 PM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option></select></div>
            </div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="nbNotes" rows="2" placeholder="Any special instructions?"></textarea></div>
            <div style="background:rgba(255,107,53,.05);padding:14px;border-radius:8px;text-align:right;margin-bottom:12px">
                <span style="font-size:.88rem;color:var(--text-muted)">Estimated Total:</span>
                <strong style="font-size:1.4rem;color:var(--primary);font-family:'Fredoka',sans-serif" id="nbTotal">${fmt(services[0]?.price || 0)}</strong>
            </div>
            <button class="btn btn-primary" style="width:100%;padding:14px;font-size:1rem" onclick="submitBooking()">Book Now</button>
        </div>
    `;

    document.querySelectorAll('.nb-addon').forEach(cb => cb.addEventListener('change', updateNBPrice));
};

const updateNBPrice = () => {
    const svc = document.getElementById('nbService');
    let total = parseFloat(svc?.selectedOptions?.[0]?.dataset?.price) || 0;
    document.querySelectorAll('.nb-addon:checked').forEach(cb => total += parseFloat(cb.dataset.price) || 0);
    const el2 = document.getElementById('nbTotal');
    if (el2) el2.textContent = fmt(total);
};

const submitBooking = () => {
    const pet = document.getElementById('nbPet')?.value;
    const service = document.getElementById('nbService')?.value;
    const date = document.getElementById('nbDate')?.value;
    const time = document.getElementById('nbTime')?.value;
    const notes = document.getElementById('nbNotes')?.value?.trim();

    if (!pet) { alert('Please select a pet'); return; }
    if (!date) { alert('Please select a date'); return; }

    const svc = load('services', []).find(s => s.name === service);
    const selectedAddons = [...document.querySelectorAll('.nb-addon:checked')].map(cb => cb.value);

    const bookings = load('bookings', []);
    bookings.push({
        id: uid(), clientId: userId, clientName: userName, petName: pet,
        service, amount: svc?.price || 0, addons: selectedAddons, extraDogs: 0,
        date, time, zone: '', sitter: '', notes, status: 'pending', source: 'portal'
    });
    save('bookings', bookings);

    alert('Booking submitted! You\'ll receive confirmation shortly.');
    activeTab = 'mybookings';
    document.querySelector('[data-tab=mybookings]').click();
};

// ============================================
// PROFILE
// ============================================
const renderProfile = () => {
    const users = load('users', []);
    const user = users.find(u => u.id === userId) || {};

    el.innerHTML = `
        <div class="card">
            <div class="card-title" style="margin-bottom:16px">My Profile</div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="prName" value="${esc(user.name || userName)}"></div>
                <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="prEmail" value="${esc(user.email || '')}" disabled></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="prPhone" value="${esc(user.phone || '')}"></div>
                <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="prAddress" value="${esc(user.address || '')}"></div>
            </div>
            <div class="form-group"><label class="form-label">Emergency Contact</label><input class="form-input" id="prEmergency" value="${esc(user.emergencyContact || '')}" placeholder="Name & phone"></div>
            <div class="form-group"><label class="form-label">Preferred Payment Method</label><select class="form-select" id="prPayment"><option ${user.preferredPayment === 'Card' ? 'selected' : ''}>Card</option><option ${user.preferredPayment === 'Venmo' ? 'selected' : ''}>Venmo</option><option ${user.preferredPayment === 'Zelle' ? 'selected' : ''}>Zelle</option><option ${user.preferredPayment === 'CashApp' ? 'selected' : ''}>CashApp</option><option ${user.preferredPayment === 'Cash' ? 'selected' : ''}>Cash</option></select></div>
            <button class="btn btn-primary" onclick="saveProfile()">Save Profile</button>
        </div>
    `;
};

const saveProfile = () => {
    const users = load('users', []);
    const user = users.find(u => u.id === userId);
    if (user) {
        user.name = document.getElementById('prName')?.value?.trim() || user.name;
        user.phone = document.getElementById('prPhone')?.value?.trim() || '';
        user.address = document.getElementById('prAddress')?.value?.trim() || '';
        user.emergencyContact = document.getElementById('prEmergency')?.value?.trim() || '';
        user.preferredPayment = document.getElementById('prPayment')?.value || 'Card';
        save('users', users);
        // Update session name
        session.name = user.name;
        sessionStorage.setItem('gpc_client_auth', JSON.stringify(session));
        alert('Profile saved!');
    }
};

// Init
renderTab();
// Notification bell
if (typeof GPC_NOTIFY !== 'undefined') {
    GPC_NOTIFY.renderBell('notifBell', 'client', userId);
    setInterval(() => GPC_NOTIFY.renderBell('notifBell', 'client', userId), 10000);
}
