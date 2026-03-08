// js/app.js

// ==========================================
// 1. BANCO DE DADOS LOCAL
// ==========================================
function getData() {
    return JSON.parse(localStorage.getItem('gemsEliteData')) || {};
}

function saveData(data) {
    localStorage.setItem('gemsEliteData', JSON.stringify(data));
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ==========================================
// 2. SISTEMA DE BACKUP E SYNC (MARLON & CAROL)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // FUNÇÃO EXPORTAR
    const btnExportar = document.getElementById('btnExportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', () => {
            const dados = localStorage.getItem('gemsEliteData'); 
            
            if (!dados || dados === '{}') {
                alert("Você ainda não tem dados cadastrados para exportar.");
                return;
            }

            const blob = new Blob([dados], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            const dataHoje = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `GemsElite_Backup_${dataHoje}.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert("Backup baixado com sucesso! Envie este arquivo para o celular do Marlon.");
        });
    }

    // FUNÇÃO IMPORTAR
    const btnImportar = document.getElementById('btnImportar');
    if (btnImportar) {
        btnImportar.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const leitor = new FileReader();
            leitor.onload = (event) => {
                try {
                    const conteudo = event.target.result;
                    JSON.parse(conteudo); // Testa se o arquivo é válido

                    if (confirm("⚠️ ATENÇÃO: Isso vai apagar os dados atuais DESTE celular e substituir pelos do arquivo. Continuar?")) {
                        localStorage.setItem('gemsEliteData', conteudo);
                        alert("Dados importados com sucesso! O sistema vai reiniciar.");
                        window.location.reload(); 
                    }
                } catch (erro) {
                    alert("Erro: O arquivo selecionado não é um backup válido.");
                }
            };
            leitor.readAsText(file);
            e.target.value = ''; // Limpa o input
        });
    }
});