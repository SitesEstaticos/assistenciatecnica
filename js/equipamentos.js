// ============================================
// EQUIPAMENTOS MODULE
// ============================================

let currentEquipmentId = null;
let allEquipamentos = [];
let allClientes = [];
let uploadedImages = [];

async function initEquipamentosPage() {

    try {

        Logger.log('Initializing equipamentos page');

        await loadClientes();
        await loadEquipamentos();

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

            allClientes.forEach(cliente => {

                const option = document.createElement('option');

                option.value = cliente.id;
                option.textContent = cliente.nome;

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

        tableBody.innerHTML =
            '<tr><td colspan="6" class="text-center">Nenhum equipamento registrado</td></tr>';

        return;

    }

    equipamentos.forEach(equipamento => {

        const cliente = allClientes.find(c => c.id === equipamento.cliente_id);

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${cliente?.nome || 'N/A'}</td>
            <td>${equipamento.marca}</td>
            <td>${equipamento.modelo}</td>
            <td>${equipamento.numero_serie || 'N/A'}</td>
            <td>${equipamento.condicao_fisica || 'N/A'}</td>
            <td>
                <button class="btn btn-small btn-primary"
                    onclick="viewEquipmentDetails('${equipamento.id}')">
                    Ver
                </button>

                <button class="btn btn-small btn-danger"
                    onclick="deleteEquipamento('${equipamento.id}')">
                    Deletar
                </button>
            </td>
        `;

        tableBody.appendChild(row);

    });

}

function setupEventListeners() {

    const newEquipmentBtn = document.getElementById('newEquipmentBtn');

    if (newEquipmentBtn)
        newEquipmentBtn.addEventListener('click', openNewEquipmentModal);

    const searchInput = document.getElementById('searchEquipments');

    if (searchInput) {

        searchInput.addEventListener('input', e => {

            const term = e.target.value.toLowerCase();

            const filtered = allEquipamentos.filter(eq =>

                eq.marca.toLowerCase().includes(term) ||
                eq.modelo.toLowerCase().includes(term) ||
                (eq.numero_serie && eq.numero_serie.toLowerCase().includes(term))

            );

            renderEquipamentosTable(filtered);

        });

    }

    ['closeEquipmentModal', 'cancelEquipmentBtn', 'closeDetailsModal', 'closeDetailsBtn']
        .forEach(id => {

            const elem = document.getElementById(id);

            if (elem)
                elem.addEventListener('click', closeModal);

        });

    const equipmentForm = document.getElementById('equipmentForm');

    if (equipmentForm)
        equipmentForm.addEventListener('submit', saveEquipamento);

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

    if (!equipamento)
        return alert('Equipamento não encontrado.');

    document.getElementById('equipmentId').value = equipamento.id;

    document.getElementById('equipmentClient').value = equipamento.cliente_id;

    document.getElementById('equipmentBrand').value = equipamento.marca;

    document.getElementById('equipmentModel').value = equipamento.modelo;

    document.getElementById('equipmentSerial').value = equipamento.numero_serie || '';

    document.getElementById('equipmentAccessories').value = equipamento.acessorios_entregues || '';

    document.getElementById('equipmentCondition').value = equipamento.estado_fisico || '';

    document.getElementById('equipmentPassword').value = equipamento.senha_equipamento || '';

    document.getElementById('equipmentNotes').value = equipamento.observacoes || '';

    document.getElementById('modalTitle').textContent = 'Editar Equipamento';

    document.getElementById('equipmentModal').classList.remove('hidden');

}

async function saveEquipamento(e) {

    e.preventDefault();

    const equipmentId = document.getElementById('equipmentId').value;

    const equipamentoData = {

        cliente_id: document.getElementById('equipmentClient').value,
        marca: document.getElementById('equipmentBrand').value,
        modelo: document.getElementById('equipmentModel').value,
        numero_serie: document.getElementById('equipmentSerial').value,
        acessorios_entregues: document.getElementById('equipmentAccessories').value,
        estado_fisico: document.getElementById('equipmentCondition').value,
        senha_equipamento: document.getElementById('equipmentPassword').value,
        observacoes: document.getElementById('equipmentNotes').value

    };

    try {

        if (equipmentId) {

            await db.updateEquipamento(equipmentId, equipamentoData);

            alert('Equipamento atualizado com sucesso!');

        } else {

            const novoEquipamento = await db.createEquipamento(equipamentoData);

            for (const img of uploadedImages) {

                await db.createImagem({

                    equipamento_id: novoEquipamento.id,
                    url_imagem: img.url,
                    tipo_imagem: 'recebimento',
                    descricao_tecnica: 'Imagem do equipamento',
                    tecnico_responsavel: auth.getUserEmail()

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

    if (!confirm('Tem certeza que deseja deletar este equipamento?'))
        return;

    try {

        // verifica se existem ordens de serviço para este equipamento
        const ordens = await db.getOrdensServicoByEquipamento(equipamentoId);

        if (ordens && ordens.length > 0) {
            alert('Não é possível excluir este equipamento pois existem ordens de serviço vinculadas.');
            return;
        }

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

        const cliente = await db.getClienteById(equipamento.cliente_id);

        const imagens = await db.getImagensByEquipamento(equipamentoId);

        document.getElementById('detailsTitle').textContent =
            `Detalhes do Equipamento - ${equipamento.marca} ${equipamento.modelo}`;

        document.getElementById('detailClient').textContent =
            cliente?.nome || 'N/A';

        document.getElementById('detailBrand').textContent =
            equipamento.marca;

        document.getElementById('detailModel').textContent =
            equipamento.modelo;

        document.getElementById('detailSerial').textContent =
            equipamento.numero_serie || 'N/A';

        document.getElementById('detailAccessories').textContent =
            equipamento.acessorios || 'N/A';

        document.getElementById('detailCondition').textContent =
            equipamento.condicao_fisica || 'N/A';

        document.getElementById('detailNotes').textContent =
            equipamento.observacoes || 'N/A';

        const gallery = document.getElementById('equipmentGallery');

        gallery.innerHTML = '';

        if (!imagens || imagens.length === 0) {

            gallery.innerHTML =
                '<p class="text-center">Nenhuma imagem registrada</p>';

        } else {

            imagens.forEach(img => {

                const item = document.createElement('div');

                item.className = 'image-gallery-item';

                item.innerHTML =
                    `<img src="${img.url}" alt="${img.descricao}">`;

                item.addEventListener('click', () =>
                    window.open(img.url, '_blank')
                );

                gallery.appendChild(item);

            });

        }

        document.getElementById('equipmentDetailsModal')
            .classList.remove('hidden');

    } catch (error) {

        Logger.error('Error loading equipment details', error);

        alert('Erro ao carregar detalhes do equipamento: ' + error.message);

    }

}

function closeModal() {

    document.getElementById('equipmentModal')
        .classList.add('hidden');

    document.getElementById('equipmentDetailsModal')
        .classList.add('hidden');

}

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('equipmentsTable')) {

        initEquipamentosPage();

    }

});