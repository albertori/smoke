document.addEventListener('DOMContentLoaded', function() {
    // Costanti
    const MAX_TIME = 10800; // 3 ore in secondi
    const TIME_MULTIPLIER = 10; // Accelera il tempo di 10 volte per i test
    const STORAGE_KEYS = {
        START_TIME: 'currentStartTime',
        BEST_TIME: 'bestTime',
        ACCUMULATED_TIME: 'accumulatedTime',
        LAST_PAUSE: 'lastPauseTime',
        LAST_STATE: 'timerState',
        LAST_USER: 'lastUserEmail'
    };
    const MAX_INACTIVE_TIME = 10800000; // 3 ore in millisecondi
    const RESUME_TIME_LIMIT = MAX_INACTIVE_TIME; // Usa lo stesso limite di 3 ore

    // Stato iniziale con validazione
    let startTime, bestTime, accumulatedTime, timeInterval;

    function initializeState() {
        try {
            // Ottieni l'email dell'utente corrente
            const currentUserEmail = document.getElementById('userEmail').innerText;
            console.log('👤 Utente corrente:', currentUserEmail);

            // Verifica se è un nuovo utente confrontando con l'ultimo utente salvato
            const lastUserEmail = localStorage.getItem(STORAGE_KEYS.LAST_USER);
            console.log('�� Ultimo utente:', lastUserEmail);

            if (currentUserEmail !== lastUserEmail) {
                // Se è un nuovo utente, pulisci tutto lo storage
                console.log('🆕 Nuovo utente rilevato, pulizia storage');
                localStorage.clear();
                localStorage.setItem(STORAGE_KEYS.LAST_USER, currentUserEmail);
                eseguiReset();
                return;
            }

            // Verifica se c'è uno stato salvato
            const savedState = localStorage.getItem(STORAGE_KEYS.LAST_STATE);
            if (!savedState) {
                console.log('💫 Nessuno stato salvato trovato, inizializzazione da zero');
                eseguiReset();
                return;
            }

            const state = JSON.parse(savedState);
            const now = Date.now();
            const lastActivity = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_PAUSE)) || 0;
            const inactiveTime = now - lastActivity;

            if (inactiveTime > MAX_INACTIVE_TIME || !lastActivity) {
                console.log('🔄 Reset per inattività o prima inizializzazione');
                eseguiReset();
                return;
            }

            // Se arriviamo qui, recuperiamo lo stato precedente
            startTime = validateTime(state.startTime, now);
            bestTime = validateTime(state.bestTime, 0);
            accumulatedTime = validateTime(state.accumulatedTime, 0);

            // Aggiorna UI iniziale
            updateUI(Math.floor(accumulatedTime/1000));
            
            // Aggiorna il testo del bottone
            document.getElementById('clickButton').textContent = 'Inizia';

            // Non avviare il timer automaticamente
            clearInterval(timeInterval);
            
            console.log('✅ Stato inizializzato:', {
                startTime,
                bestTime,
                accumulatedTime
            });
                
        } catch (error) {
            console.error('❌ Errore durante l\'inizializzazione:', error);
            console.error('Stack:', error.stack);
            eseguiReset();
        }
    }

    function validateTime(value, defaultValue) {
        const parsed = parseInt(value);
        return (!isNaN(parsed) && parsed >= 0 && parsed < Date.now() + 86400000) ? parsed : defaultValue;
    }

    function saveState() {
        try {
            // Salva nel localStorage solo i dati della sessione corrente
            const sessionState = {
                startTime: startTime,
                accumulatedTime: accumulatedTime,
                lastPause: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(sessionState));
            console.log('💾 Stato sessione salvato:', sessionState);
        } catch (error) {
            console.error('❌ Errore durante il salvataggio dello stato:', error);
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
            console.log('🔄 Inizio analisi dati');
            
            const currentElapsed = Math.floor(((Date.now() - startTime) * TIME_MULTIPLIER));
            const totalElapsed = Math.floor(accumulatedTime/1000) + Math.floor(currentElapsed/1000);
            
            // Formatta le date nel formato che Access accetta
            const formatDateForAccess = (date) => {
                const d = new Date(date);
                const pad = (num) => String(num).padStart(2, '0');
                
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            };

            const dataInizio = formatDateForAccess(startTime);
            const dataFine = formatDateForAccess(new Date());

            // Log dettagliati dei dati
            console.log('📅 Analisi dati:');
            console.log('- startTime (raw):', startTime);
            console.log('- startTime (Date object):', new Date(startTime));
            console.log('- Data inizio formattata:', dataInizio);
            console.log('- Data fine formattata:', dataFine);
            console.log('- Durata:', totalElapsed);
            console.log('- Tempo accumulato:', accumulatedTime);
            console.log('- Tempo corrente:', currentElapsed);

            const bodyData = {
                dataOraInizio: dataInizio,
                dataOraFine: dataFine,
                durataSec: totalElapsed
            };

            console.log('📦 Payload che verrebbe inviato:', JSON.stringify(bodyData, null, 2));
            
            // Non facciamo la chiamata, solo log
            console.log('✋ Operazione fermata qui per analisi');
            
        } catch (error) {
            console.error('❌ Errore durante l\'analisi:', error);
            console.error('Stack:', error.stack);
        }
    }

    function updateCurrentTime() {
        try {
            const now = Date.now();
            const currentElapsed = Math.floor(((now - startTime) * TIME_MULTIPLIER) / 1000);
            const totalElapsed = Math.floor(accumulatedTime/1000) + currentElapsed;
            
            updateUI(totalElapsed);
            
            // Aggiorniamo il bestTime solo se il tempo totale è maggiore
            if (totalElapsed * 1000 > bestTime) {
                bestTime = totalElapsed * 1000;
                localStorage.setItem(STORAGE_KEYS.BEST_TIME, bestTime.toString());
                
                // Aggiorniamo anche la barra superiore
                lastTimeBar.style.width = (totalElapsed / MAX_TIME * 100) + '%';
                lastTimeLabel.textContent = formatTime(totalElapsed);
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

        // Mostra sempre il record precedente se esiste
        if (bestTime > 0) {
            const bestTimeInSeconds = Math.floor(bestTime/1000);
            const bestTimeWidth = Math.min((bestTimeInSeconds / MAX_TIME) * 100, 100);
            lastTimeBar.style.width = bestTimeWidth + '%';
            lastTimeLabel.textContent = formatTime(bestTimeInSeconds);
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
        
        // Salva solo i dati della sessione
        saveState();
        
        // Reset UI
        currentTimeBar.style.width = '0%';
        currentTimeLabel.textContent = '00:00:00';
        
        // Aggiorna il testo del bottone
        document.getElementById('clickButton').textContent = 'Inizia';
        
        // Reset anche della barra superiore se non c'è record
        if (bestTime === 0) {
            lastTimeBar.style.width = '0%';
            lastTimeLabel.textContent = '00:00:00';
        }
    }

    function resetBestTime() {
        try {
            console.log('🔄 Inizio analisi dati');
            
            const now = Date.now();
            const currentElapsed = Math.floor(((now - startTime) / 1000)); 
            const totalElapsed = Math.floor(accumulatedTime/1000) + currentElapsed;
            
            if (totalElapsed > 0) {
                const formatDateForAccess = (date) => {
                    const d = new Date(date);
                    const pad = (num) => String(num).padStart(2, '0');
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
                };

                const dataInizio = formatDateForAccess(new Date());
                const dataFine = formatDateForAccess(new Date());

                const bodyData = {
                    dataOraInizio: dataInizio,
                    dataOraFine: dataFine,
                    durataSec: totalElapsed
                };

                console.log('📦 Payload che verrà inviato:', JSON.stringify(bodyData, null, 2));

                fetch('benefici.aspx/SalvaIntervallo', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyData)
                })
                .then(response => {
                    console.log('📥 Response status:', response.status);
                    return response.text();
                })
                .then(text => {
                    console.log('📥 Response text completo:', text);
                    
                    // Estrai solo la parte JSON dalla risposta
                    const jsonMatch = text.match(/\{.*\}/);
                    if (!jsonMatch) {
                        throw new Error('Formato risposta non valido');
                    }
                    
                    const jsonStr = jsonMatch[0];
                    console.log('📥 JSON estratto:', jsonStr);
                    
                    const data = JSON.parse(jsonStr);
                    if (data.d && data.d.success) {
                        console.log('✅ Intervallo salvato con successo');
                        eseguiReset();
                    } else {
                        throw new Error(data.d ? data.d.error : 'Errore sconosciuto');
                    }
                })
                .catch(error => {
                    console.error('❌ Errore durante il salvataggio:', error);
                    alert('Errore durante il salvataggio. Riprova più tardi.');
                });
            }
        } catch (error) {
            console.error('❌ Errore durante l\'analisi:', error);
            console.error('Stack:', error.stack);
        }
    }

    // Nuova funzione helper per eseguire il reset effettivo
    function eseguiReset() {
        // Reset di tutti i valori
        bestTime = 0;
        startTime = Date.now();
        accumulatedTime = 0;
        
        // Reset dello storage mantenendo solo l'email dell'utente
        const currentUserEmail = localStorage.getItem(STORAGE_KEYS.LAST_USER);
        localStorage.clear();
        if (currentUserEmail) {
            localStorage.setItem(STORAGE_KEYS.LAST_USER, currentUserEmail);
        }
        
        // Reset UI
        lastTimeBar.style.width = '0%';
        lastTimeLabel.textContent = '00:00:00';
        currentTimeBar.style.width = '0%';
        currentTimeLabel.textContent = '00:00:00';
        document.getElementById('remainingTimeOverlay').textContent = '';
        
        // Aggiorna il testo del bottone
        document.getElementById('clickButton').textContent = 'Inizia';
        
        // Ferma il timer
        clearInterval(timeInterval);
        
        // Salva lo stato resettato
        const state = {
            startTime: startTime,
            bestTime: 0,
            accumulatedTime: 0
        };
        localStorage.setItem(STORAGE_KEYS.LAST_STATE, JSON.stringify(state));
        
        console.log('🔄 Reset completo eseguito');
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