// ============================================
// PDF GENERATOR MODULE - PROFESSIONAL VERSION
// ============================================

class PDFGenerator {

    constructor() {
        this.pageWidth = 210;
        this.pageHeight = 297;
        this.margin = 10;
    }

    // ================================
    // Helpers seguros
    // ================================

    safeDate(date) {
        if (typeof formatDate === "function") return formatDate(date);
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("pt-BR");
    }

    safeDateTime(date) {
        if (typeof formatDateTime === "function") return formatDateTime(date);
        return new Date(date).toLocaleString("pt-BR");
    }

    safeCurrency(value) {
        if (typeof formatCurrency === "function") return formatCurrency(value);
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value || 0);
    }

    safeStatus(status) {
        if (typeof getStatusLabel === "function") return getStatusLabel(status);
        return status || "N/A";
    }

    safeImageType(type) {
        if (typeof getImageTypeLabel === "function") return getImageTypeLabel(type);
        return type || "";
    }

    // ================================
    // ORDEM DE SERVIÇO PDF
    // ================================

    async generateOrderPDF(ordem, cliente, equipamento, imagens = [], pecas = [], empresa = {}) {

        try {

            Logger.log("Generating professional PDF", ordem.id);

            const element = document.createElement("div");

            element.style.position = "absolute";
            element.style.left = "-9999px";
            element.style.width = "800px";
            element.style.padding = "20px";
            element.style.fontFamily = "Inter, Arial, sans-serif";
            element.style.fontSize = "12px";
            element.style.lineHeight = "1.6";
            element.style.color = "#0b3035";

            const totalPecas = pecas.reduce((sum, p) => sum + (p.total || 0), 0);
            const totalServico = ordem.service_value || 0;
            const totalFinal = totalServico + totalPecas;

            element.innerHTML = `

            <!-- HEADER -->
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1a535c;padding-bottom:10px;margin-bottom:20px;">

                <div>
                    ${empresa.logo ? `<img src="${empresa.logo}" style="height:60px;">` : ""}
                </div>

                <div style="text-align:right;">
                    <h2 style="margin:0;color:#1a535c;">ORDEM DE SERVIÇO</h2>
                    <strong>Nº ${ordem.os_number}</strong>
                </div>

            </div>

            <!-- CLIENTE -->
            <section style="page-break-inside:avoid;margin-bottom:20px;">
            <h3 style="color:#1a535c;">CLIENTE</h3>

            <table style="width:100%;border-collapse:collapse;">
            <tr>
            <td><strong>Nome:</strong> ${cliente?.name || "N/A"}</td>
            <td><strong>Telefone:</strong> ${cliente?.phone || "N/A"}</td>
            </tr>

            <tr>
            <td><strong>Email:</strong> ${cliente?.email || "N/A"}</td>
            <td><strong>CPF:</strong> ${cliente?.cpf || "N/A"}</td>
            </tr>

            <tr>
            <td colspan="2"><strong>Endereço:</strong> ${cliente?.address || "N/A"}</td>
            </tr>

            </table>
            </section>


            <!-- EQUIPAMENTO -->
            <section style="page-break-inside:avoid;margin-bottom:20px;">

            <h3 style="color:#1a535c;">EQUIPAMENTO</h3>

            <table style="width:100%;border-collapse:collapse;">

            <tr>
            <td><strong>Marca:</strong> ${equipamento?.brand || "N/A"}</td>
            <td><strong>Modelo:</strong> ${equipamento?.model || "N/A"}</td>
            </tr>

            <tr>
            <td><strong>Nº Série:</strong> ${equipamento?.serial_number || "N/A"}</td>
            <td><strong>Acessórios:</strong> ${equipamento?.accessories || "N/A"}</td>
            </tr>

            </table>

            </section>


            <!-- SERVIÇO -->
            <section style="page-break-inside:avoid;margin-bottom:20px;">

            <h3 style="color:#1a535c;">SERVIÇO</h3>

            <table style="width:100%;border-collapse:collapse;">

            <tr>
            <td><strong>Recebido em:</strong> ${this.safeDate(ordem.date_received)}</td>
            <td><strong>Status:</strong> ${this.safeStatus(ordem.status)}</td>
            </tr>

            <tr>
            <td colspan="2"><strong>Técnico:</strong> ${ordem.technician_responsible || "N/A"}</td>
            </tr>

            </table>

            </section>


            <!-- PROBLEMA -->
            <section style="page-break-inside:avoid;margin-bottom:20px;">
            <h3 style="color:#1a535c;">PROBLEMA RELATADO</h3>

            <div style="padding:10px;background:#f7fff7;border-left:4px solid #1a535c;">
            ${ordem.problem_reported || "Não informado"}
            </div>

            </section>


            <!-- DIAGNÓSTICO -->
            <section style="page-break-inside:avoid;margin-bottom:20px;">

            <h3 style="color:#1a535c;">DIAGNÓSTICO</h3>

            <div style="padding:10px;background:#f7fff7;border-left:4px solid #1a535c;">
            ${ordem.technical_diagnosis || "Não informado"}
            </div>

            </section>


            <!-- SERVIÇOS -->
            <section style="page-break-inside:avoid;margin-bottom:20px;">

            <h3 style="color:#1a535c;">SERVIÇOS REALIZADOS</h3>

            <div style="padding:10px;background:#f7fff7;border-left:4px solid #1a535c;">
            ${ordem.services_performed || "Não informado"}
            </div>

            </section>


            <!-- PEÇAS -->
            ${pecas.length ? `
            <section style="margin-bottom:20px;">

            <h3 style="color:#1a535c;">PEÇAS UTILIZADAS</h3>

            <table style="width:100%;border-collapse:collapse;font-size:11px;">

            <thead style="background:#1a535c;color:white;">
            <tr>
            <th style="padding:6px;">Peça</th>
            <th style="padding:6px;">Qtd</th>
            <th style="padding:6px;">Valor</th>
            <th style="padding:6px;">Total</th>
            </tr>
            </thead>

            <tbody>

            ${pecas.map(p => `
            <tr>
            <td style="padding:6px;border:1px solid #ddd;">${p.nome}</td>
            <td style="padding:6px;border:1px solid #ddd;">${p.quantidade}</td>
            <td style="padding:6px;border:1px solid #ddd;">${this.safeCurrency(p.valor)}</td>
            <td style="padding:6px;border:1px solid #ddd;">${this.safeCurrency(p.total)}</td>
            </tr>
            `).join("")}

            </tbody>

            </table>

            </section>
            ` : ""}


            <!-- TOTAL -->
            <section style="margin-bottom:20px;">

            <h3 style="color:#1a535c;">RESUMO FINANCEIRO</h3>

            <table style="width:300px;border-collapse:collapse;">

            <tr>
            <td>Serviço</td>
            <td style="text-align:right;">${this.safeCurrency(totalServico)}</td>
            </tr>

            <tr>
            <td>Peças</td>
            <td style="text-align:right;">${this.safeCurrency(totalPecas)}</td>
            </tr>

            <tr style="font-weight:bold;border-top:2px solid #000;">
            <td>Total</td>
            <td style="text-align:right;">${this.safeCurrency(totalFinal)}</td>
            </tr>

            </table>

            </section>


            <!-- IMAGENS -->
            ${Array.isArray(imagens) && imagens.length ? `
            <section style="margin-bottom:20px;">

            <h3 style="color:#1a535c;">IMAGENS</h3>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">

            ${imagens.map(img => `
            <div style="border:1px solid #ddd;padding:5px;text-align:center;">
            <img src="${img.url}" style="max-width:100%;height:auto;">
            <div style="font-size:9px;">${this.safeImageType(img.tipo_imagem)}</div>
            </div>
            `).join("")}

            </div>

            </section>
            ` : ""}


            <!-- ASSINATURAS -->
            <section style="margin-top:40px;display:flex;justify-content:space-between;">

            <div style="text-align:center;width:40%;">
            <div style="border-top:1px solid #000;margin-top:40px;"></div>
            Cliente
            </div>

            <div style="text-align:center;width:40%;">
            <div style="border-top:1px solid #000;margin-top:40px;"></div>
            Técnico
            </div>

            </section>


            <!-- FOOTER -->
            <footer style="margin-top:40px;text-align:center;font-size:10px;color:#777;">
            Gerado em ${this.safeDateTime(new Date())}
            </footer>

            `;

            document.body.appendChild(element);

            const opt = {
                margin: this.margin,
                filename: `OS-${ordem.os_number}.pdf`,
                image: { type: "jpeg", quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true
                },
                jsPDF: {
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                }
            };

            await html2pdf().set(opt).from(element).save();

            document.body.removeChild(element);

            Logger.log("PDF generated successfully");

            return true;

        } catch (error) {

            Logger.error("PDF generation error", error);
            throw error;

        }
    }
}

const pdfGenerator = new PDFGenerator();