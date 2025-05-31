let compromissos = []; // compromissos adicionados

// HH:MM para minutos totais desde 00:00
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// minutos totais para HH:MM
function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

//manipulação da Interface
const nomeCompromissoInput = document.getElementById('nomeCompromisso');
const inicioCompromissoInput = document.getElementById('inicioCompromisso');
const fimCompromissoInput = document.getElementById('fimCompromisso');
const addCompromissoBtn = document.getElementById('addCompromissoBtn');
const listaCompromissosUl = document.getElementById('listaCompromissos');
const otimizarBtn = document.getElementById('otimizarBtn');
const limparBtn = document.getElementById('limparBtn');
const minRecursosParagrafo = document.getElementById('minRecursos');
const alocacaoRecursosDiv = document.getElementById('alocacaoRecursos');

// Adiciona um compromisso à lista e atualiza a interface
function adicionarCompromisso() {
    const nome = nomeCompromissoInput.value.trim();
    const inicioStr = inicioCompromissoInput.value;
    const fimStr = fimCompromissoInput.value;

    if (!nome ||  !inicioStr || !fimStr) {
        alert('Por favor, preencha todos os campos do compromisso.');
        return;
    }

    const inicioMin = timeToMinutes(inicioStr);
    const fimMin = timeToMinutes(fimStr);

    if (inicioMin >= fimMin) {
        alert('O horário de início deve ser anterior ao horário de término.');
        return;
    }

    const novoCompromisso = {
        id: Date.now(), // ID único para o compromisso (usado para remover)
        nome,
        inicio: inicioMin,
        fim: fimMin,
        inicioStr, // Manter a string original para exibição
        fimStr     // Manter a string original para exibição
    };

    compromissos.push(novoCompromisso);
    renderizarCompromissos(); // Atualiza a lista exibida
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
