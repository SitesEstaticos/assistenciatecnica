// ============================================
// AUTHENTICATION MODULE - SUPABASE
// ============================================

class AuthManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient; // precisa ser criado antes
        this.user = null;
        this.session = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        try {
            // Check Supabase session
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session && session.user) {
                this.session = session;
                this.user = session.user;
                this.isAuthenticated = true;
                Logger.log('User session restored from Supabase');
            } else {
                this.clearSession();
            }
        } catch (err) {
            Logger.error('Error restoring Supabase session', err);
            this.clearSession();
        }
    }

    async login(email, password) {
        if (!email || !password) throw new Error('Email e senha são obrigatórios');
        if (!validateEmail(email)) throw new Error('Email inválido');

        Logger.log('Attempting login for: ' + email);

        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) {
            Logger.error('Login failed', error);
            throw error;
        }

        this.session = data.session;
        this.user = data.user;
        this.isAuthenticated = true;

        Logger.log('Login successful for: ' + email);
        return data;
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            this.clearSession();
            Logger.log('Logout successful');
            return true;
        } catch (err) {
            Logger.error('Logout failed', err);
            throw err;
        }
    }

    clearSession() {
        this.user = null;
        this.session = null;
        this.isAuthenticated = false;
    }

    isLoggedIn() {
        return this.isAuthenticated && this.user !== null;
    }

    getUser() {
        return this.user;
    }

    getSession() {
        return this.session;
    }

    getUserEmail() {
        return this.user?.email || null;
    }

    getUserId() {
        return this.user?.id || null;
    }

    async refreshToken() {
        try {
            const { data, error } = await this.supabase.auth.refreshSession();
            if (error) throw error;

            this.session = data.session;
            this.user = data.session.user;
            Logger.log('Token refreshed successfully');
            return this.session;
        } catch (err) {
            Logger.error('Token refresh failed', err);
            this.clearSession();
            throw err;
        }
    }

    async updateProfile(updates) {
        if (!this.user) throw new Error('No user logged in');
        const { data, error } = await this.supabase.auth.updateUser(updates);
        if (error) {
            Logger.error('Profile update failed', error);
            throw error;
        }
        this.user = data.user;
        this.session.user = data.user;
        Logger.log('Profile updated successfully');
        return this.user;
    }

    async changePassword(newPassword) {
        if (!newPassword) throw new Error('New password is required');
        const { data, error } = await this.supabase.auth.updateUser({ password: newPassword });
        if (error) {
            Logger.error('Password change failed', error);
            throw error;
        }
        Logger.log('Password changed successfully');
        return true;
    }
}

// ============================================
// USAGE EXAMPLE
// ============================================

// Import supabase-js antes:
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

// const auth = new AuthManager(supabase);