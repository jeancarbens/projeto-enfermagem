const quizData = [
 
    { type: 'mcq', question: 'Qual é o nome da técnica que previne infecções durante procedimentos invasivos?', answers: ['Escovação', 'Assepsia', 'Aromaterapia', 'Hidratação'], correct: 1 },
    { type: 'mcq', question: 'O que significa a sigla "PA" no registro de sinais vitais?', answers: ['Peso Arterial', 'Pulso Assistido', 'Pressão Arterial', 'Padrão Alimentar'], correct: 2 },
    { type: 'mcq', question: 'Qual é a posição recomendada para paciente em risco de aspiração?', answers: ['Decúbito ventral', 'Sentado com tronco elevado', 'Decúbito lateral direito', 'Decúbito lateral esquerdo'], correct: 1 },
    { type: 'mcq', question: 'Em qual situação a equipe de enfermagem deve realizar curativo estéril?', answers: ['Troca de roupa de cama', 'Limpeza oral', 'Tratamento de ferida cirúrgica', 'Aferição de temperatura'], correct: 2 },
    { type: 'mcq', question: 'Qual é o principal objetivo da comunicação terapêutica?', answers: ['Fazer amizade', 'Informar colegas', 'Promover compreensão do paciente', 'Registrar dados'], correct: 2 },

    
    { type: 'tf', question: 'A lavagem das mãos é uma medida eficaz para prevenir infecções nosocomiais.', correct: 0 },
    { type: 'tf', question: 'Antibióticos são sempre indicados para infecções virais.', correct: 1 },
    { type: 'tf', question: 'Aferir sinais vitais é tarefa exclusiva do médico.', correct: 1 },
    { type: 'tf', question: 'Curativos estéreis devem ser utilizados em feridas cirúrgicas limpas quando recomendado.', correct: 0 },
    { type: 'tf', question: 'A comunicação terapêutica pode melhorar a adesão ao tratamento pelo paciente.', correct: 0 },

    
    {
        type: 'match',
        question: 'Associe a medida de enfermagem à sua finalidade:',
        left: ['Higienização das mãos', 'Troca de curativo estéril', 'Aferição da PA', 'Elevar cabeceira', 'Registro de enfermagem'],
        right: ['Prevenção de infecção', 'Monitorar pressão arterial', 'Documentar cuidados prestados', 'Reduzir risco de aspiração', 'Manter campo estéril'],
        
        mapping: [0, 4, 1, 3, 2]
    },
    {
        type: 'match',
        question: 'Associe o sinal clínico à sua descrição:',
        left: ['Taquicardia', 'Bradipneia', 'Hipertensão', 'Cianose', 'Febre'],
        right: ['Temperatura corporal elevada', 'Frequência cardíaca aumentada', 'Sinais de baixa oxigenação', 'Pressão arterial elevada', 'Respiração mais lenta que o normal'],
        mapping: [1, 4, 3, 2, 0]
    },
    {
        type: 'match',
        question: 'Associe o equipamento ao uso:',
        left: ['Sonda nasogástrica', 'Cateter vesical', 'Oxímetro de pulso', 'Bisturi', 'Nebulizador'],
        right: ['Medição de SpO2', 'Administração de ar/oxigênio inalatório', 'Instrumento para cortes cirúrgicos', 'Drenagem urinária', 'Acesso gástrico para nutrição/eliminação'],
        mapping: [4, 3, 0, 2, 1]
    },
    {
        type: 'match',
        question: 'Associe a via de administração ao exemplo:',
        left: ['Oral', 'Intravenosa', 'Intramuscular', 'Tópica', 'Subcutânea'],
        right: ['Vacina comum', 'Colírio', 'Compressa de pomada', 'Soro fisiológico via cateter', 'Insulina'],
        mapping: [0, 3, 1, 2, 4]
    },
    {
        type: 'match',
        question: 'Associe o termo ao conceito:',
        left: ['Assepsia', 'Antissepsia', 'Biosegurança', 'Higiene', 'Epidemiologia'],
        right: ['Estudo da distribuição de doenças', 'Conjunto de medidas para reduzir risco biológico', 'Método de eliminação de microrganismos', 'Medidas de limpeza pessoal', 'Aplicação de agentes para inibir microrganismos'],
        mapping: [2, 4, 1, 3, 0]
    }
];

const questionNumberEl = document.getElementById('question-number');
const questionTextEl = document.getElementById('question-text');
const answersEl = document.getElementById('answers');
const progressFillEl = document.getElementById('progress-fill');
const welcomeMessageEl = document.getElementById('welcome-message');
const resultBoxEl = document.getElementById('result-box');
const scoreTextEl = document.getElementById('score-text');
const evaluationTextEl = document.getElementById('evaluation-text');
const retryBtn = document.getElementById('retry-btn');
const submitBtn = document.getElementById('submit-btn');

if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        if (typeof finalizePending === 'function') finalizePending();
        else {
            if (typeof saveQuizResults === 'function') saveQuizResults();
            if (typeof showResult === 'function') showResult();
        }
    });
}

let currentQuestion = 0;
let score = 0;
let answered = false;
let reviewResults = [];
let pending = null;

function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param)?.trim() || '';
}

function saveQuizResults() {
    const nome = getQueryParam('nome') || 'Aluno(a)';
    sessionStorage.setItem(
        'quizResults',
        JSON.stringify({
            nome,
            score,
            total: quizData.length,
            results: reviewResults
        })
    );
}

function showWelcome() {
    if (!welcomeMessageEl) return;

    const nome = getQueryParam('nome');
    welcomeMessageEl.textContent = nome
        ? `Bem-vindo(a), ${nome}!`
        : 'Bem-vindo(a) ao quiz de enfermagem!';
}

function loadQuestion() {
    answered = false;
    pending = null;
    const data = quizData[currentQuestion];
    questionNumberEl.textContent = `Pergunta ${currentQuestion + 1} de ${quizData.length}`;
    questionTextEl.textContent = data.question;
    progressFillEl.style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;
    answersEl.innerHTML = '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviar resposta';
        submitBtn.classList.remove('ready');
    }

    if (!data.type || data.type === 'mcq') {
        data.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'answer-button';
            button.textContent = answer;
            button.addEventListener('click', () => chooseAnswer(index, button));
            answersEl.appendChild(button);
        });
    } else if (data.type === 'tf') {
        ['Verdadeiro', 'Falso'].forEach((label, idx) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'answer-button';
            button.textContent = label;
            button.addEventListener('click', () => chooseAnswer(idx, button));
            answersEl.appendChild(button);
        });
    } else if (data.type === 'match') {
        const right = data.right.slice();
        const shuffled = right
            .map((v) => ({ v, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map((o) => o.v);

        const matchGame = document.createElement('div');
        matchGame.className = 'match-game';
        const isMobileMatch = window.matchMedia('(max-width: 720px)').matches;
        if (isMobileMatch) {
            matchGame.classList.add('match-game-mobile');
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('match-lines');

        const mobileHint = document.createElement('div');
        mobileHint.className = 'match-hint';
        mobileHint.textContent = 'Toque em um termo e depois no significado correspondente para criar o par.';

        const selectionBanner = document.createElement('div');
        selectionBanner.className = 'match-selection-banner';
        selectionBanner.textContent = 'Nenhum item selecionado ainda.';

        const leftColumn = document.createElement('div');
        leftColumn.className = 'match-column match-column-left';
        leftColumn.dataset.label = 'Termos';

        const rightColumn = document.createElement('div');
        rightColumn.className = 'match-column match-column-right';
        rightColumn.dataset.label = 'Significados';

        const leftButtons = [];
        const rightButtons = [];
        let selectedItem = null;
        const usedLeft = new Set();
        const usedRight = new Set();
        const connections = [];

        const drawLines = () => {
            const bounds = matchGame.getBoundingClientRect();
            svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
            svg.setAttribute('width', `${bounds.width}`);
            svg.setAttribute('height', `${bounds.height}`);
            svg.innerHTML = '';

            connections.forEach(({ leftIndex, rightIndex }) => {
                const leftBtn = leftButtons[leftIndex];
                const rightBtn = rightButtons[rightIndex];
                if (!leftBtn || !rightBtn) return;

                const leftRect = leftBtn.getBoundingClientRect();
                const rightRect = rightBtn.getBoundingClientRect();
                const startX = leftRect.right - bounds.left;
                const startY = leftRect.top - bounds.top + leftRect.height / 2;
                const endX = rightRect.left - bounds.left;
                const endY = rightRect.top - bounds.top + rightRect.height / 2;
                const midX = (startX + endX) / 2;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute(
                    'd',
                    `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
                );
                path.setAttribute('class', 'match-line');
                svg.appendChild(path);
            });
        };

        const addConnection = (leftIndex, rightIndex) => {
            if (usedLeft.has(leftIndex) || usedRight.has(rightIndex)) return;

            usedLeft.add(leftIndex);
            usedRight.add(rightIndex);
            connections.push({ leftIndex, rightIndex });
            requestAnimationFrame(drawLines);
            
            
            
            
            if (usedLeft.size === data.left.length && usedRight.size === data.left.length) {
                pending = { type: 'match', connections: connections.slice(), shuffled };
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enviar resposta — pronto';
                    submitBtn.classList.add('ready');
                }
            }
        };

        const removeConnection = (leftIndex, rightIndex) => {
            const index = connections.findIndex(
                (conn) => conn.leftIndex === leftIndex && conn.rightIndex === rightIndex
            );

            if (index === -1) return;

            connections.splice(index, 1);
            usedLeft.delete(leftIndex);
            usedRight.delete(rightIndex);
            requestAnimationFrame(drawLines);
            if (pending && pending.type === 'match') pending = null;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviar resposta';
                submitBtn.classList.remove('ready');
            }
        };

        const handleItemClick = (type, index) => {
            if (answered) return;

            const existingConnection = connections.find((conn) =>
                (type === 'left' && conn.leftIndex === index) ||
                (type === 'right' && conn.rightIndex === index)
            );

            if (existingConnection) {
                removeConnection(
                    existingConnection.leftIndex,
                    existingConnection.rightIndex
                );
                selectedItem = null;
                leftButtons.forEach((btn) => btn.classList.remove('selected'));
                rightButtons.forEach((btn) => btn.classList.remove('selected'));
                if (isMobileMatch) selectionBanner.textContent = 'Par removido. Toque em um termo para começar novamente.';
                return;
            }

            if (type === 'left' && usedLeft.has(index)) return;
            if (type === 'right' && usedRight.has(index)) return;

            if (!selectedItem) {
                selectedItem = { type, index };
                if (type === 'left') {
                    leftButtons.forEach((btn, i) => btn.classList.toggle('selected', i === index));
                    rightButtons.forEach((btn) => btn.classList.remove('selected'));
                    if (isMobileMatch) selectionBanner.textContent = `Selecionado termo: "${data.left[index]}". Agora escolha o significado.`;
                } else {
                    rightButtons.forEach((btn, i) => btn.classList.toggle('selected', i === index));
                    leftButtons.forEach((btn) => btn.classList.remove('selected'));
                    if (isMobileMatch) selectionBanner.textContent = `Selecionado significado: "${shuffled[index]}". Agora escolha o termo.`;
                }
                return;
            }

            if (selectedItem.type === type && selectedItem.index === index) {
                selectedItem = null;
                if (type === 'left') {
                    leftButtons.forEach((btn, i) => btn.classList.toggle('selected', i === index));
                } else {
                    rightButtons.forEach((btn, i) => btn.classList.toggle('selected', i === index));
                }
                return;
            }

            if (selectedItem.type === 'left' && type === 'right') {
                addConnection(selectedItem.index, index);
                if (isMobileMatch) selectionBanner.textContent = `Par formado: "${data.left[selectedItem.index]}" → "${shuffled[index]}". Toque em outro termo.`;
                selectedItem = null;
                leftButtons.forEach((btn) => btn.classList.remove('selected'));
                rightButtons.forEach((btn) => btn.classList.remove('selected'));
            } else if (selectedItem.type === 'right' && type === 'left') {
                addConnection(index, selectedItem.index);
                if (isMobileMatch) selectionBanner.textContent = `Par formado: "${data.left[index]}" → "${shuffled[selectedItem.index]}". Toque em outro termo.`;
                selectedItem = null;
                leftButtons.forEach((btn) => btn.classList.remove('selected'));
                rightButtons.forEach((btn) => btn.classList.remove('selected'));
            } else {
                selectedItem = { type, index };
                if (type === 'left') {
                    leftButtons.forEach((btn, i) => btn.classList.toggle('selected', i === index));
                    rightButtons.forEach((btn) => btn.classList.remove('selected'));
                } else {
                    rightButtons.forEach((btn, i) => btn.classList.toggle('selected', i === index));
                    leftButtons.forEach((btn) => btn.classList.remove('selected'));
                }
            }
        };

        data.left.forEach((leftLabel, i) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'match-item';
            button.textContent = leftLabel;
            button.addEventListener('click', () => handleItemClick('left', i));
            leftButtons.push(button);
            leftColumn.appendChild(button);
        });

        shuffled.forEach((opt, j) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'match-item';
            button.textContent = opt;
            button.addEventListener('click', () => handleItemClick('right', j));
            rightButtons.push(button);
            rightColumn.appendChild(button);
        });

        matchGame.appendChild(svg);
        if (isMobileMatch) {
            matchGame.appendChild(mobileHint);
            matchGame.appendChild(selectionBanner);
        }
        matchGame.appendChild(leftColumn);
        matchGame.appendChild(rightColumn);
        answersEl.appendChild(matchGame);

        requestAnimationFrame(drawLines);
        window.addEventListener('resize', drawLines);
    }
}

function chooseAnswer(index, button) {
    if (answered) return;

    const pendingBtns = answersEl.querySelectorAll('.answer-button.pending');
    pendingBtns.forEach((b) => b.classList.remove('pending'));

    button.classList.add('pending');
    pending = { type: 'mcq', index, button };
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar resposta — pronto';
        submitBtn.classList.add('ready');
    }
}

function finalizePending() {
    if (!pending) return;
    const data = quizData[currentQuestion];

    if (pending.type === 'mcq') {
        const index = pending.index;
        const button = pending.button;
        const isCorrect = index === data.correct;

        answered = true;
        if (isCorrect) {
            score += 1;
            button.classList.add('correct');
        } else {
            button.classList.add('incorrect');
            const buttons = Array.from(answersEl.querySelectorAll('.answer-button'));
            const correctButton = buttons[data.correct];
            if (correctButton) correctButton.classList.add('correct');
        }

        const userAnswer = data.type === 'tf'
            ? (index === 0 ? 'Verdadeiro' : 'Falso')
            : data.answers[index];
        const correctAnswer = data.type === 'tf'
            ? (data.correct === 0 ? 'Verdadeiro' : 'Falso')
            : data.answers[data.correct];

        reviewResults[currentQuestion] = {
            question: data.question,
            userAnswer,
            correctAnswer,
            isCorrect
        };

        const allButtons = answersEl.querySelectorAll('button');
        allButtons.forEach((b) => (b.disabled = true));
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviar resposta';
            submitBtn.classList.remove('ready');
        }
        setTimeout(() => {
            currentQuestion += 1;
            if (currentQuestion < quizData.length) loadQuestion(); else showResult();
        }, 250);
    } else if (pending.type === 'match') {
        const conn = pending.connections;
        const shuffled = pending.shuffled;

        const correctPairs = conn.filter(({ leftIndex, rightIndex }) => {
            return shuffled[rightIndex] === data.right[data.mapping[leftIndex]];
        }).length;

        const isCorrect = correctPairs === data.left.length;
        if (isCorrect) score += 1;

        const userAnswerText = conn
            .map(({ leftIndex, rightIndex }) => {
                return `${data.left[leftIndex]} → ${shuffled[rightIndex]}`;
            })
            .join(' | ');

        const correctAnswerText = data.left
            .map((leftLabel, index) => {
                return `${leftLabel} → ${data.right[data.mapping[index]]}`;
            })
            .join(' | ');

        reviewResults[currentQuestion] = {
            question: data.question,
            userAnswer: userAnswerText,
            correctAnswer: correctAnswerText,
            isCorrect
        };

        answered = true;
        const allButtons = answersEl.querySelectorAll('button');
        allButtons.forEach((b) => (b.disabled = true));
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviar resposta';
            submitBtn.classList.remove('ready');
        }

        setTimeout(() => {
            currentQuestion += 1;
            if (currentQuestion < quizData.length) loadQuestion(); else showResult();
        }, 250);
    }

    pending = null;
}

function showResult() {
    saveQuizResults();

    const nome = getQueryParam('nome').trim();
    const params = new URLSearchParams({
        nome,
        score: score.toString(),
        total: quizData.length.toString()
    });

    window.location.href = `resultado.html?${params.toString()}`;
}

showWelcome();
loadQuestion();