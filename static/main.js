// Dados dos tripulantes (exemplo)
const crew = [
    {id: 'joao', name: 'João', img: '/static/img/crew01.png', access: true, role: 'Navigator'},
    {id: 'maria', name: 'Maria', img: '/static/img/crew02.png', access: true, role: 'Medical Officer'},
    {id: 'ana', name: 'Ana', img: '/static/img/crew03.png', access: false, role: 'Quartermaster'},
    {id: 'bruno', name: 'Bruno', img: '/static/img/crew04.png', access: false, role: 'Security Officer'},
    {id: 'carla', name: 'Carla', img: '/static/img/crew05.png', access: false, role: 'Lab Technician'},
    {id: 'daniel', name: 'Daniel', img: '/static/img/crew06.png', access: false, role: 'Helmsman'},
    {id: 'elisa', name: 'Elisa', img: '/static/img/crew07.png', access: false, role: 'Cook/Chef'},
    {id: 'felipe', name: 'Felipe', img: '/static/img/crew08.png', access: false, role: 'Biochemist'},
    {id: 'giovana', name: 'Giovana', img: '/static/img/crew09.png', access: false, role: 'Deck Supervisor'},
    {id: 'heitor', name: 'Heitor', img: '/static/img/crew10.png', access: false, role: 'First Officer'},
    {id: 'isabela', name: 'Isabela', img: '/static/img/crew11.png', access: false, role: 'Steward'},
    {id: 'jorge', name: 'Jorge', img: '/static/img/crew12.png', access: false, role: 'Weapons Specialist'},
    {id: 'karina', name: 'Karina', img: '/static/img/crew13.png', access: false, role: 'Hazardous Materials Officer'},
    {id: 'lucas', name: 'Lucas', img: '/static/img/crew14.png', access: false, role: 'Mechanic'},
    {id: 'marina', name: 'Marina', img: '/static/img/crew15.png', access: false, role: 'Chief Engineer'},
    {id: 'nina', name: 'Nina', img: '/static/img/crew16.png', access: false, role: 'Electrician'},
    {id: 'otavio', name: 'Otávio', img: '/static/img/crew17.png', access: false, role: 'Assistant Engineer'},
    {id: 'paula', name: 'Paula', img: '/static/img/crew18.png', access: false, role: 'Radio Operator'},
    {id: 'rafael', name: 'Rafael', img: '/static/img/crew19.png', access: false, role: 'Cryptographer'},
    {id: 'sara', name: 'Sara', img: '/static/img/crew20.png', access: false, role: 'Captain'},
];
let selected = 0;
let attempts = 0;
const maxAttempts = 3;
let disabledCrew = Array(crew.length).fill(false);
let timer = null;
let timeLeft = 30;
let timerActive = false;
function renderCrewList() {
    const list = document.getElementById('crew-list');
    list.innerHTML = '';
    crew.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'crew-member' + (i === selected ? ' selected' : '') + (disabledCrew[i] ? ' disabled' : '');
        if (!disabledCrew[i]) {
            div.onclick = () => selectCrew(i);
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
    document.getElementById('badge-access').textContent = crew[i].access ? 'Acesso: Liberado' : 'Acesso: Restrito';
    // Adiciona o papel do tripulante
    let roleDiv = document.getElementById('badge-role');
    if (!roleDiv) {
        roleDiv = document.createElement('div');
        roleDiv.id = 'badge-role';
        roleDiv.style.fontSize = '12px';
        roleDiv.style.color = '#fff';
        roleDiv.style.marginBottom = '8px';
        document.getElementById('badge').insertBefore(roleDiv, document.getElementById('badge-access'));
    }
    roleDiv.textContent = 'Papel: ' + crew[i].role;
    renderCrewList();
}
// Drag and drop
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) {
    if (disabledCrew[selected]) {
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
            document.getElementById('result').innerHTML = '<span style="color:lime;">' + data.decrypted + '</span>';
            timerActive = false;
            clearInterval(timer);
            showSuccessEffect();
        } else {
            disabledCrew[selected] = true;
            renderCrewList();
            if (attempts >= maxAttempts) {
                showAlarmEffect();
                showRetryButton('Você excedeu o número de tentativas! Vazamento detectado! Risco de explosão!');
            } else {
                document.getElementById('result').innerHTML = '<span style="color:red;">' + data.decrypted + ` (${attempts}/${maxAttempts} tentativas)` + '</span>';
            }
        }
    });
}

// Animação de sucesso na porta
function showSuccessEffect() {
    const door = document.getElementById('door');
    if (!door) return;
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
    document.getElementById('retry-btn').onclick = function() {
        // Reinicia o jogo
        attempts = 0;
        disabledCrew = Array(crew.length).fill(false);
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

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    renderCrewList();
    selectCrew(0);
    startTimer();
});
