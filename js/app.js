// ============================================
// MAIN APPLICATION FILE
// ============================================

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('sw.js')
            .then(() => {
                Logger.log('Service Worker registered successfully');
            })
            .catch((error) => {
                Logger.error('Service Worker registration failed', error);
            });
    });
}

// Global error handler
window.addEventListener('error', (event) => {
    Logger.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection:', event.reason);
});

// ============================================
// AUTH INITIALIZATION
// ============================================

async function waitForAuth() {

    if (!window.auth) {
        Logger.error("Auth não inicializou.");
        return false;
    }

    await window.auth.ready;

    return true;
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {

    Logger.log('Application initialized');

    await waitForAuth();

    handleLoginForm();
    setupLogoutButton();

    checkProtectedPages();

});


function setupLogoutButton() {

    const logoutBtn = document.getElementById('logoutBtn');

    if (!logoutBtn)
        return;

    logoutBtn.addEventListener('click', async () => {

        try {

            await auth.logout();

            showNotification('Logout realizado com sucesso', 'success');

            window.location.href = 'index.html';

        } catch (error) {

            Logger.error('Erro ao realizar logout', error);

            showNotification('Erro ao sair. Tente novamente.', 'error');

        }

    });

}

// ============================================
// LOGIN HANDLER
// ============================================

function handleLoginForm() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const errorBox = document.getElementById("errorMessage");
        const spinner = document.getElementById("loginSpinner");
        const buttonText = document.getElementById("loginButtonText");

        try {

            if (spinner) spinner.classList.remove("hidden");
            if (buttonText) buttonText.textContent = "Entrando...";

            await auth.login(email, password);

            // Esperar sincronização da sessão
            await new Promise(resolve => setTimeout(resolve, 300));

            if (auth.isLoggedIn()) {

                showNotification("Login realizado com sucesso", "success");

                window.location.href = "dashboard.html";

            } else {

                throw new Error("Falha ao validar sessão.");

            }

        } catch (error) {

            Logger.error("Erro no login", error);

            if (errorBox) {
                errorBox.textContent = error.message;
                errorBox.classList.remove("hidden");
            }

        } finally {

            if (spinner) spinner.classList.add("hidden");
            if (buttonText) buttonText.textContent = "Entrar";

        }

    });

}

// ============================================
// PROTECTED PAGES
// ============================================

function checkProtectedPages() {

    const protectedPages = [
        'dashboard.html',
        'clientes.html',
        'equipamentos.html',
        'ordens-servico.html',
        'estoque.html',
        'relatorios.html'
    ];

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (protectedPages.includes(currentPage)) {

        if (!window.auth || !window.auth.isLoggedIn()) {

            Logger.log("Usuário não autenticado, redirecionando.");

            window.location.href = 'index.html';

        }

    }

}

// ============================================
// GLOBAL UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'info', duration = 3000) {

    const notification = document.createElement('div');

    notification.className = `notification notification-${type}`;

    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.style.animation = 'slideOut 0.3s ease';

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);

    }, duration);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function debounce(func, wait) {

    let timeout;

    return function executedFunction(...args) {

        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

    };

}

function throttle(func, limit) {

    let inThrottle;

    return function (...args) {

        if (!inThrottle) {

            func.apply(this, args);

            inThrottle = true;

            setTimeout(() => (inThrottle = false), limit);

        }

    };

}

// ============================================
// NETWORK UTILITIES
// ============================================

function isOnline() {
    return navigator.onLine;
}

function waitForNetwork() {

    return new Promise((resolve) => {

        if (isOnline()) {

            resolve();

        } else {

            window.addEventListener('online', resolve, { once: true });

        }

    });

}

// ============================================

Logger.log('App.js loaded and initialized');