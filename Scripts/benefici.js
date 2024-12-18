document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inizializzazione applicazione...');
    
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data || !data.d) {
                throw new Error('Dati non validi dal server');
            }

            return data.d;
        } catch (error) {
            console.error('Errore nella chiamata al server:', error);
            throw error;
        }
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

    if (!verificaElementi()) {
        console.error('Impossibile inizializzare: elementi HTML mancanti');
        return;
    }
    caricaDatiIniziali();

    function aggiornaDati(data) {
        document.getElementById('sigaretteLabel').textContent = data.sigarette;
        document.getElementById('sigaretteButtonLabel').textContent = data.sigarette;
        document.getElementById('risparmioValue').textContent = data.risparmio.toFixed(2);
        document.getElementById('catrameLabel').textContent = data.catrame;
        document.getElementById('tempoLabel').textContent = data.tempo;
    }

    const COSTO_SIGARETTA = 0.30; // € per sigaretta
    const CATRAME_SIGARETTA = 10; // mg per sigaretta
    const TEMPO_SIGARETTA = 5; // minuti per sigaretta

    document.getElementById('clickButton').addEventListener('click', 
        debounce(async function(e) {
            e.preventDefault();
            console.log('Click registrato');
            
            document.getElementById('nonFumareBtn').classList.add('clicked');
            setTimeout(() => document.getElementById('nonFumareBtn').classList.remove('clicked'), 200);

            try {
                if (navigator.onLine) {
                    const data = await chiamataServer('benefici.aspx/IncrementaContatore');
                    salvaDatiLocali(data);
                    aggiornaDati(data);
                } else {
                    incrementaLocale();
                }
            } catch (error) {
                console.error('Errore durante l\'elaborazione del click:', error);
                incrementaLocale();
            }
        }, 500)
    );

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

    resetButton.addEventListener('click', () => {
        applyColors(defaultColors);
        primaryColorPicker.value = defaultColors.primary;
        bgColorPicker.value = defaultColors.background;
        textColorPicker.value = defaultColors.text;
    });

    loadSavedColors();

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

    function caricaDatiIniziali() {
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
        })
        .catch(error => {
            console.log('Errore nel caricamento dati, uso dati locali');
            const datiLocali = recuperaDatiLocali();
            if (datiLocali) {
                aggiornaDati(datiLocali);
            }
        });
    }

    function incrementaLocale() {
        const datiAttuali = recuperaDatiLocali();
        
        datiAttuali.sigarette++;
        datiAttuali.risparmio += 0.30;
        datiAttuali.catrame += 10;
        datiAttuali.tempo += 5;
        
        salvaDatiLocali(datiAttuali);
        
        salvaAzioneOffline('incremento');
        
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

    window.addEventListener('online', function() {
        console.log('Tornato online - Avvio sincronizzazione');
        sincronizzaDati();
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
}); 