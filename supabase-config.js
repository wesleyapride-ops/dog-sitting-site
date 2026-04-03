// ============================================
// GenusPupClub — Supabase Configuration
// Cloud database for cross-device persistence
// ============================================

const GPC_SUPABASE = (() => {
    const LS_KEY = 'gpc_supabase_config';
    let client = null;
    let connected = false;
    let realtimeSub = null;

    // Default credentials (can be overridden via dashboard Settings)
    const DEFAULTS = {
        url: 'https://luzymbggzpbldfvrmvxr.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1enltYmdnenBibGRmdnJtdnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjM0NjQsImV4cCI6MjA5MDM5OTQ2NH0.kYPfnGsL-0v9LUtEP2Tw9-QYMnx8xlPQwL7Ih58doWM'
    };

    // Load config from localStorage, fall back to hardcoded defaults
    const getConfig = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(LS_KEY)) || {};
            return {
                url: stored.url || DEFAULTS.url,
                anonKey: stored.anonKey || DEFAULTS.anonKey
            };
        } catch {
            return DEFAULTS;
        }
    };

    const saveConfig = (cfg) => {
        localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    };

    // Initialize Supabase client
    const init = () => {
        const cfg = getConfig();
        if (!cfg.url || !cfg.anonKey) {
            console.log('[SUPABASE] Not configured — using localStorage only');
            return false;
        }

        if (typeof supabase === 'undefined' || !supabase.createClient) {
            console.warn('[SUPABASE] SDK not loaded');
            return false;
        }

        try {
            client = supabase.createClient(cfg.url, cfg.anonKey);
            connected = true;
            console.log('[SUPABASE] Connected:', cfg.url);
            return true;
        } catch (err) {
            console.error('[SUPABASE] Init failed:', err);
            connected = false;
            return false;
        }
    };

    // ---- Core CRUD ----

    // Read a key from Supabase (falls back to localStorage)
    const load = async (key, fallback) => {
        // Always read localStorage first (instant)
        let localVal = fallback;
        try {
            const raw = localStorage.getItem('gpc_' + key);
            if (raw !== null) localVal = JSON.parse(raw);
        } catch {}

        if (!connected || !client) return localVal;

        try {
            const { data, error } = await client
                .from('gpc_store')
                .select('value')
                .eq('key', key)
                .single();

            if (error || !data) return localVal;

            // Update localStorage cache with cloud data
            localStorage.setItem('gpc_' + key, JSON.stringify(data.value));
            return data.value;
        } catch {
            return localVal;
        }
    };

    // Write a key to both localStorage AND Supabase
    const save = async (key, value) => {
        // Always write to localStorage immediately (instant, offline-safe)
        localStorage.setItem('gpc_' + key, JSON.stringify(value));

        if (!connected || !client) return;

        try {
            await client
                .from('gpc_store')
                .upsert({ key, value }, { onConflict: 'key' });
        } catch (err) {
            console.error(`[SUPABASE] Save failed for "${key}":`, err);
        }
    };

    // ---- Bulk sync ----

    // Push ALL localStorage gpc_ data to Supabase (initial migration)
    const pushAll = async () => {
        if (!connected || !client) return { success: false, error: 'Not connected' };

        const keys = Object.keys(localStorage)
            .filter(k => k.startsWith('gpc_'))
            .map(k => k.replace('gpc_', ''));

        let pushed = 0;
        for (const key of keys) {
            try {
                const value = JSON.parse(localStorage.getItem('gpc_' + key));
                await client
                    .from('gpc_store')
                    .upsert({ key, value }, { onConflict: 'key' });
                pushed++;
            } catch {}
        }

        console.log(`[SUPABASE] Pushed ${pushed}/${keys.length} keys`);
        return { success: true, pushed, total: keys.length };
    };

    // Pull ALL data from Supabase into localStorage
    const pullAll = async () => {
        if (!connected || !client) return { success: false, error: 'Not connected' };

        try {
            const { data, error } = await client
                .from('gpc_store')
                .select('key, value');

            if (error) return { success: false, error: error.message };

            let pulled = 0;
            for (const row of data) {
                if (row.value !== null && row.value !== undefined) {
                    localStorage.setItem('gpc_' + row.key, JSON.stringify(row.value));
                    pulled++;
                }
            }

            console.log(`[SUPABASE] Pulled ${pulled} keys from cloud`);
            return { success: true, pulled };
        } catch (err) {
            return { success: false, error: String(err) };
        }
    };

    // Smart merge: pull cloud data and merge with local (cloud wins on conflicts, but keeps local-only data)
    const smartSync = async () => {
        if (!connected || !client) return { success: false, error: 'Not connected' };

        try {
            // 1. Pull everything from cloud
            const { data: cloudData, error } = await client
                .from('gpc_store')
                .select('key, value, updated_at');

            if (error) return { success: false, error: error.message };

            const cloudMap = {};
            for (const row of cloudData) {
                cloudMap[row.key] = row;
            }

            // 2. Get all local keys
            const localKeys = Object.keys(localStorage)
                .filter(k => k.startsWith('gpc_'))
                .map(k => k.replace('gpc_', ''));

            let merged = 0;
            let pushed = 0;
            let pulled = 0;

            // 3. For each local key, merge with cloud
            for (const key of localKeys) {
                try {
                    const localVal = JSON.parse(localStorage.getItem('gpc_' + key));

                    if (cloudMap[key]) {
                        const cloudVal = cloudMap[key].value;

                        // If both are arrays, merge by ID (union)
                        if (Array.isArray(localVal) && Array.isArray(cloudVal)) {
                            const idMap = new Map();
                            // Cloud data first (base)
                            for (const item of cloudVal) {
                                const id = item.id || JSON.stringify(item);
                                idMap.set(id, item);
                            }
                            // Local data overwrites/adds
                            for (const item of localVal) {
                                const id = item.id || JSON.stringify(item);
                                idMap.set(id, item);
                            }
                            const mergedArr = [...idMap.values()];
                            localStorage.setItem('gpc_' + key, JSON.stringify(mergedArr));
                            await client.from('gpc_store').upsert({ key, value: mergedArr }, { onConflict: 'key' });
                            merged++;
                        } else {
                            // For objects/scalars, cloud wins
                            localStorage.setItem('gpc_' + key, JSON.stringify(cloudVal));
                            pulled++;
                        }
                        delete cloudMap[key];
                    } else {
                        // Local-only key — push to cloud
                        await client.from('gpc_store').upsert({ key, value: localVal }, { onConflict: 'key' });
                        pushed++;
                    }
                } catch {}
            }

            // 4. Pull cloud-only keys to local
            for (const [key, row] of Object.entries(cloudMap)) {
                if (row.value !== null) {
                    localStorage.setItem('gpc_' + key, JSON.stringify(row.value));
                    pulled++;
                }
            }

            console.log(`[SUPABASE] Smart sync: ${merged} merged, ${pushed} pushed, ${pulled} pulled`);
            return { success: true, merged, pushed, pulled };
        } catch (err) {
            return { success: false, error: String(err) };
        }
    };

    // ---- Realtime sync ----

    const startRealtime = (onUpdate) => {
        if (!connected || !client) return;

        // Subscribe to changes on gpc_store
        realtimeSub = client
            .channel('gpc_store_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gpc_store' }, (payload) => {
                if (payload.new?.key && payload.new?.value !== undefined) {
                    // Update localStorage with incoming cloud change
                    localStorage.setItem('gpc_' + payload.new.key, JSON.stringify(payload.new.value));
                    console.log(`[REALTIME] Updated: ${payload.new.key}`);
                    if (typeof onUpdate === 'function') onUpdate(payload.new.key, payload.new.value);
                }
            })
            .subscribe();
    };

    const stopRealtime = () => {
        if (realtimeSub) {
            client?.removeChannel(realtimeSub);
            realtimeSub = null;
        }
    };

    // ---- Status ----
    const isConnected = () => connected;
    const getClient = () => client;

    // Test connection
    const testConnection = async () => {
        if (!connected || !client) return { success: false, error: 'Not initialized' };
        try {
            const { data, error } = await client.from('gpc_store').select('key').limit(1);
            if (error) return { success: false, error: error.message };
            return { success: true, message: 'Connected to Supabase!' };
        } catch (err) {
            return { success: false, error: String(err) };
        }
    };

    return {
        init, getConfig, saveConfig,
        load, save, pushAll, pullAll, smartSync,
        startRealtime, stopRealtime,
        isConnected, getClient, testConnection
    };
})();

// Auto-init on load
document.addEventListener('DOMContentLoaded', async () => {
    // Loading bar
    const loader = document.createElement('div');
    loader.id = 'gpc-sync-loader';
    loader.style.cssText = 'position:fixed;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#FF6B35,#00B894,#FF6B35);background-size:200%;animation:gpcLoad 1s ease infinite;z-index:99999;transition:opacity .3s;';
    if (!document.getElementById('gpc-load-css')) { const s = document.createElement('style'); s.id = 'gpc-load-css'; s.textContent = '@keyframes gpcLoad{0%{background-position:200% 0}100%{background-position:-200% 0}}'; document.head.appendChild(s); }
    document.body.appendChild(loader);

    if (GPC_SUPABASE.init()) {
        GPC_SUPABASE.startRealtime((key, value) => {
            if (typeof renderTab === 'function') renderTab();
            if (typeof renderDynamicPricing === 'function') renderDynamicPricing();
            if (typeof renderFooterServices === 'function') renderFooterServices();
        });

        try {
            const result = await GPC_SUPABASE.pullAll();
            if (result.success && result.pulled > 0) {
                console.log(`[SYNC] Pulled ${result.pulled} keys from cloud`);
                if (typeof renderTab === 'function') renderTab();
                if (typeof renderDynamicPricing === 'function') renderDynamicPricing();
                if (typeof renderFooterServices === 'function') renderFooterServices();
            }
        } catch (err) {
            console.warn('[SYNC] Pull failed — using local data:', err);
        }
    }

    // Hide loader
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
});
