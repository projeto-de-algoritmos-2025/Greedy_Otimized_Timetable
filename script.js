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
