// js/dashboard.js
let meuDonutChart = null; 
let meuLineChart = null; // Variável para controlar o gráfico de linha

document.addEventListener('DOMContentLoaded', () => {
    const userSwitch = document.getElementById('userSwitch');
    const data = getData();
    
    // 1. ESCUDO DE CONFIGURAÇÃO
    if (!data.config) {
        data.config = { currentUser: 'ambos' };
        saveData(data);
    }

    // 2. O ESCUDO DAS METAS 
    if (!data.metas) data.metas = [];
    
    if (data.metas.length === 0) {
        data.metas.push({
            id: Date.now(),
            nome: "O Casamento (Ago/2026)",
            prazo: "2026-08-29",
            meta: 85000,
            metaMensal: 2500,
            guardado: 0,
            guardadoMes: 0
        });
        saveData(data);
    } else if (data.metas[0] && data.metas[0].guardadoMes === undefined) {
        data.metas[0].guardadoMes = 0;
        data.metas[0].metaMensal = 1000;
        saveData(data);
    }

    if (userSwitch) {
        userSwitch.value = data.config.currentUser;
    }
    
    updateDashboard();

    // DASHBOARD SWIPER (O CARROSSEL 3D)
    let swiper;
    if (document.querySelector(".dashboardSwiper")) {
        swiper = new Swiper(".dashboardSwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            initialSlide: 0,
            coverflowEffect: {
                rotate: 40, 
                stretch: 0,
                depth: 150, 
                modifier: 1,
                slideShadows: true, 
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            }
        });
    }

    if (userSwitch) {
        userSwitch.addEventListener('change', (e) => {
            const currentData = getData();
            currentData.config.currentUser = e.target.value;
            saveData(currentData);
            updateDashboard();
        });
    }
});

// FUNÇÃO EDITAR METAS 
window.editarMeta = function() {
    const data = getData();
    if(!data.metas || data.metas.length === 0) return;
    const meta = data.metas[0];
    
    const novoNome = prompt("Qual o nome da meta principal?", meta.nome) || meta.nome;
    const novoValorTotal = parseFloat(prompt(`Qual o valor total necessário (R$)?`, meta.meta)) || meta.meta;
    const novaMetaMensal = parseFloat(prompt(`Quanto vocês querem guardar por mês (R$)?`, meta.metaMensal)) || meta.metaMensal;
    const novoGuardadoTotal = parseFloat(prompt(`Total já guardado no cofre até hoje (R$)?`, meta.guardado)) || meta.guardado;
    const novoGuardadoMes = parseFloat(prompt(`Quanto já guardaram NESTE mês atual (R$)?`, meta.guardadoMes)) || meta.guardadoMes;

    data.metas[0] = {
        ...meta,
        nome: novoNome,
        meta: novoValorTotal,
        metaMensal: novaMetaMensal,
        guardado: novoGuardadoTotal,
        guardadoMes: novoGuardadoMes
    };
    
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
    const anoAtual = hoje.getFullYear();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    const prefixoMes = `${anoAtual}-${mesAtual}`;

    const contasDoMes = todasAsMovimentacoes.filter(c => {
        const dataReferencia = c.dataExata || c.data || "";
        return dataReferencia.startsWith(prefixoMes);
    });

    let saldo = 0;
    let entradasMes = 0;
    let saidasMes = 0;

    // Calcula o Saldo Geral e os Totais do Mês
    todasAsMovimentacoes.forEach(curr => {
        const isReceita = curr.tipo && curr.tipo.toLowerCase() === 'receita';
        const valor = parseFloat(curr.valor) || 0;
        
        // Saldo Geral
        if (isReceita) saldo += valor;
        else saldo -= valor;

        // Totais apenas do Mês Atual
        const dataRef = curr.dataExata || curr.data || "";
        if (dataRef.startsWith(prefixoMes)) {
            if (isReceita) entradasMes += valor;
            else saidasMes += valor;
        }
    });
    
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) totalBalanceEl.innerText = typeof formatCurrency === 'function' ? formatCurrency(saldo) : `R$ ${saldo.toFixed(2)}`;

    // Atualiza o Resumo de Entradas e Saídas no HTML
    const resumoEntradasEl = document.getElementById('resumoEntradas');
    const resumoSaidasEl = document.getElementById('resumoSaidas');
    if (resumoEntradasEl) resumoEntradasEl.innerText = typeof formatCurrency === 'function' ? formatCurrency(entradasMes) : `R$ ${entradasMes.toFixed(2)}`;
    if (resumoSaidasEl) resumoSaidasEl.innerText = typeof formatCurrency === 'function' ? formatCurrency(saidasMes) : `R$ ${saidasMes.toFixed(2)}`;

    // SISTEMA INTELIGENTE DE ALERTAS
    const contasFuturas = data.contas || [];
    const alertasDiv = document.getElementById('calendarAlerts');
    const dataHojeZero = new Date();
    dataHojeZero.setHours(0,0,0,0);
    
    let htmlAlertas = '';
    let temAlertaPesado = false;

    if (alertasDiv) {
        contasFuturas.forEach(conta => {
            if (!conta.dataExata) return; 

            const [ano, mes, dia] = conta.dataExata.split('-');
            const dataConta = new Date(ano, mes - 1, dia);
            
            const diffTempo = dataConta.getTime() - dataHojeZero.getTime();
            const diffDias = Math.ceil(diffTempo / (1000 * 3600 * 24));

            const descUpper = conta.descricao ? conta.descricao.toUpperCase() : '';
            // Ignora receitas no alerta de radar
            if (conta.tipo !== 'receita' && diffDias > 0 && diffDias <= 90) {
                if (parseFloat(conta.valor) > 500 || descUpper.includes("IPVA") || descUpper.includes("IPTU") || descUpper.includes("SEGURO")) {
                    temAlertaPesado = true;
                    let avisoTempo = diffDias === 1 ? 'amanhã' : (diffDias <= 30 ? `em ${diffDias} dias` : `daqui a ${Math.floor(diffDias/30)} meses`);
                    
                    htmlAlertas += `
                        <div style="margin-bottom: 8px;">
                            <strong>Atenção:</strong> Conta pesada de <strong>${conta.descricao}</strong> (${typeof formatCurrency === 'function' ? formatCurrency(conta.valor) : `R$ ${conta.valor}`}) prevista para ${avisoTempo}.
                        </div>
                    `;
                }
            }
        });

        if (temAlertaPesado) {
            alertasDiv.innerHTML = htmlAlertas;
            alertasDiv.style.borderLeftColor = "var(--danger-red)";
            alertasDiv.style.background = "rgba(241, 91, 181, 0.1)";
        } else {
            alertasDiv.innerHTML = "Tudo tranquilo! Nenhum radar detectou contas pesadas próximas.";
            alertasDiv.style.borderLeftColor = "var(--primary-cyan)";
            alertasDiv.style.background = "rgba(0, 245, 212, 0.1)";
        }
    }

    // ATUALIZAÇÃO DA ÁREA DE METAS
    const mainGoalEl = document.getElementById('mainGoal');
    if (mainGoalEl && data.metas && data.metas.length > 0) {
        const meta = data.metas[0];
        const porcTotal = meta.meta > 0 ? (meta.guardado / meta.meta) * 100 : 0;
        const porcMes = meta.metaMensal > 0 ? (meta.guardadoMes / meta.metaMensal) * 100 : 0;
        
        mainGoalEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--primary-cyan); margin: 0;">${meta.nome}</h2>
                <button onclick="editarMeta()" class="btn-primary" style="padding: 8px 15px; margin: 0; font-size: 0.8rem; width: auto; background: transparent; border: 1px solid var(--primary-cyan); color: var(--primary-cyan);">Ajustar Cofre</button>
            </div>
            
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold;">
                    <span>Progresso Total da Meta</span>
                    <span style="color: var(--primary-purple)">${porcTotal.toFixed(1)}%</span>
                </div>
                <div class="progress-bar" style="height: 12px; background: rgba(255,255,255,0.05);">
                    <div class="progress-fill" style="width: ${porcTotal > 100 ? 100 : porcTotal}%; background: var(--primary-purple); box-shadow: 0 0 10px var(--primary-purple);"></div>
                </div>
                <small style="color: var(--text-muted)">${typeof formatCurrency === 'function' ? formatCurrency(meta.guardado) : meta.guardado} de ${typeof formatCurrency === 'function' ? formatCurrency(meta.meta) : meta.meta} guardados.</small>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold;">
                    <span>Meta Deste Mês</span>
                    <span style="color: var(--primary-cyan)">${porcMes.toFixed(1)}%</span>
                </div>
                <div class="progress-bar" style="height: 12px; background: rgba(255,255,255,0.05);">
                    <div class="progress-fill" style="width: ${porcMes > 100 ? 100 : porcMes}%; background: var(--primary-cyan); box-shadow: 0 0 10px var(--primary-cyan);"></div>
                </div>
                <small style="color: var(--text-muted)">Guardado: ${typeof formatCurrency === 'function' ? formatCurrency(meta.guardadoMes) : meta.guardadoMes} / Objetivo Mês: ${typeof formatCurrency === 'function' ? formatCurrency(meta.metaMensal) : meta.metaMensal}.</small>
            </div>
        `;
    }

    // Processa os Gráficos
    renderDonutChart(contasDoMes);
    if (document.getElementById('balanceChart')) {
        renderLineChartDinâmico(todasAsMovimentacoes);
    }
}

// Gráfico de Rosca (Despesas do Mês)
function renderDonutChart(contasDoMes) {
    const ctxElement = document.getElementById('donutChart');
    const avisoSemGastos = document.getElementById('semGastosAviso');
    if (!ctxElement) return;

    const despesas = contasDoMes.filter(c => !c.tipo || c.tipo.toLowerCase() !== 'receita');

    if (despesas.length === 0) {
        ctxElement.style.display = 'none';
        if (avisoSemGastos) avisoSemGastos.style.display = 'block';
        return;
    } else {
        ctxElement.style.display = 'block';
        if (avisoSemGastos) avisoSemGastos.style.display = 'none';
    }

    const somaCategorias = {};
    despesas.forEach(d => {
        const cat = d.categoria || 'Outros';
        const valor = parseFloat(d.valor) || 0;
        if (!somaCategorias[cat]) somaCategorias[cat] = 0;
        somaCategorias[cat] += valor;
    });

    const labels = Object.keys(somaCategorias);
    const dadosGrafico = Object.values(somaCategorias);

    if (meuDonutChart) meuDonutChart.destroy();

    const ctx = ctxElement.getContext('2d');
    meuDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dadosGrafico,
                backgroundColor: ['#9d4edd', '#00f5d4', '#f15bb5', '#fee440', '#00bbf9', '#f15bb5', '#2b2d42'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right', labels: { color: '#fff', font: { size: 10 } } }
            }
        }
    });
}

// NOVO: Gráfico de Linha Dinâmico (Evolução Real dos últimos 6 meses)
function renderLineChartDinâmico(todasAsMovimentacoes) {
    const ctxElement = document.getElementById('balanceChart');
    if (!ctxElement) return;

    const mesesChaves = [];
    const labelsGrafico = [];
    const dadosPatrimonio = [];
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // 1. Constrói a linha do tempo (Últimos 6 meses até hoje)
    let dataAtual = new Date();
    for (let i = 5; i >= 0; i--) {
        let d = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
        let ano = d.getFullYear();
        let mes = String(d.getMonth() + 1).padStart(2, '0');
        
        mesesChaves.push(`${ano}-${mes}`); // Ex: '2026-01'
        labelsGrafico.push(`${nomesMeses[d.getMonth()]}/${ano.toString().slice(-2)}`); // Ex: 'Jan/26'
    }

    // 2. Calcula o Patrimônio Acumulado até o final de cada um desses meses
    mesesChaves.forEach(mesChave => {
        let saldoAteOMes = todasAsMovimentacoes.reduce((acc, curr) => {
            const dataRef = curr.dataExata || curr.data || "";
            const prefixoConta = dataRef.substring(0, 7); // Pega só YYYY-MM da conta
            
            // Se a transação aconteceu ANTES ou DURANTE o mês que estamos analisando
            if (prefixoConta <= mesChave) {
                const isReceita = curr.tipo && curr.tipo.toLowerCase() === 'receita';
                const valor = parseFloat(curr.valor) || 0;
                return isReceita ? acc + valor : acc - valor;
            }
            return acc;
        }, 0);
        
        dadosPatrimonio.push(saldoAteOMes);
    });

    if (meuLineChart) meuLineChart.destroy();

    const ctx = ctxElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(157, 78, 221, 0.5)'); 
    gradient.addColorStop(1, 'rgba(157, 78, 221, 0)');

    meuLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsGrafico,
            datasets: [{
                label: 'Patrimônio',
                data: dadosPatrimonio,
                borderColor: '#9d4edd',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#00f5d4',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let valor = context.raw;
                            return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: { 
                x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } }, 
                y: { display: false } 
            },
            layout: { padding: 10 }
        }
    });
}