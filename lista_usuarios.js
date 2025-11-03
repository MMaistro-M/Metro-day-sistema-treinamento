let usuarios = [];

// Função para carregar usuários do backend
async function carregarUsuarios() {
  try {
    const res = await fetch("http://localhost:3000/usuarios")
    if (!res.ok) {
      throw new Error(`Erro HTTP: ${res.status}`)
    }
    usuarios = await res.json()
    renderTabelaUsuarios()
  } catch (error) {
    console.error("Erro ao carregar usuários:", error)
    alert("Erro ao carregar usuários. Verifique se o servidor está rodando.")
  }
}

// ====================== FUNÇÃO: RENDERIZAR TABELA ======================
function renderTabelaUsuarios() {
  const tbody = document.getElementById("usuariosBody");
  tbody.innerHTML = "";

  usuarios.forEach((usuario, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${usuario.nome}</td>
      <td>${usuario.email}</td>
      <td>${usuario.rgm}</td>
      <td>${formatarFuncao(usuario.funcao)}</td>
      <td>${usuario.cargo}</td>
      <td>${usuario.departamento}</td>
      <td>
        <button class="btn btn-warning btn-sm me-2" onclick="abrirModalEdicao(${index})">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn btn-danger btn-sm" onclick="excluirUsuario(${index})">
          <i class="fas fa-trash"></i> Excluir
        </button>
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
async function salvarEdicaoUsuario() {
  const id = document.getElementById("editId").value;
  const nome = document.getElementById("editNome").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const rgm = document.getElementById("editRGM").value.trim();
  const funcao = document.getElementById("editFuncao").value;
  const cargo = document.getElementById("editCargo").value.trim();
  const departamento = document.getElementById("editDepartamento").value.trim();

  const isConvidado = funcao === "empresa_convidada" || funcao === "aluno_convidado";

  if (!nome || !email || !funcao) {
    alert("Preencha os campos obrigatórios.");
    return;
  }

  const usuarioAtualizado = {
    nome,
    email,
    funcao,
    rgm: isConvidado ? "–" : rgm,
    cargo: cargo || "-",
    departamento: departamento || "-"
  };

  try {
    const res = await fetch(`http://localhost:3000/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioAtualizado)
    });

    if (!res.ok) {
      alert("Erro ao salvar edição.");
      return;
    }

    usuarios = await res.json();
    renderTabelaUsuarios();
    fecharModalEdicao();
  } catch (e) {
    console.error("Erro ao editar:", e);
    alert("Erro ao salvar as alterações.");
  }
}

function aplicarLogicaCamposEdicao(funcao) {
  const rgmInput = document.getElementById("editRGM");
  const infoRGM = document.getElementById("infoRGMEdit");
  
  if (funcao === "empresa_convidada" || funcao === "aluno_convidado") {
    rgmInput.value = "–";
    rgmInput.disabled = true;
    if (infoRGM) infoRGM.style.display = "block";
  } else {
    rgmInput.disabled = false;
    if (infoRGM) infoRGM.style.display = "none";
  }
}

function fecharModalEdicao() {
  document.getElementById("editModal").style.display = "none";
}

// ====================== FUNÇÃO: EXCLUIR USUÁRIO ======================
async function excluirUsuario(index) {
  const usuario = usuarios[index];
  if (!confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) return;

  try {
    const res = await fetch(`http://localhost:3000/usuarios/${usuario._id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      alert("Erro ao excluir usuário.");
      return;
    }

    usuarios = await res.json();
    renderTabelaUsuarios();
  } catch (e) {
    console.error("Erro ao excluir:", e);
    alert("Não foi possível excluir o usuário.");
  }
}

// ====================== UTILITÁRIOS ======================
function fecharModal() {
  document.getElementById("editModal").style.display = "none";
}

function abrirModalEdicao(index) {
  const usuario = usuarios[index];
  document.getElementById("editId").value = usuario._id;
  document.getElementById("editNome").value = usuario.nome;
  document.getElementById("editEmail").value = usuario.email;
  document.getElementById("editRGM").value = usuario.rgm;
  document.getElementById("editFuncao").value = usuario.funcao;
  document.getElementById("editCargo").value = usuario.cargo;
  document.getElementById("editDepartamento").value = usuario.departamento;

  document.getElementById("editModal").style.display = "block";
  aplicarLogicaCamposEdicao(usuario.funcao);
}

function formatarFuncao(funcao) {
  const formatacoes = {
    'administrador': 'Administrador',
    'instrutor': 'Instrutor', 
    'empresa_convidada': 'Empresa Convidada',
    'monitor': 'Monitor',
    'aluno': 'Aluno',
    'aluno_convidado': 'Aluno Convidado'
  };
  return formatacoes[funcao] || funcao;
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

async function salvarNovoCadastro() {
  const nome = document.getElementById("novoNome")?.value.trim();
  const email = document.getElementById("novoEmail")?.value.trim();
  const rgmInput = document.getElementById("novoRGM");
  const rgm = rgmInput?.value.trim();
  const funcao = document.getElementById("novaFuncao")?.value;
  const cargo = document.getElementById("novoCargo")?.value.trim();
  const departamento = document.getElementById("novoDepartamento")?.value.trim();

  const isConvidado = funcao === "empresa_convidada" || funcao === "aluno_convidado";

  // Validação obrigatória
  if (!nome || !email || !funcao) {
    alert("Preencha nome, e-mail e função.");
    return;
  }

  if (!isConvidado && (!rgm || !cargo || !departamento)) {
    alert("Preencha RGM, cargo e departamento para usuários internos.");
    return;
  }

  // Verifica RGM duplicado 
  if (!isConvidado && usuarios.some(u => u.rgm === rgm)) {
    alert("Já existe um usuário com esse RGM.");
    return;
  }

  const novoUsuario = {
    nome,
    email,
    funcao,
    rgm: isConvidado ? "–" : rgm,
    cargo: cargo || "-",
    departamento: departamento || "-"
  };

  try {
    const res = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario)
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Erro no backend:", msg);
      alert("Erro ao cadastrar usuário: " + msg);
      return;
    }

    usuarios = await res.json();
    renderTabelaUsuarios();
    fecharCadastroBox();
  } catch (e) {
    console.error("Erro:", e);
    alert("Não foi possível comunicar com o servidor.");
  }
}

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
    if (funcaoSelect.value === "empresa_convidada" || funcaoSelect.value === "aluno_convidado") {
      cargoInput.placeholder = "Opcional";
      deptoInput.placeholder = "Opcional";
    } else {
      cargoInput.placeholder = "Digite o cargo...";
      deptoInput.placeholder = "Digite o departamento...";
    }
  });
}

// ====================== INICIALIZAÇÃO ======================
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuarios();

  // Botões principais
  const btnAdd = document.getElementById("btnAdicionarUsuario");
  const btnSalvarNovo = document.getElementById("salvarNovoUsuario");
  const filtroFuncao = document.getElementById("filtroFuncaoUsuario");
  const busca = document.getElementById("buscaUsuario");
  const btnSalvarEdicao = document.getElementById("salvarEdicaoUsuario");
  const editFuncao = document.getElementById("editFuncao");

  if (btnAdd) btnAdd.addEventListener("click", abrirCadastroBox);
  if (btnSalvarNovo) btnSalvarNovo.addEventListener("click", salvarNovoCadastro);
  if (filtroFuncao) filtroFuncao.addEventListener("change", aplicarFiltroUsuarios);
  if (busca) busca.addEventListener("input", debounce(aplicarFiltroUsuarios, 200));
  if (btnSalvarEdicao) {
    btnSalvarEdicao.addEventListener("click", salvarEdicaoUsuario);
  }
  if (editFuncao) {
    editFuncao.addEventListener("change", (e) => {
      aplicarLogicaCamposEdicao(e.target.value);
    });
  }

  // Fecha modal ao clicar fora
  window.addEventListener("click", e => {
    const modal = document.getElementById("editModal");
    if (e.target === modal) modal.style.display = "none";
  });
});