// js/dashboard.js
let meuDonutChart = null; 
let meuLineChart = null; 
let superAppSwiper = null; 

document.addEventListener('DOMContentLoaded', () => {
    // 🛡️ REGRA DE OURO: Só executa se o usuário já estiver logado
    const userEmail = localStorage.getItem('gemsEliteLogin');
    if (!userEmail) return;

    const data = getData();
    
    // Configura o usuário atual se não existir, mas não sobrescreve o Onboarding
    if (!data.config) {
        data.config = { currentUser: 'ambos' };
    }

    // 👑 PASSAPORTE VIP (Marlon & Carol)
    // Só injeta o Casamento automaticamente se for o e-mail de vocês
    const fundadores = ['marlindo0951@gmail.com', 'carol18bistaffa@gmail.com'];
    if (fundadores.includes(userEmail)) {
        if (!data.metas || data.metas.length === 0) {
            data.metas = [{
                id: Date.now(),
                nome: "O Casamento (Ago/2026)",
                prazo: "2026-08-29",
                meta: 85000,
                metaMensal: 2500,
                guardado: 0,
                guardadoMes: 0
            }];
            saveData(data);
        }
    }

    const userSwitch = document.getElementById('userSwitch');
    if (userSwitch) {
        userSwitch.value = data.config.currentUser || 'ambos';
        userSwitch.addEventListener('change', (e) => {
            const currentData = getData();
            currentData.config.currentUser = e.target.value;
            saveData(currentData);
            updateDashboard();
        });
    }
    
    updateDashboard();
    inicializarCubo();
});

function inicializarCubo() {
    if (document.querySelector(".superAppSwiper")) {
        if (superAppSwiper) superAppSwiper.destroy(true, true);
        superAppSwiper = new Swiper(".superAppSwiper", {
            effect: "cube",
            grabCursor: true,
            cubeEffect: { shadow: true, slideShadows: true, shadowOffset: 20, shadowScale: 0.94 },
            pagination: { el: ".swiper-pagination", clickable: true },
            observer: true,
            observeParents: true
        });
    }
}

window.editarMeta = function() {
    const data = getData();
    if(!data.metas || data.metas.length === 0) return alert("Crie uma meta primeiro!");
    const meta = data.metas[0];
    
    const novoNome = prompt("Nome da meta:", meta.nome) || meta.nome;
    const novoValorTotal = parseFloat(prompt(`Valor total (R$):`, meta.meta)) || meta.meta;
    const novaMetaMensal = parseFloat(prompt(`Meta mensal (R$):`, meta.metaMensal)) || meta.metaMensal;
    const novoGuardadoTotal = parseFloat(prompt(`Total guardado (R$):`, meta.guardado)) || meta.guardado;
    const novoGuardadoMes = parseFloat(prompt(`Guardado este mês (R$):`, meta.guardadoMes)) || meta.guardadoMes;

    data.metas[0] = { ...meta, nome: novoNome, meta: novoValorTotal, metaMensal: novaMetaMensal, guardado: novoGuardadoTotal, guardadoMes: novoGuardadoMes };
    saveData(data);
    updateDashboard();
};

function updateDashboard() {
    const data = getData();
    const user = data.config ? data.config.currentUser : 'ambos';
    
    let todasAsMovimentacoes = [];
    if (data.transacoes) todasAsMovimentacoes = todasAsMovimentacoes.concat(data.transacoes);
    if (data.contas) todasAsMovimentacoes = todasAsMovimentacoes.concat(data.contas);
    
    if (user !== 'ambos') {
        todasAsMovimentacoes = todasAsMovimentacoes.filter(t => t.usuario === user || t.usuario === 'ambos');
    }

    const hoje = new Date();
    const prefixoMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const contasDoMes = todasAsMovimentacoes.filter(c => (c.dataExata || c.data || "").startsWith(prefixoMes));

    let saldo = 0, entradasMes = 0, saidasMes = 0;
    todasAsMovimentacoes.forEach(curr => {
        const valor = parseFloat(curr.valor) || 0;
        const isReceita = curr.tipo?.toLowerCase() === 'receita';
        saldo += isReceita ? valor : -valor;
        if ((curr.dataExata || curr.data || "").startsWith(prefixoMes)) {
            if (isReceita) entradasMes += valor; else saidasMes += valor;
        }
    });
    
    if (document.getElementById('totalBalance')) document.getElementById('totalBalance').innerText = formatCurrency(saldo);
    if (document.getElementById('resumoEntradas')) document.getElementById('resumoEntradas').innerText = formatCurrency(entradasMes);
    if (document.getElementById('resumoSaidas')) document.getElementById('resumoSaidas').innerText = formatCurrency(saidasMes);

    renderDonutChart(contasDoMes);
    if (document.getElementById('balanceChart')) renderLineChartDinâmico(todasAsMovimentacoes);
    atualizarAgendaRapida(data);
    atualizarContagemCasamento();
    renderizarMiniCofre(data);
}

function renderizarMiniCofre(data) {
    const mainGoalEl = document.getElementById('mainGoal');
    if (mainGoalEl && data.metas && data.metas.length > 0) {
        const meta = data.metas[0];
        const porcTotal = meta.meta > 0 ? (meta.guardado / meta.meta) * 100 : 0;
        const porcMes = meta.metaMensal > 0 ? (meta.guardadoMes / meta.metaMensal) * 100 : 0;
        
        mainGoalEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: var(--primary-cyan); margin: 0; font-size: 0.9rem;">${meta.nome}</h3>
                <button onclick="editarMeta()" class="btn-primary" style="padding: 4px 8px; font-size: 0.65rem; width: auto; background: transparent; border: 1px solid var(--primary-cyan); color: var(--primary-cyan);">Editar</button>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                    <span>Progresso Total</span>
                    <span style="color: var(--primary-purple)">${porcTotal.toFixed(1)}%</span>
                </div>
                <div class="progress-bar" style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                    <div style="width: ${Math.min(porcTotal, 100)}%; height: 100%; background: var(--primary-purple); box-shadow: 0 0 10px var(--primary-purple);"></div>
                </div>
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                    <span>Meta do Mês</span>
                    <span style="color: var(--primary-cyan)">${porcMes.toFixed(1)}%</span>
                </div>
                <div class="progress-bar" style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden;">
                    <div style="width: ${Math.min(porcMes, 100)}%; height: 100%; background: var(--primary-cyan); box-shadow: 0 0 10px var(--primary-cyan);"></div>
                </div>
            </div>
        `;
    }
}

function atualizarAgendaRapida(data) {
    const agendaDiv = document.getElementById('agendaRapida');
    if (!agendaDiv) return;
    const proximasContas = (data.planejamento || []).filter(c => c.tipo === 'saida' && !c.pago).sort((a, b) => a.diaVencimento - b.diaVencimento).slice(0, 5);
    if (proximasContas.length === 0) {
        agendaDiv.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: 20px;">Nenhuma conta pendente ✨</p>`;
        return;
    }
    agendaDiv.innerHTML = proximasContas.map(c => `
        <div style="padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid var(--danger-red);">
            <span style="font-size: 0.85rem;">${c.descricao} <small style="display:block; color: gray;">Dia ${c.diaVencimento}</small></span>
            <strong style="color: var(--danger-red); font-size: 0.85rem;">${formatCurrency(c.valor)}</strong>
        </div>
    `).join('');
}

function atualizarContagemCasamento() {
    const el = document.getElementById('contagemCasamento');
    if (!el) return;
    const dias = Math.ceil((new Date('2026-08-29') - new Date()) / (1000 * 60 * 60 * 24));
    el.innerText = dias > 0 ? `${dias} Dias` : (dias === 0 ? "É HOJE! ❤️" : "Casados! ❤️");
}

function renderDonutChart(contas) {
    const canvas = document.getElementById('donutChart');
    if (!canvas) return;
    const despesas = contas.filter(c => c.tipo?.toLowerCase() !== 'receita');
    if (despesas.length === 0) return canvas.style.display = 'none';
    canvas.style.display = 'block';

    const categorias = {};
    despesas.forEach(d => categorias[d.categoria || 'Outros'] = (categorias[d.categoria || 'Outros'] || 0) + parseFloat(d.valor));

    if (meuDonutChart) meuDonutChart.destroy();
    meuDonutChart = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(categorias),
            datasets: [{ data: Object.values(categorias), backgroundColor: ['#9d4edd', '#00f5d4', '#f15bb5', '#fee440', '#00bbf9'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
    });
}

function renderLineChartDinâmico(movs) {
    const canvas = document.getElementById('balanceChart');
    if (!canvas) return;
    // Lógica simplificada do gráfico de linha para manter a performance
    if (meuLineChart) meuLineChart.destroy();
    meuLineChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels: ['6m', '5m', '4m', '3m', '2m', 'Atual'], datasets: [{ data: [0,0,0,0,0,10], borderColor: '#9d4edd', tension: 0.4, fill: true, backgroundColor: 'rgba(157, 78, 221, 0.1)' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
}
