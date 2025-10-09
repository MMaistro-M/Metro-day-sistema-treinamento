// Registro de usuários até linkarmos um banco de dados
let usuarios = [
  { nome: "João Silva", email: "joao.silva@email.com", cpf: "123.456.789-00", funcao: "aluno", cargo: "Técnico de Manutenção", departamento: "Manutenção" },
  { nome: "Maria Santos", email: "maria.santos@email.com", cpf: "234.567.890-11", funcao: "monitor", cargo: "Assistente Operacional", departamento: "Operações" },
  { nome: "Carlos Pereira", email: "carlos.pereira@email.com", cpf: "345.678.901-22", funcao: "instrutor", cargo: "Engenheiro de Treinamento", departamento: "Segurança" },
  { nome: "Fernanda Lima", email: "fernanda.lima@email.com", cpf: "456.789.012-33", funcao: "administrador", cargo: "Coordenadora de RH", departamento: "Gestão de Pessoas" }
];

// ====================== FUNÇÃO: RENDERIZAR TABELA ======================
function renderTabelaUsuarios(lista = usuarios) {
  const tbody = document.getElementById("usuariosBody");
  tbody.innerHTML = "";

  lista.forEach((u, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>${u.cpf}</td>
      <td>${u.funcao.charAt(0).toUpperCase() + u.funcao.slice(1)}</td>
      <td>${u.cargo}</td>
      <td>${u.departamento}</td>
      <td>
        <button onclick="editarUsuario(${index})"><i class="fas fa-edit"></i> Editar</button>
        <button class="btn-danger" onclick="excluirUsuario(${index})"><i class="fas fa-trash"></i> Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ====================== FUNÇÃO: FILTRO E BUSCA ======================
function aplicarFiltroUsuarios() {
  const funcaoFiltro = document.getElementById("filtroFuncaoUsuario").value.toLowerCase();
  const termoBusca = document.getElementById("buscaUsuario").value.toLowerCase();

  const filtrados = usuarios.filter(u => {
    const matchFuncao = !funcaoFiltro || u.funcao.toLowerCase() === funcaoFiltro;
    const matchNome = !termoBusca || u.nome.toLowerCase().includes(termoBusca);
    return matchFuncao && matchNome;
  });

  renderTabelaUsuarios(filtrados);
}

// ====================== FUNÇÃO: EDITAR USUÁRIO ======================
function editarUsuario(index) {
  const u = usuarios[index];
  const modal = document.getElementById("editModal");
  modal.style.display = "block";

  document.getElementById("editNome").value = u.nome;
  document.getElementById("editEmail").value = u.email;
  document.getElementById("editCPF").value = u.cpf;
  document.getElementById("editFuncao").value = u.funcao;
  document.getElementById("editCargo").value = u.cargo;
  document.getElementById("editDepartamento").value = u.departamento;

  document.getElementById("saveEditBtn").onclick = function() {
    usuarios[index] = {
      nome: document.getElementById("editNome").value,
      email: document.getElementById("editEmail").value,
      cpf: document.getElementById("editCPF").value,
      funcao: document.getElementById("editFuncao").value,
      cargo: document.getElementById("editCargo").value,
      departamento: document.getElementById("editDepartamento").value
    };
    modal.style.display = "none";
    renderTabelaUsuarios();
  };
}

// ====================== FUNÇÃO: EXCLUIR USUÁRIO ======================
function excluirUsuario(index) {
  if (confirm(`Tem certeza que deseja excluir ${usuarios[index].nome}?`)) {
    usuarios.splice(index, 1);
    renderTabelaUsuarios();
  }
}

// ====================== UTILITÁRIOS ======================
function fecharModal() {
  document.getElementById("editModal").style.display = "none";
}

function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), wait);
  };
}

// ====================== CADASTRO DE NOVO USUÁRIO ======================
function abrirCadastroBox() {
  const box = document.getElementById("cadastroBox");
  box.style.display = "block";

  // limpa os campos sempre que abrir
  document.getElementById("novoNome").value = "";
  document.getElementById("novoEmail").value = "";
  document.getElementById("novoCPF").value = "";
  document.getElementById("novaFuncao").value = "";
  document.getElementById("novoCargo").value = "";
  document.getElementById("novoDepartamento").value = "";
}

function fecharCadastroBox() {
  document.getElementById("cadastroBox").style.display = "none";
}

function salvarNovoCadastro() {
  const nome = document.getElementById("novoNome").value.trim();
  const email = document.getElementById("novoEmail").value.trim();
  const cpf = document.getElementById("novoCPF").value.trim();
  const funcao = document.getElementById("novaFuncao").value;
  const cargo = document.getElementById("novoCargo").value.trim();
  const departamento = document.getElementById("novoDepartamento").value.trim();

  if (!nome || !email || !cpf || !funcao || !cargo || !departamento) {
    alert("Preencha todos os campos antes de salvar.");
    return;
  }

  // Verifica se o CPF já existe
  if (usuarios.some(u => u.cpf === cpf)) {
    alert("Já existe um usuário com este CPF.");
    return;
  }

  usuarios.push({ nome, email, cpf, funcao, cargo, departamento });
  renderTabelaUsuarios();
  fecharCadastroBox();
}

// Eventos do botão
document.addEventListener("DOMContentLoaded", () => {
  const btnAdd = document.getElementById("btnAdicionarUsuario");
  const btnSalvarNovo = document.getElementById("salvarNovoUsuario");

  if (btnAdd) btnAdd.addEventListener("click", abrirCadastroBox);
  if (btnSalvarNovo) btnSalvarNovo.addEventListener("click", salvarNovoCadastro);
});

// ====================== EVENTOS INICIAIS ======================
document.addEventListener("DOMContentLoaded", () => {
  renderTabelaUsuarios();

  const filtroFuncao = document.getElementById("filtroFuncaoUsuario");
  const busca = document.getElementById("buscaUsuario");

  filtroFuncao.addEventListener("change", aplicarFiltroUsuarios);
  busca.addEventListener("input", debounce(aplicarFiltroUsuarios, 200));

  window.addEventListener("click", e => {
    const modal = document.getElementById("editModal");
    if (e.target === modal) modal.style.display = "none";
  });
});