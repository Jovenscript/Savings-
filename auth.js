// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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

// ==========================================
// 2. LÓGICA DE ALTERNAR TELAS (LOGIN <-> REGISTRO)
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
                window.location.replace("index.html");
            })
            .catch((error) => {
                msgBox.className = 'msg-box error';
                msgBox.innerText = '❌ E-mail ou senha incorretos.';
                console.error(error.code);
            });
    });
}

// ==========================================
// 4. FUNÇÃO DE REGISTRO (CRIAR CONTA)
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
        msgBox.innerText = '⏳ Criando sua conta no Savings...';

        createUserWithEmailAndPassword(auth, email, pass)
            .then(() => {
                window.location.replace("index.html");
            })
            .catch((error) => {
                msgBox.className = 'msg-box error';
                if (error.code === 'auth/email-already-in-use') {
                    msgBox.innerText = '❌ Este e-mail já está cadastrado.';
                } else if (error.code === 'auth/weak-password') {
                    msgBox.innerText = '❌ A senha deve ter pelo menos 6 caracteres.';
                } else {
                    msgBox.innerText = '❌ Erro ao criar conta. Tente novamente.';
                }
                console.error(error.code);
            });
    });
}

// ==========================================
// 5. FUNÇÃO DE SAIR (LOGOUT)
// ==========================================
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            window.location.replace('login.html');
        }).catch((error) => {
            console.error("Erro ao fazer logout", error);
        });
    });
}

// ==========================================
// 6. PROTEÇÃO DE ROTAS (NÃO DEIXA ENTRAR SEM LOGIN)
// ==========================================
onAuthStateChanged(auth, (user) => {
    const isLoginPage = window.location.pathname.includes('login.html');
    
    // Se o usuário NÃO está logado e TENTAR acessar qualquer página que não seja o login
    if (!user && !isLoginPage) {
        window.location.replace('login.html');
    } 
    // Se o usuário JÁ ESTÁ logado e TENTAR acessar a página de login
    else if (user && isLoginPage) {
        window.location.replace('index.html');
    }
});

export { auth };
