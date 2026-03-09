document.addEventListener('DOMContentLoaded', () => {
    const checkBD = setInterval(() => {
        if (typeof getData === 'function') {
            clearInterval(checkBD);
            renderGems();
            atualizarRegressiva();
        }
    }, 200);

    const input = document.getElementById('jsonMaster');
    if (input) {
        input.addEventListener('change', (e) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    importarMaster(data);
                } catch(err) { alert("Erro no JSON!"); }
            };
            reader.readAsText(e.target.files[0]);
        });
    }
});

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
            <div style="display:flex; justify-content:space-between; align-items:flex-start">
                <h4 style="margin:0">${item.name}</h4>
                <button onclick="removerGema(${index})" style="background:none; border:none; color:var(--danger-red); cursor:pointer">✕</button>
            </div>
            <div style="color:var(--primary-cyan); font-weight:bold; margin-top:5px; font-size:1.1rem">${formatCurrency(item.total)}</div>
            <input type="number" class="pay-input" value="${item.pago}" onchange="atualizarPagamento(${index}, this.value)" placeholder="R$ Pago">
            <div class="gem-progress" style="width: ${perc}%"></div>
        `;
        grid.appendChild(card);
    });

    const percG = totalC > 0 ? Math.round((pagoC/totalC)*100) : 0;
    document.getElementById('percTotal').innerText = percG + '%';
    document.getElementById('valTotal').innerText = formatCurrency(pagoC) + " de " + formatCurrency(totalC);
    
    const vault = document.getElementById('mainVault');
    if(vault) vault.style.boxShadow = `0 0 60px rgba(0, 245, 212, ${percG/200})`;
}

// Funções do Modal Manual
window.abrirModal = () => document.getElementById('modalAdd').style.display = 'flex';
window.fecharModal = () => document.getElementById('modalAdd').style.display = 'none';

window.salvarNovoItem = () => {
    const nome = document.getElementById('addNome').value.trim();
    const total = parseFloat(document.getElementById('addTotal').value) || 0;

    if(!nome || total <= 0) {
        alert("Preencha o nome e o valor total!");
        return;
    }

    const dados = getData();
    if(!dados.casamento) dados.casamento = { convidados: [], orcamento: [] };
    if(!dados.casamento.orcamento) dados.casamento.orcamento = [];

    dados.casamento.orcamento.push({ name: nome, total: total, pago: 0 });
    saveData(dados);
    
    fecharModal();
    renderGems();
    document.getElementById('addNome').value = '';
    document.getElementById('addTotal').value = '';
};

// Funções existentes de Importação e Update
window.importarMaster = (json) => {
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [], orcamento: [] };
    const fin = json.orcamento || json.items || [];
    if (fin.length > 0) {
        dados.casamento.orcamento = fin.map(it => ({
            name: it.name || it.nome || "Item",
            total: parseFloat(it.total) || 0,
            pago: parseFloat(it.pago) || parseFloat(it.paid) || 0
        }));
    }
    const conv = json.convidados || json.guests || [];
    if (conv.length > 0) {
        dados.casamento.convidados = conv.map(g => ({
            id: g.id || 'g-' + Math.random().toString(36).substr(2, 5),
            name: g.name || g.nome,
            status: g.status || 'pending'
        }));
    }
    saveData(dados);
    window.location.reload();
};

window.atualizarPagamento = function(index, valor) {
    const dados = getData();
    dados.casamento.orcamento[index].pago = parseFloat(valor) || 0;
    saveData(dados);
    renderGems();
};

window.removerGema = (index) => {
    if(confirm("Remover este item?")) {
        const dados = getData();
        dados.casamento.orcamento.splice(index, 1);
        saveData(dados);
        renderGems();
    }
};

function atualizarRegressiva() {
    const diff = new Date('2026-08-29T00:00:00') - new Date();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    document.getElementById('daysCount').innerText = dias > 0 ? dias : 0;
}
