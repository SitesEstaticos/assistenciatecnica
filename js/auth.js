// ============================================
// AUTHENTICATION MODULE
// ============================================

class AuthManager {
    constructor() {
        this.user = null;
        this.session = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        // Check if user is already logged in
        const storedSession = localStorage.getItem('auth_session');
        if (storedSession) {
            try {
                this.session = JSON.parse(storedSession);
                this.user = this.session.user;
                this.isAuthenticated = true;
                Logger.log('User session restored from localStorage');
            } catch (error) {
                Logger.error('Error restoring session', error);
                this.clearSession();
            }
        }
    }

    async login(email, password) {
        try {
            Logger.log('Attempting login for:', email);

            // Simulate Supabase authentication
            // In production, replace this with actual Supabase call:
            // const { data, error } = await supabase.auth.signInWithPassword({
            //     email: email,
            //     password: password,
            // });

            // For demo purposes, we'll validate and create a mock session
            if (!email || !password) {
                throw new Error('Email e senha são obrigatórios');
            }

            if (!validateEmail(email)) {
                throw new Error('Email inválido');
            }

            // Mock authentication - replace with real Supabase call
            const mockUser = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                email: email,
                user_metadata: {
                    full_name: email.split('@')[0],
                },
                created_at: new Date().toISOString(),
            };

            const mockSession = {
                access_token: 'mock_token_' + Math.random().toString(36).substr(2, 20),
                refresh_token: 'mock_refresh_' + Math.random().toString(36).substr(2, 20),
                expires_in: 3600,
                expires_at: Date.now() + 3600000,
                token_type: 'bearer',
                user: mockUser,
            };

            this.session = mockSession;
            this.user = mockUser;
            this.isAuthenticated = true;

            // Store session in localStorage
            localStorage.setItem('auth_session', JSON.stringify(this.session));
            Logger.log('Login successful for:', email);

            return { user: mockUser, session: mockSession };
        } catch (error) {
            Logger.error('Login failed', error);
            throw error;
        }
    }

    async logout() {
        try {
            Logger.log('Logging out user');

            // In production, call Supabase logout:
            // await supabase.auth.signOut();

            this.clearSession();
            Logger.log('Logout successful');

            return true;
        } catch (error) {
            Logger.error('Logout failed', error);
            throw error;
        }
    }

    clearSession() {
        this.user = null;
        this.session = null;
        this.isAuthenticated = false;
        localStorage.removeItem('auth_session');
    }

    getUser() {
        return this.user;
    }

    getSession() {
        return this.session;
    }

    isLoggedIn() {
        return this.isAuthenticated && this.user !== null;
    }

    getUserEmail() {
        return this.user?.email || null;
    }

    getUserId() {
        return this.user?.id || null;
    }

    async refreshToken() {
        try {
            if (!this.session || !this.session.refresh_token) {
                throw new Error('No refresh token available');
            }

            Logger.log('Refreshing authentication token');

            // In production, call Supabase refresh:
            // const { data, error } = await supabase.auth.refreshSession();

            // For now, just update the expiration
            this.session.expires_at = Date.now() + 3600000;
            localStorage.setItem('auth_session', JSON.stringify(this.session));

            Logger.log('Token refreshed successfully');
            return this.session;
        } catch (error) {
            Logger.error('Token refresh failed', error);
            this.clearSession();
            throw error;
        }
    }

    async updateProfile(updates) {
        try {
            if (!this.user) {
                throw new Error('No user logged in');
            }

            Logger.log('Updating user profile');

            // In production, call Supabase update:
            // const { data, error } = await supabase.auth.updateUser(updates);

            // Update local user object
            this.user = { ...this.user, ...updates };
            if (this.session) {
                this.session.user = this.user;
                localStorage.setItem('auth_session', JSON.stringify(this.session));
            }

            Logger.log('Profile updated successfully');
            return this.user;
        } catch (error) {
            Logger.error('Profile update failed', error);
            throw error;
        }
    }

    async changePassword(oldPassword, newPassword) {
        try {
            if (!oldPassword || !newPassword) {
                throw new Error('Old password and new password are required');
            }

            Logger.log('Changing user password');

            // In production, call Supabase:
            // const { data, error } = await supabase.auth.updateUser({
            //     password: newPassword,
            // });

            Logger.log('Password changed successfully');
            return true;
        } catch (error) {
            Logger.error('Password change failed', error);
            throw error;
        }
    }
}

// Create global auth instance
const auth = new AuthManager();

// ============================================
// LOGIN PAGE HANDLER
// ============================================

if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.btn-login');
    const errorMessage = document.getElementById('errorMessage');
    const registerLink = document.getElementById('registerLink');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Clear previous errors
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        // Show loading state
        const buttonText = loginBtn.querySelector('#loginButtonText');
        const spinner = loginBtn.querySelector('#loginSpinner');
        loginBtn.disabled = true;
        buttonText.classList.add('hidden');
        spinner.classList.remove('hidden');

        try {
            await auth.login(email, password);
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorMessage.textContent = error.message || 'Erro ao fazer login. Tente novamente.';
            errorMessage.classList.remove('hidden');
            Logger.error('Login error:', error);
        } finally {
            // Restore button state
            loginBtn.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Para solicitar acesso, entre em contato com o administrador do sistema.');
    });

    // Check if user is already logged in
    if (auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}

// ============================================
// LOGOUT HANDLER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtns = document.querySelectorAll('#logoutBtn');

    logoutBtns.forEach((btn) => {
        btn.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja sair?')) {
                try {
                    await auth.logout();
                    window.location.href = 'index.html';
                } catch (error) {
                    alert('Erro ao fazer logout: ' + error.message);
                }
            }
        });
    });

    // Update user email in top bar if logged in
    const userEmail = document.getElementById('userEmail');
    if (userEmail && auth.isLoggedIn()) {
        userEmail.textContent = auth.getUserEmail();
    }

    // Redirect to login if not authenticated (for protected pages)
    const protectedPages = ['dashboard.html', 'clientes.html', 'equipamentos.html', 'ordens-servico.html', 'estoque.html', 'relatorios.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (protectedPages.includes(currentPage) && !auth.isLoggedIn()) {
        window.location.href = 'index.html';
    }
});
