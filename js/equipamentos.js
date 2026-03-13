// ============================================
// EQUIPAMENTOS MODULE
// ============================================

let currentEquipmentId = null;
let allEquipamentos = [];
let allClientes = [];
let uploadedImages = [];
let imagensExistentes = [];

function getCloudinaryTokenMap() {

    try {

        return JSON.parse(localStorage.getItem('cloudinaryDeleteTokens') || '{}');

    } catch {

        return {};

    }

}

function saveCloudinaryToken(url, token) {

    if (!url || !token)
        return;

    const map = getCloudinaryTokenMap();

    map[url] = token;

    localStorage.setItem('cloudinaryDeleteTokens', JSON.stringify(map));

}

function removeCloudinaryToken(url) {

    if (!url)
        return;

    const map = getCloudinaryTokenMap();

    delete map[url];

    localStorage.setItem('cloudinaryDeleteTokens', JSON.stringify(map));

}

function getCloudinaryToken(url) {

    if (!url)
        return null;

    const map = getCloudinaryTokenMap();

    return map[url] || null;

}

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
            <td>${equipamento.estado_fisico || 'N/A'}</td>
            <td class="actions">

                <button class="btn btn-small btn-secondary"
                    onclick="viewEquipmentDetails('${equipamento.id}')">
                    Ver
                </button>

                <button class="btn btn-small btn-primary"
                    onclick="openEditEquipmentModal('${equipamento.id}')">
                    Editar
                </button>

                <button class="btn btn-small btn-danger"
                    onclick="deleteEquipamento('${equipamento.id}')">
                    Excluir
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

    const equipmentForm = document.getElementById('equipmentForm');

    if (equipmentForm)
        equipmentForm.addEventListener('submit', saveEquipamento);

    const uploadBtn = document.getElementById('uploadImagesBtn');
    const imageInput = document.getElementById('equipmentImages');

    if (uploadBtn && imageInput) {
        uploadBtn.removeEventListener('click', triggerImageSelector);
        uploadBtn.addEventListener('click', triggerImageSelector);
    }

    if (imageInput) {
        imageInput.removeEventListener('change', handleImageUpload);
        imageInput.addEventListener('change', handleImageUpload);
    }
    const closeBtn = document.getElementById('closeEquipmentModal');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const cancelBtn = document.getElementById('cancelEquipmentBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeModal);

    const editBtn = document.getElementById('editEquipmentBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            closeModal();
            openEditEquipmentModal(currentEquipmentId);
        });
    }

}

function triggerImageSelector() {

    const input = document.getElementById('equipmentImages');

    if (input)
        input.click();

}

function openNewEquipmentModal() {

    currentEquipmentId = null;

    uploadedImages = [];
    imagensExistentes = [];

    document.getElementById('equipmentForm').reset();
    document.getElementById('imagePreview').innerHTML = '';

    document.getElementById('modalTitle').textContent = 'Novo Equipamento';

    document.getElementById('equipmentModal').classList.remove('hidden');

}

async function openEditEquipmentModal(equipamentoId) {

    currentEquipmentId = equipamentoId;

    const equipamento = await db.getEquipamentoById(equipamentoId);

    imagensExistentes = await db.getImagensByEquipamento(equipamentoId);

    document.getElementById('equipmentClient').value = equipamento.cliente_id;
    document.getElementById('equipmentBrand').value = equipamento.marca;
    document.getElementById('equipmentModel').value = equipamento.modelo;
    document.getElementById('equipmentSerial').value = equipamento.numero_serie || '';
    document.getElementById('equipmentAccessories').value = equipamento.acessorios_entregues || '';
    document.getElementById('equipmentCondition').value = equipamento.estado_fisico || '';
    document.getElementById('equipmentPassword').value = equipamento.senha_equipamento || '';
    document.getElementById('equipmentNotes').value = equipamento.observacoes || '';

    renderExistingImages();

    document.getElementById('modalTitle').textContent = 'Editar Equipamento';

    document.getElementById('equipmentModal').classList.remove('hidden');

}

function renderExistingImages() {

    const preview = document.getElementById('imagePreview');

    preview.innerHTML = '';

    imagensExistentes.forEach(img => {

        const div = document.createElement('div');
        div.className = 'image-preview-item';

        div.innerHTML = `
            <img src="${img.url_imagem}">
            <button type="button" onclick="removeExistingImage('${img.id}')">X</button>
        `;

        preview.appendChild(div);

    });

}

async function removeExistingImage(imageId) {

    if (!confirm('Remover esta imagem?'))
        return;

    const image = imagensExistentes.find(i => i.id === imageId);

    try {

        let deletedInCloudinary = false;

        if (window.cloudinary && image?.url_imagem) {

            const deleteToken = getCloudinaryToken(image.url_imagem);

            if (deleteToken)
                deletedInCloudinary = await window.cloudinary.deleteImageByToken(deleteToken);

            if (!deletedInCloudinary)
                deletedInCloudinary = await window.cloudinary.deleteImageByUrl(image.url_imagem);

        }

        if (!deletedInCloudinary)
            Logger.log('Imagem removida apenas do banco (Cloudinary sem credenciais/token válido).');

        await db.deleteImagem(imageId);

        if (image?.url_imagem)
            removeCloudinaryToken(image.url_imagem);

        imagensExistentes = imagensExistentes.filter(i => i.id !== imageId);

        renderExistingImages();

    } catch (error) {

        Logger.error('Erro ao remover imagem', error);
        alert('Erro ao remover imagem: ' + error.message);

    }

}


function appendUploadedImagePreview(imageUrl, uniqueName) {

    const preview = document.getElementById('imagePreview');

    const div = document.createElement('div');
    div.className = 'image-preview-item';
    div.dataset.fileName = uniqueName;

    div.innerHTML = `
        <img src="${imageUrl}">
        <button type="button" onclick="removeNewImage('${uniqueName}')">X</button>
    `;

    preview.appendChild(div);

}

async function uploadImageToCloudinary(file, includeDeleteToken = true) {

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', window.CLOUDINARY_CONFIG.UPLOAD_PRESET);

    if (includeDeleteToken)
        formData.append('return_delete_token', 'true');

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok || !data.secure_url)
        throw new Error(data.error?.message || 'Falha no upload da imagem');

    return data;

}

async function handleImageUpload(event) {

    const files = Array.from(event.target.files || []);

    if (files.length === 0)
        return;

    const existingNames = new Set(uploadedImages.map(img => img.name));
    const failedFiles = [];

    for (const file of files) {

        const uniqueName = `${file.name}-${file.size}-${file.lastModified}`;

        if (existingNames.has(uniqueName))
            continue;

        try {

            let data;

            try {
                data = await uploadImageToCloudinary(file, true);
            } catch (error) {
                Logger.log('Upload com delete_token falhou, tentando fallback simples...', error?.message);
                data = await uploadImageToCloudinary(file, false);
            }

            uploadedImages.push({
                name: uniqueName,
                originalName: file.name,
                url: data.secure_url,
                deleteToken: data.delete_token || null,
                publicId: data.public_id || null
            });

            if (data.secure_url && data.delete_token)
                saveCloudinaryToken(data.secure_url, data.delete_token);

            appendUploadedImagePreview(data.secure_url, uniqueName);

            existingNames.add(uniqueName);

        } catch (error) {

            Logger.error('Falha no upload da imagem', { file: file.name, error });
            failedFiles.push(file.name);

        }

    }

    if (failedFiles.length > 0) {

        alert(
            'Não foi possível enviar as seguintes imagens: ' +
            failedFiles.join(', ')
        );

    }

    event.target.value = '';
}

async function removeNewImage(fileName) {

    const image = uploadedImages.find(img => img.name === fileName);

    try {

        if (window.cloudinary && image) {

            let deletedInCloudinary = false;

            if (image.deleteToken)
                deletedInCloudinary = await window.cloudinary.deleteImageByToken(image.deleteToken);

            if (!deletedInCloudinary && image.publicId)
                deletedInCloudinary = await window.cloudinary.deleteImage(image.publicId);

            if (!deletedInCloudinary && image.url)
                await window.cloudinary.deleteImageByUrl(image.url);

            if (image.url)
                removeCloudinaryToken(image.url);

        }

    } catch (error) {

        Logger.error('Erro ao remover imagem no Cloudinary', error);

    }

    uploadedImages = uploadedImages.filter(img => img.name !== fileName);

    const preview = document.getElementById('imagePreview');

    const item = preview.querySelector(`[data-file-name="${fileName}"]`);

    if (item)
        item.remove();

}

async function deleteEquipamento(id) {

    if (!confirm('Tem certeza que deseja excluir este equipamento?'))
        return;

    try {

        await db.deleteEquipamento(id);

        alert('Equipamento excluído com sucesso');

        await loadEquipamentos();

    } catch (error) {

        Logger.error('Erro ao excluir equipamento', error);

        alert('Erro ao excluir equipamento');

    }

}

async function saveEquipamento(e) {

    e.preventDefault();

    const equipmentId = currentEquipmentId;

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

        let equipamentoIdFinal;

        if (equipmentId) {

            await db.updateEquipamento(equipmentId, equipamentoData);

            equipamentoIdFinal = equipmentId;

        } else {

            const novoEquipamento = await db.createEquipamento(equipamentoData);

            equipamentoIdFinal = novoEquipamento.id;

        }

        const validUploadedImages = uploadedImages.filter(img => !!img.url);

        for (const img of validUploadedImages) {

            await db.createImagem({

                equipamento_id: equipamentoIdFinal,
                url_imagem: img.url,
                tipo_imagem: 'recebimento',
                descricao_tecnica: 'Imagem do equipamento',
                tecnico_responsavel: auth.getUserEmail()

            });

        }

        alert('Equipamento salvo com sucesso!');

        closeModal();

        await loadEquipamentos();

    } catch (error) {

        Logger.error('Error saving equipamento', error);

        alert('Erro ao salvar equipamento: ' + error.message);

    }

}

async function viewEquipmentDetails(equipamentoId) {

    try {

        currentEquipmentId = equipamentoId;

        const equipamento = await db.getEquipamentoById(equipamentoId);

        const cliente = await db.getClienteById(equipamento.cliente_id);

        const imagens = await db.getImagensByEquipamento(equipamentoId);

        document.getElementById('detailsTitle').textContent =
            `Detalhes - ${equipamento.marca} ${equipamento.modelo}`;

        document.getElementById('detailClient').textContent =
            cliente?.nome || 'N/A';

        document.getElementById('detailBrand').textContent =
            equipamento.marca;

        document.getElementById('detailModel').textContent =
            equipamento.modelo;

        document.getElementById('detailSerial').textContent =
            equipamento.numero_serie || 'N/A';

        const gallery = document.getElementById('equipmentGallery');

        gallery.innerHTML = '';

        imagens.forEach(img => {

            const item = document.createElement('div');

            item.className = 'image-gallery-item';

            item.innerHTML =
                `<img src="${img.url_imagem}">`;

            item.addEventListener('click', () =>
                window.open(img.url_imagem, '_blank')
            );

            gallery.appendChild(item);

        });

        document.getElementById('equipmentDetailsModal')
            .classList.remove('hidden');

    } catch (error) {

        Logger.error('Error loading equipment details', error);

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
