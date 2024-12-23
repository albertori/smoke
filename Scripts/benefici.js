// Aggiungi questa funzione all'inizio, prima di document.addEventListener
function aggiornaLinkStatistiche() {
    const modalitaFumato = document.getElementById('smokeSwitch').checked;
    const statisticheLink = document.getElementById('statisticheLink');
    if (statisticheLink) {
        const url = modalitaFumato ? 'nonStatistiche.aspx' : 'statistiche.aspx';
        statisticheLink.setAttribute('data-url', url);
    }
}

// Aggiungi queste costanti all'inizio del file
const SYNC_QUEUE_KEY = 'syncQueue';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inizializzazione applicazione...');
    
    if (!verificaElementi()) {
        console.error('Impossibile inizializzare: elementi HTML mancanti');
        return;
    }

    // Inizializzazione della modalità
    const smokeSwitch = document.getElementById('smokeSwitch');
    const textPath = document.querySelector('textPath');
    const nonFumareBtn = document.getElementById('nonFumareBtn');

    // Leggi la modalità salvata o usa il default
    const modalitaSalvata = localStorage.getItem('mode');
    if (modalitaSalvata === 'smoked') {
        smokeSwitch.checked = true;
        textPath.textContent = 'Ho Fumato';
        nonFumareBtn.classList.remove('green');
        nonFumareBtn.classList.add('red');
    } else {
        smokeSwitch.checked = false;
        textPath.textContent = 'Non Ho Fumato';
        nonFumareBtn.classList.remove('red');
        nonFumareBtn.classList.add('green');
    }

    // Carica i dati iniziali con la modalità corretta
    caricaDatiIniziali();

    async function chiamataServer(url, method = 'POST', body = {}) {
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                Logger.error('Risposta server non ok:', response.status, errorText);
                
                if (response.status === 500 && errorText.includes("Utente non autenticato")) {
                    window.location.href = 'login.aspx';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data || !data.d) {
                throw new Error('Dati non validi dal server');
            }

            return data.d;
        } catch (error) {
            Logger.error('Errore nella chiamata al server:', error);
            throw error;
        }
    }

    function caricaDatiIniziali() {
        const modalitaFumato = document.getElementById('smokeSwitch').checked;
        console.log('Caricamento dati per modalità:', modalitaFumato ? 'Ho Fumato' : 'Non Ho Fumato');
        
        fetch('benefici.aspx/GetDatiIniziali', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ modalitaFumato: modalitaFumato })
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.d) {
                console.log('Dati ricevuti:', data.d);
                salvaDatiLocali(data.d);
                aggiornaDati(data.d);
            }
        })
        .catch(error => {
            console.error('Errore nel caricamento dati:', error);
            const datiLocali = recuperaDatiLocali();
            if (datiLocali) {
                aggiornaDati(datiLocali);
            }
        });
    }

    // Event listener per lo switch
    smokeSwitch.addEventListener('change', function() {
        const modalitaFumato = this.checked;
        console.log('Cambio modalità:', modalitaFumato ? 'Ho Fumato' : 'Non Ho Fumato');
        
        if (modalitaFumato) {
            textPath.textContent = 'Ho Fumato';
            nonFumareBtn.classList.remove('green');
            nonFumareBtn.classList.add('red');
            localStorage.setItem('mode', 'smoked');
        } else {
            textPath.textContent = 'Non Ho Fumato';
            nonFumareBtn.classList.remove('red');
            nonFumareBtn.classList.add('green');
            localStorage.setItem('mode', 'notSmoked');
        }

        // Ricarica i dati con la nuova modalità
        caricaDatiIniziali();

        // Aggiorna il link delle statistiche
        aggiornaLinkStatistiche();
        settingsPanel.classList.remove('open');
    });

    // Click handler per il bottone
    document.getElementById('clickButton').addEventListener('click', 
        debounce(async function(e) {
            e.preventDefault();
            console.log('Click registrato');
            
            const modalitaFumato = document.getElementById('smokeSwitch').checked;
            console.log('Incremento contatore per modalità:', modalitaFumato ? 'Ho Fumato' : 'Non Ho Fumato');
            
            try {
                if (navigator.onLine) {
                    // Online - prova a salvare direttamente
                    const data = await chiamataServer('benefici.aspx/IncrementaContatore', 
                        'POST', { modalitaFumato: modalitaFumato });
                        
                    if (data) {
                        salvaDatiLocali(data);
                        aggiornaDati(data);
                        Logger.log('Dati salvati online:', data);
                    }
                } else {
                    // Offline - salva localmente e aggiungi alla coda
                    Logger.log('Modalità offline - salvataggio locale');
                    incrementaLocale();
                    
                    // Aggiungi esplicitamente alla coda di sync
                    aggiungiAllaCodaSync({
                        tipo: 'incremento',
                        modalitaFumato: modalitaFumato,
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                Logger.error('Errore durante l\'elaborazione del click:', error);
                incrementaLocale();
            }
        }, 500)
    );

    function aggiornaDati(data) {
        document.getElementById('sigaretteLabel').textContent = data.sigarette;
        document.getElementById('sigaretteButtonLabel').textContent = data.sigarette;
        document.getElementById('risparmioValue').textContent = data.risparmio.toFixed(2);
        document.getElementById('catrameLabel').textContent = data.catrame;
        document.getElementById('tempoLabel').textContent = data.tempo;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const COSTO_SIGARETTA = 0.30; // € per sigaretta
    const CATRAME_SIGARETTA = 10; // mg per sigaretta
    const TEMPO_SIGARETTA = 5; // minuti per sigaretta

    function updateDailyProgress() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const percentageOfDay = (totalSeconds / (24 * 3600)) * 100;
        
        const progressBar = document.getElementById('dailyProgressBar');
        progressBar.style.width = percentageOfDay + '%';
    }

    setInterval(updateDailyProgress, 1000);
    updateDailyProgress();

    const settingsPanel = document.getElementById('settingsPanel');
    const settingsToggle = document.getElementById('settingsToggle');
    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const textColorPicker = document.getElementById('textColorPicker');
    const resetButton = document.getElementById('resetColors');

    const defaultColors = {
        primary: '#696969',    // Grigio più scuro (DimGray)
        background: '#DCDCDC', // Grigio chiaro leggermente più scuro (Gainsboro)
        text: '#2C3E50'       // Mantenuto lo stesso colore del testo
    };

    settingsToggle.addEventListener('click', (e) => {
        e.preventDefault();
        settingsPanel.classList.toggle('open');
    });

    function loadSavedColors() {
        const savedColors = JSON.parse(localStorage.getItem('themeColors')) || defaultColors;
        primaryColorPicker.value = savedColors.primary;
        bgColorPicker.value = savedColors.background;
        textColorPicker.value = savedColors.text;
        applyColors(savedColors);
    }

    function applyColors(colors) {
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--background-gradient-1', colors.background);
        document.documentElement.style.setProperty('--background-gradient-2', adjustColor(colors.background, -20));
        document.documentElement.style.setProperty('--text-color', colors.text);
        
        localStorage.setItem('themeColors', JSON.stringify(colors));
    }

    function adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => 
            ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

    primaryColorPicker.addEventListener('change', () => {
        applyColors({
            primary: primaryColorPicker.value,
            background: bgColorPicker.value,
            text: textColorPicker.value
        });
        settingsPanel.classList.remove('open');
    });

    bgColorPicker.addEventListener('change', () => {
        applyColors({
            primary: primaryColorPicker.value,
            background: bgColorPicker.value,
            text: textColorPicker.value
        });
        settingsPanel.classList.remove('open');
    });

    textColorPicker.addEventListener('change', () => {
        applyColors({
            primary: primaryColorPicker.value,
            background: bgColorPicker.value,
            text: textColorPicker.value
        });
        settingsPanel.classList.remove('open');
    });

    resetButton.addEventListener('click', () => {
        applyColors(defaultColors);
        primaryColorPicker.value = defaultColors.primary;
        bgColorPicker.value = defaultColors.background;
        textColorPicker.value = defaultColors.text;
        settingsPanel.classList.remove('open');
    });

    loadSavedColors();

    function salvaDatiLocali(dati) {
        localStorage.setItem('datiProgressi', JSON.stringify(dati));
        console.log('Dati salvati localmente:', dati);
    }

    function recuperaDatiLocali() {
        const dati = localStorage.getItem('datiProgressi');
        return dati ? JSON.parse(dati) : {
            sigarette: 0,
            risparmio: 0,
            catrame: 0,
            tempo: 0
        };
    }

    function incrementaLocale() {
        const datiAttuali = recuperaDatiLocali();
        
        datiAttuali.sigarette++;
        datiAttuali.risparmio += 0.30;
        datiAttuali.catrame += 10;
        datiAttuali.tempo += 5;
        
        salvaDatiLocali(datiAttuali);
        
        // Aggiungi alla coda di sincronizzazione
        aggiungiAllaCodaSync({
            tipo: 'incremento',
            modalitaFumato: document.getElementById('smokeSwitch').checked,
            timestamp: Date.now()
        });
        
        aggiornaDati(datiAttuali);
    }

    function verificaElementi() {
        const elementiRichiesti = {
            'sigaretteLabel': document.getElementById('sigaretteLabel'),
            'sigaretteButtonLabel': document.getElementById('sigaretteButtonLabel'),
            'risparmioLabel': document.getElementById('risparmioLabel'),
            'catrameLabel': document.getElementById('catrameLabel'),
            'tempoLabel': document.getElementById('tempoLabel'),
            'clickButton': document.getElementById('clickButton'),
            'nonFumareBtn': document.getElementById('nonFumareBtn'),
            'smokeSwitch': document.getElementById('smokeSwitch'),
            'switchLabel': document.getElementById('switchLabel')
        };

        const elementiTrovati = {};
        const elementiMancanti = {};
        let tuttoPresente = true;

        for (let [key, element] of Object.entries(elementiRichiesti)) {
            if (element) {
                elementiTrovati[key] = true;
            } else {
                elementiMancanti[key] = true;
                tuttoPresente = false;
            }
        }

        console.log('Elementi trovati:', elementiTrovati);
        
        if (!tuttoPresente) {
            console.error('Elementi mancanti:', elementiMancanti);
        }

        return tuttoPresente;
    }

    window.addEventListener('online', async function() {
        Logger.log('Connessione ripristinata');
        
        // Verifica prima la sessione
        const sessioneValida = await verificaSessione();
        if (!sessioneValida) {
            Logger.error('Sessione non valida, reindirizzamento al login...');
            window.location.href = 'login.aspx';
            return;
        }
        
        // Se la sessione è valida, procedi con la sincronizzazione
        await sincronizzaCoda();
    });

    window.addEventListener('offline', function() {
        console.log('Andato offline');
    });

    function salvaAzioneOffline(azione) {
        const azioniOffline = JSON.parse(localStorage.getItem('azioniOffline') || '[]');
        azioniOffline.push({
            timestamp: new Date().getTime(),
            azione: azione
        });
        localStorage.setItem('azioniOffline', JSON.stringify(azioniOffline));
    }

    function sincronizzaDati() {
        const azioniOffline = JSON.parse(localStorage.getItem('azioniOffline') || '[]');
        
        if (azioniOffline.length === 0) {
            console.log('Nessuna azione da sincronizzare');
            return;
        }

        console.log('Sincronizzazione dati:', azioniOffline.length, 'azioni da processare');

        azioniOffline.sort((a, b) => a.timestamp - b.timestamp);

        const processaAzioni = async () => {
            for (const azione of azioniOffline) {
                try {
                    const response = await fetch('benefici.aspx/IncrementaContatore', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({}),
                        credentials: 'include'
                    });

                    const data = await response.json();
                    if (data && data.d) {
                        console.log('Azione sincronizzata con successo');
                    } else {
                        console.error('Errore nella sincronizzazione');
                        return false;
                    }
                } catch (error) {
                    console.error('Errore durante la sincronizzazione:', error);
                    return false;
                }
            }
            return true;
        };

        processaAzioni().then(success => {
            if (success) {
                localStorage.removeItem('azioniOffline');
                console.log('Sincronizzazione completata con successo');
                
                fetch('benefici.aspx/GetDatiIniziali', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                })
                .then(response => response.json())
                .then(data => {
                    if (data && data.d) {
                        salvaDatiLocali(data.d);
                        aggiornaDati(data.d);
                    }
                });
            }
        });
    }

    // Gestione del link statistiche
    const statisticheLink = document.getElementById('statisticheLink');
    
    // Funzione di navigazione
    function navigaStatistiche(e) {
        // Previeni comportamenti di default
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('Navigazione statistiche iniziata'); // Debug
        
        // Salva lo stato attuale
        const modalitaFumato = document.getElementById('smokeSwitch').checked;
        const url = modalitaFumato ? 'nonStatistiche.aspx' : 'statistiche.aspx';
        
        console.log('Redirect a:', url); // Debug
        
        // Redirect diretto
        window.location.href = url;
    }
    
    // Gestione eventi desktop
    statisticheLink.addEventListener('click', navigaStatistiche);
    
    // Gestione eventi mobile
    statisticheLink.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Previeni lo scroll
    });
    
    statisticheLink.addEventListener('touchend', function(e) {
        e.preventDefault();
        navigaStatistiche(e);
    });
    
    // Rimuovi href per evitare comportamenti indesiderati
    statisticheLink.removeAttribute('href');
    statisticheLink.style.cursor = 'pointer';

    // Aggiorna il link al caricamento iniziale
    aggiornaLinkStatistiche();

    // Aggiungi queste nuove funzioni
    function aggiungiAllaCodaSync(azione) {
        if (!azione || typeof azione.modalitaFumato !== 'boolean') {
            Logger.error('Dati azione non validi:', azione);
            return;
        }

        const coda = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
        coda.push({
            tipo: 'incremento',
            modalitaFumato: azione.modalitaFumato,
            timestamp: Date.now()
        });
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(coda));
        Logger.log('Azione aggiunta alla coda di sync:', azione);
    }

    async function sincronizzaCoda() {
        try {
            const coda = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
            if (coda.length === 0) {
                Logger.log('Nessuna azione da sincronizzare');
                return;
            }

            // Prima verifichiamo se siamo autenticati
            const checkAuth = await fetch('benefici.aspx/GetDatiIniziali', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ modalitaFumato: false }),
                credentials: 'include'
            });

            if (!checkAuth.ok) {
                Logger.error('Sessione non valida, reindirizzamento al login...');
                window.location.href = 'login.aspx';
                return;
            }

            Logger.log('Inizio sincronizzazione coda:', coda);
            for (const azione of coda) {
                try {
                    Logger.log('Invio azione al server:', azione);
                    const response = await fetch('benefici.aspx/IncrementaContatore', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ 
                            modalitaFumato: azione.modalitaFumato 
                        }),
                        credentials: 'include'
                    });

                    const responseText = await response.text();
                    Logger.log('Risposta server:', responseText);

                    if (!response.ok) {
                        throw new Error(`Server error: ${responseText}`);
                    }

                    try {
                        const data = JSON.parse(responseText);
                        if (data && data.d) {
                            Logger.log('Azione sincronizzata con successo:', data.d);
                            salvaDatiLocali(data.d);
                            aggiornaDati(data.d);
                        } else {
                            throw new Error('Formato risposta non valido');
                        }
                    } catch (jsonError) {
                        throw new Error(`Errore parsing JSON: ${jsonError.message}`);
                    }
                } catch (actionError) {
                    Logger.error('Errore durante la sincronizzazione azione:', actionError);
                    // Non rimuoviamo l'azione dalla coda se c'è un errore
                    return;
                }
            }

            // Solo se tutte le azioni sono state sincronizzate con successo
            localStorage.removeItem(SYNC_QUEUE_KEY);
            Logger.log('Sincronizzazione completata con successo');

        } catch (error) {
            Logger.error('Errore generale nella sincronizzazione:', error);
            // Mantieni la coda in caso di errore
        }
    }

    // Aggiungi questa funzione per verificare lo stato della sessione
    async function verificaSessione() {
        try {
            const response = await fetch('benefici.aspx/GetDatiIniziali', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ modalitaFumato: false }),
                credentials: 'include'
            });

            if (!response.ok) {
                Logger.error('Sessione non valida');
                return false;
            }

            const data = await response.json();
            return data && data.d;
        } catch (error) {
            Logger.error('Errore verifica sessione:', error);
            return false;
        }
    }
}); 