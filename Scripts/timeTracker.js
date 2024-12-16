document.addEventListener('DOMContentLoaded', function() {
    // Costanti
    const MAX_TIME = 10800; // 3 ore in secondi
    const TIMER_SPEED = 100; // Intervallo in millisecondi (100ms = 10x più veloce)
    const TIME_MULTIPLIER = 10; // Moltiplicatore per compensare la velocità
    
    // Variabili di stato
    let startTime = null;
    let timerInterval = null;
    let bestTime = 0;
    let isTimerActive = false;
    
    // Elementi DOM
    const currentTimeLabel = document.getElementById('currentTimeLabel');
    const secondTimeLabel = document.getElementById('secondTimeLabel');
    const resetButton = document.getElementById('resetBestTime');
    const clickButton = document.getElementById('clickButton');
    const currentTimeBar = document.getElementById('lastTimeBar');
    const bestTimeBar = document.getElementById('secondTimeBar');
    
    // Verifica elementi DOM
    console.log('Elementi DOM trovati:', {
        currentTimeLabel,
        secondTimeLabel,
        resetButton,
        clickButton,
        currentTimeBar,
        bestTimeBar
    });
    
    // Verifica che bestTimeBar sia l'elemento corretto
    console.log('bestTimeBar element:', bestTimeBar);
    console.log('bestTimeBar parent:', bestTimeBar.parentElement);
    console.log('bestTimeBar classList:', bestTimeBar.classList);
    
    // Applica stili CSS necessari
    if (bestTimeBar) {
        // Stili per il container padre
        bestTimeBar.parentElement.style.cssText = `
            position: relative;
            width: 100%;
            height: 20px;
            background-color: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
        `;

        // Stili per la barra di progresso
        bestTimeBar.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            background-color: rgb(255, 153, 153);
            transition: width 0.3s ease-out;
            border-radius: 10px;
            width: 0%;
        `;
    }
    
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    
    function parseTime(timeString) {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    function pad(num) {
        return num.toString().padStart(2, '0');
    }
    
    function getBarColor(percentage) {
        if (percentage < 33) return '#ff9999';
        if (percentage < 66) return '#ffcc99';
        return '#99ff99';
    }
    
    function updateBestBar() {
        const recordTime = parseTime(secondTimeLabel.textContent);
        const progress = Math.min((recordTime / MAX_TIME) * 100, 100);
        
        console.log('Aggiornamento barra:', {
            element: bestTimeBar,
            width: `${progress}%`,
            recordTime,
            progress
        });

        if (bestTimeBar) {
            // Forza il repaint
            bestTimeBar.style.display = 'none';
            bestTimeBar.offsetHeight;
            bestTimeBar.style.display = 'block';
            
            requestAnimationFrame(() => {
                bestTimeBar.style.width = `${progress}%`;
            });
        }
    }
    
    function updateCurrentBar(elapsed) {
        const progress = Math.min((elapsed / MAX_TIME) * 100, 100);
        currentTimeBar.style.width = `${progress}%`;
        currentTimeBar.style.backgroundColor = getBarColor(progress);
        currentTimeLabel.textContent = formatTime(elapsed);
    }
    
    function resetCurrentBar() {
        currentTimeLabel.textContent = '00:00:00';
        currentTimeBar.style.width = '0%';
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    function startTimer() {
        startTime = Date.now();
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 100) * TIME_MULTIPLIER;
                updateCurrentBar(elapsed);
                
                // Se il tempo corrente è maggiore del record
                if (elapsed > parseTime(secondTimeLabel.textContent)) {
                    secondTimeLabel.textContent = formatTime(elapsed);
                    updateBestBar();
                }
            }, TIMER_SPEED);
        }
    }

    // Click handler per il resetButton
    resetButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (this.textContent === 'Inizia') {
            startTimer();
            this.textContent = 'Resetta';
            isTimerActive = true;
        } else {
            resetCurrentBar();
            secondTimeLabel.textContent = '00:00:00';
            updateBestBar();
            this.textContent = 'Inizia';
            isTimerActive = false;
        }
    });

    // Click handler per il clickButton
    clickButton.addEventListener('click', function() {
        if (isTimerActive) {
            const currentTime = Math.floor((Date.now() - startTime) / 100) * TIME_MULTIPLIER;
            if (currentTime > parseTime(secondTimeLabel.textContent)) {
                secondTimeLabel.textContent = formatTime(currentTime);
                updateBestBar();
            }
            resetCurrentBar();
            startTimer();
        }
    });

    // Inizializzazione
    resetCurrentBar();
    updateBestBar();

    // Aggiungiamo un observer per monitorare i cambiamenti della barra
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            console.log('Cambiamento rilevato:', {
                type: mutation.type,
                target: mutation.target,
                attributeName: mutation.attributeName,
                oldValue: mutation.oldValue
            });
        });
    });

    if (bestTimeBar) {
        observer.observe(bestTimeBar, {
            attributes: true,
            attributeOldValue: true
        });
    }

    // Aggiungi un MutationObserver per il secondTimeLabel
    const labelObserver = new MutationObserver(() => {
        requestAnimationFrame(() => {
            updateBestBar();
        });
    });

    if (secondTimeLabel) {
        labelObserver.observe(secondTimeLabel, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }
}); 