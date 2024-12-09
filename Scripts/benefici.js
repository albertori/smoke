document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inizializzazione applicazione...');
    
    if (!verificaElementi()) {
        console.error('Impossibile inizializzare: elementi HTML mancanti');
        return;
    }
    // Carica i dati iniziali
    fetch('benefici.aspx/GetDatiIniziali', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({}),
        credentials: 'include'
    })
    .then(response => response.text())
    .then(rawData => {
        try {
            const data = JSON.parse(rawData);
            if (data && data.d) {
                aggiornaDati(data.d);
            }
        } catch (e) {
            console.error('Errore nel parsing JSON:', e);
        }
    })
    .catch(error => {
        console.error('Errore nel caricamento dati iniziali:', error);
    });

    // Funzione per aggiornare i dati nell'UI
    function aggiornaDati(data) {
        document.getElementById('sigaretteLabel').textContent = data.sigarette;
        document.getElementById('sigaretteButtonLabel').textContent = data.sigarette;
        document.getElementById('risparmioLabel').textContent = data.risparmio.toFixed(2);
        document.getElementById('catrameLabel').textContent = data.catrame;
        document.getElementById('tempoLabel').textContent = data.tempo;
    }

    // Costanti per i calcoli
    const COSTO_SIGARETTA = 0.30; // € per sigaretta
    const CATRAME_SIGARETTA = 10; // mg per sigaretta
    const TEMPO_SIGARETTA = 5; // minuti per sigaretta

    // Gestione click bottone
    document.getElementById('clickButton').addEventListener('click', function(e) {
        e.preventDefault(); // Previene il postback
        console.log('Click registrato'); // Debug
        
        // Effetto click visuale
        document.getElementById('nonFumareBtn').classList.add('clicked');
        setTimeout(() => document.getElementById('nonFumareBtn').classList.remove('clicked'), 200);

        // Chiamata AJAX
        fetch('benefici.aspx/IncrementaContatore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({}),
            credentials: 'include'
        })
        .then(response => {
            console.log('Risposta ricevuta:', response); // Debug
            return response.text();
        })
        .then(rawData => {
            console.log('Raw data:', rawData); // Vediamo i dati grezzi
            try {
                const data = JSON.parse(rawData);
                console.log('Parsed data:', data);
                
                if (data && data.d) {
                    document.getElementById('sigaretteLabel').textContent = data.d.sigarette;
                    document.getElementById('sigaretteButtonLabel').textContent = data.d.sigarette;
                    document.getElementById('risparmioLabel').textContent = data.d.risparmio.toFixed(2);
                    document.getElementById('catrameLabel').textContent = data.d.catrame;
                    document.getElementById('tempoLabel').textContent = data.d.tempo;
                } else {
                    console.error('Formato dati non valido:', data);
                }
            } catch (e) {
                console.error('Errore nel parsing JSON:', e);
                console.error('Raw data ricevuti:', rawData);
            }
        })
        .catch(error => {
            console.error('Errore nella chiamata:', error);
        });
    });

    function updateDailyProgress() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Calcola la percentuale del giorno trascorsa
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const percentageOfDay = (totalSeconds / (24 * 3600)) * 100;
        
        // Aggiorna la larghezza della barra
        const progressBar = document.getElementById('dailyProgressBar');
        progressBar.style.width = percentageOfDay + '%';
    }

    // Aggiorna ogni secondo
    setInterval(updateDailyProgress, 1000);
    // Esegui subito la prima volta
    updateDailyProgress();

    // Gestione pannello impostazioni
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsToggle = document.getElementById('settingsToggle');
    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const textColorPicker = document.getElementById('textColorPicker');
    const resetButton = document.getElementById('resetColors');

    // Colori default
    const defaultColors = {
        primary: '#4A90E2',
        background: '#D1E3F9',
        text: '#2C3E50'
    };

    // Toggle pannello
    settingsToggle.addEventListener('click', (e) => {
        e.preventDefault();
        settingsPanel.classList.toggle('open');
    });

    // Carica colori salvati
    function loadSavedColors() {
        const savedColors = JSON.parse(localStorage.getItem('themeColors')) || defaultColors;
        primaryColorPicker.value = savedColors.primary;
        bgColorPicker.value = savedColors.background;
        textColorPicker.value = savedColors.text;
        applyColors(savedColors);
    }

    // Applica colori
    function applyColors(colors) {
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--background-gradient-1', colors.background);
        document.documentElement.style.setProperty('--background-gradient-2', adjustColor(colors.background, -20));
        document.documentElement.style.setProperty('--text-color', colors.text);
        
        // Salva i colori
        localStorage.setItem('themeColors', JSON.stringify(colors));
    }

    // Funzione per schiarire/scurire un colore
    function adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => 
            ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

    // Event listeners per i color picker
    primaryColorPicker.addEventListener('change', () => {
        const colors = {
            primary: primaryColorPicker.value,
            background: bgColorPicker.value,
            text: textColorPicker.value
        };
        applyColors(colors);
    });

    bgColorPicker.addEventListener('change', () => {
        const colors = {
            primary: primaryColorPicker.value,
            background: bgColorPicker.value,
            text: textColorPicker.value
        };
        applyColors(colors);
    });

    textColorPicker.addEventListener('change', () => {
        const colors = {
            primary: primaryColorPicker.value,
            background: bgColorPicker.value,
            text: textColorPicker.value
        };
        applyColors(colors);
    });

    // Reset colori
    resetButton.addEventListener('click', () => {
        applyColors(defaultColors);
        primaryColorPicker.value = defaultColors.primary;
        bgColorPicker.value = defaultColors.background;
        textColorPicker.value = defaultColors.text;
    });

    // Carica i colori salvati all'avvio
    loadSavedColors();

    // SOSTITUISCI la sezione dello switch con questa versione corretta
    const smokeSwitch = document.getElementById('smokeSwitch');
    const textPath = document.querySelector('textPath');
    const nonFumareBtn = document.getElementById('nonFumareBtn');

    if (smokeSwitch && textPath && nonFumareBtn) {
        smokeSwitch.addEventListener('change', function() {
            console.log('Cambio modalità:', this.checked);
            if (this.checked) {
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
        });

        // Carica la modalità salvata
        const savedMode = localStorage.getItem('mode');
        console.log('Modalità salvata:', savedMode);
        if (savedMode === 'smoked') {
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
    }

    function incrementaContatore() {
        fetch('benefici.aspx/IncrementaContatore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            console.log('Raw data ricevuti:', JSON.stringify(data));
            
            if (data.d.success === false) {
                console.log('Operazione offline:', data.d.error);
                // Usa i dati di fallback
                updateUI(data.d.data);
                return;
            }

            // Aggiorna l'interfaccia con i dati ricevuti
            updateUI(data.d);
        })
        .catch(error => {
            console.log('Errore nella chiamata:', error);
        });
    }

    function updateUI(data) {
        // Verifica che data contenga tutti i campi necessari
        const defaultData = {
            giorni: 0,
            ore: 0,
            minuti: 0,
            sigarette: 0,
            soldi: 0
        };

        // Unisci i dati ricevuti con i valori di default
        const safeData = { ...defaultData, ...data };

        document.getElementById('giorni').textContent = safeData.giorni.toFixed(0);
        document.getElementById('ore').textContent = safeData.ore.toFixed(0);
        document.getElementById('minuti').textContent = safeData.minuti.toFixed(0);
        document.getElementById('sigarette').textContent = safeData.sigarette.toFixed(0);
        document.getElementById('soldi').textContent = safeData.soldi.toFixed(2);
    }

    // Funzione per verificare gli elementi necessari
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
}); 