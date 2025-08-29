// Lista de tripulantes agora vem do backend
let crew = window.crew;
let selected = 0;
let attempts = 0;
const maxAttempts = 3;
let disabledCrew = Array(crew.length).fill(false);
let timer = null;
let timeLeft = 30;
let timerActive = false;
let gameStarted = false;

function renderCrewList() {
    const contentContainer = document.getElementById('crew-list-content');
    
    // Clear only crew member elements from the content area
    const crewMembers = contentContainer.querySelectorAll('.crew-member');
    crewMembers.forEach(member => member.remove());
    
    // Bloqueia se NÃO começou, OU tempo acabou, OU tentativas máximas OU acesso liberado
    const block = !gameStarted || !timerActive || attempts >= maxAttempts;
    crew.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'crew-member' + (i === selected ? ' selected' : '') + (disabledCrew[i] || block ? ' disabled' : '');
        
        // Only make clickable if not disabled individually AND not globally blocked
        if (!disabledCrew[i] && !block) {
            div.onclick = () => selectCrew(i);
            div.tabIndex = 0;
        }
        
        // Modern crew member structure with info section
        div.innerHTML = `
            <img src="${c.img}" class="crew-img" alt="Tripulante">
            <div class="crew-info">
                <div class="crew-name">${c.name}</div>
                <div class="crew-id">ID: ${c.id}</div>
            </div>
        `;
        
        contentContainer.appendChild(div);
    });
}

function selectCrew(i) {
    selected = i;
    document.getElementById('badge-img').src = crew[i].img;
    document.getElementById('badge-name').textContent = crew[i].name;
    // Adiciona o papel do tripulante
    let roleDiv = document.getElementById('badge-role');
    if (!roleDiv) {
        roleDiv = document.createElement('div');
        roleDiv.id = 'badge-role';
        document.getElementById('badge').insertBefore(roleDiv, document.getElementById('badge-crypto'));
    }
    roleDiv.textContent = 'Papel: ' + crew[i].role;
    // Buscar token criptografado individual
    fetch(`/get_token/${crew[i].id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById('badge-crypto').textContent = data.encrypted;
        });
    renderCrewList();
}
// Drag and drop
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) {
    // Bloqueia drag se NÃO começou, tempo acabou, tentativas máximas ou acesso liberado
    if (!gameStarted || !timerActive || attempts >= maxAttempts || disabledCrew[selected]) {
        ev.preventDefault();
        return false;
    }
    ev.dataTransfer.setData("text", "badge");
}
function drop(ev) {
    ev.preventDefault();
    if (!timerActive) return;
    // Se já acertou, não permite mais tentativas
    if (!timerActive) return;
    // Se já errou 3 vezes, bloqueia tudo
    if (attempts >= maxAttempts) {
        showAlarmEffect();
        showRetryButton('Você excedeu o número de tentativas! Vazamento detectado! Risco de explosão!');
        return;
    }
    const crewId = crew[selected].id;
    const code = document.getElementById('badge-crypto').textContent;
    fetch('/check_access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew: crewId, code })
    })
    .then(r => r.json())
    .then(data => {
        if(data.access) {
            const messageContainer = document.getElementById('message-container');
            messageContainer.innerHTML = '<div class="message success-message">' + data.decrypted + '</div>';
            messageContainer.classList.add('highlight-success');
            setTimeout(() => messageContainer.classList.remove('highlight-success'), 1200);
            timerActive = false;
            clearInterval(timer);
            // Impede qualquer nova tentativa após sucesso
            attempts = maxAttempts;
            showSuccessEffect();
        } else {
            attempts++;
            // Só desabilita se NÃO for Materiais Perigosos
            if (!(crew[selected].role && crew[selected].role.trim() === 'Materiais Perigosos')) {
                disabledCrew[selected] = true;
            }
            renderCrewList();
            const messageContainer = document.getElementById('message-container');
            messageContainer.innerHTML = '<div class="message error-message">' + data.decrypted + ` (${attempts}/${maxAttempts} tentativas)` + '</div>';
            messageContainer.classList.add('highlight-error');
            setTimeout(() => messageContainer.classList.remove('highlight-error'), 900);
            if (attempts >= maxAttempts) {
                showAlarmEffect();
                showRetryButton('Você excedeu o número de tentativas! Vazamento detectado! Risco de explosão!');
            }
        }
    });
}

// Animação de sucesso na porta
function showSuccessEffect() {
    const door = document.getElementById('door');
    if (!door) return;
    // Bloqueia tudo ao liberar acesso
    timerActive = false;
    renderCrewList();
    // Animação de abertura: adiciona classe 'open' para as metades se afastarem
    door.classList.add('open');
    // Remove a classe após 2.5s para permitir reset em tentativas futuras
    setTimeout(() => {
        door.classList.remove('open');
    }, 2500);
}
// Timer HUD
function startTimer() {
    timeLeft = 30;
    timerActive = true;
    updateTimerDisplay();
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        if (!timerActive) return;
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            timerActive = false;
            clearInterval(timer);
            showAlarmEffect();
            showRetryButton('Tempo esgotado! Vazamento detectado! Risco de explosão!');
        }
    }, 1000);
}

function updateTimerDisplay() {
    let timerDiv = document.getElementById('game-timer');
    if (!timerDiv) {
        timerDiv = document.createElement('div');
        timerDiv.id = 'game-timer';
        timerDiv.className = 'game-timer';
        // Adiciona dentro do container correto
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.appendChild(timerDiv);
        } else {
            document.body.appendChild(timerDiv); // fallback
        }
    }
    // Timer com radar animado e fonte digital
    timerDiv.textContent = `⏰ Tempo: ${timeLeft}s`;
}

// Dynamic button management
function showPlayButton() {
    const playBtn = document.getElementById('play-btn');
    const retryBtn = document.getElementById('retry-btn');
    
    if (playBtn) {
        playBtn.classList.remove('hidden');
        playBtn.classList.add('visible');
    }
    if (retryBtn) {
        retryBtn.classList.add('hidden');
        retryBtn.classList.remove('visible');
    }

    if (playBtn) {
        playBtn.onclick = function() {
            playBtn.classList.add('hidden');
            playBtn.classList.remove('visible');
            // Sempre reinicia a tripulação ao jogar
            fetch('/restart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(r => r.json())
            .then(data => {
                if (data.ok && data.crew) {
                    window.crew = data.crew;
                    crew = data.crew;
                    attempts = 0;
                    disabledCrew = Array(crew.length).fill(false);
                    gameStarted = true;
                    timerActive = true;
                    renderCrewList();
                    selectCrew(0);
                    document.getElementById('message-container').innerHTML = '';
                    let timerDiv = document.getElementById('game-timer');
                    if (timerDiv) timerDiv.remove();
                    removeAlarmEffect();
                    startTimer();
                }
            })
            .catch(error => {
                console.error('Erro ao iniciar:', error);
                // fallback local
                attempts = 0;
                disabledCrew = Array(crew.length).fill(false);
                gameStarted = true;
                timerActive = true;
                renderCrewList();
                selectCrew(0);
                document.getElementById('message-container').innerHTML = '';
                let timerDiv = document.getElementById('game-timer');
                if (timerDiv) timerDiv.remove();
                removeAlarmEffect();
                startTimer();
            });
        };
    }
}

function showRetryButton(msg) {
    timerActive = false;
    clearInterval(timer);
    let alertMsg = msg || 'Você excedeu o número de tentativas!';
    document.getElementById('message-container').innerHTML = `
        <div class="message error-message">${alertMsg}</div>
    `;

    // Mostra o botão de tentar novamente e esconde o de jogar
    const playBtn = document.getElementById('play-btn');
    const retryBtn = document.getElementById('retry-btn');

    if (playBtn) {
        playBtn.classList.add('hidden');
        playBtn.classList.remove('visible');
    }
    if (retryBtn) {
        retryBtn.classList.remove('hidden');
        retryBtn.classList.add('visible');
    }

    showAlarmEffect();
    renderCrewList();

    // Garante que o botão só pode ser mostrado por tempo ou maxAttempts
    if (retryBtn) {
        retryBtn.onclick = function() {
            // Reinicia o jogo imediatamente ao clicar
            if (playBtn) {
                playBtn.classList.remove('visible');
                playBtn.classList.add('hidden');
            }
            retryBtn.classList.add('hidden');
            retryBtn.classList.remove('visible');
            fetch('/restart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(r => r.json())
            .then(data => {
                if (data.ok && data.crew) {
                    window.crew = data.crew;
                    crew = data.crew;
                    attempts = 0;
                    disabledCrew = Array(crew.length).fill(false);
                    gameStarted = true;
                    timerActive = true;
                    renderCrewList();
                    selectCrew(0);
                    document.getElementById('message-container').innerHTML = '';
                    let timerDiv = document.getElementById('game-timer');
                    if (timerDiv) timerDiv.remove();
                    removeAlarmEffect();
                    startTimer();
                }
            })
            .catch(error => {
                console.error('Erro ao reiniciar:', error);
                attempts = 0;
                disabledCrew = Array(crew.length).fill(false);
                gameStarted = true;
                timerActive = true;
                renderCrewList();
                selectCrew(0);
                document.getElementById('message-container').innerHTML = '';
                let timerDiv = document.getElementById('game-timer');
                if (timerDiv) timerDiv.remove();
                removeAlarmEffect();
                startTimer();
            });
        };
    }
}

function showAlarmEffect() {
    const door = document.getElementById('door');
    if (!door) return;
    door.classList.add('alarm');
}

function removeAlarmEffect() {
    const door = document.getElementById('door');
    if (!door) return;
    door.classList.remove('alarm');
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderCrewList();
    selectCrew(0);
    // Sempre esconde o botão de tentar novamente ao iniciar
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.classList.add('hidden');
        retryBtn.classList.remove('visible');
    }
    // Mostrar botão de jogar inicialmente
    showPlayButton();
});
