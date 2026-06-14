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

        const { data, error } = await this.supabase
            .from('clientes')
            .insert(cliente)
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

        const { data, error } = await this.supabase
            .from('equipamentos')
            .insert(equipamento)
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

        const { data, error } = await this.supabase
            .from('imagens_equipamento')
            .insert(imagem)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async deleteImagem(id) {

        const { error } = await this.supabase
            .from('imagens_equipamento')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
    }

    async getImagensByEquipamento(equipamentoId) {

        const { data, error } = await this.supabase
            .from('imagens_equipamento')
            .select('*')
            .eq('equipamento_id', equipamentoId)
            .order('data_upload', { ascending: false });

        if (error) throw error;

        return data || [];
    }

    async getImagensByOrdem(ordemId) {

        const { data, error } = await this.supabase
            .from('imagens_equipamento')
            .select('*')
            .eq('ordem_id', ordemId)
            .order('data_upload', { ascending: false });

        if (error) throw error;

        return data || [];
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

        const payload = {
            numero_os: `OS-${Date.now()}`,
            ...ordem
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

    normalizePecaRecord(peca) {

        const estoque = Array.isArray(peca?.estoque)
            ? (peca.estoque[0] || null)
            : peca?.estoque || null;

        return {
            ...peca,
            quantidade: Number(estoque?.quantidade ?? peca?.quantidade ?? 0),
            quantidade_minima: Number(estoque?.quantidade_minima ?? peca?.quantidade_minima ?? 5),
            estoque
        };

    }

    async getPecas() {

        const { data, error } = await this.supabase
            .from('pecas')
            .select('*, estoque(*)')
            .order('nome', { ascending: true });

        if (error) throw error;

        return (data || []).map(item => this.normalizePecaRecord(item));
    }

    async getPecaById(id) {

        const { data, error } = await this.supabase
            .from('pecas')
            .select('*, estoque(*)')
            .eq('id', id)
            .single();

        if (error) throw error;

        return this.normalizePecaRecord(data);
    }

    async createPeca(peca) {

        const quantidade = Number(peca.quantidade ?? 0);
        const quantidadeMinima = Number(peca.quantidade_minima ?? 5);

        const basePayload = { ...peca };
        delete basePayload.quantidade;
        delete basePayload.quantidade_minima;

        const { data: createdPeca, error } = await this.supabase
            .from('pecas')
            .insert(basePayload)
            .select()
            .single();

        if (error) throw error;

        const estoquePayload = {
            peca_id: createdPeca.id,
            quantidade,
            quantidade_minima: quantidadeMinima,
            localizacao: peca.localizacao || null,
            observacoes: peca.observacoes || null
        };

        const { error: estoqueError } = await this.supabase
            .from('estoque')
            .insert(estoquePayload);

        if (estoqueError) throw estoqueError;

        return this.normalizePecaRecord({
            ...createdPeca,
            quantidade,
            quantidade_minima: quantidadeMinima,
            estoque: estoquePayload
        });
    }

    async updatePeca(id, updates = {}) {

        const quantidade = Object.prototype.hasOwnProperty.call(updates, 'quantidade')
            ? Number(updates.quantidade)
            : null;

        const quantidadeMinima = Object.prototype.hasOwnProperty.call(updates, 'quantidade_minima')
            ? Number(updates.quantidade_minima)
            : null;

        const pecaPayload = {
            ...updates,
            atualizado_em: new Date().toISOString()
        };

        delete pecaPayload.quantidade;
        delete pecaPayload.quantidade_minima;

        const { data: updatedPeca, error } = await this.supabase
            .from('pecas')
            .update(pecaPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (quantidade !== null || quantidadeMinima !== null) {

            const { data: estoqueAtual, error: estoqueReadError } = await this.supabase
                .from('estoque')
                .select('*')
                .eq('peca_id', id)
                .maybeSingle();

            if (estoqueReadError) throw estoqueReadError;

            const estoquePayload = {
                quantidade: quantidade ?? Number(estoqueAtual?.quantidade ?? 0),
                quantidade_minima: quantidadeMinima ?? Number(estoqueAtual?.quantidade_minima ?? 5),
                localizacao: updates.localizacao ?? estoqueAtual?.localizacao ?? null,
                observacoes: updates.observacoes ?? estoqueAtual?.observacoes ?? null,
                atualizado_em: new Date().toISOString()
            };

            if (estoqueAtual) {
                await this.supabase
                    .from('estoque')
                    .update(estoquePayload)
                    .eq('peca_id', id);
            } else {
                await this.supabase
                    .from('estoque')
                    .insert({
                        peca_id: id,
                        ...estoquePayload
                    });
            }

            return this.normalizePecaRecord({
                ...updatedPeca,
                quantidade: estoquePayload.quantidade,
                quantidade_minima: estoquePayload.quantidade_minima,
                estoque: { ...estoqueAtual, ...estoquePayload, peca_id: id }
            });
        }

        return this.normalizePecaRecord(updatedPeca);
    }

    async deletePeca(id) {

        const { error: estoqueError } = await this.supabase
            .from('estoque')
            .delete()
            .eq('peca_id', id);

        if (estoqueError) throw estoqueError;

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
                o.status === 'em_manutencao' ||
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
            em_manutencao: 0,
            finalizado: 0,
            entregue: 0
        };

        (data || []).forEach(o => {

            const status = o.status === 'manutencao'
                ? 'em_manutencao'
                : o.status;

            if (counts[status] !== undefined) {
                counts[status]++;
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
    // ============================================
    // PEÇAS UTILIZADAS NAS ORDENS
    // ============================================
    async getPecasByOrdem(ordemId) {

        const { data, error } = await this.supabase
            .from('pecas_utilizadas')
            .select(`
            id,
            ordem_id,
            peca_id,
            quantidade,
            valor_unitario,
            pecas (
                id,
                nome
            )
        `)
            .eq('ordem_id', ordemId);

        if (error) {
            Logger.error('Erro ao buscar peças da ordem', error);
            throw error;
        }

        return data;
    }

    async addPecaToOrdem(peca) {

        const { data, error } = await this.supabase
            .from('pecas_utilizadas')
            .insert(peca)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async removePecaFromOrdem(id) {
        const { error } = await this.supabase
            .from('pecas_utilizadas')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return true;
    }

    async getHistoricoByOrdem(ordemId) {

        const { data, error } = await this.supabase
            .from('historico_ordem_servico')
            .select('*')
            .eq('ordem_id', ordemId)
            .order('criado_em', { ascending: false });

        if (error) throw error;

        return data || [];
    }

    async addHistoricoStatus(historico) {

        const { data, error } = await this.supabase
            .from('historico_ordem_servico')
            .insert(historico)
            .select()
            .single();

        if (error) throw error;

        return data;
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
