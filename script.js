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
const horaInicioAgendamentoInput = document.getElementById('horaInicioAgendamento');
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
function renderizarTarefas() {
    listaTarefasUl.innerHTML = ''; // Limpa a lista existente

    if (tarefas.length === 0) {
        listaTarefasUl.innerHTML = '<li>Nenhuma tarefa adicionada.</li>';
        return;
    }

    tarefas.forEach(tarefa => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${tarefa.nome} (Duração: ${tarefa.duracao} min, Deadline: ${tarefa.deadlineStr})</span>
            <button data-id="${tarefa.id}">Remover</button>
        `;
        listaTarefasUl.appendChild(li);

        // Adiciona evento para o botão remover
        li.querySelector('button').addEventListener('click', (event) => {
            const idParaRemover = parseInt(event.target.dataset.id);
            tarefas = tarefas.filter(t => t.id !== idParaRemover);
            renderizarTarefas(); // Renderiza novamente após a remoção
            // Limpa resultados anteriores quando a lista é alterada
            maxLatenessParagrafo.textContent = 'Latência Máxima: -- minutos';
            agendamentoOtimizadoDiv.innerHTML = '<p>Nenhuma tarefa agendada ainda.</p>';
        });
    });
}

// Limpa os campos do formulário de adicionar compromisso
function limparCamposFormulario() {
    nomeTarefaInput.value = '';
    duracaoTarefaInput.value = '';
    deadlineTarefaInput.value = '';
}

function limparTudo() {
    tarefas = [];
    renderizarTarefas();
    maxLatenessParagrafo.textContent = 'Latência Máxima: -- minutos';
    agendamentoOtimizadoDiv.innerHTML = '<p>Nenhuma tarefa agendada ainda.</p>';
}

// Renderiza o agendamento detalhado
function renderizarAgendamento(agendamento, maxLatenessValue) {
    agendamentoOtimizadoDiv.innerHTML = ''; // Limpa a área de resultados

    if (agendamento.length === 0) {
        agendamentoOtimizadoDiv.innerHTML = '<p>Nenhuma tarefa agendada.</p>';
        return;
    }

    const ul = document.createElement('ul');
    agendamento.forEach(tarefa => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${tarefa.nome}</strong>: Início: ${minutesToTime(tarefa.tempoInicio)}, Fim: ${minutesToTime(tarefa.tempoFim)}
            (Deadline: ${tarefa.deadlineStr}, Latência: <span style="color:${tarefa.lateness > 0 ? 'red' : 'green'}; font-weight: bold;">${tarefa.lateness} min</span>)
        `;
        ul.appendChild(li);
    });
    agendamentoOtimizadoDiv.appendChild(ul);
}

function otimizarAgendamento() {
    if (tarefas.length === 0) {
        alert('Adicione pelo menos uma tarefa para otimizar.');
        return;
    }
    
    const horaInicioAgendamentoStr = horaInicioAgendamentoInput.value;
    if (!horaInicioAgendamentoStr) {
        alert('Por favor, informe o horário de início do agendamento.');
        return;
    }
    // Converter o horário de início para minutos para uso no cálculo
    let tempoAtual = timeToMinutes(horaInicioAgendamentoStr);

    // ordenando pela deadline crescente.
    const tarefasOrdenadas = [...tarefas].sort((a, b) => a.deadline - b.deadline);
    let maxLateness = 0; 
    const agendamentoFinal = [];

    for (const tarefa of tarefasOrdenadas) {
        const tempoInicio = tempoAtual; 
        const tempoFim = tempoInicio + tarefa.duracao; 

        // latência para esta tarefa somente
        const latencia = Math.max(0, tempoFim - tarefa.deadline);

        // latência máxima global
        if (latencia > maxLateness) {
            maxLateness = latencia;
        }

        // Armazene a tarefa
        agendamentoFinal.push({
            ...tarefa,
            tempoInicio,
            tempoFim,
            lateness: latencia
        });

        // Atualize o tempo atual para o início da próxima tarefa
        tempoAtual = tempoFim;
    }

    //Exibir os resultados
    maxLatenessParagrafo.textContent = `Latência Máxima: ${maxLateness} minutos`;
    renderizarAgendamento(agendamentoFinal, maxLateness);
}


////// listeners

addTarefaBtn.addEventListener('click', adicionarTarefa);
otimizarBtn.addEventListener('click', otimizarAgendamento);
limparBtn.addEventListener('click', limparTudo);

//Renderiza as tarefas
renderizarTarefas();