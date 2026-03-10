// orcamento.js

document.addEventListener('DOMContentLoaded', () => {
    const checkBD = setInterval(() => {
        if (typeof getData === 'function') {
            clearInterval(checkBD);
            renderGems();
            atualizarRegressiva();
        }
    }, 200);
});

// ==========================================
// RENDERIZAR O PAINEL DE MISSÃO
// ==========================================
function renderGems() {
    const container = document.getElementById('categoryContainer');
    const dados = typeof getData === 'function' ? getData() : {};
    let itens = (dados.casamento && dados.casamento.orcamento) ? dados.casamento.orcamento : [];
    
    // 1. Agrupar os itens por Categoria
    const categorias = {
        "🍽️ Buffet & Festa": [],
        "📸 Foto & Vídeo": [],
        "👗 Trajes & Beleza": [],
        "🎵 Música & Iluminação": [],
        "🌸 Decoração": [],
        "⛪ Cerimônia": [],
        "✈️ Lua de Mel": [],
        "📦 Outros": [] // Para itens antigos que não tinham categoria
    };

    let totalGeral = 0;
    let pagoGeral = 0;

    itens.forEach((item, index) => {
        totalGeral += parseFloat(item.total) || 0;
        pagoGeral += parseFloat(item.pago) || 0;
        
        // Mantém a referência do index original para poder editar/apagar
        const itemComIndex = { ...item, originalIndex: index };
        
        const catDoItem = item.categoria || "📦 Outros";
        if (categorias[catDoItem]) {
            categorias[catDoItem].push(itemComIndex);
        } else {
            categorias["📦 Outros"].push(itemComIndex);
        }
    });

    // 2. Desenhar as Gavetas (Accordions)
    container.innerHTML = '';
    
    for (const [nomeCategoria, listaItens] of Object.entries(categorias)) {
        if (listaItens.length === 0) continue; // Esconde a gaveta se não tiver item

        let totalDaCat = 0;
        let pagoDaCat = 0;
        let htmlItens = '';

        listaItens.forEach(item => {
            totalDaCat += parseFloat(item.total) || 0;
            pagoDaCat += parseFloat(item.pago) || 0;
            const perc = item.total > 0 ? Math.round((item.pago / item.total) * 100) : 0;
            
            htmlItens += `
                <div class="gem-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start">
                        <h4 style="margin:0; font-size: 1.1rem; color: #fff;">${item.name}</h4>
                        <button onclick="removerGema(${item.originalIndex})" style="background:none; border:none; color:var(--danger-red); cursor:pointer; font-size:1.2rem;" title="Apagar Item">✕</button>
                    </div>
                    <div style="color:var(--primary-cyan); font-weight:bold; margin-top:5px; font-size:1.1rem">${formatCurrency(item.total)}</div>
                    
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: var(--text-muted); font-size: 0.8rem; margin-top: 10px;">JÁ PAGO:</span>
                        <input type="number" class="pay-input" value="${item.pago}" onchange="atualizarPagamento(${item.originalIndex}, this.value)" placeholder="R$ 0,00">
                    </div>
                    
                    <div class="gem-progress" style="width: ${perc}%"></div>
                </div>
            `;
        });

        const percCat = totalDaCat > 0 ? Math.round((pagoDaCat / totalDaCat) * 100) : 0;

        // Monta a estrutura da gaveta
        const catGroup = document.createElement('div');
        catGroup.className = 'cat-group';
        
        catGroup.innerHTML = `
            <div class="cat-header" onclick="this.parentElement.classList.toggle('active')">
                <h3>${nomeCategoria}</h3>
                <div class="cat-summary">
                    <div class="cat-summary-total">${formatCurrency(totalDaCat)}</div>
                    <div class="cat-summary-progress">Pago: ${percCat}%</div>
                </div>
            </div>
            <div class="cat-body">
                ${htmlItens}
            </div>
        `;
        container.appendChild(catGroup);
    }

    // Se não tiver nada cadastrado
    if (itens.length === 0) {
        container.innerHTML = `<div style="text-align:center; color: var(--text-muted); padding: 40px;">Nenhum fornecedor cadastrado. Clique em "Adicionar" para começar.</div>`;
    }

    // 3. Atualizar o REACTOR ARC (Anel de Energia)
    const percGeral = totalGeral > 0 ? Math.round((pagoGeral / totalGeral) * 100) : 0;
    document.getElementById('percTotal').innerText = percGeral + '%';
    document.getElementById('valTotal').innerText = `${formatCurrency(pagoGeral)} / ${formatCurrency(totalGeral)}`;
    
    // Cálculo matemático para desenhar o anel perfeitamente
    const circulo = document.getElementById('anelProgresso');
    if (circulo) {
        const raio = circulo.r.baseVal.value;
        const circunferencia = raio * 2 * Math.PI;
        
        circulo.style.strokeDasharray = `${circunferencia} ${circunferencia}`;
        const offset = circunferencia - (percGeral / 100) * circunferencia;
        circulo.style.strokeDashoffset = offset;

        // Se passar de 100% (Erro de cálculo do usuário), fica vermelho alerta
        if (percGeral > 100) {
            circulo.style.stroke = 'var(--danger-red)';
        } else {
            circulo.style.stroke = 'var(--primary-cyan)';
        }
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
    const categoria = document.getElementById('addCat').value; // Puxa a categoria nova

    if(!nome || total <= 0) {
        alert("Preencha o nome do fornecedor e o valor total do contrato!");
        return;
    }

    const dados = typeof getData === 'function' ? getData() : {};
    if(!dados.casamento) dados.casamento = { convidados: [], orcamento: [] };
    if(!dados.casamento.orcamento) dados.casamento.orcamento = [];

    // Salva incluindo a categoria
    dados.casamento.orcamento.push({ 
        name: nome, 
        total: total, 
        pago: 0,
        categoria: categoria 
    });
    
    if (typeof saveData === 'function') saveData(dados);
    
    fecharModal();
    renderGems();
};

window.atualizarPagamento = function(index, valor) {
    const dados = typeof getData === 'function' ? getData() : {};
    let valFloat = parseFloat(valor) || 0;
    
    // Trava para não deixar o cara dizer que pagou R$ 10.000 num contrato de R$ 5.000 (Evita bugar o anel)
    const totalDoItem = dados.casamento.orcamento[index].total;
    if (valFloat > totalDoItem) valFloat = totalDoItem;
    if (valFloat < 0) valFloat = 0;

    dados.casamento.orcamento[index].pago = valFloat;
    
    if (typeof saveData === 'function') saveData(dados);
    renderGems();
    
    // Se o pagamento bateu o total, chuva de confetes! 🎉
    if (valFloat === totalDoItem && totalDoItem > 0) {
        if (typeof dispararConfetes === 'function') dispararConfetes();
    }
};

window.removerGema = (index) => {
    if(confirm("Deseja cancelar/remover o contrato com este fornecedor?")) {
        const dados = typeof getData === 'function' ? getData() : {};
        dados.casamento.orcamento.splice(index, 1);
        if (typeof saveData === 'function') saveData(dados);
        renderGems();
    }
};

// ==========================================
// CONTAGEM REGRESSIVA (O "SIM!")
// ==========================================
function atualizarRegressiva() {
    const dataCasamento = new Date('2026-08-29T00:00:00');
    // Força a meia-noite da data atual para não dar diferença por causa de hora
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    
    const diffTime = Math.abs(dataCasamento - hoje);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const displayElement = document.getElementById('daysCount');
    if (displayElement) {
        displayElement.innerText = diffDays > 0 ? diffDays : "CHEGOU!";
    }
}
