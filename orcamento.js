// orcamento.js

document.addEventListener('DOMContentLoaded', () => {
    const checkBD = setInterval(() => {
        if (typeof getData === 'function') {
            clearInterval(checkBD);
            calcularInteligencia();
        }
    }, 200);
});

// ==========================================
// MOTOR DE CÁLCULO E RENDERIZAÇÃO
// ==========================================
function calcularInteligencia() {
    const listContainer = document.getElementById('supplierList');
    const dados = typeof getData === 'function' ? getData() : {};
    let itens = (dados.casamento && dados.casamento.orcamento) ? dados.casamento.orcamento : [];
    
    let totalCusto = 0; let totalPago = 0; let qtdQuitados = 0;

    let itensMapeados = itens.map((item, index) => ({ ...item, originalIndex: index }));
    itensMapeados.sort((a, b) => {
        const aQuitado = (a.pago >= a.total && a.total > 0);
        const bQuitado = (b.pago >= b.total && b.total > 0);
        if (aQuitado === bQuitado) return 0;
        return aQuitado ? 1 : -1;
    });

    listContainer.innerHTML = '';

    if (itensMapeados.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; color: var(--text-muted); padding: 40px; border: 1px dashed var(--glass-border); border-radius: 16px;">Nenhum fornecedor cadastrado.</div>`;
    } else {
        itensMapeados.forEach(item => {
            const valTotal = parseFloat(item.total) || 0;
            const valPago = parseFloat(item.pago) || 0;
            const valFalta = valTotal - valPago;
            const isQuitado = valPago >= valTotal && valTotal > 0;
            
            totalCusto += valTotal;
            totalPago += valPago;
            if (isQuitado) qtdQuitados++;

            const categoriaDisplay = item.categoria ? item.categoria.split(' ')[0] : '📦 Outros';

            const htmlCard = `
                <div class="supplier-card ${isQuitado ? 'quitado' : ''}">
                    <div class="s-info">
                        <div class="s-name">${item.name} ${isQuitado ? '✅' : ''}</div>
                        <span class="s-cat">${categoriaDisplay}</span>
                    </div>
                    <div class="s-finance">
                        <div class="s-total">${formatCurrency(valTotal)}</div>
                        ${!isQuitado ? `<div class="s-pendente">Falta: ${formatCurrency(valFalta)}</div>` : `<div style="color: var(--primary-cyan); font-size: 0.85rem; margin-top: 2px;">Quitado</div>`}
                    </div>
                    <div class="s-action">
                        <div style="display: flex; flex-direction: column; align-items: flex-end;">
                            <span style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">JÁ PAGO</span>
                            <input type="number" class="pay-input" value="${item.pago}" onchange="atualizarPagamento(${item.originalIndex}, this.value)" placeholder="R$ 0,00" ${isQuitado ? 'disabled style="opacity: 0.5;"' : ''}>
                        </div>
                        <button class="btn-delete" onclick="removerItem(${item.originalIndex})" title="Apagar Contrato">🗑️</button>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', htmlCard);
        });
    }

    const faltaPagarGeral = totalCusto - totalPago;
    document.getElementById('valTotalCusto').innerText = formatCurrency(totalCusto);
    document.getElementById('valJaPago').innerText = formatCurrency(totalPago);
    document.getElementById('valFaltaPagar').innerText = formatCurrency(faltaPagarGeral > 0 ? faltaPagarGeral : 0);
    document.getElementById('contadorQuitados').innerText = `${qtdQuitados} Fornecedores Quitados`;

    const dataCasamento = new Date('2026-08-29T00:00:00');
    const hoje = new Date();
    let mesesDiff = (dataCasamento.getFullYear() - hoje.getFullYear()) * 12;
    mesesDiff -= hoje.getMonth();
    mesesDiff += dataCasamento.getMonth();
    if (mesesDiff <= 0) mesesDiff = 1; 
    
    document.getElementById('mesesRestantes').innerText = mesesDiff;

    const metaMensal = faltaPagarGeral > 0 ? (faltaPagarGeral / mesesDiff) : 0;
    const divMeta = document.getElementById('metaDoMes');
    if (metaMensal > 0) {
        divMeta.innerText = formatCurrency(metaMensal);
    } else {
        divMeta.innerText = "Tudo Quitado! 🎉";
        divMeta.style.color = "var(--primary-purple)";
    }
}

// ==========================================
// AÇÕES DO USUÁRIO
// ==========================================
window.abrirModal = () => {
    document.getElementById('addNome').value = '';
    document.getElementById('addTotal').value = '';
    document.getElementById('modalAdd').style.display = 'flex';
};

window.fecharModal = () => document.getElementById('modalAdd').style.display = 'none';

window.salvarNovoItem = () => {
    const nome = document.getElementById('addNome').value.trim();
    const total = parseFloat(document.getElementById('addTotal').value) || 0;
    const categoria = document.getElementById('addCat').value; 

    if(!nome || total <= 0) {
        alert("Preencha o nome do fornecedor e o valor total!"); return;
    }

    const dados = typeof getData === 'function' ? getData() : {};
    if(!dados.casamento) dados.casamento = { convidados: [], orcamento: [] };
    if(!dados.casamento.orcamento) dados.casamento.orcamento = [];

    dados.casamento.orcamento.push({ name: nome, total: total, pago: 0, categoria: categoria });
    if (typeof saveData === 'function') saveData(dados);
    
    fecharModal(); calcularInteligencia();
};

window.atualizarPagamento = function(index, valor) {
    const dados = typeof getData === 'function' ? getData() : {};
    let valFloat = parseFloat(valor) || 0;
    
    const totalDoItem = dados.casamento.orcamento[index].total;
    if (valFloat > totalDoItem) valFloat = totalDoItem;
    if (valFloat < 0) valFloat = 0;

    dados.casamento.orcamento[index].pago = valFloat;
    if (typeof saveData === 'function') saveData(dados);
    calcularInteligencia();
    
    if (valFloat === totalDoItem && totalDoItem > 0 && typeof dispararConfetes === 'function') dispararConfetes();
};

window.removerItem = (index) => {
    if(confirm("Apagar este contrato?")) {
        const dados = typeof getData === 'function' ? getData() : {};
        dados.casamento.orcamento.splice(index, 1);
        if (typeof saveData === 'function') saveData(dados);
        calcularInteligencia();
    }
};

// ==========================================
// 💾 EXPORTAR / IMPORTAR APENAS O CASAMENTO (Como no planner-casamento.json)
// ==========================================
window.exportarCasamentoJSON = function() {
    const dados = typeof getData === 'function' ? getData() : {};
    const itensCasamento = (dados.casamento && dados.casamento.orcamento) ? dados.casamento.orcamento : [];
    
    if (itensCasamento.length === 0) return alert("Não há itens de casamento para exportar.");

    // Formata EXATAMENTE como no arquivo planner-casamento.json que você mandou
    const exportData = {
        items: itensCasamento.map(i => ({
            name: i.name,
            category: i.categoria || "Outros",
            total: i.total,
            paid: i.pago
        })),
        showOver: true,
        strict: false,
        exportedAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner-casamento-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
};

window.importarCasamentoJSON = function(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            const jsonImportado = JSON.parse(e.target.result);
            
            // Verifica se é o arquivo certo (precisa ter o array "items")
            if (!jsonImportado.items || !Array.isArray(jsonImportado.items)) {
                return alert("Arquivo inválido. Certifique-se de usar o planner-casamento.json");
            }

            if (confirm(`Importar ${jsonImportado.items.length} itens do casamento? Os atuais não serão apagados, apenas somados.`)) {
                const dados = typeof getData === 'function' ? getData() : {};
                if(!dados.casamento) dados.casamento = { convidados: [], orcamento: [] };
                if(!dados.casamento.orcamento) dados.casamento.orcamento = [];

                // Traduz o "items" do planner para o formato do sistema
                jsonImportado.items.forEach(item => {
                    dados.casamento.orcamento.push({
                        name: item.name,
                        categoria: item.category,
                        total: parseFloat(item.total) || 0,
                        pago: parseFloat(item.paid) || 0
                    });
                });

                if (typeof saveData === 'function') saveData(dados);
                alert("Itens de casamento importados com sucesso!");
                calcularInteligencia();
            }
        } catch (erro) { alert("Erro ao ler o arquivo JSON."); }
        // Limpa o input para poder importar o mesmo arquivo de novo se precisar
        event.target.value = '';
    };
    leitor.readAsText(arquivo);
};
