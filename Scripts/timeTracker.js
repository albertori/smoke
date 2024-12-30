document.addEventListener('DOMContentLoaded', function() {
    // Inizializza il logger
    Logger.init();
    
    // Definizione StorageManager - DEVE ESSERE QUI ALL'INIZIO
    const StorageManager = {
        KEYS: {
            TIMER_STATE: 'timerState',
            BEST_TIMES: 'bestTimes',
            SETTINGS: 'settings'
        },
        load(key) {
            return localStorage.getItem(key);
        },
        save(key, value) {
            localStorage.setItem(key, value);
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    };
    
    // Costanti
    const MAX_TIME = 10800; // 3 ore in secondi
    const TIMER_SPEED = 1000; // Intervallo normale di 1 secondo
    
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
        return (hours * 3600) + (minutes * 60) + seconds;
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
        Logger.log('Avvio timer');
        if (!timerInterval) {
            if (!startTime) {
                startTime = Date.now();
            }
            
            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                updateCurrentBar(elapsed);
                
                if (elapsed > parseTime(secondTimeLabel.textContent)) {
                    secondTimeLabel.textContent = formatTime(elapsed);
                    updateBestBar();
                }
                
                // Salva lo stato periodicamente
                saveStateToDb(false);
            }, TIMER_SPEED);
            
            isTimerActive = true;
            resetButton.textContent = 'Resetta';
            Logger.log('Timer avviato con startTime:', startTime);
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
                // Salva lo stato finale e pulisci
                saveStateToDb(true).then(() => {
                    // Pulisci il localStorage dopo il salvataggio
                    localStorage.removeItem('timerState');
                    Logger.log('LocalStorage pulito durante il logout');
                });
            } else {
                // Pulisci comunque il localStorage
                localStorage.removeItem('timerState');
                Logger.log('LocalStorage pulito durante il logout');
            }
        });
    });

    // Funzione centralizzata per le chiamate al server
    async function serverCall(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'same-origin',
                redirect: 'follow',
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            Logger.error('Errore nella chiamata al server:', error);
            return null;
        }
    }

    // Uso della funzione
    async function saveStateToDb(isLogout = false) {
        if (!isTimerActive && !isLogout) return;
        
        const currentElapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        const modalitaFumato = document.getElementById('smokeSwitch').checked;
        
        const result = await serverCall('benefici.aspx/SalvaStatoTimer', {
            currentTime: currentElapsed,
            recordTime: parseTime(secondTimeLabel.textContent),
            startTime: startTime ? new Date(startTime).toISOString() : null,
            isLogout: isLogout,
            modalita: modalitaFumato
        });

        if (result) {
            Logger.log('Stato salvato con successo:', result);
        }
        return result;
    }

    // Modifica la funzione loadInitialState
    async function loadInitialState() {
        Logger.log('Caricamento stato iniziale');
        
        try {
            // Verifica se siamo in una sessione di login
            const isLoginSession = document.referrer.includes('login.aspx');
            Logger.log('Sessione di login:', isLoginSession);

            if (isLoginSession) {
                Logger.log('Sessione di login rilevata - caricamento dal DB');
                // Al login, carica sempre dal server
                const response = await fetch('benefici.aspx/GetUserRecord', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                });
                
                const data = await response.json();
                Logger.log('Dati caricati dal server:', data);

                if (data.d && data.d.success) {
                    const serverRecord = data.d.bestTime;
                    Logger.log('Record dal server:', serverRecord);
                    
                    // Aggiorna UI con i dati dal server
                    secondTimeLabel.textContent = formatTime(serverRecord);
                    updateBestBar();
                    
                    // Salva nel localStorage per uso futuro
                    StorageManager.save(StorageManager.KEYS.BEST_TIMES, serverRecord);
                    Logger.log('Record dal server salvato nel localStorage:', serverRecord);
                }
            } else {
                Logger.log('Sessione normale - caricamento dal localStorage');
                // Non è una sessione di login, usa il localStorage
                const savedRecord = StorageManager.load(StorageManager.KEYS.BEST_TIMES);
                if (savedRecord) {
                    const recordTime = parseInt(savedRecord);
                    secondTimeLabel.textContent = formatTime(recordTime);
                    updateBestBar();
                    Logger.log('Record caricato dal localStorage:', recordTime);
                }
            }

            // Gestione timer attivo (rimane invariata)
            const savedState = StorageManager.load(StorageManager.KEYS.TIMER_STATE);
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    const now = Date.now();
                    const savedStartTime = new Date(state.startTime).getTime();
                    const timeDiff = now - savedStartTime;
                    
                    if (timeDiff <= 3 * 60 * 60 * 1000) {
                        startTime = savedStartTime;
                        isTimerActive = true;
                        const currentElapsed = Math.floor(timeDiff / 1000);
                        updateCurrentBar(currentElapsed);
                        resetButton.textContent = 'Resetta';
                        startTimer();
                    }
                } catch (error) {
                    Logger.error('Errore nel parsing dello stato timer:', error);
                }
            }
        } catch (error) {
            Logger.error('Errore nel caricamento dello stato:', error);
            // In caso di errore, prova a usare il localStorage
            const savedRecord = StorageManager.load(StorageManager.KEYS.BEST_TIMES);
            if (savedRecord) {
                const recordTime = parseInt(savedRecord);
                secondTimeLabel.textContent = formatTime(recordTime);
                updateBestBar();
                Logger.log('Usati dati dal localStorage dopo errore');
            }
        }
    }

    // Modifica la funzione che salva lo stato
    function saveTimerState() {
        if (isTimerActive) {
            const state = {
                startTime: startTime,
                isActive: isTimerActive,
                lastUpdate: new Date().toISOString(),
                bestTime: parseTime(secondTimeLabel.textContent)
            };
            StorageManager.save(StorageManager.KEYS.TIMER_STATE, JSON.stringify(state));
            Logger.log('Stato timer salvato:', state);
        }
    }

    // Modifica l'event listener per visibilitychange
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            if (isTimerActive) {
                saveTimerState();
                saveStateToDb(false);
            }
        } else {
            // Quando la pagina torna visibile, ricarica sempre il record
            loadUserRecord().then(() => {
                // Solo se c'è un timer attivo, ricarica lo stato del timer
                if (isTimerActive) {
                    const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
                    updateCurrentBar(currentElapsed);
                }
            });
        }
    });

    // Modifica la gestione della chiusura della pagina
    window.addEventListener('beforeunload', function(e) {
        if (isTimerActive) {
            Logger.log('Salvataggio automatico prima di chiudere la pagina');
            e.preventDefault(); // Necessario per alcuni browser
            saveStateToDb(true);
            e.returnValue = ''; // Necessario per Chrome
        }
    });

    // Aggiungi questa funzione per salvare il record corrente
    function saveCurrentRecord() {
        const currentRecord = parseTime(secondTimeLabel.textContent);
        if (currentRecord > 0) {
            StorageManager.save(StorageManager.KEYS.BEST_TIMES, currentRecord);
            Logger.log('Record salvato nel localStorage:', currentRecord);
        }
    }

    // Modifica il click handler del resetButton
    resetButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        Logger.log('Click su resetButton', { currentText: this.textContent });
        
        if (this.textContent === 'Inizia') {
            // Rimuovi il timer esistente se presente
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            // Imposta il nuovo tempo di inizio
            startTime = Date.now();
            
            // Avvia il timer
            startTimer();
            
            // Salva lo stato iniziale
            const state = {
                startTime: startTime,
                isActive: true,
                lastUpdate: new Date().toISOString()
            };
            StorageManager.save(StorageManager.KEYS.TIMER_STATE, JSON.stringify(state));
            
            Logger.log('Timer avviato');
        } else {
            Logger.log('Tentativo di reset e salvataggio record');
            
            // Debug approfondito della conversione del tempo
            const timeString = secondTimeLabel.textContent;
            Logger.log('Analisi timeString:', {
                timeString,
                type: typeof timeString,
                length: timeString.length
            });
            
            // Conversione esplicita
            const timeParts = timeString.split(':');
            Logger.log('Time parts:', timeParts);
            
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            const seconds = parseInt(timeParts[2], 10);
            
            Logger.log('Componenti tempo:', {
                hours,
                minutes,
                seconds,
                hoursType: typeof hours,
                minutesType: typeof minutes,
                secondsType: typeof seconds
            });
            
            const recordTime = (hours * 3600) + (minutes * 60) + seconds;
            Logger.log('Calcolo recordTime:', {
                hoursSeconds: hours * 3600,
                minutesSeconds: minutes * 60,
                seconds,
                total: recordTime
            });
            
            // Calcolo current time
            const now = Date.now();
            const elapsed = now - startTime;
            const currentTime = Math.floor(elapsed / 1000);
            
            Logger.log('Debug finale:', {
                recordTime,
                currentTime,
                recordFormatted: formatTime(recordTime),
                currentFormatted: formatTime(currentTime)
            });

            // Chiamata al server con entrambi i tempi
            const dataToSend = { 
                recordTime: recordTime,
                currentTime: currentTime
            };

            Logger.log('Dati da inviare al server:', dataToSend);

            fetch('benefici.aspx/UpdateUserRecord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(dataToSend)
            })
            .then(response => response.json())
            .then(data => {
                Logger.log('Record salvato nel DB:', data);
                
                // Reset del timer corrente
                resetCurrentBar();
                this.textContent = 'Inizia';
                isTimerActive = false;
                startTime = null;
                StorageManager.remove(StorageManager.KEYS.TIMER_STATE);
                
                Logger.log('Timer resettato completamente');
            })
            .catch(error => {
                Logger.error('Errore nel salvataggio del record:', error);
                resetCurrentBar();
                this.textContent = 'Inizia';
                isTimerActive = false;
                startTime = null;
                StorageManager.remove(StorageManager.KEYS.TIMER_STATE);
            });
        }
    });

    // Modifica il click handler per il clickButton
    clickButton.addEventListener('click', function() {
        if (isTimerActive) {
            // Salva il record attuale se necessario
            const currentTime = Math.floor((Date.now() - startTime) / 1000);
            if (currentTime > parseTime(secondTimeLabel.textContent)) {
                secondTimeLabel.textContent = formatTime(currentTime);
                updateBestBar();
                // Salva il nuovo record
                saveStateToDb(false);
            }

            // Resetta il timer corrente e riparti da zero
            resetCurrentBar();
            startTime = Date.now(); // Reset del tempo di inizio
            startTimer();
            
            Logger.log('Timer resettato e riavviato dopo click');
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

    // Aggiungi l'event listener per il cambio di modalità
    document.getElementById('smokeSwitch').addEventListener('change', function() {
        // Se il timer è attivo, chiedi conferma
        if (isTimerActive) {
            if (confirm('Cambiando modalità il timer verrà resettato. Vuoi continuare?')) {
                // Resetta il timer
                resetTimer();
                // Pulisci il localStorage
                localStorage.removeItem('timerState');
                Logger.log('LocalStorage pulito per cambio modalità');
            } else {
                // Se l'utente annulla, ripristina lo switch alla posizione precedente
                this.checked = !this.checked;
            }
        } else {
            // Se il timer non è attivo, pulisci comunque il localStorage
            localStorage.removeItem('timerState');
            Logger.log('LocalStorage pulito per cambio modalità');
        }
    });

    // Aggiungi questa funzione prima di loadInitialState
    async function loadFromServer() {
        try {
            const response = await fetch('benefici.aspx/GetStatoTimer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'same-origin',
                redirect: 'follow'
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            Logger.log('Risposta dal server:', data);
            
            if (data.d && data.d.hasActiveTimer && data.d.currentTime > 0) {
                const serverStartTime = new Date(data.d.startTime).getTime();
                const now = Date.now();
                const timeDiff = now - serverStartTime;
                
                if (timeDiff <= (3 * 60 * 60 * 1000)) {
                    Logger.log('Ripristino timer dal server');
                    startTime = serverStartTime;
                    bestTime = data.d.recordTime;
                    
                    // Aggiorna display e barre
                    const currentElapsed = Math.floor(timeDiff / 1000);
                    updateCurrentBar(currentElapsed);
                    secondTimeLabel.textContent = formatTime(data.d.recordTime);
                    updateBestBar();
                    
                    // Riavvia il timer
                    startTimer();
                    return;
                }
            }
            
            Logger.log('Nessun timer attivo valido trovato');
            resetCurrentBar();
        } catch (error) {
            Logger.error('Errore nel caricamento dello stato dal server:', error);
            resetCurrentBar();
        }
    }

    // Modifica loadUserRecord per essere più persistente
    async function loadUserRecord() {
        try {
            const response = await serverCall('benefici.aspx/GetUserRecord', {});
            if (response && response.d && response.d.success) {
                const serverRecord = response.d.bestTime;
                const savedRecord = parseInt(StorageManager.load(StorageManager.KEYS.BEST_TIMES)) || 0;
                
                // Usa il record più alto tra server e localStorage
                const bestRecord = Math.max(serverRecord, savedRecord);
                
                // Salva sempre il record più alto
                StorageManager.save(StorageManager.KEYS.BEST_TIMES, bestRecord);
                
                // Aggiorna l'UI
                secondTimeLabel.textContent = formatTime(bestRecord);
                updateBestBar();
                Logger.log('Record aggiornato:', bestRecord);
            } else {
                // Usa il record dal localStorage
                const savedRecord = StorageManager.load(StorageManager.KEYS.BEST_TIMES);
                if (savedRecord) {
                    const recordTime = parseInt(savedRecord);
                    secondTimeLabel.textContent = formatTime(recordTime);
                    updateBestBar();
                    Logger.log('Record caricato dal localStorage:', recordTime);
                }
            }
        } catch (error) {
            Logger.error('Errore nel caricamento del record:', error);
            // Usa il record dal localStorage in caso di errore
            const savedRecord = StorageManager.load(StorageManager.KEYS.BEST_TIMES);
            if (savedRecord) {
                const recordTime = parseInt(savedRecord);
                secondTimeLabel.textContent = formatTime(recordTime);
                updateBestBar();
                Logger.log('Record recuperato dal localStorage dopo errore:', recordTime);
            }
        }
    }

    // Aggiungi questa funzione per aggiornare il record
    function updateUserRecord(recordSeconds, formattedTime) {
        Logger.log('Aggiornamento record utente:', { seconds: recordSeconds, formatted: formattedTime });
        
        // Aggiorna solo se il nuovo record è maggiore di quello corrente
        const currentRecord = parseTime(secondTimeLabel.textContent);
        if (recordSeconds > currentRecord || secondTimeLabel.textContent === '00:00:00') {
            secondTimeLabel.textContent = formattedTime;
            updateBestBar();
            Logger.log('Record aggiornato');
        }
    }

    // Funzione di reset
    function resetTimer() {
        console.log('resetTimer chiamato');
        
        if (isRunning) {
            stopTimer();
        }
        
        // Prendiamo il valore corrente prima del reset
        const timeString = secondTimeLabel.textContent;
        const recordSeconds = timeString.split(':')
            .reduce((acc, time) => (60 * acc) + parseInt(time), 0);
        
        console.log('Invio record al server:', recordSeconds);
        
        // Debug della chiamata al server
        console.log('Tentativo di chiamata al server...');
        
        $.ajax({
            type: "POST",
            url: "benefici.aspx/UpdateUserRecord",
            data: JSON.stringify({ recordTime: recordSeconds }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                console.log('Risposta server:', response);
            },
            error: function(xhr, status, error) {
                console.error('Errore chiamata server:', error);
                console.error('Status:', status);
                console.error('Response:', xhr.responseText);
            }
        });

        // Continua con il reset normale
        startTime = 0;
        lastTimeLabel.textContent = "00:00:00";
        updateLastBar();
    }

    // Funzione helper per le chiamate al server
    function serverCall(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json());
    }

    // Aggiungi un event listener per il pageshow
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            Logger.log('Pagina ripristinata dalla cache');
            loadInitialState();
        }
    });
}); 