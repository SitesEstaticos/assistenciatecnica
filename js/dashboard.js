// ============================================
// DASHBOARD MODULE - TOTAL SUPABASE
// ============================================

let statusChart = null;
let revenueChart = null;

async function initDashboard() {
    try {
        Logger.log('Initializing dashboard');

        await loadStatistics();
        await loadRecentOrders();
        await initCharts();

    } catch (error) {
        Logger.error('Error initializing dashboard', error);
    }
}

async function loadStatistics() {
    try {

        const ordens = await db.getOrdensServico();

        const osAbertas = ordens.filter(o => o.status === 'recebido').length;

        const osManutencao = ordens.filter(o =>
            o.status === 'em_manutencao' ||
            o.status === 'manutencao' ||
            o.status === 'em_analise' ||
            o.status === 'aguardando_peca'
        ).length;

        const osFinalizadas = ordens.filter(o =>
            o.status === 'finalizado' ||
            o.status === 'entregue'
        ).length;

        const faturamento = ordens
            .filter(o => o.status === 'finalizado' || o.status === 'entregue')
            .reduce((total, o) => total + (o.valor_servico || 0), 0);

        document.getElementById('osAbertas').textContent = osAbertas;
        document.getElementById('osManutencao').textContent = osManutencao;
        document.getElementById('osFinalizadas').textContent = osFinalizadas;
        document.getElementById('faturamento').textContent = formatCurrency(faturamento);

    } catch (error) {
        Logger.error('Error loading statistics', error);
    }
}

async function loadRecentOrders() {
    try {

        const ordens = await db.getOrdensServico();
        const recentes = ordens.slice(-5).reverse();

        const tableBody = document.getElementById('recentOrdersTable');
        tableBody.innerHTML = '';

        if (recentes.length === 0) {
            tableBody.innerHTML =
                '<tr><td colspan="7" class="text-center">Nenhuma ordem de serviço registrada</td></tr>';
            return;
        }

        for (const ordem of recentes) {

            const cliente = await db.getClienteById(ordem.cliente_id);
            const equipamento = await db.getEquipamentoById(ordem.equipamento_id);

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${ordem.numero_os}</td>
                <td>${cliente?.nome || 'N/A'}</td>
                <td>${equipamento?.marca || ''} ${equipamento?.modelo || ''}</td>
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
                </td>
            `;

            tableBody.appendChild(row);
        }

        Logger.log('Recent orders loaded');

    } catch (error) {
        Logger.error('Error loading recent orders', error);
    }
}

async function initCharts() {
    try {

        const statusCounts = await db.getOrderStatusCounts();

        const statusCtx = document.getElementById('statusChart');

        if (statusCtx) {

            if (statusChart) statusChart.destroy();

            statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: [
                        'Recebido',
                        'Em Análise',
                        'Aguardando Peça',
                        'Em Manutenção',
                        'Finalizado',
                        'Entregue'
                    ],
                    datasets: [{
                        data: [
                            statusCounts.recebido || 0,
                            statusCounts.em_analise || 0,
                            statusCounts.aguardando_peca || 0,
                            statusCounts.em_manutencao || 0,
                            statusCounts.finalizado || 0,
                            statusCounts.entregue || 0
                        ],
                        backgroundColor: [
                            '#dbeafe',
                            '#fef3c7',
                            '#fecaca',
                            '#4a8c36',
                            '#dcfce7',
                            '#d1fae5'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        const revenue = await db.getMonthlyRevenue();

        const revenueCtx = document.getElementById('revenueChart');

        if (revenueCtx) {

            if (revenueChart) revenueChart.destroy();

            revenueChart = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: [
                        'Jan','Fev','Mar','Abr','Mai','Jun',
                        'Jul','Ago','Set','Out','Nov','Dez'
                    ],
                    datasets: [{
                        label: 'Faturamento (R$)',
                        data: [
                            revenue.jan || 0,
                            revenue.fev || 0,
                            revenue.mar || 0,
                            revenue.abr || 0,
                            revenue.mai || 0,
                            revenue.jun || 0,
                            revenue.jul || 0,
                            revenue.ago || 0,
                            revenue.set || 0,
                            revenue.out || 0,
                            revenue.nov || 0,
                            revenue.dez || 0
                        ],
                        borderColor: '#1e3a8a',
                        backgroundColor: 'rgba(30,58,138,0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: v => 'R$ ' + v.toLocaleString('pt-BR')
                            }
                        }
                    }
                }
            });
        }

        Logger.log('Charts initialized');

    } catch (error) {
        Logger.error('Error initializing charts', error);
    }
}

function viewOrderDetails(orderId) {
    window.location.href = `ordens-servico.html?id=${orderId}`;
}

document.addEventListener('DOMContentLoaded', async () => {

    try {

        await auth.ready;

        if (!auth.isLoggedIn()) {
            window.location.href = "login.html";
            return;
        }

        loadUserProfile();

        if (document.getElementById('statusChart')) {
            initDashboard();
        }

    } catch (error) {
        Logger.error("Erro ao iniciar dashboard", error);
    }

});
function loadUserProfile() {

    const user = auth.getUser();

    if (!user) return;

    const emailEl = document.getElementById("userEmail");

    if (emailEl) {
        emailEl.textContent = user.email;
    }

}
