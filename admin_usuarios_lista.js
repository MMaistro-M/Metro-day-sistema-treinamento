// Registro de usuários até linkarmos um banco de dados
let usuarios = [
  { nome: "João Silva", email: "joao.silva@email.com", rgm: "1234567", funcao: "aluno", cargo: "Técnico de Manutenção", departamento: "Manutenção" },
  { nome: "Maria Santos", email: "maria.santos@email.com", rgm: "2345678", funcao: "monitor", cargo: "Assistente Operacional", departamento: "Operações" },
  { nome: "Carlos Pereira", email: "carlos.pereira@email.com", rgm: "3456789", funcao: "instrutor", cargo: "Engenheiro de Treinamento", departamento: "Segurança" },
  { nome: "Fernanda Lima", email: "fernanda.lima@email.com", rgm: "4567890", funcao: "administrador", cargo: "Coordenadora de RH", departamento: "Gestão de Pessoas" },
  { nome: "TechTrain Educação Ltda.", email: "contato@techtrain.com.br", rgm: "–", funcao: "empresa_convidada", cargo: "–", departamento: "–" },
  { nome: "Eduardo Almeida", email: "eduardo.convidado@email.com", rgm: "–", funcao: "aluno_convidado", cargo: "-", departamento: "-" }
];

// ====================== FUNÇÃO: RENDERIZAR TABELA ======================
function renderTabelaUsuarios(lista = usuarios) {
  const tbody = document.getElementById("usuariosBody");
  tbody.innerHTML = "";

  lista.forEach((u, index) => {
    const isConvidado = u.funcao === "empresa_convidada" || u.funcao === "aluno_convidado";

    const rgmDisplay = isConvidado ? "–" : u.rgm;
    const cargoDisplay = isConvidado && (!u.cargo || u.cargo === "-") ? "–" : u.cargo;
    const deptoDisplay = isConvidado && (!u.departamento || u.departamento === "-") ? "–" : u.departamento;

    const rgmClass = isConvidado ? "class='vazio'" : "";
    const cargoClass = cargoDisplay === "–" ? "class='vazio'" : "";
    const deptoClass = deptoDisplay === "–" ? "class='vazio'" : "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td ${rgmClass}>${rgmDisplay}</td>
      <td>${u.funcao.replace("_", " ").charAt(0).toUpperCase() + u.funcao.slice(1).replace("_", " ")}</td>
      <td ${cargoClass}>${cargoDisplay}</td>
      <td ${deptoClass}>${deptoDisplay}</td>
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
  document.getElementById("editRGM").value = u.rgm;
  document.getElementById("editFuncao").value = u.funcao;
  document.getElementById("editCargo").value = u.cargo;
  document.getElementById("editDepartamento").value = u.departamento;

  document.getElementById("saveEditBtn").onclick = function() {
    usuarios[index] = {
      nome: document.getElementById("editNome").value,
      email: document.getElementById("editEmail").value,
      rgm: document.getElementById("editRGM").value,
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
  document.getElementById("novoRGM").value = "";
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
  const rgm = document.getElementById("novoRGM").value.trim();
  const funcao = document.getElementById("novaFuncao").value;
  const cargo = document.getElementById("novoCargo").value.trim();
  const departamento = document.getElementById("novoDepartamento").value.trim();

  if (!nome || !email || !funcao) {
    alert("Preencha todos os campos obrigatórios: nome, e-mail e função.");
    return;
  }

  // Para convidados (empresa_convidada e aluno_convidado)
  if (funcao === "empresa_convidada" || funcao === "aluno_convidado") {
    usuarios.push({
      nome,
      email,
      rgm: "–",
      funcao,
      cargo: cargo || "-",
      departamento: departamento || "-"
    });
  } else {
    // Para usuários internos
    if (!rgm) {
      alert("Informe o RGM do usuário interno.");
      return;
    }
    if (!cargo || !departamento) {
      alert("Preencha o cargo e o departamento do usuário interno.");
      return;
    }
    if (usuarios.some(u => u.rgm === rgm && u.funcao !== "empresa_convidada" && u.funcao !== "aluno_convidado")) {
      alert("Já existe um usuário com este RGM.");
      return;
    }
    usuarios.push({ nome, email, rgm, funcao, cargo, departamento });
  }

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

// Desabilita o campo RGM caso for uma empresa convidada
const funcaoSelect = document.getElementById("novaFuncao");
const rgmInput = document.getElementById("novoRGM");
const infoRGM = document.getElementById("infoRGM");

if (funcaoSelect && rgmInput) {
  funcaoSelect.addEventListener("change", () => {
    if (funcaoSelect.value === "empresa_convidada" || funcaoSelect.value === "aluno_convidado") {
      rgmInput.value = "";
      rgmInput.disabled = true;
      if (infoRGM) infoRGM.style.display = "block";
    } else {
      rgmInput.disabled = false;
      if (infoRGM) infoRGM.style.display = "none";
    }
  });
}

// Ajusta obrigatoriedade visual de cargo e departamento
const cargoInput = document.getElementById("novoCargo");
const deptoInput = document.getElementById("novoDepartamento");

if (funcaoSelect && cargoInput && deptoInput) {
  funcaoSelect.addEventListener("change", () => {
    if (funcaoSelect.value === "empresa_convidada") {
      cargoInput.placeholder = "Opcional";
      deptoInput.placeholder = "Opcional";
    } else {
      cargoInput.placeholder = "Digite o cargo...";
      deptoInput.placeholder = "Digite o departamento...";
    }
  });
}

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