// js/planejamento.js

document.addEventListener('DOMContentLoaded', () => {
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let dataFiltro = new Date(); 
    dataFiltro.setDate(1);

    const btnPrevMonth = document.getElementById('btnPrevMonthPlan');
    const btnNextMonth = document.getElementById('btnNextMonthPlan');
    const mesAtualTitulo = document.getElementById('mesAtualTituloPlan');
    const formOrcamento = document.getElementById('formOrcamento');
    const btnSmartFill = document.getElementById('btnSmartFill');

    btnPrevMonth.addEventListener('click', () => {
        dataFiltro.setMonth(dataFiltro.getMonth() - 1);
        carregarTela();
    });

    btnNextMonth.addEventListener('click', () => {
        dataFiltro.setMonth(dataFiltro.getMonth() + 1);
        carregarTela();
    });

    // Evento de clique para a IA analisar o histórico
    if (btnSmartFill) {
        btnSmartFill.addEventListener('click', executarPreenchimentoInteligente);
    }

    function carregarTela() {
        const ano = dataFiltro.getFullYear();
        const mes = dataFiltro.getMonth();
        mesAtualTitulo.innerText = `${mesesNomes[mes]} ${ano}`;

        const dados = getData();
        if (!dados.orcamentos) dados.orcamentos = {}; 

        const chaveMes = `${ano}-${String(mes + 1).padStart(2, '0')}`;
        const orcamentoDoMes = dados.orcamentos[chaveMes] || {};
        
        document.getElementById('rendaMensal').value = orcamentoDoMes.renda || '';
        document.getElementById('limiteMoradia').value = orcamentoDoMes.moradia || '';
        document.getElementById('limiteMercado').value = orcamentoDoMes.mercado || '';
        document.getElementById('limiteLanches').value = orcamentoDoMes.lanches || '';
        document.getElementById('limiteCombustivel').value = orcamentoDoMes.combustivel || '';
        document.getElementById('limiteTransporte').value = orcamentoDoMes.transporte || '';
        document.getElementById('limiteSaude').value = orcamentoDoMes.saude || '';
        document.getElementById('limiteCompras').value = orcamentoDoMes.compras || '';
        document.getElementById('limiteEducacao').value = orcamentoDoMes.educacao || '';
        document.getElementById('limiteCasamento').value = orcamentoDoMes.casamento || '';

        calcularTermometros(chaveMes, orcamentoDoMes, dados.contas || []);
    }

    formOrcamento.addEventListener('submit', (e) => {
        e.preventDefault();
        const ano = dataFiltro.getFullYear();
        const mes = dataFiltro.getMonth();
        const chaveMes = `${ano}-${String(mes + 1).padStart(2, '0')}`;

        const dados = getData();
        if (!dados.orcamentos) dados.orcamentos = {};

        dados.orcamentos[chaveMes] = {
            renda: parseFloat(document.getElementById('rendaMensal').value) || 0,
            moradia: parseFloat(document.getElementById('limiteMoradia').value) || 0,
            mercado: parseFloat(document.getElementById('limiteMercado').value) || 0,
            lanches: parseFloat(document.getElementById('limiteLanches').value) || 0,
            combustivel: parseFloat(document.getElementById('limiteCombustivel').value) || 0,
            transporte: parseFloat(document.getElementById('limiteTransporte').value) || 0,
            saude: parseFloat(document.getElementById('limiteSaude').value) || 0,
            compras: parseFloat(document.getElementById('limiteCompras').value) || 0,
            educacao: parseFloat(document.getElementById('limiteEducacao').value) || 0,
            casamento: parseFloat(document.getElementById('limiteCasamento').value) || 0
        };

        saveData(dados);
        carregarTela();
        
        const btn = formOrcamento.querySelector('button[type="submit"]');
        const textoOriginal = btn.innerText;
        btn.innerText = "✅ Salvo com sucesso!";
        btn.style.background = "var(--primary-cyan)";
        btn.style.color = "var(--bg-dark)";
        setTimeout(() => {
            btn.innerText = textoOriginal;
            btn.style.background = "var(--primary-purple)";
            btn.style.color = "#fff";
        }, 2000);
    });

    function calcularTermometros(chaveMes, orcamento, contas) {
        const area = document.getElementById('areaTermometros');
        const contasDoMes = contas.filter(c => c.dataExata && c.dataExata.startsWith(chaveMes));

        let gastos = { 
            moradia: 0, mercado: 0, lanches: 0, combustivel: 0, 
            transporte: 0, saude: 0, compras: 0, educacao: 0, casamento: 0 
        };

        contasDoMes.forEach(c => {
            if (c.categoria === '🏠 Moradia / Contas') gastos.moradia += parseFloat(c.valor) || 0;
            if (c.categoria === '🛒 Supermercado') gastos.mercado += parseFloat(c.valor) || 0;
            if (c.categoria === '🍔 Lanches & Delivery') gastos.lanches += parseFloat(c.valor) || 0;
            if (c.categoria === '⛽ Combustível') gastos.combustivel += parseFloat(c.valor) || 0;
            if (c.categoria === '🚗 Uber / Transporte') gastos.transporte += parseFloat(c.valor) || 0;
            if (c.categoria === '💊 Saúde / Farmácia') gastos.saude += parseFloat(c.valor) || 0;
            if (c.categoria === '🛍️ Compras Pessoais') gastos.compras += parseFloat(c.valor) || 0;
            if (c.categoria === '📚 Educação') gastos.educacao += parseFloat(c.valor) || 0;
            if (c.categoria === '💍 Casamento') gastos.casamento += parseFloat(c.valor) || 0;
        });

        area.innerHTML = `
            ${gerarBarra('🏠 Moradia / Contas', gastos.moradia, orcamento.moradia)}
            ${gerarBarra('🛒 Supermercado', gastos.mercado, orcamento.mercado)}
            ${gerarBarra('🍔 Lanches & Delivery', gastos.lanches, orcamento.lanches)}
            ${gerarBarra('⛽ Combustível', gastos.combustivel, orcamento.combustivel)}
            ${gerarBarra('🚗 Uber / Transporte', gastos.transporte, orcamento.transporte)}
            ${gerarBarra('💊 Saúde / Farmácia', gastos.saude, orcamento.saude)}
            ${gerarBarra('🛍️ Compras Pessoais', gastos.compras, orcamento.compras)}
            ${gerarBarra('📚 Educação', gastos.educacao, orcamento.educacao)}
            ${gerarBarra('💍 Casamento', gastos.casamento, orcamento.casamento)}
        `;

        if (area.innerHTML.trim() === '') {
            area.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; margin-top: 20px;">Defina e salve um limite para visualizar os termômetros.</p>`;
        }
    }

    function gerarBarra(nome, gasto, limite) {
        if (!limite || limite <= 0) return ''; 

        let porcentagem = (gasto / limite) * 100;
        let corBarra = "var(--primary-cyan)";
        
        if (porcentagem > 80) corBarra = "#ffbe0b"; 
        if (porcentagem > 100) {
            corBarra = "var(--danger-red)"; 
            porcentagem = 100; 
        }

        const formatarGrana = (valor) => {
            return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        };

        return `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border-left: 3px solid ${corBarra}; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong style="color: #fff; font-size: 0.9rem;">${nome}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">
                        Gasto: <strong style="color: ${corBarra};">${formatarGrana(gasto)}</strong> / ${formatarGrana(limite)}
                    </span>
                </div>
                <div style="width: 100%; height: 10px; background: rgba(0,0,0,0.5); border-radius: 5px; overflow: hidden;">
                    <div style="width: ${porcentagem}%; height: 100%; background: ${corBarra}; transition: 0.5s;"></div>
                </div>
            </div>
        `;
    }

    carregarTela();
});

// --- LÓGICA DO ASSISTENTE FINANCEIRO (NOVA) ---

function executarPreenchimentoInteligente() {
    const dados = typeof getData === 'function' ? getData() : {};
    const contas = dados.contas || [];

    if (contas.length === 0) {
        mostrarToast("Você ainda não tem transações para que a IA possa analisar o histórico.", true);
        return;
    }

    const hoje = new Date();
    const noventaDiasAtras = new Date();
    noventaDiasAtras.setDate(hoje.getDate() - 90);

    const somaPorCategoria = {};
    let despesasEncontradas = 0;

    contas.forEach(conta => {
        if (conta.tipo && conta.tipo.toLowerCase() === 'receita') return;

        const dataConta = new Date(conta.dataExata || conta.data); 
        
        if (!isNaN(dataConta.getTime()) && dataConta >= noventaDiasAtras && dataConta <= hoje) {
            const cat = conta.categoria;
            const valor = parseFloat(conta.valor) || 0;
            
            if (valor > 0 && cat) {
                if (!somaPorCategoria[cat]) somaPorCategoria[cat] = 0;
                somaPorCategoria[cat] += valor;
                despesasEncontradas++;
            }
        }
    });

    if (despesasEncontradas === 0) {
        mostrarToast("Nenhuma despesa localizada nos últimos 90 dias para calcular a média.", true);
        return;
    }

    const mapaInputs = {
        '🏠 Moradia / Contas': 'limiteMoradia',
        '🛒 Supermercado': 'limiteMercado',
        '🍔 Lanches & Delivery': 'limiteLanches',
        '⛽ Combustível': 'limiteCombustivel',
        '🚗 Uber / Transporte': 'limiteTransporte',
        '💊 Saúde / Farmácia': 'limiteSaude',
        '🛍️ Compras Pessoais': 'limiteCompras',
        '📚 Educação': 'limiteEducacao',
        '💍 Casamento': 'limiteCasamento'
    };

    let camposPreenchidos = 0;

    for (const [categoria, somaTotal] of Object.entries(somaPorCategoria)) {
        const mediaMensal = somaTotal / 3;
        const idInput = mapaInputs[categoria];
        
        if (idInput && mediaMensal > 0) {
            const inputElement = document.getElementById(idInput);
            
            if (inputElement) {
                inputElement.value = Math.ceil(mediaMensal).toFixed(2);
                
                inputElement.style.transition = "box-shadow 0.4s ease, border-color 0.4s ease";
                inputElement.style.borderColor = "var(--primary-cyan, #00f5d4)";
                inputElement.style.boxShadow = "0 0 15px rgba(0, 245, 212, 0.4)";
                
                setTimeout(() => {
                    inputElement.style.boxShadow = "none";
                    inputElement.style.borderColor = ""; 
                }, 2500);
                
                camposPreenchidos++;
            }
        }
    }

    if (camposPreenchidos > 0) {
        mostrarToast(`✨ IA: Orçamento sugerido! ${camposPreenchidos} categorias preenchidas. Clique em 'Salvar Orçamento'.`);
    } else {
        mostrarToast("Histórico analisado, mas não houve gastos correspondentes aos campos.", true);
    }
}

function mostrarToast(mensagem, isErro = false) {
    const toast = document.getElementById('smartToast');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (toast && toastMsg && toastIcon) {
        toastMsg.innerText = mensagem;
        toast.style.borderLeftColor = isErro ? "var(--danger-red, #f15bb5)" : "var(--primary-cyan, #00f5d4)";
        toastIcon.innerText = isErro ? "⚠️" : "✨";
        
        toast.style.bottom = "25px";
        
        setTimeout(() => {
            toast.style.bottom = "-100px";
        }, 4500);
    }
}
