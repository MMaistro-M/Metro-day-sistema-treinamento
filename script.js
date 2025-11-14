// util: debounce
function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), wait);
  };
}

// Sistema de Navegação para páginas separadas
function navigateTo(page) {
    window.location.href = page;
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
document.addEventListener('DOMContentLoaded', function() {
    const loginFormEl = document.getElementById('loginForm');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            const userTypeEl = document.querySelector('.user-type.active');
            const userType = userTypeEl ? userTypeEl.id : 'alunoType';
            
            showLoading(this.querySelector('button'));
            
            setTimeout(() => {
                if (userType === 'alunoType') {
                    alert('Login de aluno realizado com sucesso!');
                    navigateTo('areaAluno.html');
                } else if (userType === 'instrutorType') {
                    alert('Login de instrutor realizado com sucesso!');
                    navigateTo('registroPresenca.html');
                } else if (userType === 'monitorType') {
                    alert('Login de monitor realizado com sucesso!');
                    navigateTo('index.html');
                } else {
                    navigateTo('loginAdm.html');
                }
            }, 1000);
        });
    }

    // Login admin
    const adminLoginFormEl = document.getElementById('adminLoginForm');
    if (adminLoginFormEl) {
        adminLoginFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            const user = document.getElementById('adminUser').value;
            const password = document.getElementById('adminPassword').value;
            
            showLoading(this.querySelector('button'));
            
            setTimeout(() => {
                if (user === 'admin' && password === 'admin123') {
                    alert('Login administrativo realizado com sucesso!');
                    navigateTo('dashBoardAdm.html');
                } else {
                    alert('Usuário ou senha incorretos!');
                    hideLoading(this.querySelector('button'));
                }
            }, 1000);
        });
    }
});

// Loading states
function showLoading(button) {
    if (!button) return;
    button.classList.add('btn-loading');
    button.disabled = true;
}

function hideLoading(button) {
    if (!button) return;
    button.classList.remove('btn-loading');
    button.disabled = false;
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
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-assinar') || e.target.closest('.btn-assinar')) {
        const btn = e.target.classList.contains('btn-assinar') ? e.target : e.target.closest('.btn-assinar');
        const RGM = btn.getAttribute('data-RGM');
        if (RGM) {
            abrirPadAssinatura(RGM);
        }
    }
});

// Canvas assinatura simples (mouse e touch)
let sig = { drawing:false, ctx:null, canvas:null, last:{x:0,y:0} };
function initSignaturePad() {
  const canvas = document.getElementById('signature-pad');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000000';
  sig = { drawing:false, ctx, canvas, last:{x:0,y:0} };
  
  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { 
        x: e.touches[0].clientX - rect.left, 
        y: e.touches[0].clientY - rect.top 
      };
    }
    return { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    };
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
  
  // Remove event listeners antigos
  canvas.removeEventListener('mousedown', start);
  canvas.removeEventListener('mousemove', move);
  canvas.removeEventListener('mouseup', end);
  canvas.removeEventListener('mouseleave', end);
  canvas.removeEventListener('touchstart', start);
  canvas.removeEventListener('touchmove', move);
  canvas.removeEventListener('touchend', end);
  
  // Adiciona novos event listeners
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function salvarAssinatura() {
    const container = document.querySelector('.signature-pad-container');
    if (!container) return;
    
    const RGM = container.getAttribute('data-RGM');
    const aluno = alunos.find(a => a.RGM === RGM);
    
    if (aluno) {
        const checkbox = document.querySelector(`.checkbox-presenca[data-RGM="${RGM}"]`);
        
        if (checkbox && checkbox.checked) {
            alert(`Assinatura salva com sucesso para ${aluno.nome}! Presença registrada.`);
            
            const alunoIndex = alunos.findIndex(a => a.RGM === RGM);
            if (alunoIndex !== -1) {
                alunos[alunoIndex].presencas++;
                if (alunos[alunoIndex].presencas > alunos[alunoIndex].totalAulas) {
                    alunos[alunoIndex].presencas = alunos[alunoIndex].totalAulas;
                }
            }
        } else {
            alert('Para registrar a assinatura, é necessário marcar a presença do aluno.');
            return;
        }
    } else {
        alert('Assinatura salva com sucesso!');
    }
    
    container.style.display = 'none';
    limparAssinatura();
}

function cancelarAssinatura() {
    const cont = document.querySelector('.signature-pad-container');
    if (cont) cont.style.display = 'none';
    limparAssinatura();
}

//Filtros & Busca
document.addEventListener('DOMContentLoaded', function() {
    const filterCargoEl = document.getElementById('filterCargo');
    const filterStatusEl = document.getElementById('filterStatus');
    const searchCourseEl = document.getElementById('searchCourse');

    function applyCourseFilters() {
      const cargo = (filterCargoEl?.value || '').toLowerCase();
      const status = (filterStatusEl?.value || '').toLowerCase();
      const term = (searchCourseEl?.value || '').toLowerCase().trim();
      const cards = document.querySelectorAll('.card-custom[data-title]');

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

    // Aplica filtros iniciais
    applyCourseFilters();
});

// Estado inicial: restaura tipo de usuário 
document.addEventListener('DOMContentLoaded', function() {
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
});

// Mock de alunos ATUALIZADO
let alunos = [
    { matricula: "123456", nome: "João Silva", RGM: "123.456.789-00", presencas: 3, faltas: 0, totalAulas: 5 },
    { matricula: "234567", nome: "Maria Santos", RGM: "234.567.890-11", presencas: 2, faltas: 1, totalAulas: 5 },
    { matricula: "345678", nome: "Pedro Costa", RGM: "345.678.901-22", presencas: 4, faltas: 0, totalAulas: 5 },
    { matricula: "456789", nome: "Ana Oliveira", RGM: "456.789.012-33", presencas: 5, faltas: 0, totalAulas: 5 },
    { matricula: "567890", nome: "Carlos Souza", RGM: "567.890.123-44", presencas: 1, faltas: 4, totalAulas: 5 }
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
    initSignaturePad();
}

// Inicializar registro de presença quando uma turma é selecionada
function inicializarRegistroPresenca() {
    const turmaSelect = document.getElementById('selectTurma');
    const dataAula = document.getElementById('dataAula');
    
    if (turmaSelect && turmaSelect.value && dataAula && dataAula.value) {
        registroPresenca.turma = turmaSelect.value;
        registroPresenca.data = dataAula.value;
        
        carregarAlunosTurma(turmaSelect.value);
        mostrarNotificacao('Alunos carregados com sucesso!', 'success');
    } else {
        alert('Selecione uma turma e data para continuar.');
    }
}

// Carregar alunos da turma selecionada
function carregarAlunosTurma(turmaId) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) {
        console.error('Tabela de alunos não encontrada');
        return;
    }
    
    tbody.innerHTML = '';
    
    alunos.forEach((aluno) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluno.matricula}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.RGM}</td>
            <td class="text-center">
                <input type="checkbox" class="checkbox-presenca" data-RGM="${aluno.RGM}" ${aluno.presencas > 0 ? 'checked' : ''}>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-metro btn-assinar" data-RGM="${aluno.RGM}">
                    <i class="fas fa-signature"></i> Assinar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.querySelectorAll('.checkbox-presenca').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const RGM = this.getAttribute('data-RGM');
            atualizarPresencaAluno(RGM, this.checked);
        });
    });
}

// Atualizar presença do aluno
function atualizarPresencaAluno(RGM, presente) {
    const alunoIndex = alunos.findIndex(a => a.RGM === RGM);
    if (alunoIndex !== -1) {
        console.log(`Aluno ${alunos[alunoIndex].nome}: ${presente ? 'Presente' : 'Falta'}`);
    }
}

// Abrir pad de assinatura para um aluno específico
function abrirPadAssinatura(RGM) {
    const aluno = alunos.find(a => a.RGM === RGM);
    if (aluno) {
        const nomeElement = document.getElementById('alunoAssinaturaNome');
        const RGMElement = document.getElementById('alunoAssinaturaRGM');
        const container = document.querySelector('.signature-pad-container');
        
        if (nomeElement) nomeElement.textContent = aluno.nome;
        if (RGMElement) RGMElement.textContent = aluno.RGM;
        if (container) {
            container.setAttribute('data-RGM', RGM);
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        initSignaturePad();
    }
}

// GERAR RELATÓRIO DE PRESENÇA - VERSÃO SIMPLIFICADA E FUNCIONAL
function gerarRelatorioPresenca() {
    console.log('=== INICIANDO GERAR RELATÓRIO ===');
    
    // Verifica se estamos na página correta
    const turmaSelect = document.getElementById('selectTurma');
    if (!turmaSelect) {
        console.error('❌ selectTurma não encontrado');
        alert('Erro: Não foi possível encontrar a seleção de turma.');
        return;
    }
    
    if (!turmaSelect.value) {
        alert('⚠️ Selecione uma turma primeiro.');
        return;
    }
    
    const turma = turmaSelect.options[turmaSelect.selectedIndex].text;
    console.log(`📊 Gerando relatório para: ${turma}`);

    // Cria o HTML do relatório
    const relatorioHTML = criarHTMLRelatorio(turma);
    
    // Remove relatório anterior se existir
    const relatorioAnterior = document.querySelector('.relatorio-presenca');
    if (relatorioAnterior) {
        relatorioAnterior.remove();
    }
    
    // Encontra onde inserir o relatório
    const mainContent = document.querySelector('.main-content');
    const containerFluid = document.querySelector('.container-fluid');
    const parentElement = containerFluid || mainContent || document.body;
    
    if (parentElement) {
        parentElement.insertAdjacentHTML('beforeend', relatorioHTML);
        console.log('✅ Relatório inserido com sucesso');
        
        // Scroll para o relatório
        const novoRelatorio = document.querySelector('.relatorio-presenca');
        if (novoRelatorio) {
            novoRelatorio.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        mostrarNotificacao('📊 Relatório gerado com sucesso!', 'success');
    } else {
        console.error('❌ Não foi possível encontrar local para inserir relatório');
        alert('Erro ao exibir relatório.');
    }
}

// Função auxiliar para criar o HTML do relatório
function criarHTMLRelatorio(turma) {
    let tabelaHTML = '';
    
    alunos.forEach(aluno => {
        const faltas = aluno.totalAulas - aluno.presencas;
        const percentual = aluno.totalAulas > 0 ? ((aluno.presencas / aluno.totalAulas) * 100).toFixed(2) : '0.00';
        const percentualClass = percentual >= 80 ? 'percentual-alto' : 
                               percentual >= 60 ? 'percentual-medio' : 'percentual-baixo';
        
        let status = '';
        if (percentual >= 80) status = '<span class="badge bg-success">Aprovado</span>';
        else if (percentual >= 60) status = '<span class="badge bg-warning">Atenção</span>';
        else status = '<span class="badge bg-danger">Reprovado</span>';
        
        tabelaHTML += `
            <tr>
                <td>${aluno.matricula}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.RGM}</td>
                <td class="text-center">${aluno.presencas}</td>
                <td class="text-center">${faltas}</td>
                <td class="text-center">${aluno.totalAulas}</td>
                <td class="text-center ${percentualClass}"><strong>${percentual}%</strong></td>
                <td class="text-center">${status}</td>
            </tr>
        `;
    });

    // Calcula totais
    const totalPresencas = alunos.reduce((sum, aluno) => sum + aluno.presencas, 0);
    const totalAulas = alunos.reduce((sum, aluno) => sum + aluno.totalAulas, 0);
    const totalFaltas = totalAulas - totalPresencas;
    const percentualGeral = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(2) : '0.00';

    return `
        <div class="relatorio-presenca fade-in mt-4">
            <div class="card-custom">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 class="mb-0">
                        <i class="fas fa-chart-pie text-primary"></i> 
                        Relatório de Presença - ${turma}
                    </h3>
                    <button class="btn btn-sm btn-outline-secondary" onclick="fecharRelatorio()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-striped table-bordered table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>Matrícula</th>
                                <th>Nome</th>
                                <th>RGM</th>
                                <th class="text-center">Presenças</th>
                                <th class="text-center">Faltas</th>
                                <th class="text-center">Total Aulas</th>
                                <th class="text-center">% Presença</th>
                                <th class="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tabelaHTML}
                        </tbody>
                        <tfoot class="table-info">
                            <tr>
                                <td colspan="3" class="text-end"><strong>TOTAL GERAL:</strong></td>
                                <td class="text-center"><strong>${totalPresencas}</strong></td>
                                <td class="text-center"><strong>${totalFaltas}</strong></td>
                                <td class="text-center"><strong>${totalAulas}</strong></td>
                                <td class="text-center"><strong>${percentualGeral}%</strong></td>
                                <td class="text-center">-</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="mt-4 d-flex gap-2 flex-wrap justify-content-center">
                    <button class="btn btn-metro" onclick="exportarRelatorio()">
                        <i class="fas fa-download"></i> Exportar PDF
                    </button>
                    <button class="btn btn-success" onclick="imprimirRelatorio()">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                    <button class="btn btn-secondary" onclick="fecharRelatorio()">
                        <i class="fas fa-times"></i> Fechar Relatório
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Função para fechar relatório
function fecharRelatorio() {
    const relatorio = document.querySelector('.relatorio-presenca');
    if (relatorio) {
        relatorio.remove();
        mostrarNotificacao('Relatório fechado', 'info');
    }
}

// Função para imprimir relatório
function imprimirRelatorio() {
    const relatorio = document.querySelector('.relatorio-presenca');
    if (!relatorio) {
        alert('Gere um relatório primeiro.');
        return;
    }
    
    const printContent = relatorio.innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório de Presença - Metrô SP</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body { 
                    padding: 20px; 
                    font-family: Arial, sans-serif;
                }
                .table { 
                    font-size: 12px; 
                }
                .percentual-alto { color: #28a745; font-weight: bold; }
                .percentual-medio { color: #ff9800; font-weight: bold; }
                .percentual-baixo { color: #dc3545; font-weight: bold; }
                .btn { display: none; }
                .card-custom { border: none; box-shadow: none; }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Função para exportar relatório
function exportarRelatorio() {
    if (!document.querySelector('.relatorio-presenca')) {
        alert('Gere um relatório primeiro.');
        return;
    }
    
    // Simulação de exportação
    mostrarNotificacao('📄 Preparando relatório para download...', 'info');
    
    setTimeout(() => {
        mostrarNotificacao('✅ Relatório exportado com sucesso!', 'success');
        // Em produção, aqui faria o download real do PDF
    }, 2000);
}

// Inicialização da página de registro de presença
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIALIZANDO PÁGINA ===');
    
    // Verifica se estamos na página de registro de presença
    const isRegistroPage = window.location.href.includes('registroPresenca.html') || 
                          document.querySelector('table tbody');
    
    if (isRegistroPage) {
        console.log('📋 Página de registro de presença detectada');
        inicializarPaginaPresenca();
        
        // Configura event listeners para turma e data
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
    }
    
    // Inicializar signature pad se estiver na página de assinatura
    if (window.location.href.includes('assinatura.html')) {
        initSignaturePad();
    }
    
    // Configurações de responsividade
    ajustarTabelaResponsiva();
    ajustarSignaturePad();
    
    // Animações de entrada
    const cards = document.querySelectorAll('.card-custom');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
});

// Funções de responsividade
function ajustarTabelaResponsiva() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (window.innerWidth < 768 && !table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

function ajustarSignaturePad() {
    const canvas = document.getElementById('signature-pad');
    if (canvas) {
        const container = canvas.parentElement;
        if (container) {
            if (window.innerWidth < 768) {
                canvas.width = container.clientWidth - 40;
                canvas.height = 150;
            } else {
                canvas.width = Math.min(600, container.clientWidth - 40);
                canvas.height = 200;
            }
        }
    }
}

// Event listener para redimensionamento
window.addEventListener('resize', function() {
    ajustarTabelaResponsiva();
    ajustarSignaturePad();
});

// Notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remove notificações existentes
    const notificacoesExistentes = document.querySelectorAll('.alert-custom');
    notificacoesExistentes.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${tipo} alert-custom alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const icons = {
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'danger': 'fa-times-circle',
        'info': 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[tipo] || 'fa-info-circle'} me-2"></i>
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}


// Adicionar CSS para as notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .alert-custom {
        animation: slideInRight 0.3s ease;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(notificationStyles);

// Inicializar tooltips do Bootstrap
if (typeof bootstrap !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    });
}

