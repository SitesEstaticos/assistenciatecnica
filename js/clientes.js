// ============================================
// CLIENTES MODULE
// ============================================

let currentClientId = null;
let allClientes = [];

async function initClientesPage() {
    try {
        Logger.log('Initializing clientes page');

        // Load clients
        await loadClientes();

        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        Logger.error('Error initializing clientes page', error);
    }
}

async function loadClientes() {
    try {
        allClientes = await db.getClientes();
        renderClientesTable(allClientes);
        Logger.log('Clientes loaded:', allClientes.length);
    } catch (error) {
        Logger.error('Error loading clientes', error);
    }
}

function renderClientesTable(clientes) {
    const tableBody = document.getElementById('clientsTable');
    tableBody.innerHTML = '';

    if (clientes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum cliente registrado</td></tr>';
        return;
    }

    clientes.forEach((cliente) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.name}</td>
            <td>${cliente.email}</td>
            <td>${cliente.phone}</td>
            <td>${cliente.cpf || 'N/A'}</td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="viewClientEquipments('${cliente.id}')">Ver</button>
            </td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editCliente('${cliente.id}')">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deleteCliente('${cliente.id}')">Deletar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function setupEventListeners() {
    // New client button
    const newClientBtn = document.getElementById('newClientBtn');
    if (newClientBtn) {
        newClientBtn.addEventListener('click', openNewClientModal);
    }

    // Search input
    const searchInput = document.getElementById('searchClients');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allClientes.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchTerm) ||
                    c.email.toLowerCase().includes(searchTerm) ||
                    c.phone.includes(searchTerm)
            );
            renderClientesTable(filtered);
        });
    }

    // Modal close buttons
    const closeClientModal = document.getElementById('closeClientModal');
    const cancelClientBtn = document.getElementById('cancelClientBtn');
    const closeDetailsModal = document.getElementById('closeDetailsModal');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');

    if (closeClientModal) closeClientModal.addEventListener('click', closeModal);
    if (cancelClientBtn) cancelClientBtn.addEventListener('click', closeModal);
    if (closeDetailsModal) closeDetailsModal.addEventListener('click', closeDetailsModal);
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeDetailsModal);

    // Form submission
    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.addEventListener('submit', saveCliente);
    }

    // Edit button in details modal
    const editClientBtn = document.getElementById('editClientBtn');
    if (editClientBtn) {
        editClientBtn.addEventListener('click', () => {
            document.getElementById('clientDetailsModal').classList.add('hidden');
            openEditClientModal(currentClientId);
        });
    }
}

function openNewClientModal() {
    currentClientId = null;
    document.getElementById('clientId').value = '';
    document.getElementById('clientForm').reset();
    document.getElementById('modalTitle').textContent = 'Novo Cliente';
    document.getElementById('clientModal').classList.remove('hidden');
}

function openEditClientModal(clienteId) {
    currentClientId = clienteId;
    const cliente = allClientes.find((c) => c.id === clienteId);

    if (!cliente) return;

    document.getElementById('clientId').value = cliente.id;
    document.getElementById('clientName').value = cliente.name;
    document.getElementById('clientEmail').value = cliente.email;
    document.getElementById('clientPhone').value = cliente.phone;
    document.getElementById('clientCpf').value = cliente.cpf || '';
    document.getElementById('clientAddress').value = cliente.address || '';

    document.getElementById('modalTitle').textContent = 'Editar Cliente';
    document.getElementById('clientModal').classList.remove('hidden');
}

async function saveCliente(e) {
    e.preventDefault();

    const clientId = document.getElementById('clientId').value;
    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        cpf: document.getElementById('clientCpf').value,
        address: document.getElementById('clientAddress').value,
    };

    try {
        if (clientId) {
            // Update existing
            await db.updateCliente(clientId, clientData);
            alert('Cliente atualizado com sucesso!');
        } else {
            // Create new
            await db.createCliente(clientData);
            alert('Cliente criado com sucesso!');
        }

        closeModal();
        await loadClientes();
    } catch (error) {
        alert('Erro ao salvar cliente: ' + error.message);
        Logger.error('Error saving cliente', error);
    }
}

async function editCliente(clienteId) {
    const cliente = allClientes.find((c) => c.id === clienteId);
    if (cliente) {
        openEditClientModal(clienteId);
    }
}

async function deleteCliente(clienteId) {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return;

    try {
        await db.deleteCliente(clienteId);
        alert('Cliente deletado com sucesso!');
        await loadClientes();
    } catch (error) {
        alert('Erro ao deletar cliente: ' + error.message);
        Logger.error('Error deleting cliente', error);
    }
}

async function viewClientEquipments(clienteId) {
    try {
        const cliente = await db.getClienteById(clienteId);
        const equipamentos = await db.getEquipamentosByCliente(clienteId);
        const ordensServico = await db.getOrdensServicoByCliente(clienteId);

        currentClientId = clienteId;

        // Populate details modal
        document.getElementById('detailsTitle').textContent = `Detalhes do Cliente - ${cliente.name}`;
        document.getElementById('detailName').textContent = cliente.name;
        document.getElementById('detailEmail').textContent = cliente.email;
        document.getElementById('detailPhone').textContent = cliente.phone;
        document.getElementById('detailCpf').textContent = cliente.cpf || 'N/A';
        document.getElementById('detailAddress').textContent = cliente.address || 'N/A';

        // Load service history
        const historyTable = document.getElementById('clientHistoryTable');
        historyTable.innerHTML = '';

        if (ordensServico.length === 0) {
            historyTable.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum serviço registrado</td></tr>';
        } else {
            for (const ordem of ordensServico) {
                const equipamento = await db.getEquipamentoById(ordem.equipment_id);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ordem.os_number}</td>
                    <td>${equipamento?.brand} ${equipamento?.model}</td>
                    <td><span class="status-badge status-${ordem.status}">${getStatusLabel(ordem.status)}</span></td>
                    <td>${formatDate(ordem.date_received)}</td>
                    <td>${formatCurrency(ordem.service_value)}</td>
                `;
                historyTable.appendChild(row);
            }
        }

        document.getElementById('clientDetailsModal').classList.remove('hidden');
    } catch (error) {
        alert('Erro ao carregar detalhes do cliente: ' + error.message);
        Logger.error('Error loading client details', error);
    }
}

function closeModal() {
    document.getElementById('clientModal').classList.add('hidden');
    document.getElementById('clientDetailsModal').classList.add('hidden');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('clientsTable')) {
        initClientesPage();
    }
});
