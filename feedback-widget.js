// ============================================
// GenusPupClub — Floating Feedback Widget
// Appears on every page. Client screenshots, describes, submits.
// Admin copies to AI. Zero middleman.
// ============================================
(() => {
    const DB = 'gpc_';
    const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(DB + k)) || fb; } catch { return fb; } };
    const save = (k, d) => localStorage.setItem(DB + k, JSON.stringify(d));
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    // Don't show on admin dashboard
    if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('admin')) return;

    // Get client info if logged in
    const session = (() => { try { return JSON.parse(sessionStorage.getItem('gpc_client_auth') || 'null'); } catch { return null; } })();

    // Detect current page
    const detectPage = () => {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        const hash = window.location.hash;
        const pages = {
            'index.html': 'Homepage', 'login.html': 'Login Page', 'portal.html': 'Client Portal',
            'report-card.html': 'Report Card', 'waiver.html': 'Waiver Page',
            'privacy.html': 'Privacy Policy', 'terms.html': 'Terms of Service'
        };
        let page = pages[path] || path;
        if (hash) page += ' → ' + hash.replace('#', '').replace(/-/g, ' ');
        return page;
    };

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        #gpc-fb-btn{position:fixed;bottom:24px;right:24px;z-index:99990;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#FF6B35,#E55A2B);color:#fff;border:none;cursor:pointer;font-size:1.5rem;box-shadow:0 4px 16px rgba(255,107,53,.4);transition:all .3s;display:flex;align-items:center;justify-content:center}
        #gpc-fb-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(255,107,53,.5)}
        #gpc-fb-btn .pulse{position:absolute;width:100%;height:100%;border-radius:50%;background:rgba(255,107,53,.3);animation:gpcPulse 2s infinite}
        @keyframes gpcPulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.8);opacity:0}}
        #gpc-fb-panel{position:fixed;top:0;right:-420px;width:400px;max-width:92vw;height:100vh;background:#fff;z-index:99991;box-shadow:-4px 0 30px rgba(0,0,0,.15);transition:right .35s ease;display:flex;flex-direction:column;font-family:'Inter',sans-serif}
        #gpc-fb-panel.open{right:0}
        #gpc-fb-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.3);z-index:99990;display:none}
        #gpc-fb-overlay.open{display:block}
        .gpc-fb-header{padding:20px 24px;background:linear-gradient(135deg,#FF6B35,#E55A2B);color:#fff}
        .gpc-fb-body{flex:1;overflow-y:auto;padding:20px 24px}
        .gpc-fb-field{margin-bottom:16px}
        .gpc-fb-label{display:block;font-size:.82rem;font-weight:600;color:#636E72;margin-bottom:6px}
        .gpc-fb-input,.gpc-fb-textarea,.gpc-fb-select{width:100%;padding:10px 14px;border:2px solid #E9ECEF;border-radius:10px;font-size:.9rem;font-family:inherit;transition:border .2s;outline:none;box-sizing:border-box}
        .gpc-fb-input:focus,.gpc-fb-textarea:focus,.gpc-fb-select:focus{border-color:#FF6B35}
        .gpc-fb-cats{display:flex;flex-wrap:wrap;gap:8px}
        .gpc-fb-cat{padding:8px 14px;border:2px solid #E9ECEF;border-radius:10px;cursor:pointer;font-size:.85rem;transition:all .2s;background:#fff;display:flex;align-items:center;gap:6px}
        .gpc-fb-cat:hover{border-color:#FF6B35;background:rgba(255,107,53,.03)}
        .gpc-fb-cat.active{border-color:#FF6B35;background:rgba(255,107,53,.08);color:#FF6B35;font-weight:600}
        .gpc-fb-urgency{display:flex;gap:6px}
        .gpc-fb-urg{flex:1;padding:10px;border:2px solid #E9ECEF;border-radius:10px;cursor:pointer;text-align:center;font-size:.82rem;font-weight:600;transition:all .2s}
        .gpc-fb-urg:hover{border-color:#FF6B35}
        .gpc-fb-urg.active{color:#fff}
        .gpc-fb-urg[data-v="low"].active{background:#00B894;border-color:#00B894}
        .gpc-fb-urg[data-v="medium"].active{background:#FDCB6E;border-color:#FDCB6E;color:#333}
        .gpc-fb-urg[data-v="high"].active{background:#E17055;border-color:#E17055}
        .gpc-fb-urg[data-v="urgent"].active{background:#D63031;border-color:#D63031}
        .gpc-fb-submit{width:100%;padding:14px;background:linear-gradient(135deg,#FF6B35,#E55A2B);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;margin-top:8px}
        .gpc-fb-submit:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(255,107,53,.3)}
        .gpc-fb-submit:active{transform:translateY(0)}
        .gpc-fb-screenshots{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
        .gpc-fb-ss{position:relative;width:72px;height:72px;border-radius:8px;overflow:hidden;border:2px solid #E9ECEF}
        .gpc-fb-ss img{width:100%;height:100%;object-fit:cover}
        .gpc-fb-ss button{position:absolute;top:2px;right:2px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:.65rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .gpc-fb-success{text-align:center;padding:40px 20px}
        .gpc-fb-badge{display:inline-block;padding:3px 10px;border-radius:50px;font-size:.72rem;font-weight:600}
        .gpc-fb-history-item{padding:12px 0;border-bottom:1px solid #E9ECEF}
        @media(max-width:500px){#gpc-fb-panel{width:100%;max-width:100%}#gpc-fb-btn{bottom:16px;right:16px;width:50px;height:50px;font-size:1.3rem}}
    `;
    document.head.appendChild(style);

    // Create floating button
    const btn = document.createElement('button');
    btn.id = 'gpc-fb-btn';
    btn.innerHTML = '<div class="pulse"></div>💬';
    btn.title = 'Share Feedback';
    document.body.appendChild(btn);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'gpc-fb-overlay';
    document.body.appendChild(overlay);

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'gpc-fb-panel';
    document.body.appendChild(panel);

    let pendingScreenshots = [];
    let panelMode = 'form'; // 'form', 'success', 'history'

    const openPanel = () => { panel.classList.add('open'); overlay.classList.add('open'); renderPanel(); };
    const closePanel = () => { panel.classList.remove('open'); overlay.classList.remove('open'); pendingScreenshots = []; panelMode = 'form'; };
    btn.addEventListener('click', openPanel);
    overlay.addEventListener('click', closePanel);

    const renderPanel = () => {
        if (panelMode === 'success') { renderSuccess(); return; }
        if (panelMode === 'history') { renderHistory(); return; }

        const page = detectPage();
        const feedback = load('feedback', []);
        const myCount = session ? feedback.filter(f => f.clientId === session.id).length : 0;

        panel.innerHTML = `
        <div class="gpc-fb-header">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div style="font-size:1.15rem;font-weight:700">Share Your Feedback</div>
                    <div style="font-size:.82rem;opacity:.85;margin-top:2px">Help us make GenusPupClub better</div>
                </div>
                <button onclick="document.getElementById('gpc-fb-panel').classList.remove('open');document.getElementById('gpc-fb-overlay').classList.remove('open')" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem">✕</button>
            </div>
            ${myCount > 0 ? `<button onclick="window._gpcFbHistory()" style="margin-top:10px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:.82rem;font-family:inherit">View My Submissions (${myCount})</button>` : ''}
        </div>
        <div class="gpc-fb-body">
            <div style="padding:8px 12px;background:#F8F9FA;border-radius:8px;margin-bottom:16px;font-size:.82rem;color:#636E72">
                📍 You're on: <strong>${esc(page)}</strong>
            </div>

            <div class="gpc-fb-field">
                <label class="gpc-fb-label">What type of feedback?</label>
                <div class="gpc-fb-cats" id="gpcFbCats">
                    <div class="gpc-fb-cat active" data-cat="suggestion" onclick="window._gpcFbCat(this)">💡 Suggestion</div>
                    <div class="gpc-fb-cat" data-cat="bug" onclick="window._gpcFbCat(this)">🐛 Something's Broken</div>
                    <div class="gpc-fb-cat" data-cat="complaint" onclick="window._gpcFbCat(this)">😤 Complaint</div>
                    <div class="gpc-fb-cat" data-cat="feature" onclick="window._gpcFbCat(this)">🚀 Feature Idea</div>
                    <div class="gpc-fb-cat" data-cat="compliment" onclick="window._gpcFbCat(this)">🌟 Love It!</div>
                    <div class="gpc-fb-cat" data-cat="design" onclick="window._gpcFbCat(this)">🎨 Design/Look</div>
                </div>
            </div>

            <div class="gpc-fb-field" id="gpcFbPrompts">
                <label class="gpc-fb-label">Common things to look for:</label>
                <select class="gpc-fb-select" id="gpcFbPromptSelect" onchange="if(this.value){document.getElementById('gpcFbSummary').value=this.value;this.value=''}">
                    <option value="">— Pick one or write your own below —</option>
                </select>
            </div>

            <div class="gpc-fb-field">
                <label class="gpc-fb-label">What's up? *</label>
                <input class="gpc-fb-input" id="gpcFbSummary" placeholder="Quick summary — e.g. 'Button doesn't work on booking page'">
            </div>

            <div class="gpc-fb-field">
                <label class="gpc-fb-label">Tell us more (optional but super helpful)</label>
                <textarea class="gpc-fb-textarea" id="gpcFbDetails" rows="4" placeholder="What happened? What did you expect? What were you trying to do? The more detail, the faster we fix it."></textarea>
            </div>

            <div class="gpc-fb-field">
                <label class="gpc-fb-label">How urgent is this?</label>
                <div class="gpc-fb-urgency" id="gpcFbUrg">
                    <div class="gpc-fb-urg" data-v="low" onclick="window._gpcFbUrg(this)">Low<br><span style="font-size:.7rem;font-weight:400">Nice to have</span></div>
                    <div class="gpc-fb-urg active" data-v="medium" onclick="window._gpcFbUrg(this)">Medium<br><span style="font-size:.7rem;font-weight:400">Should fix</span></div>
                    <div class="gpc-fb-urg" data-v="high" onclick="window._gpcFbUrg(this)">High<br><span style="font-size:.7rem;font-weight:400">Big problem</span></div>
                    <div class="gpc-fb-urg" data-v="urgent" onclick="window._gpcFbUrg(this)">Urgent<br><span style="font-size:.7rem;font-weight:400">Can't use site</span></div>
                </div>
            </div>

            <div class="gpc-fb-field">
                <label class="gpc-fb-label">📸 Screenshots / Photos (optional — SUPER helpful)</label>
                <div style="font-size:.78rem;color:#B2BEC3;margin-bottom:8px">Take a photo of what's wrong, screenshot the page, snap anything visual. This is the #1 thing that helps us fix issues fast.</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <label style="padding:10px 16px;border:2px dashed #E9ECEF;border-radius:10px;cursor:pointer;font-size:.85rem;color:#636E72;display:flex;align-items:center;gap:6px;transition:all .2s;flex:1;justify-content:center;min-width:140px" onmouseover="this.style.borderColor='#FF6B35'" onmouseout="this.style.borderColor='#E9ECEF'">
                        📷 Take Photo
                        <input type="file" accept="image/*" capture="environment" style="display:none" onchange="window._gpcFbPhoto(this)">
                    </label>
                    <label style="padding:10px 16px;border:2px dashed #E9ECEF;border-radius:10px;cursor:pointer;font-size:.85rem;color:#636E72;display:flex;align-items:center;gap:6px;transition:all .2s;flex:1;justify-content:center;min-width:140px" onmouseover="this.style.borderColor='#FF6B35'" onmouseout="this.style.borderColor='#E9ECEF'">
                        🖼️ Choose from Gallery
                        <input type="file" accept="image/*" multiple style="display:none" onchange="window._gpcFbPhoto(this)">
                    </label>
                </div>
                <div class="gpc-fb-screenshots" id="gpcFbSS"></div>
            </div>

            ${!session ? `<div class="gpc-fb-field">
                <label class="gpc-fb-label">Your Name (optional)</label>
                <input class="gpc-fb-input" id="gpcFbName" placeholder="So we know who to thank">
            </div>` : ''}

            <button class="gpc-fb-submit" onclick="window._gpcFbSubmit()">📩 Submit Feedback</button>
            <div style="text-align:center;font-size:.75rem;color:#B2BEC3;margin-top:10px">Your feedback goes directly to our team. We review everything.</div>
        </div>`;
        // Init prompts for default category
        setTimeout(() => updatePrompts('suggestion'), 0);
    };

    const renderSuccess = () => {
        panel.innerHTML = `
        <div class="gpc-fb-header">
            <div style="font-size:1.15rem;font-weight:700">Thank You!</div>
        </div>
        <div class="gpc-fb-body">
            <div class="gpc-fb-success">
                <div style="font-size:4rem;margin-bottom:16px">🎉</div>
                <h3 style="margin:0 0 8px;font-size:1.3rem">Feedback Received!</h3>
                <p style="color:#636E72;margin:0 0 16px;line-height:1.6">We got it. Your feedback has been logged and our team will review it. ${session ? 'Check back in your portal to see updates on your submissions.' : ''}</p>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                    <button onclick="window._gpcFbMode='form';window._gpcFbRender()" style="padding:10px 20px;background:#FF6B35;color:#fff;border:none;border-radius:10px;cursor:pointer;font-family:inherit;font-weight:600">Submit Another</button>
                    <button onclick="document.getElementById('gpc-fb-panel').classList.remove('open');document.getElementById('gpc-fb-overlay').classList.remove('open')" style="padding:10px 20px;background:#F8F9FA;color:#636E72;border:none;border-radius:10px;cursor:pointer;font-family:inherit;font-weight:600">Close</button>
                </div>
            </div>
        </div>`;
    };

    const renderHistory = () => {
        const feedback = load('feedback', []);
        const mine = session ? feedback.filter(f => f.clientId === session.id).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) : [];
        const statusInfo = { new: { label: 'Submitted', color: '#74B9FF' }, reviewed: { label: 'Reviewed', color: '#A29BFE' }, in_progress: { label: 'Working On It', color: '#FDCB6E' }, implemented: { label: 'Done!', color: '#00B894' }, wont_fix: { label: "Can't Do", color: '#636E72' }, duplicate: { label: 'Already Reported', color: '#B2BEC3' } };
        const catIcons = { suggestion: '💡', bug: '🐛', complaint: '😤', feature: '🚀', compliment: '🌟', design: '🎨', other: '📝' };

        panel.innerHTML = `
        <div class="gpc-fb-header">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="font-size:1.15rem;font-weight:700">My Submissions (${mine.length})</div>
                <button onclick="window._gpcFbMode='form';window._gpcFbRender()" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:.82rem;font-family:inherit">← New Feedback</button>
            </div>
        </div>
        <div class="gpc-fb-body">
            ${mine.length === 0 ? '<div style="text-align:center;padding:30px;color:#B2BEC3">No submissions yet.</div>' : mine.map(f => {
                const st = statusInfo[f.status] || statusInfo.new;
                const icon = catIcons[f.category] || '📝';
                return `<div class="gpc-fb-history-item">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <div><span style="font-size:1rem">${icon}</span> <strong style="font-size:.9rem">${esc(f.summary)}</strong></div>
                        <span class="gpc-fb-badge" style="background:${st.color}20;color:${st.color}">${st.label}</span>
                    </div>
                    ${f.details ? `<div style="font-size:.82rem;color:#636E72;margin-top:4px">${esc(f.details).substring(0, 120)}${f.details.length > 120 ? '...' : ''}</div>` : ''}
                    ${f.adminNotes ? `<div style="font-size:.82rem;margin-top:8px;padding:8px 12px;background:#F8F9FA;border-radius:8px;border-left:3px solid #6C5CE7"><strong style="color:#6C5CE7">Team response:</strong> ${esc(f.adminNotes)}</div>` : ''}
                    ${f.screenshots?.length ? `<div style="font-size:.78rem;color:#B2BEC3;margin-top:4px">📎 ${f.screenshots.length} screenshot(s)</div>` : ''}
                    <div style="font-size:.72rem;color:#B2BEC3;margin-top:4px">${f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''} · ${esc(f.affects || detectPage())}</div>
                </div>`;
            }).join('')}
        </div>`;
    };

    // Category-specific prompts — gives clients ideas of what to report
    const promptsByCategory = {
        suggestion: [
            'Add text/SMS updates for visits',
            'Show estimated arrival time for sitter',
            'Add a calendar view for my bookings',
            'Let me set recurring bookings myself',
            'Show more photos during visits',
            'Add video updates option',
            'Let me tip through the app',
            'Add a chat feature with my sitter',
            'Show a map of where my dog walked',
            'Add more payment options',
            'Let me book same-day visits',
            'Add a waitlist for fully booked days'
        ],
        bug: [
            'Page won\'t load / shows blank screen',
            'Button doesn\'t do anything when I click it',
            'Wrong price is showing',
            'Photos aren\'t loading',
            'Can\'t log in / password not working',
            'Page looks broken on my phone',
            'Form won\'t submit',
            'Calendar shows wrong dates',
            'Got an error message (describe it below)',
            'Payment didn\'t go through',
            'Notification not showing up',
            'Page is very slow to load'
        ],
        complaint: [
            'Didn\'t receive confirmation email',
            'Booking was wrong / incorrect details',
            'Photos from visit were missing',
            'Report card wasn\'t sent',
            'Waited too long for response',
            'Invoice amount seems wrong',
            'Sitter was late',
            'Communication could be better',
            'Hard to find what I\'m looking for',
            'Website is confusing to navigate'
        ],
        feature: [
            'Pet health/weight tracking over time',
            'Vaccination reminder alerts',
            'Multi-pet booking discount shown upfront',
            'Monthly spending summary',
            'Printable report cards',
            'Favorite sitter preference',
            'Birthday treats for my pup',
            'Loyalty rewards / punch card',
            'Before & after grooming photos',
            'Live webcam during daycare',
            'Pet social profiles to share',
            'Automated rebooking'
        ],
        compliment: [
            'My dog loves their sitter!',
            'The photo updates made my day',
            'Booking process was super easy',
            'Great communication throughout',
            'Report card was detailed and helpful',
            'Love the portal — easy to use',
            'Best dog care service I\'ve used',
            'Pricing is fair and transparent'
        ],
        design: [
            'Text is too small to read',
            'Colors are hard to see / low contrast',
            'Buttons are too small on mobile',
            'Layout looks weird on my phone',
            'Images are blurry or stretched',
            'Too much scrolling to find things',
            'Font is hard to read',
            'Spacing feels cramped',
            'Would look better with different colors',
            'Navigation is confusing',
            'Logo needs work',
            'Footer has too much / too little info'
        ]
    };

    const updatePrompts = (category) => {
        const prompts = promptsByCategory[category] || [];
        const container = document.getElementById('gpcFbPrompts');
        const select = document.getElementById('gpcFbPromptSelect');
        if (!container || !select) return;
        if (prompts.length === 0) { container.style.display = 'none'; return; }
        container.style.display = '';
        select.innerHTML = '<option value="">— Pick one or write your own below —</option>' +
            prompts.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('');
    };

    // Global handlers
    window._gpcFbCat = (el) => {
        document.querySelectorAll('.gpc-fb-cat').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        updatePrompts(el.dataset.cat);
    };
    window._gpcFbUrg = (el) => { document.querySelectorAll('.gpc-fb-urg').forEach(u => u.classList.remove('active')); el.classList.add('active'); };

    window._gpcFbPhoto = (input) => {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                pendingScreenshots.push({ name: file.name, data: e.target.result });
                const container = document.getElementById('gpcFbSS');
                if (container) {
                    container.innerHTML = pendingScreenshots.map((s, i) => `
                        <div class="gpc-fb-ss">
                            <img src="${s.data}">
                            <button onclick="event.stopPropagation();window._gpcFbRemoveSS(${i})">✕</button>
                        </div>
                    `).join('');
                }
            };
            reader.readAsDataURL(file);
        });
    };

    window._gpcFbRemoveSS = (idx) => { pendingScreenshots.splice(idx, 1); window._gpcFbPhoto({ files: [] }); };

    window._gpcFbSubmit = () => {
        const summary = document.getElementById('gpcFbSummary')?.value?.trim();
        if (!summary) { alert('Please describe your feedback.'); return; }

        const category = document.querySelector('.gpc-fb-cat.active')?.dataset?.cat || 'suggestion';
        const priority = document.querySelector('.gpc-fb-urg.active')?.dataset?.v || 'medium';
        const details = document.getElementById('gpcFbDetails')?.value?.trim() || '';
        const anonName = document.getElementById('gpcFbName')?.value?.trim() || '';

        const feedback = load('feedback', []);
        feedback.push({
            id: uid(),
            category,
            priority,
            affects: detectPage(),
            summary,
            details,
            clientId: session?.id || null,
            clientName: session?.name || anonName || 'Anonymous Visitor',
            screenshots: [...pendingScreenshots],
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            loggedBy: session ? 'client-widget' : 'visitor-widget',
            adminNotes: '',
            source: 'widget',
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            screenSize: window.innerWidth + 'x' + window.innerHeight
        });
        save('feedback', feedback);

        pendingScreenshots = [];
        panelMode = 'success';
        renderSuccess();

        // Pulse the button green briefly
        btn.style.background = 'linear-gradient(135deg,#00B894,#00A381)';
        setTimeout(() => { btn.style.background = ''; }, 2000);
    };

    window._gpcFbHistory = () => { panelMode = 'history'; renderHistory(); };
    window._gpcFbMode = 'form';
    window._gpcFbRender = () => { panelMode = window._gpcFbMode; renderPanel(); };
})();
