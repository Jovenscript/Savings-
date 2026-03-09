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

function renderCards() {
    const wrapper = document.getElementById('tinderWrapper');
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [] };
    
    const pendentes = dados.casamento.convidados.filter(g => g.status === 'pending');
    document.getElementById('counter').innerText = `${pendentes.length} aguardando decisão`;

    wrapper.innerHTML = '';
    if (pendentes.length === 0) {
        wrapper.innerHTML = `<div class="swiper-slide guest-card"><h2>🎉 Fim da Lista!</h2><p>Tudo pronto para o dia 29/08.</p></div>`;
    } else {
        pendentes.forEach(g => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide guest-card';
            slide.dataset.id = g.id;
            slide.innerHTML = `<div class="guest-name">${g.name}</div><p style="color:var(--text-muted)">Vai estar presente?</p>`;
            wrapper.appendChild(slide);
        });
    }

    if (tinderSwiper) tinderSwiper.destroy(true, true);
    tinderSwiper = new Swiper(".tinderSwiper", { effect: "cards", grabCursor: true });
}

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
    const dados = getData();
    if (!dados.casamento) dados.casamento = { convidados: [] };
    let n = 0, v = 0;

    lista.forEach(nome => {
        const existe = dados.casamento.convidados.some(g => g.name.toLowerCase() === nome.toLowerCase());
        if (!existe) {
            dados.casamento.convidados.push({ id: 'g-'+Date.now()+Math.random(), name: nome, status: 'pending' });
            n++;
        } else { v++; }
    });

    if (n > 0) { saveData(dados); renderCards(); }
    return { novos: n, velhos: v };
}

window.decidirStatus = (status) => {
    if (!tinderSwiper || !tinderSwiper.slides.length) return;
    const active = tinderSwiper.slides[tinderSwiper.activeIndex];
    const id = active ? active.dataset.id : null;
    if (id) {
        const dados = getData();
        const g = dados.casamento.convidados.find(x => x.id === id);
        if (g) { g.status = status; saveData(dados); setTimeout(renderCards, 250); }
    }
};
