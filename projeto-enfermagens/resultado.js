const playerNameEl = document.getElementById('player-name');
const scoreTextEl = document.getElementById('score-text');
const percentageTextEl = document.getElementById('percentage-text');
const performanceMessageEl = document.getElementById('performance-message');
const toggleReviewBtn = document.getElementById('toggle-review');
const retryBtn = document.getElementById('retry-btn');
const reviewSection = document.getElementById('review-section');

function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param)?.trim() || '';
}

function getResultData() {
    const stored = sessionStorage.getItem('quizResults');
    const fromStorage = stored ? JSON.parse(stored) : null;

    if (fromStorage && (fromStorage.nome || fromStorage.score !== undefined || fromStorage.results)) {
        return fromStorage;
    }

    return {
        nome: getQueryParam('nome') || 'Aluno(a)',
        score: Number(getQueryParam('score') || 0),
        total: Number(getQueryParam('total') || 0),
        results: []
    };
}

function getPerformanceMessage(percentual) {
    if (percentual >= 80) {
        return 'Excelente! Você demonstrou ótimo domínio do conteúdo.';
    }
    if (percentual >= 60) {
        return 'Muito bom! Você demonstrou um bom domínio do conteúdo.';
    }
    if (percentual >= 40) {
        return 'Bom trabalho! Continue estudando para melhorar ainda mais.';
    }
    return 'Continue praticando! Você está no caminho certo.';
}

function renderResult() {
    const data = getResultData();
    const results = Array.isArray(data.results) ? data.results : [];
    const total = Number(data.total || 0) || results.length || 0;
    const acertos = results.filter((item) => item.isCorrect === true).length;
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
    const mensagem = getPerformanceMessage(percentual);

    playerNameEl.textContent = data.nome || 'Aluno(a)';
    scoreTextEl.textContent = `${acertos} / ${total} acertos`;
    if (percentageTextEl) percentageTextEl.textContent = `${percentual}% de aproveitamento`;
    if (performanceMessageEl) performanceMessageEl.textContent = mensagem;

    const celebrationEl = document.getElementById('celebration');
    if (celebrationEl) {
        celebrationEl.className = 'celebration';

        let emoji = '🙂';
        if (percentual >= 80) {
            celebrationEl.classList.add('perfect');
            emoji = '🏆';
        } else if (percentual >= 60) {
            celebrationEl.classList.add('great');
            emoji = '🎯';
        } else if (percentual >= 40) {
            celebrationEl.classList.add('good');
            emoji = '👍';
        } else {
            celebrationEl.classList.add('low');
            emoji = '📚';
        }

        celebrationEl.innerHTML = `<span class="emoji">${emoji}</span>`;
    }

    reviewSection.innerHTML = '';

    if (!results.length) {
        reviewSection.innerHTML = '<p>Nenhuma resposta foi registrada.</p>';
        return;
    }

    results.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `review-item ${item.isCorrect ? 'correct' : 'wrong'}`;
        const isEssay = item.type === 'essay';
        const statusLabel = item.status === 'correct'
            ? '✅ Resposta considerada correta'
            : item.status === 'partial'
                ? '🟡 Resposta parcialmente correta'
                : '❌ Resposta considerada incorreta';

        div.innerHTML = `
            <p><strong>${index + 1}. ${item.question}</strong></p>
            <p><strong>Resposta marcada:</strong> ${item.userAnswer || '—'}</p>
            <p><strong>Resposta correta:</strong> ${item.correctAnswer || '—'}</p>
            ${isEssay ? `<p><strong>Verificação:</strong> ${item.feedback || 'Resposta analisada.'}</p>` : ''}
            <p class="result-tag">${isEssay ? statusLabel : (item.isCorrect ? '✅ Acertou' : '❌ Errou')}</p>
        `;
        reviewSection.appendChild(div);
    });
}

toggleReviewBtn.addEventListener('click', () => {
    const visible = reviewSection.style.display === 'block';
    reviewSection.style.display = visible ? 'none' : 'block';
    toggleReviewBtn.textContent = visible ? 'Ver questões' : 'Ocultar questões';
});

retryBtn.addEventListener('click', () => {
    window.location.href = 'perguntas.html' + window.location.search;
});

renderResult();
reviewSection.style.display = 'none';
