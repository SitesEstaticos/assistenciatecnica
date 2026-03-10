// ============================================
// CONFIGURATION FILE - AUDITADO
// ============================================


// =====================
// SUPABASE CONFIGURATION
// =====================
const SUPABASE_CONFIG = {
    URL: 'https://cdmhzakqcgkmbjlqnosb.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbWh6YWtxY2drbWJqbHFub3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTkwMTcsImV4cCI6MjA4ODQzNTAxN30.AeoFUK5sUiKXRpflTlHOw5_3r71A9MSn-q60iYzyjG8',
};


// =====================
// CLOUDINARY CONFIGURATION
// =====================
const CLOUDINARY_CONFIG = {
    CLOUD_NAME: 'ddbtzkw3a',
    UPLOAD_PRESET: 'assistenciatecnica',
};


// =====================
// API CONFIGURATION
// =====================
const API_CONFIG = {
    TIMEOUT: 5000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
};


// =====================
// APP CONFIGURATION
// =====================
const APP_CONFIG = {
    APP_NAME: 'Assistência Técnica',
    APP_VERSION: '1.0.0',
    ENVIRONMENT: 'production',
    LOG_ENABLED: true,
    DEBUG_MODE: false,
};


// =====================
// IMAGE CONFIGURATION
// =====================
const IMAGE_CONFIG = {
    MAX_SIZE: 10 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    COMPRESSION_QUALITY: 0.8,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
};


// =====================
// STATUS CONFIGURATION
// =====================
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


// =====================
// IMAGE TYPE CONFIGURATION
// =====================
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


// =====================
// UTILITY FUNCTIONS
// =====================

function getStatusLabel(status) {
    return STATUS_LABELS[status] || status;
}

function getStatusColor(status) {
    return STATUS_COLORS[status] || '#e2e8f0';
}

function getImageTypeLabel(type) {
    return IMAGE_TYPE_LABELS[type] || type;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatDate(date) {

    if (!date) return 'N/A';

    const d = new Date(date);

    return isNaN(d)
        ? 'N/A'
        : new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(d);
}


function formatDateTime(date) {

    if (!date) return 'N/A';

    const d = new Date(date);

    return isNaN(d)
        ? 'N/A'
        : new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(d);
}


function generateOSNumber() {

    const ts = Date.now();
    const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

    return `OS-${ts}-${random}`;
}


function validateEmail(email) {

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return re.test(email);

}


function validatePhone(phone) {

    const re = /^[\d\s\-\(\)]+$/;

    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;

}


// =====================
// CPF VALIDATION
// =====================
function validateCPF(cpf) {

    cpf = (cpf || '').replace(/\D/g, '');

    if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;

    let sum;
    let rest;

    sum = 0;

    for (let i = 1; i <= 9; i++)
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);

    rest = (sum * 10) % 11;

    if (rest === 10 || rest === 11) rest = 0;

    if (rest !== parseInt(cpf.substring(9, 10)))
        return false;

    sum = 0;

    for (let i = 1; i <= 10; i++)
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);

    rest = (sum * 10) % 11;

    if (rest === 10 || rest === 11) rest = 0;

    if (rest !== parseInt(cpf.substring(10, 11)))
        return false;

    return true;

}


// =====================
// LOGGER
// =====================
const Logger = {

    log: (msg, data = null) => {
        if (APP_CONFIG.LOG_ENABLED)
            console.log(`[${new Date().toISOString()}] ${msg}`, data || '');
    },

    error: (msg, err = null) => {
        console.error(`[ERROR] ${msg}`, err || '');
    },

    warn: (msg, data = null) => {
        console.warn(`[WARN] ${msg}`, data || '');
    },

    debug: (msg, data = null) => {
        if (APP_CONFIG.DEBUG_MODE)
            console.debug(`[DEBUG] ${msg}`, data || '');
    }

};


// ============================================
// EXPORT GLOBAL CONFIGS
// ============================================

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;
window.API_CONFIG = API_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.IMAGE_CONFIG = IMAGE_CONFIG;

window.STATUS_CONFIG = STATUS_CONFIG;
window.STATUS_LABELS = STATUS_LABELS;
window.STATUS_COLORS = STATUS_COLORS;

window.IMAGE_TYPES = IMAGE_TYPES;
window.IMAGE_TYPE_LABELS = IMAGE_TYPE_LABELS;

window.Logger = Logger;


// =====================
// SUPABASE CLIENT INIT
// =====================

if (!window.supabase || !window.supabase.createClient) {

    throw new Error('Biblioteca Supabase não carregada. Verifique o script CDN.');

}

window.supabaseClient = window.supabase.createClient(
    SUPABASE_CONFIG.URL,
    SUPABASE_CONFIG.ANON_KEY
);

console.log('Supabase client inicializado.');