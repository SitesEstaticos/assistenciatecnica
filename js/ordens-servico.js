// ============================================
// ORDENS DE SERVIÇO MODULE
// ============================================

let currentOrderId = null;
let allOrdensServico = [];
let allClientes = [];
let allEquipamentos = [];

async function initOrdensServicoPage() {

    try {

        Logger.log('Initializing ordens de serviço page');

        await loadClientes();
        await loadEquipamentos();
        await loadOrdensServico();

        setupEventListeners();

        document
            .getElementById('generatePdfBtn')
            ?.addEventListener('click', generateOrderPdf);

        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');

        if (orderId) {
            viewOrderDetails(orderId);
        }

    } catch (error) {

        Logger.error('Error initializing ordens de serviço page', error);

    }

}
async function viewOrderDetails(ordemId) {

    try {

        const ordem = await db.getOrdemServicoById(ordemId);

        const cliente = await db.getClienteById(ordem.cliente_id);

        const equipamento = await db.getEquipamentoById(ordem.equipamento_id);

        // =============================
        // DETALHES PRINCIPAIS
        // =============================

        document.getElementById('detailNumber').textContent =
            ordem.numero_os || 'N/A';

        document.getElementById('detailClient').textContent =
            cliente?.nome || 'N/A';

        document.getElementById('detailEquipment').textContent =
            `${equipamento?.marca || ''} ${equipamento?.modelo || ''}`;

        document.getElementById('detailStatus').textContent =
            getStatusLabel(ordem.status);

        document.getElementById('detailDate').textContent =
            formatDate(ordem.data_recebimento);

        document.getElementById('detailTechnician').textContent =
            ordem.tecnico_responsavel || 'N/A';

        document.getElementById('detailValue').textContent =
            formatCurrency(ordem.valor_servico);

        document.getElementById('detailProblem').textContent =
            ordem.problema_relatado || 'N/A';

        document.getElementById('detailDiagnosis').textContent =
            ordem.diagnostico_tecnico || 'N/A';

        document.getElementById('detailServices').textContent =
            ordem.servicos_realizados || 'N/A';


        // =============================
        // PEÇAS UTILIZADAS
        // =============================

        await loadPartsUsed(ordemId);


        // =============================
        // IMAGENS DA OS
        // =============================

        await loadOrderImages(ordemId);


        // =============================
        // TIMELINE
        // =============================

        await loadOrderTimeline(ordemId);


        document.getElementById('orderDetailsModal')
            .classList.remove('hidden');

    } catch (error) {

        Logger.error('Error loading order details', error);

    }

}
async function loadPartsUsed(ordemId) {

    const partsTable = document.getElementById('partsTable');

    partsTable.innerHTML = '';

    const pecas = await db.getPecasByOrdem(ordemId);

    if (!pecas || pecas.length === 0) {

        partsTable.innerHTML =
            '<tr><td colspan="4" class="text-center">Nenhuma peça registrada</td></tr>';

        return;

    }

    pecas.forEach(p => {

        const total = p.quantidade * p.valor_unitario;

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${p.nome}</td>
            <td>${p.quantidade}</td>
            <td>${formatCurrency(p.valor_unitario)}</td>
            <td>${formatCurrency(total)}</td>
        `;

        partsTable.appendChild(row);

    });

}

async function loadOrderImages(ordemId) {

    const gallery = document.getElementById('orderGallery');

    gallery.innerHTML = '';

    const imagens = await db.getImagensByOrdem(ordemId);

    if (!imagens || imagens.length === 0) {

        gallery.innerHTML =
            '<p class="text-center">Nenhuma imagem registrada</p>';

        return;

    }

    imagens.forEach(img => {

        const div = document.createElement('div');

        div.className = 'gallery-item';

        div.innerHTML = `
            <img src="${img.url_imagem}" alt="Imagem OS">
        `;

        gallery.appendChild(div);

    });

}

async function loadOrderTimeline(ordemId) {

    const timeline = document.getElementById('orderTimeline');

    timeline.innerHTML = '';

    const historico = await db.getHistoricoByOrdem(ordemId);

    if (!historico || historico.length === 0) {

        timeline.innerHTML =
            '<p class="text-center">Nenhum histórico registrado</p>';

        return;

    }

    historico.forEach(h => {

        const div = document.createElement('div');

        div.className = 'timeline-item';

        div.innerHTML = `
            <div class="timeline-date">
                ${formatDate(h.data_evento)}
            </div>

            <div class="timeline-content">
                Status alterado para <strong>${getStatusLabel(h.status)}</strong>
            </div>
        `;

        timeline.appendChild(div);

    });

}

async function loadOrdensServico() {

    try {

        allOrdensServico = await db.getOrdensServico();

        renderOrdensTable(allOrdensServico);

        Logger.log('Ordens carregadas:', allOrdensServico.length);

    } catch (error) {

        Logger.error('Error loading ordens de serviço', error);

    }

}

async function loadClientes() {

    try {

        allClientes = await db.getClientes();

        const clientSelect = document.getElementById('orderClient');

        if (!clientSelect)
            return;

        clientSelect.innerHTML =
            '<option value="">Selecione um cliente</option>';

        allClientes.forEach(c => {

            const option = document.createElement('option');

            option.value = c.id;
            option.textContent = c.nome;

            clientSelect.appendChild(option);

        });

        clientSelect.addEventListener('change', updateEquipmentList);

    } catch (error) {

        Logger.error('Error loading clientes', error);

    }

}

async function loadEquipamentos() {

    try {

        allEquipamentos = await db.getEquipamentos();

    } catch (error) {

        Logger.error('Error loading equipamentos', error);

    }

}

function renderOrdensTable(ordens) {

    const tableBody = document.getElementById('ordersTable');

    tableBody.innerHTML = '';

    if (!ordens || ordens.length === 0) {

        tableBody.innerHTML =
            '<tr><td colspan="7" class="text-center">Nenhuma ordem registrada</td></tr>';

        return;

    }

    ordens.forEach(ordem => {

        const cliente =
            allClientes.find(c =>
                String(c.id) === String(ordem.cliente_id)
            );

        const equipamento =
            allEquipamentos.find(e =>
                String(e.id) === String(ordem.equipamento_id)
            );
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${ordem.numero_os}</td>
            <td>${cliente?.nome || 'N/A'}</td>
           <td>${equipamento ? `${equipamento.marca} ${equipamento.modelo}` : 'N/A'}</td>
            <td>
                <span class="status-badge status-${ordem.status}">
                    ${getStatusLabel(ordem.status)}
                </span>
            </td>
            <td>${formatDate(ordem.data_recebimento)}</td>
            <td>${formatCurrency(ordem.valor_servico)}</td>
            <td>
                <button class="btn btn-small btn-primary"
                    onclick="viewOrderDetails('${ordem.id}')">
                    Ver
                </button>

                <button class="btn btn-small btn-danger"
                    onclick="deleteOrdenServico('${ordem.id}')">
                    Deletar
                </button>
            </td>
        `;

        tableBody.appendChild(row);

    });

}

function setupEventListeners() {

    const newOrderBtn = document.getElementById('newOrderBtn');

    if (newOrderBtn)
        newOrderBtn.addEventListener('click', openNewOrderModal);

    const searchInput = document.getElementById('searchOrders');
    const filterStatus = document.getElementById('filterStatus');

    if (searchInput)
        searchInput.addEventListener('input', filterOrders);

    if (filterStatus)
        filterStatus.addEventListener('change', filterOrders);

    ['closeOrderModal', 'cancelOrderBtn', 'closeDetailsModal', 'closeDetailsBtn']
        .forEach(id => {

            const elem = document.getElementById(id);

            if (elem)
                elem.addEventListener('click', closeModal);

        });

    const orderForm = document.getElementById('orderForm');

    if (orderForm)
        orderForm.addEventListener('submit', saveOrdenServico);

}

function updateEquipmentList() {

    const clientId =
        document.getElementById('orderClient').value;

    const equipmentSelect =
        document.getElementById('orderEquipment');

    equipmentSelect.innerHTML =
        '<option value="">Selecione um equipamento</option>';

    if (!clientId)
        return;

    const clientEquipments =
        allEquipamentos.filter(e =>
            String(e.cliente_id) === clientId
        );

    clientEquipments.forEach(equip => {

        const option = document.createElement('option');

        option.value = equip.id;

        option.textContent =
            `${equip.marca} ${equip.modelo} (${equip.numero_serie})`;

        equipmentSelect.appendChild(option);

    });

}

function filterOrders() {

    const searchTerm =
        document.getElementById('searchOrders')
            .value
            .toLowerCase();

    const statusFilter =
        document.getElementById('filterStatus').value;

    const filtered =
        allOrdensServico.filter(ordem => {

            const cliente =
                allClientes.find(c =>
                    c.id === ordem.cliente_id
                );

            const matchesSearch =
                ordem.numero_os.toLowerCase().includes(searchTerm) ||
                cliente?.nome.toLowerCase().includes(searchTerm);

            const matchesStatus =
                !statusFilter || ordem.status === statusFilter;

            return matchesSearch && matchesStatus;

        });

    renderOrdensTable(filtered);

}

function openNewOrderModal() {

    currentOrderId = null;

    document.getElementById('orderId').value = '';

    document.getElementById('orderForm').reset();

    document.getElementById('orderDate').valueAsDate =
        new Date();

    document.getElementById('modalTitle').textContent =
        'Nova Ordem de Serviço';

    document.getElementById('orderModal')
        .classList.remove('hidden');

}

async function saveOrdenServico(e) {

    e.preventDefault();

    const orderId =
        document.getElementById('orderId').value;

    const ordemData = {

        cliente_id:
            document.getElementById('orderClient').value,

        equipamento_id:
            document.getElementById('orderEquipment').value,

        status:
            document.getElementById('orderStatus').value,

        data_recebimento:
            document.getElementById('orderDate').value,

        problema_relatado:
            document.getElementById('orderProblem').value,

        diagnostico_tecnico:
            document.getElementById('orderDiagnosis').value,

        servicos_realizados:
            document.getElementById('orderServices').value,

        valor_servico:
            parseFloat(
                document.getElementById('orderValue').value
            ) || 0,

        tecnico_responsavel:
            document.getElementById('orderTechnician').value

    };

    try {

        if (orderId)
            await db.updateOrdemServico(orderId, ordemData);

        else
            await db.createOrdemServico(ordemData);

        alert(
            orderId
                ? 'Ordem atualizada!'
                : 'Ordem criada!'
        );

        closeModal();

        await loadOrdensServico();

    } catch (error) {

        Logger.error('Error saving ordem', error);

        alert('Erro ao salvar ordem: ' + error.message);

    }

}

async function deleteOrdenServico(ordemId) {

    if (!confirm('Tem certeza que deseja deletar esta ordem?'))
        return;

    try {

        await db.deleteOrdemServico(ordemId);

        alert('Ordem deletada!');

        await loadOrdensServico();

    } catch (error) {

        Logger.error('Error deleting ordem', error);

        alert('Erro ao deletar ordem: ' + error.message);

    }

}

function closeModal() {

    document.getElementById('orderModal')
        .classList.add('hidden');

    document.getElementById('orderDetailsModal')
        .classList.add('hidden');

}

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('ordersTable'))
        initOrdensServicoPage();

});
function generateOrderPdf() {

    const element = document.getElementById('orderDetailsModal');

    pdfGenerator.generate(element);

}