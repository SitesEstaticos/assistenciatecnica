// ============================================
// DATABASE MODULE - SUPABASE
// ============================================

class DatabaseManager {

    constructor(supabaseClient) {

        if (!supabaseClient) {
            throw new Error('Supabase client não fornecido');
        }

        this.supabase = supabaseClient;
    }

    // ============================================
    // CLIENTES
    // ============================================

    async getClientes() {

        const { data, error } = await this.supabase
            .from('clientes')
            .select('*')
            .order('criado_em', { ascending: false });

        if (error) throw error;

        return data || [];
    }

    async getClienteById(id) {

        const { data, error } = await this.supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return data;
    }

    async createCliente(cliente) {

        const payload = {
            ...cliente,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('clientes')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async updateCliente(id, updates = {}) {

        updates.atualizado_em = new Date().toISOString();

        const { data, error } = await this.supabase
            .from('clientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async deleteCliente(id) {

        const { error } = await this.supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
    }


    // ============================================
    // EQUIPAMENTOS
    // ============================================

    async getEquipamentos() {

        const { data, error } = await this.supabase
            .from('equipamentos')
            .select('*')
            .order('criado_em', { ascending: false });

        if (error) throw error;

        return data || [];
    }

    async getEquipamentoById(id) {

        const { data, error } = await this.supabase
            .from('equipamentos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return data;
    }

    async getEquipamentosByCliente(clienteId) {

        const { data, error } = await this.supabase
            .from('equipamentos')
            .select('*')
            .eq('cliente_id', clienteId);

        if (error) throw error;

        return data || [];
    }

    async createEquipamento(equipamento) {

        const payload = {
            ...equipamento,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('equipamentos')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async updateEquipamento(id, updates = {}) {

        updates.atualizado_em = new Date().toISOString();

        const { data, error } = await this.supabase
            .from('equipamentos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async deleteEquipamento(id) {

        const { error } = await this.supabase
            .from('equipamentos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
    }
    // ============================================
    // IMAGENS
    // ============================================
    async createImagem(imagem) {

        const payload = {
            ...imagem,
            data_upload: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('imagens_equipamento')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async getImagensByEquipamento(equipamentoId) {

        const { data, error } = await this.supabase
            .from('imagens_equipamento')
            .select('*')
            .eq('equipamento_id', equipamentoId)
            .order('criado_em', { ascending: false });

        if (error) throw error;

        return data || [];
    }

    async getImagensByEquipamento(equipamentoId) {

        const { data, error } = await this.supabase
            .from('imagens_equipamento')
            .select('*')
            .eq('equipamento_id', equipamentoId);

        if (error) throw error;

        return data || [];
    }

    async getImagensByOrdem(ordemId) {

        const { data, error } = await this.supabase
            .from('imagens_equipamento')
            .select('*')
            .eq('ordem_id', ordemId);

        if (error) throw error;

        return data || [];
    }

    async createImagem(imagem) {

        const { data, error } = await this.supabase
            .from('imagens_equipamento')
            .insert(imagem)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    // ============================================
    // ORDENS DE SERVIÇO
    // ============================================

    async getOrdensServico() {

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('*')
            .order('data_recebimento', { ascending: false });

        if (error) throw error;

        return data || [];
    }

    async getOrdensServicoByCliente(clienteId) {

        const { data: equipamentos, error: errorEquip } = await this.supabase
            .from('equipamentos')
            .select('id')
            .eq('cliente_id', clienteId);

        if (errorEquip) throw errorEquip;

        const ids = (equipamentos || []).map(e => e.id);

        if (ids.length === 0) return [];

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('*')
            .in('equipamento_id', ids)
            .order('data_recebimento', { ascending: false });

        if (error) throw error;

        return data || [];
    }

    async getOrdensServicoByEquipamento(equipamentoId) {

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('*')
            .eq('equipamento_id', equipamentoId)
            .order('data_recebimento', { ascending: false });

        if (error) throw error;

        return data || [];
    }

    async getOrdemServicoById(id) {

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return data;
    }

    async createOrdemServico(ordem) {

        const numeroOS = `OS-${Date.now()}`;

        const payload = {
            numero_os: numeroOS,
            ...ordem,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async updateOrdemServico(id, updates = {}) {

        updates.atualizado_em = new Date().toISOString();

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async deleteOrdemServico(id) {

        const { error } = await this.supabase
            .from('ordens_servico')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
    }


    // ============================================
    // PEÇAS / ESTOQUE
    // ============================================

    async getPecas() {

        const { data, error } = await this.supabase
            .from('pecas')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;

        return data || [];
    }

    async getPecaById(id) {

        const { data, error } = await this.supabase
            .from('pecas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return data;
    }

    async createPeca(peca) {

        const payload = {
            ...peca,
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('pecas')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async updatePeca(id, updates = {}) {

        updates.atualizado_em = new Date().toISOString();

        const { data, error } = await this.supabase
            .from('pecas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async deletePeca(id) {

        const { error } = await this.supabase
            .from('pecas')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
    }


    // ============================================
    // DASHBOARD
    // ============================================

    async getStatistics() {

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('status, valor_servico');

        if (error) throw error;

        let osAbertas = 0;
        let osManutencao = 0;
        let osFinalizadas = 0;
        let faturamento = 0;

        (data || []).forEach(o => {

            if (o.status === 'recebido') osAbertas++;

            if (
                o.status === 'em_analise' ||
                o.status === 'aguardando_peca' ||
                o.status === 'manutencao'
            ) osManutencao++;

            if (
                o.status === 'finalizado' ||
                o.status === 'entregue'
            ) {

                osFinalizadas++;

                faturamento += parseFloat(o.valor_servico) || 0;

            }

        });

        return {
            osAbertas,
            osManutencao,
            osFinalizadas,
            faturamento
        };
    }


    // ============================================
    // STATUS DAS ORDENS
    // ============================================

    async getOrderStatusCounts() {

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('status');

        if (error) throw error;

        const counts = {
            recebido: 0,
            em_analise: 0,
            aguardando_peca: 0,
            manutencao: 0,
            finalizado: 0,
            entregue: 0
        };

        (data || []).forEach(o => {

            if (counts[o.status] !== undefined) {

                counts[o.status]++;

            }

        });

        return counts;
    }


    // ============================================
    // FATURAMENTO MENSAL
    // ============================================

    async getMonthlyRevenue() {

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('valor_servico, data_recebimento')
            .in('status', ['finalizado', 'entregue']);

        if (error) throw error;

        const months = {
            jan: 0, fev: 0, mar: 0, abr: 0,
            mai: 0, jun: 0, jul: 0, ago: 0,
            set: 0, out: 0, nov: 0, dez: 0
        };

        const keys = Object.keys(months);

        (data || []).forEach(o => {

            const month = new Date(o.data_recebimento).getMonth();

            const key = keys[month];

            months[key] += parseFloat(o.valor_servico) || 0;

        });

        return months;
    }

}


// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

if (!window.supabaseClient) {
    throw new Error('Supabase client não inicializado');
}

window.db = new DatabaseManager(window.supabaseClient);

console.log('DatabaseManager inicializado');