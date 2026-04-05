// ============================================
// GenusPupClub — Auth System
// Client signup/login with localStorage
// ============================================

const GPC = 'gpc_';
const loadGPC = (key, fb) => { try { return JSON.parse(localStorage.getItem(GPC + key)) || fb; } catch { return fb; } };
const saveGPC = (key, d) => {
    localStorage.setItem(GPC + key, JSON.stringify(d));
    if (typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected()) {
        GPC_SUPABASE.save(key, d).catch(() => {});
    }
};

const switchTab = (tab) => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelector(`.auth-tab:${tab === 'login' ? 'first-child' : 'last-child'}`).classList.add('active');
    document.getElementById(tab === 'login' ? 'loginForm' : 'signupForm').classList.add('active');
    hideMessages();
};

const showError = (msg) => { const el = document.getElementById('authError'); el.textContent = msg; el.style.display = 'block'; document.getElementById('authSuccess').style.display = 'none'; };
const showSuccess = (msg) => { const el = document.getElementById('authSuccess'); el.textContent = msg; el.style.display = 'block'; document.getElementById('authError').style.display = 'none'; };
const hideMessages = () => { document.getElementById('authError').style.display = 'none'; document.getElementById('authSuccess').style.display = 'none'; };

// Simple hash (not cryptographic — for demo/MVP only)
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
};

const handleSignup = (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const phone = document.getElementById('signupPhone').value.trim();
    const pass = document.getElementById('signupPass').value;
    const dog = document.getElementById('signupDog').value.trim();

    if (!name || !email || !pass) { showError('Please fill in all required fields'); return; }
    if (pass.length < 6) { showError('Password must be at least 6 characters'); return; }

    const users = loadGPC('users', []);
    if (users.find(u => u.email === email)) {
        showError('An account with this email already exists. Please log in instead.');
        switchTab('login');
        document.getElementById('loginEmail').value = email;
        return;
    }

    const userId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    users.push({
        id: userId, name, email, phone,
        passwordHash: simpleHash(pass),
        createdAt: new Date().toISOString(),
        role: 'client'
    });
    saveGPC('users', users);

    // Also add as client in dashboard
    const clients = loadGPC('clients', []);
    if (!clients.find(c => c.email === email)) {
        clients.push({ id: userId, name, email, phone, address: '', source: 'Self-Signup', notes: '' });
        saveGPC('clients', clients);
    }

    // Add pet if provided
    if (dog) {
        const pets = loadGPC('pets', []);
        pets.push({ id: Date.now().toString(36), name: dog, breed: '', age: '', weight: '', clientId: userId, tags: '', notes: '' });
        saveGPC('pets', pets);
    }

    // Send welcome email
    if (typeof GPC_NOTIFY !== 'undefined') {
        GPC_NOTIFY.sendEmail('welcome', { name, email, clientEmail: email });
    }

    // Redirect to waiver with pre-filled info
    const waiverUrl = `waiver.html?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone || '')}&fromSignup=true`;
    showSuccess('Account created! Redirecting to service agreement...');
    setTimeout(() => {
        window.location.href = waiverUrl;
    }, 1000);
};

const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;

    const users = loadGPC('users', []);
    const passHash = simpleHash(pass);
    let user = users.find(u => u.email === email && u.passwordHash === passHash);

    // Fallback: match against plainPassword for accounts created before passwordHash fix
    if (!user) {
        user = users.find(u => u.email === email && u.plainPassword === pass);
        // Migrate: store passwordHash so future logins use the hash
        if (user) {
            user.passwordHash = passHash;
            delete user.plainPassword;
            saveGPC('users', users);
        }
    }

    if (!user) { showError('Invalid email or password'); return; }

    // Save session
    sessionStorage.setItem('gpc_client_auth', JSON.stringify({
        id: user.id, name: user.name, email: user.email, role: 'client', ts: Date.now()
    }));

    window.location.href = 'portal.html';
};

// Check if already logged in
const existingSession = sessionStorage.getItem('gpc_client_auth');
if (existingSession) {
    try {
        const session = JSON.parse(existingSession);
        if (session.ts && Date.now() - session.ts < 86400000) { // 24hr session
            window.location.href = 'portal.html';
        }
    } catch {}
}
