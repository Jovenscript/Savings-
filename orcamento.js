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

function importarMaster(json) {
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [], orcamento: [] };

    // 💰 Importa Orçamento (busca chaves 'items', 'orcamento' ou 'financeiro')
    const fin = json.orcamento || json.items || json.financeiro || [];
    if (fin.length > 0) {
        dados.casamento.orcamento = fin.filter(i => i.total !== undefined).map(it => ({
            name: it.name || it.nome || "Item",
            total: parseFloat(it.total) || 0,
            pago: parseFloat(it.pago) || parseFloat(it.paid) || 0
        }));
    }

    // 💍 Importa Convidados (busca chaves 'convidados', 'guests' ou dentro de 'items')
    let conv = json.convidados || json.guests || [];
    if (conv.length === 0 && json.items) {
        conv = json.items.filter(i => i.total === undefined && (i.name || i.nome));
    }
    
    if (conv.length > 0) {
        dados.casamento.convidados = conv.map(g => ({
            id: g.id || 'g-'+Math.random(),
            name: g.name || g.nome,
            status: g.status || 'pending'
        }));
    }

    saveData(dados);
    alert(`🚀 Sucesso!\n💰 Orçamento: ${dados.casamento.orcamento.length}\n💍 Convidados: ${dados.casamento.convidados.length}`);
    window.location.reload();
}

function renderGems() {
    const grid = document.getElementById('gemsGrid');
    const dados = getData();
    const itens = dados.casamento?.orcamento || [];
    grid.innerHTML = '';
    let t = 0, p = 0;

    itens.forEach((it, idx) => {
        t += it.total; p += it.pago;
        const perc = it.total > 0 ? Math.round((it.pago/it.total)*100) : 0;
        const card = document.createElement('div');
        card.className = 'gem-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between">
                <h4>${it.name}</h4>
                <button onclick="removerGema(${idx})" style="background:none; border:none; color:var(--danger-red); cursor:pointer">✕</button>
            </div>
            <div style="color:var(--primary-cyan); font-weight:bold">${formatCurrency(it.total)}</div>
            <input type="number" class="pay-input" value="${it.pago}" onchange="atuGema(${idx}, this.value)">
            <div class="gem-progress" style="width: ${perc}%"></div>
        `;
        grid.appendChild(card);
    });

    const pg = t > 0 ? Math.round((p/t)*100) : 0;
    if(document.getElementById('percTotal')) document.getElementById('percTotal').innerText = pg + '%';
    if(document.getElementById('valTotal')) document.getElementById('valTotal').innerText = `${formatCurrency(p)} de ${formatCurrency(t)}`;
    const v = document.getElementById('mainVault');
    if(v) v.style.boxShadow = `0 0 60px rgba(0, 245, 212, ${pg/200})`;
}

window.atuGema = (idx, val) => {
    const dados = getData();
    dados.casamento.orcamento[idx].pago = parseFloat(val) || 0;
    saveData(dados);
    renderGems();
};

window.removerGema = (idx) => {
    if(confirm("Remover?")) {
        const d = getData();
        d.casamento.orcamento.splice(idx, 1);
        saveData(d);
        renderGems();
    }
};

function atualizarRegressiva() {
    const diff = new Date('2026-08-29T00:00:00') - new Date();
    const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if(document.getElementById('daysCount')) document.getElementById('daysCount').innerText = d > 0 ? d : 0;
}
