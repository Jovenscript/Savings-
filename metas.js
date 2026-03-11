// metas.js

// O "Plano B" (As metas originais da família fundadora, caso não tenha onboarding)
const metasFundadores = [
    {
        id: "casa",
        title: "Casa Luxuosa",
        desc: "Projeto Jaraguá do Sul · Alto Padrão",
        img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 850k", defaultS2: "12%", defaultS3: "2030"
    },
    {
        id: "bmw",
        title: "BMW 320i",
        desc: "M Sport · Portimão Blue",
        img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 320k", defaultS2: "5%", defaultS3: "2028"
    },
    {
        id: "casamento",
        title: "O Casamento",
        desc: "29 de Agosto de 2026 · Marlon & Carol",
        img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 85k", defaultS2: "45%", defaultS3: "Agosto/26"
    }
];

let baseMetas = []; // Agora isso começa vazio e será preenchido dinamicamente
let valoresSalvos = {};
let swiperMetas = null;

function initMetas() {
    const dadosGerais = typeof getData === 'function' ? getData() : {};
    
    // 🧠 MÁGICA: O SISTEMA DESCOBRE QUEM SÃO AS METAS DESSE USUÁRIO
    if (dadosGerais.apresentacaoMetas && dadosGerais.apresentacaoMetas.length > 0) {
        // Se for um novo usuário, pega os sonhos gerados por IA no Onboarding
        baseMetas = dadosGerais.apresentacaoMetas;
    } else {
        // Se for os fundadores e não tem metas configuradas, usa o Plano B
        baseMetas = metasFundadores;
    }

    // Carrega ou inicializa os valores (Alvo, Progresso, Previsão)
    if (dadosGerais.valoresMetas) {
        valoresSalvos = dadosGerais.valoresMetas;
    } else {
        baseMetas.forEach(m => {
            valoresSalvos[m.id] = { s1: m.defaultS1, s2: m.defaultS2, s3: m.defaultS3 };
        });
        dadosGerais.valoresMetas = valoresSalvos;
        if (typeof saveData === 'function') saveData(dadosGerais);
    }

    renderizarCubo();
    iniciarMotor3D();
}

function renderizarCubo() {
    const cuboContainer = document.getElementById('cuboMetas');
    if (!cuboContainer) return;

    let html = '';

    baseMetas.forEach((meta) => {
        // Puxa o valor do banco de dados (ou o padrão se der erro)
        const meusValores = valoresSalvos[meta.id] || { s1: meta.defaultS1 || "R$ 0", s2: meta.defaultS2 || "0%", s3: meta.defaultS3 || "Definir" };

        html += `
            <div class="swiper-slide" style="background-image: url('${meta.img}');">
                <div class="meta-overlay"></div>
                
                <div class="meta-content">
                    <div>
                        <h1 class="meta-title">${meta.title}</h1>
                        <button class="btn-edit-meta" onclick="editarValoresCofre('${meta.id}')" title="Editar Valores">✏️</button>
                    </div>
                    <p class="meta-desc">${meta.desc || 'Gems Elite Dream'}</p>
                    
                    <div class="meta-stats">
                        <div class="stat-box"><span class="stat-number">${meusValores.s1}</span><span class="stat-label">ALVO</span></div>
                        <div class="stat-box"><span class="stat-number">${meusValores.s2}</span><span class="stat-label">PROGRESSO</span></div>
                        <div class="stat-box"><span class="stat-number">${meusValores.s3}</span><span class="stat-label">PREVISÃO</span></div>
                    </div>
                </div>
            </div>
        `;
    });

    cuboContainer.innerHTML = html;
}

function iniciarMotor3D() {
    swiperMetas = new Swiper(".metasSwiper", {
        effect: "cube",
        grabCursor: true,
        cubeEffect: { shadow: true, slideShadows: true, shadowOffset: 40, shadowScale: 0.9 },
        pagination: { el: ".swiper-pagination", clickable: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
        loop: baseMetas.length > 1 // Só faz loop se tiver mais de 1 meta
    });
}

window.editarValoresCofre = function(idDaMeta) {
    if (swiperMetas && swiperMetas.autoplay) swiperMetas.autoplay.stop();
    
    const metaInfo = baseMetas.find(m => m.id === idDaMeta);
    const valoresAtuais = valoresSalvos[idDaMeta] || {s1:'', s2:'', s3:''};

    const novoS1 = prompt(`Cofre: ${metaInfo.title}\n\nQual o valor ALVO? (Ex: R$ 850k):`, valoresAtuais.s1) || valoresAtuais.s1;
    const novoS2 = prompt(`Qual o PROGRESSO atual? (Ex: 12%):`, valoresAtuais.s2) || valoresAtuais.s2;
    const novoS3 = prompt(`Qual a PREVISÃO para realizar? (Ex: 2030):`, valoresAtuais.s3) || valoresAtuais.s3;

    valoresSalvos[idDaMeta] = { s1: novoS1, s2: novoS2, s3: novoS3 };

    const dadosGerais = typeof getData === 'function' ? getData() : {};
    dadosGerais.valoresMetas = valoresSalvos;
    if (typeof saveData === 'function') saveData(dadosGerais);

    const slideAtual = swiperMetas.realIndex;
    swiperMetas.destroy(true, true);
    
    renderizarCubo();
    iniciarMotor3D();
    
    // Pequeno ajuste para evitar erro de loop se tiver poucas metas
    if(baseMetas.length > 1) {
        swiperMetas.slideToLoop(slideAtual, 0, false);
    }
    
    if (typeof dispararConfetes === 'function') dispararConfetes();
};

window.onload = () => {
    initMetas();
};
