// Game Controller - Central coordination of all components
class GameController {
    constructor() {
        this.crew = window.crew || [];
        this.attempts = 0;
        this.maxAttempts = 3;
        this.timer = null;
        this.timeLeft = 30;
        this.timerActive = false;
        this.gameStarted = false;
        
        // Wait for all components to be loaded
        this.waitForComponents();
    }
    
    // Wait for all component instances to be available
    waitForComponents() {
        const checkComponents = () => {
            if (window.timerComponent && window.doorComponent && 
                window.crewListComponent && window.badgeComponent && 
                window.buttonComponent && window.messageComponent) {
                this.initializeGame();
            } else {
                setTimeout(checkComponents, 50);
            }
        };
        checkComponents();
    }
    
    // Initialize game
    initializeGame() {
        // Update crew data in crew list component
        window.crewListComponent.updateCrew(this.crew);
        
        // Initial render
        window.crewListComponent.render(this.gameStarted, this.timerActive, this.attempts, this.maxAttempts);
        window.crewListComponent.selectCrew(0);
        window.timerComponent.hide();
        window.buttonComponent.showPlayButton();
    }
    
    // Start game
    startGame() {
        window.buttonComponent.hideButtons();
        
        // Reset game state
        this.attempts = 0;
        window.crewListComponent.resetDisabled();
        this.gameStarted = true;
        this.timerActive = true;
        
        // Update UI
        window.crewListComponent.render(this.gameStarted, this.timerActive, this.attempts, this.maxAttempts);
        window.crewListComponent.selectCrew(0);
        window.messageComponent.clearMessage();
        window.timerComponent.reset();
        window.doorComponent.removeAlarmEffect();
        this.startTimer();
    }
    
    // Start timer
    startTimer() {
        this.timeLeft = 30;
        this.timerActive = true;
        window.timerComponent.show();
        
        // Initialize progress bar
        window.timerComponent.startProgress();
        this.updateTimerDisplay();
        
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (!this.timerActive) return;
            
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.timerActive = false;
                clearInterval(this.timer);
                this.showGameEnd('Tempo esgotado! Vazamento detectado! Risco de explosão!');
            }
        }, 1000);
    }
    
    // Update timer display
    updateTimerDisplay() {
        window.timerComponent.updateTime(this.timeLeft);
    }
    
    // Process drop attempt on door
    processDropAttempt() {
        if (!this.timerActive || this.attempts >= this.maxAttempts) {
            if (this.attempts >= this.maxAttempts) {
                this.showGameEnd('Você excedeu o número de tentativas! Vazamento detectado! Risco de explosão!');
            }
            return;
        }
        
        const selectedCrew = window.crewListComponent.getSelected();
        const code = window.badgeComponent.getCurrentCode();
        
        fetch('/check_access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ crew: selectedCrew.id, code })
        })
        .then(r => {
            if (!r.ok) throw new Error('Network response was not ok');
            return r.json();
        })
        .then(data => {
            this.attempts++;
            
            if (data.access) {
                this.handleSuccess(data.decrypted);
            } else {
                this.handleFailure(data.decrypted);
            }
        })
        .catch(error => {
            console.error('Error checking access:', error);
            this.handleFailure('Erro de conexão. Tente novamente.');
        });
    }
    
    // Handle success
    handleSuccess(message) {
        window.messageComponent.showMessage(message, 'success');
        
        this.timerActive = false;
        clearInterval(this.timer);
        window.timerComponent.hide();
        this.attempts = this.maxAttempts; // Prevent further attempts
        window.doorComponent.showSuccessEffect();
        window.crewListComponent.render(this.gameStarted, this.timerActive, this.attempts, this.maxAttempts);
    }
    
    // Handle failure
    handleFailure(message) {
        const selectedIndex = window.crewListComponent.getSelectedIndex();
        const selectedCrew = window.crewListComponent.getSelected();
        
        // Only disable crew member if not 'Materiais Perigosos'
        if (selectedCrew.role?.trim() !== 'Materiais Perigosos') {
            window.crewListComponent.disableCrew(selectedIndex);
        }
        
        window.crewListComponent.render(this.gameStarted, this.timerActive, this.attempts, this.maxAttempts);
        window.messageComponent.showMessage(`${message} (${this.attempts}/${this.maxAttempts} tentativas)`, 'error');
        
        if (this.attempts >= this.maxAttempts) {
            this.showGameEnd('Você excedeu o número de tentativas! Vazamento detectado! Risco de explosão!');
        }
    }
    
    // Show game end
    showGameEnd(message) {
        window.doorComponent.showAlarmEffect();
        this.showRetryButton(message);
    }
    
    // Show retry button
    showRetryButton(msg) {
        this.timerActive = false;
        clearInterval(this.timer);
        window.timerComponent.hide();
        
        const alertMsg = msg || 'Você excedeu o número de tentativas!';
        window.messageComponent.showMessage(alertMsg, 'error');
        
        window.buttonComponent.showRetryButton();
        window.doorComponent.showAlarmEffect();
        window.crewListComponent.render(this.gameStarted, this.timerActive, this.attempts, this.maxAttempts);
    }
    
    // Restart game
    restartGame() {
        window.buttonComponent.hideButtons();
        
        fetch('/restart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(r => {
            if (!r.ok) throw new Error('Network response was not ok');
            return r.json();
        })
        .then(data => {
            if (data.ok && data.crew) {
                this.updateGameWithNewCrew(data.crew);
            }
        })
        .catch(error => {
            console.error('Error restarting:', error);
            // Fallback to local reset
            this.resetGameLocally();
        });
    }
    
    // Update game with new crew
    updateGameWithNewCrew(newCrew) {
        window.crew = newCrew;
        this.crew = newCrew;
        window.crewListComponent.updateCrew(newCrew);
        this.resetGameLocally();
    }
    
    // Reset game locally
    resetGameLocally() {
        this.attempts = 0;
        window.crewListComponent.resetDisabled();
        this.gameStarted = true;
        this.timerActive = true;
        
        window.crewListComponent.render(this.gameStarted, this.timerActive, this.attempts, this.maxAttempts);
        window.crewListComponent.selectCrew(0);
        window.messageComponent.clearMessage();
        window.timerComponent.reset();
        window.doorComponent.removeAlarmEffect();
        this.startTimer();
    }
    
    // Check if game is blocked
    isGameBlocked() {
        return !this.gameStarted || !this.timerActive || this.attempts >= this.maxAttempts;
    }
}

// Initialize game controller when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.gameController = new GameController();
});

// Patch para garantir atualização do badge ao selecionar tripulante
(function() {
    if (window.crewListComponent && typeof window.crewListComponent.selectCrew === 'function') {
        const originalSelectCrew = window.crewListComponent.selectCrew;
        window.crewListComponent.selectCrew = function(index) {
            originalSelectCrew.call(this, index);
            if (window.crew && window.badgeComponent) {
                window.badgeComponent.updateBadge(window.crew[index]);
            }
        };
    } else {
        // Se o componente ainda não existe, tenta novamente após DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            if (window.crewListComponent && typeof window.crewListComponent.selectCrew === 'function') {
                const originalSelectCrew = window.crewListComponent.selectCrew;
                window.crewListComponent.selectCrew = function(index) {
                    originalSelectCrew.call(this, index);
                    if (window.crew && window.badgeComponent) {
                        window.badgeComponent.updateBadge(window.crew[index]);
                    }
                };
            }
        });
    }
})();
