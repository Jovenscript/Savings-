// Função para Exportar (Marlon gera o arquivo e manda no Whats)
document.getElementById('btnExportar').addEventListener('click', () => {
    // Pega os dados do LocalStorage (ajuste o nome se o seu for diferente de 'savings_data')
    const dados = localStorage.getItem('savings_data'); 
    
    if (!dados || dados === '{}') {
        alert("Você ainda não tem dados cadastrados para exportar!");
        return;
    }

    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const dataHora = new Date().toLocaleDateString().replace(/\//g, '-');
    a.href = url;
    a.download = `GemsElite_Backup_${dataHora}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Limpeza
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert("Pronto! O arquivo foi baixado. Agora envie este arquivo para a Carol pelo WhatsApp.");
});

// Função para Importar (Carol recebe o arquivo e carrega no app dela)
document.getElementById('btnImportar').addEventListener('change', function(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(event) {
        try {
            const conteudo = event.target.result;
            
            // Valida se o arquivo é um JSON válido
            JSON.parse(conteudo); 

            if (confirm("Atenção: Isso vai substituir TODOS os dados deste celular pelos do arquivo. Deseja continuar?")) {
                localStorage.setItem('savings_data', conteudo);
                alert("Dados sincronizados com sucesso! O sistema vai reiniciar.");
                window.location.reload(); // Recarrega para mostrar o novo patrimônio
            }
        } catch (erro) {
            alert("Erro: O arquivo enviado não é um backup válido do Gems Elite.");
        }
    };
    leitor.readAsText(arquivo);
});