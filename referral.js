// ============================================
// GenusPupClub — Referral & Loyalty System
// ============================================

const GPC_LOYALTY = (() => {
    const DB = 'gpc_';
    const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(DB + k)) || fb; } catch { return fb; } };
    const save = (k, d) => {
        localStorage.setItem(DB + k, JSON.stringify(d));
        if (typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected()) {
            GPC_SUPABASE.save(k, d).catch(() => {});
        }
    };
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const todayStr = () => new Date().toISOString().split('T')[0];

    // ---- Settings ----
    const DEFAULT_SETTINGS = {
        // Referral
        referralReward: 10,          // $ off for referrer
        referralNewClientReward: 10,  // $ off for new client
        referralEnabled: true,

        // Loyalty
        loyaltyEnabled: true,
        pointsPerDollar: 1,          // 1 point per $1 spent
        freeVisitPoints: 250,        // Points needed for free visit
        freeVisitValue: 25,          // $ value of free visit
        birthdayBonus: 50,           // Bonus points on dog's birthday
        signupBonus: 25,             // Points for signing up

        // Tiers
        tiers: [
            { name: 'Pup', minPoints: 0, perks: 'Standard service', discount: 0 },
            { name: 'Good Boy', minPoints: 100, perks: '5% off all services', discount: 5 },
            { name: 'Best Friend', minPoints: 500, perks: '10% off + priority booking', discount: 10 },
            { name: 'Top Dog', minPoints: 1000, perks: '15% off + free birthday grooming', discount: 15 },
            { name: 'VIP Pack Leader', minPoints: 2500, perks: '20% off + free monthly bath', discount: 20 }
        ]
    };

    let settings = load('loyalty_settings', DEFAULT_SETTINGS);
    if (!localStorage.getItem(DB + 'loyalty_settings')) save('loyalty_settings', settings);

    // ---- Referral Codes ----
    const generateCode = (clientName) => {
        const clean = clientName.replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
        return clean + Math.random().toString(36).substring(2, 5).toUpperCase();
    };

    const getOrCreateCode = (clientId, clientName) => {
        let referrals = load('referral_codes', []);
        let existing = referrals.find(r => r.clientId === clientId);
        if (existing) return existing.code;
        const code = generateCode(clientName);
        referrals.push({ clientId, clientName, code, createdAt: todayStr(), uses: 0 });
        save('referral_codes', referrals);
        return code;
    };

    const applyReferralCode = (code, newClientId, newClientName) => {
        let referrals = load('referral_codes', []);
        const ref = referrals.find(r => r.code === code.toUpperCase());
        if (!ref) return { success: false, message: 'Invalid referral code' };
        if (ref.clientId === newClientId) return { success: false, message: "You can't refer yourself" };

        // Record the referral
        let history = load('referral_history', []);
        if (history.find(h => h.newClientId === newClientId)) return { success: false, message: 'You already used a referral code' };

        ref.uses++;
        save('referral_codes', referrals);

        history.push({
            id: uid(), referrerClientId: ref.clientId, referrerName: ref.clientName,
            newClientId, newClientName, code, date: todayStr(),
            referrerReward: settings.referralReward,
            newClientReward: settings.referralNewClientReward,
            redeemed: false
        });
        save('referral_history', history);

        // Add credits
        addCredit(ref.clientId, settings.referralReward, `Referral reward — ${newClientName} signed up`);
        addCredit(newClientId, settings.referralNewClientReward, `Welcome bonus — referred by ${ref.clientName}`);

        // Add loyalty points
        addPoints(ref.clientId, 50, 'Referral bonus');

        return { success: true, message: `${ref.clientName} gets ${fmt(settings.referralReward)} off, you get ${fmt(settings.referralNewClientReward)} off!` };
    };

    // ---- Credits ----
    const addCredit = (clientId, amount, reason) => {
        let credits = load('client_credits', []);
        credits.push({ id: uid(), clientId, amount, reason, date: todayStr(), used: false });
        save('client_credits', credits);
    };

    const getCredits = (clientId) => {
        return load('client_credits', []).filter(c => c.clientId === clientId && !c.used);
    };

    const getTotalCredit = (clientId) => {
        return getCredits(clientId).reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
    };

    const useCredit = (clientId, amount) => {
        let credits = load('client_credits', []);
        let remaining = amount;
        credits.filter(c => c.clientId === clientId && !c.used).forEach(c => {
            if (remaining <= 0) return;
            if (c.amount <= remaining) { c.used = true; remaining -= c.amount; }
            else { c.amount -= remaining; remaining = 0; }
        });
        save('client_credits', credits);
    };

    // ---- Loyalty Points ----
    const addPoints = (clientId, points, reason) => {
        let ledger = load('loyalty_ledger', []);
        ledger.push({ id: uid(), clientId, points, reason, date: todayStr() });
        save('loyalty_ledger', ledger);
    };

    const getPoints = (clientId) => {
        return load('loyalty_ledger', []).filter(l => l.clientId === clientId).reduce((s, l) => s + (l.points || 0), 0);
    };

    const getTier = (clientId) => {
        const pts = getPoints(clientId);
        const tiers = settings.tiers || DEFAULT_SETTINGS.tiers;
        let tier = tiers[0];
        for (const t of tiers) { if (pts >= t.minPoints) tier = t; }
        return { ...tier, points: pts, nextTier: tiers.find(t => t.minPoints > pts) || null };
    };

    const redeemFreeVisit = (clientId) => {
        const pts = getPoints(clientId);
        if (pts < settings.freeVisitPoints) return { success: false, message: `Need ${settings.freeVisitPoints} points. You have ${pts}.` };
        addPoints(clientId, -settings.freeVisitPoints, 'Redeemed free visit');
        addCredit(clientId, settings.freeVisitValue, 'Free visit reward');
        return { success: true, message: `Redeemed! ${fmt(settings.freeVisitValue)} credit added.` };
    };

    // Auto-add points after payment
    const onPaymentComplete = (clientId, amount) => {
        const pts = Math.floor(amount * settings.pointsPerDollar);
        if (pts > 0) addPoints(clientId, pts, `Earned from ${fmt(amount)} payment`);
    };

    // ---- Format ----
    const fmt = (n) => '$' + Number(n || 0).toFixed(2);

    // ---- Admin Dashboard Renderer ----
    const renderAdminPanel = () => {
        settings = load('loyalty_settings', DEFAULT_SETTINGS);
        const referralCodes = load('referral_codes', []);
        const referralHistory = load('referral_history', []);
        const allCredits = load('client_credits', []);
        const allLedger = load('loyalty_ledger', []);
        const clients = load('clients', []);

        const totalReferrals = referralHistory.length;
        const totalCreditsGiven = allCredits.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
        const totalPointsIssued = allLedger.filter(l => l.points > 0).reduce((s, l) => s + l.points, 0);

        return `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-label">Total Referrals</div><div class="stat-value">${totalReferrals}</div></div>
                <div class="stat-card green"><div class="stat-label">Credits Given</div><div class="stat-value">${fmt(totalCreditsGiven)}</div></div>
                <div class="stat-card blue"><div class="stat-label">Points Issued</div><div class="stat-value">${totalPointsIssued.toLocaleString()}</div></div>
                <div class="stat-card yellow"><div class="stat-label">Active Codes</div><div class="stat-value">${referralCodes.length}</div></div>
            </div>

            <div class="grid-2">
                <!-- Loyalty Settings -->
                <div class="card">
                    <div class="card-title" style="margin-bottom:12px">Loyalty Settings</div>
                    <div class="form-row">
                        <div class="form-group"><label class="form-label">Points per $1 Spent</label><input class="form-input" id="lyPtsPerDollar" type="number" value="${settings.pointsPerDollar}"></div>
                        <div class="form-group"><label class="form-label">Points for Free Visit</label><input class="form-input" id="lyFreeVisitPts" type="number" value="${settings.freeVisitPoints}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label class="form-label">Free Visit Value ($)</label><input class="form-input" id="lyFreeVisitVal" type="number" value="${settings.freeVisitValue}"></div>
                        <div class="form-group"><label class="form-label">Signup Bonus Points</label><input class="form-input" id="lySignupBonus" type="number" value="${settings.signupBonus}"></div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="GPC_LOYALTY.saveSettings()">Save Loyalty Settings</button>
                </div>

                <!-- Referral Settings -->
                <div class="card">
                    <div class="card-title" style="margin-bottom:12px">Referral Settings</div>
                    <div class="form-row">
                        <div class="form-group"><label class="form-label">Referrer Gets ($)</label><input class="form-input" id="lyRefReward" type="number" value="${settings.referralReward}"></div>
                        <div class="form-group"><label class="form-label">New Client Gets ($)</label><input class="form-input" id="lyNewReward" type="number" value="${settings.referralNewClientReward}"></div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="GPC_LOYALTY.saveSettings()">Save Referral Settings</button>
                </div>
            </div>

            <!-- Tier Table -->
            <div class="card">
                <div class="card-title" style="margin-bottom:12px">Loyalty Tiers</div>
                <div class="table-wrap"><table>
                    <thead><tr><th>Tier</th><th>Min Points</th><th>Perks</th><th>Discount</th></tr></thead>
                    <tbody>${(settings.tiers || []).map(t => `<tr><td><strong>${t.name}</strong></td><td>${t.minPoints}</td><td>${t.perks}</td><td>${t.discount}%</td></tr>`).join('')}</tbody>
                </table></div>
            </div>

            <!-- Client Loyalty Status -->
            <div class="card">
                <div class="card-title" style="margin-bottom:12px">Client Loyalty Status</div>
                <div class="table-wrap"><table>
                    <thead><tr><th>Client</th><th>Points</th><th>Tier</th><th>Discount</th><th>Credits</th><th>Referral Code</th><th>Referrals</th></tr></thead>
                    <tbody>${clients.map(c => {
                        const tier = getTier(c.id);
                        const credit = getTotalCredit(c.id);
                        const code = referralCodes.find(r => r.clientId === c.id);
                        const refs = referralHistory.filter(h => h.referrerClientId === c.id);
                        return `<tr>
                            <td><strong>${c.name || '—'}</strong></td>
                            <td>${tier.points}</td>
                            <td><span class="badge badge-confirmed">${tier.name}</span></td>
                            <td>${tier.discount}%</td>
                            <td>${credit > 0 ? fmt(credit) : '—'}</td>
                            <td style="font-family:monospace;font-size:.82rem">${code?.code || '—'}</td>
                            <td>${refs.length}</td>
                        </tr>`;
                    }).join('') || '<tr><td colspan="7" class="empty">No clients yet</td></tr>'}</tbody>
                </table></div>
            </div>

            <!-- Referral History -->
            <div class="card">
                <div class="card-title" style="margin-bottom:12px">Referral History</div>
                ${referralHistory.length ? `<div class="table-wrap"><table>
                    <thead><tr><th>Date</th><th>Referrer</th><th>New Client</th><th>Code</th><th>Rewards</th></tr></thead>
                    <tbody>${referralHistory.slice().reverse().map(h => `<tr>
                        <td>${h.date}</td><td>${h.referrerName}</td><td>${h.newClientName}</td>
                        <td style="font-family:monospace">${h.code}</td>
                        <td>${fmt(h.referrerReward)} + ${fmt(h.newClientReward)}</td>
                    </tr>`).join('')}</tbody>
                </table></div>` : '<div class="empty">No referrals yet</div>'}
            </div>
        `;
    };

    // ---- Client Portal Renderer ----
    const renderClientPanel = (clientId, clientName) => {
        const tier = getTier(clientId);
        const credit = getTotalCredit(clientId);
        const code = getOrCreateCode(clientId, clientName);
        const tiers = settings.tiers || DEFAULT_SETTINGS.tiers;
        const ledger = load('loyalty_ledger', []).filter(l => l.clientId === clientId).slice(-10).reverse();

        return `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-label">My Points</div><div class="stat-value">${tier.points}</div><div class="stat-sub">${tier.nextTier ? `${tier.nextTier.minPoints - tier.points} to ${tier.nextTier.name}` : 'Max tier!'}</div></div>
                <div class="stat-card green"><div class="stat-label">My Tier</div><div class="stat-value">${tier.name}</div><div class="stat-sub">${tier.discount}% off all services</div></div>
                <div class="stat-card blue"><div class="stat-label">Credits</div><div class="stat-value">${credit > 0 ? fmt(credit) : '$0'}</div></div>
                <div class="stat-card yellow"><div class="stat-label">Free Visit</div><div class="stat-value">${tier.points >= settings.freeVisitPoints ? 'Available!' : `${settings.freeVisitPoints - tier.points} pts away`}</div>${tier.points >= settings.freeVisitPoints ? `<button class="btn btn-sm btn-primary" style="margin-top:6px" onclick="GPC_LOYALTY.redeemFreeVisit('${clientId}');renderTab()">Redeem</button>` : ''}</div>
            </div>

            <div class="grid-2">
                <!-- Referral -->
                <div class="card">
                    <div class="card-title" style="margin-bottom:12px">Refer a Friend</div>
                    <p style="font-size:.88rem;color:var(--text-light);margin-bottom:12px">Share your code — you both get ${fmt(settings.referralReward)} off!</p>
                    <div style="background:rgba(255,107,53,.05);padding:16px;border-radius:10px;text-align:center;margin-bottom:12px">
                        <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px">Your Referral Code</div>
                        <div style="font-size:1.6rem;font-weight:700;font-family:monospace;color:var(--primary);letter-spacing:3px">${code}</div>
                    </div>
                    <button class="btn btn-sm btn-primary" style="width:100%" onclick="navigator.clipboard?.writeText('${code}');alert('Code copied!')">Copy Code</button>
                </div>

                <!-- Tier Progress -->
                <div class="card">
                    <div class="card-title" style="margin-bottom:12px">Loyalty Tiers</div>
                    ${tiers.map(t => {
                        const active = tier.name === t.name;
                        return `<div style="display:flex;justify-content:space-between;padding:8px 0;${active ? 'font-weight:700;color:var(--primary)' : 'color:var(--text-muted)'}"><span>${active ? '★ ' : ''}${t.name} (${t.minPoints}+ pts)</span><span>${t.discount}% off</span></div>`;
                    }).join('')}
                </div>
            </div>

            <!-- Points History -->
            <div class="card">
                <div class="card-title" style="margin-bottom:12px">Points History</div>
                ${ledger.length ? ledger.map(l => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:.88rem"><span>${l.reason}</span><span style="font-weight:700;color:${l.points > 0 ? 'var(--success)' : 'var(--danger)'}">${l.points > 0 ? '+' : ''}${l.points} pts</span><span style="color:var(--text-muted)">${l.date}</span></div>`).join('') : '<div class="empty">Earn points by booking services!</div>'}
            </div>
        `;
    };

    const saveSettings = () => {
        const v = (id) => document.getElementById(id)?.value;
        settings.pointsPerDollar = parseInt(v('lyPtsPerDollar')) || 1;
        settings.freeVisitPoints = parseInt(v('lyFreeVisitPts')) || 250;
        settings.freeVisitValue = parseInt(v('lyFreeVisitVal')) || 25;
        settings.signupBonus = parseInt(v('lySignupBonus')) || 25;
        settings.referralReward = parseInt(v('lyRefReward')) || 10;
        settings.referralNewClientReward = parseInt(v('lyNewReward')) || 10;
        save('loyalty_settings', settings);
        if (typeof GPC_NOTIFY !== 'undefined') GPC_NOTIFY.showToast('Saved', 'Loyalty settings updated', 'success');
    };

    return {
        getOrCreateCode, applyReferralCode, addCredit, getCredits, getTotalCredit, useCredit,
        addPoints, getPoints, getTier, redeemFreeVisit, onPaymentComplete,
        renderAdminPanel, renderClientPanel, saveSettings, settings
    };
})();
