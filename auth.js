// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// 🚀 IMPORTAÇÃO DO BANCO DE DADOS FIRESTORE
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// ==========================================
// 1. CONFIGURAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCkm7cMFVbj-BpCJ8sz9SBnovui0bvfhfM",
  authDomain: "savings-a0221.firebaseapp.com",
  projectId: "savings-a0221",
  storageBucket: "savings-a0221.firebasestorage.app",
  messagingSenderId: "113856053059",
  appId: "1:113856053059:web:8421389a991130582c79f6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🚀 INICIALIZANDO O BANCO DE DADOS E DEIXANDO GLOBAL
const db = getFirestore(app);
window.db = db;

// ==========================================
// 2. LÓGICA DE ALTERNAR TELAS
// ==========================================
const cardLogin = document.getElementById('cardLogin');
const cardRegister = document.getElementById('cardRegister');
const btnShowRegister = document.getElementById('btnShowRegister');
const btnShowLogin = document.getElementById('btnShowLogin');

if (btnShowRegister && btnShowLogin) {
    btnShowRegister.addEventListener('click', () => {
        cardLogin.classList.add('hidden-card');
        cardRegister.classList.remove('hidden-card');
        document.getElementById('loginMsg').style.display = 'none';
    });

    btnShowLogin.addEventListener('click', () => {
        cardRegister.classList.add('hidden-card');
        cardLogin.classList.remove('hidden-card');
        document.getElementById('regMsg').style.display = 'none';
    });
}

// ==========================================
// 3. FUNÇÃO DE LOGIN
// ==========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const msgBox = document.getElementById('loginMsg');

        msgBox.style.display = 'block';
        msgBox.className = 'msg-box success';
        msgBox.innerText = '⏳ Autenticando...';

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                window.location.href = "index.html";
            })
            .catch((error) => {
                msgBox.className = 'msg-box error';
                msgBox.innerText = '❌ E-mail ou senha incorretos.';
                console.error(error.code);
            });
    });
}

// ==========================================
// 4. FUNÇÃO DE REGISTRO
// ==========================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPassword').value;
        const confirmPass = document.getElementById('regConfirmPassword').value;
        const msgBox = document.getElementById('regMsg');

        if (pass !== confirmPass) {
            msgBox.style.display = 'block';
            msgBox.className = 'msg-box error';
            msgBox.innerText = '❌ As senhas não conferem. Tente novamente.';
            return;
        }

        msgBox.style.display = 'block';
        msgBox.className = 'msg-box success';
        msgBox.innerText = '⏳ Criando sua conta...';

        createUserWithEmailAndPassword(auth, email, pass)
            .then(() => {
                window.location.href = "index.html";
            })
            .catch((error) => {
                msgBox.className = 'msg-box error';
                msgBox.innerText = '❌ Erro ao criar conta.';
                console.error(error.code);
            });
    });
}

// ==========================================
// 5. PROTEÇÃO DE ROTAS
// ==========================================
onAuthStateChanged(auth, (user) => {
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!user && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (user && isLoginPage) {
        window.location.href = 'index.html';
    }
});

export { auth };

// ==========================================
// 6. EXPORTAR / IMPORTAR BACKUP GLOBAL
// ==========================================
const btnExportar = document.getElementById('btnExportar');
if (btnExportar) {
    btnExportar.addEventListener('click', () => {
        const todosOsDados = {};
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            todosOsDados[chave] = localStorage.getItem(chave);
        }
        
        if (Object.keys(todosOsDados).length === 0) {
            alert("Você ainda não tem dados cadastrados para exportar!");
            return;
        }

        const jsonString = JSON.stringify(todosOsDados, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const dataHora = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        a.href = url;
        a.download = `GemsElite_BackupCompleto_${dataHora}.json`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

const btnImportar = document.getElementById('btnImportar');
if (btnImportar) {
    btnImportar.addEventListener('change', function(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = function(event) {
            try {
                const conteudo = event.target.result;
                const dadosImportados = JSON.parse(conteudo); 

                if (confirm("Atenção: Isso vai substituir TODOS os dados deste celular pelos do arquivo. Deseja continuar?")) {
                    localStorage.clear();
                    for (const chave in dadosImportados) {
                        localStorage.setItem(chave, dadosImportados[chave]);
                    }
                    alert("Dados sincronizados com sucesso! O sistema vai reiniciar.");
                    window.location.reload(); 
                }
            } catch (erro) {
                alert("Erro: O arquivo enviado não é um backup válido.");
            } finally {
                e.target.value = '';
            }
        };
        leitor.readAsText(arquivo);
    });
}

// ==========================================
// 🚀 7. PONTE DE MIGRAÇÃO PARA A NUVEM
// ==========================================
window.migrarParaNuvem = async function() {
    if (!window.db) {
        alert("Erro: O banco de dados do Firebase ainda não está conectado.");
        return;
    }

    const todosOsDados = {};
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        todosOsDados[chave] = localStorage.getItem(chave);
    }

    if (Object.keys(todosOsDados).length === 0) return;

    try {
        console.log("Iniciando migração dos dados...", todosOsDados);
        const referenciaBanco = doc(window.db, "sistema", "dados_casal");
        await setDoc(referenciaBanco, todosOsDados);
        alert("✅ SUCESSO ABSOLUTO! Todos os seus dados foram migrados para o Firebase com segurança.");
    } catch (erro) {
        console.error("Erro ao enviar dados para a nuvem:", erro);
    }
};
