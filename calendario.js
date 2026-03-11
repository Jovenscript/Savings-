// calendario.js

let calendarSwiper = null; 
let dataNavegacao = new Date(); 
dataNavegacao.setDate(1); 
dataNavegacao.setHours(12, 0, 0, 0); 
let diaAtivoNoCard = new Date().getDate(); 
let isMonthView = false; 

const diasSemana = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// 🚀 FUNÇÃO GLOBAL BLINDADA PARA MUDAR O MÊS (Chamada direto do HTML)
window.mudarMes = function(direcao) {
    dataNavegacao.setMonth(dataNavegacao.getMonth() + direcao);
    renderizarMesAtual(1); // Sempre pula pro dia 1 do mês novo
};

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

document.addEventListener('DOMContentLoaded', () => {
    const tipoEvento = document.getElementById('tipoEvento');
    const btnToggleView = document.getElementById('btnToggleView');
    const formRecorrente = document.getElementById('formRecorrente');

    if (tipoEvento) {
        tipoEvento.addEventListener('change', (e) => {
            const blocoValor = document.getElementById('blocoValor');
            const valorConta = document.getElementById('valorConta');
            const blocoHorario = document.getElementById('blocoHorario');
            const horarioRotina = document.getElementById('horarioRotina');
            
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

    if (btnToggleView) {
        btnToggleView.addEventListener('click', () => {
            isMonthView = !isMonthView;
            const dayCarouselView = document.getElementById('dayCarouselView');
            const monthGridView = document.getElementById('monthGridView');
            
            if (isMonthView) {
                if(dayCarouselView) dayCarouselView.style.display = 'none';
                if(monthGridView) monthGridView.style.display = 'block';
                btnToggleView.innerHTML = '🃏 Voltar para as Cartas';
            } else {
                if(monthGridView) monthGridView.style.display = 'none';
                if(dayCarouselView) dayCarouselView.style.display = 'flex';
                btnToggleView.innerHTML = '📅 Abrir Visão do Mês Completo';
                renderizarMesAtual(diaAtivoNoCard);
            }
        });
    }

    if (formRecorrente) {
        formRecorrente.addEventListener('submit', (e) => {
            e.preventDefault();
            const dados = typeof getData === 'function' ? getData() : {};
            if (!dados.contas) dados.contas = [];

            const valorConta = document.getElementById('valorConta');
            const horarioRotina = document.getElementById('horarioRotina');
            
            const dataExata = `${dataNavegacao.getFullYear()}-${String(dataNavegacao.getMonth() + 1).padStart(2, '0')}-${String(diaAtivoNoCard).padStart(2, '0')}`;
            const novoItem = {
                id: Date.now(),
                descricao: document.getElementById('descEvento') ? document.getElementById('descEvento').value : '',
                tipo: tipoEvento ? tipoEvento.value : 'conta',
                dataExata: dataExata,
                valor: (tipoEvento && tipoEvento.value === 'conta' && valorConta) ? parseFloat(valorConta.value) : 0,
                horario: (tipoEvento && tipoEvento.value === 'rotina' && horarioRotina) ? horarioRotina.value : '',
                categoria: "Lançamento Manual",
                pago: false
            };
            
            dados.contas.push(novoItem);
            if(typeof saveData === 'function') saveData(dados);
            renderizarMesAtual(diaAtivoNoCard);
            formRecorrente.reset();
            if (tipoEvento) tipoEvento.dispatchEvent(new Event('change'));
        });
    }

    if (tipoEvento) tipoEvento.dispatchEvent(new Event('change'));
    renderizarMesAtual(diaAtivoNoCard);
});

function renderizarMesAtual(diaAlvo = null) {
    const wrapper = document.getElementById('calendarWrapper');
    const mesAtualTitulo = document.getElementById('mesAtualTitulo');
    
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
    let qtdContasMes = 0;

    for (let d = 1; d <= diasNoMes; d++) {
        const strData = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dataFoco = new Date(ano, mes, d, 12, 0, 0);
        const nomeDia = diasSemana[dataFoco.getDay()];
        const itensDoDia = contas.filter(c => c.dataExata === strData);
        
        let htmlItens = '';
        if (itensDoDia.length === 0) {
            htmlItens = `<div style="text-align: center; color: var(--text-muted); margin-top: 50px; font-style: italic; font-size: 0.9rem;">Dia livre!</div>`;
        } else {
            itensDoDia.forEach(item => {
                const isConta = item.tipo === 'conta' || item.tipo === 'despesa' || !item.tipo; 
                const botaoHTML = `<button onclick="apagarEvento(${item.id})" style="background: none; border: none; color: #ff4b4b; font-size: 0.75rem; cursor: pointer; text-decoration: underline; margin-top: 2px;">Apagar</button>`;

                if (isConta) {
                    somaMes += item.valor;
                    qtdContasMes++;
                    
                    let txtPago = item.pago ? '✅ Pago' : '💸 Pagar';
                    let corPago = item.pago ? 'var(--primary-cyan)' : 'var(--danger-red)';
                    let opacidade = item.pago ? 'opacity: 0.5;' : 'opacity: 1;';
                    
                    let botaoPago = `<button onclick="alternarStatusPagamento(${item.id})" style="background: rgba(0,0,0,0.5); border: 1px solid ${corPago}; color: ${corPago}; font-size: 0.75rem; cursor: pointer; padding: 3px 8px; border-radius: 5px; margin-right: 8px; font-weight: bold;">${txtPago}</button>`;

                    htmlItens += `
                        <div style="padding: 8px 10px; background: rgba(0,0,0,0.6); border-left: 3px solid ${corPago}; border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; ${opacidade} transition: 0.3s;">
                            <div style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px;">
                                <strong style="color: #fff; font-size: 0.85rem;">${item.descricao}</strong>
                            </div>
                            <div style="text-align: right; min-width: 120px; display: flex; flex-direction: column; align-items: flex-end;">
                                <div style="font-weight: bold; color: ${corPago}; font-size: 0.85rem; margin-bottom: 5px;">${typeof formatCurrency === 'function' ? formatCurrency(item.valor) : 'R$ ' + item.valor}</div>
                                <div style="display: flex;">
                                    ${botaoPago}
                                    ${botaoHTML}
                                </div>
                            </div>
                        </div>`;
                } else {
                    htmlItens += `
                        <div style="padding: 8px 10px; background: rgba(157, 78, 221, 0.15); border-left: 3px solid var(--primary-purple); border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px;">
                                <strong style="color: #fff; font-size: 0.85rem;">${item.descricao}</strong>
                            </div>
                            <div style="text-align: right; min-width: 70px;">
                                <div style="font-weight: bold; color: #fff; font-size: 0.85rem;">🕒 ${item.horario}</div>
                                ${botaoHTML}
                            </div>
                        </div>`;
                }
            });
        }

        const card = document.createElement('div');
        card.className = 'swiper-slide glass-panel';
        card.dataset.diaReal = d;
        
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.height = '100%'; 

        card.innerHTML = `
            <div class="card-header-glass">
                <h2>${d}</h2>
                <span style="font-size: 0.85rem; color: rgba(255,255,255,0.8); font-weight: bold; letter-spacing: 1px;">${nomeDia}</span>
            </div>
            <div class="scroll-interno" style="flex: 1; overflow-y: auto; padding-right: 5px;">
                ${htmlItens}
            </div>`;
        if (wrapper) wrapper.appendChild(card);
    }

    const totalMesValor = document.getElementById('totalMesValor');
    const totalMesQtd = document.getElementById('totalMesQtd');
    
    if (totalMesValor) totalMesValor.innerText = typeof formatCurrency === 'function' ? formatCurrency(somaMes) : 'R$ ' + somaMes;
    if (totalMesQtd) totalMesQtd.innerText = `${qtdContasMes} faturas pendentes`;

    renderizarGradeMes(ano, mes, diasNoMes, contas);
    if (!isMonthView) iniciarSwiper(diaAtivoNoCard);
    atualizarTituloForm();
}

function iniciarSwiper(diaAlvo) {
    if (typeof Swiper !== 'undefined') {
        calendarSwiper = new Swiper(".calendarSwiper", {
            effect: "cards", // MÁGICA DO BARALHO AQUI 🃏
            grabCursor: true,
            cardsEffect: {
                slideShadows: false, // Sem sombra preta para manter o design clean
                rotate: true,
                perSlideRotate: 2,
                perSlideOffset: 8
            },
            initialSlide: diaAlvo - 1, 
            navigation: { nextEl: ".calendar-nav-btn.swiper-button-next", prevEl: ".calendar-nav-btn.swiper-button-prev" },
            on: {
                slideChange: function () {
                    const slideAtual = this.slides[this.activeIndex];
                    if (slideAtual) {
                        diaAtivoNoCard = parseInt(slideAtual.dataset.diaReal);
                        atualizarTituloForm();
                        atualizarSelecaoNaGrade();
                    }
                }
            }
        });
    }
}

function renderizarGradeMes(ano, mes, diasNoMes, contas) {
    const monthGrid = document.getElementById('monthGrid');
    if (!monthGrid) return;
    
    monthGrid.innerHTML = '';
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    for (let i = 0; i < primeiroDiaSemana; i++) { monthGrid.innerHTML += `<div></div>`; }

    for (let d = 1; d <= diasNoMes; d++) {
        const strData = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const temEvento = contas.some(c => c.dataExata === strData);
        const divDia = document.createElement('div');
        divDia.className = `grid-day ${diaAtivoNoCard === d ? 'selected-day' : ''}`;
        let indicador = temEvento ? '<div class="indicador-ponto"></div>' : '';
        divDia.innerHTML = `<span>${d}</span> ${indicador}`;
        
        divDia.addEventListener('click', () => {
            diaAtivoNoCard = d;
            isMonthView = false;
            document.getElementById('monthGridView').style.display = 'none';
            document.getElementById('dayCarouselView').style.display = 'flex';
            renderizarMesAtual(d);
        });
        monthGrid.appendChild(divDia);
    }
}

function atualizarSelecaoNaGrade() {
    const monthGrid = document.getElementById('monthGrid');
    if(!monthGrid) return;
    document.querySelectorAll('.grid-day').forEach(el => el.classList.remove('selected-day'));
    const diasGrid = monthGrid.children;
    const primeiroDiaSemana = new Date(dataNavegacao.getFullYear(), dataNavegacao.getMonth(), 1).getDay();
    const indexNaGrid = diaAtivoNoCard + primeiroDiaSemana - 1;
    if (diasGrid[indexNaGrid]) diasGrid[indexNaGrid].classList.add('selected-day');
}

function atualizarTituloForm() {
    const formTitle = document.getElementById('formTitle');
    const ano = dataNavegacao.getFullYear();
    const mesStr = String(dataNavegacao.getMonth() + 1).padStart(2, '0');
    const diaStr = String(diaAtivoNoCard).padStart(2, '0');
    if (formTitle) formTitle.innerText = `AGENDAR PARA: ${diaStr}/${mesStr}/${ano}`;
}
