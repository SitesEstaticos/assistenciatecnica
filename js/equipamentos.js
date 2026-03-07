// ============================================
// EQUIPAMENTOS MODULE - TOTAL SUPABASE
// ============================================

let currentEquipmentId = null;
let allEquipamentos = [];
let allClientes = [];
let uploadedImages = [];

async function initEquipamentosPage() {
    try {
        Logger.log('Initializing equipamentos page');

        // Load data from Supabase
        await loadClientes();
        await loadEquipamentos();

        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        Logger.error('Error initializing equipamentos page', error);
    }
}

async function loadEquipamentos() {
    try {
        allEquipamentos = await db.getEquipamentos();
        renderEquipamentosTable(allEquipamentos);
        Logger.log('Equipamentos loaded:', allEquipamentos.length);
    } catch (error) {
        Logger.error('Error loading equipamentos', error);
    }
}

async function loadClientes() {
    try {
        allClientes = await db.getClientes();

        const clientSelect = document.getElementById('equipmentClient');
        if (clientSelect) {
            clientSelect.innerHTML = '<option value="">Selecione um cliente</option>';
            allClientes.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = c.name;
                clientSelect.appendChild(option);
            });
        }
    } catch (error) {
        Logger.error('Error loading clientes', error);
    }
}

function renderEquipamentosTable(equipamentos) {
    const tableBody = document.getElementById('equipmentsTable');
    tableBody.innerHTML = '';

    if (!equipamentos || equipamentos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum equipamento registrado</td></tr>';
        return;
    }

    equipamentos.forEach(equip => {
        const cliente = allClientes.find(c => c.id === equip.client_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente?.name || 'N/A'}</td>
            <td>${equip.brand}</td>
            <td>${equip.model}</td>
            <td>${equip.serial_number}</td>
            <td>${equip.physical_condition || 'N/A'}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewEquipmentDetails('${equip.id}')">Ver</button>
                <button class="btn btn-small btn-danger" onclick="deleteEquipamento('${equip.id}')">Deletar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function setupEventListeners() {
    const newEquipmentBtn = document.getElementById('newEquipmentBtn');
    if (newEquipmentBtn) newEquipmentBtn.addEventListener('click', openNewEquipmentModal);

    const searchInput = document.getElementById('searchEquipments');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const term = e.target.value.toLowerCase();
            const filtered = allEquipamentos.filter(eq =>
                eq.brand.toLowerCase().includes(term) ||
                eq.model.toLowerCase().includes(term) ||
                eq.serial_number.toLowerCase().includes(term)
            );
            renderEquipamentosTable(filtered);
        });
    }

    ['closeEquipmentModal', 'cancelEquipmentBtn', 'closeDetailsModal', 'closeDetailsBtn'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener('click', closeModal);
    });

    const equipmentForm = document.getElementById('equipmentForm');
    if (equipmentForm) equipmentForm.addEventListener('submit', saveEquipamento);

    const editEquipmentBtn = document.getElementById('editEquipmentBtn');
    if (editEquipmentBtn) {
        editEquipmentBtn.addEventListener('click', () => {
            document.getElementById('equipmentDetailsModal').classList.add('hidden');
            openEditEquipmentModal(currentEquipmentId);
        });
    }
}

function openNewEquipmentModal() {
    currentEquipmentId = null;
    uploadedImages = [];
    document.getElementById('equipmentId').value = '';
    document.getElementById('equipmentForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('modalTitle').textContent = 'Novo Equipamento';
    document.getElementById('equipmentModal').classList.remove('hidden');
}

function openEditEquipmentModal(equipamentoId) {
    currentEquipmentId = equipamentoId;
    const equipamento = allEquipamentos.find(e => e.id === equipamentoId);
    if (!equipamento) return alert('Equipamento não encontrado.');

    document.getElementById('equipmentId').value = equipamento.id;
    document.getElementById('equipmentClient').value = equipamento.client_id;
    document.getElementById('equipmentBrand').value = equipamento.brand;
    document.getElementById('equipmentModel').value = equipamento.model;
    document.getElementById('equipmentSerial').value = equipamento.serial_number;
    document.getElementById('equipmentAccessories').value = equipamento.accessories || '';
    document.getElementById('equipmentCondition').value = equipamento.physical_condition || '';
    document.getElementById('equipmentPassword').value = equipamento.password || '';
    document.getElementById('equipmentNotes').value = equipamento.notes || '';
    document.getElementById('modalTitle').textContent = 'Editar Equipamento';
    document.getElementById('equipmentModal').classList.remove('hidden');
}

async function saveEquipamento(e) {
    e.preventDefault();
    const equipmentId = document.getElementById('equipmentId').value;
    const equipmentData = {
        client_id: document.getElementById('equipmentClient').value,
        brand: document.getElementById('equipmentBrand').value,
        model: document.getElementById('equipmentModel').value,
        serial_number: document.getElementById('equipmentSerial').value,
        accessories: document.getElementById('equipmentAccessories').value,
        physical_condition: document.getElementById('equipmentCondition').value,
        password: document.getElementById('equipmentPassword').value,
        notes: document.getElementById('equipmentNotes').value,
    };

    try {
        if (equipmentId) {
            await db.updateEquipamento(equipmentId, equipmentData);
            alert('Equipamento atualizado com sucesso!');
        } else {
            const newEquip = await db.createEquipamento(equipmentData);

            for (const img of uploadedImages) {
                await db.createImagem({
                    equipment_id: newEquip.id,
                    url_imagem: img.url,
                    tipo_imagem: 'recebimento_frontal',
                    descricao_tecnica: 'Imagem do equipamento',
                    tecnico_responsavel: auth.getUserEmail(),
                });
            }

            alert('Equipamento criado com sucesso!');
        }
        closeModal();
        await loadEquipamentos();
    } catch (error) {
        Logger.error('Error saving equipamento', error);
        alert('Erro ao salvar equipamento: ' + error.message);
    }
}

async function deleteEquipamento(equipamentoId) {
    if (!confirm('Tem certeza que deseja deletar este equipamento?')) return;

    try {
        await db.deleteEquipamento(equipamentoId);
        alert('Equipamento deletado com sucesso!');
        await loadEquipamentos();
    } catch (error) {
        Logger.error('Error deleting equipamento', error);
        alert('Erro ao deletar equipamento: ' + error.message);
    }
}

async function viewEquipmentDetails(equipamentoId) {
    try {
        const equipamento = await db.getEquipamentoById(equipamentoId);
        const cliente = await db.getClienteById(equipamento.client_id);
        const imagens = await db.getImagensByEquipamento(equipamentoId);

        currentEquipmentId = equipamentoId;

        document.getElementById('detailsTitle').textContent = `Detalhes do Equipamento - ${equipamento.brand} ${equipamento.model}`;
        document.getElementById('detailClient').textContent = cliente?.name || 'N/A';
        document.getElementById('detailBrand').textContent = equipamento.brand;
        document.getElementById('detailModel').textContent = equipamento.model;
        document.getElementById('detailSerial').textContent = equipamento.serial_number;
        document.getElementById('detailAccessories').textContent = equipamento.accessories || 'N/A';
        document.getElementById('detailCondition').textContent = equipamento.physical_condition || 'N/A';
        document.getElementById('detailNotes').textContent = equipamento.notes || 'N/A';

        const gallery = document.getElementById('equipmentGallery');
        gallery.innerHTML = '';

        if (!imagens || imagens.length === 0) {
            gallery.innerHTML = '<p class="text-center">Nenhuma imagem registrada</p>';
        } else {
            imagens.forEach(img => {
                const item = document.createElement('div');
                item.className = 'image-gallery-item';
                item.innerHTML = `<img src="${img.url_imagem}" alt="${img.tipo_imagem}" title="${img.tipo_imagem}">`;
                item.addEventListener('click', () => window.open(img.url_imagem, '_blank'));
                gallery.appendChild(item);
            });
        }

        document.getElementById('equipmentDetailsModal').classList.remove('hidden');
    } catch (error) {
        Logger.error('Error loading equipment details', error);
        alert('Erro ao carregar detalhes do equipamento: ' + error.message);
    }
}

function closeModal() {
    document.getElementById('equipmentModal').classList.add('hidden');
    document.getElementById('equipmentDetailsModal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('equipmentsTable')) {
        initEquipamentosPage();
    }
});