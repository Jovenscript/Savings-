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
            const dados = getData();
            if (dados.contas) {
                dados.contas = dados.contas.filter(c => c.id !== id);
                saveData(dados);
                renderizarMesAtual(diaAtivoNoCard); 
            }
        }
    };

    tipoEvento.addEventListener('change', (e) => {
        if (e.target.value === 'conta') {
            blocoValor.style.display = 'block';
            valorConta.required = true;
            blocoHorario.style.display = 'none';
            horarioRotina.required = false;
        } else {
            blocoValor.style.display = 'none';
            valorConta.required = false;
            blocoHorario.style.display = 'block';
            horarioRotina.required = true;
        }
    });

    function formatDateIso(ano, mes, dia) {
        return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }

    function renderizarMesAtual(diaAlvo = null) {
        if (calendarSwiper) {
            calendarSwiper.destroy(true, true);
            calendarSwiper = null;
        }
        
        wrapper.innerHTML = '';
        const ano = dataNavegacao.getFullYear();
        const mes = dataNavegacao.getMonth();
        mesAtualTitulo.innerText = `${mesesNomes[mes]} ${ano}`;
        
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        if (diaAtivoNoCard > diasNoMes) diaAtivoNoCard = diasNoMes;
        if (diaAlvo !== null) diaAtivoNoCard = diaAlvo;

        const dados = getData();
        if (!dados.contas) dados.contas = [];
        
        const contas = dados.contas;
        let somaMes = 0;
        let qtdContasMes = 0;

        for (let d = 1; d <= diasNoMes; d++) {
            const strData = formatDateIso(ano, mes, d);
            const dataFoco = new Date(ano, mes, d, 12, 0, 0);
            const nomeDia = diasSemana[dataFoco.getDay()];
            const itensDoDia = contas.filter(c => c.dataExata === strData);
            
            let htmlItens = '';
            if (itensDoDia.length === 0) {
                htmlItens = `<div style="text-align: center; color: var(--text-muted); margin-top: 50px; font-style: italic; font-size: 0.9rem;">Dia livre!</div>`;
            } else {
                itensDoDia.forEach(item => {
                    const isConta = item.tipo === 'conta' || !item.tipo; 
                    const botaoHTML = `<button onclick="apagarEvento(${item.id})" style="background: none; border: none; color: var(--danger-red); font-size: 0.75rem; cursor: pointer; text-decoration: underline; margin-top: 2px;">Apagar</button>`;

                    if (isConta) {
                        somaMes += item.valor;
                        qtdContasMes++;
                        htmlItens += `
                            <div style="padding: 8px 10px; background: rgba(0,0,0,0.4); border-left: 3px solid var(--primary-cyan); border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px;">
                                    <strong style="color: #fff; font-size: 0.85rem;">${item.descricao}</strong>
                                </div>
                                <div style="text-align: right; min-width: 70px;">
                                    <div style="font-weight: bold; color: var(--primary-cyan); font-size: 0.85rem;">${formatCurrency(item.valor)}</div>
                                    ${botaoHTML}
                                </div>
                            </div>`;
                    } else {
                        htmlItens += `
                            <div style="padding: 8px 10px; background: rgba(157, 78, 221, 0.1); border-left: 3px solid var(--primary-purple); border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px;">
                                    <strong style="color: #fff; font-size: 0.85rem;">${item.descricao}</strong>
                                </div>
                                <div style="text-align: right; min-width: 70px;">
                                    <div style="font-weight: bold; color: var(--text-muted); font-size: 0.85rem;">🕒 ${item.horario}</div>
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

            /* AQUI ESTÁ A CORREÇÃO: Removi a classe "swiper-no-swiping" que travava o toque no celular */
            card.innerHTML = `
                <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px; flex-shrink: 0;">
                    <h2 style="font-size: 3.5rem; color: var(--primary-cyan); margin: 0;">${d}</h2>
                    <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: bold;">${nomeDia}</span>
                </div>
                <div class="scroll-interno" style="flex: 1; overflow-y: auto; padding-right: 5px;">
                    ${htmlItens}
                </div>`;
            wrapper.appendChild(card);
        }

        totalMesValor.innerText = formatCurrency(somaMes);
        totalMesQtd.innerText = `${qtdContasMes} faturas pendentes`;

        renderizarGradeMes(ano, mes, diasNoMes, contas);
        if (!isMonthView) iniciarSwiper(diaAtivoNoCard);
        atualizarTituloForm();
    }

    /* AQUI ESTÁ A CORREÇÃO NO SWIPER: Adicionado touchRatio: 1.5 para maior sensibilidade */
    function iniciarSwiper(diaAlvo) {
        calendarSwiper = new Swiper(".calendarSwiper", {
            effect: "coverflow", 
            grabCursor: true, 
            touchRatio: 1.5, 
            centeredSlides: true,
            slidesPerView: "auto",
            coverflowEffect: { rotate: 0, stretch: 30, depth: 100, modifier: 1, slideShadows: false },
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

    function renderizarGradeMes(ano, mes, diasNoMes, contas) {
        monthGrid.innerHTML = '';
        const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
        for (let i = 0; i < primeiroDiaSemana; i++) { monthGrid.innerHTML += `<div></div>`; }

        for (let d = 1; d <= diasNoMes; d++) {
            const strData = formatDateIso(ano, mes, d);
            const temEvento = contas.some(c => c.dataExata === strData);
            const divDia = document.createElement('div');
            divDia.className = `grid-day ${diaAtivoNoCard === d ? 'selected-day' : ''}`;
            let indicador = temEvento ? '<div class="indicador-ponto"></div>' : '';
            divDia.innerHTML = `<span>${d}</span> ${indicador}`;
            
            divDia.addEventListener('click', () => {
                diaAtivoNoCard = d;
                isMonthView = false;
                monthGridView.style.display = 'none';
                dayCarouselView.style.display = 'flex';
                renderizarMesAtual(d);
            });
            monthGrid.appendChild(divDia);
        }
    }

    function atualizarSelecaoNaGrade() {
        document.querySelectorAll('.grid-day').forEach(el => el.classList.remove('selected-day'));
        const diasGrid = monthGrid.children;
        const primeiroDiaSemana = new Date(dataNavegacao.getFullYear(), dataNavegacao.getMonth(), 1).getDay();
        const indexNaGrid = diaAtivoNoCard + primeiroDiaSemana - 1;
        if (diasGrid[indexNaGrid]) diasGrid[indexNaGrid].classList.add('selected-day');
    }

    btnToggleView.addEventListener('click', () => {
        isMonthView = !isMonthView;
        if (isMonthView) {
            dayCarouselView.style.display = 'none';
            monthGridView.style.display = 'block';
            btnToggleView.innerHTML = '🃏 Voltar para as Cartas';
        } else {
            monthGridView.style.display = 'none';
            dayCarouselView.style.display = 'flex';
            btnToggleView.innerHTML = '📅 Abrir Visão do Mês Completo';
            renderizarMesAtual(diaAtivoNoCard);
        }
    });

    function atualizarTituloForm() {
        const ano = dataNavegacao.getFullYear();
        const mesStr = String(dataNavegacao.getMonth() + 1).padStart(2, '0');
        const diaStr = String(diaAtivoNoCard).padStart(2, '0');
        formTitle.innerText = `AGENDAR PARA: ${diaStr}/${mesStr}/${ano}`;
    }

    btnPrevMonth.addEventListener('click', () => {
        dataNavegacao.setMonth(dataNavegacao.getMonth() - 1);
        renderizarMesAtual(1); 
    });

    btnNextMonth.addEventListener('click', () => {
        dataNavegacao.setMonth(dataNavegacao.getMonth() + 1);
        renderizarMesAtual(1); 
    });

    formRecorrente.addEventListener('submit', (e) => {
        e.preventDefault();
        const dados = getData();
        if (!dados.contas) dados.contas = [];

        const dataExata = formatDateIso(dataNavegacao.getFullYear(), dataNavegacao.getMonth(), diaAtivoNoCard);
        const novoItem = {
            id: Date.now(),
            descricao: document.getElementById('descEvento').value,
            tipo: tipoEvento.value,
            dataExata: dataExata,
            valor: tipoEvento.value === 'conta' ? parseFloat(valorConta.value) : 0,
            horario: tipoEvento.value === 'rotina' ? horarioRotina.value : '',
            categoria: "Lançamento Manual"
        };
        
        dados.contas.push(novoItem);
        saveData(dados);
        renderizarMesAtual(diaAtivoNoCard);
        formRecorrente.reset();
        tipoEvento.dispatchEvent(new Event('change'));
    });

    tipoEvento.dispatchEvent(new Event('change'));
    renderizarMesAtual();
});
