// ============================================
// RELATÓRIOS MODULE
// ============================================

let dailyRevenueChart = null;
let servicesChart = null;

async function initRelatoriosPage() {

    try {

        Logger.log('Initializing relatórios page');

        const today = new Date();
        const monthString = today.toISOString().substring(0, 7);

        document.getElementById('filterMonth').value = monthString;

        await loadReports();

        setupEventListeners();

    } catch (error) {

        Logger.error('Error initializing relatórios page', error);

    }

}

async function loadReports() {

    try {

        const monthInput =
            document.getElementById('filterMonth').value;

        const [year, month] = monthInput.split('-');

        const ordensServico =
            await db.getOrdensServico();

        const clientes =
            await db.getClientes();

        const equipamentos =
            await db.getEquipamentos();

        const filteredOrders =
            ordensServico.filter((o) => {

                const orderDate =
                    new Date(o.data_entrada);

                return (
                    orderDate.getFullYear() === parseInt(year) &&
                    orderDate.getMonth() === parseInt(month) - 1
                );

            });

        const totalOrders = filteredOrders.length;

        const completedOrders =
            filteredOrders.filter((o) =>
                ['finalizado', 'entregue']
                    .includes(o.status)
            ).length;

        const totalRevenue =
            filteredOrders.reduce((sum, o) =>
                sum + (o.valor_servico || 0)
                , 0);

        const averageTicket =
            totalOrders > 0
                ? totalRevenue / totalOrders
                : 0;

        document.getElementById('totalOrders')
            .textContent = totalOrders;

        document.getElementById('completedOrders')
            .textContent = completedOrders;

        document.getElementById('totalRevenue')
            .textContent =
            formatCurrency(totalRevenue);

        document.getElementById('averageTicket')
            .textContent =
            formatCurrency(averageTicket);

        await loadFinancialTable(
            filteredOrders,
            clientes,
            equipamentos
        );

        await loadServicesTable(filteredOrders);

        initCharts(filteredOrders);

    } catch (error) {

        Logger.error('Error loading reports', error);

    }

}

async function loadFinancialTable(
    orders,
    clientes,
    equipamentos
) {

    try {

        const tableBody =
            document.getElementById('financialTable');

        tableBody.innerHTML = '';

        if (orders.length === 0) {

            tableBody.innerHTML =
                '<tr><td colspan="8" class="text-center">Nenhum dado para o período</td></tr>';

            return;

        }

        for (const ordem of orders) {

            const cliente =
                clientes.find((c) =>
                    c.id === ordem.cliente_id
                );

            const equipamento =
                equipamentos.find((e) =>
                    e.id === ordem.equipamento_id
                );

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>${formatDate(ordem.data_entrada)}</td>
                <td>${ordem.numero_os}</td>
                <td>${cliente?.nome || 'N/A'}</td>
                <td>${equipamento?.marca} ${equipamento?.modelo}</td>
                <td>${formatCurrency(ordem.valor_servico)}</td>
                <td>R$ 0,00</td>
                <td>${formatCurrency(ordem.valor_servico)}</td>
                <td>
                    <span class="status-badge status-${ordem.status}">
                        ${getStatusLabel(ordem.status)}
                    </span>
                </td>
            `;

            tableBody.appendChild(row);

        }

    } catch (error) {

        Logger.error('Error loading financial table', error);

    }

}

async function loadServicesTable(orders) {

    try {

        const tableBody =
            document.getElementById('servicesTable');

        tableBody.innerHTML = '';

        const serviceMap = {};

        orders.forEach((ordem) => {

            const service =
                ordem.servicos_realizados ||
                'Não especificado';

            if (!serviceMap[service]) {

                serviceMap[service] = {
                    name: service,
                    count: 0,
                    total: 0
                };

            }

            serviceMap[service].count += 1;

            serviceMap[service].total +=
                ordem.valor_servico || 0;

        });

        const services =
            Object.values(serviceMap);

        const totalRevenue =
            services.reduce((sum, s) =>
                sum + s.total
                , 0);

        if (services.length === 0) {

            tableBody.innerHTML =
                '<tr><td colspan="5" class="text-center">Nenhum serviço registrado</td></tr>';

            return;

        }

        services.forEach((service) => {

            const percentage =
                totalRevenue > 0
                    ? ((service.total / totalRevenue) * 100).toFixed(2)
                    : 0;

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>${service.name}</td>
                <td>${service.count}</td>
                <td>${formatCurrency(service.total)}</td>
                <td>${formatCurrency(service.total / service.count)}</td>
                <td>${percentage}%</td>
            `;

            tableBody.appendChild(row);

        });

    } catch (error) {

        Logger.error('Error loading services table', error);

    }

}

function initCharts(orders) {

    try {

        const dailyRevenueCtx =
            document.getElementById('dailyRevenueChart');

        if (dailyRevenueCtx) {

            const dailyMap = {};

            orders.forEach((o) => {

                const date =
                    new Date(o.data_entrada)
                        .toLocaleDateString('pt-BR');

                if (!dailyMap[date])
                    dailyMap[date] = 0;

                dailyMap[date] +=
                    o.valor_servico || 0;

            });

            const labels =
                Object.keys(dailyMap).sort();

            const data =
                labels.map((l) => dailyMap[l]);

            if (dailyRevenueChart)
                dailyRevenueChart.destroy();

            dailyRevenueChart =
                new Chart(dailyRevenueCtx, {

                    type: 'bar',

                    data: {

                        labels,

                        datasets: [{
                            label: 'Faturamento Diário',
                            data
                        }]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: true

                    }

                });

        }

        const servicesCtx =
            document.getElementById('servicesChart');

        if (servicesCtx) {

            const serviceMap = {};

            orders.forEach((o) => {

                const service =
                    o.servicos_realizados ||
                    'Não especificado';

                if (!serviceMap[service])
                    serviceMap[service] = 0;

                serviceMap[service] += 1;

            });

            const labels =
                Object.keys(serviceMap);

            const data =
                Object.values(serviceMap);

            if (servicesChart)
                servicesChart.destroy();

            servicesChart =
                new Chart(servicesCtx, {

                    type: 'pie',

                    data: {

                        labels,

                        datasets: [{
                            data
                        }]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: true

                    }

                });

        }

    } catch (error) {

        Logger.error('Error initializing charts', error);

    }

}

function setupEventListeners() {

    const applyFiltersBtn =
        document.getElementById('applyFiltersBtn');

    if (applyFiltersBtn)
        applyFiltersBtn.addEventListener(
            'click',
            loadReports
        );

    const exportBtn =
        document.getElementById('exportBtn');

    if (exportBtn)
        exportBtn.addEventListener(
            'click',
            exportReports
        );

    const filterMonth =
        document.getElementById('filterMonth');

    if (filterMonth)
        filterMonth.addEventListener(
            'change',
            loadReports
        );

}

async function exportReports() {

    try {

        const monthInput =
            document.getElementById('filterMonth').value;

        const [year, month] =
            monthInput.split('-');

        const ordensServico =
            await db.getOrdensServico();

        const clientes =
            await db.getClientes();

        const filteredOrders =
            ordensServico.filter((o) => {

                const orderDate =
                    new Date(o.data_entrada);

                return (
                    orderDate.getFullYear() === parseInt(year) &&
                    orderDate.getMonth() === parseInt(month) - 1
                );

            });

        const exportData =
            filteredOrders.map((o) => {

                const cliente =
                    clientes.find((c) =>
                        c.id === o.cliente_id
                    );

                return {

                    'Data':
                        formatDate(o.data_entrada),

                    'Número OS':
                        o.numero_os,

                    'Cliente':
                        cliente?.nome || 'N/A',

                    'Valor':
                        o.valor_servico || 0,

                    'Status':
                        getStatusLabel(o.status)

                };

            });

        const ws =
            XLSX.utils.json_to_sheet(exportData);

        const wb =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            wb,
            ws,
            'Relatório'
        );

        XLSX.writeFile(
            wb,
            `Relatorio-${monthInput}.xlsx`
        );

        alert('Relatório exportado!');

    } catch (error) {

        alert(
            'Erro ao exportar relatório: ' +
            error.message
        );

        Logger.error(
            'Error exporting report',
            error
        );

    }

}

document.addEventListener('DOMContentLoaded', () => {

    if (
        document.getElementById('dailyRevenueChart')
    ) {

        initRelatoriosPage();

    }

});