// transacoes.js
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // SISTEMA DE FILTRO DE MÊS
    // ==========================================
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let dataFiltro = new Date(); 
    dataFiltro.setDate(1);

    const btnPrevMonth = document.getElementById('btnPrevMonthTrans');
    const btnNextMonth = document.getElementById('btnNextMonthTrans');
    const mesAtualTituloTrans = document.getElementById('mesAtualTituloTrans');

    if (btnPrevMonth && btnNextMonth) {
        btnPrevMonth.addEventListener('click', () => {
            dataFiltro.setMonth(dataFiltro.getMonth() - 1);
            renderizarTabela();
        });

        btnNextMonth.addEventListener('click', () => {
            dataFiltro.setMonth(dataFiltro.getMonth() + 1);
            renderizarTabela();
        });
    }

    const tipoManualSelect = document.getElementById('tipoManual');
    if (tipoManualSelect) {
        tipoManualSelect.addEventListener('change', (e) => {
            if (e.target.value === 'receita') e.target.style.color = 'var(--primary-cyan)';
            else e.target.style.color = 'var(--danger-red)';
        });
        tipoManualSelect.dispatchEvent(new Event('change'));
    }

    // ==========================================
    // MÁQUINA 1: LEITURA EM LOTE DA FATURA (INTACTA)
    // ==========================================
    const inputFatura = document.getElementById('uploadFatura');
    const ocrStatus = document.getElementById('ocrStatus');

    if (inputFatura) {
        inputFatura.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            ocrStatus.style.display = 'block';
            ocrStatus.style.color = 'var(--primary-cyan)';
            ocrStatus.innerText = '⏳ Analisando a imagem com IA... Aguarde alguns segundos.';

            Tesseract.recognize(file, 'por', { logger: m => console.log(m) })
            .then(({ data: { text } }) => {
                ocrStatus.innerText = '✅ Leitura concluída! Processando os dados...';
                processarExtratoOCR(text);
                
                inputFatura.value = ''; 
                setTimeout(() => { ocrStatus.style.display = 'none'; }, 4000);
            }).catch(err => {
                console.error(err);
                ocrStatus.style.color = 'var(--danger-red)';
                ocrStatus.innerText = '❌ Ocorreu um erro ao tentar ler a imagem. Tente uma imagem mais nítida.';
                inputFatura.value = '';
            });
        });
    }

    function processarExtratoOCR(textoExtraido) {
        const linhas = textoExtraido.split('\n');
        let transacoesAdicionadas = 0;
        let transacoesDuplicadas = 0;

        const dados = typeof getData === 'function' ? getData() : { contas: [] };
        if (!dados.contas) dados.contas = [];

        const anoAtualFiltro = dataFiltro.getFullYear();
        const mesAtualFiltro = String(dataFiltro.getMonth() + 1).padStart(2, '0');
        const dataDia11 = `${anoAtualFiltro}-${mesAtualFiltro}-11`;

        linhas.forEach(linha => {
            const matches = [...linha.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2})/g)];
            
            if (matches.length > 0) {
                const valorString = matches[matches.length - 1][1];
                const valorNumerico = parseFloat(valorString.replace(/\./g, '').replace(',', '.'));

                let descricao = linha.replace(matches[matches.length - 1][0], '').trim();
                descricao = descricao.replace(/[^a-zA-Z0-9\s]/g, '').trim();
                if (descricao.length < 3) descricao = "Lançamento Cartão";

                if (valorNumerico > 0) {
                    const jaExiste = dados.contas.some(c => 
                        c.dataExata === dataDia11 && 
                        c.valor === valorNumerico && 
                        c.descricao === descricao
                    );

                    if (!jaExiste) {
                        dados.contas.push({
                            id: Date.now() + Math.random(),
                            descricao: descricao,
                            valor: valorNumerico,
                            dataExata: dataDia11,
                            categoria: "💳 Cartão de Crédito",
                            tipo: "despesa"
                        });
                        transacoesAdicionadas++;
                    } else {
                        transacoesDuplicadas++;
                    }
                }
            }
        });

        if (transacoesAdicionadas > 0) {
            if (typeof saveData === 'function') saveData(dados);
            renderizarTabela();
            alert(`✨ Sucesso! ${transacoesAdicionadas} itens extraídos e lançados no dia 11/${mesAtualFiltro}.\n${transacoesDuplicadas > 0 ? `(${transacoesDuplicadas} duplicadas ignoradas).` : ''}`);
        } else {
            alert(`Nenhum valor financeiro válido encontrado na imagem. Verifique se o print está nítido.`);
        }
    }

    // ==========================================
    // MÁQUINA 2: LEITURA DE COMPROVANTE INDIVIDUAL (PARA PREGUIÇOSOS)
    // ==========================================
    const inputComprovante = document.getElementById('uploadComprovante');
    const ocrStatusComprovante = document.getElementById('ocrStatusComprovante');

    if (inputComprovante) {
        inputComprovante.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            ocrStatusComprovante.style.display = 'block';
            ocrStatusComprovante.style.color = 'var(--primary-purple)';
            ocrStatusComprovante.innerText = '✨ IA Lendo seu comprovante para preencher tudo sozinha...';

            Tesseract.recognize(file, 'por', { logger: m => console.log(m) })
            .then(({ data: { text } }) => {
                
                let valorIdentificado = 0;
                let parcelasIdentificadas = 1;
                let descIdentificada = "Compra (Revisar)";
                let categoriaSugerida = "🛍️ Compras Pessoais";

                const linhas = text.split('\n');
                
                linhas.forEach(linha => {
                    const linhaUpper = linha.toUpperCase();

                    // 1. Caçando o maior Valor (Geralmente é o Total pago)
                    const matchValor = linha.match(/(?:R\$)?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
                    if (matchValor) {
                        let tempVal = parseFloat(matchValor[1].replace(/\./g, '').replace(',', '.'));
                        if (tempVal > valorIdentificado) valorIdentificado = tempVal;
                    }

                    // 2. Caçando Parcelas (Ex: "3x", "12X", "em 5x")
                    const matchParcela = linha.match(/(\d+)\s*[xX]/);
                    if (matchParcela) {
                        parcelasIdentificadas = parseInt(matchParcela[1]);
                    }

                    // 3. Caçando o Nome da Loja / Descrição Inteligente
                    if (linhaUpper.includes("MERCADO LIVRE") || linhaUpper.includes("MERCADOLIVRE") || linhaUpper.includes("MERCADO PAGO")) {
                        descIdentificada = "Mercado Livre";
                    } else if (linhaUpper.includes("IFOOD") || linhaUpper.includes("I FOOD")) {
                        descIdentificada = "iFood Delivery";
                        categoriaSugerida = "🍔 Lanches & Delivery";
                    } else if (linhaUpper.includes("UBER") || linhaUpper.includes("99 POP")) {
                        descIdentificada = "Uber";
                        categoriaSugerida = "🚗 Uber / Transporte";
                    } else if (linhaUpper.includes("PIX") || linhaUpper.includes("TRANSFERÊNCIA")) {
                        descIdentificada = "Pagamento via Pix";
                    } else if (linhaUpper.includes("POSTO") || linhaUpper.includes("AUTO POSTO")) {
                        descIdentificada = "Posto de Gasolina";
                        categoriaSugerida = "⛽ Combustível";
                    } else if (linhaUpper.includes("FARMACIA") || linhaUpper.includes("DROGASIL") || linhaUpper.includes("PANVEL")) {
                        descIdentificada = "Farmácia";
                        categoriaSugerida = "💊 Saúde / Farmácia";
                    }
                });

                // Injeta as informações descobertas direto no formulário manual!
                document.getElementById('valorManual').value = valorIdentificado > 0 ? valorIdentificado : '';
                document.getElementById('descManual').value = descIdentificada;
                document.getElementById('parcelasManual').value = parcelasIdentificadas;
                document.getElementById('catManual').value = categoriaSugerida;
                
                // Define a data de hoje para facilitar
                const hoje = new Date().toISOString().split('T')[0];
                document.getElementById('dataManual').value = hoje;

                // Define como despesa
                const tipoSelect = document.getElementById('tipoManual');
                if(tipoSelect) {
                    tipoSelect.value = 'despesa';
                    tipoSelect.dispatchEvent(new Event('change'));
                }

                // Efeito visual de sucesso
                ocrStatusComprovante.style.color = 'var(--primary-cyan)';
                ocrStatusComprovante.innerText = '✅ Pronto! Revise os dados abaixo e clique em "Adicionar".';
                
                setTimeout(() => { ocrStatusComprovante.style.display = 'none'; }, 4000);
                inputComprovante.value = '';
                
            }).catch(err => {
                console.error(err);
                ocrStatusComprovante.style.color = 'var(--danger-red)';
                ocrStatusComprovante.innerText = '❌ Erro na leitura do comprovante. A imagem estava embaçada?';
                inputComprovante.value = '';
            });
        });
    }

    // ==========================================
    // FORMULÁRIO MANUAL E PARCELAMENTOS
    // ==========================================
    const formManual = document.getElementById('formManual');
    const btnSalvarManual = document.getElementById('btnSalvarManual');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const campoParcelas = document.getElementById('parcelasManual');
    let idEmEdicao = null;

    if (formManual) {
        formManual.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const tipoLancamento = document.getElementById('tipoManual').value;
            const dataStr = document.getElementById('dataManual').value;
            const descBase = document.getElementById('descManual').value;
            const valorTotal = parseFloat(document.getElementById('valorManual').value);
            const qtdParcelas = parseInt(campoParcelas.value) || 1;
            const cat = document.getElementById('catManual').value;

            const dados = typeof getData === 'function' ? getData() : { contas: [] };
            if (!dados.contas) dados.contas = [];

            if (idEmEdicao) {
                const index = dados.contas.findIndex(c => c.id === idEmEdicao);
                if (index !== -1) {
                    dados.contas[index] = { 
                        ...dados.contas[index], 
                        dataExata: dataStr, 
                        descricao: descBase, 
                        valor: valorTotal, 
                        categoria: cat,
                        tipo: tipoLancamento
                    };
                }
                idEmEdicao = null;
                campoParcelas.parentElement.style.display = 'block';
                btnSalvarManual.innerText = "Adicionar";
                btnCancelarEdicao.style.display = "none";
            } else {
                const valorPorParcela = valorTotal / qtdParcelas;
                let [ano, mes, dia] = dataStr.split('-').map(Number);

                for (let i = 1; i <= qtdParcelas; i++) {
                    let dataVencimento = new Date(ano, mes - 1 + (i - 1), dia);
                    let anoV = dataVencimento.getFullYear();
                    let mesV = String(dataVencimento.getMonth() + 1).padStart(2, '0');
                    let diaV = String(dataVencimento.getDate()).padStart(2, '0');
                    
                    let dataFinal = `${anoV}-${mesV}-${diaV}`;
                    let descFinal = qtdParcelas > 1 ? `${descBase} (${i}/${qtdParcelas})` : descBase;

                    dados.contas.push({
                        id: Date.now() + Math.random(),
                        descricao: descFinal,
                        valor: valorPorParcela,
                        dataExata: dataFinal,
                        categoria: cat,
                        tipo: tipoLancamento
                    });
                }
            }

            if (typeof saveData === 'function') saveData(dados);
            formManual.reset();
            if(tipoManualSelect) tipoManualSelect.dispatchEvent(new Event('change'));
            renderizarTabela();
        });

        if (btnCancelarEdicao) {
            btnCancelarEdicao.addEventListener('click', () => {
                idEmEdicao = null;
                formManual.reset();
                if(tipoManualSelect) tipoManualSelect.dispatchEvent(new Event('change'));
                campoParcelas.parentElement.style.display = 'block';
                btnSalvarManual.innerText = "Adicionar";
                btnCancelarEdicao.style.display = "none";
            });
        }
    }

    // ==========================================
    // FUNÇÕES DE AÇÃO DA TABELA
    // ==========================================
    window.editarTransacao = function(id) {
        const dados = typeof getData === 'function' ? getData() : { contas: [] };
        const t = (dados.contas || []).find(c => c.id === id);
        
        if (t) {
            document.getElementById('tipoManual').value = t.tipo || "despesa";
            if(tipoManualSelect) tipoManualSelect.dispatchEvent(new Event('change'));
            
            document.getElementById('dataManual').value = t.dataExata;
            document.getElementById('descManual').value = t.descricao;
            document.getElementById('valorManual').value = t.valor;
            document.getElementById('catManual').value = t.categoria || "🏠 Moradia / Contas";
            
            campoParcelas.value = 1;
            campoParcelas.parentElement.style.display = 'none';

            idEmEdicao = id;
            btnSalvarManual.innerText = "💾 Salvar Alteração";
            btnCancelarEdicao.style.display = "block";
            document.getElementById('painelManual').scrollIntoView({ behavior: 'smooth' });
        }
    }

    window.apagarTransacao = function(id) {
        if(confirm("Excluir esta transação?")) {
            const dados = typeof getData === 'function' ? getData() : { contas: [] };
            dados.contas = (dados.contas || []).filter(c => c.id !== id);
            if (typeof saveData === 'function') saveData(dados);
            renderizarTabela();
        }
    }

    function formatarDinheiro(valor) {
        if (typeof formatCurrency === 'function') return formatCurrency(valor);
        return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // ==========================================
    // RENDERIZAR TABELA E SOMAR VALORES
    // ==========================================
    function renderizarTabela() {
        const corpoTabela = document.getElementById('corpoTabela');
        const tabelaRodape = document.getElementById('tabelaRodape');
        if (!corpoTabela) return;

        const anoFiltro = dataFiltro.getFullYear();
        const mesFiltro = dataFiltro.getMonth();
        
        if (mesAtualTituloTrans) {
            mesAtualTituloTrans.innerText = `${mesesNomes[mesFiltro]} ${anoFiltro}`;
        }

        const dados = typeof getData === 'function' ? getData() : { contas: [] };
        const prefixo = `${anoFiltro}-${String(mesFiltro + 1).padStart(2, '0')}`;
        const filtradas = (dados.contas || []).filter(c => c.dataExata && c.dataExata.startsWith(prefixo));

        let somaReceitas = 0;
        let somaDespesas = 0;

        if (filtradas.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">Nenhuma movimentação para este mês.</td></tr>`;
            if (tabelaRodape) tabelaRodape.innerHTML = '';
            return;
        }

        filtradas.sort((a, b) => new Date(b.dataExata) - new Date(a.dataExata));

        corpoTabela.innerHTML = filtradas.map(item => {
            const valorNum = parseFloat(item.valor) || 0;
            const isReceita = item.tipo === 'receita';
            
            if (isReceita) somaReceitas += valorNum;
            else somaDespesas += valorNum;
            
            const dataBr = item.dataExata.split('-').reverse().join('/');
            const valorFormatado = formatarDinheiro(valorNum);
            const corValor = isReceita ? 'var(--primary-cyan)' : 'var(--danger-red)';
            const sinal = isReceita ? '+' : '-';
            const catDefault = isReceita ? '💰 Entrada' : '💸 Saída';
            
            return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 15px;">${dataBr}</td>
                    <td style="padding: 15px; font-weight: bold; color: #fff;">${item.descricao}</td>
                    <td style="padding: 15px;"><span style="background: rgba(255,255,255,0.05); color: #fff; padding: 5px 10px; border-radius: 5px; font-size: 0.85rem;">${item.categoria || catDefault}</span></td>
                    <td style="padding: 15px; color: ${corValor}; font-weight: bold;">${sinal} ${valorFormatado}</td>
                    <td style="padding: 15px;">
                        <button onclick="editarTransacao(${item.id})" style="background:none; border:none; color:var(--primary-cyan); cursor:pointer; margin-right:10px; text-decoration: underline;">Editar</button>
                        <button onclick="apagarTransacao(${item.id})" style="background:none; border:none; color:var(--danger-red); cursor:pointer; text-decoration: underline;">Excluir</button>
                    </td>
                </tr>
            `;
        }).join('');

        if (tabelaRodape) {
            const saldoMes = somaReceitas - somaDespesas;
            const corSaldo = saldoMes >= 0 ? 'var(--primary-cyan)' : 'var(--danger-red)';
            
            tabelaRodape.innerHTML = `
                <tr>
                    <td colspan="3" style="padding: 15px; text-align: right; color: #fff; font-weight: bold; font-size: 0.9rem;">
                        <span style="color: var(--primary-cyan); margin-right: 15px; display: inline-block;">Entradas: ${formatarDinheiro(somaReceitas)}</span>
                        <span style="color: var(--danger-red); margin-right: 15px; display: inline-block;">Saídas: ${formatarDinheiro(somaDespesas)}</span>
                        <br>SALDO DO MÊS:
                    </td>
                    <td colspan="2" style="padding: 15px; color: ${corSaldo}; font-weight: bold; font-size: 1.3rem;">
                        ${formatarDinheiro(saldoMes)}
                    </td>
                </tr>
            `;
        }
    }

    renderizarTabela();
});