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

        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');

        if (orderId)
            viewOrderDetails(orderId);

    } catch (error) {

        Logger.error('Error initializing ordens de serviço page', error);

    }

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
            allClientes.find(c => c.id === ordem.cliente_id);

        const equipamento =
            allEquipamentos.find(e => e.id === ordem.equipamento_id);

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${ordem.numero_os}</td>
            <td>${cliente?.nome || 'N/A'}</td>
            <td>${equipamento?.marca} ${equipamento?.modelo}</td>
            <td>
                <span class="status-badge status-${ordem.status}">
                    ${getStatusLabel(ordem.status)}
                </span>
            </td>
            <td>${formatDate(ordem.data_entrada)}</td>
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

    ['closeOrderModal','cancelOrderBtn','closeDetailsModal','closeDetailsBtn']
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
            e.cliente_id === clientId
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

        data_entrada:
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