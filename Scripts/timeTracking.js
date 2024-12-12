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
    const MAX_INACTIVE_TIME = 10800000; // 3 ore in millisecondi

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
            console.log('💾 Stato salvato:', state);
            
            // Log del record attuale
            console.log('🏆 Record attuale:', formatTime(Math.floor(bestTime/1000)));
        } catch (error) {
            console.error('❌ Errore durante il salvataggio dello stato:', error);
            console.error('Stack:', error.stack);
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
                console.log('🔄 Tab nascosto - Pausa timer');
                clearInterval(timeInterval);
                
                const currentElapsed = Math.floor(((Date.now() - startTime) * TIME_MULTIPLIER));
                console.log('⏱️ Tempo trascorso:', currentElapsed, 'ms');
                
                accumulatedTime += currentElapsed;
                console.log('💾 Tempo accumulato totale:', accumulatedTime, 'ms');
                
                const pauseTime = Date.now();
                localStorage.setItem(STORAGE_KEYS.LAST_PAUSE, pauseTime.toString());
                console.log('📝 Salvato timestamp pausa:', pauseTime);
                
                // Imposta un timeout per il controllo delle 3 ore
                setTimeout(() => checkInactiveTime(pauseTime), MAX_INACTIVE_TIME);
                
                saveState();
            } else {
                console.log('🔄 Tab attivo - Ripresa timer');
                const lastPauseTime = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_PAUSE));
                
                if (lastPauseTime) {
                    const inactiveTime = Date.now() - lastPauseTime;
                    console.log('⏱️ Tempo di inattività:', formatTime(Math.floor(inactiveTime/1000)));
                    
                    if (inactiveTime >= MAX_INACTIVE_TIME) {
                        console.log('⚠️ Superato limite di 3 ore di inattività');
                        saveAndReset();
                        return;
                    }
                }
                
                startTime = Date.now();
                timeInterval = setInterval(updateCurrentTime, 1000);
                console.log('▶️ Timer riavviato');
            }
        } catch (error) {
            console.error('❌ Errore durante il cambio di visibilità:', error);
            console.error('Stack:', error.stack);
        }
    }

    function checkInactiveTime(pauseTime) {
        if (document.hidden) {
            const inactiveTime = Date.now() - pauseTime;
            if (inactiveTime >= MAX_INACTIVE_TIME) {
                console.log('⚠️ Raggiunto limite di 3 ore di inattività');
                saveAndReset();
            }
        }
    }

    function saveAndReset() {
        try {
            console.log('🔄 Inizio salvataggio e reset per inattività');
            
            const currentElapsed = Math.floor(((Date.now() - startTime) * TIME_MULTIPLIER));
            const totalElapsed = Math.floor(accumulatedTime/1000) + Math.floor(currentElapsed/1000);
            
            // Salva nel DB
            fetch('benefici.aspx/SalvaIntervallo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dataOraInizio: new Date(startTime).toISOString(),
                    dataOraFine: new Date().toISOString(),
                    durataSec: totalElapsed
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('✅ Intervallo salvato nel DB:', data);
                
                // Reset completo
                resetTimer();
                
                // Se era un nuovo record, salvalo prima del reset
                if (totalElapsed * 1000 > bestTime) {
                    bestTime = totalElapsed * 1000;
                    localStorage.setItem(STORAGE_KEYS.BEST_TIME, bestTime.toString());
                    console.log('🏆 Nuovo record salvato:', formatTime(Math.floor(bestTime/1000)));
                }
                
                console.log('🔄 Reset per inattività completato');
            })
            .catch(error => {
                console.error('❌ Errore durante il salvataggio per inattività:', error);
            });
        } catch (error) {
            console.error('❌ Errore durante saveAndReset:', error);
            console.error('Stack:', error.stack);
        }
    }

    function updateCurrentTime() {
        try {
            const now = Date.now();
            const currentElapsed = Math.floor(((now - startTime) * TIME_MULTIPLIER) / 1000);
            const totalElapsed = Math.floor(accumulatedTime/1000) + currentElapsed;
            
            updateUI(totalElapsed);
            
            if (totalElapsed * 1000 > bestTime) {
                bestTime = totalElapsed * 1000;
                localStorage.setItem(STORAGE_KEYS.BEST_TIME, bestTime.toString());
            }
            
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

        // Se abbiamo superato il record, aggiorna anche la barra superiore
        if (totalElapsed * 1000 >= bestTime) {
            console.log('🔄 Aggiornamento barra record');
            lastTimeBar.style.width = width + '%';
            lastTimeLabel.textContent = formatTime(totalElapsed);
        }

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
        // Non resettiamo più quando raggiungiamo il record
        startTime = Date.now();
        accumulatedTime = 0;
        localStorage.setItem(STORAGE_KEYS.START_TIME, startTime.toString());
        localStorage.setItem(STORAGE_KEYS.ACCUMULATED_TIME, '0');
        currentTimeBar.style.width = '0%';
        currentTimeLabel.textContent = '00:00:00';
        
        // Reset anche della barra superiore se non c'è record
        if (bestTime === 0) {
            lastTimeBar.style.width = '0%';
            lastTimeLabel.textContent = '00:00:00';
        }
    }

    function resetBestTime() {
        try {
            console.log('🔄 Inizio reset record');
            
            // Salva il tempo attuale nel DB prima del reset
            const currentElapsed = Math.floor(((Date.now() - startTime) * TIME_MULTIPLIER));
            const totalElapsed = Math.floor(accumulatedTime/1000) + Math.floor(currentElapsed/1000);
            
            console.log('⏱️ Tempo finale da salvare:', formatTime(totalElapsed));

            // Chiamata al server per salvare l'intervallo
            fetch('benefici.aspx/SalvaIntervallo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dataOraInizio: new Date(startTime).toISOString(),
                    dataOraFine: new Date().toISOString(),
                    durataSec: totalElapsed
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('✅ Intervallo salvato nel DB:', data);
                
                // Reset effettivo dopo il salvataggio
                bestTime = 0;
                localStorage.removeItem(STORAGE_KEYS.BEST_TIME);
                
                // Reset delle barre
                lastTimeBar.style.width = '0%';
                lastTimeLabel.textContent = '00:00:00';
                currentTimeBar.style.width = '0%';
                currentTimeLabel.textContent = '00:00:00';
                
                // Reset altri valori
                startTime = Date.now();
                accumulatedTime = 0;
                
                // Pulisci overlay e salva nuovo stato
                document.getElementById('remainingTimeOverlay').textContent = '';
                saveState();
                
                console.log('🔄 Reset completato');
            })
            .catch(error => {
                console.error('❌ Errore durante il salvataggio dell\'intervallo:', error);
                alert('Errore durante il reset del record. Riprova più tardi.');
            });
        } catch (error) {
            console.error('❌ Errore durante il reset del record:', error);
            console.error('Stack:', error.stack);
        }
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
        document.getElementById('clickButton').addEventListener('click', (e) => {
            e.preventDefault();  // Previene il comportamento di default
            resetTimer();
        });
        document.getElementById('resetBestTime').addEventListener('click', (e) => {
            e.preventDefault();  // Previene il comportamento di default
            resetBestTime();
        });
    } catch (error) {
        console.error('Errore durante l\'inizializzazione generale:', error);
        resetState();
    }

    // Event listener con log
    document.addEventListener('visibilitychange', () => {
        console.log('👁️ Cambio visibilità. Hidden:', document.hidden);
        handleVisibilityChange();
    });

    console.log('🚀 Event listener visibilitychange registrato');
}); 