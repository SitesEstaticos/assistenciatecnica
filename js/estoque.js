// ============================================
// ESTOQUE MODULE - TOTAL SUPABASE
// ============================================

let currentPartId = null;
let allPecas = [];

async function initEstoquePage() {
    try {
        Logger.log('Initializing estoque page');

        // Load parts from Supabase
        await loadPecas();

        // Setup event listeners
        setupEventListeners();

        // Update stock statistics
        updateStockStatistics();
    } catch (error) {
        Logger.error('Error initializing estoque page', error);
    }
}

async function loadPecas() {
    try {
        allPecas = await db.getPecas();
        renderPartsTable(allPecas);
        Logger.log('Peças loaded:', allPecas.length);
        updateStockStatistics();
    } catch (error) {
        Logger.error('Error loading peças', error);
    }
}

function renderPartsTable(pecas) {
    const tableBody = document.getElementById('partsTable');
    tableBody.innerHTML = '';

    if (!pecas || pecas.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma peça registrada</td></tr>';
        return;
    }

    pecas.forEach(peca => {
        const totalValue = peca.quantity * peca.cost_price;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${peca.name}</td>
            <td>${peca.code || 'N/A'}</td>
            <td>${peca.quantity}</td>
            <td>${formatCurrency(peca.cost_price)}</td>
            <td>${formatCurrency(peca.sale_price)}</td>
            <td>${formatCurrency(totalValue)}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewPartDetails('${peca.id}')">Ver</button>
                <button class="btn btn-small btn-danger" onclick="deletePeca('${peca.id}')">Deletar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function setupEventListeners() {
    const newPartBtn = document.getElementById('newPartBtn');
    if (newPartBtn) newPartBtn.addEventListener('click', openNewPartModal);

    const searchInput = document.getElementById('searchParts');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const term = e.target.value.toLowerCase();
            const filtered = allPecas.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.code && p.code.toLowerCase().includes(term))
            );
            renderPartsTable(filtered);
        });
    }

    ['closePartModal', 'cancelPartBtn', 'closeDetailsModal', 'closeDetailsBtn'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener('click', closeModal);
    });

    const partForm = document.getElementById('partForm');
    if (partForm) partForm.addEventListener('submit', savePeca);

    const editPartBtn = document.getElementById('editPartBtn');
    if (editPartBtn) {
        editPartBtn.addEventListener('click', () => {
            document.getElementById('partDetailsModal').classList.add('hidden');
            openEditPartModal(currentPartId);
        });
    }

    const deletePartBtn = document.getElementById('deletePartBtn');
    if (deletePartBtn) {
        deletePartBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja deletar esta peça?')) {
                deletePeca(currentPartId);
                closeModal();
            }
        });
    }
}

function updateStockStatistics() {
    const totalParts = allPecas.length;
    const lowStockParts = allPecas.filter(p => p.quantity <= (p.min_quantity || 5)).length;
    const totalValue = allPecas.reduce((sum, p) => sum + p.quantity * p.cost_price, 0);

    document.getElementById('totalParts').textContent = totalParts;
    document.getElementById('lowStock').textContent = lowStockParts;
    document.getElementById('totalValue').textContent = formatCurrency(totalValue);
}

function openNewPartModal() {
    currentPartId = null;
    document.getElementById('partId').value = '';
    document.getElementById('partForm').reset();
    document.getElementById('modalTitle').textContent = 'Nova Peça';
    document.getElementById('partModal').classList.remove('hidden');
}

function openEditPartModal(pecaId) {
    currentPartId = pecaId;
    const peca = allPecas.find(p => p.id === pecaId);
    if (!peca) return alert('Peça não encontrada.');

    document.getElementById('partId').value = peca.id;
    document.getElementById('partName').value = peca.name;
    document.getElementById('partCode').value = peca.code || '';
    document.getElementById('partQuantity').value = peca.quantity;
    document.getElementById('partMinQuantity').value = peca.min_quantity || '';
    document.getElementById('partCostPrice').value = peca.cost_price;
    document.getElementById('partSalePrice').value = peca.sale_price;
    document.getElementById('partDescription').value = peca.description || '';
    document.getElementById('modalTitle').textContent = 'Editar Peça';
    document.getElementById('partModal').classList.remove('hidden');
}

async function savePeca(e) {
    e.preventDefault();
    const pecaId = document.getElementById('partId').value;
    const pecaData = {
        name: document.getElementById('partName').value,
        code: document.getElementById('partCode').value,
        quantity: parseInt(document.getElementById('partQuantity').value),
        min_quantity: parseInt(document.getElementById('partMinQuantity').value) || 5,
        cost_price: parseFloat(document.getElementById('partCostPrice').value),
        sale_price: parseFloat(document.getElementById('partSalePrice').value),
        description: document.getElementById('partDescription').value,
    };

    try {
        if (pecaId) {
            await db.updatePeca(pecaId, pecaData);
            alert('Peça atualizada com sucesso!');
        } else {
            await db.createPeca(pecaData);
            alert('Peça criada com sucesso!');
        }
        closeModal();
        await loadPecas();
    } catch (error) {
        Logger.error('Error saving peça', error);
        alert('Erro ao salvar peça: ' + error.message);
    }
}

async function deletePeca(pecaId) {
    if (!confirm('Tem certeza que deseja deletar esta peça?')) return;
    try {
        await db.deletePeca(pecaId);
        alert('Peça deletada com sucesso!');
        await loadPecas();
    } catch (error) {
        Logger.error('Error deleting peça', error);
        alert('Erro ao deletar peça: ' + error.message);
    }
}

async function viewPartDetails(pecaId) {
    try {
        const peca = await db.getPecaById(pecaId);
        if (!peca) return alert('Peça não encontrada.');

        currentPartId = pecaId;
        const totalValue = peca.quantity * peca.cost_price;
        const margin = ((peca.sale_price - peca.cost_price) / peca.cost_price) * 100;

        document.getElementById('detailsTitle').textContent = `Detalhes da Peça - ${peca.name}`;
        document.getElementById('detailName').textContent = peca.name;
        document.getElementById('detailCode').textContent = peca.code || 'N/A';
        document.getElementById('detailQuantity').textContent = peca.quantity;
        document.getElementById('detailMinQuantity').textContent = peca.min_quantity || 'N/A';
        document.getElementById('detailCostPrice').textContent = formatCurrency(peca.cost_price);
        document.getElementById('detailSalePrice').textContent = formatCurrency(peca.sale_price);
        document.getElementById('detailMargin').textContent = margin.toFixed(2) + '%';
        document.getElementById('detailTotalValue').textContent = formatCurrency(totalValue);
        document.getElementById('detailDescription').textContent = peca.description || 'N/A';

        document.getElementById('partDetailsModal').classList.remove('hidden');
    } catch (error) {
        Logger.error('Error loading part details', error);
        alert('Erro ao carregar detalhes da peça: ' + error.message);
    }
}

function closeModal() {
    document.getElementById('partModal').classList.add('hidden');
    document.getElementById('partDetailsModal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('partsTable')) {
        initEstoquePage();
    }
});