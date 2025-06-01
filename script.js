let tarefas = []; // compromissos adicionados

// HH:MM para minutos totais desde 00:00
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Converte minutos totais para HH:MM
function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const displayMinutes = totalMinutes % 60;
    const displayHours = Math.floor(totalMinutes / 60);

    // Se passar de 24 horas, ainda mostra a hora correta + indicação de dia
    let dayOffset = '';
    if (totalMinutes >= 1440) {
        const days = Math.floor(totalMinutes / 1440);
        dayOffset = ` (+${days}d)`;
    }

    return `${String(displayHours % 24).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}${dayOffset}`;
}

//manipulação da Interface
const nomeTarefaInput = document.getElementById('nomeTarefa');
const duracaoTarefaInput = document.getElementById('duracaoTarefa');
const deadlineTarefaInput = document.getElementById('deadlineTarefa');
const addTarefaBtn = document.getElementById('addTarefaBtn');
const listaTarefasUl = document.getElementById('listaTarefas');
const otimizarBtn = document.getElementById('otimizarBtn');
const limparBtn = document.getElementById('limparBtn');
const maxLatenessParagrafo = document.getElementById('maxLateness');
const agendamentoOtimizadoDiv = document.getElementById('agendamentoOtimizado');


// Adiciona um compromisso à lista e atualiza a interface
function adicionarTarefa() {
    const nome = nomeTarefaInput.value.trim();
    const duracaoStr = duracaoTarefaInput.value;
    const deadlineStr = deadlineTarefaInput.value;

    if (!nome || !duracaoStr || !deadlineStr) {
        alert('Por favor, preencha todos os campos da tarefa.');
        return;
    }

    const duracao = parseInt(duracaoStr);
    if (isNaN(duracao) || duracao <= 0) {
        alert('A duração deve ser um número positivo.');
        return;
    }

    const deadlineMin = timeToMinutes(deadlineStr);

    const novaTarefa = {
        id: Date.now(), // ID único para a tarefa
        nome,
        duracao, // em minutos
        deadline: deadlineMin, // em minutos
        deadlineStr // Manter a string original para exibição
    };

    tarefas.push(novaTarefa);
    renderizarTarefas(); // Atualiza a lista exibida
    limparCamposFormulario();
}

// Renderiza a lista de compromissos na UL
function renderizarCompromissos() {
    listaCompromissosUl.innerHTML = ''; // Limpa a lista existente

    if (compromissos.length === 0) {
        listaCompromissosUl.innerHTML = '<li>Nenhum compromisso adicionado.</li>';
        return;
    }

    compromissos.forEach(comp => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${comp.nome} (${comp.inicioStr} - ${comp.fimStr})</span>
            <button data-id="${comp.id}">Remover</button>
        `;
        listaCompromissosUl.appendChild(li);

        // Adiciona evento para o botão remover
        li.querySelector('button').addEventListener('click', (event) => {
            const idParaRemover = parseInt(event.target.dataset.id);
            compromissos = compromissos.filter(c => c.id !== idParaRemover);
            renderizarCompromissos(); // Renderiza novamente após a remoção
            // Limpa resultados anteriores quando a lista é alterada
            minRecursosParagrafo.textContent = 'Número mínimo de recursos necessários: --';
            alocacaoRecursosDiv.innerHTML = '<p>Nenhum compromisso alocado ainda.</p>';
        });
    });
}

// Limpa os campos do formulário de adicionar compromisso
function limparCamposFormulario() {
    nomeCompromissoInput.value = '';
    inicioCompromissoInput.value = '';
    fimCompromissoInput.value = '';
}
