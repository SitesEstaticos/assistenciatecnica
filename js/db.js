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
            nome: cliente.nome,
            telefone: cliente.telefone,
            email: cliente.email,
            endereco: cliente.endereco,
            observacoes: cliente.observacoes,
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

        const payload = {
            nome: updates.nome,
            telefone: updates.telefone,
            email: updates.email,
            endereco: updates.endereco,
            observacoes: updates.observacoes,
            atualizado_em: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('clientes')
            .update(payload)
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
            cliente_id: equipamento.cliente_id,
            marca: equipamento.marca,
            modelo: equipamento.modelo,
            numero_serie: equipamento.numero_serie,
            acessorios_entregues: equipamento.acessorios_entregues,
            estado_fisico: equipamento.estado_fisico,
            senha_equipamento: equipamento.senha_equipamento,
            observacoes: equipamento.observacoes,
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

        const payload = {
            cliente_id: updates.cliente_id,
            marca: updates.marca,
            modelo: updates.modelo,
            numero_serie: updates.numero_serie,
            acessorios_entregues: updates.acessorios_entregues,
            estado_fisico: updates.estado_fisico,
            senha_equipamento: updates.senha_equipamento,
            observacoes: updates.observacoes,
            atualizado_em: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('equipamentos')
            .update(payload)
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
            cliente_id: ordem.cliente_id,
            equipamento_id: ordem.equipamento_id,
            problema_relatado: ordem.problema_relatado,
            diagnostico_tecnico: ordem.diagnostico_tecnico,
            solucao_aplicada: ordem.solucao_aplicada,
            status: ordem.status,
            valor_servico: ordem.valor_servico,
            data_recebimento: ordem.data_recebimento,
            data_entrega: ordem.data_entrega,
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
    // PEÇAS
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
            nome: peca.nome,
            descricao: peca.descricao,
            preco_custo: peca.preco_custo,
            preco_venda: peca.preco_venda,
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

}


// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

if (!window.supabaseClient) {
    throw new Error('Supabase client não inicializado');
}

window.db = new DatabaseManager(window.supabaseClient);

console.log('DatabaseManager inicializado');