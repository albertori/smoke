document.addEventListener('DOMContentLoaded', function() {
    // Costanti
    const MAX_TIME = 10800; // 3 ore in secondi
    
    // Variabili di stato
    let startTime = null;
    let timerInterval = null;
    let bestTime = 0;
    
    // Elementi DOM
    const currentTimeLabel = document.getElementById('currentTimeLabel');
    const secondTimeLabel = document.getElementById('secondTimeLabel');
    const resetButton = document.getElementById('resetBestTime');
    const clickButton = document.getElementById('clickButton');
    const currentTimeBar = document.getElementById('lastTimeBar');
    const bestTimeBar = document.getElementById('secondTimeBar');
    
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    
    function pad(num) {
        return num.toString().padStart(2, '0');
    }
    
    function getBarColor(percentage) {
        if (percentage < 33) return '#ff9999';
        if (percentage < 66) return '#ffcc99';
        return '#99ff99';
    }
    
    function resetCurrentBar() {
        currentTimeLabel.textContent = '00:00:00';
        currentTimeBar.style.width = '0%';
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function resetAllBars() {
        resetCurrentBar();
        bestTime = 0;
        secondTimeLabel.textContent = '00:00:00';
        bestTimeBar.style.width = '0%';
    }
    
    function startTimer() {
        startTime = Date.now();
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);
        }
    }
    
    function updateCurrentBar(elapsed) {
        const progress = Math.min((elapsed / MAX_TIME) * 100, 100);
        currentTimeBar.style.width = `${progress}%`;
        currentTimeBar.style.backgroundColor = getBarColor(progress);
        currentTimeLabel.textContent = formatTime(elapsed);
    }
    
    function updateBestBar(time) {
        const progress = Math.min((time / MAX_TIME) * 100, 100);
        bestTimeBar.style.width = `${progress}%`;
        bestTimeBar.style.backgroundColor = getBarColor(progress);
        secondTimeLabel.textContent = formatTime(time);
    }
    
    function checkAndUpdateBestTime(currentTime) {
        if (currentTime > bestTime) {
            bestTime = currentTime;
            updateBestBar(bestTime);
        }
    }
    
    function updateTimer() {
        if (!startTime) return;
        
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        
        updateCurrentBar(elapsed);
        checkAndUpdateBestTime(elapsed);
    }
    
    // Gestione del resetBestTime button (Inizia/Resetta)
    resetButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (this.textContent === 'Inizia') {
            startTimer();
            this.textContent = 'Resetta';
        } else {
            resetAllBars();
            this.textContent = 'Inizia';
        }
    });
    
    // Gestione del clickButton
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'clickButton') {
            const currentTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
            
            // Controlla e aggiorna il record se necessario
            checkAndUpdateBestTime(currentTime);
            
            // Resetta la barra corrente e riavvia immediatamente il timer
            resetCurrentBar();
            startTimer();
        }
    });
    
    // Inizializzazione
    resetCurrentBar();
    updateBestBar(bestTime);
}); 