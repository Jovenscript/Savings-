// metas.js

// As imagens e textos padrões TRAVADOS (Design imutável)
const baseMetas = [
    {
        id: "casa",
        title: "Casa Luxuosa",
        desc: "Projeto Jaraguá do Sul · Alto Padrão",
        // Nova foto de mansão com piscina
        img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 850k", defaultS2: "12%", defaultS3: "2030"
    },
    {
        id: "bmw",
        title: "BMW 320i",
        desc: "M Sport · Portimão Blue",
        // Nova foto agressiva da BMW
        img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 320k", defaultS2: "5%", defaultS3: "2028"
    },
    {
        id: "casamento",
        title: "O Casamento",
        desc: "29 de Agosto de 2026 · Marlon & Carol",
        // NOVA IMAGEM: Altar de casamento dos sonhos com luzes quentes
        img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80",
        defaultS1: "R$ 85k", defaultS2: "45%", defaultS3: "Agosto/26"
    }
];

let valoresSalvos = {};
let swiperMetas = null;

function initMetas() {
    // 1. Tenta carregar os valores numéricos salvos na nuvem (app.js)
    const dadosGerais = typeof getData === 'function' ? getData() : {};
    
    if (dadosGerais.valoresMetas) {
        valoresSalvos = dadosGerais.valoresMetas;
    } else {
        // Se for a primeira vez, salva os valores padrão no banco
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
        const meusValores = valoresSalvos[meta.id] || { s1: meta.defaultS1, s2: meta.defaultS2, s3: meta.defaultS3 };

        html += `
            <div class="swiper-slide" style="background-image: url('${meta.img}');">
                <div class="meta-overlay"></div>
                
                <div class="meta-content">
                    <div>
                        <h1 class="meta-title">${meta.title}</h1>
                        <button class="btn-edit-meta" onclick="editarValoresCofre('${meta.id}')" title="Editar Valores">✏️</button>
                    </div>
                    <p class="meta-desc">${meta.desc}</p>
                    
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
    // Liga o Swiper em modo Cubo com Autoplay de 5 segundos
    swiperMetas = new Swiper(".metasSwiper", {
        effect: "cube",
        grabCursor: true,
        cubeEffect: {
            shadow: true,
            slideShadows: true,
            shadowOffset: 40,
            shadowScale: 0.9,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false, // Continua rodando mesmo se você arrastar com o dedo
        },
        loop: true // Quando chega no Casamento, volta pra Casa
    });
}

// ==========================================
// FUNÇÃO DE EDIÇÃO TRAVADA (Só altera os números)
// ==========================================
window.editarValoresCofre = function(idDaMeta) {
    // Pausa o carrossel para não girar enquanto você digita
    if (swiperMetas && swiperMetas.autoplay) swiperMetas.autoplay.stop();
    
    // Puxa o nome da meta para a pessoa saber o que está editando
    const metaInfo = baseMetas.find(m => m.id === idDaMeta);
    const valoresAtuais = valoresSalvos[idDaMeta];

    // Faz as perguntas SÓ DOS NÚMEROS
    const novoS1 = prompt(`Cofre: ${metaInfo.title}\n\nQual o valor ALVO? (Ex: R$ 850k):`, valoresAtuais.s1) || valoresAtuais.s1;
    const novoS2 = prompt(`Qual o PROGRESSO atual? (Ex: 12%):`, valoresAtuais.s2) || valoresAtuais.s2;
    const novoS3 = prompt(`Qual a PREVISÃO para realizar? (Ex: 2030):`, valoresAtuais.s3) || valoresAtuais.s3;

    // Atualiza os valores na memória
    valoresSalvos[idDaMeta] = {
        s1: novoS1,
        s2: novoS2,
        s3: novoS3
    };

    // Salva no banco de dados geral para sincronizar os celulares
    const dadosGerais = typeof getData === 'function' ? getData() : {};
    dadosGerais.valoresMetas = valoresSalvos;
    if (typeof saveData === 'function') saveData(dadosGerais);

    // Salva o índice atual, destrói o cubo, renderiza de novo e liga na mesma página
    const slideAtual = swiperMetas.realIndex;
    swiperMetas.destroy(true, true);
    
    renderizarCubo();
    iniciarMotor3D();
    swiperMetas.slideToLoop(slideAtual, 0, false);
    
    // Dispara o efeito de comemoração global! 🎉
    if (typeof dispararConfetes === 'function') {
        dispararConfetes();
    }
};

// Inicializa tudo quando o arquivo carregar
window.onload = () => {
    initMetas();
};
