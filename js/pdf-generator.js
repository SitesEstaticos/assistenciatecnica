// ============================================
// PDF GENERATOR MODULE - jsPDF VERSION
// ============================================

class PDFGenerator {

    constructor() {
        this.margin = 10;
        this.lineHeight = 6.8;
        this.sectionGap = 4.5;
    }

    safeDate(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('pt-BR');
    }

    safeDateTime(date) {
        return new Date(date).toLocaleString('pt-BR');
    }

    safeCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    ensurePageSpace(doc, y, needed = 10) {
        const pageHeight = doc.internal.pageSize.getHeight();

        if (y + needed <= pageHeight - this.margin)
            return y;

        doc.addPage();
        return this.margin;
    }

    addSectionTitle(doc, y, title) {
        y = this.ensurePageSpace(doc, y, 10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(26, 83, 92);
        doc.text(String(title || ''), this.margin, y);

        doc.setDrawColor(226, 232, 240);
        doc.line(this.margin, y + 1.5, 200, y + 1.5);

        doc.setTextColor(40, 40, 40);

        return y + 9;
    }

    addLabelValue(doc, y, label, value) {

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);

        const labelText = `${label}:`;
        const labelWidth = doc.getTextWidth(labelText);
        const valueX = this.margin + Math.max(32, Math.min(72, labelWidth + 4));
        const maxValueWidth = Math.max(20, 200 - this.margin - valueX);

        doc.setFont('helvetica', 'normal');
        const valueText = String(value ?? 'N/A');
        const valueLines = doc.splitTextToSize(valueText, maxValueWidth);

        const blockHeight = Math.max(this.lineHeight, (valueLines.length * 4.6) + 1);
        y = this.ensurePageSpace(doc, y, blockHeight + 1);

        doc.setFont('helvetica', 'bold');
        doc.text(labelText, this.margin, y);

        doc.setFont('helvetica', 'normal');
        doc.text(valueLines, valueX, y);

        return y + blockHeight;
    }

    addParagraph(doc, y, text) {
        const content = String(text || 'Não informado');
        const lines = doc.splitTextToSize(content, 190);

        y = this.ensurePageSpace(doc, y, (lines.length * 4.8) + 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(lines, this.margin, y);

        return y + (lines.length * 5.2) + 5;
    }

    addPecasTable(doc, y, pecas = []) {
        if (!pecas.length)
            return y;

        const colX = [this.margin, 95, 120, 155];
        const colW = [85, 25, 35, 45];

        y = this.ensurePageSpace(doc, y, 10);

        doc.setFillColor(26, 83, 92);
        doc.rect(this.margin, y - 4.5, 190, 7, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Peça', colX[0] + 1, y);
        doc.text('Qtd', colX[1] + 1, y);
        doc.text('Valor Unit.', colX[2] + 1, y);
        doc.text('Total', colX[3] + 1, y);

        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'normal');

        let rowY = y + 5;

        pecas.forEach((p) => {

            rowY = this.ensurePageSpace(doc, rowY, 7);

            const qtd = Number(p.quantidade || 0);
            const valorUnit = Number(p.valor_unitario || 0);
            const total = qtd * valorUnit;

            const nome = p.pecas?.nome || p.nome || 'Peça';
            const nomeLines = doc.splitTextToSize(String(nome), colW[0] - 2);

            const rowHeight = Math.max(6, nomeLines.length * 4.2 + 1.5);

            doc.setDrawColor(220, 220, 220);
            doc.rect(colX[0], rowY - 4.5, colW[0], rowHeight);
            doc.rect(colX[1], rowY - 4.5, colW[1], rowHeight);
            doc.rect(colX[2], rowY - 4.5, colW[2], rowHeight);
            doc.rect(colX[3], rowY - 4.5, colW[3], rowHeight);

            doc.text(nomeLines, colX[0] + 1, rowY - 0.3);
            doc.text(String(qtd), colX[1] + 1, rowY - 0.3);
            doc.text(this.safeCurrency(valorUnit), colX[2] + 1, rowY - 0.3);
            doc.text(this.safeCurrency(total), colX[3] + 1, rowY - 0.3);

            rowY += rowHeight + 1;

        });

        return rowY;
    }

    async loadImageAsDataUrl(url) {
        try {

            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok)
                return null;

            const blob = await response.blob();

            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result || null);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });

        } catch {

            return null;

        }
    }

    async addImagesGrid(doc, y, imagens = []) {
        const validImages = (imagens || []).filter(img => !!img?.url_imagem);

        if (!validImages.length)
            return y;

        const cols = 3;
        const gap = 4;
        const boxW = (190 - ((cols - 1) * gap)) / cols;
        const boxH = 42;

        let x = this.margin;
        let countInRow = 0;

        for (const img of validImages) {

            y = this.ensurePageSpace(doc, y, boxH + 2);

            const dataUrl = await this.loadImageAsDataUrl(img.url_imagem);

            doc.setDrawColor(220, 220, 220);
            doc.rect(x, y, boxW, boxH);

            if (dataUrl) {
                try {
                    doc.addImage(dataUrl, 'JPEG', x + 1, y + 1, boxW - 2, boxH - 2);
                } catch {
                    doc.setFontSize(8);
                    doc.text('Imagem indisponível', x + 3, y + 6);
                }
            } else {
                doc.setFontSize(8);
                doc.text('Imagem indisponível', x + 3, y + 6);
            }

            countInRow += 1;

            if (countInRow === cols) {
                countInRow = 0;
                x = this.margin;
                y += boxH + gap;
            } else {
                x += boxW + gap;
            }

        }

        if (countInRow !== 0)
            y += boxH + gap;

        return y;
    }

    async generateOrderPDF(ordem, cliente, equipamento, imagens = [], pecas = [], empresa = {}) {

        if (!window.jspdf?.jsPDF)
            throw new Error('Biblioteca jsPDF não encontrada.');

        const doc = new window.jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const totalPecas = (pecas || []).reduce((sum, p) =>
            sum + (Number(p.quantidade || 0) * Number(p.valor_unitario || 0)), 0
        );

        const totalServico = Number(ordem?.valor_servico || 0);
        const totalFinal = totalServico + totalPecas;

        let y = this.margin;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(26, 83, 92);
        doc.text(empresa?.nome || 'ASSISTÊNCIA TÉCNICA', this.margin, y);

        doc.setFontSize(12);
        doc.text(`ORDEM DE SERVIÇO Nº ${ordem?.numero_os || 'N/A'}`, 200, y, { align: 'right' });

        y += 4;
        doc.setDrawColor(26, 83, 92);
        doc.setLineWidth(0.5);
        doc.line(this.margin, y, 200, y);

        y += 8;
        y = this.addSectionTitle(doc, y, 'CLIENTE');
        y = this.addLabelValue(doc, y, 'Nome', cliente?.nome || 'N/A');
        y = this.addLabelValue(doc, y, 'Telefone', cliente?.telefone || 'N/A');
        y = this.addLabelValue(doc, y, 'Email', cliente?.email || 'N/A');
        y = this.addLabelValue(doc, y, 'CPF', cliente?.cpf || 'N/A');
        y = this.addLabelValue(doc, y, 'Endereço', cliente?.endereco || 'N/A');

        y += this.sectionGap;
        y = this.addSectionTitle(doc, y, 'EQUIPAMENTO');
        y = this.addLabelValue(doc, y, 'Marca', equipamento?.marca || 'N/A');
        y = this.addLabelValue(doc, y, 'Modelo', equipamento?.modelo || 'N/A');
        y = this.addLabelValue(doc, y, 'Nº Série', equipamento?.numero_serie || 'N/A');
        y = this.addLabelValue(doc, y, 'Acessórios', equipamento?.acessorios_entregues || 'N/A');

        y += this.sectionGap;
        y = this.addSectionTitle(doc, y, 'INFORMAÇÕES DA ORDEM');
        y = this.addLabelValue(doc, y, 'Data de recebimento', this.safeDate(ordem?.data_recebimento));
        const ordemStatusLabel = typeof getStatusLabel === 'function'
            ? getStatusLabel(ordem?.status)
            : (ordem?.status || 'N/A');
        y = this.addLabelValue(doc, y, 'Status', ordemStatusLabel);
        y = this.addLabelValue(doc, y, 'Técnico', ordem?.tecnico_responsavel || 'N/A');

        y += this.sectionGap;
        y = this.addSectionTitle(doc, y, 'PROBLEMA RELATADO');
        y = this.addParagraph(doc, y, ordem?.problema_relatado || 'Não informado');

        y += this.sectionGap;
        y = this.addSectionTitle(doc, y, 'DIAGNÓSTICO TÉCNICO');
        y = this.addParagraph(doc, y, ordem?.diagnostico_tecnico || 'Não informado');

        y += this.sectionGap;
        y = this.addSectionTitle(doc, y, 'SERVIÇOS REALIZADOS');
        y = this.addParagraph(doc, y, ordem?.servicos_realizados || 'Não informado');

        if ((pecas || []).length) {
            y += this.sectionGap;
            y = this.addSectionTitle(doc, y, 'PEÇAS UTILIZADAS');
            y = this.addPecasTable(doc, y, pecas);
        }

        y += this.sectionGap;
        y = this.addSectionTitle(doc, y, 'RESUMO FINANCEIRO');
        y = this.addLabelValue(doc, y, 'Serviço', this.safeCurrency(totalServico));
        y = this.addLabelValue(doc, y, 'Peças', this.safeCurrency(totalPecas));

        doc.setFont('helvetica', 'bold');
        y = this.addLabelValue(doc, y, 'TOTAL', this.safeCurrency(totalFinal));
        doc.setFont('helvetica', 'normal');

        if ((imagens || []).length) {
            y += this.sectionGap;
            y = this.addSectionTitle(doc, y, 'IMAGENS');
            y = await this.addImagesGrid(doc, y, imagens);
        }

        y = this.ensurePageSpace(doc, y, 20);
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Gerado em ${this.safeDateTime(new Date())}`, this.margin, y + 8);

        doc.save(`OS-${ordem?.numero_os || 'sem-numero'}.pdf`);

        return true;

    }

}

const pdfGenerator = new PDFGenerator();
