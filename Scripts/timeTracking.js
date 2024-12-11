document.addEventListener('DOMContentLoaded', function() {
    // Costanti
    const MAX_TIME = 10800; // 3 ore in secondi
    const TIME_MULTIPLIER = 10; // Accelera il tempo di 10 volte per i test
    const STORAGE_KEYS = {
        START_TIME: 'currentStartTime',
        BEST_TIME: 'bestTime',
        ACCUMULATED_TIME: 'accumulatedTime',
        LAST_PAUSE: 'lastPauseTime',
        LAST_STATE: 'timerState'
    };

    // Stato iniziale con validazione
    let startTime, bestTime, accumulatedTime, timeInterval;

    function initializeState() {
        try {
            // Recupera e valida i dati salvati
            const savedState = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_STATE) || '{}');
            const now = Date.now();

            startTime = validateTime(savedState.startTime, now);
            bestTime = validateTime(savedState.bestTime, 0);
            accumulatedTime = validateTime(savedState.accumulatedTime, 0);

            // Verifica se c'è stato un crash o chiusura improvvisa
            const lastPause = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_PAUSE));
            if (lastPause && !isNaN(lastPause)) {
                const timeSinceLastPause = now - lastPause;
                if (timeSinceLastPause < MAX_TIME * 1000) {
                    accumulatedTime += Math.floor(timeSinceLastPause * TIME_MULTIPLIER);
                }
            }

            // Salva lo stato iniziale validato
            saveState();
        } catch (error) {
            console.error('Errore durante l\'inizializzazione:', error);
            // Reset dello stato in caso di errore
            resetState();
        }
    }

    function validateTime(value, defaultValue) {
        const parsed = parseInt(value);
        return !isNaN(parsed) && parsed >= 0 ? parsed : defaultValue;
    }

    function saveState() {
        try {
            const state = {
                startTime: startTime,
                bestTime: bestTime,
                accumulatedTime: accumulatedTime
            };
            localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(state));
        } catch (error) {
            console.error('Errore durante il salvataggio dello stato:', error);
        }
    }

    function resetState() {
        startTime = Date.now();
        bestTime = 0;
        accumulatedTime = 0;
        saveState();
    }

    function handleVisibilityChange() {
        try {
            if (document.hidden) {
                clearInterval(timeInterval);
                const currentElapsed = Math.floor(((Date.now() - startTime) * TIME_MULTIPLIER));
                accumulatedTime += currentElapsed;
                localStorage.setItem(STORAGE_KEYS.LAST_PAUSE, Date.now().toString());
                saveState();
            } else {
                startTime = Date.now();
                timeInterval = setInterval(updateCurrentTime, 1000);
            }
        } catch (error) {
            console.error('Errore durante il cambio di visibilità:', error);
        }
    }

    function updateCurrentTime() {
        try {
            const now = Date.now();
            const currentElapsed = Math.floor(((now - startTime) * TIME_MULTIPLIER) / 1000);
            const totalElapsed = Math.floor(accumulatedTime/1000) + currentElapsed;
            
            if (totalElapsed >= MAX_TIME) {
                resetTimer();
                return;
            }

            updateUI(totalElapsed);
            saveState();
        } catch (error) {
            console.error('Errore durante l\'aggiornamento:', error);
        }
    }

    function updateUI(totalElapsed) {
        // Aggiorna la barra inferiore
        const width = Math.min((totalElapsed / MAX_TIME) * 100, 100);
        currentTimeBar.style.width = width + '%';
        currentTimeLabel.textContent = formatTime(totalElapsed);

        // Aggiorna colori e tempo rimanente
        if (bestTime > 0) {
            const ratio = totalElapsed / (bestTime/1000);
            updateBarColor(ratio);
            updateRemainingTime(totalElapsed);
        }
    }

    function updateBarColor(ratio) {
        if (ratio <= 0.5) {
            currentTimeBar.style.backgroundColor = 'var(--danger-color)';
        } else if (ratio <= 0.8) {
            currentTimeBar.style.backgroundColor = 'var(--primary-color)';
        } else if (ratio < 1) {
            currentTimeBar.style.backgroundColor = '#2ecc71';
        } else {
            currentTimeBar.style.backgroundColor = 'var(--secondary-color)';
        }
    }

    function updateRemainingTime(totalElapsed) {
        const remaining = Math.floor(bestTime/1000) - totalElapsed;
        const overlay = document.getElementById('remainingTimeOverlay');
        if (remaining > 0) {
            overlay.textContent = `-${formatTime(remaining)} al record`;
        } else {
            overlay.textContent = `+${formatTime(Math.abs(remaining))} oltre il record`;
        }
    }

    function resetTimer() {
        const totalElapsed = Math.floor(accumulatedTime/1000) + 
            Math.floor(((Date.now() - startTime) * TIME_MULTIPLIER) / 1000);
        
        if (totalElapsed * 1000 > bestTime) {
            bestTime = totalElapsed * 1000;
            localStorage.setItem(STORAGE_KEYS.BEST_TIME, bestTime.toString());
            
            const width = Math.min((totalElapsed / MAX_TIME) * 100, 100);
            lastTimeBar.style.width = width + '%';
            lastTimeLabel.textContent = formatTime(totalElapsed);
            
            currentTimeBar.classList.add('celebrate');
            setTimeout(() => currentTimeBar.classList.remove('celebrate'), 3000);
        }

        // Resetta il timer corrente
        startTime = Date.now();
        accumulatedTime = 0;
        localStorage.setItem(STORAGE_KEYS.START_TIME, startTime.toString());
        localStorage.setItem(STORAGE_KEYS.ACCUMULATED_TIME, '0');
        currentTimeBar.style.width = '0%';
        currentTimeLabel.textContent = '00:00:00';
    }

    function resetBestTime() {
        bestTime = 0;
        localStorage.removeItem(STORAGE_KEYS.BEST_TIME);
        lastTimeBar.style.width = '0%';
        lastTimeLabel.textContent = '00:00:00';
        document.getElementById('remainingTimeOverlay').textContent = '';
    }

    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    // Elementi DOM
    const currentTimeBar = document.getElementById('currentTimeBar');
    const lastTimeBar = document.getElementById('lastTimeBar');
    const currentTimeLabel = document.getElementById('currentTimeLabel');
    const lastTimeLabel = document.getElementById('lastTimeLabel');

    // Inizializzazione con gestione errori
    try {
        initializeState();
        
        // Event listeners con gestione errori
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', () => {
            try {
                const currentElapsed = Math.floor(((Date.now() - startTime) * TIME_MULTIPLIER));
                accumulatedTime += currentElapsed;
                saveState();
            } catch (error) {
                console.error('Errore durante il salvataggio finale:', error);
            }
        });

        // Avvia il timer
        timeInterval = setInterval(updateCurrentTime, 1000);
        
        // Aggiungi event listeners per i pulsanti
        document.getElementById('clickButton').addEventListener('click', resetTimer);
        document.getElementById('resetBestTime').addEventListener('click', resetBestTime);
    } catch (error) {
        console.error('Errore durante l\'inizializzazione generale:', error);
        resetState();
    }
}); 