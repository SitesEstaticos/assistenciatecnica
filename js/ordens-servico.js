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

        // Load data
        await loadOrdensServico();
        await loadClientes();
        await loadEquipamentos();

        // Setup event listeners
        setupEventListeners();

        // Check URL params for order ID
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('id');
        if (orderId) {
            viewOrderDetails(orderId);
        }
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

        // Populate select
        const clientSelect = document.getElementById('orderClient');
        if (clientSelect) {
            clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
            allClientes.forEach((cliente) => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.name;
                clientSelect.appendChild(option);
            });

            // Update equipment list when client changes
            clientSelect.addEventListener('change', updateEquipmentList);
        }
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

    if (ordens.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma ordem de serviço registrada</td></tr>';
        return;
    }

    ordens.forEach((ordem) => {
        const cliente = allClientes.find((c) => c.id === ordem.client_id);
        const equipamento = allEquipamentos.find((e) => e.id === ordem.equipment_id);
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
    // New order button
    const newOrderBtn = document.getElementById('newOrderBtn');
    if (newOrderBtn) {
        newOrderBtn.addEventListener('click', openNewOrderModal);
    }

    // Search input
    const searchInput = document.getElementById('searchOrders');
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }

    // Status filter
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', filterOrders);
    }

    // Modal close buttons
    const closeOrderModal = document.getElementById('closeOrderModal');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const closeDetailsModal = document.getElementById('closeDetailsModal');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');

    if (closeOrderModal) closeOrderModal.addEventListener('click', closeModal);
    if (cancelOrderBtn) cancelOrderBtn.addEventListener('click', closeModal);
    if (closeDetailsModal) closeDetailsModal.addEventListener('click', closeModal);
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeModal);

    // Form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', saveOrdenServico);
    }

    // Edit button in details modal
    const editOrderBtn = document.getElementById('editOrderBtn');
    if (editOrderBtn) {
        editOrderBtn.addEventListener('click', () => {
            document.getElementById('orderDetailsModal').classList.add('hidden');
            openEditOrderModal(currentOrderId);
        });
    }

    // Generate PDF button
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', generateOrderPDF);
    }
}

function updateEquipmentList() {
    const clientId = document.getElementById('orderClient').value;
    const equipmentSelect = document.getElementById('orderEquipment');

    equipmentSelect.innerHTML = '<option value="">Selecione um equipamento</option>';

    if (clientId) {
        const clientEquipments = allEquipamentos.filter((e) => e.client_id === clientId);
        clientEquipments.forEach((equip) => {
            const option = document.createElement('option');
            option.value = equip.id;
            option.textContent = `${equip.brand} ${equip.model} (${equip.serial_number})`;
            equipmentSelect.appendChild(option);
        });
    }
}

function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allOrdensServico.filter((ordem) => {
        const matchesSearch =
            ordem.os_number.toLowerCase().includes(searchTerm) ||
            allClientes.find((c) => c.id === ordem.client_id)?.name.toLowerCase().includes(searchTerm);

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
    const ordem = allOrdensServico.find((o) => o.id === ordemId);

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
        technician_responsible: document.getElementById('orderTechnician').value,
    };

    try {
        if (orderId) {
            // Update existing
            await db.updateOrdenServico(orderId, ordemData);
            alert('Ordem de serviço atualizada com sucesso!');
        } else {
            // Create new
            await db.createOrdenServico(ordemData);
            alert('Ordem de serviço criada com sucesso!');
        }

        closeModal();
        await loadOrdensServico();
    } catch (error) {
        alert('Erro ao salvar ordem de serviço: ' + error.message);
        Logger.error('Error saving ordem de serviço', error);
    }
}

async function deleteOrdenServico(ordemId) {
    if (!confirm('Tem certeza que deseja deletar esta ordem de serviço?')) return;

    try {
        await db.deleteOrdenServico(ordemId);
        alert('Ordem de serviço deletada com sucesso!');
        await loadOrdensServico();
    } catch (error) {
        alert('Erro ao deletar ordem de serviço: ' + error.message);
        Logger.error('Error deleting ordem de serviço', error);
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

        // Populate details modal
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

        // Load gallery
        const gallery = document.getElementById('orderGallery');
        gallery.innerHTML = '';

        if (imagens.length === 0) {
            gallery.innerHTML = '<p class="text-center">Nenhuma imagem registrada</p>';
        } else {
            imagens.forEach((img) => {
                const item = document.createElement('div');
                item.className = 'image-gallery-item';
                item.innerHTML = `<img src="${img.url_imagem}" alt="${img.tipo_imagem}">`;
                item.addEventListener('click', () => {
                    window.open(img.url_imagem, '_blank');
                });
                gallery.appendChild(item);
            });
        }

        // Load timeline
        const timeline = document.getElementById('orderTimeline');
        timeline.innerHTML = '';

        if (historico.length === 0) {
            timeline.innerHTML = '<p class="text-center">Nenhum histórico registrado</p>';
        } else {
            historico.forEach((item, index) => {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                timelineItem.innerHTML = `
                    <div class="timeline-marker">${index + 1}</div>
                    <div class="timeline-content">
                        <h4>${getStatusLabel(item.novo_status)}</h4>
                        <p>${item.descricao}</p>
                        <p class="timestamp">${formatDateTime(item.created_at)} - ${item.tecnico_responsavel}</p>
                    </div>
                `;
                timeline.appendChild(timelineItem);
            });
        }

        document.getElementById('orderDetailsModal').classList.remove('hidden');
    } catch (error) {
        alert('Erro ao carregar detalhes da ordem: ' + error.message);
        Logger.error('Error loading order details', error);
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
        alert('Erro ao gerar PDF: ' + error.message);
        Logger.error('Error generating PDF', error);
    }
}

function closeModal() {
    document.getElementById('orderModal').classList.add('hidden');
    document.getElementById('orderDetailsModal').classList.add('hidden');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ordersTable')) {
        initOrdensServicoPage();
    }
});
