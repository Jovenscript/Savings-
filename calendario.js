// calendario.js

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('calendarWrapper');
    const formRecorrente = document.getElementById('formRecorrente');
    const formTitle = document.getElementById('formTitle');
    const mesAtualTitulo = document.getElementById('mesAtualTitulo');
    
    const totalMesValor = document.getElementById('totalMesValor');
    const totalMesQtd = document.getElementById('totalMesQtd');
    const btnPrevMonth = document.getElementById('btnPrevMonth');
    const btnNextMonth = document.getElementById('btnNextMonth');

    const btnToggleView = document.getElementById('btnToggleView');
    const dayCarouselView = document.getElementById('dayCarouselView');
    const monthGridView = document.getElementById('monthGridView');
    const monthGrid = document.getElementById('monthGrid');

    const tipoEvento = document.getElementById('tipoEvento');
    const blocoValor = document.getElementById('blocoValor');
    const blocoHorario = document.getElementById('blocoHorario');
    const valorConta = document.getElementById('valorConta');
    const horarioRotina = document.getElementById('horarioRotina');

    const diasSemana = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    let calendarSwiper = null; 
    let dataNavegacao = new Date(); 
    dataNavegacao.setDate(1); 
    dataNavegacao.setHours(12, 0, 0, 0); 
    let diaAtivoNoCard = new Date().getDate(); 
    let isMonthView = false; 

    window.apagarEvento = function(id) {
        if(confirm("Deseja apagar este evento do calendário?")) {
            const dados = typeof getData === 'function' ? getData() : {};
            if (dados.contas) {
                dados.contas = dados.contas.filter(c => c.id !== id);
                if (typeof saveData === 'function') saveData(dados);
                renderizarMesAtual(diaAtivoNoCard); 
            }
        }
    };

    window.alternarStatusPagamento = function(id) {
        const dados = typeof getData === 'function' ? getData() : {};
        if (dados.contas) {
            const index = dados.contas.findIndex(c => c.id === id);
            if (index !== -1) {
                dados.contas[index].pago = !dados.contas[index].pago;
                if (typeof saveData === 'function') saveData(dados); 
                renderizarMesAtual(diaAtivoNoCard); 
            }
        }
    };

    if (tipoEvento) {
        tipoEvento.addEventListener('change', (e) => {
            if (e.target.value === 'conta') {
                if(blocoValor) blocoValor.style.display = 'block';
                if(valorConta) valorConta.required = true;
                if(blocoHorario) blocoHorario.style.display = 'none';
                if(horarioRotina) horarioRotina.required = false;
            } else {
                if(blocoValor) blocoValor.style.display = 'none';
                if(valorConta) valorConta.required = false;
                if(blocoHorario) blocoHorario.style.display = 'block';
                if(horarioRotina) horarioRotina.required = true;
            }
        });
    }

    function formatDateIso(ano, mes, dia) {
        return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }

    function renderizarMesAtual(diaAlvo = null) {
        if (calendarSwiper) {
            calendarSwiper.destroy(true, true);
            calendarSwiper = null;
        }
        
        if (wrapper) wrapper.innerHTML = '';
        const ano = dataNavegacao.getFullYear();
        const mes = dataNavegacao.getMonth();
        if (mesAtualTitulo) mesAtualTitulo.innerText = `${mesesNomes[mes]} ${ano}`;
        
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        if (diaAtivoNoCard > diasNoMes) diaAtivoNoCard = diasNoMes;
        if (diaAlvo !== null) diaAtivoNoCard = diaAlvo;

        const dados = typeof getData === 'function' ? getData() : {};
        if (!dados.contas) dados.contas = [];
        
        const contas = dados.contas;
        let somaMes = 0;
