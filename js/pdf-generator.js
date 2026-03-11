// ============================================
// PDF GENERATOR MODULE - PROFESSIONAL VERSION
// COMPATÍVEL COM SCHEMA SUPABASE
// ============================================

class PDFGenerator {

    constructor() {
        this.margin = 10;
    }

    safeDate(date) {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("pt-BR");
    }

    safeDateTime(date) {
        return new Date(date).toLocaleString("pt-BR");
    }

    safeCurrency(value) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value || 0);
    }

    async waitForImages(element) {

        const images = Array.from(element.querySelectorAll("img"));

        await Promise.all(images.map((img) => new Promise((resolve) => {

            if (img.complete) {
                resolve();
                return;
            }

            img.onload = () => resolve();
            img.onerror = () => resolve();

        })));

    }

    // ======================================
    // GERAR PDF DA ORDEM
    // ======================================

    async generateOrderPDF(ordem, cliente, equipamento, imagens = [], pecas = [], empresa = {}) {

        try {

            const element = document.createElement("div");

            element.style.position = "fixed";
            element.style.top = "0";
            element.style.left = "0";
            element.style.width = "800px";
            element.style.background = "#fff";
            element.style.opacity = "0";
            element.style.pointerEvents = "none";
            element.style.zIndex = "-1";
            element.style.fontFamily = "Arial";
            element.style.fontSize = "12px";
            element.style.color = "#333";

            // CORREÇÃO DO CÁLCULO DAS PEÇAS
            const totalPecas = pecas.reduce((sum, p) => {
                const total = (p.quantidade || 0) * (p.valor_unitario || 0);
                return sum + total;
            }, 0);

            const totalServico = ordem.valor_servico || 0;
            const totalFinal = totalServico + totalPecas;

            element.innerHTML = `

            <div style="border-bottom:2px solid #1a535c;padding-bottom:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">

                <div>
                    ${empresa.logo ? `<img src="${empresa.logo}" style="height:60px;">` : ""}
                </div>

                <div style="text-align:right">
                    <h2 style="margin:0;color:#1a535c">ORDEM DE SERVIÇO</h2>
                    <strong>Nº ${ordem.numero_os || "N/A"}</strong>
                </div>

            </div>


            <h3>CLIENTE</h3>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">

            <tr>
            <td><strong>Nome:</strong> ${cliente?.nome || "N/A"}</td>
            <td><strong>Telefone:</strong> ${cliente?.telefone || "N/A"}</td>
            </tr>

            <tr>
            <td><strong>Email:</strong> ${cliente?.email || "N/A"}</td>
            <td><strong>CPF:</strong> ${cliente?.cpf || "N/A"}</td>
            </tr>

            <tr>
            <td colspan="2"><strong>Endereço:</strong> ${cliente?.endereco || "N/A"}</td>
            </tr>

            </table>


            <h3>EQUIPAMENTO</h3>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">

            <tr>
            <td><strong>Marca:</strong> ${equipamento?.marca || "N/A"}</td>
            <td><strong>Modelo:</strong> ${equipamento?.modelo || "N/A"}</td>
            </tr>

            <tr>
            <td><strong>Nº Série:</strong> ${equipamento?.numero_serie || "N/A"}</td>
            <td><strong>Acessórios:</strong> ${equipamento?.acessorios_entregues || "N/A"}</td>
            </tr>

            </table>


            <h3>INFORMAÇÕES DO SERVIÇO</h3>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">

            <tr>
            <td><strong>Data de recebimento:</strong> ${this.safeDate(ordem.data_recebimento)}</td>
            <td><strong>Status:</strong> ${ordem.status || "N/A"}</td>
            </tr>

            <tr>
            <td colspan="2"><strong>Técnico:</strong> ${ordem.tecnico_responsavel || "N/A"}</td>
            </tr>

            </table>


            <h3>PROBLEMA RELATADO</h3>

            <div style="background:#f6f6f6;padding:10px;margin-bottom:20px">
            ${ordem.problema_relatado || "Não informado"}
            </div>


            <h3>DIAGNÓSTICO</h3>

            <div style="background:#f6f6f6;padding:10px;margin-bottom:20px">
            ${ordem.diagnostico_tecnico || "Não informado"}
            </div>


            <h3>SERVIÇOS REALIZADOS</h3>

            <div style="background:#f6f6f6;padding:10px;margin-bottom:20px">
            ${ordem.servicos_realizados || "Não informado"}
            </div>


            ${pecas.length ? `

            <h3>PEÇAS UTILIZADAS</h3>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">

            <thead style="background:#1a535c;color:white">

            <tr>
            <th style="padding:6px">Peça</th>
            <th style="padding:6px">Qtd</th>
            <th style="padding:6px">Valor</th>
            <th style="padding:6px">Total</th>
            </tr>

            </thead>

            <tbody>

            ${pecas.map(p => {

                const total = (p.quantidade || 0) * (p.valor_unitario || 0);

                return `
                <tr>
                <td style="padding:6px;border:1px solid #ddd">${p.nome || "Peça"}</td>
                <td style="padding:6px;border:1px solid #ddd">${p.quantidade || 0}</td>
                <td style="padding:6px;border:1px solid #ddd">${this.safeCurrency(p.valor_unitario)}</td>
                <td style="padding:6px;border:1px solid #ddd">${this.safeCurrency(total)}</td>
                </tr>
                `;

            }).join("")}

            </tbody>

            </table>

            ` : ""}


            <h3>RESUMO FINANCEIRO</h3>

            <table style="width:300px;border-collapse:collapse;margin-bottom:20px">

            <tr>
            <td>Serviço</td>
            <td style="text-align:right">${this.safeCurrency(totalServico)}</td>
            </tr>

            <tr>
            <td>Peças</td>
            <td style="text-align:right">${this.safeCurrency(totalPecas)}</td>
            </tr>

            <tr style="font-weight:bold;border-top:2px solid #000">
            <td>Total</td>
            <td style="text-align:right">${this.safeCurrency(totalFinal)}</td>
            </tr>

            </table>


            ${imagens?.length ? `

            <h3>IMAGENS</h3>

            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">

            ${imagens.map(img => `
            <div style="border:1px solid #ddd;padding:5px;text-align:center">
            <img src="${img.url_imagem}" style="max-width:100%">
            </div>
            `).join("")}

            </div>

            ` : ""}


            <div style="display:flex;justify-content:space-between;margin-top:40px">

            <div style="text-align:center;width:40%">
            <div style="border-top:1px solid #000;margin-top:40px"></div>
            Cliente
            </div>

            <div style="text-align:center;width:40%">
            <div style="border-top:1px solid #000;margin-top:40px"></div>
            Técnico
            </div>

            </div>


            <footer style="text-align:center;margin-top:30px;font-size:10px;color:#777">
            Gerado em ${this.safeDateTime(new Date())}
            </footer>

            `;

            document.body.appendChild(element);

            await this.waitForImages(element);
            await new Promise((resolve) => requestAnimationFrame(() => resolve()));

            const opt = {

                margin: this.margin,

                filename: `OS-${ordem.numero_os || "sem-numero"}.pdf`,

                image: { type: "jpeg", quality: 0.95 },

                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff"
                },

                jsPDF: {
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4"
                }

            };

            await html2pdf().set(opt).from(element).save();

            return true;

        } catch (error) {

            console.error("PDF generation error", error);
            throw error;

        } finally {

            if (element && element.parentNode)
                element.parentNode.removeChild(element);

        }

    }

}

const pdfGenerator = new PDFGenerator();