// ============================================
// PDF GENERATOR MODULE - AUDITADO
// ============================================

class PDFGenerator {
    constructor() {
        this.pageWidth = 210;
        this.pageHeight = 297;
        this.margin = 10;
    }

    async generateOrderPDF(ordem, cliente, equipamento, imagens = []) {
        try {
            Logger.log('Generating PDF for order:', ordem.id);

            // Container temporário
            const element = document.createElement('div');
            element.id = `pdf-content-${Date.now()}`;
            element.style.padding = '20px';
            element.style.fontFamily = 'Inter, Arial, sans-serif';
            element.style.fontSize = '12px';
            element.style.lineHeight = '1.6';
            element.style.color = '#0b3035';

            // Conteúdo HTML
            element.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a535c; padding-bottom: 10px;">
                    <h1 style="color: #1a535c; margin: 0; font-size: 24px;">ORDEM DE SERVIÇO</h1>
                    <p style="margin: 5px 0; font-weight: bold;">Número: ${ordem.os_number}</p>
                </div>

                <section style="margin-bottom: 20px;">
                    <h3 style="color: #1a535c; border-bottom: 1px solid #ddd; padding-bottom: 5px;">INFORMAÇÕES DO CLIENTE</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="width:50%; padding:5px;"><strong>Nome:</strong> ${cliente?.name || 'N/A'}</td>
                            <td style="width:50%; padding:5px;"><strong>Email:</strong> ${cliente?.email || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding:5px;"><strong>Telefone:</strong> ${cliente?.phone || 'N/A'}</td>
                            <td style="padding:5px;"><strong>CPF:</strong> ${cliente?.cpf || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:5px;"><strong>Endereço:</strong> ${cliente?.address || 'N/A'}</td>
                        </tr>
                    </table>
                </section>

                <section style="margin-bottom: 20px;">
                    <h3 style="color: #1a535c; border-bottom: 1px solid #ddd; padding-bottom: 5px;">INFORMAÇÕES DO EQUIPAMENTO</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="width:50%; padding:5px;"><strong>Marca:</strong> ${equipamento?.brand || 'N/A'}</td>
                            <td style="width:50%; padding:5px;"><strong>Modelo:</strong> ${equipamento?.model || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:5px;"><strong>Número de Série:</strong> ${equipamento?.serial_number || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding:5px;"><strong>Estado Físico:</strong> ${equipamento?.physical_condition || 'N/A'}</td>
                            <td style="padding:5px;"><strong>Acessórios:</strong> ${equipamento?.accessories || 'N/A'}</td>
                        </tr>
                    </table>
                </section>

                <section style="margin-bottom:20px;">
                    <h3 style="color:#1a535c;border-bottom:1px solid #ddd;padding-bottom:5px;">INFORMAÇÕES DO SERVIÇO</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="width:50%; padding:5px;"><strong>Data de Recebimento:</strong> ${formatDate(ordem.date_received)}</td>
                            <td style="width:50%; padding:5px;"><strong>Status:</strong> ${getStatusLabel(ordem.status)}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding:5px;"><strong>Técnico Responsável:</strong> ${ordem.technician_responsible || 'N/A'}</td>
                        </tr>
                    </table>
                </section>

                <section style="margin-bottom:20px;">
                    <h3 style="color:#1a535c;border-bottom:1px solid #ddd;padding-bottom:5px;">PROBLEMA RELATADO</h3>
                    <p style="padding:10px;background-color:#f7fff7;border-left:3px solid #1a535c;">${ordem.problem_reported || 'Não informado'}</p>
                </section>

                <section style="margin-bottom:20px;">
                    <h3 style="color:#1a535c;border-bottom:1px solid #ddd;padding-bottom:5px;">DIAGNÓSTICO TÉCNICO</h3>
                    <p style="padding:10px;background-color:#f7fff7;border-left:3px solid #1a535c;">${ordem.technical_diagnosis || 'Não informado'}</p>
                </section>

                <section style="margin-bottom:20px;">
                    <h3 style="color:#1a535c;border-bottom:1px solid #ddd;padding-bottom:5px;">SERVIÇOS REALIZADOS</h3>
                    <p style="padding:10px;background-color:#f7fff7;border-left:3px solid #1a535c;">${ordem.services_performed || 'Não informado'}</p>
                </section>

                <section style="margin-bottom:20px;">
                    <h3 style="color:#1a535c;border-bottom:1px solid #ddd;padding-bottom:5px;">INFORMAÇÕES FINANCEIRAS</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="width:50%;padding:5px;"><strong>Valor do Serviço:</strong> ${formatCurrency(ordem.service_value)}</td>
                            <td style="width:50%;padding:5px;"><strong>Valor Total:</strong> ${formatCurrency(ordem.service_value)}</td>
                        </tr>
                    </table>
                </section>

                ${imagens.length > 0 ? `
                    <section style="margin-bottom:20px; page-break-inside: avoid;">
                        <h3 style="color:#1a535c;border-bottom:1px solid #ddd;padding-bottom:5px;">GALERIA DE IMAGENS</h3>
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap:10px;">
                            ${imagens.map(img => `
                                <div style="text-align:center; border:1px solid #ddd; padding:5px;">
                                    <img src="${img.url}" style="max-width:100%;height:auto;" alt="${img.tipo_imagem}">
                                    <p style="font-size:10px;margin:2px 0;"><strong>${getImageTypeLabel(img.tipo_imagem)}</strong></p>
                                    <p style="font-size:9px;color:#666;">${img.descricao_tecnica || ''}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                <footer style="margin-top:30px;border-top:2px solid #1a535c;padding-top:10px;text-align:center;font-size:10px;color:#666;">
                    <p>Documento gerado em ${formatDateTime(new Date())}</p>
                    <p>Sistema de Gerenciamento de Assistência Técnica</p>
                </footer>
            `;

            document.body.appendChild(element);

            const opt = {
                margin: this.margin,
                filename: `OS-${ordem.os_number}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
            };

            await html2pdf().set(opt).from(element).save();
            document.body.removeChild(element);

            Logger.log('PDF generated successfully for order:', ordem.id);
            return true;
        } catch (error) {
            Logger.error('Error generating PDF', error);
            throw error;
        }
    }

    // Financial report
    async generateFinancialReportPDF(data, month) {
        try {
            Logger.log('Generating financial report PDF for:', month);

            const element = document.createElement('div');
            element.style.padding = '20px';
            element.style.fontFamily = 'Inter, Arial, sans-serif';
            element.style.fontSize = '12px';

            const totalRevenue = data.reduce((sum, item) => sum + (item.total || 0), 0);
            const totalOrders = data.length;
            const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            element.innerHTML = `
                <header style="text-align:center;margin-bottom:20px;border-bottom:2px solid #1a535c;padding-bottom:10px;">
                    <h1 style="color:#1a535c;margin:0;">RELATÓRIO FINANCEIRO</h1>
                    <p style="margin:5px 0;">Período: ${month}</p>
                </header>

                <section style="margin-bottom:20px;">
                    <h3 style="color:#1a535c;">RESUMO</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr style="background-color:#f0f0f0;">
                            <td style="padding:10px;border:1px solid #ddd;"><strong>Total de Ordens:</strong></td>
                            <td style="padding:10px;border:1px solid #ddd;">${totalOrders}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;border:1px solid #ddd;"><strong>Faturamento Total:</strong></td>
                            <td style="padding:10px;border:1px solid #ddd;">${formatCurrency(totalRevenue)}</td>
                        </tr>
                        <tr style="background-color:#f0f0f0;">
                            <td style="padding:10px;border:1px solid #ddd;"><strong>Ticket Médio:</strong></td>
                            <td style="padding:10px;border:1px solid #ddd;">${formatCurrency(averageTicket)}</td>
                        </tr>
                    </table>
                </section>

                <section style="margin-bottom:20px;">
                    <h3 style="color:#1a535c;">DETALHES</h3>
                    <table style="width:100%;border-collapse:collapse;font-size:11px;">
                        <thead>
                            <tr style="background-color:#1a535c;color:white;">
                                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Data</th>
                                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Número OS</th>
                                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Cliente</th>
                                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map((item, i) => `
                                <tr style="background-color:${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
                                    <td style="padding:8px;border:1px solid #ddd;">${formatDate(item.date)}</td>
                                    <td style="padding:8px;border:1px solid #ddd;">${item.os_number}</td>
                                    <td style="padding:8px;border:1px solid #ddd;">${item.client_name}</td>
                                    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>

                <footer style="margin-top:30px;text-align:center;font-size:10px;color:#666;">
                    <p>Relatório gerado em ${formatDateTime(new Date())}</p>
                </footer>
            `;

            document.body.appendChild(element);

            const opt = {
                margin: this.margin,
                filename: `Relatorio-Financeiro-${month}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
            };

            await html2pdf().set(opt).from(element).save();
            document.body.removeChild(element);

            Logger.log('Financial report PDF generated successfully');
            return true;
        } catch (error) {
            Logger.error('Error generating financial report PDF', error);
            throw error;
        }
    }
}

const pdfGenerator = new PDFGenerator();