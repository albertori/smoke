document.addEventListener('DOMContentLoaded', function() {
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

    // Gestione lingua
    const languageSelect = document.getElementById('languageSelect');
    
    // Carica lingua salvata o usa italiano come default
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'it';
    languageSelect.value = savedLanguage;
    
    // Applica traduzioni al caricamento
    applyTranslations(savedLanguage);
    
    // Gestione cambio lingua
    languageSelect.addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        localStorage.setItem('selectedLanguage', selectedLang);
        applyTranslations(selectedLang);
    });
    
    // Funzione per applicare le traduzioni
    function applyTranslations(lang) {
        // Aggiorna il titolo della pagina
        document.title = translations[lang].title;
        
        // Aggiorna i testi nell'interfaccia
        const elements = {
            'sigaretteTitle': translations[lang].sigaretteNonFumate,
            'sigaretteLabel': translations[lang].totale,
            'risparmioTitle': translations[lang].risparmio,
            'risparmioLabel': translations[lang].euroRisparmiati,
            'catrameTitle': translations[lang].catrameEvitato,
            'catrameLabel': translations[lang].mgNonInalati,
            'tempoTitle': translations[lang].tempoRecuperato,
            'tempoLabel': translations[lang].minutiGuadagnati,
            'nonHoFumato': translations[lang].nonHoFumato,
            'settingsTitle': translations[lang].personalizza,
            'primaryColorLabel': translations[lang].colorePrincipale,
            'bgColorLabel': translations[lang].coloreSfondo,
            'textColorLabel': translations[lang].coloreTesto,
            'resetButton': translations[lang].ripristinaColori,
            'languageLabel': translations[lang].lingua
        };

        // Aggiorna tutti i testi
        for (const [id, text] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        }

        // Aggiorna il testo del bottone circolare
        const textPath = document.querySelector('textPath');
        if (textPath) {
            textPath.textContent = translations[lang].nonHoFumato;
        }
    }

    const smokeSwitch = document.getElementById('smokeSwitch');
    const buttonLabel = document.getElementById('buttonLabel');
    const buttonContainer = document.getElementById('buttonContainer');
    
    // Log per debugging
    console.log('Elementi trovati:', {
        smokeSwitch: !!smokeSwitch,
        buttonLabel: !!buttonLabel,
        buttonContainer: !!buttonContainer
    });

    if (!smokeSwitch || !buttonLabel || !buttonContainer) {
        console.error('Elementi mancanti:', {
            smokeSwitch: !smokeSwitch,
            buttonLabel: !buttonLabel,
            buttonContainer: !buttonContainer
        });
        return;
    }

    console.log('Smoke switch trovato:', smokeSwitch);

    smokeSwitch.addEventListener('change', function() {
        console.log('Cambio modalità:', this.checked);
        if (this.checked) {
            buttonLabel.textContent = 'Ho Fumato';
            buttonContainer.classList.remove('green');
            buttonContainer.classList.add('red');
            localStorage.setItem('mode', 'smoked');
        } else {
            buttonLabel.textContent = 'Non Ho Fumato';
            buttonContainer.classList.remove('red');
            buttonContainer.classList.add('green');
            localStorage.setItem('mode', 'notSmoked');
        }
    });

    // Carica la modalità salvata
    const savedMode = localStorage.getItem('mode');
    console.log('Modalità salvata:', savedMode);
    if (savedMode === 'smoked') {
        smokeSwitch.checked = true;
        buttonLabel.textContent = 'Ho Fumato';
        buttonContainer.classList.remove('green');
        buttonContainer.classList.add('red');
    } else {
        smokeSwitch.checked = false;
        buttonLabel.textContent = 'Non Ho Fumato';
        buttonContainer.classList.remove('red');
        buttonContainer.classList.add('green');
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
}); 