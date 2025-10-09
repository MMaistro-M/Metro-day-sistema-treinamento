// util: debounce
function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), wait);
  };
}

// Alternar páginas (mantendo estado e acessibilidade)
function setAriaForPages() {
  document.querySelectorAll('.page').forEach(p => {
    p.setAttribute('aria-hidden', p.classList.contains('active') ? 'false' : 'true');
  });
}

function showPage(pageId) {
    // Oculta todas as páginas
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    // Mostra a página solicitada se existir
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        setAriaForPages();
        sessionStorage.setItem('activePage', pageId);
        // foco no primeiro campo de formulário, se houver
        const firstInput = target.querySelector('input, select, textarea, button');
        if (firstInput) firstInput.focus({preventScroll:true});
        // rola para o topo de forma suave
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Inicializa registro de presença se for a página adminPresenca
        if (pageId === 'adminPresenca') {
            inicializarPaginaPresenca();
        }
    } else {
        console.warn(`Página "${pageId}" não encontrada.`);
        const current = document.querySelector('.page.active') || document.getElementById('login');
        if (current) current.classList.add('active');
        setAriaForPages();
    }
}

// Selecionar tipo de usuário no login (mantém estado)
function selectUserType(type) {
    ['aluno','instrutor','monitor','admin'].forEach(t => {
      const el = document.getElementById(t + 'Type');
      if (el) el.classList.remove('active');
    });
    const chosen = document.getElementById(type + 'Type');
    if (chosen) {
      chosen.classList.add('active');
      sessionStorage.setItem('userType', chosen.id);
    }
}

// Login "normal"
const loginFormEl = document.getElementById('loginForm');
if (loginFormEl) {
    loginFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        const userTypeEl = document.querySelector('.user-type.active');
        const userType = userTypeEl ? userTypeEl.id : 'alunoType';
        
        if (userType === 'alunoType') {
            alert('Login de aluno realizado com sucesso!');
            showPage('alunoDashboard');
        } else if (userType === 'instrutorType') {
            alert('Login de instrutor realizado com sucesso!');
            showPage('adminPresenca');
        } else if (userType === 'monitorType') {
            alert('Login de monitor realizado com sucesso!');
            showPage('cursos');
        } else {
            showPage('adminLogin');
        }
    });
}

// Login admin
const adminLoginFormEl = document.getElementById('adminLoginForm');
if (adminLoginFormEl) {
    adminLoginFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        const user = document.getElementById('adminUser').value;
        const password = document.getElementById('adminPassword').value;
        if (user === 'admin' && password === 'admin123') {
            showPage('adminDashboard');
        } else {
            alert('Usuário ou senha incorretos!');
        }
    });
}

// Registro de presença (mock)
function salvarPresenca() {
    alert('Lista de presença salva com sucesso!');
}

// Toggle de detalhes do curso (fecha os outros)
function verDetalhes(curso) {
    const targetId = 'detalhes-' + curso;
    document.querySelectorAll('.curso-detalhes').forEach(detalhe => {
        if (detalhe.id !== targetId) {
          detalhe.style.display = 'none';
          detalhe.setAttribute('aria-hidden','true');
        }
    });
    const bloco = document.getElementById(targetId);
    if (bloco) {
        const willShow = bloco.style.display !== 'block';
        bloco.style.display = willShow ? 'block' : 'none';
        bloco.setAttribute('aria-hidden', willShow ? 'false' : 'true');
        if (willShow) bloco.scrollIntoView({behavior:'smooth', block:'start'});
    }
}

// Inscrição (mock)
function inscreverCurso(curso) {
    alert(`Inscrição no curso "${curso}" realizada com sucesso!`);
}

// Assinatura: abre pad
document.querySelectorAll('.btn-assinar').forEach(btn => {
    btn.addEventListener('click', function() {
        const cont = document.querySelector('.signature-pad-container');
        if (cont) cont.style.display = 'block';
        initSignaturePad(); // garante que listeners estejam setados
    });
});

// Canvas assinatura simples (mouse e touch)
let sig = { drawing:false, ctx:null, canvas:null, last:{x:0,y:0} };
function initSignaturePad() {
  if (sig.canvas) return; // já inicializado
  const canvas = document.getElementById('signature-pad');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  sig = { drawing:false, ctx, canvas, last:{x:0,y:0} };
  
  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  
  const start = (e) => {
    sig.drawing = true;
    sig.last = getPos(e);
  };
  const move = (e) => {
    if (!sig.drawing) return;
    const p = getPos(e);
    sig.ctx.beginPath();
    sig.ctx.moveTo(sig.last.x, sig.last.y);
    sig.ctx.lineTo(p.x, p.y);
    sig.ctx.stroke();
    sig.last = p;
    e.preventDefault();
  };
  const end = () => sig.drawing = false;
  
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, {passive:false});
  canvas.addEventListener('touchmove', move, {passive:false});
  canvas.addEventListener('touchend', end);
}

function limparAssinatura() {
    const canvas = document.getElementById('signature-pad');
    if (!canvas) return alert('Nada para limpar.');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function salvarAssinatura() {
    alert('Assinatura salva com sucesso!');
    const cont = document.querySelector('.signature-pad-container');
    if (cont) cont.style.display = 'none';
}

function cancelarAssinatura() {
    const cont = document.querySelector('.signature-pad-container');
    if (cont) cont.style.display = 'none';
}

//Filtros & Busca ---teste
const filterCargoEl = document.getElementById('filterCargo');
const filterStatusEl = document.getElementById('filterStatus');
const searchCourseEl = document.getElementById('searchCourse');

function applyCourseFilters() {
  const cargo = (filterCargoEl?.value || '').toLowerCase();
  const status = (filterStatusEl?.value || '').toLowerCase();
  const term = (searchCourseEl?.value || '').toLowerCase().trim();
  const cards = document.querySelectorAll('#cursos .card');

  cards.forEach(card => {
    const title = (card.dataset.title || '').toLowerCase();
    const cargos = (card.dataset.cargo || '').toLowerCase().split(',');
    const st = (card.dataset.status || '').toLowerCase();

    const okCargo = !cargo || cargos.includes(cargo);
    const okStatus = !status || st === status;
    const okTerm = !term || title.includes(term);

    card.style.display = (okCargo && okStatus && okTerm) ? '' : 'none';
  });
}

if (filterCargoEl) filterCargoEl.addEventListener('change', applyCourseFilters);
if (filterStatusEl) filterStatusEl.addEventListener('change', applyCourseFilters);
if (searchCourseEl) searchCourseEl.addEventListener('input', debounce(applyCourseFilters, 200));

// Estado inicial: restaura página e tipo de usuário 
(function initState(){
  // restaura tipo de usuário
  const savedType = sessionStorage.getItem('userType');
  if (savedType) {
    ['aluno','instrutor','monitor','admin'].forEach(t => {
      const el = document.getElementById(t + 'Type');
      if (el) el.classList.remove('active');
    });
    const el = document.getElementById(savedType);
    if (el) el.classList.add('active');
  }
  // restaura página ativa
  const savedPage = sessionStorage.getItem('activePage');
  showPage(savedPage || 'login');
  // aplica filtros default
  applyCourseFilters();
})();

// Mock de alunos ATUALIZADO
let alunos = [
    { matricula: "123456", nome: "João Silva", cpf: "123.456.789-00", presencas: 3, faltas: 0, totalAulas: 5 },
    { matricula: "234567", nome: "Maria Santos", cpf: "234.567.890-11", presencas: 2, faltas: 1, totalAulas: 5 },
    { matricula: "345678", nome: "Pedro Costa", cpf: "345.678.901-22", presencas: 4, faltas: 0, totalAulas: 5 }
];

// SISTEMA DE REGISTRO DE PRESENÇA - NOVAS FUNÇÕES

let registroPresenca = {
    turma: null,
    data: null,
    alunos: []
};

// Inicializar página de presença
function inicializarPaginaPresenca() {
    const dataAula = document.getElementById('dataAula');
    if (dataAula && !dataAula.value) {
        const hoje = new Date().toISOString().split('T')[0];
        dataAula.value = hoje;
    }
}

// Inicializar registro de presença quando uma turma é selecionada
function inicializarRegistroPresenca() {
    const turmaSelect = document.getElementById('selectTurma');
    const dataAula = document.getElementById('dataAula');
    
    if (turmaSelect.value && dataAula.value) {
        registroPresenca.turma = turmaSelect.value;
        registroPresenca.data = dataAula.value;
        
        // Carregar alunos da turma selecionada
        carregarAlunosTurma(turmaSelect.value);
    } else {
        alert('Selecione uma turma e data para continuar.');
    }
}

// Carregar alunos da turma selecionada
function carregarAlunosTurma(turmaId) {
    // Limpar lista atual
    const tbody = document.querySelector('#adminPresenca table tbody');
    tbody.innerHTML = '';
    
    // Adicionar alunos à tabela
    alunos.forEach((aluno, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluno.matricula}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.cpf}</td>
            <td><input type="checkbox" class="checkbox-presenca" data-cpf="${aluno.cpf}" ${aluno.presencas > index ? 'checked' : ''}></td>
            <td><button class="btn-assinar" data-cpf="${aluno.cpf}"><i class="fas fa-signature"></i> Assinar</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    // Adicionar event listeners para os botões de assinar
    document.querySelectorAll('.btn-assinar').forEach(btn => {
        btn.addEventListener('click', function() {
            const cpf = this.getAttribute('data-cpf');
            abrirPadAssinatura(cpf);
        });
    });
    
    // Adicionar event listeners para os checkboxes
    document.querySelectorAll('.checkbox-presenca').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const cpf = this.getAttribute('data-cpf');
            atualizarPresencaAluno(cpf, this.checked);
        });
    });
}

// Atualizar presença do aluno
function atualizarPresencaAluno(cpf, presente) {
    const alunoIndex = alunos.findIndex(a => a.cpf === cpf);
    if (alunoIndex !== -1) {
        // Em uma implementação real, isso seria mais complexo
        // Aqui estamos apenas simulando a atualização
        console.log(`Aluno ${alunos[alunoIndex].nome}: ${presente ? 'Presente' : 'Falta'}`);
    }
}

// Abrir pad de assinatura para um aluno específico
function abrirPadAssinatura(cpf) {
    const aluno = alunos.find(a => a.cpf === cpf);
    if (aluno) {
        document.getElementById('alunoAssinaturaNome').textContent = aluno.nome;
        document.getElementById('alunoAssinaturaCPF').textContent = aluno.cpf;
        document.querySelector('.signature-pad-container').setAttribute('data-cpf', cpf);
        document.querySelector('.signature-pad-container').style.display = 'block';
        initSignaturePad();
    }
}

// Salvar assinatura ATUALIZADA
function salvarAssinatura() {
    const cpf = document.querySelector('.signature-pad-container').getAttribute('data-cpf');
    const aluno = alunos.find(a => a.cpf === cpf);
    
    if (aluno) {
        // Verificar se a presença foi marcada
        const checkbox = document.querySelector(`.checkbox-presenca[data-cpf="${cpf}"]`);
        
        if (checkbox && checkbox.checked) {
            // Registrar presença com assinatura
            alert(`Assinatura salva com sucesso para ${aluno.nome}! Presença registrada.`);
            
            // Atualizar estatísticas
            const alunoIndex = alunos.findIndex(a => a.cpf === cpf);
            if (alunoIndex !== -1) {
                alunos[alunoIndex].presencas++;
                if (alunos[alunoIndex].presencas > alunos[alunoIndex].totalAulas) {
                    alunos[alunoIndex].presencas = alunos[alunoIndex].totalAulas;
                }
            }
            
            // Atualizar interface
            atualizarEstatisticasAluno(cpf);
        } else {
            alert('Para registrar a assinatura, é necessário marcar a presença do aluno.');
            return;
        }
    }
    
    // Fechar o pad de assinatura
    document.querySelector('.signature-pad-container').style.display = 'none';
    limparAssinatura();
}

// Atualizar estatísticas do aluno na interface
function atualizarEstatisticasAluno(cpf) {
    const aluno = alunos.find(a => a.cpf === cpf);
    if (aluno) {
        console.log(`Aluno ${aluno.nome}: ${aluno.presencas} presenças, ${aluno.faltas} faltas de ${aluno.totalAulas} aulas`);
    }
}

// Gerar relatório de presença
function gerarRelatorioPresenca() {
    const turmaSelect = document.getElementById('selectTurma');
    const turma = turmaSelect.options[turmaSelect.selectedIndex].text;
    
    let relatorioHTML = `
        <div class="relatorio-presenca">
            <h3><i class="fas fa-chart-pie"></i> Relatório de Presença - ${turma}</h3>
            <table class="relatorio-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Presenças</th>
                        <th>Faltas</th>
                        <th>Total de Aulas</th>
                        <th>% de Presença</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    alunos.forEach(aluno => {
        const faltas = aluno.totalAulas - aluno.presencas;
        const percentual = ((aluno.presencas / aluno.totalAulas) * 100).toFixed(2);
        const percentualClass = percentual >= 80 ? 'percentual-alto' : 
                               percentual >= 60 ? 'percentual-medio' : 'percentual-baixo';
        
        relatorioHTML += `
            <tr>
                <td>${aluno.nome}</td>
                <td>${aluno.cpf}</td>
                <td>${aluno.presencas}</td>
                <td>${faltas}</td>
                <td>${aluno.totalAulas}</td>
                <td class="${percentualClass}">${percentual}%</td>
            </tr>
        `;
    });
    
    relatorioHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    // Adicionar relatório à página
    const existingRelatorio = document.querySelector('.relatorio-presenca');
    if (existingRelatorio) {
        existingRelatorio.innerHTML = relatorioHTML;
    }
}

// Adicionar event listeners para os elementos de filtro de turma e data
document.addEventListener('DOMContentLoaded', function() {
    const turmaSelect = document.getElementById('selectTurma');
    const dataAula = document.getElementById('dataAula');
    
    if (turmaSelect && dataAula) {
        turmaSelect.addEventListener('change', function() {
            if (this.value && dataAula.value) {
                inicializarRegistroPresenca();
            }
        });
        
        dataAula.addEventListener('change', function() {
            if (this.value && turmaSelect.value) {
                inicializarRegistroPresenca();
            }
        });
    }
});