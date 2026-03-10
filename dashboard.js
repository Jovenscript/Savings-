// js/dashboard.js
let meuDonutChart = null; 
let meuLineChart = null; 
let superAppSwiper = null; // Variável global para o cubo

document.addEventListener('DOMContentLoaded', () => {
    const userSwitch = document.getElementById('userSwitch');
    const data = getData();
    
    if (!data.config) {
        data.config = { currentUser: 'ambos' };
        saveData(data);
    }

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

    // 🧊 MOTOR DO CUBO BLINDADO CONTRA VOLTA DE PÁGINA 🧊
    if (document.querySelector(".superAppSwiper")) {
        if (superAppSwiper) superAppSwiper.destroy(true, true);
        
        superAppSwiper = new Swiper(".superAppSwiper", {
            effect: "cube",
            grabCursor: true,
            cubeEffect: {
                shadow: true,
                slideShadows: true,
                shadowOffset: 20,
                shadowScale: 0.94,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            observer: true,       // Mágica 1: Observa mudanças e recarrega
            observeParents: true  // Mágica 2: Evita bugar ao sair e voltar
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

    todasAsMovimentacoes.forEach(curr => {
        const isReceita = curr.tipo && curr.tipo.toLowerCase() === 'receita';
        const valor = parseFloat(curr.valor) || 0;
        
        if (isReceita) saldo += valor;
        else saldo -= valor;

        const dataRef = curr.dataExata || curr.data || "";
        if (dataRef.startsWith(prefixoMes)) {
            if (isReceita) entradasMes += valor;
            else saidasMes += valor;
        }
    });
    
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) totalBalanceEl.innerText = typeof formatCurrency === 'function' ? formatCurrency(saldo) : `R$ ${saldo.toFixed(2)}`;

    const resumoEntradasEl = document.getElementById('resumoEntradas');
    const resumoSaidasEl = document.getElementById('resumoSaidas');
    if (resumoEntradasEl) resumoEntradasEl.innerText = typeof formatCurrency === 'function' ? formatCurrency(entradasMes) : `R$ ${entradasMes.toFixed(2)}`;
    if (resumoSaidasEl) resumoSaidasEl.innerText = typeof formatCurrency === 'function' ? formatCurrency(saidasMes) : `R$ ${saidasMes.toFixed(2)}`;

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

    const mainGoalEl = document.getElementById('mainGoal');
    if (mainGoalEl && data.metas && data.metas.length > 0) {
        const meta = data.metas[0];
        const porcTotal = meta.meta > 0 ? (meta.guardado / meta.meta) * 100 : 0;
        const porcMes = meta.metaMensal > 0 ? (meta.guardadoMes / meta.metaMensal) * 100 : 0;
        
        mainGoalEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: var(--primary-cyan); margin: 0; font-size: 1rem;">${meta.nome}</h3>
                <button onclick="editarMeta()" class="btn-primary" style="padding: 5px 10px; margin: 0; font-size: 0.7rem; width: auto; background: transparent; border: 1px solid var(--primary-cyan); color: var(--primary-cyan);">Ajustar Cofre</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; font-size: 0.85rem;">
                    <span>Progresso Total</span>
                    <span style="color: var(--primary-purple)">${porcTotal.toFixed(1)}%</span>
                </div>
                <div class="progress-bar" style="height: 10px; background: rgba(255,255,255,0.05);">
                    <div class="progress-fill" style="width: ${porcTotal > 100 ? 100 : porcTotal}%; background: var(--primary-purple); box-shadow: 0 0 10px var(--primary-purple);"></div>
                </div>
                <small style="color: var(--text-muted); font-size: 0.75rem;">${typeof formatCurrency === 'function' ? formatCurrency(meta.guardado) : meta.guardado} de ${typeof formatCurrency === 'function' ? formatCurrency(meta.meta) : meta.meta}.</small>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; font-size: 0.85rem;">
                    <span>Meta Deste Mês</span>
                    <span style="color: var(--primary-cyan)">${porcMes.toFixed(1)}%</span>
                </div>
                <div class="progress-bar" style="height: 10px; background: rgba(255,255,255,0.05);">
                    <div class="progress-fill" style="width: ${porcMes > 100 ? 100 : porcMes}%; background: var(--primary-cyan); box-shadow: 0 0 10px var(--primary-cyan);"></div>
                </div>
                <small style="color: var(--text-muted); font-size: 0.75rem;">Guardado: ${typeof formatCurrency === 'function' ? formatCurrency(meta.guardadoMes) : meta.guardadoMes} / Objetivo Mês: ${typeof formatCurrency === 'function' ? formatCurrency(meta.metaMensal) : meta.metaMensal}.</small>
            </div>
        `;
    }

    renderDonutChart(contasDoMes);
    if (document.getElementById('balanceChart')) {
        renderLineChartDinâmico(todasAsMovimentacoes);
    }
    atualizarAgendaRapida(data);
    atualizarContagemCasamento();
}

function atualizarAgendaRapida(data) {
    const agendaDiv = document.getElementById('agendaRapida');
    if (!agendaDiv) return;

    let planejamento = data.planejamento || [];
    const contasPendentes = planejamento.filter(c => c.tipo === 'saida' && c.ativo !== false && !c.pago);
    contasPendentes.sort((a, b) => (parseInt(a.diaVencimento) || 0) - (parseInt(b.diaVencimento) || 0));
    const proximasContas = contasPendentes.slice(0, 5);

    if (proximasContas.length === 0) {
        agendaDiv.innerHTML = `<div style="text-align: center; color: var(--primary-cyan); margin-top: 30px; padding: 20px; background: rgba(0, 245, 212, 0.1); border-radius: 10px;">🎉 Tudo pago! Não há faturas pendentes.</div>`;
        return;
    }

    let html = '';
    proximasContas.forEach(c => {
        html += `
            <div style="padding: 12px; background: rgba(0,0,0,0.4); border-left: 3px solid var(--danger-red); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #fff; font-size: 0.95rem; display: block;">${c.descricao}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Vence dia ${c.diaVencimento}</span>
                </div>
                <div style="font-weight: bold; color: var(--danger-red); font-size: 1rem;">
                    ${typeof formatCurrency === 'function' ? formatCurrency(c.valor) : `R$ ${c.valor}`}
                </div>
            </div>
        `;
    });
    agendaDiv.innerHTML = html;
}

function atualizarContagemCasamento() {
    const elContagem = document.getElementById('contagemCasamento');
    if (!elContagem) return;

    const dataCasamento = new Date('2026-08-29T00:00:00');
    const hoje = new Date();
    const diferencaTempo = dataCasamento.getTime() - hoje.getTime();
    const diasFaltantes = Math.ceil(diferencaTempo / (1000 * 3600 * 24));

    if (diasFaltantes > 0) {
        elContagem.innerText = `${diasFaltantes} Dias`;
    } else if (diasFaltantes === 0) {
        elContagem.innerText = "É HOJE!";
    } else {
        elContagem.innerText = "Já Casamos! ❤️";
    }
}

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

function renderLineChartDinâmico(todasAsMovimentacoes) {
    const ctxElement = document.getElementById('balanceChart');
    if (!ctxElement) return;

    const mesesChaves = [];
    const labelsGrafico = [];
    const dadosPatrimonio = [];
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    let dataAtual = new Date();
    for (let i = 5; i >= 0; i--) {
        let d = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
        let ano = d.getFullYear();
        let mes = String(d.getMonth() + 1).padStart(2, '0');
        
        mesesChaves.push(`${ano}-${mes}`);
        labelsGrafico.push(`${nomesMeses[d.getMonth()]}/${ano.toString().slice(-2)}`);
    }

    mesesChaves.forEach(mesChave => {
        let saldoAteOMes = todasAsMovimentacoes.reduce((acc, curr) => {
            const dataRef = curr.dataExata || curr.data || "";
            const prefixoConta = dataRef.substring(0, 7);
            
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
