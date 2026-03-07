// ============================================
// CLIENTES MODULE - ROBUST VERSION
// ============================================

let currentClientId = null;
let allClientes = [];
let isLoading = false;

async function initClientesPage() {
    try {
        Logger.log('Initializing clientes page');
        showLoading(true);
        await loadClientes();
        setupEventListeners();
    } catch (error) {
        Logger.error('Error initializing clientes page', error);
        alert('Erro ao inicializar página de clientes.');
    } finally {
        showLoading(false);
    }
}

async function loadClientes() {
    if (isLoading) return;
    isLoading = true;
    try {
        allClientes = await db.getClientes();
        renderClientesTable(allClientes);
        Logger.log('Clientes loaded:', allClientes.length);
    } catch (error) {
        Logger.error('Error loading clientes', error);
        alert('Erro ao carregar clientes: ' + error.message);
    } finally {
        isLoading = false;
    }
}

function renderClientesTable(clientes) {
    const tableBody = document.getElementById('clientsTable');
    tableBody.innerHTML = '';

    if (!clientes || clientes.length === 0) {
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
    const newClientBtn = document.getElementById('newClientBtn');
    const searchInput = document.getElementById('searchClients');
    const closeClientModalBtn = document.getElementById('closeClientModal');
    const cancelClientBtn = document.getElementById('cancelClientBtn');
    const closeDetailsModalBtn = document.getElementById('closeDetailsModal');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
    const clientForm = document.getElementById('clientForm');
    const editClientBtn = document.getElementById('editClientBtn');

    if (newClientBtn) newClientBtn.addEventListener('click', openNewClientModal);
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allClientes.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term) ||
                c.phone.includes(term)
            );
            renderClientesTable(filtered);
        });
    }

    if (closeClientModalBtn) closeClientModalBtn.addEventListener('click', closeModal);
    if (cancelClientBtn) cancelClientBtn.addEventListener('click', closeModal);
    if (closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', closeModal);
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeModal);

    if (clientForm) clientForm.addEventListener('submit', saveCliente);
    if (editClientBtn) {
        editClientBtn.addEventListener('click', () => {
            document.getElementById('clientDetailsModal').classList.add('hidden');
            openEditClientModal(currentClientId);
        });
    }
}

function showLoading(visible) {
    const loadingElem = document.getElementById('loadingIndicator');
    if (!loadingElem) return;
    loadingElem.style.display = visible ? 'block' : 'none';
}

function openNewClientModal() {
    currentClientId = null;
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    document.getElementById('modalTitle').textContent = 'Novo Cliente';
    document.getElementById('clientModal').classList.remove('hidden');
}

function openEditClientModal(clienteId) {
    currentClientId = clienteId;
    const cliente = allClientes.find(c => c.id === clienteId);
    if (!cliente) return alert('Cliente não encontrado.');

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
    if (isLoading) return;

    const clientId = document.getElementById('clientId').value;
    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        cpf: document.getElementById('clientCpf').value,
        address: document.getElementById('clientAddress').value,
    };

    try {
        showLoading(true);
        if (clientId) {
            await db.updateCliente(clientId, clientData);
            alert('Cliente atualizado com sucesso!');
        } else {
            await db.createCliente(clientData);
            alert('Cliente criado com sucesso!');
        }
        closeModal();
        await loadClientes();
    } catch (error) {
        Logger.error('Error saving cliente', error);
        alert('Erro ao salvar cliente: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function editCliente(clienteId) {
    const cliente = allClientes.find(c => c.id === clienteId);
    if (!cliente) return alert('Cliente não encontrado.');
    openEditClientModal(clienteId);
}

async function deleteCliente(clienteId) {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return;
    try {
        showLoading(true);
        await db.deleteCliente(clienteId);
        alert('Cliente deletado com sucesso!');
        await loadClientes();
    } catch (error) {
        Logger.error('Error deleting cliente', error);
        alert('Erro ao deletar cliente: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function viewClientEquipments(clienteId) {
    try {
        showLoading(true);
        const cliente = await db.getClienteById(clienteId);
        const equipamentos = await db.getEquipamentosByCliente(clienteId);
        const ordensServico = await db.getOrdensServicoByCliente(clienteId);

        if (!cliente) return alert('Cliente não encontrado.');
        currentClientId = clienteId;

        document.getElementById('detailsTitle').textContent = `Detalhes do Cliente - ${cliente.name}`;
        document.getElementById('detailName').textContent = cliente.name;
        document.getElementById('detailEmail').textContent = cliente.email;
        document.getElementById('detailPhone').textContent = cliente.phone;
        document.getElementById('detailCpf').textContent = cliente.cpf || 'N/A';
        document.getElementById('detailAddress').textContent = cliente.address || 'N/A';

        const historyTable = document.getElementById('clientHistoryTable');
        historyTable.innerHTML = '';

        if (!ordensServico || ordensServico.length === 0) {
            historyTable.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum serviço registrado</td></tr>';
        } else {
            for (const ordem of ordensServico) {
                const equipamento = await db.getEquipamentoById(ordem.equipment_id);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ordem.os_number}</td>
                    <td>${equipamento?.brand || 'N/A'} ${equipamento?.model || ''}</td>
                    <td><span class="status-badge status-${ordem.status}">${getStatusLabel(ordem.status)}</span></td>
                    <td>${formatDate(ordem.date_received)}</td>
                    <td>${formatCurrency(ordem.service_value)}</td>
                `;
                historyTable.appendChild(row);
            }
        }

        document.getElementById('clientDetailsModal').classList.remove('hidden');
    } catch (error) {
        Logger.error('Error loading client details', error);
        alert('Erro ao carregar detalhes do cliente: ' + error.message);
    } finally {
        showLoading(false);
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