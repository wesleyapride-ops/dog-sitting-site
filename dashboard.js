// ========================================
// Data Layer — localStorage CRUD
// ========================================
const STORAGE_KEY = 'pawsAndStay';

const DOG_BREEDS = [
    'Labrador Retriever','Golden Retriever','German Shepherd','Bulldog','Beagle','Poodle','Rottweiler','Yorkshire Terrier',
    'Boxer','Dachshund','Siberian Husky','Great Dane','Doberman Pinscher','Australian Shepherd','Cavalier King Charles Spaniel',
    'Shih Tzu','Boston Terrier','Bernese Mountain Dog','Pomeranian','Havanese','Shetland Sheepdog','Brittany','English Springer Spaniel',
    'Cocker Spaniel','Miniature Schnauzer','Border Collie','Vizsla','Maltese','Chihuahua','Pug','Weimaraner','Rhodesian Ridgeback',
    'Collie','Basset Hound','Newfoundland','Bichon Frise','Belgian Malinois','West Highland White Terrier','Papillon','Bloodhound',
    'Akita','Samoyed','Whippet','Bull Terrier','Cane Corso','Dalmatian','Italian Greyhound','French Bulldog','Corgi','Pit Bull',
    'Other'
];

const CAT_BREEDS = [
    'Domestic Shorthair','Domestic Longhair','Siamese','Persian','Maine Coon','Ragdoll','Bengal','Abyssinian','Sphynx','Russian Blue',
    'Scottish Fold','British Shorthair','Birman','Oriental Shorthair','Devon Rex','Burmese','Tonkinese','Norwegian Forest Cat',
    'Turkish Angora','Himalayan','Other'
];

const PET_SIZES = [
    { value: 'tiny', label: 'Tiny (under 10 lbs)' },
    { value: 'small', label: 'Small (10-25 lbs)' },
    { value: 'medium', label: 'Medium (25-50 lbs)' },
    { value: 'large', label: 'Large (50-100 lbs)' },
    { value: 'xlarge', label: 'X-Large (100+ lbs)' }
];

const ALLERGY_OPTIONS = ['Chicken', 'Beef', 'Grain', 'Flea Meds', 'Dairy', 'Fish'];
const TEMPERAMENT_OPTIONS = ['Friendly', 'Shy', 'Anxious', 'Energetic', 'Calm', 'Aggressive with dogs', 'Aggressive with cats'];
const TENDENCY_OPTIONS = ['Chewer', 'Digger', 'Jumper', 'Barker', 'Escape Artist', 'Resource Guarder', 'Separation Anxiety'];
const FEEDING_SCHEDULES = ['1x/day', '2x/day', '3x/day', 'Free feed'];
const HOUSE_TRAINING_OPTIONS = ['Fully trained', 'Mostly trained', 'In progress', 'Not trained'];

const DEFAULT_HOLIDAYS = [
    { id: 'hol-christmas', name: 'Christmas', startMonth: 12, startDay: 23, endMonth: 12, endDay: 26, multiplier: 1.5 },
    { id: 'hol-newyear', name: "New Year's", startMonth: 12, startDay: 30, endMonth: 1, endDay: 2, multiplier: 1.5 },
    { id: 'hol-july4', name: 'July 4th', startMonth: 7, startDay: 3, endMonth: 7, endDay: 5, multiplier: 1.5 },
    { id: 'hol-thanksgiving', name: 'Thanksgiving', startMonth: 11, startDay: 25, endMonth: 11, endDay: 29, multiplier: 1.5 },
    { id: 'hol-memorial', name: 'Memorial Day', startMonth: 5, startDay: 24, endMonth: 5, endDay: 27, multiplier: 1.5 },
    { id: 'hol-labor', name: 'Labor Day', startMonth: 9, startDay: 1, endMonth: 9, endDay: 3, multiplier: 1.5 }
];

const DEFAULT_ADDONS = [
    { id: 'addon-bath', name: 'Bath', price: 15, icon: '🛁', enabled: true },
    { id: 'addon-nail', name: 'Nail Trim', price: 10, icon: '✂️', enabled: true },
    { id: 'addon-teeth', name: 'Teeth Brushing', price: 8, icon: '🪥', enabled: true },
    { id: 'addon-groom', name: 'Full Groom', price: 45, icon: '💇', enabled: true }
];

const DEFAULT_FAQ = [
    { q: 'What happens during a typical day?', a: 'Your pet enjoys a structured day with walks, playtime, meals, rest periods, and lots of love. We follow your pet\'s normal routine as closely as possible.' },
    { q: 'What if my pet has special dietary needs?', a: 'We accommodate all dietary requirements. Just let us know your pet\'s specific food, portions, and schedule, and we\'ll follow it exactly.' },
    { q: 'Are you insured?', a: 'Yes! We are fully insured and bonded, and all team members are background checked and Pet First Aid certified.' },
    { q: 'How do you handle emergencies?', a: 'We have an emergency protocol in place and will contact you immediately. We keep your vet\'s information on file and have a 24/7 emergency vet nearby.' },
    { q: 'Can I see photos of my pet during their stay?', a: 'Absolutely! We send daily photo and video updates so you can see your pet having a great time.' },
    { q: 'Do you accept cats?', a: 'Yes! We love cats too. We provide separate, quiet spaces for feline guests with all the comforts of home.' },
    { q: 'What are your holiday rates?', a: 'Holiday periods have a 1.5x rate multiplier. This includes major holidays like Christmas, New Year\'s, July 4th, Thanksgiving, Memorial Day, and Labor Day.' },
    { q: 'What bathing/grooming services do you offer?', a: 'We offer Bath ($15), Nail Trim ($10), Teeth Brushing ($8), and Full Groom ($45) as add-ons to any booking.' }
];

const defaultServices = [
    { id: 'svc-overnight', name: 'Overnight Sitting', price: 55, unit: 'night', duration: 'Overnight', color: '#6c5ce7', icon: '🏠', description: '24/7 care in a home environment', features: ['Feeding & fresh water', 'Multiple walks per day', 'Bedtime cuddles', 'Daily photo updates'], enabled: true, createdAt: new Date().toISOString() },
    { id: 'svc-walking', name: 'Dog Walking', price: 25, unit: 'walk', duration: '30 min', color: '#00b894', icon: '🚶', description: 'Neighborhood walks tailored to your dog', features: ['30 or 60 minute walks', 'GPS-tracked routes', 'Post-walk report', 'Fresh water provided'], enabled: true, createdAt: new Date().toISOString() },
    { id: 'svc-dropin', name: 'Drop-In Visit', price: 20, unit: 'visit', duration: '30 min', color: '#fdcb6e', icon: '👋', description: 'Quick home visit for feeding and potty', features: ['30-minute home visits', 'Feeding & medication', 'Potty break & play', 'Mail & plant care'], enabled: true, createdAt: new Date().toISOString() },
    { id: 'svc-daycare', name: 'Doggy Daycare', price: 40, unit: 'day', duration: 'Full day', color: '#e17055', icon: '🎉', description: 'Full day of supervised play and socialization', features: ['All-day supervision', 'Structured play & rest', 'Socialization time', 'Lunch included'], enabled: true, createdAt: new Date().toISOString() }
];

const defaultData = () => ({
    owner: { pin: '1234' },
    employees: [],
    clients: [],
    dogs: [],
    services: [...defaultServices],
    bookings: [],
    tasks: [],
    messages: [],
    reviews: [],
    settings: {
        businessName: 'GenusPupClub.com',
        holidayRates: [...DEFAULT_HOLIDAYS],
        addons: [...DEFAULT_ADDONS],
        faq: [...DEFAULT_FAQ],
        // Price customization
        sizeSurcharges: { tiny: 0, small: 0, medium: 0, large: 10, xlarge: 20 },
        breedSurcharges: [
            { id: 'bs-giant', label: 'Giant Breeds', breeds: ['Great Dane', 'Newfoundland', 'Saint Bernard', 'Mastiff'], surcharge: 15 },
            { id: 'bs-brachy', label: 'Brachycephalic (Flat-face)', breeds: ['Bulldog', 'French Bulldog', 'Pug', 'Boston Terrier', 'Shih Tzu'], surcharge: 5 },
            { id: 'bs-highenergy', label: 'High Energy', breeds: ['Border Collie', 'Australian Shepherd', 'Siberian Husky', 'Belgian Malinois', 'Vizsla', 'Weimaraner'], surcharge: 5 }
        ],
        puppySurcharge: 5,
        multiPetDiscount: 15,
        // Loyalty program
        loyaltyEnabled: true,
        loyaltyTiers: [
            { name: 'New', minBookings: 0, discount: 0, color: '#999', icon: '🐾' },
            { name: 'Bronze', minBookings: 3, discount: 5, color: '#CD7F32', icon: '🥉' },
            { name: 'Silver', minBookings: 8, discount: 8, color: '#C0C0C0', icon: '🥈' },
            { name: 'Gold', minBookings: 15, discount: 12, color: '#FFD700', icon: '🥇' },
            { name: 'Platinum', minBookings: 25, discount: 15, color: '#B4C7DC', icon: '💎' }
        ],
        // Referral program
        referralEnabled: true,
        referralRewardReferrer: 15,
        referralRewardReferee: 10,
        // Discount codes
        discountCodes: []
    }
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
        if (!this._data.services || this._data.services.length === 0) {
            this._data.services = [...defaultServices];
        }
        if (!this._data.owner) this._data.owner = { pin: '1234' };
        if (!this._data.tasks) this._data.tasks = [];
        if (!this._data.messages) this._data.messages = [];
        if (!this._data.reviews) this._data.reviews = [];
        if (!this._data.settings.holidayRates) this._data.settings.holidayRates = [...DEFAULT_HOLIDAYS];
        if (!this._data.settings.addons) this._data.settings.addons = [...DEFAULT_ADDONS];
        if (!this._data.settings.faq) this._data.settings.faq = [...DEFAULT_FAQ];
        if (!this._data.settings.sizeSurcharges) this._data.settings.sizeSurcharges = { tiny: 0, small: 0, medium: 0, large: 10, xlarge: 20 };
        if (!this._data.settings.breedSurcharges) this._data.settings.breedSurcharges = [];
        if (this._data.settings.puppySurcharge === undefined) this._data.settings.puppySurcharge = 5;
        if (this._data.settings.multiPetDiscount === undefined) this._data.settings.multiPetDiscount = 15;
        if (this._data.settings.loyaltyEnabled === undefined) this._data.settings.loyaltyEnabled = true;
        if (!this._data.settings.loyaltyTiers) this._data.settings.loyaltyTiers = defaultData().settings.loyaltyTiers;
        if (this._data.settings.referralEnabled === undefined) this._data.settings.referralEnabled = true;
        if (this._data.settings.referralRewardReferrer === undefined) this._data.settings.referralRewardReferrer = 15;
        if (this._data.settings.referralRewardReferee === undefined) this._data.settings.referralRewardReferee = 10;
        if (!this._data.settings.discountCodes) this._data.settings.discountCodes = [];
        // Migrate clients for referral codes and loyalty
        (this._data.clients || []).forEach(c => {
            if (!c.referralCode) c.referralCode = 'REF-' + (c.id || '').slice(0, 6).toUpperCase();
            if (!c.referredBy) c.referredBy = '';
            if (!c.referralCredits) c.referralCredits = 0;
            if (!c.tags) c.tags = [];
            if (!c.notes) c.notes = '';
        });

        // Migrate services to include features array
        this._data.services.forEach(s => {
            if (!s.features) s.features = [];
        });

        // Migrate old bookings
        this._data.bookings.forEach(b => {
            if (b.service && !b.serviceId) {
                const svc = this._data.services.find(s => s.id === `svc-${b.service}` || s.name.toLowerCase().includes(b.service));
                b.serviceId = svc?.id || '';
                delete b.service;
            }
            if (!b.addons) b.addons = [];
        });

        // Migrate dogs to include petType and profile fields
        this._data.dogs.forEach(d => {
            if (!d.petType) d.petType = 'dog';
            if (!d.allergies) d.allergies = [];
            if (!d.temperament) d.temperament = [];
            if (!d.tendencies) d.tendencies = [];
            if (!d.photos) d.photos = [];
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

    getPetsForClient(clientId) {
        return this.getDogsForClient(clientId);
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
    getEmployeeById(id) { return this.getById('employees', id); },

    getMessagesForClient(clientId) {
        return this.getAll('messages').filter(m => m.clientId === clientId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },

    getFeaturedReviews() {
        return this.getAll('reviews').filter(r => r.featured);
    },

    getEnabledAddons() {
        return (this.data.settings.addons || []).filter(a => a.enabled);
    },

    // Loyalty & Referral Methods
    getClientCompletedBookings(clientId) {
        return this.getAll('bookings').filter(b => b.clientId === clientId && b.status === 'completed').length;
    },

    getClientTotalBookings(clientId) {
        return this.getAll('bookings').filter(b => b.clientId === clientId && b.status !== 'cancelled').length;
    },

    getClientLoyaltyTier(clientId) {
        const count = this.getClientCompletedBookings(clientId);
        const tiers = [...(this.data.settings.loyaltyTiers || [])].sort((a, b) => b.minBookings - a.minBookings);
        return tiers.find(t => count >= t.minBookings) || tiers[tiers.length - 1] || { name: 'New', discount: 0, color: '#999', icon: '🐾' };
    },

    getClientByReferralCode(code) {
        return this.getAll('clients').find(c => c.referralCode === code);
    },

    getClientReferrals(clientId) {
        const client = this.getById('clients', clientId);
        if (!client) return [];
        return this.getAll('clients').filter(c => c.referredBy === client.referralCode);
    },

    getActiveDiscountCode(code) {
        const now = new Date().toISOString();
        return (this.data.settings.discountCodes || []).find(d =>
            d.code.toUpperCase() === code.toUpperCase() && d.active && (!d.expiresAt || d.expiresAt >= now.split('T')[0])
        );
    },

    getSizeSurcharge(size) {
        return (this.data.settings.sizeSurcharges || {})[size] || 0;
    },

    getBreedSurcharge(breed) {
        const categories = this.data.settings.breedSurcharges || [];
        for (const cat of categories) {
            if ((cat.breeds || []).some(b => b.toLowerCase() === (breed || '').toLowerCase())) {
                return { amount: cat.surcharge || 0, label: cat.label };
            }
        }
        return { amount: 0, label: '' };
    },

    getAlerts() {
        const alerts = [];
        const today = todayStr();
        const tomorrow = toDateStr(new Date(Date.now() + 86400000));
        const bookings = this.getAll('bookings');
        const clients = this.getAll('clients');

        // Upcoming bookings (next 48hrs)
        const upcoming = bookings.filter(b =>
            b.status === 'confirmed' && b.startDate >= today && b.startDate <= tomorrow
        );
        upcoming.forEach(b => {
            const client = this.getById('clients', b.clientId);
            const pet = this.getById('dogs', b.dogId);
            alerts.push({
                type: 'upcoming', icon: '📅', priority: 'high',
                title: `Upcoming: ${pet?.name || 'Pet'} — ${getServiceLabel(b.serviceId)}`,
                detail: `${client?.name || 'Client'} | ${formatDate(b.startDate)}`,
                id: b.id
            });
        });

        // Overdue payments
        const overdue = bookings.filter(b =>
            b.paymentStatus !== 'paid' && b.status === 'completed' && b.endDate < today
        );
        overdue.forEach(b => {
            const client = this.getById('clients', b.clientId);
            alerts.push({
                type: 'payment', icon: '💰', priority: 'high',
                title: `Overdue: $${b.paymentAmount || 0} from ${client?.name || 'Client'}`,
                detail: `Booking ended ${formatDate(b.endDate)}`,
                id: b.id
            });
        });

        // Pending bookings needing confirmation
        const pending = bookings.filter(b => b.status === 'pending');
        pending.forEach(b => {
            const client = this.getById('clients', b.clientId);
            alerts.push({
                type: 'pending', icon: '⏳', priority: 'medium',
                title: `Pending booking from ${client?.name || 'Client'}`,
                detail: `${formatDate(b.startDate)} — needs confirmation`,
                id: b.id
            });
        });

        // Loyalty milestones (clients near next tier)
        const tiers = [...(this.data.settings.loyaltyTiers || [])].sort((a, b) => a.minBookings - b.minBookings);
        clients.forEach(c => {
            const count = this.getClientCompletedBookings(c.id);
            for (const tier of tiers) {
                const diff = tier.minBookings - count;
                if (diff > 0 && diff <= 2) {
                    alerts.push({
                        type: 'loyalty', icon: '⭐', priority: 'low',
                        title: `${c.name} is ${diff} booking${diff > 1 ? 's' : ''} from ${tier.name}!`,
                        detail: `${count} completed bookings — ${tier.name} at ${tier.minBookings}`,
                        id: c.id
                    });
                    break;
                }
            }
        });

        // Unread messages
        const unreadCount = this.getAll('messages').filter(m => !m.read && m.sender === 'client').length;
        if (unreadCount > 0) {
            alerts.push({
                type: 'message', icon: '💬', priority: 'medium',
                title: `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`,
                detail: 'Check your inbox',
                id: 'messages'
            });
        }

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        return alerts;
    }
};

Store.load();

// ========================================
// Auth State
// ========================================
let currentUser = null;

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

const getPetIcon = (petType) => petType === 'cat' ? '🐱' : '🐕';

// Holiday rate calculation
const isHolidayDate = (dateStr) => {
    const holidays = Store.data.settings.holidayRates || [];
    const d = new Date(dateStr + 'T00:00:00');
    const month = d.getMonth() + 1;
    const day = d.getDate();

    for (const h of holidays) {
        if (h.startMonth <= h.endMonth) {
            if ((month > h.startMonth || (month === h.startMonth && day >= h.startDay)) &&
                (month < h.endMonth || (month === h.endMonth && day <= h.endDay))) {
                return h;
            }
        } else {
            // Wraps around year (e.g., Dec 30 - Jan 2)
            if ((month > h.startMonth || (month === h.startMonth && day >= h.startDay)) ||
                (month < h.endMonth || (month === h.endMonth && day <= h.endDay))) {
                return h;
            }
        }
    }
    return null;
};

const calcAmount = (serviceId, startDate, endDate, addonIds = [], options = {}) => {
    // options: { petSize, petBreed, isPuppy, numPets, clientId, discountCode }
    const svc = Store.getServiceById(serviceId);
    if (!svc) return { total: 0, breakdown: [] };
    const rate = svc.price || 0;
    const breakdown = [];

    // Base service cost with holiday calculation
    let baseCost = rate;
    let numUnits = 1;
    let regularDays = 0;
    let holidayDays = 0;
    let holidayMultiplier = 1.5;

    if (startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        numUnits = Math.max(1, Math.round((end - start) / 86400000) + (svc.unit === 'night' ? 0 : 1));

        for (let i = 0; i < numUnits; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const ds = toDateStr(d);
            const hol = isHolidayDate(ds);
            if (hol) { holidayDays++; holidayMultiplier = hol.multiplier || 1.5; }
            else { regularDays++; }
        }

        if (regularDays > 0) {
            const amt = rate * regularDays;
            breakdown.push({ label: `${svc.icon} ${svc.name} x ${regularDays} ${svc.unit}${regularDays > 1 ? 's' : ''}`, amount: amt });
            baseCost = amt;
        }
        if (holidayDays > 0) {
            const amt = rate * holidayMultiplier * holidayDays;
            breakdown.push({ label: `${svc.icon} ${svc.name} x ${holidayDays} ${svc.unit}${holidayDays > 1 ? 's' : ''} (Holiday ${holidayMultiplier}x)`, amount: amt });
            baseCost = (baseCost || 0) + amt;
        }
        if (regularDays === 0 && holidayDays === 0) {
            breakdown.push({ label: `${svc.icon} ${svc.name}`, amount: rate });
            baseCost = rate;
        }
    } else {
        breakdown.push({ label: `${svc.icon} ${svc.name} — $${rate}/${svc.unit}`, amount: rate });
        baseCost = rate;
    }

    let subtotal = baseCost;

    // Size surcharge (per unit)
    const sizeSurcharge = Store.getSizeSurcharge(options.petSize);
    if (sizeSurcharge > 0) {
        const sizeAmt = sizeSurcharge * (numUnits || 1);
        breakdown.push({ label: `📏 Size surcharge (${options.petSize}) x ${numUnits || 1}`, amount: sizeAmt });
        subtotal += sizeAmt;
    }

    // Breed surcharge (per unit)
    const breedInfo = Store.getBreedSurcharge(options.petBreed);
    if (breedInfo.amount > 0) {
        const breedAmt = breedInfo.amount * (numUnits || 1);
        breakdown.push({ label: `🐕 Breed surcharge (${breedInfo.label}) x ${numUnits || 1}`, amount: breedAmt });
        subtotal += breedAmt;
    }

    // Puppy/kitten surcharge (flat per booking)
    if (options.isPuppy && Store.data.settings.puppySurcharge > 0) {
        const puppyAmt = Store.data.settings.puppySurcharge;
        breakdown.push({ label: '🍼 Puppy/kitten surcharge', amount: puppyAmt });
        subtotal += puppyAmt;
    }

    // Add-ons
    const allAddons = Store.data.settings.addons || [];
    (addonIds || []).forEach(aid => {
        const addon = allAddons.find(a => a.id === aid);
        if (addon) {
            breakdown.push({ label: `${addon.icon} ${addon.name}`, amount: addon.price });
            subtotal += addon.price;
        }
    });

    // Multi-pet multiplier
    const numPets = parseInt(options.numPets) || 1;
    if (numPets > 1) {
        const discountPct = Store.data.settings.multiPetDiscount || 15;
        const extraPets = numPets - 1;
        const extraCost = baseCost * extraPets;
        const discountAmt = extraCost * (discountPct / 100);
        breakdown.push({ label: `🐾 ${extraPets} additional pet${extraPets > 1 ? 's' : ''} (+${100 - discountPct}% each)`, amount: extraCost - discountAmt });
        subtotal += extraCost - discountAmt;
    }

    // Loyalty discount
    if (options.clientId && Store.data.settings.loyaltyEnabled) {
        const tier = Store.getClientLoyaltyTier(options.clientId);
        if (tier.discount > 0) {
            const loyaltyAmt = subtotal * (tier.discount / 100);
            breakdown.push({ label: `${tier.icon} ${tier.name} loyalty (−${tier.discount}%)`, amount: -loyaltyAmt, isDiscount: true });
            subtotal -= loyaltyAmt;
        }
    }

    // Referral credit
    if (options.clientId) {
        const client = Store.getById('clients', options.clientId);
        if (client?.referralCredits > 0) {
            const creditUsed = Math.min(client.referralCredits, subtotal);
            if (creditUsed > 0) {
                breakdown.push({ label: '🎁 Referral credit', amount: -creditUsed, isDiscount: true });
                subtotal -= creditUsed;
            }
        }
    }

    // Discount code
    if (options.discountCode) {
        const disc = Store.getActiveDiscountCode(options.discountCode);
        if (disc) {
            let discAmt = 0;
            if (disc.type === 'percent') {
                discAmt = subtotal * (disc.value / 100);
                breakdown.push({ label: `🏷️ Promo: ${disc.code} (−${disc.value}%)`, amount: -discAmt, isDiscount: true });
            } else {
                discAmt = Math.min(disc.value, subtotal);
                breakdown.push({ label: `🏷️ Promo: ${disc.code} (−$${disc.value})`, amount: -discAmt, isDiscount: true });
            }
            subtotal -= discAmt;
        }
    }

    const total = Math.max(0, Math.round(subtotal * 100) / 100);
    return { total, breakdown };
};

// Legacy-compatible wrapper (returns just the number)
const calcAmountSimple = (serviceId, startDate, endDate, addonIds = [], options = {}) => {
    return calcAmount(serviceId, startDate, endDate, addonIds, options).total;
};

const bookingHasHoliday = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const days = Math.round((end - start) / 86400000) + 1;
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        if (isHolidayDate(toDateStr(d))) return true;
    }
    return false;
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
        document.body.classList.add('dashboard-active');
        localStorage.setItem('pawsView', 'dashboard');
        window.scrollTo(0, 0);
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
        const alertCount = Store.getAlerts().length;
        nav.innerHTML = `
            <button class="dash-nav-btn active" data-panel="calendar"><span class="dash-nav-icon">📅</span><span class="dash-nav-label">Calendar</span></button>
            <button class="dash-nav-btn" data-panel="alerts"><span class="dash-nav-icon">🔔</span><span class="dash-nav-label">Alerts</span>${alertCount > 0 ? `<span class="nav-badge">${alertCount}</span>` : ''}</button>
            <button class="dash-nav-btn" data-panel="bookings"><span class="dash-nav-icon">📋</span><span class="dash-nav-label">Bookings</span></button>
            <button class="dash-nav-btn" data-panel="tasks"><span class="dash-nav-icon">✅</span><span class="dash-nav-label">Tasks</span></button>
            <button class="dash-nav-btn" data-panel="clients"><span class="dash-nav-icon">👥</span><span class="dash-nav-label">Clients</span></button>
            <button class="dash-nav-btn" data-panel="loyalty"><span class="dash-nav-icon">💎</span><span class="dash-nav-label">Loyalty</span></button>
            <button class="dash-nav-btn" data-panel="referrals"><span class="dash-nav-icon">🎁</span><span class="dash-nav-label">Referrals</span></button>
            <button class="dash-nav-btn" data-panel="messages"><span class="dash-nav-icon">💬</span><span class="dash-nav-label">Messages</span></button>
            <button class="dash-nav-btn" data-panel="reviews"><span class="dash-nav-icon">⭐</span><span class="dash-nav-label">Reviews</span></button>
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
            <button class="dash-nav-btn" data-panel="messages"><span class="dash-nav-icon">💬</span><span class="dash-nav-label">Messages</span></button>
            <button class="dash-nav-btn dash-logout-btn" id="logoutBtn"><span class="dash-nav-icon">🚪</span><span class="dash-nav-label">Log Out</span></button>
        `;
    }

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
        alerts: renderAlerts,
        bookings: renderBookings,
        tasks: renderTasks,
        clients: renderClients,
        loyalty: renderLoyalty,
        referrals: renderReferrals,
        employees: renderEmployees,
        payments: renderPayments,
        settings: renderSettings,
        today: renderToday,
        messages: renderMessages,
        reviews: renderReviews
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

    renderCalendarFilters();

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrev = new Date(calYear, calMonth, 0).getDate();

    const monthStart = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`;
    const monthEnd = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    let bookings = Store.getBookingsInRange(monthStart, monthEnd);

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

    // Holiday indicator
    if (isHolidayDate(dateStr)) el.classList.add('holiday');

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

    const holiday = isHolidayDate(calSelectedDate);
    dateEl.textContent = formatDate(calSelectedDate) + (holiday ? ` — ${holiday.name} (${holiday.multiplier}x rate)` : '');
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
        const hasHoliday = bookingHasHoliday(b.startDate, b.endDate);
        return `
            <div class="cal-detail-item" style="border-left-color:${svcColor}" data-id="${b.id}">
                <div class="detail-info">
                    <strong>${getServiceIcon(b.serviceId)} ${getPetIcon(dog?.petType)} ${escapeHtml(dog?.name || 'Unknown pet')} — ${getServiceLabel(b.serviceId)}</strong>
                    <span>${escapeHtml(client?.name || 'Unknown')} | ${formatDateShort(b.startDate)} – ${formatDateShort(b.endDate)}</span>
                    <span class="detail-employee" style="color:${empColor}">👷 ${escapeHtml(empName)}</span>
                    ${hasHoliday ? '<span class="holiday-badge">Holiday Rate</span>' : ''}
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
        const hasHoliday = bookingHasHoliday(b.startDate, b.endDate);
        const addonNames = (b.addons || []).map(aid => {
            const a = (Store.data.settings.addons || []).find(x => x.id === aid);
            return a ? a.name : '';
        }).filter(Boolean);
        return `
            <div class="booking-card" style="border-left-color:${svcColor}" data-id="${b.id}">
                <span class="booking-service-badge" style="background:${svcColor}20;color:${svcColor}">${getServiceIcon(b.serviceId)} ${getServiceLabel(b.serviceId)}</span>
                <div class="booking-info">
                    <strong>${getPetIcon(dog?.petType)} ${escapeHtml(dog?.name || 'Unknown pet')}</strong>
                    <span>${escapeHtml(client?.name || 'Unknown client')}</span>
                    ${addonNames.length > 0 ? `<span class="booking-addons">+ ${escapeHtml(addonNames.join(', '))}</span>` : ''}
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
                    ${hasHoliday ? '<span class="holiday-badge">Holiday</span>' : ''}
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
    renderAddonCheckboxes([]);

    if (bookingId) {
        const b = Store.getById('bookings', bookingId);
        if (!b) return;
        document.getElementById('bookingModalTitle').textContent = 'Edit Booking';
        document.getElementById('bookingId').value = b.id;
        document.getElementById('bookingDelete').style.display = 'inline-flex';

        document.getElementById('bkClient').value = b.clientId;
        populatePetDropdown(b.clientId);
        document.getElementById('bkPet').value = b.dogId;
        document.getElementById('bkService').value = b.serviceId || '';
        document.getElementById('bkEmployee').value = b.employeeId || '';
        document.getElementById('bkStatus').value = b.status;
        document.getElementById('bkStart').value = b.startDate;
        document.getElementById('bkEnd').value = b.endDate;
        document.getElementById('bkAmount').value = b.paymentAmount || '';
        document.getElementById('bkPayStatus').value = b.paymentStatus;
        document.getElementById('bkNotes').value = b.notes || '';
        renderAddonCheckboxes(b.addons || []);
    } else {
        populatePetDropdown(null);
        if (calSelectedDate) {
            document.getElementById('bkStart').value = calSelectedDate;
            document.getElementById('bkEnd').value = calSelectedDate;
        }
    }

    bookingModal.classList.add('active');
};

const renderAddonCheckboxes = (selectedAddons) => {
    const container = document.getElementById('bkAddonsContainer');
    if (!container) return;
    const addons = Store.getEnabledAddons();
    if (addons.length === 0) {
        container.innerHTML = '<span class="empty-state" style="padding:8px;font-size:0.85rem">No add-ons available</span>';
        return;
    }
    container.innerHTML = addons.map(a => `
        <label class="addon-checkbox">
            <input type="checkbox" name="addon" value="${a.id}" ${selectedAddons.includes(a.id) ? 'checked' : ''}>
            <span>${a.icon} ${escapeHtml(a.name)} (+$${a.price})</span>
        </label>
    `).join('');

    container.querySelectorAll('input[name="addon"]').forEach(cb => {
        cb.addEventListener('change', autoCalcAmount);
    });
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

const populatePetDropdown = (clientId) => {
    const sel = document.getElementById('bkPet');
    if (!sel) return;
    sel.innerHTML = '<option value="" disabled selected>Select pet</option>';
    if (!clientId) return;
    Store.getPetsForClient(clientId).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${getPetIcon(d.petType)} ${d.name} (${d.breed || 'Unknown breed'})`;
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
    populatePetDropdown(e.target.value);
});

const getSelectedAddons = () => {
    const checkboxes = document.querySelectorAll('#bkAddonsContainer input[name="addon"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
};

const autoCalcAmount = () => {
    const svcId = document.getElementById('bkService')?.value;
    const start = document.getElementById('bkStart')?.value;
    const end = document.getElementById('bkEnd')?.value;
    if (svcId && start && end) {
        const addons = getSelectedAddons();
        const petId = document.getElementById('bkPet')?.value;
        const clientId = document.getElementById('bkClient')?.value;
        const pet = petId ? Store.getById('dogs', petId) : null;
        const result = calcAmount(svcId, start, end, addons, {
            petSize: pet?.size,
            petBreed: pet?.breed,
            isPuppy: pet?.isPuppy,
            numPets: 1,
            clientId: clientId && clientId !== '__new__' ? clientId : null
        });
        document.getElementById('bkAmount').value = result.total;

        // Show breakdown in booking modal
        const breakdownEl = document.getElementById('bkCostBreakdown');
        if (breakdownEl) {
            breakdownEl.innerHTML = result.breakdown.map(l => `
                <div class="cost-line ${l.isDiscount ? 'discount' : ''}">
                    <span>${l.label}</span>
                    <span>${l.isDiscount ? '' : '+'}$${Math.abs(l.amount).toFixed(2)}</span>
                </div>
            `).join('');
            breakdownEl.style.display = result.breakdown.length > 1 ? 'block' : 'none';
        }
    }

    // Show holiday indicator
    const holidayInfo = document.getElementById('bkHolidayInfo');
    if (holidayInfo && start && end) {
        if (bookingHasHoliday(start, end)) {
            holidayInfo.style.display = 'block';
        } else {
            holidayInfo.style.display = 'none';
        }
    }
};

document.getElementById('bkService')?.addEventListener('change', autoCalcAmount);
document.getElementById('bkStart')?.addEventListener('change', autoCalcAmount);
document.getElementById('bkEnd')?.addEventListener('change', autoCalcAmount);
document.getElementById('bkPet')?.addEventListener('change', autoCalcAmount);

bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(bookingForm);
    const data = Object.fromEntries(fd);
    const id = data.bookingId;
    delete data.bookingId;

    // Handle pet field mapped to dogId for backward compat
    data.dogId = data.petId || data.dogId || '';
    delete data.petId;

    data.paymentAmount = parseFloat(data.paymentAmount) || 0;
    if (data.paymentStatus === 'paid' && !data.paidDate) data.paidDate = todayStr();
    // Store pricing options for audit trail
    const pet = data.dogId ? Store.getById('dogs', data.dogId) : null;
    if (pet) {
        data.pricingMeta = { size: pet.size, breed: pet.breed, isPuppy: pet.isPuppy };
    }
    data.addons = getSelectedAddons();
    delete data.addon;

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

        listEl.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.task-move-btn')) return;
                openTaskModal(card.dataset.id);
            });
        });

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
            const pets = Store.getPetsForClient(c.id);
            const petMatch = pets.some(d => d.name.toLowerCase().includes(searchVal) || (d.breed || '').toLowerCase().includes(searchVal));
            return c.name.toLowerCase().includes(searchVal) || (c.email || '').toLowerCase().includes(searchVal) || petMatch;
        });
    }

    clients.sort((a, b) => a.name.localeCompare(b.name));

    if (clients.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No clients found.</p>';
        return;
    }

    listEl.innerHTML = clients.map(c => {
        const pets = Store.getPetsForClient(c.id);
        const initial = c.name.charAt(0).toUpperCase();
        const tier = Store.getClientLoyaltyTier(c.id);
        const bookingCount = Store.getClientTotalBookings(c.id);
        const referralCount = Store.getClientReferrals(c.id).length;
        return `
            <div class="client-card" data-id="${c.id}">
                <div class="client-header">
                    <div class="client-avatar">${initial}</div>
                    <div class="client-header-info">
                        <strong>${escapeHtml(c.name)}</strong>
                        <span>${escapeHtml(c.email || '')}${c.phone ? ' | ' + escapeHtml(c.phone) : ''}</span>
                    </div>
                    <div class="client-badges">
                        <span class="loyalty-badge" style="background:${tier.color}20;color:${tier.color};border:1px solid ${tier.color}40">${tier.icon} ${tier.name}</span>
                        <span class="client-stat-badge">${bookingCount} booking${bookingCount !== 1 ? 's' : ''}</span>
                        ${referralCount > 0 ? `<span class="client-stat-badge referral">🎁 ${referralCount} referral${referralCount !== 1 ? 's' : ''}</span>` : ''}
                        ${c.referralCredits > 0 ? `<span class="client-stat-badge credit">$${c.referralCredits} credit</span>` : ''}
                    </div>
                </div>
                <div class="client-dogs">
                    ${pets.map(d => `<span class="client-dog-tag" data-pet-type="${d.petType || 'dog'}">${getPetIcon(d.petType)} ${escapeHtml(d.name)} — ${escapeHtml(d.breed || 'Unknown')}</span>`).join('')}
                    ${pets.length === 0 ? '<span class="client-dog-tag" style="opacity:0.5">No pets added</span>' : ''}
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
// Client Modal with Pet Profiles
// ========================================
const clientModal = document.getElementById('clientModal');
const clientForm = document.getElementById('clientForm');
const petFieldsContainer = document.getElementById('petFields');
const petFieldTemplate = document.getElementById('petFieldTemplate');

const openClientModal = (clientId) => {
    if (!clientForm) return;
    clientForm.reset();
    document.getElementById('clientId').value = '';
    document.getElementById('clientModalTitle').textContent = 'New Client';
    document.getElementById('clientDelete').style.display = 'none';
    if (petFieldsContainer) petFieldsContainer.innerHTML = '';

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
        Store.getPetsForClient(c.id).forEach(d => addPetField(d));
    } else {
        addPetField();
    }

    clientModal.classList.add('active');
};

const addPetField = (petData) => {
    if (!petFieldTemplate || !petFieldsContainer) return;
    const clone = petFieldTemplate.content.cloneNode(true);
    const group = clone.querySelector('.pet-field-group');

    const petType = petData?.petType || 'dog';

    if (petData) {
        group.dataset.petId = petData.id;
        group.querySelector('[name="petName"]').value = petData.name || '';
        group.querySelector('[name="petType"]').value = petType;
        group.querySelector('[name="petAge"]').value = petData.age || '';
        group.querySelector('[name="petSize"]').value = petData.size || 'medium';
    }

    // Setup breed dropdown based on pet type
    const breedSelect = group.querySelector('[name="petBreed"]');
    const breedOtherInput = group.querySelector('[name="petBreedOther"]');
    const breedSearchInput = group.querySelector('.breed-search-input');

    const populateBreeds = (type, selected) => {
        const breeds = type === 'cat' ? CAT_BREEDS : DOG_BREEDS;
        breedSelect.innerHTML = '<option value="" disabled selected>Select breed</option>';
        breeds.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            if (b === selected) opt.selected = true;
            breedSelect.appendChild(opt);
        });
        if (selected && !breeds.includes(selected) && selected !== '') {
            // It was a custom "Other" breed
            breedSelect.value = 'Other';
            breedOtherInput.value = selected;
            breedOtherInput.style.display = 'block';
        }
    };

    populateBreeds(petType, petData?.breed || '');

    // Pet type change handler
    group.querySelector('[name="petType"]').addEventListener('change', (e) => {
        populateBreeds(e.target.value, '');
        group.querySelector('.pet-field-title').textContent = e.target.value === 'cat' ? '🐱 Cat' : '🐕 Dog';
        // Update size options for cats
        const sizeSelect = group.querySelector('[name="petSize"]');
        if (e.target.value === 'cat') {
            sizeSelect.innerHTML = PET_SIZES.filter(s => s.value !== 'xlarge').map(s =>
                `<option value="${s.value}">${s.label}</option>`
            ).join('');
        } else {
            sizeSelect.innerHTML = PET_SIZES.map(s =>
                `<option value="${s.value}">${s.label}</option>`
            ).join('');
        }
    });

    // Breed search filter
    if (breedSearchInput) {
        breedSearchInput.addEventListener('input', () => {
            const search = breedSearchInput.value.toLowerCase();
            const breeds = (petType === 'cat' ? CAT_BREEDS : DOG_BREEDS);
            const opts = breedSelect.querySelectorAll('option');
            opts.forEach(opt => {
                if (opt.disabled) return;
                opt.style.display = opt.value.toLowerCase().includes(search) ? '' : 'none';
            });
        });
    }

    // Breed "Other" handling
    breedSelect.addEventListener('change', () => {
        breedOtherInput.style.display = breedSelect.value === 'Other' ? 'block' : 'none';
    });

    // Puppy/kitten toggle
    if (petData?.isPuppy !== undefined) {
        const puppyCheck = group.querySelector('[name="petIsPuppy"]');
        if (puppyCheck) puppyCheck.checked = petData.isPuppy;
    }

    // Pet profile expanded section
    const detailsToggle = group.querySelector('.pet-details-toggle');
    const detailsSection = group.querySelector('.pet-details-section');
    if (detailsToggle && detailsSection) {
        detailsToggle.addEventListener('click', () => {
            detailsSection.classList.toggle('expanded');
            detailsToggle.classList.toggle('expanded');
        });
    }

    // Populate profile data
    if (petData) {
        // Allergies
        (petData.allergies || []).forEach(a => {
            const cb = group.querySelector(`[name="allergy"][value="${a}"]`);
            if (cb) cb.checked = true;
        });
        const allergyOther = group.querySelector('[name="allergyOther"]');
        if (allergyOther && petData.allergyOther) {
            allergyOther.value = petData.allergyOther;
        }

        // Temperament
        (petData.temperament || []).forEach(t => {
            const cb = group.querySelector(`[name="temperament"][value="${t}"]`);
            if (cb) cb.checked = true;
        });

        // Tendencies
        (petData.tendencies || []).forEach(t => {
            const cb = group.querySelector(`[name="tendency"][value="${t}"]`);
            if (cb) cb.checked = true;
        });

        // Feeding
        const feedSchedule = group.querySelector('[name="feedingSchedule"]');
        if (feedSchedule && petData.feedingSchedule) feedSchedule.value = petData.feedingSchedule;
        const feedBrand = group.querySelector('[name="foodBrand"]');
        if (feedBrand && petData.foodBrand) feedBrand.value = petData.foodBrand;
        const feedAmount = group.querySelector('[name="foodAmount"]');
        if (feedAmount && petData.foodAmount) feedAmount.value = petData.foodAmount;

        // Medical
        const spayed = group.querySelector('[name="spayedNeutered"]');
        if (spayed) spayed.checked = petData.spayedNeutered || false;
        const meds = group.querySelector('[name="medications"]');
        if (meds && petData.medications) meds.value = petData.medications;
        const vet = group.querySelector('[name="vetInfo"]');
        if (vet && petData.vetInfo) vet.value = petData.vetInfo;

        // House training
        const ht = group.querySelector('[name="houseTraining"]');
        if (ht && petData.houseTraining) ht.value = petData.houseTraining;

        // Photos
        if (petData.photos && petData.photos.length > 0) {
            renderPetPhotoThumbnails(group, petData.photos);
        }
    }

    // Photo upload handler
    const photoInput = group.querySelector('.pet-photo-input');
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const existingPhotos = getPetPhotosFromGroup(group);
            if (existingPhotos.length >= 5) {
                alert('Maximum 5 photos per pet.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                // Compress via canvas
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxSize = 400;
                    let w = img.width, h = img.height;
                    if (w > maxSize || h > maxSize) {
                        const ratio = Math.min(maxSize / w, maxSize / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                    }
                    canvas.width = w;
                    canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    const compressed = canvas.toDataURL('image/jpeg', 0.7);
                    const photos = getPetPhotosFromGroup(group);
                    photos.push(compressed);
                    setPetPhotosOnGroup(group, photos);
                    renderPetPhotoThumbnails(group, photos);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
            photoInput.value = '';
        });
    }

    group.querySelector('.pet-remove').addEventListener('click', () => group.remove());

    // Update title
    if (petData) {
        group.querySelector('.pet-field-title').textContent = petType === 'cat' ? '🐱 Cat' : '🐕 Dog';
    }

    petFieldsContainer.appendChild(clone);
};

const getPetPhotosFromGroup = (group) => {
    const hidden = group.querySelector('[name="petPhotos"]');
    if (!hidden || !hidden.value) return [];
    try { return JSON.parse(hidden.value); } catch { return []; }
};

const setPetPhotosOnGroup = (group, photos) => {
    const hidden = group.querySelector('[name="petPhotos"]');
    if (hidden) hidden.value = JSON.stringify(photos);
};

const renderPetPhotoThumbnails = (group, photos) => {
    const gallery = group.querySelector('.pet-photo-gallery');
    if (!gallery) return;
    gallery.innerHTML = photos.map((p, i) => `
        <div class="pet-photo-thumb">
            <img src="${p}" alt="Pet photo ${i + 1}">
            <button type="button" class="photo-remove-btn" data-index="${i}" title="Remove photo">&times;</button>
            <label class="photo-public-toggle" title="Show in public gallery">
                <input type="checkbox" name="photoPublic_${i}" class="photo-public-cb">
                <span>Public</span>
            </label>
        </div>
    `).join('');

    gallery.querySelectorAll('.photo-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const currentPhotos = getPetPhotosFromGroup(group);
            currentPhotos.splice(idx, 1);
            setPetPhotosOnGroup(group, currentPhotos);
            renderPetPhotoThumbnails(group, currentPhotos);
        });
    });
};

document.getElementById('addPetFieldBtn')?.addEventListener('click', () => addPetField());

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

    const existingPets = Store.getPetsForClient(cId);
    const petGroups = petFieldsContainer?.querySelectorAll('.pet-field-group') || [];
    const formPetIds = new Set();

    petGroups.forEach(group => {
        const petId = group.dataset.petId;
        const breed = group.querySelector('[name="petBreed"]').value;
        const breedOther = group.querySelector('[name="petBreedOther"]').value;
        const finalBreed = breed === 'Other' ? breedOther : breed;

        const petData = {
            clientId: cId,
            petType: group.querySelector('[name="petType"]').value || 'dog',
            name: group.querySelector('[name="petName"]').value.trim(),
            breed: finalBreed,
            size: group.querySelector('[name="petSize"]').value,
            age: group.querySelector('[name="petAge"]').value.trim(),
            isPuppy: group.querySelector('[name="petIsPuppy"]')?.checked || false,
            // Profile fields
            allergies: Array.from(group.querySelectorAll('[name="allergy"]:checked')).map(cb => cb.value),
            allergyOther: group.querySelector('[name="allergyOther"]')?.value?.trim() || '',
            temperament: Array.from(group.querySelectorAll('[name="temperament"]:checked')).map(cb => cb.value),
            tendencies: Array.from(group.querySelectorAll('[name="tendency"]:checked')).map(cb => cb.value),
            feedingSchedule: group.querySelector('[name="feedingSchedule"]')?.value || '',
            foodBrand: group.querySelector('[name="foodBrand"]')?.value?.trim() || '',
            foodAmount: group.querySelector('[name="foodAmount"]')?.value?.trim() || '',
            spayedNeutered: group.querySelector('[name="spayedNeutered"]')?.checked || false,
            medications: group.querySelector('[name="medications"]')?.value?.trim() || '',
            vetInfo: group.querySelector('[name="vetInfo"]')?.value?.trim() || '',
            houseTraining: group.querySelector('[name="houseTraining"]')?.value || '',
            photos: getPetPhotosFromGroup(group),
            publicPhotos: Array.from(group.querySelectorAll('.photo-public-cb:checked')).map((_, i) => i)
        };
        if (!petData.name) return;
        if (petId) {
            Store.update('dogs', petId, petData);
            formPetIds.add(petId);
        } else {
            formPetIds.add(Store.add('dogs', petData).id);
        }
    });

    existingPets.forEach(d => { if (!formPetIds.has(d.id)) Store.remove('dogs', d.id); });

    closeModal(clientModal);
    refreshAll();
});

document.getElementById('clientDelete')?.addEventListener('click', () => {
    const id = document.getElementById('clientId').value;
    if (id && confirm('Delete this client and all their pets?')) {
        Store.getPetsForClient(id).forEach(d => Store.remove('dogs', d.id));
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
                    <strong>${getPetIcon(dog?.petType)} ${escapeHtml(dog?.name || 'Unknown')} — ${getServiceLabel(b.serviceId)}</strong>
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
// Messages View
// ========================================
let activeMessageClient = null;

const renderMessages = () => {
    const panel = document.getElementById('panelMessages');
    if (!panel) return;

    const clients = Store.getAll('clients');
    const messages = Store.getAll('messages');

    // Get clients that have messages, plus show all for owner
    const clientsWithMessages = new Set(messages.map(m => m.clientId));
    const messageClients = clients.filter(c => clientsWithMessages.has(c.id));

    const threadList = panel.querySelector('.message-thread-list');
    const chatArea = panel.querySelector('.message-chat-area');
    if (!threadList || !chatArea) return;

    // Render thread list
    threadList.innerHTML = messageClients.length === 0
        ? '<p class="empty-state" style="padding:20px;font-size:0.85rem">No conversations yet</p>'
        : messageClients.map(c => {
            const clientMsgs = Store.getMessagesForClient(c.id);
            const lastMsg = clientMsgs[clientMsgs.length - 1];
            const unread = clientMsgs.filter(m => !m.read && m.sender === 'client').length;
            return `
                <div class="message-thread ${activeMessageClient === c.id ? 'active' : ''}" data-client-id="${c.id}">
                    <div class="thread-avatar">${c.name.charAt(0).toUpperCase()}</div>
                    <div class="thread-info">
                        <strong>${escapeHtml(c.name)}</strong>
                        <span>${lastMsg ? escapeHtml(lastMsg.content.substring(0, 40)) + (lastMsg.content.length > 40 ? '...' : '') : 'No messages'}</span>
                    </div>
                    ${unread > 0 ? `<span class="thread-unread">${unread}</span>` : ''}
                </div>
            `;
        }).join('');

    threadList.querySelectorAll('.message-thread').forEach(el => {
        el.addEventListener('click', () => {
            activeMessageClient = el.dataset.clientId;
            // Mark as read
            Store.getMessagesForClient(activeMessageClient).forEach(m => {
                if (!m.read && m.sender === 'client') {
                    Store.update('messages', m.id, { read: true });
                }
            });
            renderMessages();
        });
    });

    // Render chat area
    if (activeMessageClient) {
        const client = Store.getById('clients', activeMessageClient);
        const clientMsgs = Store.getMessagesForClient(activeMessageClient);

        chatArea.innerHTML = `
            <div class="chat-header">
                <strong>${escapeHtml(client?.name || 'Unknown')}</strong>
                <span>${escapeHtml(client?.email || '')}</span>
            </div>
            <div class="chat-messages" id="chatMessages">
                ${clientMsgs.map(m => `
                    <div class="chat-bubble ${m.sender === 'client' ? 'incoming' : 'outgoing'}">
                        <p>${escapeHtml(m.content)}</p>
                        <span class="chat-time">${new Date(m.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                `).join('')}
            </div>
            <div class="chat-input-area">
                <textarea id="chatInput" rows="2" placeholder="Type a message..."></textarea>
                <button class="btn btn-primary btn-sm" id="chatSendBtn">Send</button>
            </div>
        `;

        // Scroll to bottom
        const chatMsgs = document.getElementById('chatMessages');
        if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight;

        document.getElementById('chatSendBtn')?.addEventListener('click', () => {
            const input = document.getElementById('chatInput');
            const content = input?.value?.trim();
            if (!content) return;

            Store.add('messages', {
                clientId: activeMessageClient,
                content,
                sender: AUTH.isOwner() ? 'owner' : AUTH.employeeId(),
                timestamp: new Date().toISOString(),
                read: true
            });
            input.value = '';
            renderMessages();
        });

        document.getElementById('chatInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('chatSendBtn')?.click();
            }
        });
    } else {
        chatArea.innerHTML = '<p class="empty-state">Select a conversation to view messages</p>';
    }
};

// ========================================
// Reviews View
// ========================================
const renderReviews = () => {
    const panel = document.getElementById('panelReviews');
    if (!panel) return;

    const reviews = Store.getAll('reviews');
    const statsEl = panel.querySelector('.review-stats');
    const listEl = panel.querySelector('.reviews-list');
    if (!statsEl || !listEl) return;

    // Stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1) : '0.0';
    const distribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: totalReviews > 0 ? Math.round(reviews.filter(r => r.rating === star).length / totalReviews * 100) : 0
    }));

    statsEl.innerHTML = `
        <div class="review-stat-summary">
            <div class="review-avg-rating">${avgRating}</div>
            <div class="review-avg-stars">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5 - Math.round(avgRating))}</div>
            <div class="review-total">${totalReviews} review${totalReviews !== 1 ? 's' : ''}</div>
        </div>
        <div class="review-distribution">
            ${distribution.map(d => `
                <div class="review-dist-row">
                    <span>${d.star}★</span>
                    <div class="review-dist-bar"><div class="review-dist-fill" style="width:${d.pct}%"></div></div>
                    <span>${d.count}</span>
                </div>
            `).join('')}
        </div>
    `;

    // List
    if (reviews.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No reviews yet. Add your first one!</p>';
        return;
    }

    listEl.innerHTML = reviews.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(r => {
        const client = Store.getById('clients', r.clientId);
        const pet = Store.getById('dogs', r.petId);
        return `
            <div class="review-card ${r.featured ? 'featured' : ''}" data-id="${r.id}">
                <div class="review-card-header">
                    <div class="review-stars">${'★'.repeat(r.rating || 0)}${'☆'.repeat(5 - (r.rating || 0))}</div>
                    ${r.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    <span class="review-date">${formatDate(r.date)}</span>
                </div>
                <p class="review-text">${escapeHtml(r.text)}</p>
                <div class="review-meta">
                    <strong>${escapeHtml(client?.name || 'Unknown')}</strong>
                    ${pet ? `<span>— ${getPetIcon(pet.petType)} ${escapeHtml(pet.name)}</span>` : ''}
                </div>
                ${r.response ? `<div class="review-response"><strong>Owner response:</strong> ${escapeHtml(r.response)}</div>` : ''}
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.review-card').forEach(card => {
        card.addEventListener('click', () => openReviewModal(card.dataset.id));
    });
};

document.getElementById('addReviewBtn')?.addEventListener('click', () => openReviewModal());

// ========================================
// Review Modal
// ========================================
const reviewModal = document.getElementById('reviewModal');
const reviewForm = document.getElementById('reviewForm');

const openReviewModal = (reviewId) => {
    if (!reviewForm) return;
    reviewForm.reset();
    document.getElementById('reviewIdField').value = '';
    document.getElementById('reviewModalTitle').textContent = 'New Review';
    document.getElementById('reviewDelete').style.display = 'none';

    // Populate client dropdown
    const clientSel = document.getElementById('rvClient');
    if (clientSel) {
        clientSel.innerHTML = '<option value="" disabled selected>Select client</option>';
        Store.getAll('clients').forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            clientSel.appendChild(opt);
        });
    }

    // Star rating interactive
    setupStarRating();

    if (reviewId) {
        const r = Store.getById('reviews', reviewId);
        if (!r) return;
        document.getElementById('reviewModalTitle').textContent = 'Edit Review';
        document.getElementById('reviewIdField').value = r.id;
        document.getElementById('reviewDelete').style.display = 'inline-flex';
        if (clientSel) clientSel.value = r.clientId || '';
        document.getElementById('rvRating').value = r.rating || 5;
        setStarDisplay(r.rating || 5);
        document.getElementById('rvText').value = r.text || '';
        document.getElementById('rvDate').value = r.date || '';
        document.getElementById('rvFeatured').checked = r.featured || false;
        document.getElementById('rvResponse').value = r.response || '';

        // Populate pet dropdown
        populateReviewPetDropdown(r.clientId, r.petId);
    }

    reviewModal.classList.add('active');
};

const populateReviewPetDropdown = (clientId, selectedPetId) => {
    const sel = document.getElementById('rvPet');
    if (!sel) return;
    sel.innerHTML = '<option value="">No specific pet</option>';
    if (!clientId) return;
    Store.getPetsForClient(clientId).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${getPetIcon(d.petType)} ${d.name}`;
        if (d.id === selectedPetId) opt.selected = true;
        sel.appendChild(opt);
    });
};

const setupStarRating = () => {
    const container = document.getElementById('starRatingContainer');
    if (!container) return;
    container.innerHTML = [1, 2, 3, 4, 5].map(i =>
        `<span class="star-btn" data-rating="${i}">★</span>`
    ).join('');

    setStarDisplay(5);

    container.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const rating = parseInt(btn.dataset.rating);
            document.getElementById('rvRating').value = rating;
            setStarDisplay(rating);
        });
    });
};

const setStarDisplay = (rating) => {
    const container = document.getElementById('starRatingContainer');
    if (!container) return;
    container.querySelectorAll('.star-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.rating) <= rating);
    });
};

document.getElementById('rvClient')?.addEventListener('change', (e) => {
    populateReviewPetDropdown(e.target.value);
});

reviewForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(reviewForm);
    const data = Object.fromEntries(fd);
    const id = data.reviewId;
    delete data.reviewId;
    data.rating = parseInt(data.rating) || 5;
    data.featured = document.getElementById('rvFeatured').checked;

    if (id) {
        Store.update('reviews', id, data);
    } else {
        Store.add('reviews', data);
    }

    closeModal(reviewModal);
    renderReviews();
});

document.getElementById('reviewDelete')?.addEventListener('click', () => {
    const id = document.getElementById('reviewIdField').value;
    if (id && confirm('Delete this review?')) {
        Store.remove('reviews', id);
        closeModal(reviewModal);
        renderReviews();
    }
});

document.getElementById('reviewModalClose')?.addEventListener('click', () => closeModal(reviewModal));
document.getElementById('reviewCancel')?.addEventListener('click', () => closeModal(reviewModal));

// ========================================
// Settings View
// ========================================
const renderSettings = () => {
    renderServicesSettings();
    renderHolidaySettings();
    renderAddonSettings();
    renderPricingSettings();
    renderLoyaltySettings();
    renderReferralSettings();
    renderDiscountCodesSettings();
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

const renderHolidaySettings = () => {
    const container = document.getElementById('holidaySettingsList');
    if (!container) return;
    const holidays = Store.data.settings.holidayRates || [];

    container.innerHTML = holidays.map(h => `
        <div class="holiday-setting-row">
            <strong>${escapeHtml(h.name)}</strong>
            <span>${h.startMonth}/${h.startDay} – ${h.endMonth}/${h.endDay}</span>
            <span class="holiday-multiplier">${h.multiplier}x</span>
            <button class="btn btn-icon btn-sm holiday-remove-btn" data-id="${h.id}" title="Remove">&times;</button>
        </div>
    `).join('');

    container.querySelectorAll('.holiday-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.data.settings.holidayRates = Store.data.settings.holidayRates.filter(h => h.id !== btn.dataset.id);
            Store.save();
            renderHolidaySettings();
        });
    });
};

document.getElementById('addHolidayBtn')?.addEventListener('click', () => {
    const name = prompt('Holiday name:');
    if (!name) return;
    const startMonth = parseInt(prompt('Start month (1-12):'));
    const startDay = parseInt(prompt('Start day:'));
    const endMonth = parseInt(prompt('End month (1-12):'));
    const endDay = parseInt(prompt('End day:'));
    const multiplier = parseFloat(prompt('Rate multiplier (e.g., 1.5):') || '1.5');

    if (!startMonth || !startDay || !endMonth || !endDay) return;

    Store.data.settings.holidayRates.push({
        id: 'hol-' + crypto.randomUUID().slice(0, 8),
        name, startMonth, startDay, endMonth, endDay, multiplier
    });
    Store.save();
    renderHolidaySettings();
});

const renderAddonSettings = () => {
    const container = document.getElementById('addonSettingsList');
    if (!container) return;
    const addons = Store.data.settings.addons || [];

    container.innerHTML = addons.map(a => `
        <div class="addon-setting-row">
            <span class="addon-icon">${a.icon}</span>
            <strong>${escapeHtml(a.name)}</strong>
            <span>$${a.price}</span>
            <label class="toggle-switch">
                <input type="checkbox" ${a.enabled ? 'checked' : ''} data-id="${a.id}" class="addon-toggle">
                <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-icon btn-sm addon-remove-btn" data-id="${a.id}" title="Remove">&times;</button>
        </div>
    `).join('');

    container.querySelectorAll('.addon-toggle').forEach(toggle => {
        toggle.addEventListener('change', () => {
            const addon = Store.data.settings.addons.find(a => a.id === toggle.dataset.id);
            if (addon) { addon.enabled = toggle.checked; Store.save(); }
        });
    });

    container.querySelectorAll('.addon-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.data.settings.addons = Store.data.settings.addons.filter(a => a.id !== btn.dataset.id);
            Store.save();
            renderAddonSettings();
        });
    });
};

document.getElementById('addAddonBtn')?.addEventListener('click', () => {
    const name = prompt('Add-on name:');
    if (!name) return;
    const price = parseFloat(prompt('Price ($):') || '0');
    const icon = prompt('Icon (emoji):') || '✨';

    Store.data.settings.addons.push({
        id: 'addon-' + crypto.randomUUID().slice(0, 8),
        name, price, icon, enabled: true
    });
    Store.save();
    renderAddonSettings();
});

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
// Alerts Panel
// ========================================
const renderAlerts = () => {
    const panel = document.getElementById('panelAlerts');
    if (!panel) return;
    const listEl = panel.querySelector('.alerts-list');
    if (!listEl) return;

    const alerts = Store.getAlerts();
    const countEl = panel.querySelector('.alerts-count');
    if (countEl) countEl.textContent = `${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`;

    if (alerts.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No alerts — everything looks good!</p>';
        return;
    }

    listEl.innerHTML = alerts.map(a => `
        <div class="alert-card alert-${a.priority}" data-type="${a.type}" data-id="${a.id}">
            <span class="alert-icon">${a.icon}</span>
            <div class="alert-info">
                <strong>${escapeHtml(a.title)}</strong>
                <span>${escapeHtml(a.detail)}</span>
            </div>
            <span class="alert-priority-badge ${a.priority}">${a.priority}</span>
        </div>
    `).join('');

    listEl.querySelectorAll('.alert-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            const id = card.dataset.id;
            if (type === 'upcoming' || type === 'payment' || type === 'pending') {
                openBookingModal(id);
            } else if (type === 'loyalty') {
                openClientModal(id);
            } else if (type === 'message') {
                switchPanel('messages');
            }
        });
    });
};

// ========================================
// Loyalty Panel
// ========================================
const renderLoyalty = () => {
    const panel = document.getElementById('panelLoyalty');
    if (!panel) return;
    const listEl = panel.querySelector('.loyalty-list');
    if (!listEl) return;

    const clients = Store.getAll('clients');
    const tiers = [...(Store.data.settings.loyaltyTiers || [])].sort((a, b) => b.minBookings - a.minBookings);

    // Summary stats
    const statsEl = panel.querySelector('.loyalty-stats');
    if (statsEl) {
        const tierCounts = {};
        clients.forEach(c => {
            const tier = Store.getClientLoyaltyTier(c.id);
            tierCounts[tier.name] = (tierCounts[tier.name] || 0) + 1;
        });
        statsEl.innerHTML = tiers.slice().reverse().map(t => `
            <div class="loyalty-stat-card" style="border-top:3px solid ${t.color}">
                <span class="loyalty-stat-icon">${t.icon}</span>
                <strong>${t.name}</strong>
                <span class="loyalty-stat-count">${tierCounts[t.name] || 0} client${(tierCounts[t.name] || 0) !== 1 ? 's' : ''}</span>
                <span class="loyalty-stat-discount">${t.discount > 0 ? t.discount + '% off' : 'No discount'}</span>
            </div>
        `).join('');
    }

    // Client list sorted by booking count
    const clientData = clients.map(c => ({
        client: c,
        tier: Store.getClientLoyaltyTier(c.id),
        bookings: Store.getClientCompletedBookings(c.id),
        total: Store.getClientTotalBookings(c.id),
        spent: Store.getAll('bookings').filter(b => b.clientId === c.id && b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.paymentAmount || 0), 0)
    })).sort((a, b) => b.bookings - a.bookings);

    listEl.innerHTML = clientData.map(d => {
        const nextTier = tiers.find(t => t.minBookings > d.bookings);
        const progress = nextTier ? Math.round((d.bookings / nextTier.minBookings) * 100) : 100;
        return `
            <div class="loyalty-client-card" data-id="${d.client.id}">
                <div class="loyalty-client-avatar" style="border-color:${d.tier.color}">${d.client.name.charAt(0)}</div>
                <div class="loyalty-client-info">
                    <strong>${escapeHtml(d.client.name)}</strong>
                    <div class="loyalty-client-stats">
                        <span>${d.bookings} completed</span>
                        <span>$${d.spent.toFixed(0)} spent</span>
                        ${d.client.referralCredits > 0 ? `<span>$${d.client.referralCredits} credit</span>` : ''}
                    </div>
                    ${nextTier ? `
                        <div class="loyalty-progress">
                            <div class="loyalty-progress-bar" style="width:${progress}%;background:${nextTier.color}"></div>
                        </div>
                        <span class="loyalty-progress-label">${d.bookings}/${nextTier.minBookings} to ${nextTier.icon} ${nextTier.name}</span>
                    ` : '<span class="loyalty-progress-label">Max tier reached!</span>'}
                </div>
                <span class="loyalty-badge" style="background:${d.tier.color}20;color:${d.tier.color};border:1px solid ${d.tier.color}40">${d.tier.icon} ${d.tier.name}</span>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.loyalty-client-card').forEach(card => {
        card.addEventListener('click', () => openClientModal(card.dataset.id));
    });
};

// ========================================
// Referrals Panel
// ========================================
const renderReferrals = () => {
    const panel = document.getElementById('panelReferrals');
    if (!panel) return;
    const listEl = panel.querySelector('.referrals-list');
    if (!listEl) return;

    const clients = Store.getAll('clients');
    const settings = Store.data.settings;

    // Stats
    const statsEl = panel.querySelector('.referrals-stats');
    if (statsEl) {
        const totalReferrals = clients.filter(c => c.referredBy).length;
        const totalCreditsOut = clients.reduce((sum, c) => sum + (c.referralCredits || 0), 0);
        const topReferrer = clients.reduce((best, c) => {
            const count = Store.getClientReferrals(c.id).length;
            return count > best.count ? { name: c.name, count } : best;
        }, { name: '—', count: 0 });

        statsEl.innerHTML = `
            <div class="ref-stat-card"><span class="ref-stat-val">${totalReferrals}</span><span>Total Referrals</span></div>
            <div class="ref-stat-card"><span class="ref-stat-val">$${totalCreditsOut}</span><span>Credits Outstanding</span></div>
            <div class="ref-stat-card"><span class="ref-stat-val">${escapeHtml(topReferrer.name)}</span><span>Top Referrer (${topReferrer.count})</span></div>
            <div class="ref-stat-card"><span class="ref-stat-val">$${settings.referralRewardReferrer || 15}</span><span>Referrer Reward</span></div>
        `;
    }

    // Referral leaderboard
    const referrerData = clients.map(c => ({
        client: c,
        referrals: Store.getClientReferrals(c.id),
        credits: c.referralCredits || 0
    })).filter(d => d.referrals.length > 0 || d.credits > 0)
      .sort((a, b) => b.referrals.length - a.referrals.length);

    if (referrerData.length === 0) {
        listEl.innerHTML = `
            <div class="referral-info-card">
                <h4>How Referrals Work</h4>
                <p>Each client gets a unique referral code. When a new client uses it during booking:</p>
                <ul>
                    <li>Referrer gets <strong>$${settings.referralRewardReferrer || 15}</strong> credit</li>
                    <li>New client gets <strong>$${settings.referralRewardReferee || 10}</strong> off first booking</li>
                </ul>
                <p>Credits auto-apply to the next booking total.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = referrerData.map((d, i) => `
        <div class="referral-card">
            <span class="referral-rank">#${i + 1}</span>
            <div class="referral-info">
                <strong>${escapeHtml(d.client.name)}</strong>
                <span class="referral-code">Code: <code>${escapeHtml(d.client.referralCode)}</code></span>
            </div>
            <div class="referral-stats">
                <span class="ref-count">${d.referrals.length} referral${d.referrals.length !== 1 ? 's' : ''}</span>
                <span class="ref-credit">$${d.credits} credit</span>
            </div>
            <div class="referral-referred">
                ${d.referrals.map(r => `<span class="referred-tag">${escapeHtml(r.name)}</span>`).join('')}
            </div>
        </div>
    `).join('');
};

// ========================================
// Pricing Settings (size, breed, puppy surcharges)
// ========================================
const renderPricingSettings = () => {
    const container = document.getElementById('pricingSettingsSection');
    if (!container) return;
    const s = Store.data.settings;

    container.innerHTML = `
        <div class="settings-subsection">
            <h4>Size Surcharges <span class="settings-hint">(per unit/day)</span></h4>
            <div class="surcharge-grid">
                ${Object.entries(s.sizeSurcharges || {}).map(([size, amt]) => `
                    <div class="surcharge-row">
                        <label>${size.charAt(0).toUpperCase() + size.slice(1)}</label>
                        <div class="surcharge-input-wrap">
                            <span>+$</span>
                            <input type="number" class="surcharge-input" data-size="${size}" value="${amt}" min="0" step="1">
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="settings-subsection">
            <h4>Breed Category Surcharges <span class="settings-hint">(per unit/day)</span></h4>
            <div id="breedSurchargesList">
                ${(s.breedSurcharges || []).map(cat => `
                    <div class="breed-surcharge-card" data-id="${cat.id}">
                        <div class="breed-surcharge-header">
                            <strong>${escapeHtml(cat.label)}</strong>
                            <span>+$${cat.surcharge}/unit</span>
                            <button class="btn btn-icon btn-sm breed-surcharge-remove" data-id="${cat.id}">&times;</button>
                        </div>
                        <div class="breed-surcharge-breeds">${(cat.breeds || []).map(b => `<span class="breed-tag">${escapeHtml(b)}</span>`).join('')}</div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-outline btn-sm" id="addBreedSurchargeBtn" style="margin-top:8px">+ Add Breed Category</button>
        </div>
        <div class="settings-subsection">
            <h4>Puppy/Kitten Surcharge <span class="settings-hint">(flat per booking)</span></h4>
            <div class="surcharge-row">
                <label>Amount</label>
                <div class="surcharge-input-wrap">
                    <span>+$</span>
                    <input type="number" id="puppySurchargeInput" value="${s.puppySurcharge || 0}" min="0" step="1">
                </div>
            </div>
        </div>
        <div class="settings-subsection">
            <h4>Multi-Pet Discount</h4>
            <div class="surcharge-row">
                <label>Discount per extra pet</label>
                <div class="surcharge-input-wrap">
                    <input type="number" id="multiPetDiscountInput" value="${s.multiPetDiscount || 15}" min="0" max="100" step="1">
                    <span>%</span>
                </div>
            </div>
        </div>
        <button class="btn btn-primary btn-sm" id="savePricingSettings" style="margin-top:12px">Save Pricing</button>
    `;

    // Save pricing
    container.querySelector('#savePricingSettings')?.addEventListener('click', () => {
        // Size surcharges
        container.querySelectorAll('.surcharge-input[data-size]').forEach(input => {
            s.sizeSurcharges[input.dataset.size] = parseFloat(input.value) || 0;
        });
        s.puppySurcharge = parseFloat(container.querySelector('#puppySurchargeInput')?.value) || 0;
        s.multiPetDiscount = parseFloat(container.querySelector('#multiPetDiscountInput')?.value) || 15;
        Store.save();
        alert('Pricing settings saved!');
    });

    // Remove breed surcharge
    container.querySelectorAll('.breed-surcharge-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            s.breedSurcharges = s.breedSurcharges.filter(c => c.id !== btn.dataset.id);
            Store.save();
            renderPricingSettings();
        });
    });

    // Add breed surcharge
    container.querySelector('#addBreedSurchargeBtn')?.addEventListener('click', () => {
        const label = prompt('Category name (e.g., "Giant Breeds"):');
        if (!label) return;
        const surcharge = parseFloat(prompt('Surcharge per unit ($):') || '0');
        const breedsStr = prompt('Comma-separated breeds:');
        if (!breedsStr) return;
        s.breedSurcharges.push({
            id: 'bs-' + crypto.randomUUID().slice(0, 8),
            label,
            surcharge,
            breeds: breedsStr.split(',').map(b => b.trim()).filter(Boolean)
        });
        Store.save();
        renderPricingSettings();
    });
};

// ========================================
// Loyalty Settings
// ========================================
const renderLoyaltySettings = () => {
    const container = document.getElementById('loyaltySettingsSection');
    if (!container) return;
    const s = Store.data.settings;

    container.innerHTML = `
        <div class="settings-subsection">
            <label class="checkbox-label">
                <input type="checkbox" id="loyaltyEnabledCb" ${s.loyaltyEnabled ? 'checked' : ''}>
                <span>Enable Loyalty Program</span>
            </label>
        </div>
        <div class="loyalty-tiers-editor" id="loyaltyTiersEditor">
            <h4>Loyalty Tiers</h4>
            ${(s.loyaltyTiers || []).map((t, i) => `
                <div class="tier-row">
                    <input type="text" class="tier-icon-input" value="${t.icon}" maxlength="4" title="Icon">
                    <input type="text" class="tier-name-input" value="${escapeHtml(t.name)}" placeholder="Tier name">
                    <div class="tier-field"><label>Min bookings</label><input type="number" class="tier-min-input" value="${t.minBookings}" min="0"></div>
                    <div class="tier-field"><label>Discount %</label><input type="number" class="tier-discount-input" value="${t.discount}" min="0" max="100"></div>
                    <input type="color" class="tier-color-input" value="${t.color}">
                    ${i > 0 ? `<button class="btn btn-icon btn-sm tier-remove-btn" data-index="${i}">&times;</button>` : '<span style="width:32px"></span>'}
                </div>
            `).join('')}
            <button class="btn btn-outline btn-sm" id="addLoyaltyTierBtn" style="margin-top:8px">+ Add Tier</button>
        </div>
        <button class="btn btn-primary btn-sm" id="saveLoyaltySettings" style="margin-top:12px">Save Loyalty Settings</button>
    `;

    container.querySelector('#loyaltyEnabledCb')?.addEventListener('change', (e) => {
        s.loyaltyEnabled = e.target.checked;
        Store.save();
    });

    container.querySelector('#saveLoyaltySettings')?.addEventListener('click', () => {
        const rows = container.querySelectorAll('.tier-row');
        s.loyaltyTiers = Array.from(rows).map(row => ({
            icon: row.querySelector('.tier-icon-input').value,
            name: row.querySelector('.tier-name-input').value,
            minBookings: parseInt(row.querySelector('.tier-min-input').value) || 0,
            discount: parseInt(row.querySelector('.tier-discount-input').value) || 0,
            color: row.querySelector('.tier-color-input').value
        }));
        Store.save();
        alert('Loyalty settings saved!');
    });

    container.querySelector('#addLoyaltyTierBtn')?.addEventListener('click', () => {
        s.loyaltyTiers.push({ icon: '🌟', name: 'New Tier', minBookings: 50, discount: 20, color: '#FFD700' });
        Store.save();
        renderLoyaltySettings();
    });

    container.querySelectorAll('.tier-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            s.loyaltyTiers.splice(parseInt(btn.dataset.index), 1);
            Store.save();
            renderLoyaltySettings();
        });
    });
};

// ========================================
// Referral Settings
// ========================================
const renderReferralSettings = () => {
    const container = document.getElementById('referralSettingsSection');
    if (!container) return;
    const s = Store.data.settings;

    container.innerHTML = `
        <div class="settings-subsection">
            <label class="checkbox-label">
                <input type="checkbox" id="referralEnabledCb" ${s.referralEnabled ? 'checked' : ''}>
                <span>Enable Referral Program</span>
            </label>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Referrer Reward ($)</label>
                <input type="number" id="refRewardReferrer" value="${s.referralRewardReferrer || 15}" min="0" step="1">
            </div>
            <div class="form-group">
                <label>New Client Reward ($)</label>
                <input type="number" id="refRewardReferee" value="${s.referralRewardReferee || 10}" min="0" step="1">
            </div>
        </div>
        <button class="btn btn-primary btn-sm" id="saveReferralSettings" style="margin-top:12px">Save Referral Settings</button>
    `;

    container.querySelector('#referralEnabledCb')?.addEventListener('change', (e) => {
        s.referralEnabled = e.target.checked;
        Store.save();
    });

    container.querySelector('#saveReferralSettings')?.addEventListener('click', () => {
        s.referralRewardReferrer = parseFloat(document.getElementById('refRewardReferrer')?.value) || 15;
        s.referralRewardReferee = parseFloat(document.getElementById('refRewardReferee')?.value) || 10;
        Store.save();
        alert('Referral settings saved!');
    });
};

// ========================================
// Discount Codes Settings
// ========================================
const renderDiscountCodesSettings = () => {
    const container = document.getElementById('discountCodesSettingsSection');
    if (!container) return;
    const codes = Store.data.settings.discountCodes || [];

    container.innerHTML = `
        <div id="discountCodesList">
            ${codes.length === 0 ? '<p class="empty-state" style="padding:12px;font-size:0.85rem">No discount codes yet</p>' : ''}
            ${codes.map(d => `
                <div class="discount-code-card ${d.active ? '' : 'inactive'}">
                    <div class="discount-code-info">
                        <code class="discount-code">${escapeHtml(d.code)}</code>
                        <strong>${d.type === 'percent' ? d.value + '% off' : '$' + d.value + ' off'}</strong>
                        ${d.expiresAt ? `<span>Expires: ${formatDate(d.expiresAt)}</span>` : '<span>No expiry</span>'}
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${d.active ? 'checked' : ''} class="discount-toggle" data-id="${d.id}">
                        <span class="toggle-slider"></span>
                    </label>
                    <button class="btn btn-icon btn-sm discount-remove-btn" data-id="${d.id}">&times;</button>
                </div>
            `).join('')}
        </div>
        <button class="btn btn-outline btn-sm" id="addDiscountCodeBtn" style="margin-top:8px">+ Add Discount Code</button>
    `;

    container.querySelectorAll('.discount-toggle').forEach(toggle => {
        toggle.addEventListener('change', () => {
            const code = codes.find(d => d.id === toggle.dataset.id);
            if (code) { code.active = toggle.checked; Store.save(); }
        });
    });

    container.querySelectorAll('.discount-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            Store.data.settings.discountCodes = codes.filter(d => d.id !== btn.dataset.id);
            Store.save();
            renderDiscountCodesSettings();
        });
    });

    container.querySelector('#addDiscountCodeBtn')?.addEventListener('click', () => {
        const code = prompt('Discount code (e.g., WELCOME10):');
        if (!code) return;
        const type = prompt('Type: "percent" or "flat":') || 'percent';
        const value = parseFloat(prompt(type === 'percent' ? 'Discount %:' : 'Discount $ amount:') || '10');
        const expiresAt = prompt('Expiry date (YYYY-MM-DD, or leave blank for no expiry):') || '';

        Store.data.settings.discountCodes.push({
            id: 'disc-' + crypto.randomUUID().slice(0, 8),
            code: code.toUpperCase(),
            type: type === 'flat' ? 'flat' : 'percent',
            value,
            active: true,
            expiresAt
        });
        Store.save();
        renderDiscountCodesSettings();
    });
};

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
                        <strong>${getPetIcon(dog?.petType)} ${escapeHtml(dog?.name || 'Unknown')} — ${getServiceLabel(b.serviceId)}</strong>
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
// Public Form -> Pending Booking Bridge
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
        d.name.toLowerCase() === (formData.petName || formData.dogName || '').toLowerCase()
    );

    if (!dog && (formData.petName || formData.dogName)) {
        dog = Store.add('dogs', {
            clientId: client.id,
            petType: formData.petType || 'dog',
            name: formData.petName || formData.dogName,
            breed: formData.breed || '',
            size: formData.petSize || '',
            age: '', specialNeeds: '', vetInfo: '',
            allergies: [], temperament: [], tendencies: [], photos: []
        });
    }

    const serviceId = formData.serviceId || formData.service || '';
    const startDate = formData.startDate || todayStr();
    const endDate = formData.endDate || startDate;
    const addonIds = formData.addons || [];

    // Apply referral code if provided
    if (formData.referralCode && formData.referralCode.trim()) {
        const referrer = Store.getClientByReferralCode(formData.referralCode.trim().toUpperCase());
        if (referrer && referrer.id !== client.id) {
            client.referredBy = formData.referralCode.trim().toUpperCase();
            Store.update('clients', client.id, { referredBy: client.referredBy });
            // Credit the referrer
            const reward = Store.data.settings.referralRewardReferrer || 15;
            Store.update('clients', referrer.id, { referralCredits: (referrer.referralCredits || 0) + reward });
            // Credit the new client
            const newReward = Store.data.settings.referralRewardReferee || 10;
            Store.update('clients', client.id, { referralCredits: (client.referralCredits || 0) + newReward });
        }
    }

    const result = calcAmount(serviceId, startDate, endDate, addonIds, {
        petSize: formData.petSize || dog?.size,
        petBreed: formData.breed || dog?.breed,
        isPuppy: dog?.isPuppy || false,
        numPets: parseInt(formData.numPets) || 1,
        clientId: client.id,
        discountCode: formData.discountCode || ''
    });

    Store.add('bookings', {
        clientId: client.id,
        dogId: dog?.id || '',
        serviceId,
        employeeId: '',
        startDate,
        endDate,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentAmount: result.total,
        paidDate: '',
        notes: formData.message || '',
        addons: addonIds,
        pricingMeta: { size: formData.petSize, breed: formData.breed, numPets: parseInt(formData.numPets) || 1 }
    });
};

// Public message bridge
window.createMessageFromForm = (formData) => {
    let client = Store.getAll('clients').find(c =>
        c.email === formData.email || c.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (!client) {
        client = Store.add('clients', {
            name: formData.name,
            email: formData.email,
            phone: '',
            address: '',
            notes: ''
        });
    }

    Store.add('messages', {
        clientId: client.id,
        content: formData.message,
        sender: 'client',
        timestamp: new Date().toISOString(),
        read: false
    });
};

// ========================================
// Init
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
    document.getElementById('pinInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    if (AUTH.restore()) {
        const savedView = localStorage.getItem('pawsView');
        if (savedView === 'dashboard') {
            document.body.classList.add('dashboard-active');
            initDashboard();
        }
    }
});
