// ============================================
// ORDENS DE SERVIÇO MODULE
// ============================================

let currentOrderId = null;
let allOrdensServico = [];
let allClientes = [];
let allEquipamentos = [];
let currentOrder = null;
let currentCliente = null;
let currentEquipamento = null;
let allPecas = [];
let orderPartsBuffer = [];
let orderImagesBuffer = [];
let orderPartIdsToDelete = [];
let orderImageIdsToDelete = [];
let cloudinaryDeleteTokenSupported = true;

async function initOrdensServicoPage() {

    try {

        Logger.log('Initializing ordens de serviço page');

        await loadClientes();
        await loadEquipamentos();
        await loadPecas();
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

    currentOrderId = ordemId;

    try {

        const ordem = await db.getOrdemServicoById(ordemId);

        currentOrder = ordem; //--> carrega o ID da ordem para uso global

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
            <td>${p.pecas?.nome || p.nome || 'Peça'}</td>
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

    const ordem = await db.getOrdemServicoById(ordemId);

    if (!ordem) {

        gallery.innerHTML =
            '<p class="text-center">Ordem de serviço não encontrada</p>';

        return;

    }

    const [imagensDaOs, imagensDoEquipamento] = await Promise.all([
        db.getImagensByOrdem(ordemId),
        db.getImagensByEquipamento(ordem.equipamento_id)
    ]);

    const imagensMap = new Map();

    [...imagensDaOs, ...imagensDoEquipamento]
        .forEach(img => {

            if (img?.id)
                imagensMap.set(String(img.id), img);

        });

    const imagens = Array.from(imagensMap.values());

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


async function loadPecas() {

    try {

        allPecas = await db.getPecas();

        const partSelect = document.getElementById('orderPartSelect');

        if (!partSelect)
            return;

        partSelect.innerHTML =
            '<option value="">Selecione uma peça</option>';

        allPecas.forEach(peca => {

            const option = document.createElement('option');

            option.value = peca.id;
            option.textContent = peca.nome;
            option.dataset.valor = peca.valor_venda || 0;

            partSelect.appendChild(option);

        });

    } catch (error) {

        Logger.error('Error loading peças', error);

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
    const editOrderBtn = document.getElementById('editOrderBtn');
    const addPartBtn = document.getElementById('addPartBtn');
    const partSelect = document.getElementById('orderPartSelect');
    const uploadOrderImagesBtn = document.getElementById('uploadOrderImagesBtn');
    const orderImagesInput = document.getElementById('orderImagesInput');

    if (orderForm)
        orderForm.addEventListener('submit', saveOrdenServico);


    if (addPartBtn) {
        addPartBtn.removeEventListener('click', addPartToOrderBuffer);
        addPartBtn.addEventListener('click', addPartToOrderBuffer);
    }

    if (partSelect) {
        partSelect.removeEventListener('change', updateSelectedPartValue);
        partSelect.addEventListener('change', updateSelectedPartValue);
    }

    if (uploadOrderImagesBtn && orderImagesInput) {
        uploadOrderImagesBtn.removeEventListener('click', triggerOrderImageSelector);
        uploadOrderImagesBtn.addEventListener('click', triggerOrderImageSelector);

        orderImagesInput.removeEventListener('change', handleOrderImageUpload);
        orderImagesInput.addEventListener('change', handleOrderImageUpload);
    }

    if (editOrderBtn)
        editOrderBtn.addEventListener('click', () => {

            document.getElementById('orderDetailsModal')
                .classList.add('hidden');

            openEditOrderModal(currentOrderId);

        });

}

async function openEditOrderModal(ordemId) {

    if (!ordemId) {
        alert('Ordem de serviço não encontrada.');
        return;
    }

    currentOrderId = ordemId;

    try {

        const ordem = await db.getOrdemServicoById(ordemId);

        if (!ordem) {
            alert('Ordem de serviço não encontrada.');
            return;
        }

        document.getElementById('orderId').value = ordem.id;
        document.getElementById('orderClient').value = ordem.cliente_id;

        updateEquipmentList();

        document.getElementById('orderEquipment').value = ordem.equipamento_id;
        document.getElementById('orderStatus').value = ordem.status;
        document.getElementById('orderDate').value = ordem.data_recebimento || '';
        document.getElementById('orderProblem').value = ordem.problema_relatado || '';
        document.getElementById('orderDiagnosis').value = ordem.diagnostico_tecnico || '';
        document.getElementById('orderServices').value = ordem.servicos_realizados || '';
        document.getElementById('orderValue').value = ordem.valor_servico || '';
        document.getElementById('orderTechnician').value = ordem.tecnico_responsavel || '';

        await loadOrderAssetsForEditing(ordem.id);

        document.getElementById('modalTitle').textContent =
            'Editar Ordem de Serviço';

        document.getElementById('orderModal')
            .classList.remove('hidden');

    } catch (error) {

        Logger.error('Error loading ordem for editing', error);

        alert('Erro ao carregar ordem para edição: ' + error.message);

    }

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

    resetOrderAssetsEditor();

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

        let savedOrder;

        if (orderId)
            savedOrder = await db.updateOrdemServico(orderId, ordemData);

        else
            savedOrder = await db.createOrdemServico(ordemData);

        const ordemIdFinal = savedOrder?.id || orderId;

        await syncOrderParts(ordemIdFinal);
        await syncOrderImages(ordemIdFinal, ordemData.equipamento_id);

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

function resetOrderAssetsEditor() {

    orderPartsBuffer = [];
    orderImagesBuffer = [];
    orderPartIdsToDelete = [];
    orderImageIdsToDelete = [];

    renderOrderPartsEditor();
    renderOrderImagesEditor();

}

async function loadOrderAssetsForEditing(ordemId) {

    resetOrderAssetsEditor();

    const ordem = await db.getOrdemServicoById(ordemId);

    const [pecas, imagensDaOs, imagensDoEquipamento] = await Promise.all([
        db.getPecasByOrdem(ordemId),
        db.getImagensByOrdem(ordemId),
        ordem?.equipamento_id
            ? db.getImagensByEquipamento(ordem.equipamento_id)
            : Promise.resolve([])
    ]);

    orderPartsBuffer = (pecas || []).map(p => ({
        id: p.id,
        peca_id: p.peca_id,
        nome: p.pecas?.nome || p.nome || 'Peça',
        quantidade: p.quantidade,
        valor_unitario: p.valor_unitario,
        existing: true
    }));

    const imagensMap = new Map();

    [...(imagensDaOs || []), ...(imagensDoEquipamento || [])]
        .forEach(img => {

            if (!img?.id || !img?.url_imagem)
                return;

            imagensMap.set(String(img.id), {
                id: img.id,
                url: img.url_imagem,
                existing: true
            });

        });

    orderImagesBuffer = Array.from(imagensMap.values());

    renderOrderPartsEditor();
    renderOrderImagesEditor();

}

function updateSelectedPartValue() {

    const select = document.getElementById('orderPartSelect');
    const valueInput = document.getElementById('orderPartValue');

    const selected = select.options[select.selectedIndex];

    if (selected?.dataset?.valor)
        valueInput.value = selected.dataset.valor;

}

function addPartToOrderBuffer() {

    const partSelect = document.getElementById('orderPartSelect');
    const qtyInput = document.getElementById('orderPartQty');
    const valueInput = document.getElementById('orderPartValue');

    const pecaId = partSelect.value;
    const quantidade = parseInt(qtyInput.value, 10) || 1;
    const valorUnitario = parseFloat(valueInput.value) || 0;

    if (!pecaId)
        return alert('Selecione uma peça.');

    const nome = partSelect.options[partSelect.selectedIndex]?.textContent || 'Peça';

    orderPartsBuffer.push({
        peca_id: pecaId,
        nome,
        quantidade,
        valor_unitario: valorUnitario,
        existing: false,
        tempId: `${Date.now()}-${Math.random()}`
    });

    renderOrderPartsEditor();

}

function removePartFromOrderBuffer(partKey) {

    const part = orderPartsBuffer.find(p => String(p.id || p.tempId) === String(partKey));

    if (!part)
        return;

    if (part.existing && part.id)
        orderPartIdsToDelete.push(part.id);

    orderPartsBuffer = orderPartsBuffer.filter(
        p => String(p.id || p.tempId) !== String(partKey)
    );

    renderOrderPartsEditor();

}

function renderOrderPartsEditor() {

    const tbody = document.getElementById('orderPartsEditTable');

    if (!tbody)
        return;

    tbody.innerHTML = '';

    if (orderPartsBuffer.length === 0) {

        tbody.innerHTML =
            '<tr><td colspan="5" class="text-center">Nenhuma peça adicionada</td></tr>';

        return;

    }

    orderPartsBuffer.forEach(part => {

        const row = document.createElement('tr');

        const key = part.id || part.tempId;
        const total = (parseFloat(part.valor_unitario) || 0) * (parseInt(part.quantidade, 10) || 0);

        row.innerHTML = `
            <td>${part.nome}</td>
            <td>${part.quantidade}</td>
            <td>${formatCurrency(part.valor_unitario)}</td>
            <td>${formatCurrency(total)}</td>
            <td><button type="button" class="btn btn-small btn-danger" onclick="removePartFromOrderBuffer('${key}')">Remover</button></td>
        `;

        tbody.appendChild(row);

    });

}

function triggerOrderImageSelector() {

    const input = document.getElementById('orderImagesInput');

    if (input)
        input.click();

}


async function uploadOrderImageToCloudinary(file, includeDeleteToken = true) {

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', window.CLOUDINARY_CONFIG.UPLOAD_PRESET);

    if (includeDeleteToken)
        formData.append('return_delete_token', 'true');

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
    );

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok || !data.secure_url)
        throw new Error(data.error?.message || 'Falha no upload da imagem da ordem');

    return data;

}

async function handleOrderImageUpload(event) {

    const files = Array.from(event.target.files || []);
    const failedFiles = [];

    for (const file of files) {

        const uniqueName = `${file.name}-${file.size}-${file.lastModified}`;

        if (orderImagesBuffer.some(img => img.tempId === uniqueName))
            continue;

        try {

            let data;

            try {
                data = await uploadOrderImageToCloudinary(file, cloudinaryDeleteTokenSupported);
            } catch (error) {

                if (cloudinaryDeleteTokenSupported) {
                    Logger.log('Upload com delete_token falhou na OS, tentando fallback simples...', error?.message);
                    cloudinaryDeleteTokenSupported = false;
                    data = await uploadOrderImageToCloudinary(file, false);
                } else {
                    throw error;
                }

            }

            orderImagesBuffer.push({
                tempId: uniqueName,
                url: data.secure_url,
                deleteToken: data.delete_token || null,
                publicId: data.public_id || null,
                existing: false
            });

        } catch (error) {

            Logger.error('Falha no upload da imagem da OS', { file: file.name, error });
            failedFiles.push(file.name);

        }

    }

    renderOrderImagesEditor();

    if (failedFiles.length > 0)
        alert('Não foi possível enviar as seguintes imagens: ' + failedFiles.join(', '));

    event.target.value = '';

}

async function removeImageFromOrderBuffer(imageKey) {

    const img = orderImagesBuffer.find(i => String(i.id || i.tempId) === String(imageKey));

    if (!img)
        return;

    if (img.existing && img.id)
        orderImageIdsToDelete.push(img.id);

    if (!img.existing && window.cloudinary) {

        try {

            if (img.deleteToken)
                await window.cloudinary.deleteImageByToken(img.deleteToken);
            else if (img.publicId)
                await window.cloudinary.deleteImage(img.publicId);

        } catch (error) {

            Logger.error('Erro removendo imagem temporária da OS no Cloudinary', error);

        }

    }

    orderImagesBuffer = orderImagesBuffer.filter(
        i => String(i.id || i.tempId) !== String(imageKey)
    );

    renderOrderImagesEditor();

}

function renderOrderImagesEditor() {

    const preview = document.getElementById('orderImagesPreview');

    if (!preview)
        return;

    preview.innerHTML = '';

    if (orderImagesBuffer.length === 0)
        return;

    orderImagesBuffer.forEach(img => {

        if (!img.url)
            return;

        const key = img.id || img.tempId;

        const div = document.createElement('div');
        div.className = 'image-preview-item';

        div.innerHTML = `
            <img src="${img.url}" alt="Imagem OS">
            <button type="button" onclick="removeImageFromOrderBuffer('${key}')">X</button>
        `;

        preview.appendChild(div);

    });

}

async function syncOrderParts(ordemId) {

    for (const pecaId of orderPartIdsToDelete)
        await db.removePecaFromOrdem(pecaId);

    for (const part of orderPartsBuffer) {

        if (part.existing)
            continue;

        await db.addPecaToOrdem({
            ordem_id: ordemId,
            peca_id: part.peca_id,
            quantidade: part.quantidade,
            valor_unitario: part.valor_unitario
        });

    }

}

async function syncOrderImages(ordemId, equipamentoId) {

    for (const imageId of orderImageIdsToDelete)
        await db.deleteImagem(imageId);

    for (const img of orderImagesBuffer) {

        if (img.existing || !img.url)
            continue;

        await db.createImagem({
            ordem_id: ordemId,
            equipamento_id: equipamentoId || null,
            url_imagem: img.url,
            tipo_imagem: 'ordem_servico',
            descricao_tecnica: 'Imagem da ordem de serviço',
            tecnico_responsavel: auth.getUserEmail()
        });

    }

}

window.removePartFromOrderBuffer = removePartFromOrderBuffer;
window.removeImageFromOrderBuffer = removeImageFromOrderBuffer;


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
async function generateOrderPdf() {

    try {

        if (!currentOrder) {
            alert("Nenhuma ordem carregada");
            return;
        }

        const ordem = currentOrder;

        const cliente = await db.getClienteById(ordem.cliente_id);
        const equipamento = await db.getEquipamentoById(ordem.equipamento_id);
        const [imagensDaOs, imagensDoEquipamento] = await Promise.all([
            db.getImagensByOrdem(ordem.id),
            db.getImagensByEquipamento(ordem.equipamento_id)
        ]);

        const imagensMap = new Map();

        [...imagensDaOs, ...imagensDoEquipamento]
            .forEach(img => {

                if (img?.id)
                    imagensMap.set(String(img.id), img);

            });

        const imagens = Array.from(imagensMap.values());
        const pecas = await db.getPecasByOrdem(ordem.id);

        await pdfGenerator.generateOrderPDF(
            ordem,
            cliente,
            equipamento,
            imagens,
            pecas
        );

    } catch (error) {

        Logger.error("Erro ao gerar PDF", error);

    }

}
