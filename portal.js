// ============================================
// GenusPupClub — Client Portal
// Logged-in client view: bookings, pets, payments, messages
// ============================================

const GPC = 'gpc_';
const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(GPC + key)) || fb; } catch { return fb; } };
const save = (key, d) => {
    localStorage.setItem(GPC + key, JSON.stringify(d));
    if (typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected()) {
        GPC_SUPABASE.save(key, d).catch(() => {});
    }
};
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
    const views = { dashboard: renderDashboard, mybookings: renderMyBookings, mypets: renderMyPets, payments: renderPayments, loyalty: renderMyLoyalty, mymessages: renderMyMessages, newbooking: renderNewBooking, reviews: renderMyReviews, profile: renderProfile };
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
                    <div class="schedule-info"><h4>${esc(b.petName)} — ${esc(b.service)}</h4><p><span class="badge badge-${b.status}">${b.status === 'pending' ? 'Awaiting Approval' : b.status}</span> ${fmt(b.amount)}</p></div></div>
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
                    <td>${fmt(b.amount)}</td><td><span class="badge badge-${b.status}">${b.status === 'pending' ? 'Awaiting Approval' : b.status}</span></td>
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
    if (b && (b.clientId === userId || (b.clientName || '').toLowerCase() === userName.toLowerCase())) {
        b.status = 'cancelled'; save('bookings', all); renderTab();
    }
};

// ============================================
// MY PETS
// ============================================
const renderMyPets = () => {
    el.innerHTML = `
        <div class="card" style="margin-bottom:16px"><div class="card-header"><span class="card-title">My Pets (${myPets.length})</span><button class="btn btn-primary btn-sm" onclick="showAddPet()">+ Add Pet</button></div></div>
        <div class="stats-grid">${myPets.length ? myPets.map(p => `
            <div class="pet-card" style="cursor:pointer" onclick="showPetDetail('${p.id}')"><div class="pet-avatar">${p.photo ? `<img src="${p.photo}" style="width:48px;height:48px;object-fit:cover;border-radius:50%">` : '🐕'}</div><div class="pet-info" style="flex:1">
                <h4 style="cursor:pointer;text-decoration:underline dotted">${esc(p.name)}</h4>
                <p>${esc(p.breed || '?')} · ${esc(p.age || '?')} · ${esc(p.weight || '?')} · ${p.gender === 'Female' ? '♀' : '♂'} ${esc(p.gender || '?')} · ${p.fixed === 'Yes' ? '✓ Fixed' : '✗ Intact'}</p>
                ${p.allergies ? `<p style="font-size:.78rem;color:var(--danger)">Allergies: ${esc(p.allergies)}</p>` : ''}
                ${p.medications ? `<p style="font-size:.78rem;color:var(--info)">Meds: ${esc(p.medications)}</p>` : ''}
                ${p.notes ? `<p style="font-size:.78rem;color:var(--text-muted)">${esc(p.notes)}</p>` : ''}
            </div></div>
        `).join('') : '<div class="card"><div class="empty"><p>Add your pup to get started</p></div></div>'}</div>
    `;
};

const showPetDetail = (petId) => {
    const pet = myPets.find(p => p.id === petId);
    if (!pet) return;
    const petBookings = myBookings.filter(b => b.petName === pet.name || (b.petName && b.petName.includes(pet.name))).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const allCheckins = load('checkins', []);
    const petCheckins = allCheckins.filter(c => c.petName === pet.name).sort((a, b) => (b.checkInDate || '').localeCompare(a.checkInDate || ''));

    el.innerHTML = `
        <div style="text-align:center;padding:20px;background:var(--bg);border-radius:8px;margin-bottom:16px">
            ${pet.photo ? `<img src="${pet.photo}" style="width:160px;height:160px;object-fit:cover;border-radius:50%;border:4px solid var(--primary);margin-bottom:14px">` : '<div style="font-size:90px;margin-bottom:14px">🐕</div>'}
            <h2 style="margin:0 0 8px">${esc(pet.name)}</h2>
            <p style="margin:0;color:var(--text-muted);font-size:.95rem">${esc(pet.breed || '?')} · ${esc(pet.age || '?')} old · ${esc(pet.weight || '?')} · ${pet.gender === 'Female' ? '♀' : '♂'} · ${pet.fixed === 'Yes' ? '✓ Fixed' : '✗ Intact'}</p>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-title" style="margin-bottom:12px">Overview</div>
                <div style="font-size:.85rem">
                    <div style="margin-bottom:10px"><strong>Breed:</strong> ${esc(pet.breed || '—')}</div>
                    <div style="margin-bottom:10px"><strong>Age:</strong> ${esc(pet.age || '—')}</div>
                    <div style="margin-bottom:10px"><strong>Weight:</strong> ${esc(pet.weight || '—')}</div>
                    <div style="margin-bottom:10px"><strong>Gender:</strong> ${pet.gender === 'Female' ? '♀' : '♂'} ${esc(pet.gender || '—')}</div>
                    <div style="margin-bottom:10px"><strong>Spayed/Neutered:</strong> ${pet.fixed === 'Yes' ? 'Yes' : 'No'}</div>
                    ${pet.allergies ? `<div style="margin-bottom:10px;color:var(--danger)"><strong>Allergies:</strong> ${esc(pet.allergies)}</div>` : ''}
                    ${pet.medications ? `<div style="margin-bottom:10px;color:var(--info)"><strong>Medications:</strong> ${esc(pet.medications)}</div>` : ''}
                    ${pet.notes ? `<div style="margin-bottom:10px"><strong>Notes:</strong> ${esc(pet.notes)}</div>` : ''}
                </div>
            </div>

            <div class="card">
                <div class="card-title" style="margin-bottom:12px">Activity Summary</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
                    <div style="text-align:center;padding:10px;background:var(--bg);border-radius:6px">
                        <div style="font-size:1.4rem;font-weight:700;color:var(--primary)">${petBookings.length}</div>
                        <div style="font-size:.75rem;color:var(--text-muted)">Bookings</div>
                    </div>
                    <div style="text-align:center;padding:10px;background:var(--bg);border-radius:6px">
                        <div style="font-size:1.4rem;font-weight:700;color:var(--success)">${petCheckins.length}</div>
                        <div style="font-size:.75rem;color:var(--text-muted)">Check-Ins</div>
                    </div>
                </div>
            </div>
        </div>

        ${petBookings.length ? `
            <div class="card" style="margin-bottom:16px">
                <div class="card-title" style="margin-bottom:12px">Booking History (${petBookings.length})</div>
                <div style="max-height:300px;overflow-y:auto">
                    ${petBookings.map(b => `
                        <div style="padding:10px;border-bottom:1px solid var(--border);font-size:.85rem">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                                <strong>${b.date} ${b.time || ''}</strong>
                                <span class="badge badge-${b.status}">${b.status === 'pending' ? 'Awaiting Approval' : b.status}</span>
                            </div>
                            <div style="margin-bottom:4px">${esc(b.service)}</div>
                            <div style="color:var(--text-muted);font-size:.8rem">${fmt(b.amount)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        ${petCheckins.length ? `
            <div class="card" style="margin-bottom:16px">
                <div class="card-title" style="margin-bottom:12px">Check-In History (${petCheckins.length})</div>
                <div style="max-height:300px;overflow-y:auto">
                    ${petCheckins.slice(0, 15).map(c => `
                        <div style="padding:10px;border-bottom:1px solid var(--border);font-size:.85rem">
                            <div style="margin-bottom:4px"><strong>${c.checkInDate} ${c.checkInTime || ''}</strong></div>
                            <div style="margin-bottom:4px">${esc(c.service)} at ${esc(c.property || '—')}</div>
                            <div style="color:var(--text-muted);font-size:.8rem">
                                ${c.checkedOut ? `Checked out: ${c.checkOutDate} ${c.checkOutTime || ''}` : '<span style="color:var(--primary)">Still checked in</span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <div style="display:flex;gap:8px;margin-top:16px">
            <button class="btn btn-primary" onclick="renderTab()">Back to Pets</button>
        </div>
    `;
};

const showAddPet = () => {
    el.innerHTML += `
        <div class="card" style="margin-top:16px" id="addPetForm">
            <div class="card-title" style="margin-bottom:12px">Add a Pet</div>
            <div class="form-group"><label class="form-label">Photo</label><input type="file" id="pPhoto" accept="image/*" class="form-input" style="padding:8px" onchange="previewPortalPic(this)"><div id="pPhotoPreview" style="margin-top:6px"></div><input type="hidden" id="pPhotoData"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="pName"></div><div class="form-group"><label class="form-label">Breed</label>${typeof DOG_BREEDS !== 'undefined' ? '<select class="form-select" id="pBreed"><option value="">Select breed</option>' + DOG_BREEDS.map(b => '<option>' + b + '</option>').join('') + '</select>' : '<input class="form-input" id="pBreed">'}</div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Age</label><input class="form-input" id="pAge"></div><div class="form-group"><label class="form-label">Weight</label><input class="form-input" id="pWeight"></div></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Gender</label><select class="form-select" id="pGender"><option>Male</option><option>Female</option></select></div><div class="form-group"><label class="form-label">Spayed/Neutered</label><select class="form-select" id="pFixed"><option>Yes</option><option>No</option></select></div></div>
            <div class="form-group"><label class="form-label">Allergies</label><input class="form-input" id="pAllergies"></div>
            <div class="form-group"><label class="form-label">Medications</label><input class="form-input" id="pMeds"></div>
            <div class="form-group"><label class="form-label">Special Notes</label><textarea class="form-textarea" id="pNotes" rows="2"></textarea></div>
            <button class="btn btn-primary" onclick="savePet()">Save Pet</button>
        </div>
    `;
};

const previewPortalPic = (input) => {
    const preview = document.getElementById('pPhotoPreview');
    if (!input.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 200; canvas.height = 200;
            const ctx = canvas.getContext('2d');
            const scale = Math.max(200 / img.width, 200 / img.height);
            ctx.drawImage(img, (200 - img.width * scale) / 2, (200 - img.height * scale) / 2, img.width * scale, img.height * scale);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            if (preview) preview.innerHTML = `<img src="${dataUrl}" style="width:60px;height:60px;object-fit:cover;border-radius:50%">`;
            document.getElementById('pPhotoData').value = dataUrl;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
};

const savePet = () => {
    const v = (id) => document.getElementById(id)?.value?.trim() || '';
    if (!v('pName')) { alert('Pet name required'); return; }
    const pets = load('pets', []);
    pets.push({ id: uid(), name: v('pName'), breed: v('pBreed'), age: v('pAge'), weight: v('pWeight'), gender: v('pGender'), fixed: v('pFixed'), photo: v('pPhotoData'), allergies: v('pAllergies'), medications: v('pMeds'), notes: v('pNotes'), clientId: userId });
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
            <div class="form-group"><label class="form-label">Pet(s)</label>
                ${myPets.length > 1 ? `<div id="nbPetChecklist" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
                    ${myPets.map(p => `<label style="display:flex;gap:4px;align-items:center;font-size:.88rem;cursor:pointer;background:var(--bg-alt);padding:6px 12px;border-radius:8px;border:1px solid var(--border)"><input type="checkbox" class="nb-pet-cb" value="${esc(p.name)}"> ${esc(p.name)}</label>`).join('')}
                </div><input type="hidden" id="nbPet" value="">` : `<select class="form-select" id="nbPet"><option value="">Select your pet</option>${myPets.map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('')}</select>`}
            </div>
            <div class="form-group"><label class="form-label">Service</label><select class="form-select" id="nbService" onchange="updateNBPrice()">
                ${services.map(s => `<option value="${esc(s.name)}" data-price="${s.price}">${esc(s.name)} — ${fmt(s.price)}</option>`).join('')}
            </select></div>
            <div class="form-group"><label class="form-label">Add-ons</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${addons.map(a => `<label style="display:flex;gap:6px;align-items:center;font-size:.88rem;cursor:pointer"><input type="checkbox" class="nb-addon" value="${esc(a.name)}" data-price="${a.price}"> ${esc(a.name)} ${a.price > 0 ? fmt(a.price) : '(free)'}</label>`).join('')}</div></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Start Date</label><input class="form-input" type="date" id="nbDate" value="${todayStr()}" onchange="updateNBPrice()"></div>
                <div class="form-group"><label class="form-label">End Date (multi-day)</label><input class="form-input" type="date" id="nbEndDate" onchange="updateNBPrice()"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Preferred Time</label><select class="form-select" id="nbTime"><option>8:00 AM</option><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option><option>1:00 PM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option></select></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Drop-Off Date & Time</label><input class="form-input" type="datetime-local" id="nbDropoff"></div>
                <div class="form-group"><label class="form-label">Pick-Up Date & Time</label><input class="form-input" type="datetime-local" id="nbPickup"></div>
            </div>
            <div class="form-group"><label class="form-label">Need Transport?</label><select class="form-select" id="nbTransport" onchange="document.getElementById('nbTransportAddr').style.display=this.value&&this.value!=='none'?'grid':'none'"><option value="none">No — I'll handle drop-off/pick-up</option><option value="pickup">Pickup from my house</option><option value="dropoff">Dropoff to my house</option><option value="roundtrip">Round trip</option></select></div>
            <div class="form-row" id="nbTransportAddr" style="display:none"><div class="form-group"><label class="form-label">Pickup Address</label><input class="form-input" id="nbPickupAddr"></div><div class="form-group"><label class="form-label">Dropoff Address</label><input class="form-input" id="nbDropoffAddr"></div></div>
            <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="nbNotes" rows="2" placeholder="Any special instructions?"></textarea></div>
            <div style="background:rgba(255,107,53,.05);padding:14px;border-radius:8px;text-align:right;margin-bottom:12px">
                <span style="font-size:.88rem;color:var(--text-muted)">Estimated Total:</span>
                <strong style="font-size:1.4rem;color:var(--primary);font-family:'Fredoka',sans-serif" id="nbTotal">${fmt(services[0]?.price || 0)}</strong>
            </div>
            <button class="btn btn-primary" style="width:100%;padding:14px;font-size:1rem" onclick="submitBooking()">Book Now</button>
        </div>
    `;

    document.querySelectorAll('.nb-addon').forEach(cb => cb.addEventListener('change', updateNBPrice));
    // Multi-pet checkbox sync
    document.querySelectorAll('.nb-pet-cb').forEach(cb => {
        cb.addEventListener('change', () => {
            const selected = [...document.querySelectorAll('.nb-pet-cb:checked')].map(c => c.value);
            const hidden = document.getElementById('nbPet');
            if (hidden) hidden.value = selected.join(', ');
            updateNBPrice();
        });
    });
};

const calcPortalDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = Math.round((new Date(end + 'T00:00:00') - new Date(start + 'T00:00:00')) / 86400000);
    return diff > 0 ? diff : 1;
};

const updateNBPrice = () => {
    const svc = document.getElementById('nbService');
    const baseRate = parseFloat(svc?.selectedOptions?.[0]?.dataset?.price) || 0;
    const startDate = document.getElementById('nbDate')?.value || '';
    const endDate = document.getElementById('nbEndDate')?.value || '';
    const days = calcPortalDays(startDate, endDate);
    // Extra dogs pricing
    const selectedPets = document.querySelectorAll('.nb-pet-cb:checked');
    const extraDogs = selectedPets.length > 1 ? selectedPets.length - 1 : 0;
    const settings = load('settings', {});
    const perDogFee = parseFloat(settings.extraDogFee) || 0;
    const hasPickup = document.getElementById('nbPickupAddr')?.value?.trim();
    const hasDropoff = document.getElementById('nbDropoffAddr')?.value?.trim();
    const transport = document.getElementById('nbTransport')?.value || 'none';
    const pickupFee = (transport === 'pickup' || transport === 'roundtrip') && hasPickup ? (parseFloat(settings.pickupFee) || 0) : 0;
    const dropoffFee = (transport === 'dropoff' || transport === 'roundtrip') && hasDropoff ? (parseFloat(settings.dropoffFee) || 0) : 0;

    let total = baseRate * days;
    if (extraDogs > 0 && perDogFee > 0) total += extraDogs * perDogFee * days;
    document.querySelectorAll('.nb-addon:checked').forEach(cb => total += parseFloat(cb.dataset.price) || 0);
    total += pickupFee + dropoffFee;

    const parts = [];
    if (days > 1) parts.push(`${days} days`);
    if (extraDogs > 0 && perDogFee > 0) parts.push(`+${extraDogs} dog${extraDogs > 1 ? 's' : ''}`);
    if (pickupFee > 0) parts.push(`pickup ${fmt(pickupFee)}`);
    if (dropoffFee > 0) parts.push(`dropoff ${fmt(dropoffFee)}`);

    const el2 = document.getElementById('nbTotal');
    if (el2) el2.textContent = `${fmt(total)}${parts.length ? ' (' + parts.join(' + ') + ')' : ''}`;
};

const submitBooking = () => {
    const pet = document.getElementById('nbPet')?.value;
    const service = document.getElementById('nbService')?.value;
    const date = document.getElementById('nbDate')?.value;
    const time = document.getElementById('nbTime')?.value;
    const notes = document.getElementById('nbNotes')?.value?.trim();

    if (!pet) { alert('Please select a pet'); return; }
    if (!service) { alert('Please select a service'); return; }
    if (!date) { alert('Please select a date'); return; }

    const svc = load('services', []).find(s => s.name === service);
    const selectedAddons = [...document.querySelectorAll('.nb-addon:checked')].map(cb => cb.value);
    const petNames = pet.split(',').map(p => p.trim()).filter(Boolean);
    const extraDogs = Math.max(0, petNames.length - 1);
    const dropoffTime = document.getElementById('nbDropoff')?.value || '';
    const pickupTime = document.getElementById('nbPickup')?.value || '';
    const pickupAddr = document.getElementById('nbPickupAddr')?.value?.trim() || '';
    const dropoffAddr = document.getElementById('nbDropoffAddr')?.value?.trim() || '';

    const endDate = document.getElementById('nbEndDate')?.value || '';

    const bookings = load('bookings', []);
    bookings.push({
        id: uid(), clientId: userId, clientName: userName, petName: pet,
        clientEmail: session?.email || '',
        service, amount: svc?.price || 0, addons: selectedAddons, extraDogs,
        numDogs: petNames.length, dropoffTime, pickupTime, pickupAddr, dropoffAddr,
        date, endDate, time, zone: '', sitter: '', notes, status: 'pending', source: 'portal'
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
            <div class="form-group" style="text-align:center;margin-bottom:16px">
                ${user.photo ? `<img src="${user.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:8px;display:block;margin:0 auto 8px">` : `<div style="width:80px;height:80px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;margin:0 auto 8px">${(user.name || '?').charAt(0)}</div>`}
                <label class="btn btn-sm btn-ghost" style="cursor:pointer"><input type="file" accept="image/*" style="display:none" onchange="uploadProfilePhoto(this)"> Change Photo</label>
            </div>
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
        // Also update client record
        const clients = load('clients', []);
        const client = clients.find(c => c.id === userId || c.email === session?.email);
        if (client) {
            client.name = user.name;
            client.phone = user.phone;
            client.address = user.address;
            save('clients', clients);
        }
        // Update session name
        session.name = user.name;
        sessionStorage.setItem('gpc_client_auth', JSON.stringify(session));
        // Refresh global userName and sidebar
        window.location.reload();
        return;
    }
};

// ============================================
// LOYALTY (Client View)
// ============================================
const renderMyLoyalty = () => {
    if (typeof GPC_LOYALTY !== 'undefined') {
        el.innerHTML = GPC_LOYALTY.renderClientPanel(userId, userName);
    } else {
        el.innerHTML = '<div class="card"><div class="empty"><p>Rewards coming soon!</p></div></div>';
    }
};

// ============================================
// CLIENT REVIEWS
// ============================================
const renderMyReviews = () => {
    const allReviews = load('reviews', []);
    const myReviews = allReviews.filter(r => r.clientId === userId || (r.name || '').toLowerCase() === userName.toLowerCase());
    const completedBookings = myBookings.filter(b => b.status === 'completed');

    el.innerHTML = `
        <div class="card" style="margin-bottom:16px">
            <div class="card-header"><span class="card-title">Leave a Review</span></div>
            <p style="font-size:.88rem;color:var(--text-muted);margin-bottom:12px">Tell us about your experience!</p>
            <div class="form-group"><label class="form-label">Which visit?</label><select class="form-select" id="rvBooking">
                <option value="">General review</option>
                ${completedBookings.map(b => `<option value="${b.id}">${esc(b.service)} — ${esc(b.petName)} (${b.date})</option>`).join('')}
            </select></div>
            <div class="form-group"><label class="form-label">Rating</label>
                <div id="rvStars" style="display:flex;gap:4px;font-size:2rem;cursor:pointer">
                    ${[1,2,3,4,5].map(i => `<span data-star="${i}" onclick="setRating(${i})" style="color:#ddd;transition:color .2s">★</span>`).join('')}
                </div>
                <input type="hidden" id="rvRating" value="5">
            </div>
            <div class="form-group"><label class="form-label">Your review</label><textarea class="form-textarea" id="rvText" rows="3" placeholder="What did you love? How was your pup treated?"></textarea></div>
            <button class="btn btn-primary" onclick="submitReview()">Submit Review</button>
        </div>
        ${myReviews.length ? `<div class="card">
            <div class="card-title" style="margin-bottom:12px">Your Reviews (${myReviews.length})</div>
            ${myReviews.map(r => `<div style="padding:12px 0;border-bottom:1px solid var(--border)">
                <div style="color:#FDCB6E;font-size:1.1rem;letter-spacing:2px">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
                <p style="font-size:.9rem;margin-top:4px">"${esc(r.text)}"</p>
                <span style="font-size:.78rem;color:var(--text-muted)">${r.date || ''} — ${esc(r.service || 'General')}</span>
            </div>`).join('')}
        </div>` : ''}
    `;
    // Set initial rating to 5
    setRating(5);
};

window.setRating = (n) => {
    document.getElementById('rvRating').value = n;
    document.querySelectorAll('#rvStars span').forEach((s, i) => {
        s.style.color = i < n ? '#FDCB6E' : '#ddd';
    });
};

const submitReview = () => {
    const text = document.getElementById('rvText')?.value?.trim();
    const rating = parseInt(document.getElementById('rvRating')?.value) || 5;
    const bookingId = document.getElementById('rvBooking')?.value;
    if (!text) { alert('Please write a review'); return; }

    const booking = bookingId ? myBookings.find(b => b.id === bookingId) : null;
    const reviews = load('reviews', []);
    reviews.push({
        id: uid(), clientId: userId, name: userName,
        pet: booking?.petName || (myPets[0]?.name || ''),
        stars: rating, text, service: booking?.service || 'General',
        date: todayStr()
    });
    save('reviews', reviews);
    alert('Thank you for your review!');
    renderTab();
};

// ============================================
// PROFILE PHOTO UPLOAD
// ============================================
const uploadProfilePhoto = (input) => {
    if (!input.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 200; canvas.height = 200;
            const ctx = canvas.getContext('2d');
            const scale = Math.max(200 / img.width, 200 / img.height);
            ctx.drawImage(img, (200 - img.width * scale) / 2, (200 - img.height * scale) / 2, img.width * scale, img.height * scale);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            // Save to user record
            const users = load('users', []);
            const user = users.find(u => u.id === userId);
            if (user) { user.photo = dataUrl; save('users', users); }
            // Save to client record
            const clients = load('clients', []);
            const client = clients.find(c => c.id === userId || c.email === session?.email);
            if (client) { client.photo = dataUrl; save('clients', clients); }
            // Update sidebar
            const welcome = document.getElementById('portalWelcome');
            if (welcome) {
                welcome.innerHTML = `<div style="text-align:center"><img src="${dataUrl}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:8px"><h3 style="color:#fff;font-size:1rem">${esc(userName)}</h3><p>Client Portal</p></div>`;
            }
            alert('Profile photo updated!');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
};

// Init
renderTab();
// Notification bell
if (typeof GPC_NOTIFY !== 'undefined') {
    GPC_NOTIFY.renderBell('notifBell', 'client', userId);
    setInterval(() => GPC_NOTIFY.renderBell('notifBell', 'client', userId), 10000);
}
