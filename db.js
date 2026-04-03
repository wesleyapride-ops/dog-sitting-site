// ============================================
// GenusPupClub — Data Layer
// Wraps localStorage + Supabase cloud sync
// Drop-in replacement: same load()/save() API
// ============================================

const GPC_DB = (() => {
    const PREFIX = 'gpc_';

    // Synchronous load (reads localStorage cache — always instant)
    const load = (key, fallback) => {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            if (raw === null) return fallback;
            const parsed = JSON.parse(raw);
            return parsed !== null ? parsed : fallback;
        } catch {
            return fallback;
        }
    };

    // Save to localStorage + async push to Supabase
    const save = (key, data) => {
        // Immediate localStorage write (keeps everything instant)
        localStorage.setItem(PREFIX + key, JSON.stringify(data));

        // Async cloud push (fire-and-forget, doesn't block UI)
        if (typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected()) {
            GPC_SUPABASE.save(key, data).catch(err => {
                console.warn(`[DB] Cloud save failed for "${key}":`, err);
            });
        }
    };

    // Full cloud sync (call on page load to pull latest from all devices)
    const syncFromCloud = async () => {
        if (typeof GPC_SUPABASE === 'undefined' || !GPC_SUPABASE.isConnected()) {
            return { success: false, reason: 'Not connected to Supabase' };
        }
        return GPC_SUPABASE.smartSync();
    };

    // Push everything local to cloud (first-time setup)
    const pushToCloud = async () => {
        if (typeof GPC_SUPABASE === 'undefined' || !GPC_SUPABASE.isConnected()) {
            return { success: false, reason: 'Not connected to Supabase' };
        }
        return GPC_SUPABASE.pushAll();
    };

    // Pull everything from cloud (overwrite local)
    const pullFromCloud = async () => {
        if (typeof GPC_SUPABASE === 'undefined' || !GPC_SUPABASE.isConnected()) {
            return { success: false, reason: 'Not connected to Supabase' };
        }
        return GPC_SUPABASE.pullAll();
    };

    const isCloudConnected = () => {
        return typeof GPC_SUPABASE !== 'undefined' && GPC_SUPABASE.isConnected();
    };

    return { load, save, syncFromCloud, pushToCloud, pullFromCloud, isCloudConnected };
})();
