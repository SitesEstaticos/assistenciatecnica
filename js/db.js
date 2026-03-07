// ============================================
// DATABASE MODULE - COMPLETE
// ============================================

class DatabaseManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient; // opcional, caso queira enviar para Supabase
        this.storagePrefix = 'assistencia_tecnica_';
        this.initLocalStorage();
    }

    initLocalStorage() {
        const tables = ['clientes','equipamentos','ordens_servico','pecas','estoque','imagens_equipamento','historico_ordem_servico'];
        tables.forEach((key) => {
            if (!this.getAll(key)) this.setAll(key, []);
        });
    }

    setAll(key, data) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
            console.log(`Data stored: ${key}`);
        } catch (error) {
            console.error(`Error storing data: ${key}`, error);
        }
    }

    getAll(key) {
        try {
            const data = localStorage.getItem(this.storagePrefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error retrieving data: ${key}`, error);
            return null;
        }
    }

    // ============================================
    // CLIENTES
    // ============================================
    async createCliente(cliente) {
        const clientes = this.getAll('clientes') || [];
        const newCliente = {
            id: 'cliente_' + Date.now(),
            ...cliente,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        clientes.push(newCliente);
        this.setAll('clientes', clientes);
        console.log('Cliente created:', newCliente.id);

        // Supabase insert (opcional)
        if (this.supabase) {
            await this.supabase.from('clientes').insert([newCliente]);
        }

        return newCliente;
    }

    async getClientes() {
        return this.getAll('clientes') || [];
    }

    async getClienteById(id) {
        const clientes = this.getAll('clientes') || [];
        return clientes.find(c => c.id === id);
    }

    async updateCliente(id, updates) {
        const clientes = this.getAll('clientes') || [];
        const index = clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            clientes[index] = { ...clientes[index], ...updates, updated_at: new Date().toISOString() };
            this.setAll('clientes', clientes);

            if (this.supabase) {
                await this.supabase.from('clientes').update(updates).eq('id', id);
            }

            return clientes[index];
        }
        throw new Error('Cliente not found');
    }

    async deleteCliente(id) {
        let clientes = this.getAll('clientes') || [];
        clientes = clientes.filter(c => c.id !== id);
        this.setAll('clientes', clientes);

        if (this.supabase) {
            await this.supabase.from('clientes').delete().eq('id', id);
        }

        return true;
    }

    // ============================================
    // EQUIPAMENTOS
    // ============================================
    async createEquipamento(equipamento) {
        const equipamentos = this.getAll('equipamentos') || [];
        const newEquip = {
            id: 'equip_' + Date.now(),
            ...equipamento,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        equipamentos.push(newEquip);
        this.setAll('equipamentos', equipamentos);

        if (this.supabase) {
            await this.supabase.from('equipamentos').insert([newEquip]);
        }

        return newEquip;
    }

    async getEquipamentos() {
        return this.getAll('equipamentos') || [];
    }

    async getEquipamentoById(id) {
        const equipamentos = this.getAll('equipamentos') || [];
        return equipamentos.find(e => e.id === id);
    }

    async getEquipamentosByCliente(clienteId) {
        const equipamentos = this.getAll('equipamentos') || [];
        return equipamentos.filter(e => e.client_id === clienteId);
    }

    async updateEquipamento(id, updates) {
        const equipamentos = this.getAll('equipamentos') || [];
        const index = equipamentos.findIndex(e => e.id === id);
        if (index !== -1) {
            equipamentos[index] = { ...equipamentos[index], ...updates, updated_at: new Date().toISOString() };
            this.setAll('equipamentos', equipamentos);

            if (this.supabase) {
                await this.supabase.from('equipamentos').update(updates).eq('id', id);
            }

            return equipamentos[index];
        }
        throw new Error('Equipamento not found');
    }

    async deleteEquipamento(id) {
        let equipamentos = this.getAll('equipamentos') || [];
        equipamentos = equipamentos.filter(e => e.id !== id);
        this.setAll('equipamentos', equipamentos);

        if (this.supabase) {
            await this.supabase.from('equipamentos').delete().eq('id', id);
        }

        return true;
    }

    // ============================================
    // ORDENS DE SERVIÇO
    // ============================================
    async createOrdenServico(ordem) {
        const ordens = this.getAll('ordens_servico') || [];
        const newOrdem = {
            id: 'os_' + Date.now(),
            os_number: 'OS-' + Date.now(),
            ...ordem,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        ordens.push(newOrdem);
        this.setAll('ordens_servico', ordens);

        if (this.supabase) {
            await this.supabase.from('ordens_servico').insert([newOrdem]);
        }

        return newOrdem;
    }

    async getOrdensServico() {
        return this.getAll('ordens_servico') || [];
    }

    async getOrdenServicoById(id) {
        const ordens = this.getAll('ordens_servico') || [];
        return ordens.find(o => o.id === id);
    }

    async getOrdensServicoByCliente(clienteId) {
        const ordens = this.getAll('ordens_servico') || [];
        return ordens.filter(o => o.client_id === clienteId);
    }

    async updateOrdenServico(id, updates) {
        const ordens = this.getAll('ordens_servico') || [];
        const index = ordens.findIndex(o => o.id === id);
        if (index !== -1) {
            ordens[index] = { ...ordens[index], ...updates, updated_at: new Date().toISOString() };
            this.setAll('ordens_servico', ordens);

            if (this.supabase) {
                await this.supabase.from('ordens_servico').update(updates).eq('id', id);
            }

            return ordens[index];
        }
        throw new Error('Ordem de serviço not found');
    }

    async deleteOrdenServico(id) {
        let ordens = this.getAll('ordens_servico') || [];
        ordens = ordens.filter(o => o.id !== id);
        this.setAll('ordens_servico', ordens);

        if (this.supabase) {
            await this.supabase.from('ordens_servico').delete().eq('id', id);
        }

        return true;
    }

    // ============================================
    // PEÇAS
    // ============================================
    async createPeca(peca) {
        const pecas = this.getAll('pecas') || [];
        const newPeca = {
            id: 'peca_' + Date.now(),
            ...peca,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        pecas.push(newPeca);
        this.setAll('pecas', pecas);

        if (this.supabase) {
            await this.supabase.from('pecas').insert([newPeca]);
        }

        return newPeca;
    }

    async getPecas() {
        return this.getAll('pecas') || [];
    }

    async getPecaById(id) {
        const pecas = this.getAll('pecas') || [];
        return pecas.find(p => p.id === id);
    }

    async updatePeca(id, updates) {
        const pecas = this.getAll('pecas') || [];
        const index = pecas.findIndex(p => p.id === id);
        if (index !== -1) {
            pecas[index] = { ...pecas[index], ...updates, updated_at: new Date().toISOString() };
            this.setAll('pecas', pecas);

            if (this.supabase) {
                await this.supabase.from('pecas').update(updates).eq('id', id);
            }

            return pecas[index];
        }
        throw new Error('Peça not found');
    }

    async deletePeca(id) {
        let pecas = this.getAll('pecas') || [];
        pecas = pecas.filter(p => p.id !== id);
        this.setAll('pecas', pecas);

        if (this.supabase) {
            await this.supabase.from('pecas').delete().eq('id', id);
        }

        return true;
    }

    // ============================================
    // IMAGENS
    // ============================================
    async createImagem(imagem) {
        const imagens = this.getAll('imagens_equipamento') || [];
        const newImagem = {
            id: 'img_' + Date.now(),
            ...imagem,
            created_at: new Date().toISOString(),
        };
        imagens.push(newImagem);
        this.setAll('imagens_equipamento', imagens);

        if (this.supabase) {
            await this.supabase.from('imagens_equipamento').insert([newImagem]);
        }

        return newImagem;
    }

    async getImagensByEquipamento(equipamentoId) {
        const imagens = this.getAll('imagens_equipamento') || [];
        return imagens.filter(i => i.equipment_id === equipamentoId);
    }

    async getImagensByOrdenServico(ordemId) {
        const imagens = this.getAll('imagens_equipamento') || [];
        return imagens.filter(i => i.ordem_id === ordemId);
    }

    async deleteImagem(id) {
        let imagens = this.getAll('imagens_equipamento') || [];
        imagens = imagens.filter(i => i.id !== id);
        this.setAll('imagens_equipamento', imagens);

        if (this.supabase) {
            await this.supabase.from('imagens_equipamento').delete().eq('id', id);
        }

        return true;
    }

    // ============================================
    // HISTÓRICO
    // ============================================
    async createHistoricoOrdenServico(historico) {
        const historicos = this.getAll('historico_ordem_servico') || [];
        const newHist = {
            id: 'hist_' + Date.now(),
            ...historico,
            created_at: new Date().toISOString(),
        };
        historicos.push(newHist);
        this.setAll('historico_ordem_servico', historicos);

        if (this.supabase) {
            await this.supabase.from('historico_ordem_servico').insert([newHist]);
        }

        return newHist;
    }

    async getHistoricoByOrdenServico(ordemId) {
        const historicos = this.getAll('historico_ordem_servico') || [];
        return historicos
            .filter(h => h.ordem_id === ordemId)
            .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
}

// ============================================
// GLOBAL INSTANCE
// ============================================

if (typeof createClient !== 'undefined') {
    const supabaseClient = createClient('https://cdmhzakqcgkmbjlqnosb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbWh6YWtxY2drbWJqbHFub3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTkwMTcsImV4cCI6MjA4ODQzNTAxN30.AeoFUK5sUiKXRpflTlHOw5_3r71A9MSn-q60iYzyjG8')
    window.db = new DatabaseManager(supabaseClient);
} else {
    console.warn('Supabase createClient not found, db will work only com localStorage.');
    window.db = new DatabaseManager();
}
