// ============================================
// PDF GENERATOR MODULE - jsPDF VERSION
// ============================================

class PDFGenerator {

    constructor() {
        this.margin = 10;
        this.lineHeight = 6.8;
        this.sectionGap = 4.5;
        this.colors = {
            primary: [26, 83, 92],
            accent: [14, 116, 144],
            dark: [15, 23, 42],
            muted: [71, 85, 105],
            soft: [248, 250, 252],
            border: [226, 232, 240],
            success: [16, 185, 129]
        };
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

        doc.setFillColor(...this.colors.soft);
        doc.roundedRect(this.margin, y - 2.5, 190, 7.5, 1.2, 1.2, 'F');

        doc.setDrawColor(...this.colors.border);
        doc.roundedRect(this.margin, y - 2.5, 190, 7.5, 1.2, 1.2, 'S');

        doc.setFillColor(...this.colors.primary);
        doc.roundedRect(this.margin, y - 2.2, 1.2, 6.8, 0.4, 0.4, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...this.colors.primary);
        doc.text(String(title || ''), this.margin + 3.2, y + 1.2);

        doc.setTextColor(40, 40, 40);

        return y + 8;
    }

    addLabelValue(doc, y, label, value) {
        const labelWidth = 52;
        const valueWidth = 140;
        const textLines = doc.splitTextToSize(String(value ?? 'N/A'), valueWidth);
        const lineHeight = Math.max(this.lineHeight, textLines.length * 4.2);

        y = this.ensurePageSpace(doc, y, lineHeight + 1);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`${label}:`, this.margin, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(textLines, this.margin + labelWidth + 2, y);

        return y + lineHeight;
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

        doc.setFillColor(...this.colors.soft);
        doc.roundedRect(this.margin, y - 5, 190, 7, 1, 1, 'F');
        doc.setDrawColor(...this.colors.border);
        doc.roundedRect(this.margin, y - 5, 190, 7, 1, 1, 'S');

        doc.setFillColor(...this.colors.primary);
        doc.roundedRect(this.margin, y - 4.5, 190, 7, 1, 1, 'F');

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

            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(250, 251, 253);
            doc.roundedRect(colX[0], rowY - 4.5, colW[0], rowHeight, 0.6, 0.6, 'FD');
            doc.roundedRect(colX[1], rowY - 4.5, colW[1], rowHeight, 0.6, 0.6, 'FD');
            doc.roundedRect(colX[2], rowY - 4.5, colW[2], rowHeight, 0.6, 0.6, 'FD');
            doc.roundedRect(colX[3], rowY - 4.5, colW[3], rowHeight, 0.6, 0.6, 'FD');

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

        const logoCandidates = [
            new URL('../images/logo com fundo M³.png', window.location.href).href,
            new URL('../images/logo M³.png', window.location.href).href
        ];

        let logoDataUrl = null;

        for (const logoUrl of logoCandidates) {
            logoDataUrl = await this.loadImageAsDataUrl(logoUrl);
            if (logoDataUrl)
                break;
        }

        let y = 8;

        doc.setFillColor(247, 250, 252);
        doc.roundedRect(8, y, 194, 30, 2.5, 2.5, 'F');
        doc.setDrawColor(...this.colors.border);
        doc.roundedRect(8, y, 194, 30, 2.5, 2.5, 'S');

        if (logoDataUrl) {
            try {
                doc.addImage(logoDataUrl, 'PNG', 12, y + 3, 24, 24);
            } catch {
                doc.setFontSize(8);
                doc.setTextColor(...this.colors.muted);
                doc.text('Logo', 12, y + 14);
            }
        }

        doc.setTextColor(...this.colors.dark);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(empresa?.nome || 'M³ Technology', 40, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...this.colors.muted);
        doc.text('Assistência técnica especializada em notebooks e eletrônicos.', 40, y + 14);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...this.colors.primary);
        doc.text(`OS Nº ${ordem?.numero_os || 'N/A'}`, 200, y + 8, { align: 'right' });

        doc.setFillColor(...this.colors.primary);
        doc.roundedRect(170, y + 16, 30, 8, 1.3, 1.3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(String(ordem?.status || 'Em análise').toUpperCase(), 185, y + 21, { align: 'center' });

        y += 36;
        doc.setDrawColor(...this.colors.primary);
        doc.setLineWidth(0.4);
        doc.line(this.margin, y, 200, y);

        y += 5;
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
        y = this.addLabelValue(doc, y, 'Status', ordem?.status || 'N/A');
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
