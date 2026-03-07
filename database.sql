-- ============================================
-- SUPABASE DATABASE SCHEMA
-- ============================================
-- Este script cria todas as tabelas necessárias para o sistema
-- de gerenciamento de ordens de serviço de assistência técnica

-- ============================================
-- TABELA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_completo VARCHAR(255),
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    endereco TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para clientes
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);

-- ============================================
-- TABELA: equipamentos
-- ============================================
CREATE TABLE IF NOT EXISTS equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100) NOT NULL UNIQUE,
    acessorios_entregues TEXT,
    estado_fisico VARCHAR(50),
    senha_equipamento VARCHAR(255),
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para equipamentos
CREATE INDEX idx_equipamentos_cliente_id ON equipamentos(cliente_id);
CREATE INDEX idx_equipamentos_numero_serie ON equipamentos(numero_serie);

-- ============================================
-- TABELA: ordens_servico
-- ============================================
CREATE TABLE IF NOT EXISTS ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_os VARCHAR(50) NOT NULL UNIQUE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    equipamento_id UUID NOT NULL REFERENCES equipamentos(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'recebido',
    data_recebimento DATE NOT NULL,
    problema_relatado TEXT,
    diagnostico_tecnico TEXT,
    servicos_realizados TEXT,
    valor_servico DECIMAL(10, 2) DEFAULT 0.00,
    tecnico_responsavel VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para ordens de serviço
CREATE INDEX idx_ordens_servico_numero ON ordens_servico(numero_os);
CREATE INDEX idx_ordens_servico_cliente_id ON ordens_servico(cliente_id);
CREATE INDEX idx_ordens_servico_equipamento_id ON ordens_servico(equipamento_id);
CREATE INDEX idx_ordens_servico_status ON ordens_servico(status);
CREATE INDEX idx_ordens_servico_data ON ordens_servico(data_recebimento);

-- ============================================
-- TABELA: pecas
-- ============================================
CREATE TABLE IF NOT EXISTS pecas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(100) UNIQUE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER DEFAULT 5,
    valor_compra DECIMAL(10, 2) NOT NULL,
    valor_venda DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para peças
CREATE INDEX idx_pecas_codigo ON pecas(codigo);
CREATE INDEX idx_pecas_nome ON pecas(nome);

-- ============================================
-- TABELA: pecas_utilizadas
-- ============================================
CREATE TABLE IF NOT EXISTS pecas_utilizadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    peca_id UUID NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10, 2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para peças utilizadas
CREATE INDEX idx_pecas_utilizadas_ordem_id ON pecas_utilizadas(ordem_id);
CREATE INDEX idx_pecas_utilizadas_peca_id ON pecas_utilizadas(peca_id);

-- ============================================
-- TABELA: estoque
-- ============================================
CREATE TABLE IF NOT EXISTS estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    peca_id UUID NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER DEFAULT 5,
    localizacao VARCHAR(100),
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para estoque
CREATE INDEX idx_estoque_peca_id ON estoque(peca_id);

-- ============================================
-- TABELA: imagens_equipamento
-- ============================================
CREATE TABLE IF NOT EXISTS imagens_equipamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipamento_id UUID REFERENCES equipamentos(id) ON DELETE CASCADE,
    ordem_id UUID REFERENCES ordens_servico(id) ON DELETE CASCADE,
    url_imagem VARCHAR(500) NOT NULL,
    tipo_imagem VARCHAR(50),
    descricao_tecnica TEXT,
    tecnico_responsavel VARCHAR(255),
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para imagens
CREATE INDEX idx_imagens_equipamento_id ON imagens_equipamento(equipamento_id);
CREATE INDEX idx_imagens_ordem_id ON imagens_equipamento(ordem_id);
CREATE INDEX idx_imagens_tipo ON imagens_equipamento(tipo_imagem);

-- ============================================
-- TABELA: historico_ordem_servico
-- ============================================
CREATE TABLE IF NOT EXISTS historico_ordem_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    status_anterior VARCHAR(50),
    novo_status VARCHAR(50) NOT NULL,
    descricao TEXT,
    tecnico_responsavel VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para histórico
CREATE INDEX idx_historico_ordem_id ON historico_ordem_servico(ordem_id);
CREATE INDEX idx_historico_data ON historico_ordem_servico(criado_em);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas_utilizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagens_equipamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_ordem_servico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (exemplo básico - adapte conforme necessário)
-- Usuários autenticados podem ler todas as tabelas
CREATE POLICY "Usuários autenticados podem ler clientes"
    ON clientes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar clientes"
    ON clientes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar clientes"
    ON clientes FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar clientes"
    ON clientes FOR DELETE
    USING (auth.role() = 'authenticated');

-- Aplicar políticas similares para outras tabelas conforme necessário

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Resumo de Ordens de Serviço
CREATE OR REPLACE VIEW v_resumo_ordens AS
SELECT 
    os.id,
    os.numero_os,
    c.nome as cliente_nome,
    e.marca,
    e.modelo,
    os.status,
    os.data_recebimento,
    os.valor_servico,
    COUNT(DISTINCT ie.id) as total_imagens
FROM ordens_servico os
LEFT JOIN clientes c ON os.cliente_id = c.id
LEFT JOIN equipamentos e ON os.equipamento_id = e.id
LEFT JOIN imagens_equipamento ie ON os.id = ie.ordem_id
GROUP BY os.id, os.numero_os, c.nome, e.marca, e.modelo, os.status, os.data_recebimento, os.valor_servico;

-- View: Faturamento por Cliente
CREATE OR REPLACE VIEW v_faturamento_cliente AS
SELECT 
    c.id,
    c.nome,
    COUNT(os.id) as total_ordens,
    SUM(os.valor_servico) as faturamento_total,
    AVG(os.valor_servico) as ticket_medio
FROM clientes c
LEFT JOIN ordens_servico os ON c.id = os.cliente_id
GROUP BY c.id, c.nome;

-- View: Estoque Crítico
CREATE OR REPLACE VIEW v_estoque_critico AS
SELECT 
    p.id,
    p.nome,
    p.codigo,
    e.quantidade,
    p.quantidade_minima,
    p.valor_compra,
    p.valor_venda
FROM pecas p
LEFT JOIN estoque e ON p.id = e.peca_id
WHERE e.quantidade <= p.quantidade_minima
ORDER BY e.quantidade ASC;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Atualizar timestamp ao modificar clientes
CREATE OR REPLACE FUNCTION atualizar_timestamp_clientes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_clientes
BEFORE UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp_clientes();

-- Trigger: Atualizar timestamp ao modificar equipamentos
CREATE OR REPLACE FUNCTION atualizar_timestamp_equipamentos()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_equipamentos
BEFORE UPDATE ON equipamentos
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp_equipamentos();

-- Trigger: Atualizar timestamp ao modificar ordens de serviço
CREATE OR REPLACE FUNCTION atualizar_timestamp_ordens()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_ordens
BEFORE UPDATE ON ordens_servico
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp_ordens();

-- ============================================
-- DADOS INICIAIS (EXEMPLO)
-- ============================================

-- Inserir cliente de exemplo
INSERT INTO clientes (nome, email, telefone, cpf, endereco)
VALUES (
    'João Silva',
    'joao@example.com',
    '(11) 99999-9999',
    '123.456.789-00',
    'Rua Exemplo, 123, São Paulo, SP'
) ON CONFLICT DO NOTHING;

-- Inserir equipamento de exemplo
INSERT INTO equipamentos (cliente_id, marca, modelo, numero_serie, estado_fisico)
SELECT id, 'Dell', 'Inspiron 15', 'SN123456789', 'bom'
FROM clientes WHERE nome = 'João Silva'
ON CONFLICT (numero_serie) DO NOTHING;

-- Inserir peça de exemplo
INSERT INTO pecas (nome, codigo, quantidade, quantidade_minima, valor_compra, valor_venda)
VALUES (
    'Bateria Notebook',
    'BAT-001',
    10,
    5,
    150.00,
    250.00
) ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- COMENTÁRIOS ÚTEIS
-- ============================================

COMMENT ON TABLE usuarios IS 'Armazena informações dos usuários do sistema';
COMMENT ON TABLE clientes IS 'Armazena informações dos clientes da assistência técnica';
COMMENT ON TABLE equipamentos IS 'Armazena informações dos equipamentos (notebooks)';
COMMENT ON TABLE ordens_servico IS 'Armazena as ordens de serviço';
COMMENT ON TABLE pecas IS 'Armazena o catálogo de peças disponíveis';
COMMENT ON TABLE pecas_utilizadas IS 'Rastreia quais peças foram utilizadas em cada ordem';
COMMENT ON TABLE estoque IS 'Controla o estoque de peças';
COMMENT ON TABLE imagens_equipamento IS 'Armazena referências de imagens dos equipamentos e ordens';
COMMENT ON TABLE historico_ordem_servico IS 'Mantém histórico completo de todas as alterações nas ordens';
