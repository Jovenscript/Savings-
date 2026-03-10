// convidados.js

let tinderSwiper = null;

document.addEventListener('DOMContentLoaded', () => {
    const checkDados = setInterval(() => {
        if (typeof getData === 'function') {
            clearInterval(checkDados);
            renderCards();
        }
    }, 200);

    const form = document.getElementById('formManualGuest');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('manualName');
            adicionarNomes([input.value]);
            input.value = '';
        });
    }
});

// ==========================================
// RENDERIZA AS CARTAS
// ==========================================
function renderCards() {
    const wrapper = document.getElementById('tinderWrapper');
    const dados = typeof getData === 'function' ? getData() : {};
    if (!dados.casamento) dados.casamento = { convidados: [] };
    
    // Mostra nas cartas SÓ quem está como pending (Ainda nem passou pelo app)
    const todosPendentes = dados.casamento.convidados.filter(g => g.status === 'pending');
    document.getElementById('counter').innerText = `${todosPendentes.length} na fila de decisão`;

    // Lote de 30 cartas para o celular não travar
    const pendentesRender = todosPendentes.slice(0, 30);

    wrapper.innerHTML = '';
    
    if (todosPendentes.length === 0) {
        wrapper.innerHTML = `<div class="swiper-slide guest-card" style="opacity: 1;"><h2>🎉 Fila Vazia!</h2><p>Todas as cartas foram lidas.</p></div>`;
    } else {
        pendentesRender.forEach(g => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide guest-card';
            slide.dataset.id = g.id;
            slide.innerHTML = `<div class="guest-name">${g.name}</div><p style="color:var(--text-muted)">Vai estar presente?</p>`;
            wrapper.appendChild(slide);
        });
    }

    if (tinderSwiper) tinderSwiper.destroy(true, true);
    
    tinderSwiper = new Swiper(".tinderSwiper", { 
        effect: "coverflow", 
        grabCursor: true, 
        touchRatio: 1.5, 
        centeredSlides: true,
        slidesPerView: "auto",
        coverflowEffect: { rotate: 0, stretch: 30, depth: 100, modifier: 1, slideShadows: false },
        allowTouchMove: false // Trava o arraste manual pra usar só os botões
    });

    renderListasDeStatus(dados.casamento.convidados);
}

// ==========================================
// AÇÃO DOS BOTÕES CENTRAIS (YES, NO, WAIT)
// ==========================================
window.decidirStatus = (status) => {
    if (!tinderSwiper || !tinderSwiper.slides.length) return;
    
    const activeIndex = tinderSwiper.activeIndex;
    const activeSlide = tinderSwiper.slides[activeIndex];
    const id = activeSlide ? activeSlide.dataset.id : null;
    
    if (id) {
        const dados = typeof getData === 'function' ? getData() : {};
        const g = dados.casamento.convidados.find(x => x.id === id);
        
        if (g) { 
            g.status = status; // Salva como 'yes', 'no' ou 'wait'
            if (typeof saveData === 'function') saveData(dados); 
            
            // Animação leve: encolhe e some
            activeSlide.style.transition = 'all 0.3s ease';
            activeSlide.style.transform = 'scale(0.8)';
            activeSlide.style.opacity = '0';
            
            setTimeout(() => {
                tinderSwiper.removeSlide(activeIndex);
                renderListasDeStatus(dados.casamento.convidados);
                
                const pendentes = dados.casamento.convidados.filter(x => x.status === 'pending');
                document.getElementById('counter').innerText = `${pendentes.length} na fila de decisão`;
                
                // Recarrega se estiver acabando
                if (tinderSwiper.slides.length < 5 && pendentes.length > 0) {
                    renderCards();
                } else if (tinderSwiper.slides.length === 0 && pendentes.length === 0) {
                    renderCards();
                }
            }, 300); 
        }
    }
};

// ==========================================
// LISTAS E MUDANÇA DIRETA LÁ EMBAIXO
// ==========================================
function renderListasDeStatus(todosConvidados) {
    const confirmados = todosConvidados.filter(g => g.status === 'yes');
    const recusados = todosConvidados.filter(g => g.status === 'no');
    const emEspera = todosConvidados.filter(g => g.status === 'wait'); // A nova lista!

    document.getElementById('countYes').innerText = confirmados.length;
    document.getElementById('countNo').innerText = recusados.length;
    
    const divWait = document.getElementById('countWait');
    if (divWait) divWait.innerText = emEspera.length;

    // GERADOR DA LISTA (Confirmados e Recusados)
    const gerarHtmlLista = (lista) => {
        if (lista.length === 0) return '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 20px;">Ninguém ainda.</p>';
        return lista.map(g => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 5px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="color: #fff; font-weight: bold; font-size: 0.95rem;">${g.name}</span>
                <button onclick="alterarStatusId('${g.id}', 'pending')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.8rem; text-decoration: underline;">Voltar p/ Fila</button>
            </div>
        `).join('');
    };

    // GERADOR DA LISTA EM ESPERA (Com botões rápidos)
    const gerarHtmlEspera = (lista) => {
        if (lista.length === 0) return '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 20px;">A fila está limpa!</p>';
        return lista.map(g => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 5px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 5px;">
                <span style="color: #fff; font-weight: bold; font-size: 0.95rem; margin-left: 10px;">${g.name}</span>
                <div style="display: flex; gap: 10px; margin-right: 10px;">
                    <button onclick="alterarStatusId('${g.id}', 'no')" style="background: rgba(255, 75, 75, 0.2); border: 1px solid var(--tinder-no); color: var(--tinder-no); border-radius: 5px; padding: 5px 10px; cursor: pointer;">❌</button>
                    <button onclick="alterarStatusId('${g.id}', 'yes')" style="background: rgba(0, 245, 212, 0.2); border: 1px solid var(--tinder-yes); color: var(--tinder-yes); border-radius: 5px; padding: 5px 10px; cursor: pointer;">✅</button>
                </div>
            </div>
        `).join('');
    };

    document.getElementById('listaConfirmados').innerHTML = gerarHtmlLista(confirmados);
    document.getElementById('listaRecusados').innerHTML = gerarHtmlLista(recusados);
    
    const divEspera = document.getElementById('listaEmEspera');
    if (divEspera) divEspera.innerHTML = gerarHtmlEspera(emEspera);
}

// Função que altera a pessoa lá debaixo, sem passar pela carta de novo
window.alterarStatusId = (id, novoStatus) => {
    const dados = typeof getData === 'function' ? getData() : {};
    const g = dados.casamento.convidados.find(x => x.id === id);
    if (g) {
        g.status = novoStatus; 
        if (typeof saveData === 'function') saveData(dados);
        
        // Se voltou a pessoa pra "pending", renderiza as cartas de novo
        if (novoStatus === 'pending') {
            renderCards(); 
        } else {
            // Se só mudou o status final, apenas atualiza as listas de baixo
            renderListasDeStatus(dados.casamento.convidados);
        }
    }
};

// ==========================================
// FUNÇÕES DE CADASTRO E EXCEL
// ==========================================
window.importarExcel = function() {
    const area = document.getElementById('excelPasteArea');
    const texto = area.value.trim();
    if (!texto) return;

    let novosNomes = [];
    const linhas = texto.split(/\r?\n/);
    linhas.forEach(l => {
        const colunas = l.split(/\t|;/);
        colunas.forEach(c => {
            const nome = c.trim();
            if (nome.length > 2) novosNomes.push(nome);
        });
    });
    
    const r = adicionarNomes(novosNomes);
    area.value = '';
    alert(`✅ ${r.novos} adicionados | ⚠️ ${r.velhos} duplicados pulados.`);
};

function adicionarNomes(lista) {
    const dados = typeof getData === 'function' ? getData() : {};
    if (!dados.casamento) dados.casamento = { convidados: [] };
    let n = 0, v = 0;

    lista.forEach(nome => {
        const existe = dados.casamento.convidados.some(g => g.name.toLowerCase() === nome.toLowerCase());
        if (!existe) {
            dados.casamento.convidados.push({ id: 'g-'+Date.now()+Math.random(), name: nome, status: 'pending' });
            n++;
        } else { v++; }
    });

    if (n > 0) { 
        if (typeof saveData === 'function') saveData(dados); 
        renderCards(); 
    }
    return { novos: n, velhos: v };
}
