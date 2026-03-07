// ============================================
// DASHBOARD MODULE - TOTAL SUPABASE
// ============================================

let statusChart = null;
let revenueChart = null;

async function initDashboard() {
    try {
        Logger.log('Initializing dashboard');

        // Load statistics
        await loadStatistics();

        // Load recent orders
        await loadRecentOrders();

        // Initialize charts with real data
        await initCharts();
    } catch (error) {
        Logger.error('Error initializing dashboard', error);
    }
}

async function loadStatistics() {
    try {
        const stats = await db.getStatistics();

        document.getElementById('osAbertas').textContent = stats.osAbertas || 0;
        document.getElementById('osManutencao').textContent = stats.osManutencao || 0;
        document.getElementById('osFinalizadas').textContent = stats.osFinalizadas || 0;
        document.getElementById('faturamento').textContent = formatCurrency(stats.faturamento || 0);

        Logger.log('Statistics loaded:', stats);
    } catch (error) {
        Logger.error('Error loading statistics', error);
    }
}

async function loadRecentOrders() {
    try {
        const ordensServico = await db.getOrdensServico();
        const recentOrders = ordensServico.slice(-5).reverse();

        const tableBody = document.getElementById('recentOrdersTable');
        tableBody.innerHTML = '';

        if (recentOrders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma ordem de serviço registrada</td></tr>';
            return;
        }

        for (const ordem of recentOrders) {
            const cliente = await db.getClienteById(ordem.client_id);
            const equipamento = await db.getEquipamentoById(ordem.equipment_id);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ordem.os_number}</td>
                <td>${cliente?.name || 'N/A'}</td>
                <td>${equipamento?.brand || 'N/A'} ${equipamento?.model || ''}</td>
                <td><span class="status-badge status-${ordem.status}">${getStatusLabel(ordem.status)}</span></td>
                <td>${formatDate(ordem.date_received)}</td>
                <td>${formatCurrency(ordem.service_value)}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="viewOrderDetails('${ordem.id}')">Ver</button>
                </td>
            `;
            tableBody.appendChild(row);
        }

        Logger.log('Recent orders loaded:', recentOrders.length);
    } catch (error) {
        Logger.error('Error loading recent orders', error);
    }
}

async function initCharts() {
    try {
        // Load data for status chart
        const statusCounts = await db.getOrderStatusCounts();
        // expected output: { recebido: X, emAnalise: Y, aguardandoPeca: Z, manutencao: W, finalizado: V, entregue: U }

        const statusCtx = document.getElementById('statusChart');
        if (statusCtx) {
            statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Recebido', 'Em Análise', 'Aguardando Peça', 'Em Manutenção', 'Finalizado', 'Entregue'],
                    datasets: [
                        {
                            data: [
                                statusCounts.recebido || 0,
                                statusCounts.emAnalise || 0,
                                statusCounts.aguardandoPeca || 0,
                                statusCounts.manutencao || 0,
                                statusCounts.finalizado || 0,
                                statusCounts.entregue || 0,
                            ],
                            backgroundColor: [
                                '#dbeafe',
                                '#fef3c7',
                                '#fecaca',
                                '#fce7f3',
                                '#dcfce7',
                                '#d1fae5',
                            ],
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                    },
                },
            });
        }

        // Load revenue per month
        const monthlyRevenue = await db.getMonthlyRevenue();
        // expected output: { jan: X, fev: Y, mar: Z ... dez: M }

        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            revenueChart = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                    datasets: [
                        {
                            label: 'Faturamento (R$)',
                            data: [
                                monthlyRevenue.jan || 0,
                                monthlyRevenue.fev || 0,
                                monthlyRevenue.mar || 0,
                                monthlyRevenue.abr || 0,
                                monthlyRevenue.mai || 0,
                                monthlyRevenue.jun || 0,
                                monthlyRevenue.jul || 0,
                                monthlyRevenue.ago || 0,
                                monthlyRevenue.set || 0,
                                monthlyRevenue.out || 0,
                                monthlyRevenue.nov || 0,
                                monthlyRevenue.dez || 0,
                            ],
                            borderColor: '#1e3a8a',
                            backgroundColor: 'rgba(30, 58, 138, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#1e3a8a',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: true },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => 'R$ ' + value.toLocaleString('pt-BR'),
                            },
                        },
                    },
                },
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('statusChart')) {
        initDashboard();
    }
});