// ========================
// VARIABLES GLOBALES
//=======================
let flashcards = [];
let currentIndex = 0;
let originalFlashcards = [];
let quizData = []; // Se cargará desde quiz.json

// Elementos del DOM
const fcFront = document.getElementById('fc-front');
const fcBack = document.getElementById('fc-back');
const fcCounter = document.getElementById('fc-counter');
const progressBadge = document.getElementById('progressBadge');
const progressText = document.getElementById('progress-text');
const globalProgressBar = document.getElementById('global-progress');
const fcContainer = document.getElementById('fc-container');
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeFloating = document.getElementById('darkModeFloating');
const darkModeIcons = document.querySelectorAll('.dark-mode-icon');
const quizContainer = document.getElementById('quiz-container');

// ========================
// CARGA DE DATOS (FLASHCARDS Y QUIZ)
// ========================
Promise.all([
    fetch('flashcards.json').then(res => res.json()),
    fetch('quiz.json').then(res => res.json())
])
.then(([flashcardsData, quizDataFromJson]) => {
    flashcards = flashcardsData;
    originalFlashcards = [...flashcards];
    quizData = quizDataFromJson;
    currentIndex = 0;
    updateDisplay();
    updateGlobalProgress();

    // Si la pestaña quiz ya está activa, renderizar
    if (document.querySelector('#quiz.active')) {
        renderQuiz();
    }
})
.catch(error => {
    console.error('Error cargando datos:', error);
    fcFront.textContent = 'Error al cargar';
    fcBack.textContent = 'Intenta recargar la página';
});

// ========================
// FUNCIONES FLASHCARDS
// ========================
function updateDisplay() {
    if (!flashcards.length) return;
    const card = flashcards[currentIndex];
    fcFront.textContent = card.term;
    fcBack.textContent = card.definition;
    fcCounter.textContent = `${currentIndex + 1} / ${flashcards.length}`;
    progressBadge.textContent = `${currentIndex + 1} / ${flashcards.length}`;
    fcContainer.classList.remove('flipped');
}

window.changeFC = (delta) => {
    if (!flashcards.length) return;
    currentIndex += delta;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= flashcards.length) currentIndex = flashcards.length - 1;
    updateDisplay();
};

window.shuffleFlashcards = () => {
    if (!flashcards.length) return;
    for (let i = flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
    }
    currentIndex = 0;
    updateDisplay();
};

// ========================
// PROGRESO GLOBAL
// ========================
function updateGlobalProgress() {
    if (!flashcards.length) return;
    const total = flashcards.length;
    const completed = currentIndex + 1; // simplificado: la tarjeta actual se considera "vista"
    const percent = (completed / total) * 100;
    globalProgressBar.style.width = `${percent}%`;
    progressText.textContent = `${completed} / ${total}`;
}

// Llamar a updateGlobalProgress cada vez que cambie la tarjeta
const originalUpdateDisplay = updateDisplay;
updateDisplay = function() {
    originalUpdateDisplay();
    updateGlobalProgress();
};

// ========================
// MODO OSCURO
// ========================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeIcons.forEach(icon => {
        icon.classList.toggle('bi-moon-fill', !isDark);
        icon.classList.toggle('bi-sun-fill', isDark);
    });
}

darkModeToggle.addEventListener('click', toggleDarkMode);
darkModeFloating.addEventListener('click', toggleDarkMode);

// Inicializar iconos si el modo oscuro ya estuviera activo
if (document.body.classList.contains('dark-mode')) {
    darkModeIcons.forEach(icon => {
        icon.classList.remove('bi-moon-fill');
        icon.classList.add('bi-sun-fill');
    });
}

// ========================
// QUIZ (usando quizData cargado)
// ========================
function renderQuiz() {
    if (!quizContainer) return;

    // Si aún no han cargado los datos, mostrar mensaje
    if (!quizData.length) {
        quizContainer.innerHTML = '<p class="text-muted text-center">Cargando preguntas...</p>';
        return;
    }

    let html = '<div class="quiz-wrapper">';
    quizData.forEach((q, idx) => {
        html += `
            <div class="mb-4 p-3 border rounded" style="background-color: var(--bg);">
                <p class="fw-bold mb-3">${idx+1}. ${q.question}</p>
                <div class="options" data-question="${idx}">
        `;
        q.options.forEach((opt, optIdx) => {
            html += `
                <button class="quiz-option" data-q="${idx}" data-opt="${optIdx}" onclick="selectAnswer(${idx}, ${optIdx})">
                    ${opt}
                </button>
            `;
        });
        html += `</div><div id="explain-${idx}" class="explanation-box"></div></div>`;
    });
    html += '</div>';
    quizContainer.innerHTML = html;
}

window.selectAnswer = (qIndex, optIndex) => {
    const correct = quizData[qIndex].correct;
    const options = document.querySelectorAll(`[data-question="${qIndex}"] .quiz-option`);
    options.forEach(opt => opt.disabled = true);
    const selectedOpt = options[optIndex];
    if (optIndex === correct) {
        selectedOpt.classList.add('correct');
    } else {
        selectedOpt.classList.add('incorrect');
        options[correct].classList.add('correct');
    }
    const explainBox = document.getElementById(`explain-${qIndex}`);
    explainBox.style.display = 'block';
    explainBox.textContent = optIndex === correct ? '✅ ¡Correcto!' : `❌ Incorrecto. La respuesta correcta es: ${quizData[qIndex].options[correct]}`;
    explainBox.classList.toggle('incorrect', optIndex !== correct);
};

window.resetQuiz = () => {
    renderQuiz();
};

// Iniciar quiz al cargar la pestaña (cuando se muestra)
document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(btn => {
    btn.addEventListener('shown.bs.tab', (e) => {
        if (e.target.getAttribute('data-bs-target') === '#quiz') {
            renderQuiz();
        }
    });
});

// ========================
// OCULTAR PESTAÑA ANEXOS
// ========================
document.addEventListener('DOMContentLoaded', function() {
    const anexosTabButton = document.querySelector('button[data-bs-target="#anexos"]');
    if (anexosTabButton) {
        const parentLi = anexosTabButton.closest('li');
        if (parentLi) {
            parentLi.style.display = 'none';
        }
    }
});