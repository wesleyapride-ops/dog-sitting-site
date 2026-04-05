// ============================================
// GenusPupClub — Client Portal
// Logged-in client view: bookings, pets, payments, messages
// ============================================

const GPC = 'gpc_';
const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(GPC + key)) || fb; } catch { return fb; } };
const save = (key, d) => {
    try {
        localStorage.setItem(GPC + key, JSON.stringify(d));
    } catch (e) {
        console.error('Save failed (storage full?):', e);
        alert('Storage is full! Some data may not have saved. Please contact support.');
    }
    if (typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected()) {
        GPC_SUPABASE.save(key, d).catch((err) => console.warn('Cloud sync failed:', err));
    }
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = (n) => '$' + Number(n || 0).toFixed(2);
const todayStr = () => new Date().toISOString().split('T')[0];
const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

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

// ---- Site Config (from Admin Lab) ----
const getSiteConfig = () => load('site_config', {});

const renderTab = () => {
    refreshData();
    const views = { dashboard: renderDashboard, mybookings: renderMyBookings, mypets: renderMyPets, payments: renderPayments, loyalty: renderMyLoyalty, mymessages: renderMyMessages, newbooking: renderNewBooking, reviews: renderMyReviews, suggestions: renderSuggestions, profile: renderProfile };
    // Respect portal section toggles from Admin Lab
    const cfg = getSiteConfig();
    if (cfg.portal?.sections && cfg.portal.sections[activeTab] === false) { activeTab = 'dashboard'; }
    (views[activeTab] || renderDashboard)();
    applyPortalConfig();
};

const logout = () => { sessionStorage.removeItem('gpc_client_auth'); window.location.href = 'login.html'; };

// ============================================
// DASHBOARD
// ============================================
const renderDashboard = () => {
    const upcoming = myBookings.filter(b => b.date >= todayStr() && b.status !== 'cancelled');
    const totalSpent = myBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + calcPortalTotal(b), 0);
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
                    <div class="schedule-info"><h4>${esc(b.petName)} — ${esc(b.service)}</h4><p><span class="badge badge-${b.status}">${b.status === 'pending' ? 'Awaiting Approval' : b.status}</span> ${fmt(calcPortalTotal(b))}</p></div></div>
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
    const surveys = load('satisfaction_surveys', []);
    const editReqs = load('edit_requests', []);
    el.innerHTML = `
        <div class="card">
            <div class="card-header"><span class="card-title">My Bookings (${sorted.length})</span></div>
            ${sorted.length ? `<div class="table-wrap"><table>
                <thead><tr><th>Date</th><th>Time</th><th>Pet</th><th>Service</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                <tbody>${sorted.map(b => {
                    const hasSurvey = surveys.some(s => s.bookingId === b.id);
                    const hasEditReq = editReqs.filter(r => r.bookingId === b.id && r.status === 'pending').length > 0;
                    return `<tr>
                    <td>${b.date}${b.endDate ? `<br><span style="font-size:.78rem;color:var(--text-muted)">→ ${b.endDate}</span>` : ''}</td>
                    <td>${b.time || '—'}${b.dropoffTime ? `<br><span style="font-size:.72rem;color:var(--text-muted)">Drop: ${new Date(b.dropoffTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>` : ''}</td>
                    <td>${esc(b.petName)}</td>
                    <td>${esc(b.service)}${b.addons?.length ? `<br><span style="font-size:.72rem;color:var(--text-muted)">${b.addons.join(', ')}</span>` : ''}</td>
                    <td>${fmt(calcPortalTotal(b))}</td>
                    <td>
                        <span class="badge badge-${b.status}">${b.status === 'pending' ? 'Awaiting Approval' : b.status}</span>
                        ${hasEditReq ? '<br><span class="badge" style="background:rgba(108,92,231,.1);color:#6C5CE7;margin-top:4px">Edit Pending</span>' : ''}
                    </td>
                    <td style="white-space:nowrap">
                        ${b.status === 'pending' || b.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" onclick="requestEditBooking('${b.id}')" title="Request changes">✏️</button>` : ''}
                        ${b.status === 'pending' ? `<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="cancelBooking('${b.id}')" title="Cancel">✕</button>` : ''}
                        ${b.status === 'completed' && !hasSurvey ? `<button class="btn btn-sm btn-primary" onclick="renderSatisfactionSurvey('${b.id}')">⭐ Rate</button>` : ''}
                        ${b.status === 'completed' && hasSurvey ? '<span style="font-size:.78rem;color:var(--success)">✓ Rated</span>' : ''}
                    </td>
                </tr>`; }).join('')}</tbody>
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
    const petBookings = myBookings.filter(b => b.petName === pet.name || (b.petName && b.petName.split(',').map(n => n.trim()).includes(pet.name))).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
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
                            <div style="color:var(--text-muted);font-size:.8rem">${fmt(calcPortalTotal(b))}</div>
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
    const totalBilled = myBookings.filter(b => b.status === 'completed').reduce((s, b) => s + calcPortalTotal(b), 0);
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
                                <div style="font-size:1.2rem;font-weight:700;color:var(--primary)">${fmt(calcPortalTotal(b))}</div>
                                <div class="payment-methods">
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${calcPortalTotal(b)}, 'card')">💳 Card</button>
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${calcPortalTotal(b)}, 'venmo')">Venmo</button>
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${calcPortalTotal(b)}, 'zelle')">Zelle</button>
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${calcPortalTotal(b)}, 'cash')">Cash</button>
                                    <button class="pay-btn" onclick="makePayment('${b.id}', ${calcPortalTotal(b)}, 'cashapp')">CashApp</button>
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

// Match admin calcBookingTotal — full rate per dog per day + addons + transport + zone
const calcPortalTotal = (b) => {
    const baseRate = parseFloat(b.amount) || 0;
    const days = calcPortalDays(b.date, b.endDate);
    const numDogs = b.numDogs || ((b.extraDogs || 0) + 1);
    let total = baseRate * numDogs * days;
    if (b.addons?.length) {
        const allAddons = load('addons', []);
        b.addons.forEach(aName => { const a = allAddons.find(x => x.name === aName); if (a) total += a.price; });
    }
    if (b.zone) {
        const allZones = load('zones', []);
        const zone = allZones.find(z => z.name === b.zone);
        if (zone) total += zone.surcharge;
    }
    const settings = load('settings', {});
    if (b.pickupAddr) total += parseFloat(settings.pickupFee) || 0;
    if (b.dropoffAddr) total += parseFloat(settings.dropoffFee) || 0;
    return total;
};

const updateNBPrice = () => {
    const svc = document.getElementById('nbService');
    const baseRate = parseFloat(svc?.selectedOptions?.[0]?.dataset?.price) || 0;
    const startDate = document.getElementById('nbDate')?.value || '';
    const endDate = document.getElementById('nbEndDate')?.value || '';
    const days = calcPortalDays(startDate, endDate);
    const selectedPets = document.querySelectorAll('.nb-pet-cb:checked');
    const extraDogs = selectedPets.length > 1 ? selectedPets.length - 1 : 0;
    const settings = load('settings', {});
    const hasPickup = document.getElementById('nbPickupAddr')?.value?.trim();
    const hasDropoff = document.getElementById('nbDropoffAddr')?.value?.trim();
    const transport = document.getElementById('nbTransport')?.value || 'none';
    const pickupFee = (transport === 'pickup' || transport === 'roundtrip') && hasPickup ? (parseFloat(settings.pickupFee) || 0) : 0;
    const dropoffFee = (transport === 'dropoff' || transport === 'roundtrip') && hasDropoff ? (parseFloat(settings.dropoffFee) || 0) : 0;

    const numDogs = extraDogs + 1;
    let total = baseRate * numDogs * days;
    document.querySelectorAll('.nb-addon:checked').forEach(cb => total += parseFloat(cb.dataset.price) || 0);
    total += pickupFee + dropoffFee;

    const parts = [];
    if (numDogs > 1) parts.push(`${numDogs} dogs × ${fmt(baseRate)}`);
    if (days > 1) parts.push(`${days} days`);
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
            renderTab();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
};

// ============================================
// BOOKING EDIT REQUESTS
// Client requests changes → admin approves/denies
// ============================================
const requestEditBooking = (bookingId) => {
    const allBookings = load('bookings', []);
    const b = allBookings.find(x => x.id === bookingId);
    if (!b) return;
    const allServices = load('services', []).filter(s => s.active);
    const allAddons = load('addons', []);

    el.innerHTML = `
        <div class="card">
            <div class="card-header">
                <span class="card-title">✏️ Request Changes to Booking</span>
                <button class="btn btn-ghost btn-sm" onclick="activeTab='mybookings';renderTab()">← Back</button>
            </div>
            <p style="font-size:.88rem;color:var(--text-muted);margin-bottom:16px">Request changes below. Your changes need <strong>admin approval</strong> before taking effect. You'll be notified once reviewed.</p>

            <div style="background:var(--bg);padding:14px;border-radius:8px;margin-bottom:16px">
                <strong style="font-size:.85rem">Current Booking:</strong>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;font-size:.88rem">
                    <div><strong>Pet:</strong> ${esc(b.petName)}</div>
                    <div><strong>Service:</strong> ${esc(b.service)}</div>
                    <div><strong>Date:</strong> ${b.date}${b.endDate ? ' → ' + b.endDate : ''}</div>
                    <div><strong>Time:</strong> ${b.time || b.dropoffTime || '—'}</div>
                    <div><strong>Add-ons:</strong> ${b.addons?.length ? b.addons.join(', ') : 'None'}</div>
                    <div><strong>Total:</strong> ${fmt(calcPortalTotal(b))}</div>
                </div>
            </div>

            <h4 style="font-size:.95rem;margin-bottom:12px;color:var(--primary)">What would you like to change?</h4>

            <div class="form-group">
                <label class="form-label">Service</label>
                <select class="form-select" id="erService">
                    <option value="">— Keep current (${esc(b.service)}) —</option>
                    ${allServices.map(s => `<option value="${esc(s.name)}" ${b.service === s.name ? 'selected' : ''}>${esc(s.name)} — ${fmt(s.price)}</option>`).join('')}
                </select>
            </div>

            <div class="form-row">
                <div class="form-group"><label class="form-label">New Start Date</label><input class="form-input" type="date" id="erDate" value="${b.date || ''}"></div>
                <div class="form-group"><label class="form-label">New End Date</label><input class="form-input" type="date" id="erEndDate" value="${b.endDate || ''}"></div>
            </div>

            <div class="form-row">
                <div class="form-group"><label class="form-label">New Drop-Off</label><input class="form-input" type="datetime-local" id="erDropoff" value="${b.dropoffTime || ''}"></div>
                <div class="form-group"><label class="form-label">New Pick-Up</label><input class="form-input" type="datetime-local" id="erPickup" value="${b.pickupTime || ''}"></div>
            </div>

            <div class="form-group">
                <label class="form-label">Add-ons</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                    ${allAddons.map(a => `<label style="display:flex;gap:6px;align-items:center;font-size:.88rem;cursor:pointer">
                        <input type="checkbox" class="er-addon" value="${esc(a.name)}" ${b.addons?.includes(a.name) ? 'checked' : ''}>
                        ${esc(a.name)} ${a.price > 0 ? fmt(a.price) : '(free)'}
                    </label>`).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Reason for change</label>
                <textarea class="form-textarea" id="erReason" rows="3" placeholder="e.g. Schedule changed, need to add extra day, want grooming add-on..."></textarea>
            </div>

            <div style="display:flex;gap:8px;margin-top:16px">
                <button class="btn btn-primary" onclick="submitEditRequest('${b.id}')">📩 Submit Change Request</button>
                <button class="btn btn-ghost" onclick="activeTab='mybookings';renderTab()">Cancel</button>
            </div>
        </div>
    `;
};

const submitEditRequest = (bookingId) => {
    const reason = document.getElementById('erReason')?.value?.trim();
    if (!reason) { alert('Please provide a reason for the change.'); return; }

    const newService = document.getElementById('erService')?.value || '';
    const newDate = document.getElementById('erDate')?.value || '';
    const newEndDate = document.getElementById('erEndDate')?.value || '';
    const newDropoff = document.getElementById('erDropoff')?.value || '';
    const newPickup = document.getElementById('erPickup')?.value || '';
    const newAddons = [...document.querySelectorAll('.er-addon:checked')].map(cb => cb.value);

    const editRequests = load('edit_requests', []);
    editRequests.push({
        id: uid(),
        bookingId,
        clientId: userId,
        clientName: userName,
        clientEmail: session?.email || '',
        requestedChanges: {
            service: newService || null,
            date: newDate || null,
            endDate: newEndDate || null,
            dropoffTime: newDropoff || null,
            pickupTime: newPickup || null,
            addons: newAddons
        },
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
        adminResponse: ''
    });
    save('edit_requests', editRequests);

    // Notify admin
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.create({ type: 'edit_request', title: 'Booking Edit Request', body: `${userName} wants to change their booking: ${reason}`, audience: 'admin', createdAt: new Date().toISOString() });
    }

    alert('Change request submitted! You\'ll be notified once it\'s reviewed.');
    activeTab = 'mybookings';
    renderTab();
};

// ============================================
// SATISFACTION SURVEY — Post-visit
// ============================================
const renderSatisfactionSurvey = (bookingId) => {
    const allBookings = load('bookings', []);
    const b = allBookings.find(x => x.id === bookingId);
    if (!b) return;

    el.innerHTML = `
        <div class="card">
            <div class="card-header">
                <span class="card-title">⭐ How Was Your Experience?</span>
                <button class="btn btn-ghost btn-sm" onclick="activeTab='mybookings';renderTab()">← Back</button>
            </div>
            <p style="font-size:.88rem;color:var(--text-muted);margin-bottom:16px">Your honest feedback helps us improve! This takes about 30 seconds.</p>

            <div style="background:var(--bg);padding:12px;border-radius:8px;margin-bottom:16px;font-size:.88rem">
                <strong>${esc(b.service)}</strong> for <strong>${esc(b.petName)}</strong> on ${b.date}
            </div>

            <div class="form-group">
                <label class="form-label">Overall Rating</label>
                <div id="surveyStars" style="display:flex;gap:8px;font-size:2rem;cursor:pointer">
                    ${[1,2,3,4,5].map(n => `<span class="survey-star" data-val="${n}" onclick="setSurveyStar(${n})" style="opacity:0.3;transition:opacity .2s">⭐</span>`).join('')}
                </div>
                <input type="hidden" id="surveyRating" value="0">
            </div>

            <div class="form-group">
                <label class="form-label">How was your pet when you picked them up?</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    ${['Happy & energetic', 'Calm & relaxed', 'Tired but good', 'A little anxious', 'Not themselves'].map(mood => `<label style="display:flex;gap:4px;align-items:center;font-size:.88rem;cursor:pointer;padding:6px 12px;border:1px solid var(--border);border-radius:8px"><input type="radio" name="petMood" value="${mood}"> ${mood}</label>`).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Rate these areas (1-5)</label>
                <div style="display:grid;gap:10px;margin-top:6px">
                    ${['Communication', 'Punctuality', 'Photo updates', 'Value for money', 'Would recommend'].map(area => `
                        <div style="display:flex;align-items:center;gap:10px">
                            <span style="min-width:140px;font-size:.88rem">${area}</span>
                            <select class="form-select survey-sub" data-area="${area}" style="width:auto;min-width:80px">
                                <option value="">—</option>
                                <option value="5">5 — Excellent</option>
                                <option value="4">4 — Great</option>
                                <option value="3">3 — Okay</option>
                                <option value="2">2 — Poor</option>
                                <option value="1">1 — Bad</option>
                            </select>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">What did we do well?</label>
                <textarea class="form-textarea" id="surveyGood" rows="2" placeholder="e.g. Great photos, my dog loved the sitter..."></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">What could we improve?</label>
                <textarea class="form-textarea" id="surveyImprove" rows="2" placeholder="e.g. Earlier pickup, more frequent updates..."></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Would you book again?</label>
                <div style="display:flex;gap:8px">
                    ${['Definitely', 'Probably', 'Maybe', 'Unlikely'].map(opt => `<label style="display:flex;gap:4px;align-items:center;font-size:.88rem;cursor:pointer;padding:6px 12px;border:1px solid var(--border);border-radius:8px"><input type="radio" name="bookAgain" value="${opt}"> ${opt}</label>`).join('')}
                </div>
            </div>

            <button class="btn btn-primary" style="width:100%;padding:14px;margin-top:12px" onclick="submitSurvey('${b.id}')">📩 Submit Feedback</button>
        </div>
    `;
};

const setSurveyStar = (n) => {
    document.getElementById('surveyRating').value = n;
    document.querySelectorAll('.survey-star').forEach(s => {
        s.style.opacity = parseInt(s.dataset.val) <= n ? '1' : '0.3';
    });
};

const submitSurvey = (bookingId) => {
    const rating = parseInt(document.getElementById('surveyRating')?.value) || 0;
    if (rating === 0) { alert('Please select a star rating.'); return; }

    const mood = document.querySelector('input[name="petMood"]:checked')?.value || '';
    const bookAgain = document.querySelector('input[name="bookAgain"]:checked')?.value || '';
    const good = document.getElementById('surveyGood')?.value?.trim() || '';
    const improve = document.getElementById('surveyImprove')?.value?.trim() || '';
    const subRatings = {};
    document.querySelectorAll('.survey-sub').forEach(sel => { if (sel.value) subRatings[sel.dataset.area] = parseInt(sel.value); });

    const surveys = load('satisfaction_surveys', []);
    surveys.push({
        id: uid(), bookingId, clientId: userId, clientName: userName,
        rating, petMood: mood, bookAgain, whatWentWell: good, whatToImprove: improve,
        subRatings, createdAt: new Date().toISOString()
    });
    save('satisfaction_surveys', surveys);

    // Also auto-post as a review if 4+ stars
    if (rating >= 4 && good) {
        const allBookings = load('bookings', []);
        const b = allBookings.find(x => x.id === bookingId);
        const reviews = load('reviews', []);
        reviews.push({ id: uid(), clientId: userId, name: userName, pet: b?.petName || '', stars: rating, text: good, service: b?.service || '', date: todayStr() });
        save('reviews', reviews);
    }

    alert('Thank you for your feedback! 🐾');
    activeTab = 'mybookings';
    renderTab();
};

// ============================================
// SUGGESTIONS BOX — Client-Facing Feedback
// ============================================
const SUGGESTION_CATS = [
    { value: 'suggestion', label: 'Suggestion', icon: '💡' },
    { value: 'complaint', label: 'Complaint', icon: '😤' },
    { value: 'bug', label: 'Something Broken', icon: '🐛' },
    { value: 'feature', label: 'Feature Request', icon: '🚀' },
    { value: 'compliment', label: 'Compliment', icon: '🌟' },
    { value: 'other', label: 'Other', icon: '📝' }
];

const renderSuggestions = () => {
    const allFeedback = load('feedback', []);
    const myFeedback = allFeedback.filter(f => f.clientId === userId);

    el.innerHTML = `
        <div class="card">
            <div class="card-title" style="margin-bottom:12px">📬 Suggestion Box</div>
            <p style="font-size:.88rem;color:var(--text-muted);margin-bottom:16px">Help us improve! Tell us what you love, what's broken, or what you wish we had. Every suggestion goes straight to our team.</p>

            <div class="form-group">
                <label class="form-label">What type of feedback?</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    ${SUGGESTION_CATS.map(c => `<label style="display:flex;gap:4px;align-items:center;font-size:.88rem;cursor:pointer;padding:8px 14px;border:2px solid var(--border);border-radius:8px;transition:all .2s">
                        <input type="radio" name="sugCat" value="${c.value}"> ${c.icon} ${c.label}
                    </label>`).join('')}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">What's on your mind?</label>
                <input class="form-input" id="sugSummary" placeholder="e.g. 'Add text message updates' or 'Calendar is hard to read on my phone'">
            </div>

            <div class="form-group">
                <label class="form-label">Details (optional)</label>
                <textarea class="form-textarea" id="sugDetails" rows="4" placeholder="Tell us more... What happened? What did you expect? Any specific page or feature?"></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">📸 Screenshot (optional)</label>
                <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:6px">Take a screenshot of the issue or feature you're talking about — helps us fix it faster.</p>
                <input type="file" id="sugScreenshot" accept="image/*" capture="environment" style="font-size:.88rem">
            </div>

            <button class="btn btn-primary" style="width:100%;padding:14px;margin-top:8px" onclick="submitSuggestion()">📩 Submit Feedback</button>
        </div>

        ${myFeedback.length > 0 ? `
        <div class="card">
            <div class="card-title" style="margin-bottom:12px">Your Past Submissions (${myFeedback.length})</div>
            ${[...myFeedback].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(f => {
                const cat = SUGGESTION_CATS.find(c => c.value === f.category) || SUGGESTION_CATS[5];
                const statusColors = { new: '#74B9FF', reviewed: '#A29BFE', in_progress: '#FDCB6E', implemented: '#00B894', wont_fix: '#636E72', duplicate: '#B2BEC3' };
                const statusLabels = { new: 'Submitted', reviewed: 'Reviewed', in_progress: 'Working On It', implemented: 'Done!', wont_fix: "Can't Do", duplicate: 'Already Reported' };
                return `<div style="padding:12px;border-bottom:1px solid var(--border)">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <div>
                            <span style="font-size:.95rem">${cat.icon}</span>
                            <strong style="font-size:.9rem">${esc(f.summary || '(no summary)')}</strong>
                        </div>
                        <span class="badge" style="background:${statusColors[f.status] || '#ccc'}20;color:${statusColors[f.status] || '#ccc'}">${statusLabels[f.status] || f.status}</span>
                    </div>
                    ${f.details ? `<div style="font-size:.82rem;color:var(--text-muted);margin-top:4px">${esc(f.details)}</div>` : ''}
                    ${f.adminNotes ? `<div style="font-size:.82rem;margin-top:6px;padding:8px;background:rgba(108,92,231,.04);border-radius:6px"><strong>Team response:</strong> ${esc(f.adminNotes)}</div>` : ''}
                    <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">${f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''}</div>
                </div>`;
            }).join('')}
        </div>` : ''}
    `;
};

const submitSuggestion = () => {
    const summary = document.getElementById('sugSummary')?.value?.trim();
    if (!summary) { alert('Please describe your suggestion or issue.'); return; }
    const category = document.querySelector('input[name="sugCat"]:checked')?.value || 'suggestion';
    const details = document.getElementById('sugDetails')?.value?.trim() || '';

    const feedback = load('feedback', []);
    const newItem = {
        id: uid(), category, priority: 'medium', affects: '',
        summary, details, clientId: userId, clientName: userName,
        screenshots: [], status: 'new',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        loggedBy: 'client-portal', adminNotes: '', source: 'client'
    };

    const notifyAndFinish = () => {
        if (typeof GPC_NOTIFY !== 'undefined') {
            GPC_NOTIFY.create({ type: 'client_feedback', title: 'New Client Suggestion', body: `${userName}: ${summary}`, audience: 'admin', createdAt: new Date().toISOString() });
        }
        alert('Thank you! Your feedback has been submitted. We\'ll review it soon.');
        renderSuggestions();
    };

    // Handle screenshot
    const fileInput = document.getElementById('sugScreenshot');
    if (fileInput?.files?.length) {
        const reader = new FileReader();
        reader.onload = (e) => {
            newItem.screenshots.push({ name: fileInput.files[0].name, data: e.target.result, addedAt: new Date().toISOString() });
            feedback.push(newItem);
            save('feedback', feedback);
            notifyAndFinish();
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        feedback.push(newItem);
        save('feedback', feedback);
        notifyAndFinish();
    }
};

// ---- Apply Admin Lab Config to Portal ----
const applyPortalConfig = () => {
    const cfg = getSiteConfig();

    // Hide disabled portal sections from nav
    if (cfg.portal?.sections) {
        document.querySelectorAll('.nav-item[data-tab]').forEach(link => {
            const tab = link.dataset.tab;
            if (cfg.portal.sections[tab] === false) link.style.display = 'none';
            else link.style.display = '';
        });
    }

    // Custom cursors
    if (cfg.portal?.customCursors || cfg.gamification?.cursorStyle !== 'default') {
        const style = cfg.portal?.cursorStyle || cfg.gamification?.cursorStyle || 'paw';
        const cursors = {
            paw: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><text y='28' font-size='28'>🐾</text></svg>",
            bone: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><text y='28' font-size='28'>🦴</text></svg>",
            tennis: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><text y='28' font-size='28'>🎾</text></svg>",
            heart: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><text y='28' font-size='28'>💛</text></svg>"
        };
        if (cfg.portal?.customCursors && cursors[style]) {
            document.body.style.cursor = `url("${cursors[style]}") 4 4, auto`;
        } else {
            document.body.style.cursor = '';
        }
    }

    // Theme colors
    if (cfg.theme) {
        const root = document.documentElement;
        if (cfg.theme.primaryColor) root.style.setProperty('--primary', cfg.theme.primaryColor);
        if (cfg.theme.accentColor) root.style.setProperty('--accent', cfg.theme.accentColor);
        if (cfg.theme.bgColor) root.style.setProperty('--bg', cfg.theme.bgColor);
        if (cfg.theme.borderRadius !== undefined) root.style.setProperty('--radius', cfg.theme.borderRadius + 'px');
        if (cfg.theme.darkMode) {
            root.style.setProperty('--bg', '#1a1a2e'); root.style.setProperty('--card-bg', '#16213e');
            root.style.setProperty('--text', '#eee'); root.style.setProperty('--text-light', '#bbb');
            root.style.setProperty('--text-muted', '#888'); root.style.setProperty('--border', '#2a2a4a');
            root.style.setProperty('--sidebar-bg', '#0f0f23');
        }
    }

    // Easter eggs
    if (cfg.portal?.easterEggs || cfg.gamification?.easterEggKonami) {
        if (!window._konamiWired) {
            window._konamiWired = true;
            let seq = []; const code = [38,38,40,40,37,39,37,39,66,65];
            document.addEventListener('keydown', (e) => {
                seq.push(e.keyCode); seq = seq.slice(-10);
                if (seq.join(',') === code.join(',')) {
                    document.body.style.transition = 'transform .5s';
                    document.body.style.transform = 'rotate(360deg)';
                    setTimeout(() => { document.body.style.transform = ''; }, 600);
                    alert(cfg.gamification?.konamiMessage || '🐾 You found the secret! GenusPupClub loves you! 🐶');
                }
            });
        }
    }

    // Dog facts on idle
    if (cfg.gamification?.easterEggDogFacts) {
        if (!window._dogFactsWired) {
            window._dogFactsWired = true;
            const facts = cfg.gamification?.dogFacts || [
                "Dogs can smell up to 100,000 times better than humans!",
                "A dog's nose print is unique, like a human fingerprint.",
                "Dogs dream just like humans — they even twitch in their sleep!",
                "The average dog can understand about 165 words.",
                "Dogs can detect diseases like cancer through scent.",
                "A wagging tail doesn't always mean a happy dog — direction matters!",
                "Dogs have three eyelids — the third one keeps their eyes moist.",
                "Puppies are born deaf — they can't hear until about 3 weeks old.",
                "A greyhound could beat a cheetah in a long-distance race.",
                "Dogs can be trained to detect low blood sugar in diabetics."
            ];
            let idle;
            const resetIdle = () => { clearTimeout(idle); idle = setTimeout(() => {
                const fact = facts[Math.floor(Math.random() * facts.length)];
                const popup = document.createElement('div');
                popup.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:14px 20px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.15);font-size:.88rem;max-width:300px;z-index:9999;border-left:4px solid var(--primary);animation:fadeIn .3s';
                popup.innerHTML = `<strong>🐕 Did you know?</strong><br>${fact}`;
                document.body.appendChild(popup);
                setTimeout(() => popup.remove(), 8000);
            }, 45000); };
            ['mousemove', 'keydown', 'scroll', 'click'].forEach(ev => document.addEventListener(ev, resetIdle));
            resetIdle();
        }
    }

    // Welcome animation
    if (cfg.portal?.welcomeAnimation && !window._welcomeShown) {
        window._welcomeShown = true;
        const wTitle = esc((cfg.gamification?.welcomeTitle || 'Welcome back, {clientName}!').replace('{clientName}', userName));
        const wSub = esc((cfg.gamification?.welcomeSubtitle || 'Your pups missed you.').replace('{clientName}', userName));
        const wEmoji = esc(cfg.gamification?.welcomeEmoji || '🐶');
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
        overlay.innerHTML = `<div style="background:#fff;padding:30px 40px;border-radius:16px;text-align:center;animation:fadeIn .4s">
            <div style="font-size:3rem;margin-bottom:12px">${wEmoji}</div>
            <h2 style="font-family:var(--font-display);margin:0 0 8px">${wTitle}</h2>
            <p style="color:var(--text-muted);margin:0">${wSub}</p>
        </div>`;
        document.body.appendChild(overlay);
        setTimeout(() => { overlay.style.opacity = '0'; overlay.style.transition = 'opacity .3s'; setTimeout(() => overlay.remove(), 300); }, 2000);
    }

    // Custom CSS/JS from Admin Lab
    if (cfg.advanced?.customCSS && !document.getElementById('gpc-custom-css')) {
        const style = document.createElement('style'); style.id = 'gpc-custom-css'; style.textContent = cfg.advanced.customCSS;
        document.head.appendChild(style);
    }
    if (cfg.advanced?.customJS && !window._customJSRan) {
        window._customJSRan = true;
        try { new Function(cfg.advanced.customJS)(); } catch (e) { console.warn('Admin Lab custom JS error:', e); }
    }
};

// Init
renderTab();
// Notification bell
if (typeof GPC_NOTIFY !== 'undefined') {
    GPC_NOTIFY.renderBell('notifBell', 'client', userId);
    setInterval(() => GPC_NOTIFY.renderBell('notifBell', 'client', userId), 10000);
}
