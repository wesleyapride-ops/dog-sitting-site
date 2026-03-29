// ========================================
// Data Layer — localStorage CRUD
// ========================================
const STORAGE_KEY = 'pawsAndStay';

const defaultServices = [
    { id: 'svc-overnight', name: 'Overnight Sitting', price: 55, unit: 'night', duration: 'Overnight', color: '#6c5ce7', icon: '🏠', description: '24/7 care in a home environment', enabled: true, createdAt: new Date().toISOString() },
    { id: 'svc-walking', name: 'Dog Walking', price: 25, unit: 'walk', duration: '30 min', color: '#00b894', icon: '🚶', description: 'Neighborhood walks tailored to your dog', enabled: true, createdAt: new Date().toISOString() },
    { id: 'svc-dropin', name: 'Drop-In Visit', price: 20, unit: 'visit', duration: '30 min', color: '#fdcb6e', icon: '👋', description: 'Quick home visit for feeding and potty', enabled: true, createdAt: new Date().toISOString() },
    { id: 'svc-daycare', name: 'Doggy Daycare', price: 40, unit: 'day', duration: 'Full day', color: '#e17055', icon: '🎉', description: 'Full day of supervised play and socialization', enabled: true, createdAt: new Date().toISOString() }
];

const defaultData = () => ({
    owner: { pin: '1234' },
    employees: [],
    clients: [],
    dogs: [],
    services: [...defaultServices],
    bookings: [],
    tasks: [],
    settings: { businessName: 'GenusPupClub' }
});

const Store = {
    _data: null,

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            this._data = raw ? JSON.parse(raw) : defaultData();
        } catch {
            this._data = defaultData();
        }
        const defaults = defaultData();
        for (const key of Object.keys(defaults)) {
            if (!(key in this._data)) this._data[key] = defaults[key];
        }
        // Migrate: if services is empty, seed defaults
        if (!this._data.services || this._data.services.length === 0) {
            this._data.services = [...defaultServices];
        }
        // Migrate: ensure owner exists
        if (!this._data.owner) this._data.owner = { pin: '1234' };
        // Migrate: ensure tasks exists
        if (!this._data.tasks) this._data.tasks = [];
        // Migrate old bookings that use service string instead of serviceId
        this._data.bookings.forEach(b => {
            if (b.service && !b.serviceId) {
                const svc = this._data.services.find(s => s.id === `svc-${b.service}` || s.name.toLowerCase().includes(b.service));
                b.serviceId = svc?.id || '';
                delete b.service;
            }
        });
        this.save();
        return this._data;
    },

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    },

    get data() {
        if (!this._data) this.load();
        return this._data;
    },

    getAll(collection) { return this.data[collection] || []; },
    getById(collection, id) { return this.getAll(collection).find(item => item.id === id); },

    add(collection, item) {
        item.id = item.id || crypto.randomUUID();
        item.createdAt = item.createdAt || new Date().toISOString();
        this.data[collection].push(item);
        this.save();
        return item;
    },

    update(collection, id, updates) {
        const list = this.data[collection];
        const idx = list.findIndex(item => item.id === id);
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...updates };
        this.save();
        return list[idx];
    },

    remove(collection, id) {
        this.data[collection] = this.data[collection].filter(item => item.id !== id);
        this.save();
    },

    getDogsForClient(clientId) {
        return this.getAll('dogs').filter(d => d.clientId === clientId);
    },

    getBookingsForDate(dateStr) {
        return this.getAll('bookings').filter(b => dateStr >= b.startDate && dateStr <= b.endDate);
    },

    getBookingsInRange(startStr, endStr) {
        return this.getAll('bookings').filter(b => b.startDate <= endStr && b.endDate >= startStr);
    },

    getEnabledServices() {
        return this.getAll('services').filter(s => s.enabled);
    },

    getActiveEmployees() {
        return this.getAll('employees').filter(e => e.active !== false);
    },

    getServiceById(id) { return this.getById('services', id); },
    getEmployeeById(id) { return this.getById('employees', id); }
};

Store.load();

// ========================================
// Auth State
// ========================================
let currentUser = null; // null = not logged in, { type: 'owner' } or { type: 'employee', id, name }

const AUTH = {
    login(pin) {
        if (pin === Store.data.owner.pin) {
            currentUser = { type: 'owner' };
            localStorage.setItem('pawsAuth', JSON.stringify(currentUser));
            return currentUser;
        }
        const emp = Store.getAll('employees').find(e => e.pin === pin && e.active !== false);
        if (emp) {
            currentUser = { type: 'employee', id: emp.id, name: emp.name };
            localStorage.setItem('pawsAuth', JSON.stringify(currentUser));
            return currentUser;
        }
        return null;
    },

    logout() {
        currentUser = null;
        localStorage.removeItem('pawsAuth');
    },

    restore() {
        try {
            const saved = localStorage.getItem('pawsAuth');
            if (saved) {
                currentUser = JSON.parse(saved);
                // Validate employee still exists
                if (currentUser.type === 'employee') {
                    const emp = Store.getById('employees', currentUser.id);
                    if (!emp || emp.active === false) {
                        this.logout();
                        return null;
                    }
                }
                return currentUser;
            }
        } catch { /* ignore */ }
        return null;
    },

    isOwner() { return currentUser?.type === 'owner'; },
    isEmployee() { return currentUser?.type === 'employee'; },
    employeeId() { return currentUser?.type === 'employee' ? currentUser.id : null; }
};

// ========================================
// Utility Helpers
// ========================================
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const toDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const todayStr = () => toDateStr(new Date());

const escapeHtml = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

const getServiceLabel = (serviceId) => {
    const svc = Store.getServiceById(serviceId);
    return svc ? svc.name : 'Unknown';
};

const getServiceColor = (serviceId) => {
    const svc = Store.getServiceById(serviceId);
    return svc ? svc.color : '#999';
};

const getServiceIcon = (serviceId) => {
    const svc = Store.getServiceById(serviceId);
    return svc ? svc.icon : '📋';
};

const getEmployeeName = (empId) => {
    if (!empId) return 'Unassigned';
    const emp = Store.getEmployeeById(empId);
    return emp ? emp.name : 'Unknown';
};

const getEmployeeColor = (empId) => {
    if (!empId) return '#999';
    const emp = Store.getEmployeeById(empId);
    return emp ? emp.color : '#999';
};

const calcAmount = (serviceId, startDate, endDate) => {
    const svc = Store.getServiceById(serviceId);
    if (!svc) return 0;
    const rate = svc.price || 0;
    if (!startDate || !endDate) return rate;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const days = Math.max(1, Math.round((end - start) / 86400000) + (svc.unit === 'night' ? 0 : 1));
    return rate * days;
};

// ========================================
// Login Screen
// ========================================
const showLogin = () => {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.getElementById('pinInput')?.focus();
        document.getElementById('loginError').textContent = '';
    }
};

const hideLogin = () => {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.remove('active');
};

const handleLogin = () => {
    const pinInput = document.getElementById('pinInput');
    const errorEl = document.getElementById('loginError');
    const pin = pinInput?.value || '';

    const user = AUTH.login(pin);
    if (user) {
        hideLogin();
        initDashboard();
        pinInput.value = '';
    } else {
        errorEl.textContent = 'Invalid PIN. Try again.';
        pinInput.value = '';
        pinInput.focus();
    }
};

const handleLogout = () => {
    AUTH.logout();
    document.body.classList.remove('dashboard-active');
    // Reset toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === 'site');
    });
    localStorage.setItem('pawsView', 'site');
};

// ========================================
// Dashboard Init
// ========================================
const initDashboard = () => {
    buildSidebar();
    initCalendar();
    switchPanel('calendar');
};

// ========================================
// Build Sidebar based on role
// ========================================
const buildSidebar = () => {
    const nav = document.querySelector('.dash-nav');
    if (!nav) return;

    if (AUTH.isOwner()) {
        nav.innerHTML = `
            <button class="dash-nav-btn active" data-panel="calendar"><span class="dash-nav-icon">📅</span><span class="dash-nav-label">Calendar</span></button>
            <button class="dash-nav-btn" data-panel="bookings"><span class="dash-nav-icon">📋</span><span class="dash-nav-label">Bookings</span></button>
            <button class="dash-nav-btn" data-panel="tasks"><span class="dash-nav-icon">✅</span><span class="dash-nav-label">Tasks</span></button>
            <button class="dash-nav-btn" data-panel="clients"><span class="dash-nav-icon">👥</span><span class="dash-nav-label">Clients</span></button>
            <button class="dash-nav-btn" data-panel="employees"><span class="dash-nav-icon">👷</span><span class="dash-nav-label">Employees</span></button>
            <button class="dash-nav-btn" data-panel="payments"><span class="dash-nav-icon">💰</span><span class="dash-nav-label">Payments</span></button>
            <button class="dash-nav-btn" data-panel="settings"><span class="dash-nav-icon">⚙️</span><span class="dash-nav-label">Settings</span></button>
            <button class="dash-nav-btn dash-logout-btn" id="logoutBtn"><span class="dash-nav-icon">🚪</span><span class="dash-nav-label">Log Out</span></button>
        `;
    } else {
        nav.innerHTML = `
            <button class="dash-nav-btn active" data-panel="calendar"><span class="dash-nav-icon">📅</span><span class="dash-nav-label">My Schedule</span></button>
            <button class="dash-nav-btn" data-panel="tasks"><span class="dash-nav-icon">✅</span><span class="dash-nav-label">My Tasks</span></button>
            <button class="dash-nav-btn" data-panel="today"><span class="dash-nav-icon">📋</span><span class="dash-nav-label">Today</span></button>
            <button class="dash-nav-btn dash-logout-btn" id="logoutBtn"><span class="dash-nav-icon">🚪</span><span class="dash-nav-label">Log Out</span></button>
        `;
    }

    // Re-bind nav clicks
    nav.querySelectorAll('.dash-nav-btn:not(.dash-logout-btn)').forEach(btn => {
        btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
    });

    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
};

// ========================================
// Dashboard Navigation
// ========================================
const switchPanel = (panelName) => {
    document.querySelectorAll('.dash-nav-btn:not(.dash-logout-btn)').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === panelName);
    });
    document.querySelectorAll('.dash-panel').forEach(panel => panel.classList.remove('active'));

    const panelId = `panel${panelName.charAt(0).toUpperCase() + panelName.slice(1)}`;
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');

    const refreshMap = {
        calendar: renderCalendar,
        bookings: renderBookings,
        tasks: renderTasks,
        clients: renderClients,
        employees: renderEmployees,
        payments: renderPayments,
        settings: renderSettings,
        today: renderToday
    };
    refreshMap[panelName]?.();
};

// ========================================
// Calendar View
// ========================================
let calYear, calMonth, calSelectedDate;
let calFilterEmployee = '';
let calFilterService = '';

const initCalendar = () => {
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    calSelectedDate = todayStr();
    renderCalendar();
};

const renderCalendar = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthYearEl = document.getElementById('calMonthYear');
    if (monthYearEl) monthYearEl.textContent = `${monthNames[calMonth]} ${calYear}`;

    // Build filter dropdowns
    renderCalendarFilters();

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrev = new Date(calYear, calMonth, 0).getDate();

    const monthStart = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`;
    const monthEnd = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    let bookings = Store.getBookingsInRange(monthStart, monthEnd);

    // Apply filters
    if (AUTH.isEmployee()) {
        bookings = bookings.filter(b => b.employeeId === AUTH.employeeId());
    } else {
        if (calFilterEmployee) bookings = bookings.filter(b => b.employeeId === calFilterEmployee);
        if (calFilterService) bookings = bookings.filter(b => b.serviceId === calFilterService);
    }

    const calBody = document.getElementById('calBody');
    if (!calBody) return;
    calBody.innerHTML = '';
    const today = todayStr();

    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrev - i;
        const prevMonth = calMonth === 0 ? 12 : calMonth;
        const prevYear = calMonth === 0 ? calYear - 1 : calYear;
        const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calBody.appendChild(createCalDay(day, dateStr, true, today, bookings));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calBody.appendChild(createCalDay(day, dateStr, false, today, bookings));
    }

    const totalCells = calBody.children.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remaining; day++) {
        const nextMonth = calMonth + 2 > 12 ? 1 : calMonth + 2;
        const nextYear = calMonth + 2 > 12 ? calYear + 1 : calYear;
        const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calBody.appendChild(createCalDay(day, dateStr, true, today, bookings));
    }

    renderCalDayDetail();
};

const renderCalendarFilters = () => {
    const container = document.getElementById('calFilters');
    if (!container || AUTH.isEmployee()) {
        if (container) container.innerHTML = '';
        return;
    }

    const employees = Store.getActiveEmployees();
    const services = Store.getEnabledServices();

    container.innerHTML = `
        <select id="calEmpFilter" class="dash-filter-select">
            <option value="">All Employees</option>
            ${employees.map(e => `<option value="${e.id}" ${calFilterEmployee === e.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join('')}
        </select>
        <select id="calSvcFilter" class="dash-filter-select">
            <option value="">All Services</option>
            ${services.map(s => `<option value="${s.id}" ${calFilterService === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}
        </select>
    `;

    document.getElementById('calEmpFilter')?.addEventListener('change', (e) => {
        calFilterEmployee = e.target.value;
        renderCalendar();
    });
    document.getElementById('calSvcFilter')?.addEventListener('change', (e) => {
        calFilterService = e.target.value;
        renderCalendar();
    });
};

const createCalDay = (dayNum, dateStr, isOtherMonth, today, allBookings) => {
    const el = document.createElement('div');
    el.className = 'cal-day';
    if (isOtherMonth) el.classList.add('other-month');
    if (dateStr === today) el.classList.add('today');
    if (dateStr === calSelectedDate) el.classList.add('selected');

    const dayBookings = allBookings.filter(b => dateStr >= b.startDate && dateStr <= b.endDate && b.status !== 'cancelled');

    const numEl = document.createElement('div');
    numEl.className = 'cal-day-num';
    numEl.textContent = dayNum;
    el.appendChild(numEl);

    if (dayBookings.length > 0) {
        const dots = document.createElement('div');
        dots.className = 'cal-day-dots';
        dayBookings.slice(0, 5).forEach(b => {
            const dot = document.createElement('span');
            dot.className = 'cal-dot';
            // Use employee color if assigned, otherwise service color
            const empColor = b.employeeId ? getEmployeeColor(b.employeeId) : null;
            dot.style.background = empColor || getServiceColor(b.serviceId);
            dot.title = `${getServiceLabel(b.serviceId)}${b.employeeId ? ' — ' + getEmployeeName(b.employeeId) : ''}`;
            dots.appendChild(dot);
        });
        if (dayBookings.length > 5) {
            const more = document.createElement('span');
            more.className = 'cal-dot-more';
            more.textContent = `+${dayBookings.length - 5}`;
            dots.appendChild(more);
        }
        el.appendChild(dots);
    }

    el.addEventListener('click', () => {
        document.querySelectorAll('.cal-day.selected').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
        calSelectedDate = dateStr;
        renderCalDayDetail();
    });

    return el;
};

const renderCalDayDetail = () => {
    const dateEl = document.getElementById('calDetailDate');
    const listEl = document.getElementById('calDetailBookings');
    if (!dateEl || !listEl) return;

    if (!calSelectedDate) {
        dateEl.textContent = 'Select a day';
        listEl.innerHTML = '<p class="empty-state">Click a day to see bookings</p>';
        return;
    }

    dateEl.textContent = formatDate(calSelectedDate);
    let bookings = Store.getBookingsForDate(calSelectedDate).filter(b => b.status !== 'cancelled');

    if (AUTH.isEmployee()) {
        bookings = bookings.filter(b => b.employeeId === AUTH.employeeId());
    }

    if (bookings.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No bookings this day</p>';
        return;
    }

    listEl.innerHTML = bookings.map(b => {
        const client = Store.getById('clients', b.clientId);
        const dog = Store.getById('dogs', b.dogId);
        const svcColor = getServiceColor(b.serviceId);
        const empName = getEmployeeName(b.employeeId);
        const empColor = getEmployeeColor(b.employeeId);
        return `
            <div class="cal-detail-item" style="border-left-color:${svcColor}" data-id="${b.id}" ${AUTH.isOwner() ? 'style="cursor:pointer"' : ''}>
                <div class="detail-info">
                    <strong>${getServiceIcon(b.serviceId)} ${dog?.name || 'Unknown dog'} — ${getServiceLabel(b.serviceId)}</strong>
                    <span>${client?.name || 'Unknown'} | ${formatDateShort(b.startDate)} – ${formatDateShort(b.endDate)}</span>
                    <span class="detail-employee" style="color:${empColor}">👷 ${escapeHtml(empName)}</span>
                </div>
                <span class="status-badge ${b.paymentStatus}">${b.paymentStatus}</span>
            </div>
        `;
    }).join('');

    if (AUTH.isOwner()) {
        listEl.querySelectorAll('.cal-detail-item').forEach(el => {
            el.addEventListener('click', () => openBookingModal(el.dataset.id));
        });
    }
};

// Calendar controls
document.getElementById('calPrev')?.addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
});
document.getElementById('calNext')?.addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
});
document.getElementById('calToday')?.addEventListener('click', () => {
    const now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    calSelectedDate = todayStr();
    renderCalendar();
});
document.getElementById('calAddBooking')?.addEventListener('click', () => openBookingModal());

// ========================================
// Bookings View
// ========================================
let bookingFilter = 'upcoming';

const renderBookings = () => {
    const listEl = document.getElementById('bookingsList');
    if (!listEl) return;

    let bookings = Store.getAll('bookings');
    const today = todayStr();

    // Apply filter
    switch (bookingFilter) {
        case 'upcoming': bookings = bookings.filter(b => b.endDate >= today && b.status !== 'cancelled'); break;
        case 'past': bookings = bookings.filter(b => b.endDate < today); break;
        case 'pending': bookings = bookings.filter(b => b.status === 'pending'); break;
    }

    bookings.sort((a, b) => a.startDate.localeCompare(b.startDate));

    if (bookings.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No bookings match this filter.</p>';
        return;
    }

    listEl.innerHTML = bookings.map(b => {
        const client = Store.getById('clients', b.clientId);
        const dog = Store.getById('dogs', b.dogId);
        const svcColor = getServiceColor(b.serviceId);
        const empName = getEmployeeName(b.employeeId);
        const empColor = getEmployeeColor(b.employeeId);
        return `
            <div class="booking-card" style="border-left-color:${svcColor}" data-id="${b.id}">
                <span class="booking-service-badge" style="background:${svcColor}20;color:${svcColor}">${getServiceIcon(b.serviceId)} ${getServiceLabel(b.serviceId)}</span>
                <div class="booking-info">
                    <strong>${escapeHtml(dog?.name || 'Unknown dog')}</strong>
                    <span>${escapeHtml(client?.name || 'Unknown client')}</span>
                </div>
                <div class="booking-employee" style="color:${empColor}">
                    <strong>👷 ${escapeHtml(empName)}</strong>
                </div>
                <div class="booking-dates">
                    <strong>${formatDateShort(b.startDate)} – ${formatDateShort(b.endDate)}</strong>
                    <span>$${b.paymentAmount || 0}</span>
                </div>
                <div class="booking-status">
                    <span class="status-badge ${b.status}">${b.status}</span>
                    <span class="status-badge ${b.paymentStatus}">${b.paymentStatus}</span>
                </div>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.booking-card').forEach(card => {
        card.addEventListener('click', () => openBookingModal(card.dataset.id));
    });
};

document.querySelectorAll('#panelBookings .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#panelBookings .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bookingFilter = btn.dataset.filter;
        renderBookings();
    });
});
document.getElementById('addBookingBtn')?.addEventListener('click', () => openBookingModal());

// ========================================
// Booking Modal
// ========================================
const bookingModal = document.getElementById('bookingModal');
const bookingForm = document.getElementById('bookingForm');

const openBookingModal = (bookingId) => {
    if (!AUTH.isOwner()) return;
    bookingForm.reset();
    document.getElementById('bookingId').value = '';
    document.getElementById('bookingModalTitle').textContent = 'New Booking';
    document.getElementById('bookingDelete').style.display = 'none';

    populateClientDropdown();
    populateEmployeeDropdown();
    populateServiceDropdown();

    if (bookingId) {
        const b = Store.getById('bookings', bookingId);
        if (!b) return;
        document.getElementById('bookingModalTitle').textContent = 'Edit Booking';
        document.getElementById('bookingId').value = b.id;
        document.getElementById('bookingDelete').style.display = 'inline-flex';

        document.getElementById('bkClient').value = b.clientId;
        populateDogDropdown(b.clientId);
        document.getElementById('bkDog').value = b.dogId;
        document.getElementById('bkService').value = b.serviceId || '';
        document.getElementById('bkEmployee').value = b.employeeId || '';
        document.getElementById('bkStatus').value = b.status;
        document.getElementById('bkStart').value = b.startDate;
        document.getElementById('bkEnd').value = b.endDate;
        document.getElementById('bkAmount').value = b.paymentAmount || '';
        document.getElementById('bkPayStatus').value = b.paymentStatus;
        document.getElementById('bkNotes').value = b.notes || '';
    } else {
        populateDogDropdown(null);
        if (calSelectedDate) {
            document.getElementById('bkStart').value = calSelectedDate;
            document.getElementById('bkEnd').value = calSelectedDate;
        }
    }

    bookingModal.classList.add('active');
};

const populateClientDropdown = () => {
    const sel = document.getElementById('bkClient');
    if (!sel) return;
    const clients = Store.getAll('clients');
    sel.innerHTML = '<option value="" disabled selected>Select client</option><option value="__new__">+ Add new client</option>';
    clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        sel.appendChild(opt);
    });
};

const populateDogDropdown = (clientId) => {
    const sel = document.getElementById('bkDog');
    if (!sel) return;
    sel.innerHTML = '<option value="" disabled selected>Select dog</option>';
    if (!clientId) return;
    Store.getDogsForClient(clientId).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.name} (${d.breed || 'Unknown breed'})`;
        sel.appendChild(opt);
    });
};

const populateServiceDropdown = () => {
    const sel = document.getElementById('bkService');
    if (!sel) return;
    sel.innerHTML = '<option value="" disabled selected>Select service</option>';
    Store.getEnabledServices().forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.icon} ${s.name} — $${s.price}/${s.unit}`;
        sel.appendChild(opt);
    });
};

const populateEmployeeDropdown = () => {
    const sel = document.getElementById('bkEmployee');
    if (!sel) return;
    sel.innerHTML = '<option value="">Unassigned</option>';
    Store.getActiveEmployees().forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = e.name;
        sel.appendChild(opt);
    });
};

document.getElementById('bkClient')?.addEventListener('change', (e) => {
    if (e.target.value === '__new__') {
        closeModal(bookingModal);
        openClientModal();
        return;
    }
    populateDogDropdown(e.target.value);
});

const autoCalcAmount = () => {
    const svcId = document.getElementById('bkService')?.value;
    const start = document.getElementById('bkStart')?.value;
    const end = document.getElementById('bkEnd')?.value;
    if (svcId && start && end) {
        document.getElementById('bkAmount').value = calcAmount(svcId, start, end);
    }
};

document.getElementById('bkService')?.addEventListener('change', autoCalcAmount);
document.getElementById('bkStart')?.addEventListener('change', autoCalcAmount);
document.getElementById('bkEnd')?.addEventListener('change', autoCalcAmount);

bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(bookingForm);
    const data = Object.fromEntries(fd);
    const id = data.bookingId;
    delete data.bookingId;

    data.paymentAmount = parseFloat(data.paymentAmount) || 0;
    if (data.paymentStatus === 'paid' && !data.paidDate) data.paidDate = todayStr();

    if (id) {
        Store.update('bookings', id, data);
    } else {
        Store.add('bookings', data);
    }

    closeModal(bookingModal);
    refreshAll();
});

document.getElementById('bookingDelete')?.addEventListener('click', () => {
    const id = document.getElementById('bookingId').value;
    if (id && confirm('Delete this booking?')) {
        Store.remove('bookings', id);
        closeModal(bookingModal);
        refreshAll();
    }
});

document.getElementById('bookingModalClose')?.addEventListener('click', () => closeModal(bookingModal));
document.getElementById('bookingCancel')?.addEventListener('click', () => closeModal(bookingModal));

// ========================================
// Tasks (Kanban Board)
// ========================================
let taskFilterEmployee = '';

const renderTasks = () => {
    const panel = document.getElementById('panelTasks');
    if (!panel) return;

    // Build filter
    const filterContainer = document.getElementById('taskFilters');
    if (filterContainer && AUTH.isOwner()) {
        const employees = Store.getActiveEmployees();
        filterContainer.innerHTML = `
            <select id="taskEmpFilter" class="dash-filter-select">
                <option value="">All Employees</option>
                ${employees.map(e => `<option value="${e.id}" ${taskFilterEmployee === e.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join('')}
            </select>
        `;
        document.getElementById('taskEmpFilter')?.addEventListener('change', (e) => {
            taskFilterEmployee = e.target.value;
            renderTasks();
        });
    }

    let tasks = Store.getAll('tasks');

    if (AUTH.isEmployee()) {
        tasks = tasks.filter(t => t.employeeId === AUTH.employeeId());
    } else if (taskFilterEmployee) {
        tasks = tasks.filter(t => t.employeeId === taskFilterEmployee);
    }

    const columns = { todo: [], inprogress: [], done: [] };
    tasks.forEach(t => {
        const col = columns[t.status] || columns.todo;
        col.push(t);
    });

    // Sort by priority then due date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    for (const col of Object.values(columns)) {
        col.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1) || (a.dueDate || '').localeCompare(b.dueDate || ''));
    }

    ['todo', 'inprogress', 'done'].forEach(status => {
        const listEl = document.getElementById(`taskCol_${status}`);
        if (!listEl) return;
        const countEl = document.getElementById(`taskCount_${status}`);
        if (countEl) countEl.textContent = columns[status].length;

        if (columns[status].length === 0) {
            listEl.innerHTML = '<p class="empty-state" style="padding:20px;font-size:0.85rem">No tasks</p>';
            return;
        }

        listEl.innerHTML = columns[status].map(t => {
            const empName = getEmployeeName(t.employeeId);
            const empColor = getEmployeeColor(t.employeeId);
            const isOverdue = t.dueDate && t.dueDate < todayStr() && t.status !== 'done';
            return `
                <div class="task-card ${isOverdue ? 'overdue' : ''}" data-id="${t.id}">
                    <div class="task-card-header">
                        <span class="priority-badge ${t.priority}">${t.priority}</span>
                        ${t.dueDate ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">${formatDateShort(t.dueDate)}</span>` : ''}
                    </div>
                    <strong class="task-title">${escapeHtml(t.title)}</strong>
                    ${t.description ? `<p class="task-desc">${escapeHtml(t.description)}</p>` : ''}
                    <div class="task-card-footer">
                        <span class="task-assignee" style="color:${empColor}">👷 ${escapeHtml(empName)}</span>
                        <div class="task-actions">
                            ${t.status !== 'todo' ? `<button class="task-move-btn" data-id="${t.id}" data-to="${t.status === 'done' ? 'inprogress' : 'todo'}" title="Move back">&larr;</button>` : ''}
                            ${t.status !== 'done' ? `<button class="task-move-btn" data-id="${t.id}" data-to="${t.status === 'todo' ? 'inprogress' : 'done'}" title="Move forward">&rarr;</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Bind click to edit
        listEl.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.task-move-btn')) return;
                openTaskModal(card.dataset.id);
            });
        });

        // Bind move buttons
        listEl.querySelectorAll('.task-move-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                Store.update('tasks', btn.dataset.id, { status: btn.dataset.to });
                renderTasks();
            });
        });
    });
};

document.getElementById('addTaskBtn')?.addEventListener('click', () => openTaskModal());

// ========================================
// Task Modal
// ========================================
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');

const openTaskModal = (taskId) => {
    if (!taskForm) return;
    taskForm.reset();
    document.getElementById('taskIdField').value = '';
    document.getElementById('taskModalTitle').textContent = 'New Task';
    document.getElementById('taskDelete').style.display = 'none';

    // Populate employee dropdown
    const empSel = document.getElementById('tkEmployee');
    if (empSel) {
        empSel.innerHTML = '<option value="">Unassigned</option>';
        Store.getActiveEmployees().forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.textContent = e.name;
            empSel.appendChild(opt);
        });
    }

    if (taskId) {
        const t = Store.getById('tasks', taskId);
        if (!t) return;
        document.getElementById('taskModalTitle').textContent = 'Edit Task';
        document.getElementById('taskIdField').value = t.id;
        document.getElementById('taskDelete').style.display = 'inline-flex';
        document.getElementById('tkTitle').value = t.title || '';
        document.getElementById('tkDesc').value = t.description || '';
        if (empSel) empSel.value = t.employeeId || '';
        document.getElementById('tkDue').value = t.dueDate || '';
        document.getElementById('tkPriority').value = t.priority || 'medium';
        document.getElementById('tkStatus').value = t.status || 'todo';
    }

    taskModal.classList.add('active');
};

taskForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(taskForm);
    const data = Object.fromEntries(fd);
    const id = data.taskId;
    delete data.taskId;

    if (id) {
        Store.update('tasks', id, data);
    } else {
        Store.add('tasks', data);
    }

    closeModal(taskModal);
    renderTasks();
});

document.getElementById('taskDelete')?.addEventListener('click', () => {
    const id = document.getElementById('taskIdField').value;
    if (id && confirm('Delete this task?')) {
        Store.remove('tasks', id);
        closeModal(taskModal);
        renderTasks();
    }
});

document.getElementById('taskModalClose')?.addEventListener('click', () => closeModal(taskModal));
document.getElementById('taskCancel')?.addEventListener('click', () => closeModal(taskModal));

// ========================================
// Clients View
// ========================================
const renderClients = () => {
    const listEl = document.getElementById('clientsList');
    if (!listEl) return;
    const searchVal = (document.getElementById('clientSearch')?.value || '').toLowerCase();
    let clients = Store.getAll('clients');

    if (searchVal) {
        clients = clients.filter(c => {
            const dogs = Store.getDogsForClient(c.id);
            const dogMatch = dogs.some(d => d.name.toLowerCase().includes(searchVal) || (d.breed || '').toLowerCase().includes(searchVal));
            return c.name.toLowerCase().includes(searchVal) || (c.email || '').toLowerCase().includes(searchVal) || dogMatch;
        });
    }

    clients.sort((a, b) => a.name.localeCompare(b.name));

    if (clients.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No clients found.</p>';
        return;
    }

    listEl.innerHTML = clients.map(c => {
        const dogs = Store.getDogsForClient(c.id);
        const initial = c.name.charAt(0).toUpperCase();
        return `
            <div class="client-card" data-id="${c.id}">
                <div class="client-header">
                    <div class="client-avatar">${initial}</div>
                    <div class="client-header-info">
                        <strong>${escapeHtml(c.name)}</strong>
                        <span>${escapeHtml(c.email || '')}${c.phone ? ' | ' + escapeHtml(c.phone) : ''}</span>
                    </div>
                </div>
                <div class="client-dogs">
                    ${dogs.map(d => `<span class="client-dog-tag">${escapeHtml(d.name)} — ${escapeHtml(d.breed || 'Unknown')}</span>`).join('')}
                    ${dogs.length === 0 ? '<span class="client-dog-tag" style="opacity:0.5">No dogs added</span>' : ''}
                </div>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.client-card').forEach(card => {
        card.addEventListener('click', () => openClientModal(card.dataset.id));
    });
};

document.getElementById('clientSearch')?.addEventListener('input', renderClients);
document.getElementById('addClientBtn')?.addEventListener('click', () => openClientModal());

// ========================================
// Client Modal
// ========================================
const clientModal = document.getElementById('clientModal');
const clientForm = document.getElementById('clientForm');
const dogFieldsContainer = document.getElementById('dogFields');
const dogFieldTemplate = document.getElementById('dogFieldTemplate');

const openClientModal = (clientId) => {
    if (!clientForm) return;
    clientForm.reset();
    document.getElementById('clientId').value = '';
    document.getElementById('clientModalTitle').textContent = 'New Client';
    document.getElementById('clientDelete').style.display = 'none';
    if (dogFieldsContainer) dogFieldsContainer.innerHTML = '';

    if (clientId) {
        const c = Store.getById('clients', clientId);
        if (!c) return;
        document.getElementById('clientModalTitle').textContent = 'Edit Client';
        document.getElementById('clientId').value = c.id;
        document.getElementById('clientDelete').style.display = 'inline-flex';
        document.getElementById('clName').value = c.name;
        document.getElementById('clEmail').value = c.email || '';
        document.getElementById('clPhone').value = c.phone || '';
        document.getElementById('clAddress').value = c.address || '';
        document.getElementById('clNotes').value = c.notes || '';
        Store.getDogsForClient(c.id).forEach(d => addDogField(d));
    } else {
        addDogField();
    }

    clientModal.classList.add('active');
};

const addDogField = (dogData) => {
    if (!dogFieldTemplate || !dogFieldsContainer) return;
    const clone = dogFieldTemplate.content.cloneNode(true);
    const group = clone.querySelector('.dog-field-group');

    if (dogData) {
        group.dataset.dogId = dogData.id;
        group.querySelector('[name="dogName"]').value = dogData.name || '';
        group.querySelector('[name="dogBreed"]').value = dogData.breed || '';
        group.querySelector('[name="dogSize"]').value = dogData.size || 'large';
        group.querySelector('[name="dogAge"]').value = dogData.age || '';
        group.querySelector('[name="dogSpecialNeeds"]').value = dogData.specialNeeds || '';
        group.querySelector('[name="dogVetInfo"]').value = dogData.vetInfo || '';
    }

    group.querySelector('.dog-remove').addEventListener('click', () => group.remove());
    dogFieldsContainer.appendChild(clone);
};

document.getElementById('addDogFieldBtn')?.addEventListener('click', () => addDogField());

clientForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const clientId = document.getElementById('clientId').value;
    const clientData = {
        name: document.getElementById('clName').value.trim(),
        email: document.getElementById('clEmail').value.trim(),
        phone: document.getElementById('clPhone').value.trim(),
        address: document.getElementById('clAddress').value.trim(),
        notes: document.getElementById('clNotes').value.trim()
    };

    let cId;
    if (clientId) {
        Store.update('clients', clientId, clientData);
        cId = clientId;
    } else {
        cId = Store.add('clients', clientData).id;
    }

    const existingDogs = Store.getDogsForClient(cId);
    const dogGroups = dogFieldsContainer?.querySelectorAll('.dog-field-group') || [];
    const formDogIds = new Set();

    dogGroups.forEach(group => {
        const dogId = group.dataset.dogId;
        const dogData = {
            clientId: cId,
            name: group.querySelector('[name="dogName"]').value.trim(),
            breed: group.querySelector('[name="dogBreed"]').value.trim(),
            size: group.querySelector('[name="dogSize"]').value,
            age: group.querySelector('[name="dogAge"]').value.trim(),
            specialNeeds: group.querySelector('[name="dogSpecialNeeds"]').value.trim(),
            vetInfo: group.querySelector('[name="dogVetInfo"]').value.trim()
        };
        if (!dogData.name) return;
        if (dogId) {
            Store.update('dogs', dogId, dogData);
            formDogIds.add(dogId);
        } else {
            formDogIds.add(Store.add('dogs', dogData).id);
        }
    });

    existingDogs.forEach(d => { if (!formDogIds.has(d.id)) Store.remove('dogs', d.id); });

    closeModal(clientModal);
    refreshAll();
});

document.getElementById('clientDelete')?.addEventListener('click', () => {
    const id = document.getElementById('clientId').value;
    if (id && confirm('Delete this client and all their dogs?')) {
        Store.getDogsForClient(id).forEach(d => Store.remove('dogs', d.id));
        Store.remove('clients', id);
        closeModal(clientModal);
        refreshAll();
    }
});

document.getElementById('clientModalClose')?.addEventListener('click', () => closeModal(clientModal));
document.getElementById('clientCancel')?.addEventListener('click', () => closeModal(clientModal));

// ========================================
// Employees View
// ========================================
const renderEmployees = () => {
    const listEl = document.getElementById('employeesList');
    if (!listEl) return;

    const employees = Store.getAll('employees');

    if (employees.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No employees yet. Add your first team member!</p>';
        return;
    }

    listEl.innerHTML = employees.map(emp => {
        const bookingCount = Store.getAll('bookings').filter(b => b.employeeId === emp.id && b.status !== 'cancelled').length;
        const taskCount = Store.getAll('tasks').filter(t => t.employeeId === emp.id && t.status !== 'done').length;
        return `
            <div class="employee-card ${emp.active === false ? 'inactive' : ''}" data-id="${emp.id}">
                <div class="employee-color-bar" style="background:${emp.color || '#999'}"></div>
                <div class="employee-info">
                    <div class="employee-header">
                        <strong>${escapeHtml(emp.name)}</strong>
                        <span class="employee-role">${escapeHtml(emp.role || 'Team Member')}</span>
                    </div>
                    <div class="employee-meta">
                        <span>📋 ${bookingCount} bookings</span>
                        <span>✅ ${taskCount} active tasks</span>
                        <span class="status-badge ${emp.active === false ? 'cancelled' : 'confirmed'}">${emp.active === false ? 'Inactive' : 'Active'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.employee-card').forEach(card => {
        card.addEventListener('click', () => openEmployeeModal(card.dataset.id));
    });
};

document.getElementById('addEmployeeBtn')?.addEventListener('click', () => openEmployeeModal());

// ========================================
// Employee Modal
// ========================================
const employeeModal = document.getElementById('employeeModal');
const employeeForm = document.getElementById('employeeForm');

const openEmployeeModal = (empId) => {
    if (!employeeForm) return;
    employeeForm.reset();
    document.getElementById('employeeIdField').value = '';
    document.getElementById('employeeModalTitle').textContent = 'New Employee';
    document.getElementById('employeeDelete').style.display = 'none';
    document.getElementById('empActive').checked = true;

    // Generate random color for new employees
    const colors = ['#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fdcb6e', '#e84393', '#00cec9', '#ff7675'];
    document.getElementById('empColor').value = colors[Math.floor(Math.random() * colors.length)];

    if (empId) {
        const emp = Store.getById('employees', empId);
        if (!emp) return;
        document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
        document.getElementById('employeeIdField').value = emp.id;
        document.getElementById('employeeDelete').style.display = 'inline-flex';
        document.getElementById('empName').value = emp.name || '';
        document.getElementById('empEmail').value = emp.email || '';
        document.getElementById('empPhone').value = emp.phone || '';
        document.getElementById('empRole').value = emp.role || '';
        document.getElementById('empColor').value = emp.color || '#6c5ce7';
        document.getElementById('empPin').value = emp.pin || '';
        document.getElementById('empActive').checked = emp.active !== false;
    }

    employeeModal.classList.add('active');
};

employeeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(employeeForm);
    const data = Object.fromEntries(fd);
    const id = data.employeeId;
    delete data.employeeId;
    data.active = document.getElementById('empActive').checked;

    // Validate PIN uniqueness
    const existingPins = Store.getAll('employees')
        .filter(emp => emp.id !== id)
        .map(emp => emp.pin)
        .concat([Store.data.owner.pin]);
    if (data.pin && existingPins.includes(data.pin)) {
        alert('This PIN is already in use. Choose a different one.');
        return;
    }

    if (id) {
        Store.update('employees', id, data);
    } else {
        Store.add('employees', data);
    }

    closeModal(employeeModal);
    renderEmployees();
});

document.getElementById('employeeDelete')?.addEventListener('click', () => {
    const id = document.getElementById('employeeIdField').value;
    if (id && confirm('Deactivate this employee? (Their history will be preserved)')) {
        Store.update('employees', id, { active: false });
        closeModal(employeeModal);
        renderEmployees();
    }
});

document.getElementById('employeeModalClose')?.addEventListener('click', () => closeModal(employeeModal));
document.getElementById('employeeCancel')?.addEventListener('click', () => closeModal(employeeModal));

// ========================================
// Payments View
// ========================================
const renderPayments = () => {
    const bookings = Store.getAll('bookings');
    const clients = Store.getAll('clients');
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const paidThisMonth = bookings
        .filter(b => b.paymentStatus === 'paid' && b.paidDate && b.paidDate.startsWith(monthStr))
        .reduce((sum, b) => sum + (b.paymentAmount || 0), 0);

    const outstanding = bookings
        .filter(b => b.paymentStatus !== 'paid' && b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.paymentAmount || 0), 0);

    const totalEarned = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.paymentAmount || 0), 0);

    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('statMonthEarned', `$${paidThisMonth.toFixed(0)}`);
    el('statOutstanding', `$${outstanding.toFixed(0)}`);
    el('statTotalClients', clients.length);
    el('statTotalEarned', `$${totalEarned.toFixed(0)}`);

    renderRevenueChart(bookings);

    const listEl = document.getElementById('paymentsList');
    if (!listEl) return;

    const unpaid = bookings.filter(b => b.paymentStatus !== 'paid' && b.status !== 'cancelled');
    const recentPaid = bookings.filter(b => b.paymentStatus === 'paid').sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || '')).slice(0, 10);
    const allPayments = [...unpaid, ...recentPaid];

    if (allPayments.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No payment records yet.</p>';
        return;
    }

    listEl.innerHTML = allPayments.map(b => {
        const client = Store.getById('clients', b.clientId);
        const dog = Store.getById('dogs', b.dogId);
        const isPaid = b.paymentStatus === 'paid';
        const empName = getEmployeeName(b.employeeId);
        return `
            <div class="payment-row">
                <div>
                    <strong>${escapeHtml(dog?.name || 'Unknown')} — ${getServiceLabel(b.serviceId)}</strong>
                    <br><span>${escapeHtml(client?.name || 'Unknown')} | ${escapeHtml(empName)} | ${formatDateShort(b.startDate)} – ${formatDateShort(b.endDate)}</span>
                </div>
                <span class="payment-amount">$${(b.paymentAmount || 0).toFixed(2)}</span>
                <span class="status-badge ${b.paymentStatus}">${b.paymentStatus}</span>
                ${!isPaid ? `<button class="mark-paid-btn" data-id="${b.id}">Mark Paid</button>` : `<span style="font-size:0.82rem;color:var(--color-text-muted)">${formatDateShort(b.paidDate)}</span>`}
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.mark-paid-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            Store.update('bookings', btn.dataset.id, { paymentStatus: 'paid', paidDate: todayStr() });
            renderPayments();
        });
    });
};

// ========================================
// Revenue Chart
// ========================================
const renderRevenueChart = (bookings) => {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(300, rect.width - 48);
    const h = 220;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', { month: 'short' })
        });
    }

    const monthTotals = months.map(m =>
        bookings.filter(b => b.paymentStatus === 'paid' && b.paidDate && b.paidDate.startsWith(m.key))
            .reduce((sum, b) => sum + (b.paymentAmount || 0), 0)
    );

    const maxVal = Math.max(...monthTotals, 100);
    const barWidth = Math.min(60, (w - 80) / 6 - 20);
    const chartLeft = 50;
    const chartBottom = h - 40;
    const chartTop = 20;
    const chartHeight = chartBottom - chartTop;

    ctx.fillStyle = '#777';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxVal * i / 4);
        const y = chartBottom - (chartHeight * i / 4);
        ctx.fillText(`$${val}`, chartLeft - 8, y + 4);
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    const gap = (w - chartLeft) / 6;
    months.forEach((m, i) => {
        const x = chartLeft + gap * i + (gap - barWidth) / 2;
        const barH = maxVal > 0 ? (monthTotals[i] / maxVal) * chartHeight : 0;
        const y = chartBottom - barH;

        const gradient = ctx.createLinearGradient(x, y, x, chartBottom);
        gradient.addColorStop(0, '#2d6a4f');
        gradient.addColorStop(1, '#52b788');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        if (monthTotals[i] > 0) {
            ctx.fillStyle = '#1a1a2e';
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`$${monthTotals[i]}`, x + barWidth / 2, y - 6);
        }

        ctx.fillStyle = '#777';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.label, x + barWidth / 2, chartBottom + 20);
    });
};

// ========================================
// Settings View
// ========================================
const renderSettings = () => {
    renderServicesSettings();
    renderBusinessSettings();
};

const renderServicesSettings = () => {
    const listEl = document.getElementById('servicesList');
    if (!listEl) return;

    const services = Store.getAll('services');

    if (services.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No services configured.</p>';
        return;
    }

    listEl.innerHTML = services.map(s => `
        <div class="service-setting-card" data-id="${s.id}">
            <div class="service-setting-color" style="background:${s.color}"></div>
            <div class="service-setting-icon">${s.icon}</div>
            <div class="service-setting-info">
                <strong>${escapeHtml(s.name)}</strong>
                <span>$${s.price}/${s.unit} — ${escapeHtml(s.duration)}</span>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${s.enabled ? 'checked' : ''} data-id="${s.id}" class="service-toggle">
                <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-icon btn-sm service-edit-btn" data-id="${s.id}" title="Edit">✏️</button>
        </div>
    `).join('');

    listEl.querySelectorAll('.service-toggle').forEach(toggle => {
        toggle.addEventListener('change', () => {
            Store.update('services', toggle.dataset.id, { enabled: toggle.checked });
        });
    });

    listEl.querySelectorAll('.service-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openServiceModal(btn.dataset.id);
        });
    });
};

const renderBusinessSettings = () => {
    const nameInput = document.getElementById('businessNameInput');
    const pinInput = document.getElementById('ownerPinInput');
    if (nameInput) nameInput.value = Store.data.settings.businessName || '';
    if (pinInput) pinInput.value = Store.data.owner.pin || '';
};

document.getElementById('addServiceBtn')?.addEventListener('click', () => openServiceModal());

document.getElementById('saveBusinessSettings')?.addEventListener('click', () => {
    const name = document.getElementById('businessNameInput')?.value.trim();
    const pin = document.getElementById('ownerPinInput')?.value.trim();

    if (name) Store.data.settings.businessName = name;
    if (pin && pin.length >= 4) {
        // Check PIN not used by employee
        const empPins = Store.getAll('employees').map(e => e.pin);
        if (empPins.includes(pin)) {
            alert('This PIN is already used by an employee.');
            return;
        }
        Store.data.owner.pin = pin;
    }
    Store.save();
    alert('Settings saved!');
});

// ========================================
// Service Modal
// ========================================
const serviceModal = document.getElementById('serviceModal');
const serviceForm = document.getElementById('serviceForm');

const openServiceModal = (serviceId) => {
    if (!serviceForm) return;
    serviceForm.reset();
    document.getElementById('serviceIdField').value = '';
    document.getElementById('serviceModalTitle').textContent = 'New Service';
    document.getElementById('serviceDelete').style.display = 'none';
    document.getElementById('svcColor').value = '#6c5ce7';
    document.getElementById('svcEnabled').checked = true;

    if (serviceId) {
        const s = Store.getById('services', serviceId);
        if (!s) return;
        document.getElementById('serviceModalTitle').textContent = 'Edit Service';
        document.getElementById('serviceIdField').value = s.id;
        document.getElementById('serviceDelete').style.display = 'inline-flex';
        document.getElementById('svcName').value = s.name || '';
        document.getElementById('svcPrice').value = s.price || 0;
        document.getElementById('svcUnit').value = s.unit || 'day';
        document.getElementById('svcDuration').value = s.duration || '';
        document.getElementById('svcColor').value = s.color || '#6c5ce7';
        document.getElementById('svcIcon').value = s.icon || '';
        document.getElementById('svcDesc').value = s.description || '';
        document.getElementById('svcEnabled').checked = s.enabled !== false;
    }

    serviceModal.classList.add('active');
};

serviceForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(serviceForm);
    const data = Object.fromEntries(fd);
    const id = data.serviceId;
    delete data.serviceId;
    data.price = parseFloat(data.price) || 0;
    data.enabled = document.getElementById('svcEnabled').checked;

    if (id) {
        Store.update('services', id, data);
    } else {
        Store.add('services', data);
    }

    closeModal(serviceModal);
    renderSettings();
});

document.getElementById('serviceDelete')?.addEventListener('click', () => {
    const id = document.getElementById('serviceIdField').value;
    if (id && confirm('Delete this service?')) {
        Store.remove('services', id);
        closeModal(serviceModal);
        renderSettings();
    }
});

document.getElementById('serviceModalClose')?.addEventListener('click', () => closeModal(serviceModal));
document.getElementById('serviceCancel')?.addEventListener('click', () => closeModal(serviceModal));

// ========================================
// Employee "Today" View
// ========================================
const renderToday = () => {
    const listEl = document.getElementById('todayList');
    if (!listEl) return;

    const today = todayStr();
    const empId = AUTH.employeeId();

    const bookings = Store.getBookingsForDate(today).filter(b => b.employeeId === empId && b.status !== 'cancelled');
    const tasks = Store.getAll('tasks').filter(t => t.employeeId === empId && t.status !== 'done');

    if (bookings.length === 0 && tasks.length === 0) {
        listEl.innerHTML = '<p class="empty-state">Nothing scheduled for today. Enjoy your day!</p>';
        return;
    }

    let html = '';

    if (bookings.length > 0) {
        html += '<h4 class="today-section-title">Today\'s Bookings</h4>';
        html += bookings.map(b => {
            const client = Store.getById('clients', b.clientId);
            const dog = Store.getById('dogs', b.dogId);
            return `
                <div class="today-item">
                    <span class="today-item-icon" style="background:${getServiceColor(b.serviceId)}">${getServiceIcon(b.serviceId)}</span>
                    <div class="today-item-info">
                        <strong>${escapeHtml(dog?.name || 'Unknown')} — ${getServiceLabel(b.serviceId)}</strong>
                        <span>${escapeHtml(client?.name || 'Unknown')} | ${escapeHtml(client?.phone || '')}</span>
                        ${b.notes ? `<span class="today-item-notes">${escapeHtml(b.notes)}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    if (tasks.length > 0) {
        html += '<h4 class="today-section-title" style="margin-top:24px">Active Tasks</h4>';
        html += tasks.map(t => `
            <div class="today-item">
                <span class="today-item-icon" style="background:var(--color-primary)">✅</span>
                <div class="today-item-info">
                    <strong>${escapeHtml(t.title)}</strong>
                    ${t.description ? `<span>${escapeHtml(t.description)}</span>` : ''}
                    ${t.dueDate ? `<span>Due: ${formatDateShort(t.dueDate)}</span>` : ''}
                </div>
                <span class="priority-badge ${t.priority}">${t.priority}</span>
            </div>
        `).join('');
    }

    listEl.innerHTML = html;
};

// ========================================
// Modal Helpers
// ========================================
const closeModal = (modal) => {
    if (modal) modal.classList.remove('active');
};

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m));
    }
});

// ========================================
// Refresh All
// ========================================
const refreshAll = () => {
    const activePanel = document.querySelector('.dash-nav-btn.active:not(.dash-logout-btn)')?.dataset.panel;
    if (activePanel) switchPanel(activePanel);
};

// ========================================
// Public Form → Pending Booking Bridge
// ========================================
window.createBookingFromForm = (formData) => {
    let client = Store.getAll('clients').find(c =>
        c.email === formData.email || c.name.toLowerCase() === formData.ownerName.toLowerCase()
    );

    if (!client) {
        client = Store.add('clients', {
            name: formData.ownerName,
            email: formData.email,
            phone: formData.phone || '',
            address: '',
            notes: ''
        });
    }

    let dog = Store.getDogsForClient(client.id).find(d =>
        d.name.toLowerCase() === (formData.dogName || '').toLowerCase()
    );

    if (!dog && formData.dogName) {
        dog = Store.add('dogs', {
            clientId: client.id,
            name: formData.dogName,
            breed: formData.breed || '',
            size: '', age: '', specialNeeds: '', vetInfo: ''
        });
    }

    // Map old service keys to serviceId
    const serviceMap = { overnight: 'svc-overnight', walking: 'svc-walking', dropin: 'svc-dropin', daycare: 'svc-daycare' };
    const serviceId = serviceMap[formData.service] || formData.service || '';
    const startDate = formData.startDate || todayStr();
    const endDate = formData.endDate || startDate;
    const amount = calcAmount(serviceId, startDate, endDate);

    Store.add('bookings', {
        clientId: client.id,
        dogId: dog?.id || '',
        serviceId,
        employeeId: '',
        startDate,
        endDate,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentAmount: amount,
        paidDate: '',
        notes: formData.message || ''
    });
};

// ========================================
// Init
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Setup login form
    document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
    document.getElementById('pinInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Try to restore session
    if (AUTH.restore()) {
        // If they were on dashboard, init it
        const savedView = localStorage.getItem('pawsView');
        if (savedView === 'dashboard') {
            document.body.classList.add('dashboard-active');
            initDashboard();
        }
    }
});
