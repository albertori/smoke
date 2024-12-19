document.addEventListener('DOMContentLoaded', function() {
    // Inizializza il logger
    Logger.init();
    
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

    // Aggiungiamo una funzione per fermare il timer
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        isTimerActive = false;
        resetButton.textContent = 'Inizia';
        resetCurrentBar();
    }

    // Modifichiamo l'event listener per il logout
    document.addEventListener('visibilitychange', function() {
        // Non facciamo nulla se la pagina viene solo nascosta
        if (document.visibilityState === 'hidden') {
            return;
        }
    });

    // Aggiungiamo un listener specifico per il logout
    document.querySelectorAll('a[href*="logout"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (isTimerActive) {
                // Fermiamo il timer e salviamo lo stato
                stopTimer();
                saveStateToDb(true);
            }
        });
    });

    // Modifichiamo la funzione saveStateToDb
    function saveStateToDb(isLogout = false) {
        Logger.log('Inizio saveStateToDb', { isLogout });
        
        const currentTime = isTimerActive ? 
            Math.floor((Date.now() - (startTime || Date.now())) / 100) * TIME_MULTIPLIER : 
            0;
        
        const recordTime = parseTime(secondTimeLabel.textContent);
        const startTimeStr = startTime ? new Date(startTime).toISOString() : null;
        
        Logger.log('Dati da salvare:', {
            currentTime,
            recordTime,
            startTime: startTimeStr,
            isLogout,
            isTimerActive
        });

        const data = JSON.stringify({
            currentTime: currentTime,
            recordTime: recordTime,
            startTime: startTimeStr,
            isLogout: isLogout,
            isTimerActive: isTimerActive
        });

        if (isLogout) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'benefici.aspx/SalvaStatoTimer', false);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(data);
            
            Logger.log('Risposta salvataggio sincrono:', xhr.responseText);
            return;
        }

        // Altrimenti usa fetch normale
        fetch('benefici.aspx/SalvaStatoTimer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        })
        .then(response => {
            Logger.log('Response ricevuta:', response);
            return response.json();
        })
        .then(data => {
            Logger.log('Dati salvati:', data);
            if (data.d && data.d.success) {
                Logger.log('Salvataggio completato con successo');
            } else {
                Logger.error('Errore nel salvataggio:', data.d ? data.d.error : 'Risposta non valida');
            }
        })
        .catch(error => {
            Logger.error('Errore durante il salvataggio:', error);
        });
    }

    // Funzione per caricare lo stato iniziale
    function loadInitialState() {
        Logger.log('Loading initial state');
        
        fetch('benefici.aspx/GetStatoTimer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            Logger.log('State loaded', data);
            
            if (data.d && data.d.hasActiveTimer && data.d.currentTime > 0) {
                // Verifichiamo che il timer sia effettivamente attivo e che ci sia un tempo corrente
                const lastStartTime = new Date(data.d.startTime);
                const now = new Date();
                const timeDiff = now - lastStartTime;
                
                // Se sono passate più di 3 ore, non facciamo ripartire il timer
                if (timeDiff > (3 * 60 * 60 * 1000)) {
                    Logger.log('Timer troppo vecchio, non viene riavviato');
                    resetCurrentBar();
                    return;
                }
                
                Logger.log('Active timer found, restoring state');
                
                startTime = Date.now() - (data.d.currentTime * 100 / TIME_MULTIPLIER);
                bestTime = data.d.recordTime;
                isTimerActive = true;
                resetButton.textContent = 'Resetta';
                
                updateCurrentBar(data.d.currentTime);
                secondTimeLabel.textContent = formatTime(data.d.recordTime);
                updateBestBar();
                
                startTimer();
                Logger.log('Timer restored successfully');
            } else {
                Logger.log('No active timer found or invalid time');
                resetCurrentBar();
            }
        })
        .catch(error => {
            Logger.error('Error loading state', error);
            resetCurrentBar();
        });
    }

    // Modifica la gestione della chiusura della pagina
    window.addEventListener('beforeunload', function(e) {
        if (isTimerActive) {
            Logger.log('Salvataggio automatico prima di chiudere la pagina');
            e.preventDefault(); // Necessario per alcuni browser
            saveStateToDb(true);
            e.returnValue = ''; // Necessario per Chrome
        }
    });

    // Modifica il click handler del resetButton
    resetButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        Logger.log('Click su resetButton', { currentText: this.textContent });
        
        if (this.textContent === 'Inizia') {
            startTimer();
            this.textContent = 'Resetta';
            isTimerActive = true;
            Logger.log('Timer avviato');
        } else {
            // Salva il record nel DB prima di resettare
            Logger.log('Tentativo di salvare lo stato prima del reset');
            saveStateToDb(true); // Usa la versione sincrona
            
            // Aspetta un momento per assicurarsi che il salvataggio sia completato
            setTimeout(() => {
                resetCurrentBar();
                secondTimeLabel.textContent = '00:00:00';
                updateBestBar();
                this.textContent = 'Inizia';
                isTimerActive = false;
                Logger.log('Timer resettato');
            }, 100);
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

    // Carica lo stato iniziale all'avvio
    loadInitialState();
}); 