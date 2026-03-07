// ============================================
// CONFIGURATION FILE
// ============================================

// Supabase Configuration
const SUPABASE_CONFIG = {
    URL: 'https://cdmhzakqcgkmbjlqnosb.supabase.co/',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbWh6YWtxY2drbWJqbHFub3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTkwMTcsImV4cCI6MjA4ODQzNTAxN30.AeoFUK5sUiKXRpflTlHOw5_3r71A9MSn-q60iYzyjG8',
    // Replace the above with your actual Supabase credentials
};

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
    CLOUD_NAME: 'ddbtzkw3a',
    UPLOAD_PRESET: 'assistenciatecnica',
    // Replace the above with your actual Cloudinary credentials
};

// API Configuration
const API_CONFIG = {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
};

// Application Configuration
const APP_CONFIG = {
    APP_NAME: 'Assistência Técnica',
    APP_VERSION: '1.0.0',
    ENVIRONMENT: 'production', // 'development' or 'production'
    LOG_ENABLED: true,
    DEBUG_MODE: false,
};

// Image Configuration
const IMAGE_CONFIG = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    COMPRESSION_QUALITY: 0.8,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
};

// Status Configuration
const STATUS_CONFIG = {
    RECEBIDO: 'recebido',
    EM_ANALISE: 'em_analise',
    AGUARDANDO_PECA: 'aguardando_peca',
    EM_MANUTENCAO: 'em_manutencao',
    FINALIZADO: 'finalizado',
    ENTREGUE: 'entregue',
};

const STATUS_LABELS = {
    recebido: 'Recebido',
    em_analise: 'Em Análise',
    aguardando_peca: 'Aguardando Peça',
    em_manutencao: 'Em Manutenção',
    finalizado: 'Finalizado',
    entregue: 'Entregue',
};

const STATUS_COLORS = {
    recebido: '#dbeafe',
    em_analise: '#fef3c7',
    aguardando_peca: '#fecaca',
    em_manutencao: '#fce7f3',
    finalizado: '#dcfce7',
    entregue: '#d1fae5',
};

// Image Type Configuration
const IMAGE_TYPES = {
    RECEBIMENTO_FRONTAL: 'recebimento_frontal',
    RECEBIMENTO_TRASEIRA: 'recebimento_traseira',
    RECEBIMENTO_TECLADO: 'recebimento_teclado',
    RECEBIMENTO_TELA: 'recebimento_tela',
    DANO: 'dano',
    INTERNO: 'interno',
    PLACA_MAE: 'placa_mae',
    LIMPEZA: 'limpeza',
    APOS_REPARO: 'apos_reparo',
};

const IMAGE_TYPE_LABELS = {
    recebimento_frontal: 'Recebimento - Frontal',
    recebimento_traseira: 'Recebimento - Traseira',
    recebimento_teclado: 'Recebimento - Teclado',
    recebimento_tela: 'Recebimento - Tela',
    dano: 'Dano',
    interno: 'Interno',
    placa_mae: 'Placa Mãe',
    limpeza: 'Limpeza',
    apos_reparo: 'Após Reparo',
};

// Utility function to get status label
function getStatusLabel(status) {
    return STATUS_LABELS[status] || status;
}

// Utility function to get status color
function getStatusColor(status) {
    return STATUS_COLORS[status] || '#e2e8f0';
}

// Utility function to get image type label
function getImageTypeLabel(type) {
    return IMAGE_TYPE_LABELS[type] || type;
}

// Utility function to format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value || 0);
}

// Utility function to format date
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(d);
}

// Utility function to format datetime
function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(d);
}

// Utility function to generate OS number
function generateOSNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `OS-${year}${month}${day}-${random}`;
}

// Utility function to validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Utility function to validate phone
function validatePhone(phone) {
    const re = /^[\d\s\-\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Utility function to validate CPF
function validateCPF(cpf) {
    const re = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return re.test(cpf);
}

// Logger utility
const Logger = {
    log: (message, data = null) => {
        if (APP_CONFIG.LOG_ENABLED) {
            console.log(`[${new Date().toISOString()}] ${message}`, data || '');
        }
    },
    error: (message, error = null) => {
        console.error(`[ERROR] ${message}`, error || '');
    },
    warn: (message, data = null) => {
        console.warn(`[WARN] ${message}`, data || '');
    },
    debug: (message, data = null) => {
        if (APP_CONFIG.DEBUG_MODE) {
            console.debug(`[DEBUG] ${message}`, data || '');
        }
    },
};

// Export for use in modules (if using ES6 modules)
// export { SUPABASE_CONFIG, CLOUDINARY_CONFIG, API_CONFIG, APP_CONFIG, Logger };
