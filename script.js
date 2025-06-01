
let tarefas = []; // Armazenará todas as tarefas adicionadas

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Converte minutos totais para HH:MM
function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Calcula o offset de dias para exibição
    let dayOffset = '';
    if (totalMinutes >= 1440) { // 1440 minutos = 24 horas
        const days = Math.floor(totalMinutes / 1440);
        dayOffset = ` (+${days}d)`;
    }

    const displayHours = Math.floor(totalMinutes / 60) % 24;
    const displayMinutes = totalMinutes % 60;

    return `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}${dayOffset}`;
}


// --- 3. Funções de Manipulação da Interface ---
const horaInicioAgendamentoInput = document.getElementById('horaInicioAgendamento');
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
        alert('A duração deve ser um número inteiro positivo.');
        return;
    }

    const deadlineMin = timeToMinutes(deadlineStr);
    const horaInicioAgendamentoMin = timeToMinutes(horaInicioAgendamentoInput.value);

    if (deadlineMin < horaInicioAgendamentoMin) {
        if (horaInicioAgendamentoMin - deadlineMin > 1380) { 
             alert(`A deadline (${deadlineStr}) parece ser de um dia anterior ao horário de início do agendamento (${horaInicioAgendamentoInput.value}). Por favor, ajuste a deadline.`);
             return;
        }
        alert(`A deadline (${deadlineStr}) é anterior ao horário de início do agendamento (${horaInicioAgendamentoInput.value}). A tarefa poderá iniciar apenas a partir de ${horaInicioAgendamentoInput.value}, o que pode resultar em latência.`);
    }

    const novaTarefa = {
        id: Date.now(),
        nome,
        duracao,
        deadline: deadlineMin,
        deadlineStr
    };

    tarefas.push(novaTarefa);
    renderizarTarefas();
    limparCamposFormulario();
    maxLatenessParagrafo.textContent = 'Latência Máxima: -- minutos';
    alocamentoOtimizadoDiv.innerHTML = '<p>Nenhuma tarefa agendada ainda.</p>';
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
    let tempoAtual = timeToMinutes(horaInicioAgendamentoStr);
    
    // Ordenar pela deadline crescente.
    const tarefasOrdenadas = [...tarefas].sort((a, b) => a.deadline - b.deadline);

    let maxLateness = 0; // A latência máxima encontrada até agora
    const agendamentoFinal = [];

    for (const tarefa of tarefasOrdenadas) {
        const tempoInicio = tempoAtual; 
        const tempoFim = tempoInicio + tarefa.duracao; 

        // Calcule a latência para esta tarefa
        const latencia = Math.max(0, tempoFim - tarefa.deadline);

        // Atualize a latência máxima global
        if (latencia > maxLateness) {
            maxLateness = latencia;
        }

        agendamentoFinal.push({
            ...tarefa,
            tempoInicio,
            tempoFim,
            lateness: latencia
        });

        tempoAtual = tempoFim;
    }

    maxLatenessParagrafo.textContent = `Latência Máxima: ${maxLateness} minutos`;
    renderizarAgendamento(agendamentoFinal, maxLateness);
}

addTarefaBtn.addEventListener('click', adicionarTarefa);
otimizarBtn.addEventListener('click', otimizarAgendamento);
limparBtn.addEventListener('click', limparTudo);

renderizarTarefas();