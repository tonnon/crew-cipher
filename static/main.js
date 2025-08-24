// Lista de tripulantes agora vem do backend
const crew = window.crew;
let selected = 0;
let attempts = 0;
const maxAttempts = 3;
let disabledCrew = Array(crew.length).fill(false);
let timer = null;
let timeLeft = 30;
let timerActive = false;
let gameStarted = false;

function renderCrewList() {
    const list = document.getElementById('crew-list');
    list.innerHTML = '';
    // Bloqueia se NÃO começou, OU tempo acabou, OU tentativas máximas OU acesso liberado
    const block = !gameStarted || !timerActive || attempts >= maxAttempts;
    crew.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'crew-member' + (i === selected ? ' selected' : '') + (disabledCrew[i] ? ' disabled' : '');
        if (!disabledCrew[i] && !block) {
            div.onclick = () => selectCrew(i);
            div.style.cursor = 'pointer';
            div.tabIndex = 0;
        } else {
            div.style.opacity = 0.4;
            div.style.pointerEvents = 'none';
        }
        div.innerHTML = `<img src="${c.img}" class="crew-img" alt="Tripulante"><span>${c.name}</span>`;
        list.appendChild(div);
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
        roleDiv.style.fontSize = '12px';
        roleDiv.style.color = '#fff';
        roleDiv.style.marginBottom = '8px';
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
        attempts++;
        if(data.access) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<span class="success-msg">' + data.decrypted + '</span>';
            resultDiv.classList.add('highlight-success');
            setTimeout(() => resultDiv.classList.remove('highlight-success'), 1200);
            timerActive = false;
            clearInterval(timer);
            showSuccessEffect();
        } else {
            disabledCrew[selected] = true;
            renderCrewList();
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<span class="error-msg">' + data.decrypted + ` (${attempts}/${maxAttempts} tentativas)` + '</span>';
            resultDiv.classList.add('highlight-error');
            setTimeout(() => resultDiv.classList.remove('highlight-error'), 900);
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
        timerDiv.style.position = 'fixed';
        timerDiv.style.top = '18px';
        timerDiv.style.right = '32px';
        timerDiv.style.background = '#222';
        timerDiv.style.color = '#ffeb3b';
        timerDiv.style.fontFamily = "'Press Start 2P', Verdana, Arial, sans-serif";
        timerDiv.style.fontSize = '20px';
        timerDiv.style.padding = '8px 18px';
        timerDiv.style.border = '2px solid #ffb300';
        timerDiv.style.borderRadius = '8px';
        timerDiv.style.zIndex = 1000;
        document.body.appendChild(timerDiv);
    }
    timerDiv.textContent = `⏰ Tempo: ${timeLeft}s`;
}

function showRetryButton(msg) {
    timerActive = false;
    clearInterval(timer);
    let alertMsg = msg || 'Você excedeu o número de tentativas!';
    document.getElementById('result').innerHTML = `
        <span style="color:red;font-weight:bold;">${alertMsg}</span><br>
        <button id="retry-btn" style="
            margin-top:16px;
            padding:10px 28px;
            font-size:18px;
            font-family: 'Press Start 2P', Verdana, Arial, sans-serif;
            background: linear-gradient(90deg, #ffeb3b 60%, #ffb300 100%);
            color: #222;
            border: 2px solid #ffb300;
            border-radius: 8px;
            box-shadow: 0 2px 8px #0005;
            cursor: pointer;
            letter-spacing: 1px;
            transition: background 0.2s, color 0.2s;
        "
        onmouseover="this.style.background='#ffb300';this.style.color='#fff';"
        onmouseout="this.style.background='linear-gradient(90deg, #ffeb3b 60%, #ffb300 100%)';this.style.color='#222';"
        >Tente novamente</button>
    `;
    showAlarmEffect();
    renderCrewList();
    document.getElementById('retry-btn').onclick = function() {
        // Reinicia o jogo
        attempts = 0;
        disabledCrew = Array(crew.length).fill(false);
        gameStarted = true;
        timerActive = true;
        renderCrewList();
        selectCrew(0);
        document.getElementById('result').innerHTML = '';
        let timerDiv = document.getElementById('game-timer');
        if (timerDiv) timerDiv.remove();
        removeAlarmEffect();
        startTimer();
    };
}

function showAlarmEffect() {
    const door = document.getElementById('door');
    if (!door) return;
    door.classList.add('alarm');
    // Efeito de vibração
    door.style.animation = 'shake 0.15s infinite';
    // Borda vermelha piscando
    door.style.boxShadow = '0 0 24px 8px #ff0000, 0 4px 16px #000a';
    door.style.borderColor = '#ff0000';
}

function removeAlarmEffect() {
    const door = document.getElementById('door');
    if (!door) return;
    door.classList.remove('alarm');
    door.style.animation = '';
    door.style.boxShadow = '0 4px 16px #000a';
    door.style.borderColor = '#222';
}

// CSS para efeito de vibração e sucesso
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
    0% { transform: translate(0px, 0px) rotate(0deg); }
    20% { transform: translate(-2px, 2px) rotate(-1deg); }
    40% { transform: translate(-2px, -2px) rotate(1deg); }
    60% { transform: translate(2px, 2px) rotate(0deg); }
    80% { transform: translate(2px, -2px) rotate(1deg); }
    100% { transform: translate(0px, 0px) rotate(0deg); }
}
@keyframes success-shake {
    0% { transform: scale(1) rotate(0deg); }
    20% { transform: scale(1.04) rotate(-2deg); }
    40% { transform: scale(1.08) rotate(2deg); }
    60% { transform: scale(1.04) rotate(-1deg); }
    80% { transform: scale(1.02) rotate(1deg); }
    100% { transform: scale(1) rotate(0deg); }
}`;
document.head.appendChild(style);

// Adicione estilos para destaque visual
const style2 = document.createElement('style');
style2.innerHTML = `
.success-msg { color: #1a7f1a; font-size: 1.2em; font-weight: bold; }
.error-msg { color: #c00; font-size: 1.1em; font-weight: bold; }
.highlight-success { animation: highlight-success 1.2s; }
.highlight-error { animation: highlight-error 0.9s; }
@keyframes highlight-success {
  0% { background: #eaffea; }
  100% { background: none; }
}
@keyframes highlight-error {
  0% { background: #ffeaea; }
  100% { background: none; }
}`;
document.head.appendChild(style2);

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderCrewList();
    selectCrew(0);
    // Não inicia o timer automaticamente
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.onclick = function() {
            playBtn.style.display = 'none';
            gameStarted = true;
            timerActive = true; // Libera a lista imediatamente
            renderCrewList();
            startTimer();
        };
    }
});
