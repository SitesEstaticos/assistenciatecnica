# Sistema de Gerenciamento de Ordens de Serviço - Assistência Técnica

## 📋 Descrição

Sistema web profissional e completo para gerenciamento de ordens de serviço em assistência técnica de notebooks. Desenvolvido como **PWA (Progressive Web App)** com funcionalidades offline, hospedagem em **GitHub Pages** e integração com **Supabase** e **Cloudinary**.

## 🎯 Características Principais

- ✅ **Autenticação Segura** com Supabase Auth
- ✅ **Gerenciamento de Clientes** com histórico completo
- ✅ **Cadastro de Equipamentos** com galeria de imagens
- ✅ **Ordens de Serviço** com status e timeline
- ✅ **Diagnóstico Técnico** detalhado
- ✅ **Controle de Estoque** de peças
- ✅ **Relatórios Financeiros** com gráficos
- ✅ **Geração de PDF** automática
- ✅ **Upload de Imagens** via Cloudinary com compressão
- ✅ **PWA Instalável** com offline parcial
- ✅ **Design Responsivo** e moderno
- ✅ **Row Level Security** no banco de dados

## 🚀 Começando

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conta Supabase
- Conta Cloudinary
- Git (para clonar o repositório)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/assistencia-tecnica.git
   cd assistencia-tecnica
   ```

2. **Configure as credenciais**
   - Abra `js/config.js`
   - Substitua `YOUR_SUPABASE_URL` pela URL do seu projeto Supabase
   - Substitua `YOUR_SUPABASE_ANON_KEY` pela chave anônima do Supabase
   - Substitua `YOUR_CLOUDINARY_CLOUD_NAME` pelo seu cloud name
   - Substitua `YOUR_CLOUDINARY_UPLOAD_PRESET` pelo seu preset de upload

3. **Configure o banco de dados**
   - Acesse seu projeto Supabase
   - Vá para SQL Editor
   - Cole o conteúdo de `database.sql`
   - Execute o script

4. **Publique no GitHub Pages**
   - Crie um repositório no GitHub
   - Faça push do código
   - Ative GitHub Pages nas configurações do repositório
   - Escolha a branch `main` como fonte

## 📁 Estrutura do Projeto

```
assistencia-tecnica/
├── index.html                 # Página de login
├── dashboard.html            # Dashboard principal
├── clientes.html             # Gerenciamento de clientes
├── equipamentos.html         # Gerenciamento de equipamentos
├── ordens-servico.html       # Gerenciamento de ordens
├── estoque.html              # Controle de estoque
├── relatorios.html           # Relatórios e análises
├── manifest.json             # Configuração PWA
├── sw.js                     # Service Worker
├── database.sql              # Script SQL do banco
├── css/
│   └── styles.css            # Estilos globais
├── js/
│   ├── config.js             # Configurações
│   ├── auth.js               # Autenticação
│   ├── db.js                 # Gerenciamento de dados
│   ├── cloudinary.js         # Upload de imagens
│   ├── pdf-generator.js      # Geração de PDF
│   ├── dashboard.js          # Lógica do dashboard
│   ├── clientes.js           # Lógica de clientes
│   ├── equipamentos.js       # Lógica de equipamentos
│   ├── ordens-servico.js     # Lógica de ordens
│   ├── estoque.js            # Lógica de estoque
│   ├── relatorios.js         # Lógica de relatórios
│   └── app.js                # Aplicação principal
└── README.md                 # Este arquivo
```

## 🔧 Configuração Detalhada

### Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Copie a URL e a chave anônima
3. Execute o script `database.sql` no SQL Editor
4. Configure as políticas RLS conforme necessário

### Cloudinary

1. Crie uma conta em [Cloudinary](https://cloudinary.com)
2. Vá para Settings > Upload
3. Crie um upload preset (sem autenticação)
4. Copie o Cloud Name e o Upload Preset

### GitHub Pages

1. Crie um repositório público no GitHub
2. Faça push do código
3. Vá para Settings > Pages
4. Escolha "Deploy from a branch"
5. Selecione a branch `main` e a pasta `/ (root)`
6. Clique em Save

## 📱 Como Usar

### Login

1. Acesse a página de login
2. Digite seu email e senha (use credenciais de teste inicialmente)
3. Clique em "Entrar"

### Dashboard

- Visualize estatísticas em tempo real
- Veja gráficos de serviços e faturamento
- Acesse as últimas ordens de serviço

### Clientes

- Cadastre novos clientes
- Edite informações existentes
- Visualize histórico de serviços por cliente

### Equipamentos

- Registre notebooks com todos os detalhes
- Faça upload de imagens do equipamento
- Organize por cliente

### Ordens de Serviço

- Crie novas ordens
- Acompanhe o status (Recebido → Entregue)
- Registre diagnóstico e serviços realizados
- Gere PDF da ordem
- Visualize timeline completa

### Estoque

- Cadastre peças e componentes
- Controle quantidade e valores
- Receba alertas de estoque baixo
- Calcule margem de lucro

### Relatórios

- Gere relatórios financeiros
- Visualize gráficos de faturamento
- Exporte dados em Excel
- Analise performance por período

## 🔐 Segurança

- **Autenticação**: Supabase Auth com JWT
- **Criptografia**: HTTPS obrigatório
- **RLS**: Row Level Security no banco de dados
- **Validação**: Validação de entrada no frontend e backend
- **Armazenamento**: Dados sensíveis não são armazenados localmente

## 📊 Banco de Dados

### Tabelas Principais

- **usuarios**: Usuários do sistema
- **clientes**: Informações dos clientes
- **equipamentos**: Dados dos notebooks
- **ordens_servico**: Ordens de serviço
- **pecas**: Catálogo de peças
- **pecas_utilizadas**: Peças usadas por ordem
- **estoque**: Controle de estoque
- **imagens_equipamento**: Galeria de imagens
- **historico_ordem_servico**: Timeline das ordens

## 🎨 Design

- **Paleta de Cores**: Azul escuro (#1e3a8a), Cinza claro, Branco
- **Tipografia**: Inter / Poppins
- **Layout**: Sidebar + Conteúdo principal
- **Responsivo**: Mobile, Tablet, Desktop

## 📦 PWA (Progressive Web App)

O sistema funciona como um aplicativo instalável:

1. Clique no ícone de instalação no navegador
2. Escolha "Instalar aplicativo"
3. Acesse como um app nativo
4. Funciona parcialmente offline

## 🔄 Sincronização

- Dados são sincronizados com Supabase quando online
- Dados locais são mantidos no localStorage
- Service Worker cache assets para acesso offline

## 📈 Performance

- **Compressão de Imagens**: Automática antes do upload
- **Cache**: Service Worker com estratégia cache-first
- **Otimização**: Lazy loading e code splitting
- **CDN**: Cloudinary para distribuição de imagens

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique as credenciais do Supabase em `config.js`
- Certifique-se de que a URL termina com `.supabase.co`

### Imagens não carregam
- Verifique as credenciais do Cloudinary
- Confirme que o upload preset está correto
- Verifique a quota de upload

### Dados não sincronizam
- Verifique a conexão de internet
- Abra o console (F12) para ver erros
- Verifique as políticas RLS no Supabase

## 📝 Licença

Este projeto é fornecido como está. Sinta-se livre para modificar e usar conforme necessário.

## 👥 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Supabase
2. Consulte a documentação do Cloudinary
3. Abra uma issue no repositório

## 🚀 Melhorias Futuras

- [ ] Integração com WhatsApp para notificações
- [ ] App mobile nativo (React Native)
- [ ] Integração com sistemas de pagamento
- [ ] Agendamento automático de serviços
- [ ] Análise de dados com IA
- [ ] Integração com CRM
- [ ] Suporte a múltiplas filiais
- [ ] Backup automático

## 📚 Documentação Adicional

- [Supabase Docs](https://supabase.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [GitHub Pages Docs](https://pages.github.com)
- [PWA Docs](https://web.dev/progressive-web-apps/)

---

**Desenvolvido com ❤️ para assistências técnicas profissionais**
