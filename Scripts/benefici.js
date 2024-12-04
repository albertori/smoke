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
}); 