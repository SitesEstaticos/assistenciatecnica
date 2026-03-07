// ============================================
// DATABASE MODULE
// ============================================

class DatabaseManager {
    constructor() {
        this.storagePrefix = 'assistencia_tecnica_';
        this.initLocalStorage();
    }

    initLocalStorage() {
        // Initialize default data structures if they don't exist
        if (!this.getAll('clientes')) {
            this.setAll('clientes', []);
        }
        if (!this.getAll('equipamentos')) {
            this.setAll('equipamentos', []);
        }
        if (!this.getAll('ordens_servico')) {
            this.setAll('ordens_servico', []);
        }
        if (!this.getAll('pecas')) {
            this.setAll('pecas', []);
        }
        if (!this.getAll('estoque')) {
            this.setAll('estoque', []);
        }
        if (!this.getAll('imagens_equipamento')) {
            this.setAll('imagens_equipamento', []);
        }
        if (!this.getAll('historico_ordem_servico')) {
            this.setAll('historico_ordem_servico', []);
        }
    }

    // Generic methods for local storage
    setAll(key, data) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
            Logger.log(`Data stored: ${key}`);
        } catch (error) {
            Logger.error(`Error storing data: ${key}`, error);
        }
    }

    getAll(key) {
        try {
            const data = localStorage.getItem(this.storagePrefix + key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            Logger.error(`Error retrieving data: ${key}`, error);
            return null;
        }
    }

    // ============================================
    // CLIENTES (Customers)
    // ============================================

    async createCliente(cliente) {
        try {
            const clientes = this.getAll('clientes') || [];
            const newCliente = {
                id: 'cliente_' + Date.now(),
                ...cliente,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            clientes.push(newCliente);
            this.setAll('clientes', clientes);
            Logger.log('Cliente created:', newCliente.id);
            return newCliente;
        } catch (error) {
            Logger.error('Error creating cliente', error);
            throw error;
        }
    }

    async getClientes() {
        try {
            return this.getAll('clientes') || [];
        } catch (error) {
            Logger.error('Error fetching clientes', error);
            return [];
        }
    }

    async getClienteById(id) {
        try {
            const clientes = this.getAll('clientes') || [];
            return clientes.find((c) => c.id === id);
        } catch (error) {
            Logger.error('Error fetching cliente', error);
            return null;
        }
    }

    async updateCliente(id, updates) {
        try {
            const clientes = this.getAll('clientes') || [];
            const index = clientes.findIndex((c) => c.id === id);
            if (index !== -1) {
                clientes[index] = {
                    ...clientes[index],
                    ...updates,
                    updated_at: new Date().toISOString(),
                };
                this.setAll('clientes', clientes);
                Logger.log('Cliente updated:', id);
                return clientes[index];
            }
            throw new Error('Cliente not found');
        } catch (error) {
            Logger.error('Error updating cliente', error);
            throw error;
        }
    }

    async deleteCliente(id) {
        try {
            let clientes = this.getAll('clientes') || [];
            clientes = clientes.filter((c) => c.id !== id);
            this.setAll('clientes', clientes);
            Logger.log('Cliente deleted:', id);
            return true;
        } catch (error) {
            Logger.error('Error deleting cliente', error);
            throw error;
        }
    }

    // ============================================
    // EQUIPAMENTOS (Equipment)
    // ============================================

    async createEquipamento(equipamento) {
        try {
            const equipamentos = this.getAll('equipamentos') || [];
            const newEquipamento = {
                id: 'equip_' + Date.now(),
                ...equipamento,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            equipamentos.push(newEquipamento);
            this.setAll('equipamentos', equipamentos);
            Logger.log('Equipamento created:', newEquipamento.id);
            return newEquipamento;
        } catch (error) {
            Logger.error('Error creating equipamento', error);
            throw error;
        }
    }

    async getEquipamentos() {
        try {
            return this.getAll('equipamentos') || [];
        } catch (error) {
            Logger.error('Error fetching equipamentos', error);
            return [];
        }
    }

    async getEquipamentoById(id) {
        try {
            const equipamentos = this.getAll('equipamentos') || [];
            return equipamentos.find((e) => e.id === id);
        } catch (error) {
            Logger.error('Error fetching equipamento', error);
            return null;
        }
    }

    async getEquipamentosByCliente(clienteId) {
        try {
            const equipamentos = this.getAll('equipamentos') || [];
            return equipamentos.filter((e) => e.client_id === clienteId);
        } catch (error) {
            Logger.error('Error fetching equipamentos by cliente', error);
            return [];
        }
    }

    async updateEquipamento(id, updates) {
        try {
            const equipamentos = this.getAll('equipamentos') || [];
            const index = equipamentos.findIndex((e) => e.id === id);
            if (index !== -1) {
                equipamentos[index] = {
                    ...equipamentos[index],
                    ...updates,
                    updated_at: new Date().toISOString(),
                };
                this.setAll('equipamentos', equipamentos);
                Logger.log('Equipamento updated:', id);
                return equipamentos[index];
            }
            throw new Error('Equipamento not found');
        } catch (error) {
            Logger.error('Error updating equipamento', error);
            throw error;
        }
    }

    async deleteEquipamento(id) {
        try {
            let equipamentos = this.getAll('equipamentos') || [];
            equipamentos = equipamentos.filter((e) => e.id !== id);
            this.setAll('equipamentos', equipamentos);
            Logger.log('Equipamento deleted:', id);
            return true;
        } catch (error) {
            Logger.error('Error deleting equipamento', error);
            throw error;
        }
    }

    // ============================================
    // ORDENS DE SERVIÇO (Service Orders)
    // ============================================

    async createOrdenServico(ordem) {
        try {
            const ordensServico = this.getAll('ordens_servico') || [];
            const newOrdem = {
                id: 'os_' + Date.now(),
                os_number: generateOSNumber(),
                ...ordem,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            ordensServico.push(newOrdem);
            this.setAll('ordens_servico', ordensServico);

            // Create history entry
            await this.createHistoricoOrdenServico({
                ordem_id: newOrdem.id,
                status_anterior: null,
                novo_status: ordem.status || 'recebido',
                descricao: 'Ordem de serviço criada',
                tecnico_responsavel: auth.getUserEmail(),
            });

            Logger.log('Ordem de serviço created:', newOrdem.id);
            return newOrdem;
        } catch (error) {
            Logger.error('Error creating ordem de serviço', error);
            throw error;
        }
    }

    async getOrdensServico() {
        try {
            return this.getAll('ordens_servico') || [];
        } catch (error) {
            Logger.error('Error fetching ordens de serviço', error);
            return [];
        }
    }

    async getOrdenServicoById(id) {
        try {
            const ordensServico = this.getAll('ordens_servico') || [];
            return ordensServico.find((o) => o.id === id);
        } catch (error) {
            Logger.error('Error fetching ordem de serviço', error);
            return null;
        }
    }

    async getOrdensServicoByCliente(clienteId) {
        try {
            const ordensServico = this.getAll('ordens_servico') || [];
            return ordensServico.filter((o) => o.client_id === clienteId);
        } catch (error) {
            Logger.error('Error fetching ordens de serviço by cliente', error);
            return [];
        }
    }

    async updateOrdenServico(id, updates) {
        try {
            const ordensServico = this.getAll('ordens_servico') || [];
            const index = ordensServico.findIndex((o) => o.id === id);
            if (index !== -1) {
                const oldStatus = ordensServico[index].status;
                ordensServico[index] = {
                    ...ordensServico[index],
                    ...updates,
                    updated_at: new Date().toISOString(),
                };

                // Create history entry if status changed
                if (oldStatus !== updates.status) {
                    await this.createHistoricoOrdenServico({
                        ordem_id: id,
                        status_anterior: oldStatus,
                        novo_status: updates.status,
                        descricao: updates.status_description || `Status alterado para ${getStatusLabel(updates.status)}`,
                        tecnico_responsavel: auth.getUserEmail(),
                    });
                }

                this.setAll('ordens_servico', ordensServico);
                Logger.log('Ordem de serviço updated:', id);
                return ordensServico[index];
            }
            throw new Error('Ordem de serviço not found');
        } catch (error) {
            Logger.error('Error updating ordem de serviço', error);
            throw error;
        }
    }

    async deleteOrdenServico(id) {
        try {
            let ordensServico = this.getAll('ordens_servico') || [];
            ordensServico = ordensServico.filter((o) => o.id !== id);
            this.setAll('ordens_servico', ordensServico);
            Logger.log('Ordem de serviço deleted:', id);
            return true;
        } catch (error) {
            Logger.error('Error deleting ordem de serviço', error);
            throw error;
        }
    }

    // ============================================
    // PEÇAS (Parts)
    // ============================================

    async createPeca(peca) {
        try {
            const pecas = this.getAll('pecas') || [];
            const newPeca = {
                id: 'peca_' + Date.now(),
                ...peca,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            pecas.push(newPeca);
            this.setAll('pecas', pecas);
            Logger.log('Peça created:', newPeca.id);
            return newPeca;
        } catch (error) {
            Logger.error('Error creating peça', error);
            throw error;
        }
    }

    async getPecas() {
        try {
            return this.getAll('pecas') || [];
        } catch (error) {
            Logger.error('Error fetching peças', error);
            return [];
        }
    }

    async getPecaById(id) {
        try {
            const pecas = this.getAll('pecas') || [];
            return pecas.find((p) => p.id === id);
        } catch (error) {
            Logger.error('Error fetching peça', error);
            return null;
        }
    }

    async updatePeca(id, updates) {
        try {
            const pecas = this.getAll('pecas') || [];
            const index = pecas.findIndex((p) => p.id === id);
            if (index !== -1) {
                pecas[index] = {
                    ...pecas[index],
                    ...updates,
                    updated_at: new Date().toISOString(),
                };
                this.setAll('pecas', pecas);
                Logger.log('Peça updated:', id);
                return pecas[index];
            }
            throw new Error('Peça not found');
        } catch (error) {
            Logger.error('Error updating peça', error);
            throw error;
        }
    }

    async deletePeca(id) {
        try {
            let pecas = this.getAll('pecas') || [];
            pecas = pecas.filter((p) => p.id !== id);
            this.setAll('pecas', pecas);
            Logger.log('Peça deleted:', id);
            return true;
        } catch (error) {
            Logger.error('Error deleting peça', error);
            throw error;
        }
    }

    // ============================================
    // IMAGENS (Images)
    // ============================================

    async createImagem(imagem) {
        try {
            const imagens = this.getAll('imagens_equipamento') || [];
            const newImagem = {
                id: 'img_' + Date.now(),
                ...imagem,
                created_at: new Date().toISOString(),
            };
            imagens.push(newImagem);
            this.setAll('imagens_equipamento', imagens);
            Logger.log('Imagem created:', newImagem.id);
            return newImagem;
        } catch (error) {
            Logger.error('Error creating imagem', error);
            throw error;
        }
    }

    async getImagensByEquipamento(equipamentoId) {
        try {
            const imagens = this.getAll('imagens_equipamento') || [];
            return imagens.filter((i) => i.equipment_id === equipamentoId);
        } catch (error) {
            Logger.error('Error fetching imagens by equipamento', error);
            return [];
        }
    }

    async getImagensByOrdenServico(ordemId) {
        try {
            const imagens = this.getAll('imagens_equipamento') || [];
            return imagens.filter((i) => i.ordem_id === ordemId);
        } catch (error) {
            Logger.error('Error fetching imagens by ordem de serviço', error);
            return [];
        }
    }

    async deleteImagem(id) {
        try {
            let imagens = this.getAll('imagens_equipamento') || [];
            imagens = imagens.filter((i) => i.id !== id);
            this.setAll('imagens_equipamento', imagens);
            Logger.log('Imagem deleted:', id);
            return true;
        } catch (error) {
            Logger.error('Error deleting imagem', error);
            throw error;
        }
    }

    // ============================================
    // HISTÓRICO (History)
    // ============================================

    async createHistoricoOrdenServico(historico) {
        try {
            const historicos = this.getAll('historico_ordem_servico') || [];
            const newHistorico = {
                id: 'hist_' + Date.now(),
                ...historico,
                created_at: new Date().toISOString(),
            };
            historicos.push(newHistorico);
            this.setAll('historico_ordem_servico', historicos);
            Logger.log('Histórico created:', newHistorico.id);
            return newHistorico;
        } catch (error) {
            Logger.error('Error creating histórico', error);
            throw error;
        }
    }

    async getHistoricoByOrdenServico(ordemId) {
        try {
            const historicos = this.getAll('historico_ordem_servico') || [];
            return historicos.filter((h) => h.ordem_id === ordemId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } catch (error) {
            Logger.error('Error fetching histórico by ordem de serviço', error);
            return [];
        }
    }

    // ============================================
    // ANALYTICS
    // ============================================

    async getStatistics() {
        try {
            const clientes = this.getAll('clientes') || [];
            const equipamentos = this.getAll('equipamentos') || [];
            const ordensServico = this.getAll('ordens_servico') || [];
            const pecas = this.getAll('pecas') || [];

            const osAbertas = ordensServico.filter((o) => ['recebido', 'em_analise', 'aguardando_peca', 'em_manutencao'].includes(o.status)).length;
            const osFinalizadas = ordensServico.filter((o) => ['finalizado', 'entregue'].includes(o.status)).length;
            const faturamento = ordensServico.reduce((total, o) => total + (o.service_value || 0), 0);

            return {
                totalClientes: clientes.length,
                totalEquipamentos: equipamentos.length,
                totalOrdenServico: ordensServico.length,
                osAbertas,
                osFinalizadas,
                faturamento,
                pecasEmEstoque: pecas.length,
            };
        } catch (error) {
            Logger.error('Error fetching statistics', error);
            return {};
        }
    }
}

// Create global database instance
const db = new DatabaseManager();
