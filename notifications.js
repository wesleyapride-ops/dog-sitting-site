// ============================================
// GenusPupClub — Notification System
// In-app notifications, email stubs, payment handles
// ============================================

const GPC_NOTIFY = (() => {
    const GPC = 'gpc_';
    const load = (key, fb) => { try { return JSON.parse(localStorage.getItem(GPC + key)) || fb; } catch { return fb; } };
    const save = (key, d) => {
        localStorage.setItem(GPC + key, JSON.stringify(d));
        if (typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected()) {
            GPC_SUPABASE.save(key, d).catch(() => {});
        }
    };
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const todayStr = () => new Date().toISOString().split('T')[0];
    const timeStr = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // ============================================
    // PAYMENT HANDLES (UPDATE THESE)
    // ============================================
    const PAYMENT_HANDLES = {
        zelle: { handle: 'Genuspupclub@gmail.com', label: 'Zelle', instructions: 'Send to Genuspupclub@gmail.com via Zelle' },
        venmo: { handle: '@GenusPupClub', label: 'Venmo', instructions: 'Send to @GenusPupClub on Venmo' },
        cashapp: { handle: '$m3lop3z', label: 'CashApp', instructions: 'Send to $m3lop3z on CashApp' },
        applepay: { handle: '(804) 258-3830', label: 'Apple Pay', instructions: 'Apple Pay to (804) 258-3830' },
        cash: { handle: 'In Person', label: 'Cash', instructions: 'Pay cash to your sitter at the visit' }
    };

    const getPaymentHandle = (method) => PAYMENT_HANDLES[method] || PAYMENT_HANDLES.cash;
    const getAllHandles = () => PAYMENT_HANDLES;

    // ============================================
    // IN-APP NOTIFICATIONS
    // ============================================
    let notifications = load('notifications', []);

    const notify = (type, title, message, forRole = 'all', userId = null) => {
        notifications = load('notifications', []);
        notifications.push({
            id: uid(), type, title, message, forRole, userId,
            date: todayStr(), time: timeStr(),
            read: false, createdAt: new Date().toISOString()
        });
        // Keep max 200
        if (notifications.length > 200) notifications = notifications.slice(-200);
        save('notifications', notifications);
        // Show toast if on page
        showToast(title, message, type);
    };

    const getNotifications = (role = 'all', userId = null) => {
        notifications = load('notifications', []);
        return notifications.filter(n => {
            if (n.forRole === 'all') return true;
            if (n.forRole === role) return true;
            if (n.userId && n.userId === userId) return true;
            return false;
        }).reverse();
    };

    const getUnreadCount = (role = 'all', userId = null) => {
        return getNotifications(role, userId).filter(n => !n.read).length;
    };

    const markRead = (notifId) => {
        notifications = load('notifications', []);
        const n = notifications.find(x => x.id === notifId);
        if (n) { n.read = true; save('notifications', notifications); }
    };

    const markAllRead = (role = 'all', userId = null) => {
        notifications = load('notifications', []);
        getNotifications(role, userId).forEach(n => { n.read = true; });
        save('notifications', notifications);
    };

    // ============================================
    // TOAST NOTIFICATIONS (in-page popup)
    // ============================================
    const showToast = (title, message, type = 'info') => {
        const colors = { info: '#3B82F6', success: '#00B894', warning: '#FDCB6E', error: '#E17055', booking: '#FF6B35', payment: '#00B894', message: '#8B5CF6' };
        const icons = { info: 'ℹ️', success: '✓', warning: '⚠️', error: '✕', booking: '📅', payment: '💰', message: '💬' };

        let container = document.getElementById('gpc-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'gpc-toast-container';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:380px;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 8px 30px rgba(0,0,0,0.12);border-left:4px solid ${colors[type] || colors.info};display:flex;gap:12px;align-items:flex-start;animation:slideIn .3s ease;font-family:'Inter',sans-serif;`;
        toast.innerHTML = `
            <span style="font-size:1.2rem;flex-shrink:0">${icons[type] || icons.info}</span>
            <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:.88rem;color:#2D3436">${title}</div>
                <div style="font-size:.82rem;color:#636E72;margin-top:2px">${message}</div>
            </div>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:1rem;color:#B2BEC3;flex-shrink:0">✕</button>
        `;
        container.appendChild(toast);

        // Auto-dismiss after 5 seconds
        setTimeout(() => { if (toast.parentElement) toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 5000);
    };

    // Add animation CSS
    if (!document.getElementById('gpc-toast-css')) {
        const style = document.createElement('style');
        style.id = 'gpc-toast-css';
        style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
        document.head.appendChild(style);
    }

    // ============================================
    // BOOKING NOTIFICATIONS
    // ============================================
    const onNewBooking = (booking) => {
        // Notify admin
        notify('booking', 'New Booking!', `${booking.clientName} booked ${booking.service} for ${booking.petName} on ${booking.date}`, 'admin');
        // Notify client
        notify('booking', 'Booking Confirmed', `Your ${booking.service} for ${booking.petName} is booked for ${booking.date} at ${booking.time || 'TBD'}. We'll confirm shortly!`, 'client', booking.clientId);
        // Send email
        sendEmail('booking_confirmation', booking);
    };

    const onBookingConfirmed = (booking) => {
        notify('success', 'Booking Confirmed', `${booking.clientName}'s ${booking.service} on ${booking.date} has been confirmed.`, 'admin');
        notify('success', 'Confirmed!', `Your ${booking.service} on ${booking.date} at ${booking.time || ''} is confirmed! See you then.`, 'client', booking.clientId);
        sendEmail('booking_confirmed', booking);
    };

    const onBookingCompleted = (booking) => {
        notify('success', 'Visit Complete', `${booking.petName}'s ${booking.service} is done! Time to invoice.`, 'admin');
        notify('success', 'Visit Complete!', `${booking.petName} had a great ${booking.service}! Check your portal for photos and invoice.`, 'client', booking.clientId);
        sendEmail('visit_complete', booking);
    };

    const onBookingCancelled = (booking) => {
        notify('warning', 'Booking Cancelled', `${booking.clientName} cancelled their ${booking.service} on ${booking.date}.`, 'admin');
        notify('warning', 'Booking Cancelled', `Your ${booking.service} on ${booking.date} has been cancelled.`, 'client', booking.clientId);
    };

    // ============================================
    // PAYMENT NOTIFICATIONS
    // ============================================
    const onPaymentReceived = (payment) => {
        const tipNote = payment.tip > 0 ? ` (+ $${Number(payment.tip).toFixed(2)} tip!)` : '';
        notify('payment', 'Payment Received!', `$${Number(payment.amount).toFixed(2)}${tipNote} via ${payment.method} from ${payment.clientName || 'client'}`, 'admin');
        notify('payment', 'Payment Confirmed', `Your payment of $${Number(payment.amount).toFixed(2)}${tipNote} has been received. Thank you!`, 'client', payment.clientId);
        sendEmail('payment_receipt', payment);
    };

    const onPaymentPending = (payment) => {
        const handle = getPaymentHandle(payment.method);
        notify('warning', 'Payment Pending', `$${Number(payment.amount).toFixed(2)} via ${payment.method} — awaiting confirmation`, 'admin');
        notify('info', 'Payment Instructions', `Please send $${Number(payment.amount + (payment.tip || 0)).toFixed(2)} to ${handle.instructions}. We'll confirm when received.`, 'client', payment.clientId);
    };

    // ============================================
    // MESSAGE NOTIFICATIONS
    // ============================================
    const onNewMessage = (message) => {
        if (message.from === 'GenusPupClub') {
            notify('message', 'New Message', `Message sent to ${message.to}: "${message.text.substring(0, 80)}..."`, 'admin');
            notify('message', 'New Message from GenusPupClub', message.text.substring(0, 120), 'client');
        } else {
            notify('message', 'New Client Message', `${message.from}: "${message.text.substring(0, 80)}..."`, 'admin');
        }
    };

    // ============================================
    // EMAIL SYSTEM — EmailJS Integration
    // ============================================
    const getEmailConfig = () => load('email_config', {
        enabled: false,
        serviceId: '',
        publicKey: '',
        adminEmail: 'Genuspupclub@gmail.com',
        sendToAdmin: true,
        sendToClient: true
    });

    // Built-in email templates (no need to create in EmailJS — uses default template)
    const EMAIL_TEMPLATES = {
        booking_confirmation: (data) => ({
            subject: `Booking Received — ${data.petName || 'Your Pup'}`,
            body: `Hi ${data.clientName || 'there'}!\n\nWe've received your booking request:\n\nService: ${data.service || '—'}\nPet: ${data.petName || '—'}\nDate: ${data.date || 'TBD'}\nTime: ${data.time || 'TBD'}\n\nWe'll confirm within 2 hours and reach out to schedule a meet & greet if this is your first visit.\n\nThanks for choosing GenusPupClub!\n— The GenusPupClub Team\n(804) 258-3830 | Genuspupclub@gmail.com`
        }),
        booking_confirmed: (data) => ({
            subject: `Confirmed! ${data.petName || 'Your Pup'}'s ${data.service || 'Visit'} on ${data.date || ''}`,
            body: `Hi ${data.clientName || 'there'}!\n\nGreat news — your booking is confirmed!\n\nService: ${data.service || '—'}\nPet: ${data.petName || '—'}\nDate: ${data.date || ''}\nTime: ${data.time || ''}\n\nReminders:\n• Have your pup ready with leash, food, and medications\n• We'll send photo updates during the visit\n• Cancel 24+ hrs in advance for a full refund\n\nSee you soon!\n— GenusPupClub`
        }),
        visit_complete: (data) => ({
            subject: `Visit Complete — ${data.petName || 'Your Pup'} Had a Great Time!`,
            body: `Hi ${data.clientName || 'there'}!\n\n${data.petName || 'Your pup'}'s ${data.service || 'visit'} is all wrapped up!\n\nCheck your portal for photos, a report card, and your invoice.\n\nAmount: ${data.amount ? '$' + Number(data.amount).toFixed(2) : 'See invoice'}\n\nThank you for trusting us with ${data.petName || 'your pup'}. We loved every minute!\n\n— GenusPupClub`
        }),
        payment_receipt: (data) => ({
            subject: `Payment Received — $${Number(data.amount || 0).toFixed(2)}`,
            body: `Hi ${data.clientName || 'there'}!\n\nWe've received your payment:\n\nAmount: $${Number(data.amount || 0).toFixed(2)}${data.tip > 0 ? '\nTip: $' + Number(data.tip).toFixed(2) + ' (Thank you!)' : ''}\nMethod: ${data.method || '—'}\nDate: ${data.date || new Date().toISOString().split('T')[0]}\n\nThank you for your payment!\n\n— GenusPupClub`
        }),
        message: (data) => ({
            subject: `Message from GenusPupClub${data.pet ? ' — re: ' + data.pet : ''}`,
            body: `Hi ${data.to || 'there'}!\n\n${data.text || data.message || ''}\n\n— GenusPupClub\n(804) 258-3830 | Genuspupclub@gmail.com`
        }),
        welcome: (data) => ({
            subject: `Welcome to GenusPupClub, ${data.name || ''}!`,
            body: `Hi ${data.name || 'there'}!\n\nWelcome to GenusPupClub — Richmond's #1 dog sitting service!\n\nYour account is all set up. Here's what you can do:\n• Book visits, walks, daycare, and more\n• Track your pup with real-time photo updates\n• Manage your pets and view report cards\n• Pay securely via Venmo, Zelle, CashApp, or Apple Pay\n\nLog in anytime at your portal.\n\nQuestions? Reply to this email or call us at (804) 258-3830.\n\n— The GenusPupClub Team`
        }),
        password_reset: (data) => ({
            subject: `Your GenusPupClub Password Has Been Reset`,
            body: `Hi ${data.name || 'there'}!\n\nYour password has been reset by our team.\n\nNew Password: ${data.newPassword || '(contact us)'}\n\nPlease log in and change it to something you'll remember.\n\nIf you didn't request this, contact us immediately at (804) 258-3830.\n\n— GenusPupClub`
        }),
        invoice: (data) => ({
            subject: `Invoice from GenusPupClub — ${data.invoiceId || ''}`,
            body: `Hi ${data.clientName || 'there'}!\n\nHere's your invoice from GenusPupClub:\n\n${'═'.repeat(40)}\nINVOICE #${data.invoiceId || ''}\nDate: ${data.date || ''}\n${'═'.repeat(40)}\n\nService: ${data.service || ''}\nPet: ${data.petName || ''}\n${data.days > 1 ? `Dates: ${data.startDate} → ${data.endDate} (${data.days} days)\n` : `Date: ${data.startDate || data.date}\n`}\n${data.lineItems || ''}\n${'─'.repeat(40)}\nTOTAL: $${Number(data.total || 0).toFixed(2)}\n${'═'.repeat(40)}\n\nPayment Methods:\n• Venmo: @GenusPupClub\n• Zelle: Genuspupclub@gmail.com\n• CashApp: $m3lop3z\n• Apple Pay: (804) 258-3830\n\nThank you for choosing GenusPupClub!\n— GenusPupClub\n(804) 258-3830`
        }),
        reminder: (data) => ({
            subject: `Reminder: ${data.petName || 'Your Pup'}'s ${data.service || 'Visit'} Tomorrow!`,
            body: `Hi ${data.clientName || 'there'}!\n\nJust a friendly reminder — ${data.petName || 'your pup'}'s ${data.service || 'visit'} is tomorrow!\n\nDate: ${data.date || ''}\nTime: ${data.time || 'TBD'}\n${data.dropoffTime ? 'Drop-off: ' + data.dropoffTime + '\n' : ''}${data.pickupTime ? 'Pick-up: ' + data.pickupTime + '\n' : ''}\nPlease have your pup ready with:\n• Leash and collar\n• Food and medications (if applicable)\n• Any special instructions\n\nNeed to reschedule? Call us at (804) 258-3830 or reply to this email.\n\nSee you tomorrow!\n— GenusPupClub`
        }),
        report_card: (data) => ({
            subject: `${data.petName || 'Your Pup'}'s Report Card — ${data.date || ''}`,
            body: `Hi ${data.clientName || 'there'}!\n\nHere's ${data.petName || 'your pup'}'s report card from today:\n\n🐕 ${data.petName || ''}\n📅 ${data.date || ''}\n🎯 Service: ${data.service || ''}\n\n${data.reportDetails || ''}\n\nOverall: ${data.overallRating || '⭐⭐⭐⭐⭐'}\n\n${data.notes ? 'Notes: ' + data.notes + '\n\n' : ''}Thank you for trusting us with ${data.petName || 'your pup'}!\n\n— GenusPupClub`
        }),
        waitlist: (data) => ({
            subject: `Spot Available! — ${data.date || ''}`,
            body: `Hi ${data.clientName || 'there'}!\n\nGreat news — a spot has opened up on ${data.date || 'the date you requested'}!\n\nYou were on our waitlist, and we wanted to give you first dibs.\n\nService: ${data.service || 'Your requested service'}\nDate: ${data.date || ''}\n\nBook now through your portal or call us at (804) 258-3830 to confirm.\n\nSpots fill fast — don't miss out!\n— GenusPupClub`
        })
    };

    const sendEmail = (template, data) => {
        const config = getEmailConfig();

        if (!config.enabled) {
            console.log(`[EMAIL STUB] Template: ${template}`, data);
            return;
        }

        if (typeof emailjs === 'undefined') {
            console.warn('[EMAIL] EmailJS SDK not loaded. Add the script tag.');
            return;
        }

        const tmpl = EMAIL_TEMPLATES[template];
        if (!tmpl) {
            console.warn(`[EMAIL] Unknown template: ${template}`);
            return;
        }

        const content = tmpl(data);
        const clientEmail = data.clientEmail || data.email || '';

        // Resolve client email from stored data if not in payload
        let toEmail = clientEmail;
        if (!toEmail && data.clientId) {
            const allClients = load('clients', []);
            const client = allClients.find(c => c.id === data.clientId);
            if (client) toEmail = client.email || '';
        }
        if (!toEmail && data.clientName) {
            const allClients = load('clients', []);
            const client = allClients.find(c => c.name === data.clientName);
            if (client) toEmail = client.email || '';
        }

        // Send to client
        if (config.sendToClient && toEmail) {
            const params = {
                to_name: data.clientName || data.to || data.name || '',
                to_email: toEmail,
                from_name: 'GenusPupClub',
                subject: content.subject,
                message: content.body
            };
            emailjs.send(config.serviceId, config.templateId || 'default_service', params, config.publicKey)
                .then(() => {
                    console.log(`[EMAIL] Sent to client: ${template} → ${toEmail}`);
                    // Log sent email
                    const log = load('email_log', []);
                    log.push({ id: uid(), template, to: toEmail, subject: content.subject, date: todayStr(), time: timeStr(), status: 'sent' });
                    if (log.length > 500) log.splice(0, log.length - 500);
                    save('email_log', log);
                })
                .catch(err => {
                    console.error(`[EMAIL] Failed: ${template} → ${toEmail}`, err);
                    const log = load('email_log', []);
                    log.push({ id: uid(), template, to: toEmail, subject: content.subject, date: todayStr(), time: timeStr(), status: 'failed', error: err?.text || String(err) });
                    save('email_log', log);
                });
        }

        // Send copy to admin
        if (config.sendToAdmin && config.adminEmail) {
            const adminParams = {
                to_name: 'GenusPupClub Admin',
                to_email: config.adminEmail,
                from_name: 'GenusPupClub System',
                subject: `[Admin Copy] ${content.subject}`,
                message: `--- Admin copy of email sent to ${toEmail || 'client'} ---\n\n${content.body}`
            };
            emailjs.send(config.serviceId, 'default_service', adminParams, config.publicKey)
                .then(() => console.log(`[EMAIL] Admin copy sent: ${template}`))
                .catch(err => console.error(`[EMAIL] Admin copy failed`, err));
        }
    };

    // Direct email send (for custom messages from dashboard)
    const sendDirectEmail = (toEmail, toName, subject, body) => {
        const config = getEmailConfig();
        if (!config.enabled || typeof emailjs === 'undefined') {
            console.log(`[EMAIL STUB] Direct: ${subject} → ${toEmail}`);
            showToast('Email Not Configured', 'Enable EmailJS in Settings to send real emails', 'warning');
            return Promise.resolve(false);
        }
        return emailjs.send(config.serviceId, 'default_service', {
            to_name: toName, to_email: toEmail,
            from_name: 'GenusPupClub', subject, message: body
        }, config.publicKey).then(() => {
            const log = load('email_log', []);
            log.push({ id: uid(), template: 'direct', to: toEmail, subject, date: todayStr(), time: timeStr(), status: 'sent' });
            save('email_log', log);
            showToast('Email Sent', `Sent to ${toEmail}`, 'success');
            return true;
        }).catch(err => {
            showToast('Email Failed', err?.text || 'Check EmailJS config', 'error');
            return false;
        });
    };

    const getEmailLog = () => load('email_log', []);
    const getEmailConfig_public = () => getEmailConfig();

    // ============================================
    // NOTIFICATION BELL RENDERER
    // ============================================
    const renderBell = (containerId, role = 'admin', userId = null) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const unread = getUnreadCount(role, userId);
        container.innerHTML = `
            <div style="position:relative;cursor:pointer" onclick="GPC_NOTIFY.togglePanel('${containerId}','${role}','${userId || ''}')">
                <span style="font-size:1.3rem">🔔</span>
                ${unread > 0 ? `<span style="position:absolute;top:-6px;right:-8px;background:#FF6B35;color:#fff;font-size:.65rem;font-weight:700;padding:1px 5px;border-radius:50px;min-width:16px;text-align:center">${unread}</span>` : ''}
            </div>
            <div id="${containerId}-panel" style="display:none;position:absolute;right:0;top:40px;width:360px;max-height:400px;overflow-y:auto;background:#fff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.15);z-index:999;border:1px solid #e9ecef"></div>
        `;
    };

    const togglePanel = (containerId, role, userId) => {
        const panel = document.getElementById(`${containerId}-panel`);
        if (!panel) return;

        if (panel.style.display === 'none') {
            const notifs = getNotifications(role, userId || null).slice(0, 20);
            panel.innerHTML = `
                <div style="padding:12px 16px;border-bottom:1px solid #e9ecef;display:flex;justify-content:space-between;align-items:center">
                    <strong style="font-size:.9rem">Notifications</strong>
                    <button onclick="GPC_NOTIFY.markAllRead('${role}','${userId || ''}');GPC_NOTIFY.renderBell('${containerId}','${role}','${userId || ''}')" style="background:none;border:none;color:#FF6B35;font-size:.78rem;cursor:pointer;font-weight:600">Mark all read</button>
                </div>
                ${notifs.length ? notifs.map(n => `
                    <div style="padding:10px 16px;border-bottom:1px solid #f4f4f4;${n.read ? 'opacity:.5' : 'background:rgba(255,107,53,.02)'}" onclick="GPC_NOTIFY.markRead('${n.id}')">
                        <div style="display:flex;justify-content:space-between">
                            <strong style="font-size:.85rem;${n.read ? '' : 'color:#2D3436'}">${n.title}</strong>
                            <span style="font-size:.7rem;color:#B2BEC3">${n.time}</span>
                        </div>
                        <p style="font-size:.8rem;color:#636E72;margin-top:2px">${n.message}</p>
                        <span style="font-size:.68rem;color:#B2BEC3">${n.date}</span>
                    </div>
                `).join('') : '<div style="padding:24px;text-align:center;color:#B2BEC3;font-size:.88rem">No notifications</div>'}
            `;
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    };

    // ============================================
    // TIP CALCULATOR
    // ============================================
    const renderTipSelector = (amount, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tipPercents = [0, 15, 18, 20, 25, 30];
        container.innerHTML = `
            <div style="margin-top:12px">
                <label style="font-size:.85rem;font-weight:600;display:block;margin-bottom:6px">Add a Tip</label>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
                    ${tipPercents.map(p => {
                        const tipAmt = (amount * p / 100).toFixed(2);
                        return `<button type="button" class="tip-btn" data-pct="${p}" style="padding:8px 14px;border-radius:8px;border:2px solid #e9ecef;background:#fff;cursor:pointer;font-size:.85rem;font-weight:600;font-family:'Inter',sans-serif;transition:all .2s" onclick="selectTip(${p},${amount},'${containerId}')">${p === 0 ? 'No tip' : p + '% ($' + tipAmt + ')'}</button>`;
                    }).join('')}
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                    <span style="font-size:.85rem;color:#636E72">Custom:</span>
                    <input type="number" id="${containerId}-custom" step="0.01" min="0" placeholder="$0.00" style="padding:8px 12px;border:2px solid #e9ecef;border-radius:8px;width:100px;font-size:.9rem;font-family:'Inter',sans-serif" oninput="selectTipCustom(this.value,${amount},'${containerId}')">
                </div>
                <input type="hidden" id="${containerId}-tip-value" value="0">
                <div style="margin-top:10px;padding:12px;background:rgba(255,107,53,.05);border-radius:8px;text-align:right">
                    <span style="font-size:.88rem;color:#636E72">Service: ${('$' + Number(amount).toFixed(2))}</span>
                    <span style="margin:0 8px;color:#B2BEC3">+</span>
                    <span style="font-size:.88rem;color:#636E72">Tip: <strong id="${containerId}-tip-display">$0.00</strong></span>
                    <span style="margin:0 8px;color:#B2BEC3">=</span>
                    <strong style="font-size:1.2rem;color:#FF6B35" id="${containerId}-total-display">$${Number(amount).toFixed(2)}</strong>
                </div>
            </div>
        `;
    };

    // These need to be global for onclick
    window.selectTip = (pct, amount, containerId) => {
        const tip = (amount * pct / 100);
        document.querySelectorAll(`#${containerId} .tip-btn`).forEach(b => { b.style.borderColor = '#e9ecef'; b.style.background = '#fff'; b.style.color = '#2D3436'; });
        const active = document.querySelector(`#${containerId} .tip-btn[data-pct="${pct}"]`);
        if (active) { active.style.borderColor = '#FF6B35'; active.style.background = 'rgba(255,107,53,.05)'; active.style.color = '#FF6B35'; }
        document.getElementById(`${containerId}-tip-value`).value = tip.toFixed(2);
        document.getElementById(`${containerId}-tip-display`).textContent = '$' + tip.toFixed(2);
        document.getElementById(`${containerId}-total-display`).textContent = '$' + (amount + tip).toFixed(2);
        const custom = document.getElementById(`${containerId}-custom`);
        if (custom) custom.value = '';
    };

    window.selectTipCustom = (val, amount, containerId) => {
        const tip = parseFloat(val) || 0;
        document.querySelectorAll(`#${containerId} .tip-btn`).forEach(b => { b.style.borderColor = '#e9ecef'; b.style.background = '#fff'; b.style.color = '#2D3436'; });
        document.getElementById(`${containerId}-tip-value`).value = tip.toFixed(2);
        document.getElementById(`${containerId}-tip-display`).textContent = '$' + tip.toFixed(2);
        document.getElementById(`${containerId}-total-display`).textContent = '$' + (amount + tip).toFixed(2);
    };

    const getTipValue = (containerId) => parseFloat(document.getElementById(`${containerId}-tip-value`)?.value) || 0;

    return {
        notify, getNotifications, getUnreadCount, markRead, markAllRead,
        showToast, renderBell, togglePanel, renderTipSelector, getTipValue,
        getPaymentHandle, getAllHandles,
        onNewBooking, onBookingConfirmed, onBookingCompleted, onBookingCancelled,
        onPaymentReceived, onPaymentPending, onNewMessage,
        sendEmail, sendDirectEmail, getEmailLog, getEmailConfig: getEmailConfig_public,
        EMAIL_TEMPLATES, PAYMENT_HANDLES
    };
})();
