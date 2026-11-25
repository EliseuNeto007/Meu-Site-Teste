const login = document.getElementById("login");
const cadastro = document.getElementById("cadastro");
const areaCliente = document.getElementById("areaCliente");

const mensagem = document.getElementById("mensagem");

// Transformar senha em hash
async function criptografarSenha(senha) {
    const dados = new TextEncoder().encode(senha);
    const hash = await crypto.subtle.digest("SHA-256", dados);

    return Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// Buscar usuários cadastrados
function buscarUsuarios() {
    return JSON.parse(localStorage.getItem("usuarios")) || [];
}

// Mostrar mensagens
function mostrarMensagem(texto, sucesso = false) {
    mensagem.textContent = texto;
    mensagem.style.color = sucesso ? "green" : "red";
}

// Abrir cadastro
document.getElementById("irCadastro").onclick = function(e) {
    e.preventDefault();

    login.classList.add("oculto");
    cadastro.classList.remove("oculto");
    mensagem.textContent = "";
};

// Voltar para login
document.getElementById("irLogin").onclick = function(e) {
    e.preventDefault();

    cadastro.classList.add("oculto");
    login.classList.remove("oculto");
    mensagem.textContent = "";
};

// CADASTRO
document.getElementById("formCadastro").onsubmit = async function(e) {
    e.preventDefault();

    const nome = document.getElementById("nomeCadastro").value.trim();
    const email = document.getElementById("emailCadastro").value.trim().toLowerCase();
    const senha = document.getElementById("senhaCadastro").value;
    const confirmar = document.getElementById("confirmarSenha").value;

    if (senha !== confirmar) {
        mostrarMensagem("As senhas não são iguais!");
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem("A senha precisa ter pelo menos 6 caracteres!");
        return;
    }

    const usuarios = buscarUsuarios();

    const existe = usuarios.some(usuario => usuario.email === email);

    if (existe) {
        mostrarMensagem("Este e-mail já está cadastrado!");
        return;
    }

    const senhaHash = await criptografarSenha(senha);

    usuarios.push({
        nome: nome,
        email: email,
        senha: senhaHash
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    mostrarMensagem("Cadastro realizado com sucesso!", true);

    document.getElementById("formCadastro").reset();

    cadastro.classList.add("oculto");
    login.classList.remove("oculto");
};

// LOGIN
document.getElementById("formLogin").onsubmit = async function(e) {
    e.preventDefault();

    const email = document.getElementById("emailLogin").value.trim().toLowerCase();
    const senha = document.getElementById("senhaLogin").value;

    const usuarios = buscarUsuarios();

    const senhaHash = await criptografarSenha(senha);

    const usuario = usuarios.find(u =>
        u.email === email && u.senha === senhaHash
    );

    if (!usuario) {
        mostrarMensagem("E-mail ou senha incorretos!");
        return;
    }

    sessionStorage.setItem("usuarioLogado", usuario.email);

    mostrarAreaCliente(usuario);
};

// MOSTRAR ÁREA DO CLIENTE
function mostrarAreaCliente(usuario) {
    login.classList.add("oculto");
    cadastro.classList.add("oculto");
    areaCliente.classList.remove("oculto");

    document.getElementById("mensagemCliente").textContent =
        "Olá, " + usuario.nome + "!";

    mensagem.textContent = "";
}

// SAIR DA CONTA
document.getElementById("sair").onclick = function() {
    sessionStorage.removeItem("usuarioLogado");

    areaCliente.classList.add("oculto");
    login.classList.remove("oculto");

    document.getElementById("formLogin").reset();

    mostrarMensagem("Você saiu da sua conta.", true);
};

// MANTER LOGIN NA SESSÃO
const emailLogado = sessionStorage.getItem("usuarioLogado");

if (emailLogado) {
    const usuario = buscarUsuarios().find(u => u.email === emailLogado);

    if (usuario) {
        mostrarAreaCliente(usuario);
    } else {
        sessionStorage.removeItem("usuarioLogado");
    }
}