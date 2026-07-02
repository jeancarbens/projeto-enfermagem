const playerNameEl = document.getElementById('player-name');
const scoreTextEl = document.getElementById('score-text');
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

function renderResult() {
    const data = getResultData();
    const total = Number(data.total || 0);
    const score = Number(data.score || 0);

    playerNameEl.textContent = `Nome: ${data.nome || 'Aluno(a)'}`;
    scoreTextEl.textContent = `Pontuação: ${score} de ${total}`;

    const celebrationEl = document.getElementById('celebration');
    if (celebrationEl) {
        celebrationEl.className = 'celebration';
        // decidir faixa
        if (score === total && total > 0) {
            celebrationEl.classList.add('perfect');
            celebrationEl.innerHTML = `<span class="emoji">🏆🎉</span><p class="msg">Perfeito — todas corretas!</p>`;
        } else if (score >= 10 && score <= (total - 1)) {
            celebrationEl.classList.add('great');
            celebrationEl.innerHTML = `<span class="emoji">👏✨</span><p class="msg">Ótimo — muito bem!</p>`;
        } else if (score >= 7 && score < 10) {
            celebrationEl.classList.add('good');
            celebrationEl.innerHTML = `<span class="emoji">🙂👍</span><p class="msg">Bom — continue praticando!</p>`;
        } else if (score >= 5 && score <= 6) {
            celebrationEl.classList.add('ok');
            celebrationEl.innerHTML = `<span class="emoji">🤝</span><p class="msg">Razoável — quase lá!</p>`;
        } else {
            celebrationEl.classList.add('low');
            celebrationEl.innerHTML = `<span class="emoji">😕💡</span><p class="msg">Tente novamente — estude mais!</p>`;
        }
    }

    const results = Array.isArray(data.results) ? data.results : [];

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
