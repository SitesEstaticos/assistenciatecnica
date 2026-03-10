// ============================================
// AUTHENTICATION MODULE - SUPABASE
// ============================================

// Fallback para Logger caso não exista
if (!window.Logger) {
    window.Logger = {
        log: (...args) => console.log('[Auth]', ...args),
        error: (...args) => console.error('[Auth]', ...args)
    };
}

// Validação simples de email caso não exista
if (!window.validateEmail) {
    window.validateEmail = function (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
}

class AuthManager {
    constructor(supabaseClient) {
        if (!supabaseClient) {
            throw new Error("Supabase client não foi inicializado.");
        }

        this.supabase = supabaseClient;
        this.user = null;
        this.session = null;
        this.isAuthenticated = false;

        // Escuta mudanças de autenticação
        this.supabase.auth.onAuthStateChange((event, session) => {

            if (session) {
                this.session = session;
                this.user = session.user;
                this.isAuthenticated = true;
            } else {
                this.clearSession();
            }

            Logger.log('Auth state changed:', event);

        });

        // Promise que indica quando a inicialização terminou
        this.ready = this.init();
    }

    async init() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();

            if (error) throw error;

            if (session && session.user) {
                this.session = session;
                this.user = session.user;
                this.isAuthenticated = true;
                Logger.log('Sessão restaurada automaticamente');
            } else {
                this.clearSession();
            }

        } catch (err) {
            Logger.error('Erro ao restaurar sessão', err);
            this.clearSession();
        }
    }

    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }

        if (!validateEmail(email)) {
            throw new Error('Email inválido');
        }

        try {

            Logger.log('Tentando login:', email);

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.session = data.session;
            this.user = data.user;
            this.isAuthenticated = true;

            Logger.log('Login realizado com sucesso');

            return data;

        } catch (err) {
            Logger.error('Falha no login', err);
            throw err;
        }
    }

    async logout() {
        try {

            const { error } = await this.supabase.auth.signOut();

            if (error) throw error;

            this.clearSession();

            Logger.log('Logout realizado');

            return true;

        } catch (err) {

            Logger.error('Erro no logout', err);
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
        return this.user ? this.user.email : null;
    }

    getUserId() {
        return this.user ? this.user.id : null;
    }

    async refreshToken() {
        try {

            const { data, error } = await this.supabase.auth.refreshSession();

            if (error) throw error;

            this.session = data.session;
            this.user = data.session.user;

            Logger.log('Token renovado');

            return this.session;

        } catch (err) {

            Logger.error('Erro ao renovar token', err);

            this.clearSession();

            throw err;
        }
    }

    async updateProfile(updates) {

        if (!this.user) {
            throw new Error('Nenhum usuário logado');
        }

        try {

            const { data, error } = await this.supabase.auth.updateUser(updates);

            if (error) throw error;

            this.user = data.user;
            this.session.user = data.user;

            Logger.log('Perfil atualizado');

            return this.user;

        } catch (err) {

            Logger.error('Erro ao atualizar perfil', err);
            throw err;

        }
    }

    async changePassword(newPassword) {

        if (!newPassword) {
            throw new Error('Nova senha obrigatória');
        }

        try {

            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            Logger.log('Senha alterada com sucesso');

            return true;

        } catch (err) {

            Logger.error('Erro ao alterar senha', err);
            throw err;

        }
    }
}

// ============================================
// CREATE GLOBAL INSTANCE
// ============================================

(function () {

    if (!window.supabaseClient) {
        console.error("Supabase client não encontrado. Verifique se supabase.js foi carregado antes.");
        return;
    }

    window.auth = new AuthManager(window.supabaseClient);

})();