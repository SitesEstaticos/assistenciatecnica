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

        const { data, error } = await this.supabase
            .from('clientes')
            .insert([newCliente]);

        if (error) throw error;

        return data[0];
    }

    async getClientes() {
        const { data, error } = await this.supabase
            .from('clientes')
            .select('*');

        if (error) throw error;

        return data;
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

    async updateCliente(id, updates) {
        updates.updated_at = new Date().toISOString();

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
        const { data, error } = await this.supabase
            .from('clientes')
            .delete()
            .eq('id', id)
            .select()
            .single();

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

        const { data, error } = await this.supabase
            .from('equipamentos')
            .insert([newEquip]);

        if (error) throw error;

        return data[0];
    }

    async getEquipamentos() {
        const { data, error } = await this.supabase
            .from('equipamentos')
            .select('*');

        if (error) throw error;

        return data;
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
            .eq('client_id', clienteId);

        if (error) throw error;

        return data;
    }

    async updateEquipamento(id, updates) {
        updates.updated_at = new Date().toISOString();

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
        const { data, error } = await this.supabase
            .from('equipamentos')
            .delete()
            .eq('id', id)
            .select()
            .single();

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

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .insert([newOrdem]);

        if (error) throw error;

        return data[0];
    }

    async getOrdensServico() {
        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('*');

        if (error) throw error;

        return data;
    }

    async getOrdenServicoById(id) {
        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return data;
    }

    async getOrdensServicoByCliente(clienteId) {
        const { data, error } = await this.supabase
            .from('ordens_servico')
            .select('*')
            .eq('client_id', clienteId);

        if (error) throw error;

        return data;
    }

    async updateOrdenServico(id, updates) {
        updates.updated_at = new Date().toISOString();

        const { data, error } = await this.supabase
            .from('ordens_servico')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    async deleteOrdenServico(id) {
        const { data, error } = await this.supabase
            .from('ordens_servico')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return data;
    }
    // ============================================
    // DASHBOARD / ESTATÍSTICAS
    // ============================================

    async getStatistics() {
        try {

            const { count: clientes } = await this.supabase
                .from('clientes')
                .select('*', { count: 'exact', head: true });

            const { count: equipamentos } = await this.supabase
                .from('equipamentos')
                .select('*', { count: 'exact', head: true });

            const { count: ordens } = await this.supabase
                .from('ordens_servico')
                .select('*', { count: 'exact', head: true });

            const { count: finalizadas } = await this.supabase
                .from('ordens_servico')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'finalizado');

            return {
                clientes: clientes || 0,
                equipamentos: equipamentos || 0,
                ordens: ordens || 0,
                finalizadas: finalizadas || 0
            };

        } catch (error) {
            Logger.error('Error loading statistics', error);
            throw error;
        }
    }

    async getOrderStatusCounts() {
        try {

            const { data, error } = await this.supabase
                .from('ordens_servico')
                .select('status');

            if (error) throw error;

            const counts = {};

            data.forEach(o => {
                counts[o.status] = (counts[o.status] || 0) + 1;
            });

            return counts;

        } catch (error) {
            Logger.error('Error getting order status counts', error);
            throw error;
        }
    }
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

if (!window.supabaseClient) {
    throw new Error('Supabase client não inicializado. Verifique config.js');
}

window.db = new DatabaseManager(window.supabaseClient);

console.log('DatabaseManager pronto.');