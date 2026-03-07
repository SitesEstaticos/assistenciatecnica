// ============================================
// ORDENS DE SERVIÇO MODULE - TOTAL SUPABASE
// ============================================

let currentOrderId = null;
let allOrdensServico = [];
let allClientes = [];
let allEquipamentos = [];

async function initOrdensServicoPage() {
    try {
        Logger.log('Initializing ordens de serviço page');

        // Load data
        await loadClientes();
        await loadEquipamentos();
        await loadOrdensServico();

        // Setup event listeners
        setupEventListeners();

        // Check URL params for order ID
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        if (orderId) viewOrderDetails(orderId);

    } catch (error) {
        Logger.error('Error initializing ordens de serviço page', error);
    }
}

async function loadOrdensServico() {
    try {
        allOrdensServico = await db.getOrdensServico();
        renderOrdensTable(allOrdensServico);
        Logger.log('Ordens de serviço loaded:', allOrdensServico.length);
    } catch (error) {
        Logger.error('Error loading ordens de serviço', error);
    }
}

async function loadClientes() {
    try {
        allClientes = await db.getClientes();
        const clientSelect = document.getElementById('orderClient');
        if (!clientSelect) return;
        clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
        allClientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
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
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma ordem de serviço registrada</td></tr>';
        return;
    }

    ordens.forEach(ordem => {
        const cliente = allClientes.find(c => c.id === ordem.client_id);
        const equipamento = allEquipamentos.find(e => e.id === ordem.equipment_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ordem.os_number}</td>
            <td>${cliente?.name || 'N/A'}</td>
            <td>${equipamento?.brand} ${equipamento?.model}</td>
            <td><span class="status-badge status-${ordem.status}">${getStatusLabel(ordem.status)}</span></td>
            <td>${formatDate(ordem.date_received)}</td>
            <td>${formatCurrency(ordem.service_value)}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewOrderDetails('${ordem.id}')">Ver</button>
                <button class="btn btn-small btn-danger" onclick="deleteOrdenServico('${ordem.id}')">Deletar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function setupEventListeners() {
    const newOrderBtn = document.getElementById('newOrderBtn');
    if (newOrderBtn) newOrderBtn.addEventListener('click', openNewOrderModal);

    const searchInput = document.getElementById('searchOrders');
    const filterStatus = document.getElementById('filterStatus');
    if (searchInput) searchInput.addEventListener('input', filterOrders);
    if (filterStatus) filterStatus.addEventListener('change', filterOrders);

    ['closeOrderModal','cancelOrderBtn','closeDetailsModal','closeDetailsBtn'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener('click', closeModal);
    });

    const orderForm = document.getElementById('orderForm');
    if (orderForm) orderForm.addEventListener('submit', saveOrdenServico);

    const editOrderBtn = document.getElementById('editOrderBtn');
    if (editOrderBtn) editOrderBtn.addEventListener('click', () => {
        document.getElementById('orderDetailsModal').classList.add('hidden');
        openEditOrderModal(currentOrderId);
    });

    const generatePdfBtn = document.getElementById('generatePdfBtn');
    if (generatePdfBtn) generatePdfBtn.addEventListener('click', generateOrderPDF);
}

function updateEquipmentList() {
    const clientId = document.getElementById('orderClient').value;
    const equipmentSelect = document.getElementById('orderEquipment');
    equipmentSelect.innerHTML = '<option value="">Selecione um equipamento</option>';
    if (!clientId) return;
    const clientEquipments = allEquipamentos.filter(e => e.client_id === clientId);
    clientEquipments.forEach(equip => {
        const option = document.createElement('option');
        option.value = equip.id;
        option.textContent = `${equip.brand} ${equip.model} (${equip.serial_number})`;
        equipmentSelect.appendChild(option);
    });
}

function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allOrdensServico.filter(ordem => {
        const matchesSearch =
            ordem.os_number.toLowerCase().includes(searchTerm) ||
            allClientes.find(c => c.id === ordem.client_id)?.name.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || ordem.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    renderOrdensTable(filtered);
}

function openNewOrderModal() {
    currentOrderId = null;
    document.getElementById('orderId').value = '';
    document.getElementById('orderForm').reset();
    document.getElementById('orderDate').valueAsDate = new Date();
    document.getElementById('modalTitle').textContent = 'Nova Ordem de Serviço';
    document.getElementById('orderModal').classList.remove('hidden');
}

function openEditOrderModal(ordemId) {
    currentOrderId = ordemId;
    const ordem = allOrdensServico.find(o => o.id === ordemId);
    if (!ordem) return;

    document.getElementById('orderId').value = ordem.id;
    document.getElementById('orderClient').value = ordem.client_id;
    updateEquipmentList();
    document.getElementById('orderEquipment').value = ordem.equipment_id;
    document.getElementById('orderStatus').value = ordem.status;
    document.getElementById('orderDate').value = ordem.date_received.split('T')[0];
    document.getElementById('orderProblem').value = ordem.problem_reported || '';
    document.getElementById('orderDiagnosis').value = ordem.technical_diagnosis || '';
    document.getElementById('orderServices').value = ordem.services_performed || '';
    document.getElementById('orderValue').value = ordem.service_value || '';
    document.getElementById('orderTechnician').value = ordem.technician_responsible || '';

    document.getElementById('modalTitle').textContent = 'Editar Ordem de Serviço';
    document.getElementById('orderModal').classList.remove('hidden');
}

async function saveOrdenServico(e) {
    e.preventDefault();
    const orderId = document.getElementById('orderId').value;
    const ordemData = {
        client_id: document.getElementById('orderClient').value,
        equipment_id: document.getElementById('orderEquipment').value,
        status: document.getElementById('orderStatus').value,
        date_received: document.getElementById('orderDate').value,
        problem_reported: document.getElementById('orderProblem').value,
        technical_diagnosis: document.getElementById('orderDiagnosis').value,
        services_performed: document.getElementById('orderServices').value,
        service_value: parseFloat(document.getElementById('orderValue').value) || 0,
        technician_responsible: document.getElementById('orderTechnician').value
    };

    try {
        if (orderId) await db.updateOrdenServico(orderId, ordemData);
        else await db.createOrdenServico(ordemData);

        alert(orderId ? 'Ordem de serviço atualizada!' : 'Ordem de serviço criada!');
        closeModal();
        await loadOrdensServico();
    } catch (error) {
        Logger.error('Error saving ordem de serviço', error);
        alert('Erro ao salvar ordem de serviço: ' + error.message);
    }
}

async function deleteOrdenServico(ordemId) {
    if (!confirm('Tem certeza que deseja deletar esta ordem de serviço?')) return;
    try {
        await db.deleteOrdenServico(ordemId);
        alert('Ordem de serviço deletada!');
        await loadOrdensServico();
    } catch (error) {
        Logger.error('Error deleting ordem de serviço', error);
        alert('Erro ao deletar ordem de serviço: ' + error.message);
    }
}

async function viewOrderDetails(ordemId) {
    try {
        const ordem = await db.getOrdenServicoById(ordemId);
        const cliente = await db.getClienteById(ordem.client_id);
        const equipamento = await db.getEquipamentoById(ordem.equipment_id);
        const imagens = await db.getImagensByOrdenServico(ordemId);
        const historico = await db.getHistoricoByOrdenServico(ordemId);

        currentOrderId = ordemId;

        document.getElementById('detailsTitle').textContent = `Ordem de Serviço ${ordem.os_number}`;
        document.getElementById('detailNumber').textContent = ordem.os_number;
        document.getElementById('detailClient').textContent = cliente?.name || 'N/A';
        document.getElementById('detailEquipment').textContent = `${equipamento?.brand} ${equipamento?.model}`;
        document.getElementById('detailStatus').textContent = getStatusLabel(ordem.status);
        document.getElementById('detailDate').textContent = formatDate(ordem.date_received);
        document.getElementById('detailTechnician').textContent = ordem.technician_responsible || 'N/A';
        document.getElementById('detailProblem').textContent = ordem.problem_reported || 'N/A';
        document.getElementById('detailDiagnosis').textContent = ordem.technical_diagnosis || 'N/A';
        document.getElementById('detailServices').textContent = ordem.services_performed || 'N/A';
        document.getElementById('detailValue').textContent = formatCurrency(ordem.service_value);

        const gallery = document.getElementById('orderGallery');
        gallery.innerHTML = imagens.length === 0 ? '<p class="text-center">Nenhuma imagem registrada</p>' : '';
        imagens.forEach(img => {
            const item = document.createElement('div');
            item.className = 'image-gallery-item';
            item.innerHTML = `<img src="${img.url_imagem}" alt="${img.tipo_imagem}">`;
            item.addEventListener('click', () => window.open(img.url_imagem, '_blank'));
            gallery.appendChild(item);
        });

        const timeline = document.getElementById('orderTimeline');
        timeline.innerHTML = historico.length === 0 ? '<p class="text-center">Nenhum histórico registrado</p>' : '';
        historico.forEach((item, i) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-marker">${i+1}</div>
                <div class="timeline-content">
                    <h4>${getStatusLabel(item.novo_status)}</h4>
                    <p>${item.descricao}</p>
                    <p class="timestamp">${formatDateTime(item.created_at)} - ${item.tecnico_responsavel}</p>
                </div>
            `;
            timeline.appendChild(timelineItem);
        });

        document.getElementById('orderDetailsModal').classList.remove('hidden');
    } catch (error) {
        Logger.error('Error loading order details', error);
        alert('Erro ao carregar detalhes da ordem: ' + error.message);
    }
}

async function generateOrderPDF() {
    try {
        const ordem = await db.getOrdenServicoById(currentOrderId);
        const cliente = await db.getClienteById(ordem.client_id);
        const equipamento = await db.getEquipamentoById(ordem.equipment_id);
        const imagens = await db.getImagensByOrdenServico(currentOrderId);

        await pdfGenerator.generateOrderPDF(ordem, cliente, equipamento, imagens);
        alert('PDF gerado com sucesso!');
    } catch (error) {
        Logger.error('Error generating PDF', error);
        alert('Erro ao gerar PDF: ' + error.message);
    }
}

function closeModal() {
    document.getElementById('orderModal').classList.add('hidden');
    document.getElementById('orderDetailsModal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ordersTable')) initOrdensServicoPage();
});