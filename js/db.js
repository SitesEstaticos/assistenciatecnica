// ============================================
// DATABASE MODULE - SUPABASE ONLY
// ============================================

class DatabaseManager {
    constructor(supabaseClient) {
        if (!supabaseClient) throw new Error('Supabase client is required');
        this.supabase = supabaseClient;
    }

    // ============================================
    // CLIENTES
    // ============================================
    async createCliente(cliente) {
        const newCliente = {
            id: 'cliente_' + Date.now(),
            ...cliente,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase.from('clientes').insert([newCliente]);
        if (error) throw error;
        return data[0];
    }

    async getClientes() {
        const { data, error } = await this.supabase.from('clientes').select('*');
        if (error) throw error;
        return data;
    }

    async getClienteById(id) {
        const { data, error } = await this.supabase.from('clientes').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async updateCliente(id, updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await this.supabase.from('clientes').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async deleteCliente(id) {
        const { data, error } = await this.supabase.from('clientes').delete().eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    // ============================================
    // EQUIPAMENTOS
    // ============================================
    async createEquipamento(equipamento) {
        const newEquip = {
            id: 'equip_' + Date.now(),
            ...equipamento,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase.from('equipamentos').insert([newEquip]);
        if (error) throw error;
        return data[0];
    }

    async getEquipamentos() {
        const { data, error } = await this.supabase.from('equipamentos').select('*');
        if (error) throw error;
        return data;
    }

    async getEquipamentoById(id) {
        const { data, error } = await this.supabase.from('equipamentos').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async getEquipamentosByCliente(clienteId) {
        const { data, error } = await this.supabase.from('equipamentos').select('*').eq('client_id', clienteId);
        if (error) throw error;
        return data;
    }

    async updateEquipamento(id, updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await this.supabase.from('equipamentos').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async deleteEquipamento(id) {
        const { data, error } = await this.supabase.from('equipamentos').delete().eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    // ============================================
    // ORDENS DE SERVIÇO
    // ============================================
    async createOrdenServico(ordem) {
        const newOrdem = {
            id: 'os_' + Date.now(),
            os_number: 'OS-' + Date.now(),
            ...ordem,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase.from('ordens_servico').insert([newOrdem]);
        if (error) throw error;
        return data[0];
    }

    async getOrdensServico() {
        const { data, error } = await this.supabase.from('ordens_servico').select('*');
        if (error) throw error;
        return data;
    }

    async getOrdenServicoById(id) {
        const { data, error } = await this.supabase.from('ordens_servico').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async getOrdensServicoByCliente(clienteId) {
        const { data, error } = await this.supabase.from('ordens_servico').select('*').eq('client_id', clienteId);
        if (error) throw error;
        return data;
    }

    async updateOrdenServico(id, updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await this.supabase.from('ordens_servico').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async deleteOrdenServico(id) {
        const { data, error } = await this.supabase.from('ordens_servico').delete().eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    // ============================================
    // PEÇAS
    // ============================================
    async createPeca(peca) {
        const newPeca = {
            id: 'peca_' + Date.now(),
            ...peca,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase.from('pecas').insert([newPeca]);
        if (error) throw error;
        return data[0];
    }

    async getPecas() {
        const { data, error } = await this.supabase.from('pecas').select('*');
        if (error) throw error;
        return data;
    }

    async getPecaById(id) {
        const { data, error } = await this.supabase.from('pecas').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async updatePeca(id, updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await this.supabase.from('pecas').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async deletePeca(id) {
        const { data, error } = await this.supabase.from('pecas').delete().eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    // ============================================
    // IMAGENS
    // ============================================
    async createImagem(imagem) {
        const newImagem = {
            id: 'img_' + Date.now(),
            ...imagem,
            created_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase.from('imagens_equipamento').insert([newImagem]);
        if (error) throw error;
        return data[0];
    }

    async getImagensByEquipamento(equipamentoId) {
        const { data, error } = await this.supabase.from('imagens_equipamento').select('*').eq('equipment_id', equipamentoId);
        if (error) throw error;
        return data;
    }

    async getImagensByOrdenServico(ordemId) {
        const { data, error } = await this.supabase.from('imagens_equipamento').select('*').eq('ordem_id', ordemId);
        if (error) throw error;
        return data;
    }

    async deleteImagem(id) {
        const { data, error } = await this.supabase.from('imagens_equipamento').delete().eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    // ============================================
    // HISTÓRICO
    // ============================================
    async createHistoricoOrdenServico(historico) {
        const newHist = {
            id: 'hist_' + Date.now(),
            ...historico,
            created_at: new Date().toISOString(),
        };
        const { data, error } = await this.supabase.from('historico_ordem_servico').insert([newHist]);
        if (error) throw error;
        return data[0];
    }

    async getHistoricoByOrdenServico(ordemId) {
        const { data, error } = await this.supabase.from('historico_ordem_servico')
            .select('*')
            .eq('ordem_id', ordemId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

if (typeof createClient === 'undefined') {
    throw new Error('Supabase client not found. Carregue @supabase/supabase-js antes do db.js');
}

const supabaseClient = createClient(
    'https://cdmhzakqcgkmbjlqnosb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbWh6YWtxY2drbWJqbHFub3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTkwMTcsImV4cCI6MjA4ODQzNTAxN30.AeoFUK5sUiKXRpflTlHOw5_3r71A9MSn-q60iYzyjG8'
);

window.db = new DatabaseManager(supabaseClient);
console.log('Supabase conectado, db pronto.');