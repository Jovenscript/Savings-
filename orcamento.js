document.addEventListener('DOMContentLoaded', () => {
    // Espera os dados carregarem
    const checkBD = setInterval(() => {
        if (typeof getData === 'function') {
            clearInterval(checkBD);
            renderGems();
            atualizarRegressiva();
        }
    }, 200);

    const inputJson = document.getElementById('jsonMaster');
    if (inputJson) {
        inputJson.addEventListener('change', (e) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    importarDadosMaster(data);
                } catch(err) { alert("JSON Inválido!"); }
            };
            reader.readAsText(e.target.files[0]);
        });
    }
});

function importarDadosMaster(json) {
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [], orcamento: [] };

    // Importa Orçamento (mapeia 'items' ou 'orcamento')
    const fin = json.items || json.orcamento || [];
    if (fin.length > 0) {
        dados.casamento.orcamento = fin.map(it => ({
            name: it.name || it.nome || "Item",
            total: parseFloat(it.total) || 0,
            pago: parseFloat(it.paid) || parseFloat(it.pago) || 0
        }));
    }

    // Importa Convidados (mapeia 'convidados' ou 'guests')
    const conv = json.convidados || json.guests || [];
    if (conv.length > 0) {
        dados.casamento.convidados = conv.map(g => ({
            id: g.id || 'g-' + Math.random().toString(36).substr(2, 5),
            name: g.name || g.nome,
            status: g.status || 'pending'
        }));
    }

    saveData(dados);
    alert("🚀 Tudo pronto! Orçamento e Convidados importados.");
    window.location.reload();
}

function renderGems() {
    const grid = document.getElementById('gemsGrid');
    const dados = getData();
    const itens = (dados.casamento && dados.casamento.orcamento) ? dados.casamento.orcamento : [];
    
    grid.innerHTML = '';
    let totalC = 0, pagoC = 0;

    itens.forEach((item, index) => {
        totalC += item.total;
        pagoC += item.pago;
        const perc = item.total > 0 ? Math.round((item.pago/item.total)*100) : 0;
        
        const card = document.createElement('div');
        card.className = 'gem-card';
        card.innerHTML = `
            <h4>${item.name}</h4>
            <span style="color:var(--primary-cyan); font-weight:bold">${formatCurrency(item.total)}</span>
            <input type="number" class="pay-input" value="${item.pago}" onchange="atualizarPagamento(${index}, this.value)">
            <div class="gem-progress" style="width: ${perc}%"></div>
        `;
        grid.appendChild(card);
    });

    const percG = totalC > 0 ? Math.round((pagoC/totalC)*100) : 0;
    document.getElementById('percTotal').innerText = percG + '%';
    document.getElementById('valTotal').innerText = formatCurrency(pagoC) + " de " + formatCurrency(totalC);
    document.getElementById('mainVault').style.boxShadow = `0 0 50px rgba(0, 245, 212, ${percG/150})`;
}

window.atualizarPagamento = function(index, valor) {
    const dados = getData();
    dados.casamento.orcamento[index].pago = parseFloat(valor) || 0;
    saveData(dados);
    renderGems();
};

function atualizarRegressiva() {
    const dataCasamento = new Date('2026-08-29T00:00:00');
    const diff = dataCasamento - new Date();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    document.getElementById('daysCount').innerText = dias > 0 ? dias : 0;
}